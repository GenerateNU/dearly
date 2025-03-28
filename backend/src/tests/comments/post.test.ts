import { USER_ALICE_ID, POST_ID, USER_ANA_ID } from "../helpers/test-constants";
import { Hono } from "hono";
import { startTestApp } from "../helpers/test-app";
import { TestBuilder } from "../helpers/test-builder";
import { generateJWTFromID } from "../helpers/test-token";
import { HTTPRequest, Status } from "../../constants/http";
import { generateUUID } from "../helpers/test-token";

describe("POST /posts/:id/comments", () => {
  let app: Hono;
  const testBuilder = new TestBuilder();
  const ALICE_JWT = generateJWTFromID(USER_ALICE_ID);
  const ANA_JWT = generateJWTFromID(USER_ANA_ID);
  const goodRequestBody = {
    content: "i like this photo",
  };
  const goodRequestBody2 = {
    voiceMemo: generateUUID(),
  };
  const badRequestBody = {};

  const badRequestBody2 = {
    voiceMemo: generateUUID(),
    content: "hiii",
  };

  beforeAll(async () => {
    app = await startTestApp();
  });

  it("should return 200 if successfully added comment to post with just text", async () => {
    (
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
      })
    )
      .assertFieldExists("userId")
      .assertFieldExists("createdAt")
      .assertStatusCode(Status.Created)
      .assertFields({
        content: goodRequestBody.content,
        userId: USER_ALICE_ID,
        postId: POST_ID,
      });
  });

  it("should return 200 if successfully added comment to post with a voice memo", async () => {
    (
      await testBuilder.request({
        app,
        type: HTTPRequest.POST,
        route: `/api/v1/posts/${POST_ID}/comments`,
        requestBody: {
          ...goodRequestBody2,
        },
        autoAuthorized: false,
        headers: {
          Authorization: `Bearer ${ALICE_JWT}`,
        },
      })
    )
      .assertFieldExists("userId")
      .assertFieldExists("createdAt")
      .assertStatusCode(Status.Created)
      .assertFields({
        voiceMemo: goodRequestBody2.voiceMemo,
        userId: USER_ALICE_ID,
        postId: POST_ID,
      });
  });

  it("should return 400 if comment does not have voice memo or text", async () => {
    (
      await testBuilder.request({
        app,
        type: HTTPRequest.POST,
        route: `/api/v1/posts/${POST_ID}/comments`,
        requestBody: {
          ...badRequestBody,
        },
        autoAuthorized: false,
        headers: {
          Authorization: `Bearer ${ALICE_JWT}`,
        },
      })
    ).assertStatusCode(Status.BadRequest);
  });

  it("should return 400 if comment has both a voice memo and text", async () => {
    (
      await testBuilder.request({
        app,
        type: HTTPRequest.POST,
        route: `/api/v1/posts/${POST_ID}/comments`,
        requestBody: {
          ...badRequestBody2,
        },
        autoAuthorized: false,
        headers: {
          Authorization: `Bearer ${ALICE_JWT}`,
        },
      })
    ).assertStatusCode(Status.BadRequest);
  });

  it("should return 403 if tries to comment under post in group they are not part of", async () => {
    (
      await testBuilder.request({
        app,
        type: HTTPRequest.POST,
        route: `/api/v1/posts/${POST_ID}/comments`,
        requestBody: {
          ...goodRequestBody,
        },
        autoAuthorized: false,
        headers: {
          Authorization: `Bearer ${ANA_JWT}`,
        },
      })
    ).assertStatusCode(Status.Forbidden);
  });

  it("should return 404 if post is not found", async () => {
    (
      await testBuilder.request({
        app,
        type: HTTPRequest.POST,
        route: `/api/v1/posts/${generateUUID()}/comments`,
        requestBody: {
          ...goodRequestBody,
        },
        autoAuthorized: false,
        headers: {
          Authorization: `Bearer ${ALICE_JWT}`,
        },
      })
    ).assertStatusCode(Status.NotFound);
  });
});
