import {
  USER_ANA_ID,
  USER_BOB_ID,
  DEARLY_GROUP_ID,
  USER_ALICE_ID,
  POST_ID,
  POST_MOCK,
  MEDIA_MOCK,
} from "./../helpers/test-constants";
import { Hono } from "hono";
import { startTestApp } from "../helpers/test-app";
import { TestBuilder } from "../helpers/test-builder";
import { generateJWTFromID, generateUUID } from "../helpers/test-token";
import { HTTPRequest } from "../../constants/http";

describe("GET /groups/:groupId/posts/:postId", () => {
  let app: Hono;
  const testBuilder = new TestBuilder();
  const goodRequestBody = {
    caption: "dearly",
    media: [
      {
        url: "https://www.google.com",
        type: "VIDEO",
      },
      {
        url: "https://www.google.com",
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

  it("should return 200 for members of group after creation", async () => {
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
      .assertStatusCode(201)
      .assertFieldExists("id")
      .assertFieldExists("createdAt")
      .assertFieldExists("media")
      .assertFields({
        caption: goodRequestBody.caption,
        groupId: DEARLY_GROUP_ID,
        userId: USER_ALICE_ID,
      })
      .getResponseId();

    // member of group
    (
      await testBuilder.request({
        app,
        type: HTTPRequest.GET,
        route: `/api/v1/groups/${DEARLY_GROUP_ID}/posts/${id}`,
        autoAuthorized: false,
        headers: {
          Authorization: `Bearer ${BOB_JWT}`,
        },
      })
    ).assertStatusCode(200);

    // manager of group
    (
      await testBuilder.request({
        app,
        type: HTTPRequest.GET,
        route: `/api/v1/groups/${DEARLY_GROUP_ID}/posts/${id}`,
        autoAuthorized: false,
        headers: {
          Authorization: `Bearer ${ALICE_JWT}`,
        },
      })
    ).assertStatusCode(200);
  });

  it("should return 200 with full actual seeded post", async () => {
    (
      await testBuilder.request({
        app,
        type: HTTPRequest.GET,
        route: `/api/v1/groups/${DEARLY_GROUP_ID}/posts/${POST_ID}`,
        autoAuthorized: false,
        headers: {
          Authorization: `Bearer ${ALICE_JWT}`,
        },
      })
    )
      .assertStatusCode(200)
      .assertBody({
        ...POST_MOCK[0],
        createdAt: POST_MOCK[0]!.createdAt?.toISOString(),
        media: MEDIA_MOCK,
      });
  });

  it("should return 404 if user not a member", async () => {
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
      .assertStatusCode(201)
      .getResponseId();

    await testBuilder.request({
      app,
      type: HTTPRequest.GET,
      route: `/api/v1/groups/${DEARLY_GROUP_ID}/posts/${id}`,
      autoAuthorized: false,
      headers: {
        Authorization: `Bearer ${ANA_JWT}`,
      },
    });
  });

  it("should return 404 if post not found for member", async () => {
    await testBuilder.request({
      app,
      type: HTTPRequest.GET,
      route: `/api/v1/groups/${DEARLY_GROUP_ID}/posts/${generateUUID()}`,
      autoAuthorized: false,
      headers: {
        Authorization: `Bearer ${BOB_JWT}`,
      },
    });
  });

  it("should return 404 if group not found", async () => {
    (
      await testBuilder.request({
        app,
        type: HTTPRequest.GET,
        route: `/api/v1/groups/${generateUUID()}/posts/${generateUUID()}`,
        requestBody: {
          ...goodRequestBody,
        },
        autoAuthorized: false,
        headers: {
          Authorization: `Bearer ${ANA_JWT}`,
        },
      })
    )
      .assertStatusCode(404)
      .assertError("Post does not exist.");
  });
});
