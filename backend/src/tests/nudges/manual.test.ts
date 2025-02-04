import {
  USER_BOB_ID,
  USER_ALICE_ID,
  INVALID_ID_ARRAY,
  DEARLY_GROUP_ID,
} from "../helpers/test-constants";
import { Hono } from "hono";
import { startTestApp } from "../helpers/test-app";
import { TestBuilder } from "../helpers/test-builder";
import { generateJWTFromID, generateUUID } from "../helpers/test-token";
import { HTTPRequest, Status } from "../../constants/http";

describe("PUT /groups/:id/nudges/manual", () => {
  let app: Hono;
  const testBuilder = new TestBuilder();

  const ALICE_JWT = generateJWTFromID(USER_ALICE_ID);
  const BOB_JWT = generateJWTFromID(USER_BOB_ID);

  beforeAll(async () => {
    app = await startTestApp();
  });

  it("should return 404 if group does not exist", async () => {
    (
      await testBuilder.request({
        app,
        type: HTTPRequest.PUT,
        route: `/api/v1/groups/${generateUUID()}/nudges/manual`,
        autoAuthorized: false,
        headers: {
          Authorization: `Bearer ${ALICE_JWT}`,
        },
        requestBody: {
          users: [generateUUID()],
        },
      })
    )
      .assertStatusCode(Status.NotFound)
      .assertError("Group does not exist.");
  });

  it("should return 404 if user(s) does not exist", async () => {
    const nonExistentUser1 = generateUUID();
    const nonExistentUser2 = generateUUID();
    (
      await testBuilder.request({
        app,
        type: HTTPRequest.PUT,
        route: `/api/v1/groups/${DEARLY_GROUP_ID}/nudges/manual`,
        autoAuthorized: false,
        headers: {
          Authorization: `Bearer ${ALICE_JWT}`,
        },
        requestBody: {
          users: [nonExistentUser1, nonExistentUser2],
        },
      })
    )
      .assertStatusCode(Status.NotFound)
      .assertError(`Users not found: ${nonExistentUser1}, ${nonExistentUser2}`);
  });

  it("should return 400 if empty selected users", async () => {
    (
      await testBuilder.request({
        app,
        type: HTTPRequest.PUT,
        route: `/api/v1/groups/${generateUUID()}/nudges/manual`,
        autoAuthorized: false,
        headers: {
          Authorization: `Bearer ${ALICE_JWT}`,
        },
        requestBody: {
          users: [],
        },
      })
    )
      .assertStatusCode(Status.BadRequest)
      .assertError([
        {
          message: "Please select at least one user to nudge",
          path: "users",
        },
      ]);
  });

  it("should return 400 if no request body", async () => {
    (
      await testBuilder.request({
        app,
        type: HTTPRequest.PUT,
        route: `/api/v1/groups/${generateUUID()}/nudges/manual`,
        autoAuthorized: false,
        headers: {
          Authorization: `Bearer ${ALICE_JWT}`,
        },
      })
    ).assertStatusCode(Status.BadRequest);
  });

  it("should return 403 if user not a manager", async () => {
    (
      await testBuilder.request({
        app,
        type: HTTPRequest.PUT,
        route: `/api/v1/groups/${DEARLY_GROUP_ID}/nudges/manual`,
        autoAuthorized: false,
        headers: {
          Authorization: `Bearer ${BOB_JWT}`,
        },
        requestBody: {
          users: [generateUUID()],
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
          type: HTTPRequest.PUT,
          route: `/api/v1/groups/${id}/nudges/manual`,
        })
      )
        .assertStatusCode(Status.BadRequest)
        .assertError("Invalid ID format");
    });
});
