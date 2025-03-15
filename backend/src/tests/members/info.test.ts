import { Hono } from "hono";
import { startTestApp } from "../helpers/test-app";
import { TestBuilder } from "../helpers/test-builder";
import { HTTPRequest, Status } from "../../constants/http";
import { DEARLY_GROUP_ID, USER_ALICE_ID, USER_BILL_ID } from "./../helpers/test-constants";
import { generateJWTFromID, generateUUID } from "../helpers/test-token";

describe("GET /groups/:id/members/info", () => {
  let app: Hono;
  const testBuilder = new TestBuilder();

  beforeAll(async () => {
    app = await startTestApp();
  });

  it("should return 200 if successfully retrieve member's info", async () => {
    (
      await testBuilder.request({
        app,
        type: HTTPRequest.GET,
        route: `/api/v1/groups/${DEARLY_GROUP_ID}/members/info`,
        autoAuthorized: false,
        headers: {
          Authorization: `Bearer ${generateJWTFromID(USER_ALICE_ID)}`,
        },
      })
    )
      .assertStatusCode(Status.OK)
      .assertFields({
        commentNotificationEnabled: true,
        groupId: DEARLY_GROUP_ID,
        lastManualNudge: null,
        likeNotificationEnabled: true,
        nudgeNotificationEnabled: true,
        postNotificationEnabled: true,
        role: "MANAGER",
        userId: USER_ALICE_ID,
      });
  });

  it("should return 404 if user not member of group", async () => {
    (
      await testBuilder.request({
        app,
        type: HTTPRequest.GET,
        route: `/api/v1/groups/${DEARLY_GROUP_ID}/members/info`,
        autoAuthorized: false,
        headers: {
          Authorization: `Bearer ${generateJWTFromID(USER_BILL_ID)}`,
        },
      })
    )
      .assertStatusCode(Status.NotFound)
      .assertError("Group does not exist.");
  });

  it("should return 404 if group does not exist", async () => {
    (
      await testBuilder.request({
        app,
        type: HTTPRequest.GET,
        route: `/api/v1/groups/${generateUUID()}/members/info`,
        autoAuthorized: false,
        headers: {
          Authorization: `Bearer ${generateJWTFromID(USER_BILL_ID)}`,
        },
      })
    )
      .assertStatusCode(Status.NotFound)
      .assertError("Group does not exist.");
  });
});
