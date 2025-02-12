import { SchedulerClient } from "@aws-sdk/client-scheduler";

export interface NudgeScheduler {
  // TODO: input and output type of this, just dummy for now
  removeSchedule(id: string): Promise<unknown>;
  addSchedule(id: string, payload: unknown): Promise<unknown>;
  updateSchedule(id: string, payload: unknown): Promise<unknown>;
}

export class AWSEventBridgeScheduler implements NudgeScheduler {
  private scheduler: SchedulerClient;

  constructor(scheduler: SchedulerClient) {
    this.scheduler = scheduler;
  }

  async removeSchedule(id: string): Promise<unknown> {
    throw new Error("Method not implemented");
  }

  async addSchedule(id: string, payload: unknown): Promise<unknown> {
    throw new Error("Method not implemented");
  }

  async updateSchedule(id: string, payload: unknown): Promise<unknown> {
    throw new Error("Method not implemented");
  }
}
