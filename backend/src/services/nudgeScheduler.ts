import {
  FlexibleTimeWindow,
  CreateScheduleCommandInput,
  CreateScheduleCommand,
  DeleteScheduleCommand,
  UpdateScheduleCommand,
  SchedulerClient,
  ScheduleState,
  GetScheduleCommand,
} from "@aws-sdk/client-scheduler";
import { handleAWSServiceError } from "../utilities/errors/aws-error";
import { NudgeSchedulePayload, SchedulePayload } from "../types/api/internal/nudges";
import { getConfigurations } from "../config/init";

export interface NudgeSchedulerService {
  /**
   * Adds a new schedule to the AWS EventBridge Scheduler with the provided payload.
   * @param id - The identifier for the schedule.
   * @param payload - The payload containing the schedule information.
   * @returns The HTTP status code returned by AWS, or null if the request fails.
   */
  addSchedule(id: string, payload: SchedulePayload): Promise<number | null>;

  /**
   * Updates an existing schedule with the given ID and payload.
   * @param id - The identifier for the schedule to update.
   * @param payload - The new schedule data to update.
   * @returns The HTTP status code returned by AWS, or null if the request fails.
   */
  updateSchedule(id: string, payload: SchedulePayload): Promise<number | null>;

  /**
   * Disables the schedule with the given ID, preventing further executions.
   * @param id - The identifier of the schedule to disable.
   * @returns The HTTP status code returned by AWS, or null if the request fails.
   */
  disableSchedule(id: string): Promise<number | null>;

  /**
   * Removes the schedule with the given ID from the AWS EventBridge Scheduler.
   * @param id - The identifier of the schedule to remove.
   * @returns The HTTP status code returned by AWS, or null if the request fails.
   */
  removeSchedule(id: string): Promise<number | null>;
}

export class AWSEventBridgeScheduler implements NudgeSchedulerService {
  private scheduler: SchedulerClient;

  constructor(scheduler: SchedulerClient) {
    this.scheduler = scheduler;
  }

  // Add a new schedule
  async addSchedule(name: string, payload: SchedulePayload): Promise<number | null> {
    const addScheduleImpl = async () => {
      const input = await this.scheduleCommandInput(name, payload);
      const command = new CreateScheduleCommand(input);
      const response = await this.scheduler.send(command);
      return response.$metadata.httpStatusCode ?? null;
    };
    return await handleAWSServiceError(addScheduleImpl, "Failed to add recurring schedule.")();
  }

  async updateSchedule(id: string, payload: SchedulePayload): Promise<number | null> {
    const updateScheduleImpl = async () => {
      const input = await this.scheduleCommandInput(id, payload);

      const command = new UpdateScheduleCommand(input);
      const response = await this.scheduler.send(command);
      return response.$metadata.httpStatusCode ?? null;
    };
    return await handleAWSServiceError(updateScheduleImpl, "Failed to update recurring schedule")();
  }

  async disableSchedule(id: string): Promise<number | null> {
    const disableScheduleImpl = async () => {
      const input = await this.scheduleCommandInput(id, null, ScheduleState.DISABLED);
      const command = new UpdateScheduleCommand(input);
      const response = await this.scheduler.send(command);

      return response.$metadata.httpStatusCode ?? null;
    };
    return await handleAWSServiceError(
      disableScheduleImpl,
      "Failed to disable recurring schedule",
    )();
  }

  async removeSchedule(id: string): Promise<number | null> {
    const removeScheduleImpl = async () => {
      const input = {
        Name: id,
      };
      const command = new DeleteScheduleCommand(input);
      const response = await this.scheduler.send(command);
      return response.$metadata.httpStatusCode ?? null;
    };
    return await handleAWSServiceError(removeScheduleImpl, "Failed to remove recurring schedule")();
  }

  private getCronExpression(payload: NudgeSchedulePayload): string {
    const hour = payload.nudgeAt.getHours();
    const min = payload.nudgeAt.getMinutes();
    const dayOfMonth = payload.day ?? "?";
    const month = payload.month ?? "*";
    const dayOfWeek = payload.daysOfWeek?.join() ?? (payload.frequency == "MONTHLY" ? "?" : "*");

    const cronExpression = `cron(${min} ${hour} ${dayOfMonth} ${month} ${dayOfWeek})`;

    return cronExpression;
  }

  private async scheduleCommandInput(
    id: string,
    payload: SchedulePayload | null,
    disabled: ScheduleState = ScheduleState.ENABLED,
  ): Promise<CreateScheduleCommandInput> {
    let schedule;
    let lambdaInput;

    if (!payload) {
      const getInput = { Name: id };
      const getCommand = new GetScheduleCommand(getInput);
      const scheduleParams = await this.scheduler.send(getCommand);
      schedule = scheduleParams.ScheduleExpression;
      lambdaInput = scheduleParams.Target?.Input;
    } else {
      schedule = this.getCronExpression(payload.schedule);
      lambdaInput = JSON.stringify(payload.expo);
    }
    const lambda_config = getConfigurations().lambdaConfig;

    const FLEXIBLE_TIME_WINDOW: FlexibleTimeWindow = {
      Mode: "FLEXIBLE",
      MaximumWindowInMinutes: 5,
    };

    const input = {
      Name: id,
      ScheduleExpression: schedule,
      State: disabled,
      Target: {
        Arn: lambda_config.lambdaARN,
        RoleArn: lambda_config.lambdaRoleARN,
        Input: lambdaInput,
      },
      FlexibleTimeWindow: FLEXIBLE_TIME_WINDOW,
    };
    return input;
  }
}
