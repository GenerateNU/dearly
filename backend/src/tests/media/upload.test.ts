import {
  USER_ANA_ID,
  USER_ALICE_ID,
  INVALID_ID_ARRAY,
  DEARLY_GROUP_ID,
} from "../helpers/test-constants";
import { Hono } from "hono";
import { startTestApp } from "../helpers/test-app";
import { TestBuilder } from "../helpers/test-builder";
import { generateJWTFromID, generateUUID } from "../helpers/test-token";
import { HTTPRequest, Status } from "../../constants/http";

describe("POST /groups/:id/media", () => {
  let app: Hono;
  const testBuilder = new TestBuilder();

  const ALICE_JWT = generateJWTFromID(USER_ALICE_ID);
  const ANA_JWT = generateJWTFromID(USER_ANA_ID);

  beforeAll(async () => {
    app = await startTestApp();
  });

  it("should return 404 if group does not exist", async () => {
    (
      await testBuilder.request({
        app,
        type: HTTPRequest.POST,
        route: `/api/v1/groups/${DEARLY_GROUP_ID}/media`,
        autoAuthorized: false,
        headers: {
          Authorization: `Bearer ${ANA_JWT}`,
        },
      })
    )
      .assertStatusCode(Status.BadRequest)
      .assertError("No media found");
  });

  it("should return 403 if user is not member of group", async () => {
    (
      await testBuilder.request({
        app,
        type: HTTPRequest.POST,
        route: `/api/v1/groups/${DEARLY_GROUP_ID}/media`,
        autoAuthorized: false,
        headers: {
          Authorization: `Bearer ${ANA_JWT}`,
        },
      })
    )
      .assertStatusCode(Status.BadRequest)
      .assertError("No media found");
  });

  it("should return 400 if no media", async () => {
    (
      await testBuilder.request({
        app,
        type: HTTPRequest.POST,
        route: `/api/v1/groups/${generateUUID()}/media`,
        autoAuthorized: false,
        headers: {
          Authorization: `Bearer ${ALICE_JWT}`,
        },
      })
    )
      .assertStatusCode(Status.BadRequest)
      .assertError("No media found");
  });

  it.each(
    INVALID_ID_ARRAY.map((id) => [id === null ? "null" : id === undefined ? "undefined" : id, id]),
  )("should return 400 if invalid ID %s", async (id) => {
    (
      await testBuilder.request({
        app,
        type: HTTPRequest.POST,
        route: `/api/v1/groups/${id}/media`,
      })
    )
      .assertStatusCode(Status.BadRequest)
      .assertError("Invalid ID format");
  });
});
