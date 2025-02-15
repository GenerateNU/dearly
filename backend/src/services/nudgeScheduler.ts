import { CreateScheduleCommandInput, SchedulerClient, ScheduleState } from "@aws-sdk/client-scheduler";
import {
  CreateScheduleCommand,
  DeleteScheduleCommand,
  UpdateScheduleCommand,
} from "@aws-sdk/client-scheduler";
import { handleAWSServiceError } from "../utilities/errors/aws-error";

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
    const addScheduleImpl= async () => {
      const input = await this.scheduleCommandInput(name, "", "", payload);
      const command = new CreateScheduleCommand(input);
      const response = await this.scheduler.send(command);
      return response;
    }
    return await handleAWSServiceError(addScheduleImpl, "Failed to add recurring schedule.")()
  }
  
  async updateSchedule(id: string, payload: unknown): Promise<unknown> {
    const updateScheduleImpl = async() => {
      const input = await this.scheduleCommandInput(id, "", "", payload)
      
      const command = new UpdateScheduleCommand(input);
      const response = await this.scheduler.send(command);
      return response.$metadata.httpStatusCode ?? undefined;
    }
    return await handleAWSServiceError(updateScheduleImpl, "Failed to update recurring schedule")()
  }
  
  // TODO: don't think this is correct though
  async disableSchedule(id: string): Promise<unknown> {
    const disableScheduleImpl = async() => {
      const input = await this.scheduleCommandInput(id, "", "", ScheduleState.DISABLED); // TODO: unneeded params time and timezone
      const command = new UpdateScheduleCommand(input);
      const response = await this.scheduler.send(command);
      
      return response 
    }
    return await handleAWSServiceError(disableScheduleImpl, "Failed to disable recurring schedule")()
  }
  
  async removeSchedule(id: string): Promise<unknown> {
    const removeScheduleImpl = async() => {
      const input = {
        Name: id,
      };
      const command = new DeleteScheduleCommand(input);
      const response = await this.scheduler.send(command);
      return response;
    }
    return await handleAWSServiceError(removeScheduleImpl, "Failed to remove recurring schedule")()
  }

  private async scheduleCommandInput(id: string, schedule: string, timezone: string, payload: unknown, disabled = ScheduleState.ENABLED): Promise<CreateScheduleCommandInput> {
    const input = {
      Name: id,
      ScheduleExpression: schedule,
      ScheduleExpressionTimezone: timezone,
      State: disabled,
      Target: {
        Arn: "", // fetch arn with Lambda SDK
        RoleArn: "",
        Input: JSON.stringify(payload),
      },
      FlexibleTimeWindow: undefined,
    };

    return input
  }

  
}
