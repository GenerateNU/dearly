import { SchedulerClient, ScheduleState } from "@aws-sdk/client-scheduler";
import {
  CreateScheduleCommand,
  DeleteScheduleCommand,
  UpdateScheduleCommand,
} from "@aws-sdk/client-scheduler";
import { InternalServerError } from "../utilities/errors/app-error";

export interface NudgeScheduler {
  // TODO: think about I/O type of this & more debugging
  addSchedule(id: string, payload: unknown): Promise<unknown>;
  updateSchedule(id: string, payload: unknown, isActive: boolean): Promise<unknown>;
  disableSchedule(id: string): Promise<unknown>;
  removeSchedule(id: string): Promise<unknown>;
}

export class AWSEventBridgeScheduler implements NudgeScheduler {
  private scheduler: SchedulerClient;

  constructor(scheduler: SchedulerClient) {
    this.scheduler = scheduler;
  }

  // Add a new schedule
  async addSchedule(name: string, payload: unknown): Promise<unknown> {
    const input = {
      Name: name, // required
      ScheduleExpression: "STRING_VALUE", // required (you need to define schedule expression logic)
      ScheduleExpressionTimezone: "STRING_VALUE", // optional
      State: ScheduleState.ENABLED, // enable schedule by default
      Target: {
        Arn: "arn:aws:lambda:us-east-2:194722434714:function:SendNudgeNotification", // replace with your ARN
        RoleArn: "arn:aws:iam::194722434714:role/service-role/SendNudgeNotification-role-kypdggif", // replace with your Role ARN
        Input: JSON.stringify(payload), // Pass the payload as input to Lambda
      },
      FlexibleTimeWindow: undefined,
    };

    try {
      const command = new CreateScheduleCommand(input);
      const response = await this.scheduler.send(command);
      return response.$metadata.httpStatusCode ?? undefined;
    } catch (err) {
      throw new InternalServerError(`Failed to add recurring schedule: ${err}`);
    }
  }

  async updateSchedule(id: string, payload: unknown): Promise<unknown> {
    const input = {
      Name: id,
      ScheduleExpression: "STRING_VALUE",
      ScheduleExpressionTimezone: "STRING_VALUE",
      State: ScheduleState.ENABLED,
      Target: {
        Arn: "arn:aws:lambda:us-east-2:194722434714:function:SendNudgeNotification",
        RoleArn: "arn:aws:iam::194722434714:role/service-role/SendNudgeNotification-role-kypdggif",
        Input: JSON.stringify(payload),
      },
      FlexibleTimeWindow: undefined,
    };

    try {
      const command = new UpdateScheduleCommand(input);
      const response = await this.scheduler.send(command);
      return response.$metadata.httpStatusCode ?? undefined;
    } catch (err) {
      throw new InternalServerError(`Failed to update recurring schedule: ${err}`);
    }
  }

  // TODO: don't think this is correct though
  async disableSchedule(id: string): Promise<unknown> {
    const input = {
      Name: id,
      ScheduleExpression: "STRING_VALUE",
      ScheduleExpressionTimezone: "STRING_VALUE",
      State: ScheduleState.DISABLED,
      Target: {
        Arn: "arn:aws:lambda:us-east-2:194722434714:function:SendNudgeNotification",
        RoleArn: "arn:aws:iam::194722434714:role/service-role/SendNudgeNotification-role-kypdggif",
      },
      FlexibleTimeWindow: undefined,
    };

    try {
      const command = new UpdateScheduleCommand(input);
      const response = await this.scheduler.send(command);
      return response.$metadata.httpStatusCode ?? undefined;
    } catch (err) {
      throw new InternalServerError(`Failed to disable recurring schedule: ${err}`);
    }
  }

  async removeSchedule(id: string): Promise<unknown> {
    const input = {
      Name: id,
    };

    try {
      const command = new DeleteScheduleCommand(input);
      const response = await this.scheduler.send(command);
      return response.$metadata.httpStatusCode ?? undefined;
    } catch (err) {
      throw new InternalServerError(`Failed to delete recurring schedule: ${err}`);
    }
  }
}
