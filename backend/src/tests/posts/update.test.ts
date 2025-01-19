import {
  USER_ANA_ID,
  USER_BOB_ID,
  DEARLY_GROUP_ID,
  USER_ALICE_ID,
  POST_ID,
  POST_MOCK,
  MEDIA_MOCK,
  INVALID_ID_ARRAY,
} from "./../helpers/test-constants";
import { Hono } from "hono";
import { startTestApp } from "../helpers/test-app";
import { TestBuilder } from "../helpers/test-builder";
import { generateJWTFromID, generateUUID } from "../helpers/test-token";
import { HTTPRequest, Status } from "../../constants/http";
import { MAX_MEDIA_COUNT, MIN_LIMIT, TEXT_MAX_LIMIT } from "../../constants/database";

describe("PATCH /groups/:groupId/posts/:postId", () => {
  let app: Hono;
  const testBuilder = new TestBuilder();
  const goodRequestBody = {
    caption: "updated",
    media: [
      {
        url: "https://www.netflix.com",
        type: "VIDEO",
      },
      {
        url: "https://www.netflix.com",
        type: "PHOTO",
      },
    ],
  };

  const ALICE_JWT = generateJWTFromID(USER_ALICE_ID);
  const BOB_JWT = generateJWTFromID(USER_BOB_ID);
  const ANA_JWT = generateJWTFromID(USER_ANA_ID);

  beforeAll(async () => {
    app = await startTestApp();
  });

  it("should return 200 if owner and valid payload", async () => {
    (
      await testBuilder.request({
        app,
        type: HTTPRequest.PATCH,
        route: `/api/v1/groups/${DEARLY_GROUP_ID}/posts/${POST_ID}`,
        requestBody: {
          ...goodRequestBody,
        },
        autoAuthorized: false,
        headers: {
          Authorization: `Bearer ${ALICE_JWT}`,
        },
      })
    )
      .assertStatusCode(Status.OK)
      .assertFieldNotEqual("media", MEDIA_MOCK)
      .assertFieldNotEqual("caption", POST_MOCK[0]!.caption)
      .assertField("caption", "updated");
  });

  it("should return 400 if owner and empty caption", async () => {
    (
      await testBuilder.request({
        app,
        type: HTTPRequest.PATCH,
        route: `/api/v1/groups/${DEARLY_GROUP_ID}/posts/${POST_ID}`,
        requestBody: {
          caption: "",
        },
        autoAuthorized: false,
        headers: {
          Authorization: `Bearer ${ALICE_JWT}`,
        },
      })
    )
      .assertStatusCode(Status.BadRequest)
      .assertError([
        {
          message: `Caption must be at least ${MIN_LIMIT} character long`,
          path: "caption",
        },
      ]);
  });

  it(`should return 400 if owner and caption > ${TEXT_MAX_LIMIT}`, async () => {
    (
      await testBuilder.request({
        app,
        type: HTTPRequest.PATCH,
        route: `/api/v1/groups/${DEARLY_GROUP_ID}/posts/${POST_ID}`,
        requestBody: {
          caption: "a".repeat(TEXT_MAX_LIMIT + 1),
        },
        autoAuthorized: false,
        headers: {
          Authorization: `Bearer ${ALICE_JWT}`,
        },
      })
    )
      .assertStatusCode(Status.BadRequest)
      .assertError([
        {
          message: `Caption must be at most ${TEXT_MAX_LIMIT} characters long`,
          path: "caption",
        },
      ]);
  });

  it(`should return 400 if empty media array`, async () => {
    (
      await testBuilder.request({
        app,
        type: HTTPRequest.PATCH,
        route: `/api/v1/groups/${DEARLY_GROUP_ID}/posts/${POST_ID}`,
        requestBody: {
          media: [],
        },
        autoAuthorized: false,
        headers: {
          Authorization: `Bearer ${ALICE_JWT}`,
        },
      })
    )
      .assertStatusCode(Status.BadRequest)
      .assertError([
        {
          message: `At least 1 media item (PHOTO or VIDEO) is required.`,
          path: "media",
        },
      ]);
  });

  it(`should return 400 if media count > ${MAX_MEDIA_COUNT} limit`, async () => {
    (
      await testBuilder.request({
        app,
        type: HTTPRequest.PATCH,
        route: `/api/v1/groups/${DEARLY_GROUP_ID}/posts/${POST_ID}`,
        requestBody: {
          media: [
            {
              type: "VIDEO",
              url: "https://www.google.com",
            },
            {
              type: "VIDEO",
              url: "https://www.google.com",
            },
            {
              type: "VIDEO",
              url: "https://www.google.com",
            },
            {
              type: "VIDEO",
              url: "https://www.google.com",
            },
          ],
        },
        autoAuthorized: false,
        headers: {
          Authorization: `Bearer ${ALICE_JWT}`,
        },
      })
    )
      .assertStatusCode(Status.BadRequest)
      .assertError([
        {
          message: `At most ${MAX_MEDIA_COUNT} media items are allowed.`,
          path: "media",
        },
      ]);
  });

  it("should return 400 if owner and bad media url and type", async () => {
    (
      await testBuilder.request({
        app,
        type: HTTPRequest.POST,
        route: `/api/v1/groups/${DEARLY_GROUP_ID}/posts`,
        requestBody: {
          media: [
            {
              url: "link",
              type: "AUDIO",
            },
          ],
        },
        autoAuthorized: false,
        headers: {
          Authorization: `Bearer ${ALICE_JWT}`,
        },
      })
    )
      .assertStatusCode(Status.BadRequest)
      .assertError([
        {
          message: "Invalid enum value. Expected 'VIDEO' | 'PHOTO', received 'AUDIO'",
          path: "media.0.type",
        },
        {
          message: "Invalid url",
          path: "media.0.url",
        },
      ]);
  });

  it("should return 404 if post does not exist", async () => {
    (
      await testBuilder.request({
        app,
        type: HTTPRequest.PATCH,
        route: `/api/v1/groups/${DEARLY_GROUP_ID}/posts/${generateUUID()}`,
        requestBody: {
          ...goodRequestBody,
        },
        autoAuthorized: false,
        headers: {
          Authorization: `Bearer ${ALICE_JWT}`,
        },
      })
    )
      .assertStatusCode(Status.NotFound)
      .assertError("Post does not exist.");
  });

  it("should return 404 if group does not exist", async () => {
    (
      await testBuilder.request({
        app,
        type: HTTPRequest.PATCH,
        route: `/api/v1/groups/${generateUUID()}/posts/${generateUUID()}`,
        requestBody: {
          ...goodRequestBody,
        },
        autoAuthorized: false,
        headers: {
          Authorization: `Bearer ${ALICE_JWT}`,
        },
      })
    )
      .assertStatusCode(Status.NotFound)
      .assertError("Post does not exist.");
  });

  it("should return 403 if member is not owner", async () => {
    (
      await testBuilder.request({
        app,
        type: HTTPRequest.PATCH,
        route: `/api/v1/groups/${DEARLY_GROUP_ID}/posts/${POST_ID}`,
        requestBody: {
          ...goodRequestBody,
        },
        autoAuthorized: false,
        headers: {
          Authorization: `Bearer ${BOB_JWT}`,
        },
      })
    ).assertStatusCode(Status.Forbidden);
  });

  it("should return 403 if not member of group", async () => {
    (
      await testBuilder.request({
        app,
        type: HTTPRequest.PATCH,
        route: `/api/v1/groups/${DEARLY_GROUP_ID}/posts/${POST_ID}`,
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

  it.each(
    INVALID_ID_ARRAY.map((id) => [id === null ? "null" : id === undefined ? "undefined" : id, id]),
  )("should return 400 if invalid postId %s", async (id) => {
    (
      await testBuilder.request({
        app,
        type: HTTPRequest.PATCH,
        route: `/api/v1/groups/${generateUUID()}/posts/${id}`,
      })
    ).assertStatusCode(Status.BadRequest);
  });

  it.each(
    INVALID_ID_ARRAY.map((id) => [id === null ? "null" : id === undefined ? "undefined" : id, id]),
  )("should return 400 if invalid groupId %s", async (id) => {
    (
      await testBuilder.request({
        app,
        type: HTTPRequest.PATCH,
        route: `/api/v1/groups/${id}/posts/${generateUUID()}`,
      })
    ).assertStatusCode(Status.BadRequest);
  });
});
