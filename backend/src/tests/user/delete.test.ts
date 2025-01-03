import { Hono } from "hono";
import { startTestApp } from "../helpers/test-app";
import { TestBuilder } from "../helpers/test-builder";
import { HTTPRequest, Status } from "../../constants/http";
import { generateJWTToken, generateUUID } from "../helpers/test-token";
import { getConfigurations } from "../../config/config";

describe("DELETE /users/me", () => {
  let app: Hono;
  const testBuilder = new TestBuilder();
  const jwt = generateJWTToken(
    3600,
    getConfigurations().authorization.jwtSecretKey,
    generateUUID(),
  );
  const authPayload = {
    autoAuthorized: false,
    headers: {
      Authorization: `Bearer ${jwt}`,
    },
  };
  const requestBody = {
    name: "Jane Doe",
    username: "janedoe",
    ageGroup: "TEEN",
  };

  beforeAll(async () => {
    app = await startTestApp();
  });

  it("should return 200 if user exists", async () => {
    (
      await testBuilder.request({
        app,
        type: HTTPRequest.POST,
        route: "/api/v1/users",
        requestBody,
        ...authPayload,
      })
    ).assertStatusCode(Status.Created);

    (
      await testBuilder.request({
        app,
        type: HTTPRequest.DELETE,
        route: `/api/v1/users/me`,
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
        route: `/api/v1/users/me`,
        ...authPayload,
      })
    )
      .assertStatusCode(Status.OK)
      .assertMessage("Successfully delete user");
  });

  it("should return 200 if user not found", async () => {
    (
      await testBuilder.request({
        app,
        type: HTTPRequest.DELETE,
        route: `/api/v1/users/me`,
      })
    )
      .assertStatusCode(Status.OK)
      .assertMessage("Successfully delete user");
  });
});
