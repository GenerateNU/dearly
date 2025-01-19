import { Hono } from "hono";
import { startTestApp } from "../helpers/test-app";
import { TestBuilder } from "../helpers/test-builder";
import { HTTPRequest, Status } from "../../constants/http";
import { generateJWTFromID, generateUUID } from "../helpers/test-token";

describe("End-to-end User CRUD", () => {
  let app: Hono;
  const testBuilder = new TestBuilder();
  const originalBody = {
    name: "Jane Doe",
    username: "janedoe",
    mode: "BASIC",
  };
  const updatedBody = {
    name: "John Smith",
    username: "johnsmith",
    mode: "ADVANCED",
  };
  const userId = generateUUID();
  const jwt = generateJWTFromID(userId);

  const authPayload = {
    autoAuthorized: false,
    headers: {
      Authorization: `Bearer ${jwt}`,
    },
  };

  beforeAll(async () => {
    app = await startTestApp();
  });

  it("should create user successfully", async () => {
    (
      await testBuilder.request({
        app,
        type: HTTPRequest.POST,
        route: "/api/v1/users",
        requestBody: originalBody,
        ...authPayload,
      })
    )
      .assertStatusCode(Status.Created)
      .assertBody({
        id: userId,
        ...originalBody,
        mode: "BASIC",
        profilePhoto: null,
        notificationsEnabled: true,
      });
  });

  it("should get user successfully", async () => {
    (
      await testBuilder.request({
        app,
        type: HTTPRequest.GET,
        route: `api/v1/users/${userId}`,
      })
    )
      .assertStatusCode(Status.OK)
      .assertBody({
        id: userId,
        ...originalBody,
        mode: "BASIC",
        profilePhoto: null,
        notificationsEnabled: true,
      });
  });

  it("should update user successfully", async () => {
    (
      await testBuilder.request({
        app,
        type: HTTPRequest.PATCH,
        route: `api/v1/users/me`,
        requestBody: updatedBody,
        ...authPayload,
      })
    )
      .assertFields({
        id: userId,
        ...updatedBody,
      })
      .assertStatusCode(Status.OK);
  });

  it("should delete user multiple times successfully", async () => {
    (
      await testBuilder.request({
        app,
        type: HTTPRequest.DELETE,
        route: `api/v1/users/me`,
        ...authPayload,
      })
    )
      .assertStatusCode(Status.OK)
      .assertMessage("Successfully delete user");

    // delete again
    (
      await testBuilder.request({
        app,
        type: HTTPRequest.DELETE,
        route: `api/v1/users/me`,
        ...authPayload,
      })
    )
      .assertStatusCode(Status.OK)
      .assertMessage("Successfully delete user");
  });

  it("should be not found after deletion", async () => {
    (
      await testBuilder.request({
        app,
        type: HTTPRequest.GET,
        route: `api/v1/users/${userId}`,
      })
    )
      .assertStatusCode(Status.NotFound)
      .assertError("User does not exist.");

    (
      await testBuilder.request({
        app,
        type: HTTPRequest.PATCH,
        route: `api/v1/users/me`,
        requestBody: originalBody,
        ...authPayload,
      })
    )
      .assertStatusCode(Status.NotFound)
      .assertError("User does not exist.");
  });
});
