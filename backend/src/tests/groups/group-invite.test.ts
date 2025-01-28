import { Hono } from "hono";
import { TestBuilder } from "../helpers/test-builder";
import { startTestApp } from "../helpers/test-app";
import { HTTPRequest, Status } from "../../constants/http";
import { USER_ALICE_ID, USER_BOB_ID } from "../helpers/test-constants";
import { generateJWTFromID } from "../helpers/test-token";

const getGroupInviteTest = () => {
  let app: Hono;
  let groupId: string;
  const jwt = generateJWTFromID(USER_ALICE_ID);
  const testBuilder = new TestBuilder();
  const insertExampleGroup = async (app: Hono) => {
    const builder = await testBuilder.request({
      app,
      type: HTTPRequest.POST,
      route: "/api/v1/groups",
      requestBody: {
        name: "exampleGroup",
        description: "exampleDesc",
      },
      autoAuthorized: false,
      headers: {
        Authorization: `Bearer ${jwt}`,
      },
    });
    groupId = builder.getResponseId();
  };

  beforeAll(async () => {
    app = await startTestApp();
    await insertExampleGroup(app);
  });

  it("should return 200 if valid groupId", async () => {
    const builder = await testBuilder.request({
      app,
      type: HTTPRequest.GET,
      route: `/api/v1/groups/${groupId}/invites`,
      autoAuthorized: false,
      headers: {
        Authorization: `Bearer ${generateJWTFromID(USER_ALICE_ID)}`,
      },
    });
    builder.assertStatusCode(Status.OK);
    builder.assertFieldExists("token");
  });

  it("should return 404 if the user who requests the token is not the manager", async () => {
    const builder = await testBuilder.request({
      app,
      type: HTTPRequest.GET,
      route: `/api/v1/groups/${groupId}/invites`,
      autoAuthorized: false,
      headers: {
        Authorization: `Bearer ${generateJWTFromID(USER_BOB_ID)}`,
      },
    });
    builder.assertStatusCode(Status.NotFound);
  });

  it("should return 400 if malformed", async () => {
    const builder = await testBuilder.request({
      app,
      type: HTTPRequest.GET,
      route: `/api/v1/groups/sajldkjsakldjlask/invites`,
    });
    builder.assertStatusCode(Status.BadRequest);
  });

  it("should 404 if the group doesn't exist", async () => {
    const builder = await testBuilder.request({
      app,
      type: HTTPRequest.GET,
      route: `/api/v1/groups/${USER_BOB_ID}/invites`,
    });
    builder.assertStatusCode(Status.NotFound);
  });
};

describe("GET /groups/:id/invites", getGroupInviteTest);
