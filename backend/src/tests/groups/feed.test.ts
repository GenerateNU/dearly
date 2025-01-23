import { DEARLY_GROUP_ID, USER_ALICE_ID, USER_ANA_ID } from "./../helpers/test-constants";
import { Hono } from "hono";
import { startTestApp } from "../helpers/test-app";
import { TestBuilder } from "../helpers/test-builder";
import { generateJWTFromID, generateUUID } from "../helpers/test-token";
import { HTTPRequest, Status } from "../../constants/http";

describe("GET /groups/:id/posts", () => {
  let app: Hono;
  const testBuilder = new TestBuilder();

  beforeAll(async () => {
    app = await startTestApp();
  });

  it("should return 404 if group not found", async () => {
    (
      await testBuilder.request({
        app,
        type: HTTPRequest.GET,
        route: `/api/v1/groups/${generateUUID()}/feed`,
        autoAuthorized: false,
        headers: {
          Authorization: `Bearer ${generateJWTFromID()}`,
        },
      })
    ).assertStatusCode(Status.NotFound);
  });

  it("should return 403 if user not member", async () => {
    (
      await testBuilder.request({
        app,
        type: HTTPRequest.GET,
        route: `/api/v1/groups/${DEARLY_GROUP_ID}/feed`,
        autoAuthorized: false,
        headers: {
          Authorization: `Bearer ${generateJWTFromID(USER_ANA_ID)}`,
        },
      })
    ).assertStatusCode(Status.Forbidden);
  });

  it("should return 400 if limit and page not number", async () => {
    (
      await testBuilder.request({
        app,
        type: HTTPRequest.GET,
        route: `/api/v1/groups/${DEARLY_GROUP_ID}/feed`,
        queryParams: {
          limit: "limit",
          page: "page",
        },
        autoAuthorized: false,
        headers: {
          Authorization: `Bearer ${generateJWTFromID(USER_ALICE_ID)}`,
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

  it.each(["bad", "2024-12-35", "12:30:00Z", "0", "1", "-1"])(
    "should return 400 if bad value %s for date",
    async (badValue) => {
      (
        await testBuilder.request({
          app,
          type: HTTPRequest.GET,
          route: `/api/v1/groups/${DEARLY_GROUP_ID}/feed`,
          queryParams: {
            date: badValue,
          },
          autoAuthorized: false,
          headers: {
            Authorization: `Bearer ${generateJWTFromID(USER_ALICE_ID)}`,
          },
        })
      )
        .assertStatusCode(Status.BadRequest)
        .assertError([
          {
            message: "Invalid date. Please follow the format YYYY-MM-DD.",
            path: "date",
          },
        ]);
    },
  );

  it("should return 400 if limit and page is not positive", async () => {
    (
      await testBuilder.request({
        app,
        type: HTTPRequest.GET,
        route: `/api/v1/groups/${DEARLY_GROUP_ID}/feed`,
        queryParams: {
          limit: "0",
          page: "-1",
        },
        autoAuthorized: false,
        headers: {
          Authorization: `Bearer ${generateJWTFromID(USER_ALICE_ID)}`,
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
});
