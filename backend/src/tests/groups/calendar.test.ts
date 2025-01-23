import {
  ANOTHER_GROUP_ID,
  DEARLY_GROUP_ID,
  INVALID_ID_ARRAY,
  USER_ALICE_ID,
  USER_ANA_ID,
} from "./../helpers/test-constants";
import { Hono } from "hono";
import { startTestApp } from "../helpers/test-app";
import { TestBuilder } from "../helpers/test-builder";
import { generateJWTFromID, generateUUID } from "../helpers/test-token";
import { HTTPRequest, Status } from "../../constants/http";

describe("GET /groups/:id/calendar", () => {
  let app: Hono;
  const testBuilder = new TestBuilder();

  beforeAll(async () => {
    app = await startTestApp();
  });

  it("should return 404 if group not found", async () => {
    (
      await testBuilder.request({
        app,
        type: HTTPRequest.GET,
        route: `/api/v1/groups/${generateUUID()}/calendar`,
        autoAuthorized: false,
        headers: {
          Authorization: `Bearer ${generateJWTFromID()}`,
        },
      })
    ).assertStatusCode(Status.NotFound);
  });

  it("should return 403 if user not member of group", async () => {
    (
      await testBuilder.request({
        app,
        type: HTTPRequest.GET,
        route: `/api/v1/groups/${DEARLY_GROUP_ID}/calendar`,
        autoAuthorized: false,
        headers: {
          Authorization: `Bearer ${generateJWTFromID(USER_ANA_ID)}`,
        },
      })
    ).assertStatusCode(Status.Forbidden);
  });

  it.each(
    INVALID_ID_ARRAY.map((id) => [id === null ? "null" : id === undefined ? "undefined" : id, id]),
  )("should return 400 if invalid ID %s", async (id) => {
    (
      await testBuilder.request({
        app,
        type: HTTPRequest.GET,
        route: `/api/v1/groups/${id}/calendar`,
      })
    )
      .assertStatusCode(Status.BadRequest)
      .assertError("Invalid ID format");
  });
});
