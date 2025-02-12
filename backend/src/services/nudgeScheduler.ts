import { SchedulerClient, ScheduleState } from "@aws-sdk/client-scheduler";
import {
  CreateScheduleCommand,
  DeleteScheduleCommand,
  UpdateScheduleCommand,
} from "@aws-sdk/client-scheduler";
import { InternalServerError } from "../utilities/errors/app-error";

export interface NudgeScheduler {
  // TODO: I/O type of this and implement these methods
  addSchedule(id: string, payload: unknown): Promise<unknown>;
  updateSchedule(id: string, payload: unknown): Promise<unknown>;
  removeSchedule(id: string): Promise<unknown>;
}

export class AWSEventBridgeScheduler implements NudgeScheduler {
  private scheduler: SchedulerClient;

  constructor(scheduler: SchedulerClient) {
    this.scheduler = scheduler;
  }

  async addSchedule(name: string, payload: unknown): Promise<unknown> {
    const input = {
      // CreateScheduleInput
      Name: name, // required
      ScheduleExpression: "STRING_VALUE", // required
      ScheduleExpressionTimezone: "STRING_VALUE",
      State: ScheduleState.ENABLED,
      Target: {
        // Target
        Arn: "arn:aws:lambda:us-east-2:194722434714:function:SendNudgeNotification", // TODO: move into global constant
        RoleArn: "arn:aws:iam::194722434714:role/service-role/SendNudgeNotification-role-kypdggif", // required
        Input: JSON.stringify(payload),
      },
      FlexibleTimeWindow: undefined,
    };

    try {
      const command = new CreateScheduleCommand(input);
      const response = await this.scheduler.send(command);
      return response.$metadata.httpStatusCode ?? undefined;
    } catch (err) {
      throw new InternalServerError(`Failed to update recurring schedule: ${err}`);
    }
  }

  async updateSchedule(id: string, payload: unknown): Promise<unknown> {
    throw new Error("Method not implemented");
  }

  async removeSchedule(id: string): Promise<unknown> {
    throw new Error("Method not implemented");
  }
}
