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
          firstName: "Jane",
          lastName: "Doe",
        },
      })
    )
      .assertStatusCode(Status.Created)
      .getResponseId();

    testBuilder
      .assertBody({
        id: responseId,
        firstName: "Jane",
        lastName: "Doe",
      })
      .assertFieldNotEqual("id", testId);
  });

  const fields = ["firstName", "lastName"];
  it.each(fields)("should return 400 if missing %s", async (field) => {
    const requestBody = {
      firstName: field !== "firstName" ? "Jane" : undefined,
      lastName: field !== "lastName" ? "Doe" : undefined,
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
          firstName: "",
          lastName: "Doe",
        },
      })
    )
      .assertStatusCode(Status.BadRequest)
      .assertBody({
        message: "Validation failed",
        errors: [
          {
            path: "firstName",
            message: "String must contain at least 1 character(s)",
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
          firstName: "Jane",
          lastName: "Doe",
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

  it("should return 409 if try to create same user", async () => {
    const generatedJWT = generateJWTToken(3600, config.authorization.jwtSecretKey, generateUUID());
    (
      await testBuilder.request({
        app,
        type: HTTPRequest.POST,
        route: "/api/v1/users",
        requestBody: {
          firstName: "Jane",
          lastName: "Doe",
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
          firstName: "John",
          lastName: "Smith",
        },
        autoAuthorized: false,
        headers: {
          Authorization: `Bearer ${generatedJWT}`,
        },
      })
    ).assertStatusCode(409);
  });
});
