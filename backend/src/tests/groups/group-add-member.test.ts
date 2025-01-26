import { Hono } from "hono";
import { TestBuilder } from "../helpers/test-builder";
import { startTestApp } from "../helpers/test-app";
import { HTTPRequest, Status } from "../../constants/http";
import {
  DEARLY_GROUP_ID,
  USER_ALICE_ID,
  USER_BILL_ID,
  USER_BOB_ID,
} from "../helpers/test-constants";
import { generateJWTFromID } from "../helpers/test-token";

const addMemberToGroupInviteTest = () => {
  let app: Hono;
  let testBuilder = new TestBuilder();

  beforeAll(async () => {
    app = await startTestApp();
  });

  it("Should return 403 for a unknown or invalid token", async () => {
    testBuilder = await testBuilder.request({
      app,
      type: HTTPRequest.PUT,
      route: `api/v1/groups/notcorrecttoken/verify`,
    });
    testBuilder.assertStatusCode(Status.NotFound);
  });

  it("Should return 200 for a good token", async () => {
    testBuilder = await testBuilder.request({
      app,
      type: HTTPRequest.GET,
      route: `/api/v1/groups/${DEARLY_GROUP_ID}/invites`,
      autoAuthorized: false,
      headers: {
        Authorization: `Bearer ${generateJWTFromID(USER_ALICE_ID)}`,
      },
    });

    const token = testBuilder.getResponseBodyKey("token") as string;
    const builder = await testBuilder.request({
      app,
      type: HTTPRequest.PUT,
      route: `api/v1/groups/${token}/verify`,
      autoAuthorized: false,
      headers: {
        Authorization: `Bearer ${generateJWTFromID(USER_BILL_ID)}`,
      },
    });
    builder.assertStatusCode(Status.OK);
  });

  it("Should return 409 if the person being invited is already in the group", async () => {
    testBuilder = await testBuilder.request({
      app,
      type: HTTPRequest.GET,
      route: `/api/v1/groups/${DEARLY_GROUP_ID}/invites`,
      autoAuthorized: false,
      headers: {
        Authorization: `Bearer ${generateJWTFromID(USER_ALICE_ID)}`,
      },
    });

    const token = testBuilder.getResponseBodyKey("token") as string;
    const builder = await testBuilder.request({
      app,
      type: HTTPRequest.PUT,
      route: `api/v1/groups/${token}/verify`,
      autoAuthorized: false,
      headers: {
        Authorization: `Bearer ${generateJWTFromID(USER_BOB_ID)}`,
      },
    });
    builder.assertStatusCode(Status.Conflict);
  });

  it("Should return 404 if the manager requests it", async () => {
    // Get the token as group manager
    const builder = await testBuilder.request({
      app,
      type: HTTPRequest.PUT,
      route: `api/v1/groups/verify`,
      autoAuthorized: false,
      headers: {
        Authorization: `Bearer ${generateJWTFromID(USER_ALICE_ID)}`,
      },
    });
    builder.assertStatusCode(Status.NotFound);
  });
};

describe("PUT /groups/{token}/verify", addMemberToGroupInviteTest);
