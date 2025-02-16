import { Hono } from "hono";
import { startTestApp } from "../helpers/test-app";
import { TestBuilder } from "../helpers/test-builder";
import { generateJWTFromID } from "../helpers/test-token";
import { HTTPRequest, Status } from "../../constants/http";
import { USER_ALICE_ID, NOTIFICATIONS_MOCK } from "../helpers/test-constants";

describe("GET /users/notifications", () => {
  let app: Hono;
  const testBuilder = new TestBuilder();
  const aliceJWT = generateJWTFromID(USER_ALICE_ID);

  beforeAll(async () => {
    app = await startTestApp();
  });

  it("should return 200 with one notification", async () => {
    (
      await testBuilder.request({
        app,
        type: HTTPRequest.GET,
        route: `/api/v1/users/notifications`,
        queryParams: {
          limit: "1",
          page: "1",
        },
        autoAuthorized: false,
        headers: {
          Authorization: `Bearer ${aliceJWT}`,
        },
      })
    )
      .assertBody(NOTIFICATIONS_MOCK[0])
      .assertStatusCode(Status.OK);
  });

  it("should return 200 with all notifications", async () => {
    (
      await testBuilder.request({
        app,
        type: HTTPRequest.GET,
        route: `/api/v1/users/notifications`,
        autoAuthorized: false,
        headers: {
          Authorization: `Bearer ${aliceJWT}`,
        },
      })
    )
      .assertBody(NOTIFICATIONS_MOCK)
      .assertStatusCode(Status.OK);
  });

  // Failing tests for /users/notifications endpoint
  it("should return 401 when no Authorization header is provided", async () => {
    (
      await testBuilder.request({
        app,
        type: HTTPRequest.GET,
        route: `/api/v1/users/notifications`,
        queryParams: {
          limit: "1",
          page: "1",
        },
        autoAuthorized: false,
        // no authorization header
      })
    ).assertStatusCode(Status.Unauthorized);
  });

  it("should return 401 when an invalid Authorization token is provided", async () => {
    (
      await testBuilder.request({
        app,
        type: HTTPRequest.GET,
        route: `/api/v1/users/notifications`,
        queryParams: {
          limit: "1",
          page: "1",
        },
        autoAuthorized: false,
        headers: {
          Authorization: "Bearer invalid.token",
        },
      })
    ).assertStatusCode(Status.Unauthorized);
  });

  it("should return 400 when query parameters are invalid", async () => {
    (
      await testBuilder.request({
        app,
        type: HTTPRequest.GET,
        route: `/api/v1/users/notifications`,
        queryParams: {
          limit: "not-a-number",
        },
        autoAuthorized: false,
        headers: {
          Authorization: `Bearer ${aliceJWT}`,
        },
      })
    ).assertStatusCode(Status.BadRequest);
  });
});
