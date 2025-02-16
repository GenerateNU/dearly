import { AWSEventBridgeScheduler } from "../../services/nudgeScheduler";
import { SchedulePayload } from "../../types/api/internal/nudges";
import { ExpoPushMessage } from "expo-server-sdk";
import { mockSchedulerClient } from "../helpers/mock";

const schedulerClient = mockSchedulerClient();

const scheduler = new AWSEventBridgeScheduler(schedulerClient);

describe("Nudge Scheduler Testing", async () => {
  const expoPushMessages: ExpoPushMessage[] = [];
  const testPayload: SchedulePayload = {
    schedule: {
      id: "myId",
      frequency: "DAILY",
      daysOfWeek: ["MON"],
      groupId: "",
      updatedAt: new Date(),
      createdAt: new Date(),
      nudgeAt: new Date(),
      isActive: true,
      day: 1,
      month: 2,
    },
    expo: { notifications: expoPushMessages },
  };

  it("Should have no error, and return the testARN", async () => {
    const response = await scheduler.addSchedule("testSchedule", testPayload);
    expect(response).toBeDefined();
    expect(response).toEqual(200);
  });

  it("Should have no error, and return the proper HTTPS response code", async () => {
    const response = await scheduler.updateSchedule("testSchedule", testPayload);
    expect(response).toBeDefined();
    expect(response).toEqual(200);
  });

  it("Should have no error, and return the proper HTTPS response code", async () => {
    const response = await scheduler.removeSchedule("myId");
    expect(response).toBeDefined();
  });
});
