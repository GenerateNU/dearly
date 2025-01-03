import { Hono } from "hono";
import { startTestApp } from "../helpers/test-app";
import { TestBuilder } from "../helpers/test-builder";
import { generateJWTToken, generateUUID } from "../helpers/test-token";
import { HTTPRequest, Status } from "../../constants/http";
import { Configuration } from "../../types/config";
import { getConfigurations } from "../../config/config";

describe("POST /users", () => {
  let app: Hono;
  const testBuilder = new TestBuilder();
  const config: Configuration = getConfigurations();
  const requestBody = {
    name: "Jane Doe",
    username: "janedoe",
    ageGroup: "TEEN",
    mode: "BASIC",
  };

  beforeAll(async () => {
    app = await startTestApp();
  });

  it("should return 201 if valid payload", async () => {
    const testId = generateUUID();
    const responseId = (
      await testBuilder.request({
        app,
        type: HTTPRequest.POST,
        route: "/api/v1/users",
        requestBody: {
          id: testId, // should be ignored
          hello: "world", // should be ignored
          ...requestBody,
        },
      })
    )
      .assertStatusCode(Status.Created)
      .getResponseId();

    testBuilder
      .assertBody({
        id: responseId,
        ...requestBody,
        deviceTokens: [],
        mode: "BASIC",
        profilePhoto: null,
      })
      .assertFieldNotEqual("id", testId);
  });

  const fields = ["name", "username", "ageGroup"];
  it.each(fields)("should return 400 if missing %s", async (field) => {
    const requestBody = {
      name: field !== "name" ? "Jane Doe" : undefined,
      username: field !== "username" ? "jdoe" : undefined,
      ageGroup: field !== "ageGroup" ? "ADULT" : undefined,
    };

    (
      await testBuilder.request({
        app,
        type: HTTPRequest.POST,
        route: "/api/v1/users",
        requestBody: requestBody,
      })
    )
      .assertBody({
        message: "Validation failed",
        errors: [{ path: field, message: "Required" }],
      })
      .assertStatusCode(Status.BadRequest);
  });

  it("should return 400 if empty field", async () => {
    (
      await testBuilder.request({
        app,
        type: HTTPRequest.POST,
        route: "/api/v1/users",
        requestBody: {
          name: "",
          username: "",
          ageGroup: "TEEN",
        },
      })
    )
      .assertStatusCode(Status.BadRequest)
      .assertBody({
        message: "Validation failed",
        errors: [
          {
            path: "name",
            message: "String must contain at least 1 character(s)",
          },
          {
            path: "username",
            message: "String must contain at least 1 character(s)",
          },
        ],
      });
  });

  it("should return 400 if invalid age group", async () => {
    (
      await testBuilder.request({
        app,
        type: HTTPRequest.POST,
        route: "/api/v1/users",
        requestBody: {
          name: "jane doe",
          username: "jdoe",
          ageGroup: "BABY",
        },
      })
    )
      .assertStatusCode(Status.BadRequest)
      .assertBody({
        message: "Validation failed",
        errors: [
          {
            message:
              "Invalid enum value. Expected 'CHILD' | 'TEEN' | 'ADULT' | 'SENIOR', received 'BABY'",
            path: "ageGroup",
          },
        ],
      });
  });

  it("should return 201 with id match id used to encode JWT", async () => {
    const encodeJWTUUID = generateUUID();
    const irrelevantUUID = generateUUID();
    const generatedJWT = generateJWTToken(3600, config.authorization.jwtSecretKey, encodeJWTUUID);
    (
      await testBuilder.request({
        app,
        type: HTTPRequest.POST,
        route: "/api/v1/users",
        requestBody: {
          id: irrelevantUUID,
          name: "Jane Doe",
          username: "jd",
          ageGroup: "TEEN",
        },
        autoAuthorized: false,
        headers: {
          Authorization: `Bearer ${generatedJWT}`,
        },
      })
    )
      .assertStatusCode(Status.Created)
      .assertFieldNotEqual("id", irrelevantUUID)
      .assertField("id", encodeJWTUUID);
  });

  it("should return 409 if username already exists", async () => {
    (
      await testBuilder.request({
        app,
        type: HTTPRequest.POST,
        route: "/api/v1/users",
        requestBody,
      })
    ).assertStatusCode(Status.Conflict);
  });

  it("should return 409 if try to create user with same JWT", async () => {
    const generatedJWT = generateJWTToken(3600, config.authorization.jwtSecretKey, generateUUID());
    (
      await testBuilder.request({
        app,
        type: HTTPRequest.POST,
        route: "/api/v1/users",
        requestBody: {
          name: "Jane",
          username: "jane",
          ageGroup: "TEEN",
        },
        autoAuthorized: false,
        headers: {
          Authorization: `Bearer ${generatedJWT}`,
        },
      })
    ).assertStatusCode(201);

    // create a user that already exists (same JWT)
    (
      await testBuilder.request({
        app,
        type: HTTPRequest.POST,
        route: "/api/v1/users",
        requestBody: {
          name: "John",
          username: "john",
          ageGroup: "ADULT",
        },
        autoAuthorized: false,
        headers: {
          Authorization: `Bearer ${generatedJWT}`,
        },
      })
    ).assertStatusCode(409);
  });
});
