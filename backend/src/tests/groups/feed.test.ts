import {
  DEARLY_GROUP_ID,
  GENERATE_GROUP_ID,
  INVALID_ID_ARRAY,
  MOCK_MEDIA_WITH_URL,
  POST_MOCK,
  USER_ALICE_ID,
  USER_ANA_ID,
  USER_BILL_ID,
  USER_BOB_ID,
} from "./../helpers/test-constants";
import { Hono } from "hono";
import { startTestApp } from "../helpers/test-app";
import { TestBuilder } from "../helpers/test-builder";
import { generateJWTFromID, generateUUID } from "../helpers/test-token";
import { HTTPRequest, Status } from "../../constants/http";

describe("GET /groups/:id/feed", () => {
  let app: Hono;
  const testBuilder = new TestBuilder();
  const post = {
    ...POST_MOCK[0],
    createdAt: POST_MOCK[0]!.createdAt?.toISOString(),
    media: MOCK_MEDIA_WITH_URL,
    comments: 1,
    isLiked: false,
    likes: 0,
    location: null,
    profilePhoto: null,
    username: "alice123",
    name: "Alice",
  };

  beforeAll(async () => {
    app = await startTestApp();
  });

  it("should return 200 if group has posts with date specified", async () => {
    (
      await testBuilder.request({
        app,
        type: HTTPRequest.GET,
        route: `/api/v1/groups/${DEARLY_GROUP_ID}/feed`,
        autoAuthorized: false,
        headers: {
          Authorization: `Bearer ${generateJWTFromID(USER_BOB_ID)}`,
        },
        queryParams: {
          date: "1969-12-31",
        },
      })
    )
      .assertStatusCode(Status.OK)
      .assertBody([post]);
  });

  it("should return 200 if group has posts but different date specified", async () => {
    (
      await testBuilder.request({
        app,
        type: HTTPRequest.GET,
        route: `/api/v1/groups/${DEARLY_GROUP_ID}/feed`,
        autoAuthorized: false,
        headers: {
          Authorization: `Bearer ${generateJWTFromID(USER_ALICE_ID)}`,
        },
        queryParams: {
          date: "2025-01-23",
          limit: "1",
          page: "1",
        },
      })
    )
      .assertStatusCode(Status.OK)
      .assertBody([]);
  });

  it.each([
    ["1", "1", [post]],
    ["1", "2", []],
    ["2", "1", [post]],
    ["2", "2", []],
  ])(
    "should return 200 if no date specified and limit %s and page %s",
    async (limit, page, expectedBody) => {
      (
        await testBuilder.request({
          app,
          type: HTTPRequest.GET,
          route: `/api/v1/groups/${DEARLY_GROUP_ID}/feed`,
          queryParams: {
            limit,
            page,
          },
          autoAuthorized: false,
          headers: {
            Authorization: `Bearer ${generateJWTFromID(USER_ALICE_ID)}`,
          },
        })
      )
        .assertStatusCode(Status.OK)
        .assertBody(expectedBody);
    },
  );

  it("should return 200 if group has no posts", async () => {
    (
      await testBuilder.request({
        app,
        type: HTTPRequest.GET,
        route: `/api/v1/groups/${GENERATE_GROUP_ID}/feed`,
        autoAuthorized: false,
        headers: {
          Authorization: `Bearer ${generateJWTFromID(USER_BILL_ID)}`,
        },
      })
    )
      .assertStatusCode(Status.OK)
      .assertBody([]);
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

  it("should return 403 if user not member of group", async () => {
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

  it.each(
    INVALID_ID_ARRAY.map((id) => [id === null ? "null" : id === undefined ? "undefined" : id, id]),
  )("should return 400 if invalid ID %s", async (id) => {
    (
      await testBuilder.request({
        app,
        type: HTTPRequest.GET,
        route: `/api/v1/groups/${id}/feed`,
      })
    )
      .assertStatusCode(Status.BadRequest)
      .assertError("Invalid ID format");
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

  it.each(["bad", "2024-12-35", "2024-13-12", "12:30:00Z", "0", "1", "-1"])(
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
