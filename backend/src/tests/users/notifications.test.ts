import { Hono } from "hono";
import { startTestApp } from "../helpers/test-app";
import { TestBuilder } from "../helpers/test-builder";
import { generateJWTFromID } from "../helpers/test-token";
import { HTTPRequest, Status } from "../../constants/http";
import { NOTIFICATIONS_MOCK, USER_BOB_ID } from "../helpers/test-constants";

describe("GET /users/notifications", () => {
  let app: Hono;
  const testBuilder = new TestBuilder();
  const bobJWT = generateJWTFromID(USER_BOB_ID);
  const NOTIFICATIONS = NOTIFICATIONS_MOCK.map((notif) => ({
    ...notif,
    createdAt: notif.createdAt.toISOString(),
  }));
  const NOTFICATION_WITH_PROFILE = { ...NOTIFICATIONS[1], profilePhoto: "https://mocked-url.com" };

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
          Authorization: `Bearer ${bobJWT}`,
        },
      })
    )
      .assertBody([NOTIFICATIONS[0]])
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
          Authorization: `Bearer ${bobJWT}`,
        },
        queryParams: {
          limit: "10",
          page: "1",
        },
      })
    )
      .assertBody([NOTIFICATIONS[0], NOTFICATION_WITH_PROFILE, NOTIFICATIONS[2]])
      .assertStatusCode(Status.OK);
  });

  // not OK tests for /users/notifications endpoint
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
    )
      .assertStatusCode(Status.Unauthorized)
      .assertError("Unauthorized");
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
          Authorization: `Bearer ${bobJWT}`,
        },
      })
    ).assertStatusCode(Status.BadRequest);
  });

  it("should return 400 when pagination params are invalid", async () => {
    (
      await testBuilder.request({
        app,
        type: HTTPRequest.GET,
        route: `/api/v1/users/notifications`,
        queryParams: {
          page: "-1",
          limit: "-1",
        },
        autoAuthorized: false,
        headers: {
          Authorization: `Bearer ${bobJWT}`,
        },
      })
    )
      .assertStatusCode(Status.BadRequest)
      .assertError([
        {
          message: "Limit must be a positive number",
          path: "limit",
        },
        {
          message: "Page must be a positive number",
          path: "page",
        },
      ]);
  });

  it.each([
    ["1", "1", [NOTIFICATIONS[0]]],
    ["1", "2", [NOTFICATION_WITH_PROFILE]],
    ["1", "3", [NOTIFICATIONS[2]]],
    ["2", "1", [NOTIFICATIONS[0], NOTFICATION_WITH_PROFILE]],
    ["3", "1", [NOTIFICATIONS[0], NOTFICATION_WITH_PROFILE, NOTIFICATIONS[2]]],
    ["2", "2", [NOTIFICATIONS[2]]],
  ])("should return 200 with limit %s and page %s", async (limit, page, expectedBody) => {
    (
      await testBuilder.request({
        app,
        type: HTTPRequest.GET,
        route: `/api/v1/users/notifications`,
        queryParams: {
          limit,
          page,
        },
        autoAuthorized: false,
        headers: {
          Authorization: `Bearer ${bobJWT}`,
        },
      })
    )
      .assertStatusCode(Status.OK)
      .assertBody(expectedBody);
  });
});
