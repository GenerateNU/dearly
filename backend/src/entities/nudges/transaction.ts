import { PostgresJsDatabase } from "drizzle-orm/postgres-js";
import { NotificationMetadata } from "./validator";
import { devicesTable, groupsTable, membersTable, usersTable } from "../schema";
import { eq, inArray, and, isNotNull, gt, not } from "drizzle-orm";
import {
  ForbiddenError,
  NotFoundError,
  TooManyRequestsError,
} from "../../utilities/errors/app-error";
import { COOLDOWN_PERIOD } from "../../constants/nudge";

export interface NudgeTransaction {
  getNotificationMetadata(
    userIds: string[],
    groupId: string,
    managerId: string,
  ): Promise<NotificationMetadata>;
}

export class NudgeTransactionImpl implements NudgeTransaction {
  private db: PostgresJsDatabase;

  constructor(db: PostgresJsDatabase) {
    this.db = db;
  }

  async getNotificationMetadata(
    userIds: string[],
    groupId: string,
    managerId: string,
  ): Promise<NotificationMetadata> {
    return await this.db.transaction(async (tx) => {
      // check if group exists
      const [group] = await tx
        .select({ managerId: groupsTable.managerId, name: groupsTable.name })
        .from(groupsTable)
        .where(eq(groupsTable.id, groupId));

      if (!group) {
        throw new NotFoundError("Group");
      }

      // check if user is manager
      if (group.managerId !== managerId) {
        throw new ForbiddenError();
      }

      // check if user IDs exist
      const existingUsers = await tx
        .select({ userId: usersTable.id })
        .from(usersTable)
        .where(inArray(usersTable.id, userIds));

      const existingUserIds = new Set(existingUsers.map((user) => user.userId));
      const invalidUserIds = userIds.filter((id) => !existingUserIds.has(id));

      if (invalidUserIds.length > 0) {
        throw new NotFoundError("", `Users not found: ${invalidUserIds.join(", ")}`);
      }

      // find users with valid tokens and notifications enabled
      const validNudgeTargets = await tx
        .select({
          userId: membersTable.userId,
          deviceToken: devicesTable.token,
        })
        .from(membersTable)
        .innerJoin(devicesTable, eq(membersTable.userId, devicesTable.userId))
        .where(
          and(
            inArray(membersTable.userId, userIds),
            eq(membersTable.groupId, groupId),
            eq(membersTable.notificationsEnabled, true),
            isNotNull(devicesTable.token),
            not(eq(membersTable.userId, managerId)),
          ),
        );

      const validUserIds = validNudgeTargets.map((target) => target.userId);

      // check cooldown for valid nudge targets
      const now = new Date();
      const cooldownUsers = await tx
        .select({ userId: membersTable.userId })
        .from(membersTable)
        .where(
          and(
            inArray(membersTable.userId, validUserIds),
            eq(membersTable.groupId, groupId),
            isNotNull(membersTable.lastManualNudge),
            gt(membersTable.lastManualNudge, new Date(now.getTime() - COOLDOWN_PERIOD)),
          ),
        );

      if (cooldownUsers.length > 0) {
        throw new TooManyRequestsError(
          `Too many nudges send to users ${cooldownUsers.map((u) => u.userId).join(", ")}`,
        );
      }

      // update lastManualNudge for valid targets
      await tx
        .update(membersTable)
        .set({ lastManualNudge: new Date() })
        .where(and(inArray(membersTable.userId, validUserIds), eq(membersTable.groupId, groupId)));

      return {
        deviceTokens: validNudgeTargets.map((target) => target.deviceToken),
        groupId,
        groupName: group.name,
      };
    });
  }
}
