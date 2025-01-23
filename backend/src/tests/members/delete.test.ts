import { Hono } from "hono";
import { startTestApp } from "../helpers/test-app";
import { TestBuilder } from "../helpers/test-builder";
import { HTTPRequest, Status } from "../../constants/http";
import { generateJWTFromID, generateUUID } from "../helpers/test-token";

import { DEARLY_GROUP_ID, USER_ALICE_ID } from "./../helpers/test-constants";

describe.skip("DELETE groups/{id}/members/{userId}", () => {
  let app: Hono;
  const testBuilder = new TestBuilder();
  const jwt = generateJWTFromID(generateUUID());
  const forbiddenMessage = "You do not have the rights to remove this member.";

  const authPayload = {
    autoAuthorized: false,
    headers: {
      Authorization: `Bearer ${jwt}`,
    },
  };

  beforeAll(async () => {
    app = await startTestApp();
  });

  beforeEach(async () => {
    (
      await testBuilder.request({
        app,
        type: HTTPRequest.POST,
        route: `/api/v1/groups/${DEARLY_GROUP_ID}/members/${USER_ALICE_ID}`,
        requestBody: {
          id: USER_ALICE_ID, // should be ignored
          hello: "world", // should be ignored
        },
      })
    ).assertStatusCode(Status.Created);
  });

  afterEach(async () => {
    (
      await testBuilder.request({
        app,
        type: HTTPRequest.DELETE,
        route: `/api/v1/groups/${DEARLY_GROUP_ID}/members/${USER_ALICE_ID}`,
        ...authPayload,
      })
    )
      .assertStatusCode(Status.OK)
      .assertMessage("Successfully delete user");
  });

  it("should return 200 if user exists", async () => {
    (
      await testBuilder.request({
        app,
        type: HTTPRequest.DELETE,
        route: `/api/v1/groups/${DEARLY_GROUP_ID}/members/${USER_ALICE_ID}`,
        ...authPayload,
      })
    )
      .assertStatusCode(Status.OK)
      .assertMessage("Successfully delete user");

    // idempotency test by deleting again
    (
      await testBuilder.request({
        app,
        type: HTTPRequest.DELETE,
        route: `/api/v1/groups/${DEARLY_GROUP_ID}/members/${USER_ALICE_ID}`,
        ...authPayload,
      })
    )
      .assertStatusCode(Status.OK)
      .assertMessage("Successfully delete user");
  });

  it("should return 200 if user not found", async () => {
    // TODO
    (
      await testBuilder.request({
        app,
        type: HTTPRequest.DELETE,
        route: `/api/v1/groups/${DEARLY_GROUP_ID}/members/${USER_ALICE_ID}`,
      })
    )
      .assertStatusCode(Status.OK)
      .assertMessage("Successfully delete user");
  });

  it("should return 304 if client is not the manager nor the member to be removed", async () => {
    (
      await testBuilder.request({
        app,
        type: HTTPRequest.DELETE,
        route: `/api/v1/groups/${DEARLY_GROUP_ID}/members/${USER_ALICE_ID}`,
      })
    )
      .assertStatusCode(Status.Forbidden)
      .assertMessage(forbiddenMessage);
  });
});
