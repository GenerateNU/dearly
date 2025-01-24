import {
  USER_ANA_ID,
  USER_BOB_ID,
  DEARLY_GROUP_ID,
  USER_ALICE_ID,
  INVALID_ID_ARRAY,
} from "./../helpers/test-constants";
import { Hono } from "hono";
import { startTestApp } from "../helpers/test-app";
import { TestBuilder } from "../helpers/test-builder";
import { generateJWTFromID, generateUUID } from "../helpers/test-token";
import { HTTPRequest, Status } from "../../constants/http";
import { MAX_MEDIA_COUNT, MIN_LIMIT, TEXT_MAX_LIMIT } from "../../constants/database";

describe("POST /groups/:id/posts", () => {
  let app: Hono;
  const testBuilder = new TestBuilder();
  const goodRequestBody = {
    caption: "dearly",
    media: [
      {
        objectKey: "photo1.jpg",
        type: "VIDEO",
      },
      {
        objectKey: "photo2.jpg",
        type: "PHOTO",
      },
    ],
  };
  const badRequestBody = {
    caption: "",
    media: [
      {
        objectKey: "",
        type: "AUDIO",
      },
    ],
  };

  const ALICE_JWT = generateJWTFromID(USER_ALICE_ID);
  const BOB_JWT = generateJWTFromID(USER_BOB_ID);
  const ANA_JWT = generateJWTFromID(USER_ANA_ID);

  beforeAll(async () => {
    app = await startTestApp();
  });

  it("should return 201 if valid payload for manager", async () => {
    (
      await testBuilder.request({
        app,
        type: HTTPRequest.POST,
        route: `/api/v1/groups/${DEARLY_GROUP_ID}/posts`,
        requestBody: {
          ...goodRequestBody,
        },
        autoAuthorized: false,
        headers: {
          Authorization: `Bearer ${ALICE_JWT}`,
        },
      })
    )
      .assertStatusCode(Status.Created)
      .assertFieldExists("id")
      .assertFieldExists("createdAt")
      .assertFieldExists("media")
      .assertFields({
        caption: goodRequestBody.caption,
        groupId: DEARLY_GROUP_ID,
        userId: USER_ALICE_ID,
      });
  });

  it("should return 201 if valid payload for member", async () => {
    (
      await testBuilder.request({
        app,
        type: HTTPRequest.POST,
        route: `/api/v1/groups/${DEARLY_GROUP_ID}/posts`,
        requestBody: {
          ...goodRequestBody,
        },
        autoAuthorized: false,
        headers: {
          Authorization: `Bearer ${BOB_JWT}`,
        },
      })
    )
      .assertStatusCode(Status.Created)
      .assertFieldExists("id")
      .assertFieldExists("createdAt")
      .assertFieldExists("media")
      .assertFields({
        caption: goodRequestBody.caption,
        groupId: DEARLY_GROUP_ID,
        userId: USER_BOB_ID,
      });
  });

  it("should return 404 if user is not member of group", async () => {
    (
      await testBuilder.request({
        app,
        type: HTTPRequest.POST,
        route: `/api/v1/groups/${DEARLY_GROUP_ID}/posts`,
        requestBody: {
          ...goodRequestBody,
        },
        autoAuthorized: false,
        headers: {
          Authorization: `Bearer ${ANA_JWT}`,
        },
      })
    )
      .assertStatusCode(Status.NotFound)
      .assertError("Group does not exist.");
  });

  it("should return 400 if no media field", async () => {
    (
      await testBuilder.request({
        app,
        type: HTTPRequest.POST,
        route: `/api/v1/groups/${DEARLY_GROUP_ID}/posts`,
        requestBody: {
          caption: "hi",
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
          message: "Required",
          path: "media",
        },
      ]);
  });

  it("should return 400 if media is invalid payload", async () => {
    (
      await testBuilder.request({
        app,
        type: HTTPRequest.POST,
        route: `/api/v1/groups/${DEARLY_GROUP_ID}/posts`,
        requestBody: badRequestBody,
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
        {
          message: "Invalid enum value. Expected 'VIDEO' | 'PHOTO', received 'AUDIO'",
          path: "media.0.type",
        },
        {
          message: "Object key cannot be empty",
          path: "media.0.objectKey",
        },
      ]);
  });

  it("should return 400 if caption exceeds limit", async () => {
    (
      await testBuilder.request({
        app,
        type: HTTPRequest.POST,
        route: `/api/v1/groups/${DEARLY_GROUP_ID}/posts`,
        requestBody: {
          media: goodRequestBody.media,
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

  it("should return 404 if group not found", async () => {
    (
      await testBuilder.request({
        app,
        type: HTTPRequest.POST,
        route: `/api/v1/groups/${generateUUID()}/posts`,
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
      .assertError("Group does not exist.");
  });

  it("should return 400 if no media field", async () => {
    (
      await testBuilder.request({
        app,
        type: HTTPRequest.POST,
        route: `/api/v1/groups/${DEARLY_GROUP_ID}/posts`,
        requestBody: {
          caption: "test",
        },
        autoAuthorized: false,
        headers: {
          Authorization: `Bearer ${BOB_JWT}`,
        },
      })
    )
      .assertStatusCode(Status.BadRequest)
      .assertError([
        {
          path: "media",
          message: "Required",
        },
      ]);
  });

  it("should return 400 if media count < 1", async () => {
    (
      await testBuilder.request({
        app,
        type: HTTPRequest.POST,
        route: `/api/v1/groups/${DEARLY_GROUP_ID}/posts`,
        requestBody: {
          caption: "test",
          media: [],
        },
        autoAuthorized: false,
        headers: {
          Authorization: `Bearer ${BOB_JWT}`,
        },
      })
    )
      .assertStatusCode(Status.BadRequest)
      .assertError([
        {
          message: "At least 1 media item (PHOTO or VIDEO) is required.",
          path: "media",
        },
      ]);
  });

  it("should return 400 if more than 3 media", async () => {
    (
      await testBuilder.request({
        app,
        type: HTTPRequest.POST,
        route: `/api/v1/groups/${DEARLY_GROUP_ID}/posts`,
        requestBody: {
          media: [
            {
              type: "VIDEO",
              objectKey: "https://www.google.com",
            },
            {
              type: "VIDEO",
              objectKey: "https://www.google.com",
            },
            {
              type: "VIDEO",
              objectKey: "https://www.google.com",
            },
            {
              type: "VIDEO",
              objectKey: "https://www.google.com",
            },
          ],
        },
        autoAuthorized: false,
        headers: {
          Authorization: `Bearer ${BOB_JWT}`,
        },
      })
    )
      .assertStatusCode(Status.BadRequest)
      .assertError([
        {
          path: "media",
          message: `At most ${MAX_MEDIA_COUNT} media items are allowed.`,
        },
      ]);
  });

  it.each(
    INVALID_ID_ARRAY.map((id) => [id === null ? "null" : id === undefined ? "undefined" : id, id]),
  )("should return 400 if invalid ID %s", async (id) => {
    (
      await testBuilder.request({
        app,
        type: HTTPRequest.POST,
        route: `/api/v1/groups/${id}/posts`,
      })
    )
      .assertStatusCode(Status.BadRequest)
      .assertError("Invalid ID format");
  });
});
