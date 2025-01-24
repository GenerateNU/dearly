import {
  USER_ANA_ID,
  USER_BOB_ID,
  USER_ALICE_ID,
  INVALID_ID_ARRAY,
} from "./../helpers/test-constants";
import { Hono } from "hono";
import { startTestApp } from "../helpers/test-app";
import { TestBuilder } from "../helpers/test-builder";
import { generateJWTFromID } from "../helpers/test-token";
import { HTTPRequest, Status } from "../../constants/http";

describe("DELETE /groups/:id", () => {
  let app: Hono;
  const testBuilder = new TestBuilder();
  const goodRequestBody = {
    name: "dearly",
    description: "group!",
  };

  const ALICE_JWT = generateJWTFromID(USER_ALICE_ID);
  const BOB_JWT = generateJWTFromID(USER_BOB_ID);
  const ANA_JWT = generateJWTFromID(USER_ANA_ID);

  beforeAll(async () => {
    app = await startTestApp();
  });

  it("should return 200 if successfully delete group", async () => {
    const id = (
      await testBuilder.request({
        app,
        type: HTTPRequest.POST,
        route: `/api/v1/groups`,
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
      .assertFieldExists("description")
      .assertFieldExists("name")
      .assertFields({
        name: goodRequestBody.name,
        description: goodRequestBody.description,
        managerId: USER_ALICE_ID,
      })
      .getResponseId();

    // invalid user cannot delete
    (
      await testBuilder.request({
        app,
        type: HTTPRequest.DELETE,
        route: `/api/v1/groups/${id}`,
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
        route: `/api/v1/groups/${id}`,
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

    // owner of group delete
    (
      await testBuilder.request({
        app,
        type: HTTPRequest.DELETE,
        route: `/api/v1/groups/${id}`,
        autoAuthorized: false,
        headers: {
          Authorization: `Bearer ${ALICE_JWT}`,
        },
      })
    )
      .assertStatusCode(Status.OK)
      .assertMessage("Successfully delete group");
  });

  it.each(
    INVALID_ID_ARRAY.map((id) => [id === null ? "null" : id === undefined ? "undefined" : id, id]),
  )("should return 400 if invalid groupId %s", async (id) => {
    (
      await testBuilder.request({
        app,
        type: HTTPRequest.DELETE,
        route: `/api/v1/groups/${id}`,
      })
    ).assertStatusCode(Status.BadRequest);
  });
});
