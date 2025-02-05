import {
  USER_BOB_ID,
  USER_ALICE_ID,
  INVALID_ID_ARRAY,
  DEARLY_GROUP_ID,
  MOCK_EXPO_TOKEN,
  USER_ANA_ID,
} from "../helpers/test-constants";
import { Hono } from "hono";
import { startTestApp } from "../helpers/test-app";
import { TestBuilder } from "../helpers/test-builder";
import { generateJWTFromID, generateUUID } from "../helpers/test-token";
import { HTTPRequest, Status } from "../../constants/http";
import { sendPushNotificationsAsyncSpy } from "../helpers/mock";
import { COOLDOWN_PERIOD } from "../../constants/nudge";

describe("PUT /groups/:id/nudges/manual", () => {
  let app: Hono;
  const testBuilder = new TestBuilder();

  const ALICE_JWT = generateJWTFromID(USER_ALICE_ID);

  beforeAll(async () => {
    app = await startTestApp();
  });

  beforeEach(() => {
    // to reset number of times its method gets called
    sendPushNotificationsAsyncSpy.mockClear();
  });

  it("should return 404 if group does not exist", async () => {
    (
      await testBuilder.request({
        app,
        type: HTTPRequest.PUT,
        route: `/api/v1/groups/${generateUUID()}/nudges/manual`,
        autoAuthorized: false,
        headers: {
          Authorization: `Bearer ${ALICE_JWT}`,
        },
        requestBody: {
          users: [generateUUID()],
        },
      })
    )
      .assertStatusCode(Status.NotFound)
      .assertError("Group does not exist.");

    expect(await sendPushNotificationsAsyncSpy).not.toHaveBeenCalled();
  });

  it("should return 200 if user does have device and notification on", async () => {
    (
      await testBuilder.request({
        app,
        type: HTTPRequest.PUT,
        route: `/api/v1/groups/${DEARLY_GROUP_ID}/nudges/manual`,
        autoAuthorized: false,
        headers: {
          Authorization: `Bearer ${ALICE_JWT}`,
        },
        requestBody: {
          users: [USER_BOB_ID],
        },
      })
    ).assertStatusCode(200);

    expect(await sendPushNotificationsAsyncSpy).toHaveBeenCalledTimes(1);
    expect(await sendPushNotificationsAsyncSpy).toHaveBeenCalledWith([
      {
        title: "Time to Connect! 🚀",
        body: `✨ Share a post with your dearly group now! ✨`,
        to: [MOCK_EXPO_TOKEN],
        data: {
          groupId: DEARLY_GROUP_ID,
          groupName: "dearly",
        },
      },
    ]);
  });

  it("should return 429 try to spam nudges during cooldown", async () => {
    (
      await testBuilder.request({
        app,
        type: HTTPRequest.PUT,
        route: `/api/v1/groups/${DEARLY_GROUP_ID}/nudges/manual`,
        autoAuthorized: false,
        headers: {
          Authorization: `Bearer ${ALICE_JWT}`,
        },
        requestBody: {
          users: [USER_BOB_ID],
        },
      })
    ).assertStatusCode(429);

    expect(await sendPushNotificationsAsyncSpy).not.toHaveBeenCalled();
  });

  it("should return 403 if try to nudge users not member", async () => {
    (
      await testBuilder.request({
        app,
        type: HTTPRequest.PUT,
        route: `/api/v1/groups/${DEARLY_GROUP_ID}/nudges/manual`,
        autoAuthorized: false,
        headers: {
          Authorization: `Bearer ${ALICE_JWT}`,
        },
        requestBody: {
          users: [USER_ANA_ID],
        },
      })
    ).assertStatusCode(403);

    expect(await sendPushNotificationsAsyncSpy).not.toHaveBeenCalled();
  });

  it("should return 200 ignore if try to nudge oneself", async () => {
    (
      await testBuilder.request({
        app,
        type: HTTPRequest.PUT,
        route: `/api/v1/groups/${DEARLY_GROUP_ID}/nudges/manual`,
        autoAuthorized: false,
        headers: {
          Authorization: `Bearer ${ALICE_JWT}`,
        },
        requestBody: {
          users: [USER_ALICE_ID],
        },
      })
    ).assertStatusCode(200);

    // expo actually did not get called
    expect(await sendPushNotificationsAsyncSpy).not.toHaveBeenCalled();
  });

  it("should return 200 try to send nudge after cooldown", async () => {
    jest.setSystemTime(new Date(Date.now() + COOLDOWN_PERIOD));

    (
      await testBuilder.request({
        app,
        type: HTTPRequest.PUT,
        route: `/api/v1/groups/${DEARLY_GROUP_ID}/nudges/manual`,
        autoAuthorized: false,
        headers: {
          Authorization: `Bearer ${generateJWTFromID(USER_ALICE_ID)}`,
        },
        requestBody: {
          users: [USER_BOB_ID],
        },
      })
    ).assertStatusCode(200);

    expect(await sendPushNotificationsAsyncSpy).toHaveBeenCalledTimes(1);
    expect(await sendPushNotificationsAsyncSpy).toHaveBeenCalledWith([
      {
        title: "Time to Connect! 🚀",
        body: `✨ Share a post with your dearly group now! ✨`,
        to: [MOCK_EXPO_TOKEN],
        data: {
          groupId: DEARLY_GROUP_ID,
          groupName: "dearly",
        },
      },
    ]);
  });

  it("should return 200 if user turns off notification", async () => {
    // Bob turned off group notification
    (
      await testBuilder.request({
        app,
        type: HTTPRequest.PATCH,
        route: `/api/v1/groups/${DEARLY_GROUP_ID}/members/notifications`,
        autoAuthorized: false,
        headers: {
          Authorization: `Bearer ${generateJWTFromID(USER_BOB_ID)}`,
        },
      })
    )
      .assertStatusCode(Status.OK)
      .assertMessage("Successfully turn off notification for group");

    // group manager should be able to nudge without problems since we will
    // simply ignore Bob because he has notification turned off
    (
      await testBuilder.request({
        app,
        type: HTTPRequest.PUT,
        route: `/api/v1/groups/${DEARLY_GROUP_ID}/nudges/manual`,
        autoAuthorized: false,
        headers: {
          Authorization: `Bearer ${generateJWTFromID(USER_ALICE_ID)}`,
        },
        requestBody: {
          users: [USER_BOB_ID],
        },
      })
    ).assertStatusCode(200);

    // check that Expo actually did not send anything
    expect(await sendPushNotificationsAsyncSpy).not.toHaveBeenCalled();
  });

  it("should return 404 if user(s) does not exist", async () => {
    const nonExistentUser1 = generateUUID();
    const nonExistentUser2 = generateUUID();
    (
      await testBuilder.request({
        app,
        type: HTTPRequest.PUT,
        route: `/api/v1/groups/${DEARLY_GROUP_ID}/nudges/manual`,
        autoAuthorized: false,
        headers: {
          Authorization: `Bearer ${generateJWTFromID(USER_ALICE_ID)}`,
        },
        requestBody: {
          users: [nonExistentUser1, nonExistentUser2],
        },
      })
    )
      .assertStatusCode(Status.NotFound)
      .assertError(`Users not found: ${nonExistentUser1}, ${nonExistentUser2}`);

    expect(await sendPushNotificationsAsyncSpy).not.toHaveBeenCalled();
  });

  it("should return 400 if empty selected users", async () => {
    (
      await testBuilder.request({
        app,
        type: HTTPRequest.PUT,
        route: `/api/v1/groups/${generateUUID()}/nudges/manual`,
        autoAuthorized: false,
        headers: {
          Authorization: `Bearer ${generateJWTFromID(USER_ALICE_ID)}`,
        },
        requestBody: {
          users: [],
        },
      })
    )
      .assertStatusCode(Status.BadRequest)
      .assertError([
        {
          message: "Please select at least one user to nudge",
          path: "users",
        },
      ]);
  });

  it("should return 400 if no request body", async () => {
    (
      await testBuilder.request({
        app,
        type: HTTPRequest.PUT,
        route: `/api/v1/groups/${generateUUID()}/nudges/manual`,
        autoAuthorized: false,
        headers: {
          Authorization: `Bearer ${generateJWTFromID(USER_ALICE_ID)}`,
        },
      })
    ).assertStatusCode(Status.BadRequest);
  });

  it("should return 403 if user not a manager", async () => {
    (
      await testBuilder.request({
        app,
        type: HTTPRequest.PUT,
        route: `/api/v1/groups/${DEARLY_GROUP_ID}/nudges/manual`,
        autoAuthorized: false,
        headers: {
          Authorization: `Bearer ${generateJWTFromID(USER_BOB_ID)}`,
        },
        requestBody: {
          users: [USER_ALICE_ID],
        },
      })
    ).assertStatusCode(Status.Forbidden);

    expect(await sendPushNotificationsAsyncSpy).not.toHaveBeenCalled();
  });

  it.each(
    INVALID_ID_ARRAY.map((id) => [id === null ? "null" : id === undefined ? "undefined" : id, id]),
  )("should return 400 if invalid ID %s", async (id) => {
    (
      await testBuilder.request({
        app,
        type: HTTPRequest.PUT,
        route: `/api/v1/groups/${id}/nudges/manual`,
      })
    )
      .assertStatusCode(Status.BadRequest)
      .assertError("Invalid ID format");
  });
});
