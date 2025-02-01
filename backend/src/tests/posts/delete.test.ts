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

describe("DELETE /posts/:id", () => {
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
        objectKey: "photo1.jpg",
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

  it("should return 200 if successfully delete post", async () => {
    const id = (
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
      })
      .getResponseId();

    // not owner of the post
    (
      await testBuilder.request({
        app,
        type: HTTPRequest.DELETE,
        route: `/api/v1/posts/${id}`,
        requestBody: {
          ...goodRequestBody,
        },
        autoAuthorized: false,
        headers: {
          Authorization: `Bearer ${BOB_JWT}`,
        },
      })
    )
      .assertStatusCode(Status.Forbidden)
      .assertError("Forbidden");

    // not member of the group
    (
      await testBuilder.request({
        app,
        type: HTTPRequest.DELETE,
        route: `/api/v1/posts/${id}`,
        requestBody: {
          ...goodRequestBody,
        },
        autoAuthorized: false,
        headers: {
          Authorization: `Bearer ${ANA_JWT}`,
        },
      })
    )
      .assertStatusCode(Status.Forbidden)
      .assertError("Forbidden");

    // owner of post delete
    (
      await testBuilder.request({
        app,
        type: HTTPRequest.DELETE,
        route: `/api/v1/posts/${id}`,
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
      .assertMessage("Successfully delete post");
  });

  it("should return 200 if post does not exist", async () => {
    (
      await testBuilder.request({
        app,
        type: HTTPRequest.DELETE,
        route: `/api/v1/posts/${generateUUID()}`,
        requestBody: {
          ...goodRequestBody,
        },
        autoAuthorized: false,
        headers: {
          Authorization: `Bearer ${ALICE_JWT}`,
        },
      })
    ).assertStatusCode(Status.OK);
  });

  it("should return 400 if invalid post ID", async () => {
    (
      await testBuilder.request({
        app,
        type: HTTPRequest.DELETE,
        route: `/api/v1/posts/bad`,
        requestBody: {
          ...goodRequestBody,
        },
        autoAuthorized: false,
        headers: {
          Authorization: `Bearer ${ALICE_JWT}`,
        },
      })
    )
      .assertStatusCode(Status.BadRequest)
      .assertError("Invalid ID format");
  });

  it.each(
    INVALID_ID_ARRAY.map((id) => [id === null ? "null" : id === undefined ? "undefined" : id, id]),
  )("should return 400 if invalid postId %s", async (id) => {
    (
      await testBuilder.request({
        app,
        type: HTTPRequest.DELETE,
        route: `/api/v1/posts/${id}`,
      })
    ).assertStatusCode(Status.BadRequest);
  });
});
