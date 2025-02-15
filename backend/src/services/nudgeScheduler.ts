import {
  CreateScheduleCommandInput,
  SchedulerClient,
  ScheduleState,
} from "@aws-sdk/client-scheduler";
import {
  CreateScheduleCommand,
  DeleteScheduleCommand,
  UpdateScheduleCommand,
} from "@aws-sdk/client-scheduler";
import { handleAWSServiceError } from "../utilities/errors/aws-error";
import { NUDGE_LAMBDA_ARN, NUDGE_LAMBDA_ROLE_ARN } from "../constants/nudge";
import {
  NudgeSchedulePayload,
  SchedulePayload,
  CronHourType,
  CronMinType,
} from "../types/api/internal/nudges";

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
  async addSchedule(name: string, payload: SchedulePayload): Promise<unknown> {
    const addScheduleImpl = async () => {
      const input = await this.scheduleCommandInput(name, "", payload);
      const command = new CreateScheduleCommand(input);
      const response = await this.scheduler.send(command);
      return response;
    };
    return await handleAWSServiceError(addScheduleImpl, "Failed to add recurring schedule.")();
  }

  async updateSchedule(id: string, payload: SchedulePayload): Promise<unknown> {
    const updateScheduleImpl = async () => {
      const input = await this.scheduleCommandInput(id, "", payload);

      const command = new UpdateScheduleCommand(input);
      const response = await this.scheduler.send(command);
      return response.$metadata.httpStatusCode ?? undefined;
    };
    return await handleAWSServiceError(updateScheduleImpl, "Failed to update recurring schedule")();
  }

  // TODO: don't think this is correct though
  async disableSchedule(id: string): Promise<unknown> {
    const disableScheduleImpl = async () => {
      const input = await this.scheduleCommandInput(id, "", ScheduleState.DISABLED); // TODO: unneeded params time and timezone
      const command = new UpdateScheduleCommand(input);
      const response = await this.scheduler.send(command);

      return response;
    };
    return await handleAWSServiceError(
      disableScheduleImpl,
      "Failed to disable recurring schedule",
    )();
  }

  async removeSchedule(id: string): Promise<unknown> {
    const removeScheduleImpl = async () => {
      const input = {
        Name: id,
      };
      const command = new DeleteScheduleCommand(input);
      const response = await this.scheduler.send(command);
      return response;
    };
    return await handleAWSServiceError(removeScheduleImpl, "Failed to remove recurring schedule")();
  }

  private getCronExpression(payload: NudgeSchedulePayload): string {
    const hour = [payload.nudgeAt.getHours() as CronHourType];
    const min = [payload.nudgeAt.getMinutes() as CronMinType];
    const dayOfMonth = payload.day ?? "*";
    const month = payload.month ?? "*";
    const dayOfWeek = payload.daysOfWeek?.join() ?? "*";

    const cronExpression = `0 ${min} ${hour} ${dayOfMonth} ${month} ${dayOfWeek} *`;

    return cronExpression;
  }

  private async scheduleCommandInput(
    id: string,
    timezone: string,
    payload: SchedulePayload,
    disabled = ScheduleState.ENABLED,
  ): Promise<CreateScheduleCommandInput> {
    const schedule = this.getCronExpression(payload.schedule);

    const input = {
      Name: id,
      ScheduleExpression: schedule,
      ScheduleExpressionTimezone: payload.schedule,
      State: disabled,
      Target: {
        Arn: NUDGE_LAMBDA_ARN, // fetch arn with Lambda SDK
        RoleArn: NUDGE_LAMBDA_ROLE_ARN,
        Input: JSON.stringify(payload.expo),
      },
      FlexibleTimeWindow: undefined,
    };

    return input;
  }
}
