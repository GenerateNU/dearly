import { Hono } from "hono";
import { startTestApp } from "../helpers/test-app";
import { TestBuilder } from "../helpers/test-builder";
import { HTTPRequest, Status } from "../../constants/http";
import { generateJWTToken, generateUUID } from "../helpers/test-token";
import { getConfigurations } from "../../config/config";

describe("End-to-end User CRUD", () => {
  let app: Hono;
  const testBuilder = new TestBuilder();
  const originalBody = {
    firstName: "Jane",
    lastName: "Doe",
  };
  const updatedBody = {
    firstName: "John",
    lastName: "Smith",
  };
  const userId = generateUUID();
  const jwt = generateJWTToken(3600, getConfigurations().authorization.jwtSecretKey, userId);
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
      });
  });

  it("should update user successfully", async () => {
    (
      await testBuilder.request({
        app,
        type: HTTPRequest.PUT,
        route: `api/v1/users/me`,
        requestBody: updatedBody,
        ...authPayload,
      })
    )
      .assertBody({
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
      .assertStatusCode(Status.NoContent)
      .assertResponseText("User Successfully Deleted");

    // delete again
    (
      await testBuilder.request({
        app,
        type: HTTPRequest.DELETE,
        route: `api/v1/users/me`,
        ...authPayload,
      })
    )
      .assertStatusCode(Status.NoContent)
      .assertResponseText("User Successfully Deleted");
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
      .assertError("User not found");

    (
      await testBuilder.request({
        app,
        type: HTTPRequest.PUT,
        route: `api/v1/users/me`,
        requestBody: originalBody,
        ...authPayload,
      })
    )
      .assertStatusCode(Status.NotFound)
      .assertError("User not found");
  });
});
