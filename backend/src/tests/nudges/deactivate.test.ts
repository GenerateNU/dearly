import {
  USER_BOB_ID,
  USER_ALICE_ID,
  INVALID_ID_ARRAY,
  DEARLY_GROUP_ID,
  USER_ANA_ID,
  MOCK_SCHEDULE,
  ANOTHER_GROUP_ID,
  GENERATE_GROUP_ID,
  USER_BILL_ID,
} from "../helpers/test-constants";
import { Hono } from "hono";
import { startTestApp } from "../helpers/test-app";
import { TestBuilder } from "../helpers/test-builder";
import { generateJWTFromID, generateUUID } from "../helpers/test-token";
import { HTTPRequest, Status } from "../../constants/http";
import { getMockSchedulerClient } from "../helpers/mock";
import { SchedulerClient } from "@aws-sdk/client-scheduler";

describe("PUT /groups/:id/nudges/auto/off", () => {
  let app: Hono;
  const testBuilder = new TestBuilder();
  let schedulerClient: SchedulerClient;
  let scheduleCommandSpy: jest.SpyInstance;

  const ALICE_JWT = generateJWTFromID(USER_ALICE_ID);

  beforeAll(async () => {
    schedulerClient = getMockSchedulerClient();
    scheduleCommandSpy = jest.spyOn(schedulerClient, "send")
    app = await startTestApp(schedulerClient);
  });
  
  it("should return 404 if group does not exist", async () => {
    (
      await testBuilder.request({
        app,
        type: HTTPRequest.PUT,
        route: `/api/v1/groups/${generateUUID()}/nudges/auto/off`,
        autoAuthorized: false,
        headers: {
          Authorization: `Bearer ${ALICE_JWT}`,
        },
      })
    )
      .assertStatusCode(Status.NotFound)
      .assertError("Group does not exist.");

      
    expect(await scheduleCommandSpy).not.toHaveBeenCalled();
  });
  
  it("should return 403 if user not member of group", async () => {
    (
      await testBuilder.request({
        app,
        type: HTTPRequest.PUT,
        route: `/api/v1/groups/${DEARLY_GROUP_ID}/nudges/auto/off`,
        autoAuthorized: false,
        headers: {
          Authorization: `Bearer ${generateJWTFromID(USER_ANA_ID)}`,
        },
      })
    ).assertStatusCode(Status.Forbidden);
  });
  
  it("should return 403 if user not manager of group", async () => {
    (
      await testBuilder.request({
        app,
        type: HTTPRequest.PUT,
        route: `/api/v1/groups/${DEARLY_GROUP_ID}/nudges/auto/off`,
        autoAuthorized: false,
        headers: {
          Authorization: `Bearer ${generateJWTFromID(USER_BOB_ID)}`,
        },
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
        route: `/api/v1/groups/${id}/nudges/auto/off`,
      })
    )
    .assertStatusCode(Status.BadRequest)
    .assertError("Invalid ID format");
  });
  
    it("should return 200 if group schedule not configured", async () => {
      (
        await testBuilder.request({
          app,
          type: HTTPRequest.PUT,
          route: `/api/v1/groups/${GENERATE_GROUP_ID}/nudges/auto/off`,
          autoAuthorized: false,
          headers: {
            Authorization: `Bearer ${generateJWTFromID(USER_BILL_ID)}`,
          },
        })
      )
        .assertStatusCode(Status.OK)
        .assertMessage("Nudge schedule not configured for deactivation");

        
        expect(await scheduleCommandSpy).not.toHaveBeenCalled();
    });
  
    it("should return 200 if group schedule configured", async () => {
      (
        await testBuilder.request({
          app,
          type: HTTPRequest.PUT,
          route: `/api/v1/groups/${ANOTHER_GROUP_ID}/nudges/auto/off`,
          autoAuthorized: false,
          headers: {
            Authorization: `Bearer ${generateJWTFromID(USER_ANA_ID)}`,
          },
        })
      )
        .assertStatusCode(Status.OK)
        .assertFields({
          ...MOCK_SCHEDULE,
          nudgeAt: MOCK_SCHEDULE.nudgeAt.toISOString(),
          isActive: false,
        });
  
        expect(await scheduleCommandSpy).toHaveBeenCalled();
    });
});
