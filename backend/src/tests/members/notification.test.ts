import {
  USER_ANA_ID,
  USER_BOB_ID,
  USER_ALICE_ID,
  INVALID_ID_ARRAY,
  POST_ID,
  DEARLY_GROUP_ID,
} from "../helpers/test-constants";
import { Hono } from "hono";
import { startTestApp } from "../helpers/test-app";
import { TestBuilder } from "../helpers/test-builder";
import { generateJWTFromID, generateUUID } from "../helpers/test-token";
import { HTTPRequest, Status } from "../../constants/http";

describe("PATCH /groups/:id/members/notifications", () => {
  let app: Hono;
  const testBuilder = new TestBuilder();

  const ALICE_JWT = generateJWTFromID(USER_ALICE_ID);
  const ANA_JWT = generateJWTFromID(USER_ANA_ID);

  beforeAll(async () => {
    app = await startTestApp();
  });

  it("should return 200 if notification is toggled successfully for member", async () => {
    // Alice has notification for group turned on by default, so it should be turned off
    (
      await testBuilder.request({
        app,
        type: HTTPRequest.PATCH,
        route: `/api/v1/groups/${DEARLY_GROUP_ID}/members/notifications`,
        autoAuthorized: false,
        headers: {
          Authorization: `Bearer ${ALICE_JWT}`,
        },
      })
    )
      .assertStatusCode(Status.OK)
      .assertMessage("Successfully turn off notification for group");

    // now notification is turned off, should turn on again
    (
      await testBuilder.request({
        app,
        type: HTTPRequest.PATCH,
        route: `/api/v1/groups/${DEARLY_GROUP_ID}/members/notifications`,
        autoAuthorized: false,
        headers: {
          Authorization: `Bearer ${ALICE_JWT}`,
        },
      })
    )
      .assertStatusCode(Status.OK)
      .assertMessage("Successfully turn on notification for group");
  });

  it("should return 403 if post exists but user not in group", async () => {
    (
      await testBuilder.request({
        app,
        type: HTTPRequest.PATCH,
        route: `/api/v1/groups/${DEARLY_GROUP_ID}/members/notifications`,
        autoAuthorized: false,
        headers: {
          Authorization: `Bearer ${ANA_JWT}`,
        },
      })
    ).assertStatusCode(Status.Forbidden);
  });

  it("should return 404 if post not found", async () => {
    (
      await testBuilder.request({
        app,
        type: HTTPRequest.PATCH,
        route: `/api/v1/groups/${generateUUID()}/members/notifications`,
        autoAuthorized: false,
        headers: {
          Authorization: `Bearer ${ALICE_JWT}`,
        },
      })
    )
      .assertStatusCode(Status.NotFound)
      .assertError("Group does not exist.");
  });

  it.each(
    INVALID_ID_ARRAY.map((id) => [id === null ? "null" : id === undefined ? "undefined" : id, id]),
  )("should return 400 if invalid ID %s", async (id) => {
    (
      await testBuilder.request({
        app,
        type: HTTPRequest.PATCH,
        route: `/api/v1/groups/${id}/members/notifications`,
      })
    )
      .assertStatusCode(Status.BadRequest)
      .assertError("Invalid ID format");
  });
});
