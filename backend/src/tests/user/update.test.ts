import { Hono } from "hono";
import { startTestApp } from "../helpers/test-app";
import { TestBuilder } from "../helpers/test-builder";
import { generateJWTToken, generateUUID } from "../helpers/test-token";
import { HTTPRequest, Status } from "../../constants/http";
import { getConfigurations } from "../../config/config";

describe("PUT /users/me", () => {
  let app: Hono;
  const testBuilder = new TestBuilder();
  const requestBody = {
    name: "Jane Doe",
    username: "janedoe",
    mode: "BASIC",
    notificationsEnabled: false,
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

  it("should return 200 if user exists", async () => {
    (
      await testBuilder.request({
        app,
        type: HTTPRequest.POST,
        route: "/api/v1/users",
        requestBody,
        ...authPayload,
      })
    )
      .assertStatusCode(Status.Created)
      .assertFields({
        name: "Jane Doe",
        username: "janedoe",
      });

    const irrelevantID = generateUUID();

    (
      await testBuilder.request({
        app,
        type: HTTPRequest.PUT,
        route: `/api/v1/users/me`,
        requestBody: {
          id: irrelevantID, // ignored field
          name: "John Smith",
          mode: "BASIC",
        },
        ...authPayload,
      })
    )
      .assertFields({
        name: "John Smith",
        username: "janedoe",
        mode: "BASIC",
        id: userId,
      })
      .assertStatusCode(Status.OK)
      .assertFieldNotEqual("id", irrelevantID);
  });

  it("should return 404 if user not found", async () => {
    (
      await testBuilder.request({
        app,
        type: HTTPRequest.PUT,
        route: `/api/v1/users/me`,
        requestBody,
      })
    )
      .assertStatusCode(Status.NotFound)
      .assertError("User not found");
  });
});
