import {
  USER_ANA_ID,
  USER_BOB_ID,
  USER_ALICE_ID,
  INVALID_ID_ARRAY,
  DEARLY_GROUP_ID,
} from "./../helpers/test-constants";
import { Hono } from "hono";
import { startTestApp } from "../helpers/test-app";
import { TestBuilder } from "../helpers/test-builder";
import { generateJWTFromID, generateUUID } from "../helpers/test-token";
import { HTTPRequest, Status } from "../../constants/http";
import { NAME_MAX_LIMIT, TEXT_MAX_LIMIT } from "../../constants/database";

describe("PATCH /groups/:id", () => {
  let app: Hono;
  const testBuilder = new TestBuilder();
  const goodRequestBody = {
    name: "updated name",
    description: "updated description",
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
        route: `/api/v1/groups/${DEARLY_GROUP_ID}`,
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
      .assertField("name", "updated name")
      .assertField("description", "updated description");
  });

  it(`should return 400 if name is longer than ${NAME_MAX_LIMIT} `, async () => {
    (
      await testBuilder.request({
        app,
        type: HTTPRequest.PATCH,
        route: `/api/v1/groups/${DEARLY_GROUP_ID}`,
        requestBody: {
          name: "a".repeat(NAME_MAX_LIMIT + 1),
        },
        autoAuthorized: false,
        headers: {
          Authorization: `Bearer ${ALICE_JWT}`,
        },
      })
    ).assertStatusCode(Status.BadRequest);
  });

  it(`should return 400 if empty name and description`, async () => {
    (
      await testBuilder.request({
        app,
        type: HTTPRequest.PATCH,
        route: `/api/v1/groups/${DEARLY_GROUP_ID}`,
        requestBody: {
          name: "",
          description: "",
        },
        autoAuthorized: false,
        headers: {
          Authorization: `Bearer ${ALICE_JWT}`,
        },
      })
    ).assertStatusCode(Status.BadRequest);
  });

  it(`should return 400 if description is more than ${TEXT_MAX_LIMIT}`, async () => {
    (
      await testBuilder.request({
        app,
        type: HTTPRequest.PATCH,
        route: `/api/v1/groups/${DEARLY_GROUP_ID}`,
        requestBody: {
          description: "a".repeat(TEXT_MAX_LIMIT + 1),
        },
        autoAuthorized: false,
        headers: {
          Authorization: `Bearer ${ALICE_JWT}`,
        },
      })
    ).assertStatusCode(Status.BadRequest);
  });

  it("should return 404 if group does not exist", async () => {
    (
      await testBuilder.request({
        app,
        type: HTTPRequest.PATCH,
        route: `/api/v1/groups/${generateUUID()}`,
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

  it("should return 403 if member is not owner", async () => {
    (
      await testBuilder.request({
        app,
        type: HTTPRequest.PATCH,
        route: `/api/v1/groups/${DEARLY_GROUP_ID}`,
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
        route: `/api/v1/groups/${DEARLY_GROUP_ID}`,
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
  )("should return 400 if invalid groupIds %s", async (id) => {
    (
      await testBuilder.request({
        app,
        type: HTTPRequest.PATCH,
        route: `/api/v1/groups/${id}`,
      })
    ).assertStatusCode(Status.BadRequest);
  });
});
