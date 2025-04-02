import { USER_ANA_ID, USER_ALICE_ID, POST_ID, USER_BOB_ID } from "../helpers/test-constants";
import { Hono } from "hono";
import { startTestApp } from "../helpers/test-app";
import { TestBuilder } from "../helpers/test-builder";
import { generateJWTFromID } from "../helpers/test-token";
import { HTTPRequest, Status } from "../../constants/http";
import { generateUUID } from "../helpers/test-token";

describe("GET /posts/:id/comments", () => {
  let app: Hono;
  const testBuilder = new TestBuilder();

  const ALICE_JWT = generateJWTFromID(USER_ALICE_ID);
  const ANA_JWT = generateJWTFromID(USER_ANA_ID);

  const goodRequestBody = {
    content: "i like this photo",
  };

  const BOB_COMMENT = {
    content: "amazing photos!",
    userId: USER_BOB_ID,
    postId: POST_ID,
  };

  const ALICE_COMMENT = {
    content: "i like this photo",
    userId: USER_ALICE_ID,
    postId: POST_ID,
  };

  beforeEach(async () => {
    app = await startTestApp();
  });

  it.each([
    ["1", "1", [ALICE_COMMENT]],
    ["1", "2", [BOB_COMMENT]],
    ["1", "3", []],
    ["1", "4", []],
    ["2", "1", [ALICE_COMMENT, BOB_COMMENT]],
    ["2", "2", []],
  ])("should return 200 with limit %s and page %s", async (limit, page, expectedBody) => {
    await testBuilder.request({
      app,
      type: HTTPRequest.POST,
      route: `/api/v1/posts/${POST_ID}/comments`,
      requestBody: {
        ...goodRequestBody,
      },
      autoAuthorized: false,
      headers: {
        Authorization: `Bearer ${ALICE_JWT}`,
      },
    });
    (
      await testBuilder.request({
        app,
        type: HTTPRequest.GET,
        route: `/api/v1/posts/${POST_ID}/comments`,
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
      .assertFieldsArray(expectedBody);
  });

  it("should return 200 if comments are successfully fetched", async () => {
    (
      await testBuilder.request({
        app,
        type: HTTPRequest.GET,
        route: `/api/v1/posts/${POST_ID}/comments`,
        autoAuthorized: false,
        headers: {
          Authorization: `Bearer ${ALICE_JWT}`,
        },
      })
    )
      .assertStatusCode(Status.OK)
      .assertArraySize(1);
  });

  it("should return 200 if comment is added and then comments are successfully fetched", async () => {
    await testBuilder.request({
      app,
      type: HTTPRequest.POST,
      route: `/api/v1/posts/${POST_ID}/comments`,
      requestBody: {
        ...goodRequestBody,
      },
      autoAuthorized: false,
      headers: {
        Authorization: `Bearer ${ALICE_JWT}`,
      },
    });
    (
      await testBuilder.request({
        app,
        type: HTTPRequest.GET,
        route: `/api/v1/posts/${POST_ID}/comments`,
        autoAuthorized: false,
        headers: {
          Authorization: `Bearer ${ALICE_JWT}`,
        },
      })
    )
      .assertStatusCode(Status.OK)
      .assertArraySize(2);
  });

  it("should return 400 if the id is malformed", async () => {
    (
      await testBuilder.request({
        app,
        type: HTTPRequest.GET,
        route: `/api/v1/posts/null/comments`,
        autoAuthorized: false,
        headers: {
          Authorization: `Bearer ${ALICE_JWT}`,
        },
      })
    ).assertStatusCode(Status.BadRequest);
  });

  it("should return 404 if post does not exist", async () => {
    (
      await testBuilder.request({
        app,
        type: HTTPRequest.GET,
        route: `/api/v1/posts/${generateUUID()}/comments`,
        autoAuthorized: false,
        headers: {
          Authorization: `Bearer ${ALICE_JWT}`,
        },
      })
    ).assertStatusCode(Status.NotFound);
  });

  it("should return 403 if the post is not under the group the user is in", async () => {
    (
      await testBuilder.request({
        app,
        type: HTTPRequest.GET,
        route: `/api/v1/posts/${POST_ID}/comments`,
        autoAuthorized: false,
        headers: {
          Authorization: `Bearer ${ANA_JWT}`,
        },
      })
    ).assertStatusCode(Status.Forbidden);
  });

  it("should return 400 if limit is not valid", async () => {
    (
      await testBuilder.request({
        app,
        type: HTTPRequest.GET,
        route: `/api/v1/posts/${POST_ID}/comments?limit=-1`,
        autoAuthorized: false,
        headers: {
          Authorization: `Bearer ${ALICE_JWT}`,
        },
      })
    ).assertStatusCode(Status.BadRequest);
  });

  it("should return 400 if page is not valid", async () => {
    (
      await testBuilder.request({
        app,
        type: HTTPRequest.GET,
        route: `/api/v1/posts/${POST_ID}/comments?page=-1`,
        autoAuthorized: false,
        headers: {
          Authorization: `Bearer ${ALICE_JWT}`,
        },
      })
    ).assertStatusCode(Status.BadRequest);
  });

  it("should return 400 if both page and limit is not valid", async () => {
    (
      await testBuilder.request({
        app,
        type: HTTPRequest.GET,
        route: `/api/v1/posts/${POST_ID}/comments?page=-1&limit=-1`,
        autoAuthorized: false,
        headers: {
          Authorization: `Bearer ${ALICE_JWT}`,
        },
      })
    ).assertStatusCode(Status.BadRequest);
  });

  it("should return 404 if the post is not found", async () => {
    (
      await testBuilder.request({
        app,
        type: HTTPRequest.GET,
        route: `/api/v1/posts/${generateUUID()}/comments`,
        autoAuthorized: false,
        headers: {
          Authorization: `Bearer ${ALICE_JWT}`,
        },
      })
    ).assertStatusCode(Status.NotFound);
  });
});
