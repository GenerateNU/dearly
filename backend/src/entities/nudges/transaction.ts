import { PostgresJsDatabase } from "drizzle-orm/postgres-js";
import {
  devicesTable,
  groupsTable,
  membersTable,
  scheduledNudgesTable,
  usersTable,
} from "../schema";
import { eq, inArray, and, isNotNull, gt, not, sql } from "drizzle-orm";
import {
  ForbiddenError,
  NotFoundError,
  TooManyRequestsError,
} from "../../utilities/errors/app-error";
import { ONE_DAY_COOLDOWN_SEC } from "../../constants/nudge";
import { Transaction } from "../../types/api/internal/transaction";
import {
  NotificationMetadata,
  NudgeSchedule,
  NudgeSchedulePayload,
  NudgeTarget,
} from "../../types/api/internal/nudges";

export interface NudgeTransaction {
  getManualNudgeNotificationMetadata(
    userIds: string[],
    groupId: string,
    managerId: string,
  ): Promise<NotificationMetadata>;

  getAutoNudgeNotificationMetadata(
    groupId: string,
    managerId: string,
  ): Promise<NotificationMetadata>;

  upsertSchedule(managerId: string, payload: NudgeSchedulePayload): Promise<NudgeSchedule | null>;

  getNudgeSchedule(groupId: string, managerId: string): Promise<NudgeSchedulePayload | null>;

  deactivateNudge(groupId: string, managerId: string): Promise<NudgeSchedulePayload | null>;
}

export class NudgeTransactionImpl implements NudgeTransaction {
  private db: PostgresJsDatabase;

  constructor(db: PostgresJsDatabase) {
    this.db = db;
  }

  async upsertSchedule(
    managerId: string,
    payload: NudgeSchedulePayload,
  ): Promise<NudgeSchedule | null> {
    return await this.db.transaction(async (tx) => {
      // validate group existence and manager permissions
      await this.validateGroup(tx, payload.groupId, managerId);
      // insert the value into the database
      const [nudgeSchedule] = await tx
        .insert(scheduledNudgesTable)
        .values(payload)
        .onConflictDoUpdate({
          target: scheduledNudgesTable.groupId,
          set: { ...payload, updatedAt: new Date() },
        })
        .returning();

      return nudgeSchedule ?? null;
    });
  }

  async getNudgeSchedule(groupId: string, managerId: string): Promise<NudgeSchedulePayload | null> {
    const transactionPromise = await this.db.transaction(async (tx) => {
      // validate group existence and manager permissions
      await this.validateGroup(tx, groupId, managerId);

      const [nudgeSchedule] = await this.db
        .select()
        .from(scheduledNudgesTable)
        .where(eq(scheduledNudgesTable.groupId, groupId));

      return nudgeSchedule ?? null;
    });

    return transactionPromise;
  }

  async deactivateNudge(groupId: string, managerId: string): Promise<NudgeSchedulePayload | null> {
    return await this.db.transaction(async (tx) => {
      // validate group existence and manager permissions
      await this.validateGroup(tx, groupId, managerId);

      const [nudgeSchedule] = await this.db
        .update(scheduledNudgesTable)
        .set({ isActive: false, updatedAt: new Date() })
        .where(eq(scheduledNudgesTable.groupId, groupId))
        .returning();

      return nudgeSchedule ?? null;
    });
  }

  async getManualNudgeNotificationMetadata(
    userIds: string[],
    groupId: string,
    managerId: string,
  ): Promise<NotificationMetadata> {
    return await this.db.transaction(async (tx) => {
      // validate group existence
      const group = await this.validateGroup(tx, groupId, managerId);
      // validate selected users' existence and their group membership
      const validUserIds = await this.validateUsers(tx, userIds, groupId);
      // get nudge targets (those have device tokens and notification enabled)
      const validNudgeTargets = await this.findValidNudgeTargets(
        tx,
        validUserIds,
        groupId,
        managerId,
      );

      await this.checkAndUpdateNudgeCooldown(tx, validNudgeTargets, groupId);

      return {
        deviceTokens: validNudgeTargets.map((target) => target.deviceToken),
        groupId,
        groupName: group.name,
      };
    });
  }

  async getAutoNudgeNotificationMetadata(
    groupId: string,
    managerId: string,
  ): Promise<NotificationMetadata> {
    return await this.db.transaction(async (tx) => {
      // validate group existence and check manager's permission
      await this.validateGroup(tx, groupId, managerId);

      // retrieve members' device tokens if they have notification enabled
      const [deviceTokens] = await tx
        .select({
          groupId: groupsTable.id,
          groupName: groupsTable.name,
          deviceTokens: sql`ARRAY_AGG(${devicesTable.token})`,
        })
        .from(membersTable)
        .innerJoin(groupsTable, eq(membersTable.groupId, groupsTable.id))
        .innerJoin(devicesTable, eq(membersTable.userId, devicesTable.userId))
        .where(and(eq(membersTable.nudgeNotificationEnabled, true), eq(groupsTable.id, groupId)))
        .groupBy(groupsTable.id, groupsTable.name);

      return deviceTokens as NotificationMetadata;
    });
  }

  private async validateGroup(tx: Transaction, groupId: string, managerId: string) {
    const [group] = await tx
      .select({ managerId: groupsTable.managerId, name: groupsTable.name })
      .from(groupsTable)
      .where(eq(groupsTable.id, groupId));

    if (!group) {
      throw new NotFoundError("Group");
    }

    if (group.managerId !== managerId) {
      throw new ForbiddenError();
    }

    return group;
  }

  private async validateUsers(tx: Transaction, userIds: string[], groupId: string) {
    // validate user existence
    const existingUsers = await tx
      .select({ userId: usersTable.id })
      .from(usersTable)
      .where(inArray(usersTable.id, userIds));

    const existingUserIds = new Set(existingUsers.map((user) => user.userId));
    const invalidUserIds = userIds.filter((id) => !existingUserIds.has(id));

    if (invalidUserIds.length > 0) {
      throw new NotFoundError("", `Users not found: ${invalidUserIds.join(", ")}`);
    }

    // validate group membership
    const groupMembers = await tx
      .select({ userId: membersTable.userId })
      .from(membersTable)
      .where(and(inArray(membersTable.userId, userIds), eq(membersTable.groupId, groupId)));

    const groupMemberIds = new Set(groupMembers.map((member) => member.userId));
    const nonMemberUsers = userIds.filter((userId) => !groupMemberIds.has(userId));

    if (nonMemberUsers.length > 0) {
      throw new ForbiddenError(`Users not in group: ${nonMemberUsers.join(", ")}`);
    }

    return userIds;
  }

  private async findValidNudgeTargets(
    tx: Transaction,
    userIds: string[],
    groupId: string,
    managerId: string,
  ) {
    return await tx
      .select({
        userId: membersTable.userId,
        deviceToken: devicesTable.token,
      })
      .from(membersTable)
      .innerJoin(devicesTable, eq(membersTable.userId, devicesTable.userId))
      .where(
        and(
          not(eq(membersTable.userId, managerId)),
          inArray(membersTable.userId, userIds),
          eq(membersTable.groupId, groupId),
          eq(membersTable.nudgeNotificationEnabled, true),
        ),
      );
  }

  private async checkAndUpdateNudgeCooldown(
    tx: Transaction,
    validNudgeTargets: NudgeTarget[],
    groupId: string,
  ) {
    const validUserIds = validNudgeTargets.map((target) => target.userId);
    const now = new Date();

    // check cooldown
    const cooldownUsers = await tx
      .select({ userId: membersTable.userId })
      .from(membersTable)
      .where(
        and(
          inArray(membersTable.userId, validUserIds),
          eq(membersTable.groupId, groupId),
          isNotNull(membersTable.lastManualNudge),
          gt(membersTable.lastManualNudge, new Date(now.getTime() - ONE_DAY_COOLDOWN_SEC)),
        ),
      );

    if (cooldownUsers.length > 0) {
      throw new TooManyRequestsError(
        `Too many nudges send to users ${cooldownUsers.map((u) => u.userId).join(", ")}`,
      );
    }

    // update last manual nudge time
    await tx
      .update(membersTable)
      .set({ lastManualNudge: new Date() })
      .where(and(inArray(membersTable.userId, validUserIds), eq(membersTable.groupId, groupId)));
  }
}
