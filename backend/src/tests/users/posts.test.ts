import { Hono } from "hono";
import { startTestApp } from "../helpers/test-app";
import { TestBuilder } from "../helpers/test-builder";
import { generateJWTFromID } from "../helpers/test-token";
import { HTTPRequest, Status } from "../../constants/http";
import {
  MOCK_MEDIA_WITH_URL,
  POST_MOCK,
  USER_ALICE_ID,
  USER_BILL_ID,
  USER_BOB_ID,
} from "../helpers/test-constants";

describe("GET /users/posts", () => {
  let app: Hono;
  const testBuilder = new TestBuilder();
  const post = {
    ...POST_MOCK[0],
    media: MOCK_MEDIA_WITH_URL,
    createdAt: POST_MOCK[0]!.createdAt?.toISOString(),
    comments: 0,
    isLiked: false,
    likes: 0,
    location: null,
    profilePhoto: null,
  };

  beforeAll(async () => {
    app = await startTestApp();
  });

  it("should return 200 if user not found", async () => {
    (
      await testBuilder.request({
        app,
        type: HTTPRequest.GET,
        route: `/api/v1/users/posts`,
        autoAuthorized: false,
        headers: {
          Authorization: `Bearer ${generateJWTFromID()}`,
        },
      })
    )
      .assertStatusCode(Status.OK)
      .assertBody([]);
  });

  it.each([
    [USER_BOB_ID, []],
    [USER_BILL_ID, []],
    [USER_ALICE_ID, [post]],
  ])("should return 200 if for user with ID %s", async (id, expectedPosts) => {
    (
      await testBuilder.request({
        app,
        type: HTTPRequest.GET,
        route: `/api/v1/users/posts`,
        autoAuthorized: false,
        headers: {
          Authorization: `Bearer ${generateJWTFromID(id)}`,
        },
      })
    )
      .assertStatusCode(Status.OK)
      .assertBody(expectedPosts);
  });

  it.each([
    ["1", "1", [post]],
    ["1", "2", []],
    ["1", "3", []],
    ["2", "1", [post]],
    ["2", "2", []],
  ])("should return 200 with limit %s and page %s", async (limit, page, expectedBody) => {
    (
      await testBuilder.request({
        app,
        type: HTTPRequest.GET,
        route: `/api/v1/users/posts`,
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
  });

  it("should return 400 if limit and page not number", async () => {
    (
      await testBuilder.request({
        app,
        type: HTTPRequest.GET,
        route: `/api/v1/users/posts`,
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

  it("should return 400 if limit and page is not positive", async () => {
    (
      await testBuilder.request({
        app,
        type: HTTPRequest.GET,
        route: `/api/v1/users/posts`,
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
