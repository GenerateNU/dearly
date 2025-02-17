import {
  USER_BOB_ID,
  USER_ALICE_ID,
  INVALID_ID_ARRAY,
  DEARLY_GROUP_ID,
  USER_ANA_ID,
  MOCK_SCHEDULE,
} from "../helpers/test-constants";
import { Hono } from "hono";
import { startTestApp } from "../helpers/test-app";
import { TestBuilder } from "../helpers/test-builder";
import { generateJWTFromID, generateUUID } from "../helpers/test-token";
import { HTTPRequest, Status } from "../../constants/http";
import { getMockSchedulerClient } from "../helpers/mock";
import { SchedulerClient } from "@aws-sdk/client-scheduler";

describe("PUT /groups/:id/nudges/auto", () => {
  let app: Hono;
  let schedulerClient: SchedulerClient;
  let scheduleCommandSpy: jest.SpyInstance;
  const testBuilder = new TestBuilder();

  const ALICE_JWT = generateJWTFromID(USER_ALICE_ID);

  beforeAll(async () => {
    schedulerClient = getMockSchedulerClient();
    scheduleCommandSpy = jest.spyOn(schedulerClient, "send")
    app = await startTestApp(schedulerClient);
  });

  const EXAMPLE_SCHEDULE = {
    frequency: "WEEKLY",
    daysOfWeek: ["MON"],
    nudgeAt: new Date(Date.now()),
  };

  const UPDATED_SCHEDULE = {
    frequency: "YEARLY",
    day: 14,
    month: 3,
    nudgeAt: new Date(Date.now()),
  };

  
  it("should return 400 if no required fields", async () => {
    (
      await testBuilder.request({
        app,
        type: HTTPRequest.PUT,
        route: `/api/v1/groups/${DEARLY_GROUP_ID}/nudges/auto`,
        autoAuthorized: false,
        headers: {
          Authorization: `Bearer ${ALICE_JWT}`,
        },
        requestBody: {},
      })
    )
    .assertStatusCode(Status.BadRequest)
    .assertError([
      {
          path: "frequency",
          message: "Required",
        },
        {
          path: "nudgeAt",
          message: "Required",
        },
      ]);
      
      expect(await scheduleCommandSpy).not.toHaveBeenCalled();
  });
  
  it("should return 400 if bad daily request", async () => {
    (
      await testBuilder.request({
        app,
        type: HTTPRequest.PUT,
        route: `/api/v1/groups/${DEARLY_GROUP_ID}/nudges/auto`,
        autoAuthorized: false,
        headers: {
          Authorization: `Bearer ${ALICE_JWT}`,
        },
        requestBody: {
          frequency: "DAILY",
          month: 1,
          nudgeAt: new Date(-1),
        },
      })
    )
      .assertStatusCode(Status.BadRequest)
      .assertError([
        {
          path: "frequency",
          message:
          "For DAILY schedules, no additional fields (daysOfWeek, day, month) should be specified",
        },
      ]);
  });

  it("should return 400 if weekly no daysOfWeek", async () => {
    (
      await testBuilder.request({
        app,
        type: HTTPRequest.PUT,
        route: `/api/v1/groups/${DEARLY_GROUP_ID}/nudges/auto`,
        autoAuthorized: false,
        headers: {
          Authorization: `Bearer ${ALICE_JWT}`,
        },
        requestBody: {
          frequency: "WEEKLY",
          nudgeAt: new Date(-1),
        },
      })
    )
    .assertStatusCode(Status.BadRequest)
    .assertError([
      {
          path: "frequency",
          message:
            "For WEEKLY/BIWEEKLY schedules, at least one day of the week must be selected. No other fields (day, month) should be specified.",
          },
      ]);
    });

    it("should return 400 if weekly extra month field", async () => {
      (
        await testBuilder.request({
        app,
        type: HTTPRequest.PUT,
        route: `/api/v1/groups/${DEARLY_GROUP_ID}/nudges/auto`,
        autoAuthorized: false,
        headers: {
          Authorization: `Bearer ${ALICE_JWT}`,
        },
        requestBody: {
          frequency: "WEEKLY",
          nudgeAt: new Date(-1),
          month: 1,
          daysOfWeek: ["MON"],
        },
      })
    )
    .assertStatusCode(Status.BadRequest)
    .assertError([
      {
          path: "frequency",
          message:
          "For WEEKLY/BIWEEKLY schedules, at least one day of the week must be selected. No other fields (day, month) should be specified.",
        },
      ]);
    });
    
    it("should return 400 if weekly invalid weekday", async () => {
      (
        await testBuilder.request({
        app,
        type: HTTPRequest.PUT,
        route: `/api/v1/groups/${DEARLY_GROUP_ID}/nudges/auto`,
        autoAuthorized: false,
        headers: {
          Authorization: `Bearer ${ALICE_JWT}`,
        },
        requestBody: {
          frequency: "BIWEEKLY",
          nudgeAt: new Date(-1),
          daysOfWeek: ["HELLO"],
        },
      })
    )
      .assertStatusCode(Status.BadRequest)
      .assertError([
        {
          message:
          "Invalid enum value. Expected 'MON' | 'TUE' | 'WED' | 'THU' | 'FRI' | 'SAT' | 'SUN', received 'HELLO'",
          path: "daysOfWeek.0",
        },
      ]);
  });
  
  it("should return 400 if monthly missing fields", async () => {
    (
      await testBuilder.request({
        app,
        type: HTTPRequest.PUT,
        route: `/api/v1/groups/${DEARLY_GROUP_ID}/nudges/auto`,
        autoAuthorized: false,
        headers: {
          Authorization: `Bearer ${ALICE_JWT}`,
        },
        requestBody: {
          frequency: "MONTHLY",
          nudgeAt: new Date(-1),
        },
      })
    )
      .assertStatusCode(Status.BadRequest)
      .assertError([
        {
          message:
          "For MONTHLY schedules, a day of the month (1-31) must be specified. No other field (daysOfWeek, month) should be specified.",
          path: "frequency",
        },
      ]);
  });

  it("should return 400 if monthly extra field", async () => {
    (
      await testBuilder.request({
        app,
        type: HTTPRequest.PUT,
        route: `/api/v1/groups/${DEARLY_GROUP_ID}/nudges/auto`,
        autoAuthorized: false,
        headers: {
          Authorization: `Bearer ${ALICE_JWT}`,
        },
        requestBody: {
          frequency: "MONTHLY",
          nudgeAt: new Date(-1),
          month: 3, // not need to specify month
          day: 14,
        },
      })
    )
    .assertStatusCode(Status.BadRequest)
      .assertError([
        {
          message:
            "For MONTHLY schedules, a day of the month (1-31) must be specified. No other field (daysOfWeek, month) should be specified.",
            path: "frequency",
          },
      ]);
  });

  it("should return 400 if monthly bad day value", async () => {
    (
      await testBuilder.request({
        app,
        type: HTTPRequest.PUT,
        route: `/api/v1/groups/${DEARLY_GROUP_ID}/nudges/auto`,
        autoAuthorized: false,
        headers: {
          Authorization: `Bearer ${ALICE_JWT}`,
        },
        requestBody: {
          frequency: "MONTHLY",
          nudgeAt: new Date(-1),
          day: 32,
        },
      })
    )
    .assertStatusCode(Status.BadRequest)
    .assertError([
      {
        message: "Number must be less than or equal to 31",
        path: "day",
      },
    ]);
  });

  it("should return 400 if monthly bad day value", async () => {
    (
      await testBuilder.request({
        app,
        type: HTTPRequest.PUT,
        route: `/api/v1/groups/${DEARLY_GROUP_ID}/nudges/auto`,
        autoAuthorized: false,
        headers: {
          Authorization: `Bearer ${ALICE_JWT}`,
        },
        requestBody: {
          frequency: "MONTHLY",
          nudgeAt: new Date(-1),
          day: -1,
        },
      })
    )
    .assertStatusCode(Status.BadRequest)
      .assertError([
        {
          message: "Number must be greater than or equal to 1",
          path: "day",
        },
      ]);
  });

  it("should return 400 if yearly missing fields", async () => {
    (
      await testBuilder.request({
        app,
        type: HTTPRequest.PUT,
        route: `/api/v1/groups/${DEARLY_GROUP_ID}/nudges/auto`,
        autoAuthorized: false,
        headers: {
          Authorization: `Bearer ${ALICE_JWT}`,
        },
        requestBody: {
          frequency: "YEARLY",
          nudgeAt: new Date(-1),
        },
      })
    )
      .assertStatusCode(Status.BadRequest)
      .assertError([
        {
          message:
            "For YEARLY schedules, both month (1-12) and day (1-31) must be specified. No other field (daysOfWeek) should be specified.",
          path: "frequency",
        },
      ]);
  });
  
  it("should return 400 if yearly extra fields", async () => {
    (
      await testBuilder.request({
        app,
        type: HTTPRequest.PUT,
        route: `/api/v1/groups/${DEARLY_GROUP_ID}/nudges/auto`,
        autoAuthorized: false,
        headers: {
          Authorization: `Bearer ${ALICE_JWT}`,
        },
        requestBody: {
          frequency: "YEARLY",
          nudgeAt: new Date(-1),
          month: 3,
          day: 14,
          daysOfWeek: ["MON"], // not acceptable
        },
      })
    )
      .assertStatusCode(Status.BadRequest)
      .assertError([
        {
          message:
            "For YEARLY schedules, both month (1-12) and day (1-31) must be specified. No other field (daysOfWeek) should be specified.",
          path: "frequency",
        },
      ]);
    });
    
    it("should return 400 if yearly bad month value", async () => {
      (
      await testBuilder.request({
        app,
        type: HTTPRequest.PUT,
        route: `/api/v1/groups/${DEARLY_GROUP_ID}/nudges/auto`,
        autoAuthorized: false,
        headers: {
          Authorization: `Bearer ${ALICE_JWT}`,
        },
        requestBody: {
          frequency: "YEARLY",
          nudgeAt: new Date(-1),
          month: 13,
          day: 14,
        },
      })
    )
    .assertStatusCode(Status.BadRequest)
    .assertError([
      {
        message: "Number must be less than or equal to 12",
        path: "month",
        },
      ]);
    });

    it("should return 400 if yearly negative month value", async () => {
    (
      await testBuilder.request({
        app,
        type: HTTPRequest.PUT,
        route: `/api/v1/groups/${DEARLY_GROUP_ID}/nudges/auto`,
        autoAuthorized: false,
        headers: {
          Authorization: `Bearer ${ALICE_JWT}`,
        },
        requestBody: {
          frequency: "YEARLY",
          nudgeAt: new Date(-1),
          month: -1,
          day: 14,
        },
      })
    )
      .assertStatusCode(Status.BadRequest)
      .assertError([
        {
          message: "Number must be greater than or equal to 1",
          path: "month",
        },
      ]);
    });
    
    it("should return 404 if group does not exist", async () => {
      (
        await testBuilder.request({
        app,
        type: HTTPRequest.PUT,
        route: `/api/v1/groups/${generateUUID()}/nudges/auto`,
        autoAuthorized: false,
        headers: {
          Authorization: `Bearer ${ALICE_JWT}`,
        },
        requestBody: MOCK_SCHEDULE,
      })
    )
      .assertStatusCode(Status.NotFound)
      .assertError("Group does not exist.");
    });

  it("should return 403 if user not member of group", async () => {
    (
      await testBuilder.request({
        app,
        type: HTTPRequest.PUT,
        route: `/api/v1/groups/${DEARLY_GROUP_ID}/nudges/auto`,
        autoAuthorized: false,
        headers: {
          Authorization: `Bearer ${generateJWTFromID(USER_ANA_ID)}`,
        },
        requestBody: MOCK_SCHEDULE,
      })
    ).assertStatusCode(Status.Forbidden);
  });

  it("should return 403 if user not manager of group", async () => {
    (
      await testBuilder.request({
        app,
        type: HTTPRequest.PUT,
        route: `/api/v1/groups/${DEARLY_GROUP_ID}/nudges/auto`,
        autoAuthorized: false,
        headers: {
          Authorization: `Bearer ${generateJWTFromID(USER_BOB_ID)}`,
        },
        requestBody: MOCK_SCHEDULE,
      })
    ).assertStatusCode(Status.Forbidden);
  });

  it.each(
    INVALID_ID_ARRAY.map((id) => [id === null ? "null" : id === undefined ? "undefined" : id, id]),
  )("should return 400 if invalid ID %s", async (id) => {
    (
      await testBuilder.request({
        app,
        type: HTTPRequest.PUT,
        route: `/api/v1/groups/${id}/nudges/auto`,
      })
    )
      .assertStatusCode(Status.BadRequest)
      .assertError("Invalid ID format");
    });

    it("should return a 200 if the user is a manager and initial insert succeeded", async () => {
      (
        await testBuilder.request({
          app,
          type: HTTPRequest.PUT,
          route: `/api/v1/groups/${DEARLY_GROUP_ID}/nudges/auto`,
          autoAuthorized: false,
          headers: {
            Authorization: `Bearer ${ALICE_JWT}`,
          },
          requestBody: EXAMPLE_SCHEDULE,
        })
      )
        .assertStatusCode(Status.OK)
        .assertFields({
          nudgeAt: EXAMPLE_SCHEDULE.nudgeAt.toISOString(),
          frequency: EXAMPLE_SCHEDULE.frequency,
          daysOfWeek: EXAMPLE_SCHEDULE.daysOfWeek,
        });
    
        expect(await scheduleCommandSpy).toHaveBeenCalled();
    });
    
    it("should return a 200 if the user is a manager and update succeeded", async () => {
      (
        await testBuilder.request({
          app,
          type: HTTPRequest.PUT,
          route: `/api/v1/groups/${DEARLY_GROUP_ID}/nudges/auto`,
          autoAuthorized: false,
          headers: {
            Authorization: `Bearer ${ALICE_JWT}`,
          },
          requestBody: UPDATED_SCHEDULE,
        })
      )
        .assertStatusCode(Status.OK)
        .assertFields({
          nudgeAt: UPDATED_SCHEDULE.nudgeAt.toISOString(),
          frequency: UPDATED_SCHEDULE.frequency,
          month: UPDATED_SCHEDULE.month,
          day: UPDATED_SCHEDULE.day,
        });
    
        expect(await scheduleCommandSpy).toHaveBeenCalled();
    });
});
