import { CreateScheduleCommandInput, SchedulerClient, ScheduleState } from "@aws-sdk/client-scheduler";
import {
  CreateScheduleCommand,
  DeleteScheduleCommand,
  UpdateScheduleCommand,
} from "@aws-sdk/client-scheduler";
import { LambdaClient, GetFunctionCommand } from "aws-lambda";
import { InternalServerError } from "../utilities/errors/app-error";
import { NudgeLambda } from "./lambda";


export interface NudgeScheduler {
  // TODO: think about I/O type of this & more debugging
  addSchedule(id: string, payload: unknown): Promise<unknown>;
  updateSchedule(id: string, payload: unknown, isActive: boolean): Promise<unknown>;
  disableSchedule(id: string): Promise<unknown>;
  removeSchedule(id: string): Promise<unknown>;
}

export class AWSEventBridgeScheduler implements NudgeScheduler {
  private scheduler: SchedulerClient;
  private lambda: NudgeLambda;

  constructor(scheduler: SchedulerClient, lambda: NudgeLambda) {
    this.scheduler = scheduler;
    this.lambda = lambda

  }

  // Add a new schedule
  async addSchedule(name: string, payload: unknown): Promise<unknown> {
    const input = await this.scheduleCommandInput(name, "", "", payload);

    try {
      const command = new CreateScheduleCommand(input);
      const response = await this.scheduler.send(command);
      return response.$metadata.httpStatusCode ?? undefined;
    } catch (err) {
      throw new InternalServerError(`Failed to add recurring schedule: ${err}`);
    }
  }

  async updateSchedule(id: string, payload: unknown): Promise<unknown> {
    const input = await this.scheduleCommandInput(id, "", "", payload)

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
    const input = await this.scheduleCommandInput(id, "", "", ScheduleState.DISABLED); // TODO: unneeded params time and timezone

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

  private async scheduleCommandInput(id: string, schedule: string, timezone: string, payload: unknown, disabled = ScheduleState.ENABLED): Promise<CreateScheduleCommandInput> {
    const input = {
      Name: id,
      ScheduleExpression: schedule,
      ScheduleExpressionTimezone: timezone,
      State: disabled,
      Target: {
        Arn: this.lambda.getLambdaArn(),
        RoleArn: this.lambda.getLambdaRoleArn(),
        Input: JSON.stringify(payload),
      },
      FlexibleTimeWindow: undefined,
    };

    return input
  }

  
}
