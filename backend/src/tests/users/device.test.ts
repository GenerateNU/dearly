import { Hono } from "hono";
import { startTestApp } from "../helpers/test-app";
import { TestBuilder } from "../helpers/test-builder";
import { generateJWTFromID, generateUUID } from "../helpers/test-token";
import { HTTPRequest, Status } from "../../constants/http";
import { MOCK_EXPO_TOKEN } from "../helpers/test-constants";

describe("POST and DELETE /users/devices", () => {
  let app: Hono;
  const testBuilder = new TestBuilder();

  const requestBody = {
    name: "Jane Doe",
    username: "janedoe",
    ageGroup: "TEEN",
    mode: "BASIC",
  };
  const jwt = generateJWTFromID(generateUUID());

  beforeAll(async () => {
    app = await startTestApp();
  });

  it("should return 200 if valid expo token for register", async () => {
    // create a user first
    (
      await testBuilder.request({
        app,
        type: HTTPRequest.POST,
        route: "/api/v1/users",
        requestBody: {
          ...requestBody,
        },
        autoAuthorized: false,
        headers: {
          Authorization: `Bearer ${jwt}`,
        },
      })
    )
      .assertStatusCode(Status.Created)
      .getResponseId();

    // register the device token
    (
      await testBuilder.request({
        app,
        type: HTTPRequest.POST,
        route: "/api/v1/users/devices",
        requestBody: {
          expoToken: MOCK_EXPO_TOKEN,
          hi: "world", // irrelevant field
        },
        autoAuthorized: false,
        headers: {
          Authorization: `Bearer ${jwt}`,
        },
      })
    )
      .assertStatusCode(Status.OK)
      .assertArraySize(1)
      .assertBody([MOCK_EXPO_TOKEN]);

    // register device token again and make sure it's not duplicated
    (
      await testBuilder.request({
        app,
        type: HTTPRequest.POST,
        route: "/api/v1/users/devices",
        requestBody: {
          expoToken: MOCK_EXPO_TOKEN,
        },
        autoAuthorized: false,
        headers: {
          Authorization: `Bearer ${jwt}`,
        },
      })
    )
      .assertStatusCode(Status.OK)
      .assertArraySize(1)
      .assertBody([MOCK_EXPO_TOKEN]);
  });

  it("should return 200 if valid expo token for remove", async () => {
    (
      await testBuilder.request({
        app,
        type: HTTPRequest.DELETE,
        route: "/api/v1/users/devices",
        requestBody: {
          expoToken: MOCK_EXPO_TOKEN,
        },
        autoAuthorized: false,
        headers: {
          Authorization: `Bearer ${jwt}`,
        },
      })
    )
      .assertStatusCode(Status.OK)
      .assertArraySize(0)
      .assertBody([]);

    // remove token again and ensure no errors thrown
    (
      await testBuilder.request({
        app,
        type: HTTPRequest.DELETE,
        route: "/api/v1/users/devices",
        requestBody: {
          expoToken: MOCK_EXPO_TOKEN,
        },
        autoAuthorized: false,
        headers: {
          Authorization: `Bearer ${jwt}`,
        },
      })
    )
      .assertStatusCode(Status.OK)
      .assertArraySize(0)
      .assertBody([]);
  });

  it("should return 400 if expo token is invalid", async () => {
    (
      await testBuilder.request({
        app,
        type: HTTPRequest.DELETE,
        route: "/api/v1/users/devices",
        requestBody: {
          expoToken: "12345",
        },
      })
    )
      .assertStatusCode(Status.BadRequest)
      .assertError([
        {
          path: "expoToken",
          message: "Invalid Expo Push Token",
        },
      ]);
  });

  it("should return 404 if user not found", async () => {
    (
      await testBuilder.request({
        app,
        type: HTTPRequest.POST,
        route: "/api/v1/users/devices",
        requestBody: {
          expoToken: MOCK_EXPO_TOKEN,
        },
      })
    ).assertStatusCode(Status.NotFound);
  });
});
