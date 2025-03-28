import { SEARCHED_ALICE } from "./../helpers/test-constants";
import { Hono } from "hono";
import { startTestApp } from "../helpers/test-app";
import { TestBuilder } from "../helpers/test-builder";
import { generateJWTFromID } from "../helpers/test-token";
import { HTTPRequest, Status } from "../../constants/http";
import {
  INVALID_ID_ARRAY,
  POST_ID,
  SEARCHED_BOB,
  USER_ALICE_ID,
  USER_ANA_ID,
  USER_BOB_ID,
} from "../helpers/test-constants";

describe("GET /posts/:id/likes", () => {
  let app: Hono;
  const testBuilder = new TestBuilder();
  const ALICE_JWT = generateJWTFromID(USER_ALICE_ID);
  const BOB_JWT = generateJWTFromID(USER_BOB_ID);
  const ANA_JWT = generateJWTFromID(USER_ANA_ID);
  const BOB = { ...SEARCHED_BOB, lastNudgedAt: undefined };
  const ALICE = { ...SEARCHED_ALICE, lastNudgedAt: undefined };

  beforeAll(async () => {
    app = await startTestApp();
  });

  it("should return 200 and correct users if is member", async () => {
    (
      await testBuilder.request({
        app,
        type: HTTPRequest.GET,
        route: `/api/v1/posts/${POST_ID}/likes`,
        autoAuthorized: false,
        headers: {
          Authorization: `Bearer ${ALICE_JWT}`,
        },
      })
    )
      .assertStatusCode(Status.OK)
      .assertBody([]); // no user who like post yet

    // Bob and Alice like the post
    (
      await testBuilder.request({
        app,
        type: HTTPRequest.PATCH,
        route: `/api/v1/posts/${POST_ID}/likes`,
        autoAuthorized: false,
        headers: {
          Authorization: `Bearer ${ALICE_JWT}`,
        },
      })
    ).assertStatusCode(Status.OK);

    (
      await testBuilder.request({
        app,
        type: HTTPRequest.PATCH,
        route: `/api/v1/posts/${POST_ID}/likes`,
        autoAuthorized: false,
        headers: {
          Authorization: `Bearer ${BOB_JWT}`,
        },
      })
    ).assertStatusCode(Status.OK);

    // retrieve list of users who like the post
    (
      await testBuilder.request({
        app,
        type: HTTPRequest.GET,
        route: `/api/v1/posts/${POST_ID}/likes`,
        autoAuthorized: false,
        headers: {
          Authorization: `Bearer ${BOB_JWT}`,
        },
      })
    )
      .assertStatusCode(Status.OK)
      .assertBody([ALICE, BOB]);
  });

  it("should return 403 if user not member of group", async () => {
    (
      await testBuilder.request({
        app,
        type: HTTPRequest.GET,
        route: `/api/v1/posts/${POST_ID}/likes`,
        autoAuthorized: false,
        headers: {
          Authorization: `Bearer ${ANA_JWT}`,
        },
      })
    )
      .assertStatusCode(Status.Forbidden)
      .assertError("Forbidden");
  });

  it.each([
    ["1", "1", [ALICE]],
    ["1", "2", [BOB]],
    ["1", "3", []],
    ["2", "1", [ALICE, BOB]],
    ["2", "2", []],
    ["3", "1", [ALICE, BOB]],
    ["3", "2", []],
  ])("should return 200 with limit %s and page %s", async (limit, page, expectedBody) => {
    (
      await testBuilder.request({
        app,
        type: HTTPRequest.GET,
        route: `/api/v1/posts/${POST_ID}/likes`,
        queryParams: {
          limit,
          page,
        },
        autoAuthorized: false,
        headers: {
          Authorization: `Bearer ${ALICE_JWT}`,
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
        route: `/api/v1/posts/${POST_ID}/likes`,
        queryParams: {
          limit: "limit",
          page: "page",
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

  it("should return 400 if limit and page non-positive number", async () => {
    (
      await testBuilder.request({
        app,
        type: HTTPRequest.GET,
        route: `/api/v1/posts/${POST_ID}/likes`,
        queryParams: {
          limit: "-1",
          page: "0",
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

  it("should return 200 if a user unlikes the post", async () => {
    // Bob unlikes the post
    (
      await testBuilder.request({
        app,
        type: HTTPRequest.PATCH,
        route: `/api/v1/posts/${POST_ID}/likes`,
        autoAuthorized: false,
        headers: {
          Authorization: `Bearer ${BOB_JWT}`,
        },
      })
    ).assertStatusCode(Status.OK);

    // list of users should only have Alice left
    (
      await testBuilder.request({
        app,
        type: HTTPRequest.GET,
        route: `/api/v1/posts/${POST_ID}/likes`,
        autoAuthorized: false,
        headers: {
          Authorization: `Bearer ${BOB_JWT}`,
        },
      })
    )
      .assertStatusCode(Status.OK)
      .assertBody([ALICE]);
  });

  it.each(
    INVALID_ID_ARRAY.map((id) => [id === null ? "null" : id === undefined ? "undefined" : id, id]),
  )("should return 400 if invalid ID %s", async (id) => {
    (
      await testBuilder.request({
        app,
        type: HTTPRequest.GET,
        route: `/api/v1/posts/${id}/likes`,
      })
    )
      .assertStatusCode(Status.BadRequest)
      .assertError("Invalid ID format");
  });
});
