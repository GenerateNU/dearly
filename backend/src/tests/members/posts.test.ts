import { Hono } from "hono";
import { startTestApp } from "../helpers/test-app";
import { TestBuilder } from "../helpers/test-builder";
import { generateJWTFromID, generateUUID } from "../helpers/test-token";
import { HTTPRequest, Status } from "../../constants/http";
import {
  DEARLY_GROUP_ID,
  MOCK_MEDIA_WITH_URL,
  POST_MOCK,
  USER_ALICE_ID,
  USER_BOB_ID,
  INVALID_ID_ARRAY,
  USER_ANA_ID,
} from "../helpers/test-constants";

describe("GET /groups/:id/members/:userId/posts", () => {
  let app: Hono;
  const testBuilder = new TestBuilder();
  const post = {
    ...POST_MOCK[0],
    media: MOCK_MEDIA_WITH_URL,
    createdAt: POST_MOCK[0]!.createdAt?.toISOString(),
    comments: 1,
    isLiked: false,
    likes: 0,
    location: null,
    profilePhoto: null,
  };

  beforeAll(async () => {
    app = await startTestApp();
  });

  it("should return 404 if group not found", async () => {
    (
      await testBuilder.request({
        app,
        type: HTTPRequest.GET,
        route: `/api/v1/groups/${generateUUID()}/members/${USER_ALICE_ID}/posts`,
        autoAuthorized: false,
        headers: {
          Authorization: `Bearer ${generateJWTFromID()}`,
        },
      })
    )
      .assertStatusCode(Status.NotFound)
      .assertError("Group does not exist.");
  });

  it("should return 403 if viewer is not member of group", async () => {
    (
      await testBuilder.request({
        app,
        type: HTTPRequest.GET,
        route: `/api/v1/groups/${DEARLY_GROUP_ID}/members/${USER_ALICE_ID}/posts`,
        autoAuthorized: false,
        headers: {
          Authorization: `Bearer ${generateJWTFromID(USER_ANA_ID)}`,
        },
      })
    ).assertStatusCode(Status.Forbidden);
  });

  it("should return 404 if user does not exist", async () => {
    (
      await testBuilder.request({
        app,
        type: HTTPRequest.GET,
        route: `/api/v1/groups/${DEARLY_GROUP_ID}/members/${generateUUID()}/posts`,
        autoAuthorized: false,
        headers: {
          Authorization: `Bearer ${generateJWTFromID(USER_ALICE_ID)}`,
        },
      })
    )
      .assertStatusCode(Status.NotFound)
      .assertError("User does not exist.");
  });

  it.each([
    [USER_BOB_ID, []],
    [USER_ALICE_ID, [post]],
  ])("should return 200 if user views their own posts in a group", async (id, expectedPosts) => {
    (
      await testBuilder.request({
        app,
        type: HTTPRequest.GET,
        route: `/api/v1/groups/${DEARLY_GROUP_ID}/members/${id}/posts`,
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
    [USER_BOB_ID, USER_ALICE_ID, [post]],
    [USER_ALICE_ID, USER_BOB_ID, []],
  ])(
    "should return 200 if user views their own posts in a group",
    async (viewer, viewee, expectedPosts) => {
      (
        await testBuilder.request({
          app,
          type: HTTPRequest.GET,
          route: `/api/v1/groups/${DEARLY_GROUP_ID}/members/${viewee}/posts`,
          autoAuthorized: false,
          headers: {
            Authorization: `Bearer ${generateJWTFromID(viewer)}`,
          },
        })
      )
        .assertStatusCode(Status.OK)
        .assertBody(expectedPosts);
    },
  );

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
        route: `/api/v1/groups/${DEARLY_GROUP_ID}/members/${USER_ALICE_ID}/posts`,
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
        route: `/api/v1/groups/${DEARLY_GROUP_ID}/members/${USER_ALICE_ID}/posts`,
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
        route: `/api/v1/groups/${DEARLY_GROUP_ID}/members/${USER_ALICE_ID}/posts`,
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

  it.each(
    INVALID_ID_ARRAY.map((id) => [id === null ? "null" : id === undefined ? "undefined" : id, id]),
  )("should return 400 if invalid groupId %s", async (id) => {
    (
      await testBuilder.request({
        app,
        type: HTTPRequest.GET,
        route: `/api/v1/groups/${id}/members/${USER_ALICE_ID}/posts`,
      })
    )
      .assertStatusCode(Status.BadRequest)
      .assertError("Invalid ID format");
  });

  it.each(
    INVALID_ID_ARRAY.map((id) => [id === null ? "null" : id === undefined ? "undefined" : id, id]),
  )("should return 400 if invalid userId %s", async (id) => {
    (
      await testBuilder.request({
        app,
        type: HTTPRequest.GET,
        route: `/api/v1/groups/${DEARLY_GROUP_ID}/members/${id}/posts`,
      })
    )
      .assertStatusCode(Status.BadRequest)
      .assertError("Invalid ID format");
  });
});
