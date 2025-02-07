import { USER_ANA_ID, USER_ALICE_ID, POST_ID } from "../helpers/test-constants";
import { Hono } from "hono";
import { startTestApp } from "../helpers/test-app";
import { TestBuilder } from "../helpers/test-builder";
import { generateJWTFromID } from "../helpers/test-token";
import { HTTPRequest, Status } from "../../constants/http";
import { randomUUIDv7 } from "bun";

describe("GET /posts/:id/comments", () => {
  let app: Hono;
  const testBuilder = new TestBuilder();

  const ALICE_JWT = generateJWTFromID(USER_ALICE_ID);
  const ANA_JWT = generateJWTFromID(USER_ANA_ID);

  const goodRequestBody = {
    content: "i like this photo",
  };

  beforeAll(async () => {
    app = await startTestApp();
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
        route: `/api/v1/posts/${randomUUIDv7()}/comments`,
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
});
