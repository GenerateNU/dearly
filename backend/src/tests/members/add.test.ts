import { Hono } from "hono";
import { startTestApp } from "../helpers/test-app";
import { TestBuilder } from "../helpers/test-builder";
import { generateUUID } from "../helpers/test-token";
import { HTTPRequest, Status } from "../../constants/http";
import { MemberRole } from "../../constants/database";
import { DEARLY_GROUP_ID, USER_ALICE_ID, USER_ANA_ID } from "./../helpers/test-constants";

describe("POST /groups/:id/members", () => {
  let app: Hono;
  const testBuilder = new TestBuilder();

  beforeAll(async () => {
    app = await startTestApp();
  });

  it("should return 201 if a valid user is added to the group and was not already present in the group", async () => {
    const testId = generateUUID();
    (
      await testBuilder.request({
        app,
        type: HTTPRequest.POST,
        route: `/api/v1/groups/${DEARLY_GROUP_ID}/members/${USER_ANA_ID}`,
        requestBody: {
          id: testId, // should be ignored
          hello: "world", // should be ignored
        },
      })
    )
      .assertStatusCode(Status.Created)
      .assertFieldExists("joinedAt")
      .assertFields({
        userId: USER_ANA_ID,
        groupId: DEARLY_GROUP_ID,
        role: MemberRole.MEMBER,
      });
  });

  it("should return 201 if a valid user is added to the group and was already added in the group", async () => {
    const testId = generateUUID();
    (
      await testBuilder.request({
        app,
        type: HTTPRequest.POST,
        route: `/api/v1/groups/${DEARLY_GROUP_ID}/members/${USER_ALICE_ID}`,
        requestBody: {
          id: testId, // should be ignored
          hello: "world", // should be ignored
        },
      })
    )
      .assertStatusCode(Status.Created)
      .assertFieldExists("joinedAt")
      .assertFields({
        userId: USER_ALICE_ID,
        groupId: DEARLY_GROUP_ID,
        role: MemberRole.MANAGER,
      });
  });

  it("should return 404 if user does not exist", async () => {
    const testId = generateUUID();
    (
      await testBuilder.request({
        app,
        type: HTTPRequest.POST,
        route: `/api/v1/groups/${DEARLY_GROUP_ID}/members/${testId}`,
        requestBody: {
          id: testId, // should be ignored
          hello: "world", // should be ignored
        },
      })
    )
      .assertStatusCode(Status.NotFound)
      .assertError("User does not exist.");
  });

  it("should return 404 if group does not exist", async () => {
    const testId = generateUUID();
    // const responseId = (
    (
      await testBuilder.request({
        app,
        type: HTTPRequest.POST,
        route: `/api/v1/groups/${testId}/members/${USER_ALICE_ID}`,
        requestBody: {
          id: testId, // should be ignored
          hello: "world", // should be ignored
        },
      })
    )
      .assertStatusCode(Status.NotFound)
      .assertError("Group does not exist.");
  });
});
