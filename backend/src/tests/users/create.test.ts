import { Hono } from "hono";
import { startTestApp } from "../helpers/test-app";
import { TestBuilder } from "../helpers/test-builder";
import { generateJWTFromID, generateUUID } from "../helpers/test-token";
import { HTTPRequest, Status } from "../../constants/http";
import { MIN_LIMIT } from "../../constants/database";

describe("POST /users", () => {
  let app: Hono;
  const testBuilder = new TestBuilder();
  const requestBody = {
    name: "Jane Doe",
    username: "janedoe",
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
        mode: "BASIC",
        profilePhoto: null,
        timezone: null,
      })
      .assertFieldNotEqual("id", testId);
  });

  const fields = ["name", "username"];
  it.each(fields)("should return 400 if missing %s", async (field) => {
    const requestBody = {
      name: field !== "name" ? "Jane Doe" : undefined,
      username: field !== "username" ? "jdoe" : undefined,
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
            message: `String must contain at least ${MIN_LIMIT} character(s)`,
          },
          {
            path: "username",
            message: `String must contain at least ${MIN_LIMIT} character(s)`,
          },
        ],
      });
  });

  it("should return 400 if invalid mode", async () => {
    (
      await testBuilder.request({
        app,
        type: HTTPRequest.POST,
        route: "/api/v1/users",
        requestBody: {
          name: "jane doe",
          username: "jdoe",
          mode: "EASY",
        },
      })
    )
      .assertStatusCode(Status.BadRequest)
      .assertBody({
        message: "Validation failed",
        errors: [
          {
            message: "Invalid enum value. Expected 'BASIC' | 'ADVANCED', received 'EASY'",
            path: "mode",
          },
        ],
      });
  });

  it("should return 201 with id match id used to encode JWT", async () => {
    const encodeJWTUUID = generateUUID();
    const irrelevantUUID = generateUUID();
    const generatedJWT = generateJWTFromID(encodeJWTUUID);
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
    )
      .assertStatusCode(Status.Conflict)
      .assertError("Username has been taken. Please try another username.");
  });

  it("should return 409 if try to create user with same JWT", async () => {
    const generatedJWT = generateJWTFromID(generateUUID());
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
    ).assertStatusCode(Status.Created);

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
    )
      .assertStatusCode(Status.Conflict)
      .assertError("User already exists. Please try again.");
  });
});
