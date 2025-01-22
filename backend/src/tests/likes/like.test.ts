import {
  USER_ANA_ID,
  USER_BOB_ID,
  USER_ALICE_ID,
  INVALID_ID_ARRAY,
  POST_ID,
} from "../helpers/test-constants";
import { Hono } from "hono";
import { startTestApp } from "../helpers/test-app";
import { TestBuilder } from "../helpers/test-builder";
import { generateJWTFromID, generateUUID } from "../helpers/test-token";
import { HTTPRequest, Status } from "../../constants/http";

describe("PATCH /posts/:id/likes", () => {
  let app: Hono;
  const testBuilder = new TestBuilder();

  const ALICE_JWT = generateJWTFromID(USER_ALICE_ID);
  const BOB_JWT = generateJWTFromID(USER_BOB_ID);
  const ANA_JWT = generateJWTFromID(USER_ANA_ID);

  beforeAll(async () => {
    app = await startTestApp();
  });

  it("should return 200 if like is toggled successfully for post owner", async () => {
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
    )
      .assertStatusCode(Status.OK)
      .assertMessage("Successfully like post");

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
    )
      .assertStatusCode(Status.OK)
      .assertMessage("Successfully unlike post");
  });

  it("should return 200 if like is toggled successfully for member", async () => {
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
    )
      .assertStatusCode(Status.OK)
      .assertMessage("Successfully like post");

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
    )
      .assertStatusCode(Status.OK)
      .assertMessage("Successfully unlike post");
  });

  it("should return 403 if post exists but user not in group", async () => {
    (
      await testBuilder.request({
        app,
        type: HTTPRequest.PATCH,
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

  it("should return 404 if post not found", async () => {
    (
      await testBuilder.request({
        app,
        type: HTTPRequest.PATCH,
        route: `/api/v1/posts/${generateUUID()}/likes`,
        autoAuthorized: false,
        headers: {
          Authorization: `Bearer ${ALICE_JWT}`,
        },
      })
    )
      .assertStatusCode(Status.NotFound)
      .assertError("Post does not exist.");
  });

  it.each(
    INVALID_ID_ARRAY.map((id) => [id === null ? "null" : id === undefined ? "undefined" : id, id]),
  )("should return 400 if invalid ID %s", async (id) => {
    (
      await testBuilder.request({
        app,
        type: HTTPRequest.PATCH,
        route: `/api/v1/posts/${id}/likes`,
      })
    )
      .assertStatusCode(Status.BadRequest)
      .assertError("Invalid ID format");
  });
});
