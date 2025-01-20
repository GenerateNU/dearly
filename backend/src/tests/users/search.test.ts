import { Hono } from "hono";
import { startTestApp } from "../helpers/test-app";
import { TestBuilder } from "../helpers/test-builder";
import { generateJWTFromID, generateUUID } from "../helpers/test-token";
import { HTTPRequest, Status } from "../../constants/http";
import {
  DEARLY_GROUP_ID,
  INVALID_ID_ARRAY,
  USER_ALICE_ID,
  USER_ANA,
  USER_ANA_ID,
  USER_BILL,
  USER_BOB,
  USER_BOB_ID,
} from "../helpers/test-constants";

describe("GET /users/search", () => {
  let app: Hono;
  const testBuilder = new TestBuilder();

  beforeAll(async () => {
    app = await startTestApp();
  });
  const ANA = {
    username: USER_ANA.username,
    name: USER_ANA.name,
    id: USER_ANA.id,
    profilePhoto: null,
    isMember: false,
  };

  const BOB = {
    username: USER_BOB.username,
    name: USER_BOB.name,
    id: USER_BOB.id,
    profilePhoto: null,
    isMember: true,
  };

  const BILL = {
    username: USER_BILL.username,
    name: USER_BILL.name,
    id: USER_BILL.id,
    profilePhoto: null,
    isMember: false,
  };

  it.each([
    ["build", [BOB, ANA, BILL]],
    ["ana", [ANA, BOB, BILL]],
    ["bill", [BILL, BOB, ANA]],
  ])("should return 200 if is manager with query param %s", async (username, expectedBody) => {
    (
      await testBuilder.request({
        app,
        type: HTTPRequest.GET,
        route: `/api/v1/users/search`,
        queryParams: {
          groupId: DEARLY_GROUP_ID,
          username,
        },
        autoAuthorized: false,
        headers: {
          Authorization: `Bearer ${generateJWTFromID(USER_ALICE_ID)}`,
        },
      })
    )
      .assertStatusCode(Status.OK)
      .assertBody(expectedBody);
  });

  it("should return 200 if is manager of group and `ana` query", async () => {
    (
      await testBuilder.request({
        app,
        type: HTTPRequest.GET,
        route: `/api/v1/users/search`,
        queryParams: {
          groupId: DEARLY_GROUP_ID,
          username: "ana",
        },
        autoAuthorized: false,
        headers: {
          Authorization: `Bearer ${generateJWTFromID(USER_ALICE_ID)}`,
        },
      })
    )
      .assertStatusCode(Status.OK)
      .assertBody([ANA, BOB, BILL]);
  });

  it("should return 200 if is manager of group and `bob` query", async () => {
    (
      await testBuilder.request({
        app,
        type: HTTPRequest.GET,
        route: `/api/v1/users/search`,
        queryParams: {
          groupId: DEARLY_GROUP_ID,
          username: "bob",
        },
        autoAuthorized: false,
        headers: {
          Authorization: `Bearer ${generateJWTFromID(USER_ALICE_ID)}`,
        },
      })
    )
      .assertStatusCode(Status.OK)
      .assertBody([BOB, ANA, BILL]);
  });

  it.each([
    ["1", "1", [BOB]],
    ["1", "2", [ANA]],
    ["1", "3", [BILL]],
    ["1", "4", []],
    ["2", "1", [BOB, ANA]],
    ["2", "2", [BILL]],
    ["2", "3", []],
    ["1", "1", [BOB]],
    ["2", "1", [BOB, ANA]],
    ["3", "1", [BOB, ANA, BILL]],
    ["4", "1", [BOB, ANA, BILL]],
    ["3", "1", [BOB, ANA, BILL]],
    ["3", "2", []],
  ])(
    "should return 200 if is manager with limit %s and page %s",
    async (limit, page, expectedBody) => {
      (
        await testBuilder.request({
          app,
          type: HTTPRequest.GET,
          route: `/api/v1/users/search`,
          queryParams: {
            groupId: DEARLY_GROUP_ID,
            username: "bob",
            limit,
            page,
          },
          autoAuthorized: false,
          headers: {
            Authorization: `Bearer ${generateJWTFromID(USER_ALICE_ID)}`,
          },
        })
      )
        .assertStatusCode(Status.OK)
        .assertBody(expectedBody);
    },
  );

  it("should return 200 (empty array) if is member but not manager and valid query", async () => {
    (
      await testBuilder.request({
        app,
        type: HTTPRequest.GET,
        route: `/api/v1/users/search`,
        queryParams: {
          groupId: DEARLY_GROUP_ID,
          username: "bob",
        },
        autoAuthorized: false,
        headers: {
          Authorization: `Bearer ${generateJWTFromID(USER_BOB_ID)}`,
        },
      })
    )
      .assertStatusCode(Status.OK)
      .assertBody([]);
  });

  it("should return 200 (empty array) if not member and valid query", async () => {
    (
      await testBuilder.request({
        app,
        type: HTTPRequest.GET,
        route: `/api/v1/users/search`,
        queryParams: {
          groupId: DEARLY_GROUP_ID,
          username: "alice",
        },
        autoAuthorized: false,
        headers: {
          Authorization: `Bearer ${generateJWTFromID(USER_ANA_ID)}`,
        },
      })
    )
      .assertStatusCode(Status.OK)
      .assertBody([]);
  });

  it("should return 400 if no groupId and username", async () => {
    (
      await testBuilder.request({
        app,
        type: HTTPRequest.GET,
        route: `/api/v1/users/search`,
      })
    )
      .assertStatusCode(Status.BadRequest)
      .assertError([
        {
          message: "Required",
          path: "username",
        },
        {
          message: "Required",
          path: "groupId",
        },
      ]);
  });

  it.each(
    INVALID_ID_ARRAY.map((id) => [id === null ? "null" : id === undefined ? "undefined" : id, id]),
  )("should return 400 if invalid ID %s", async (id) => {
    (
      await testBuilder.request({
        app,
        type: HTTPRequest.GET,
        route: `/api/v1/users/search`,
        queryParams: {
          groupId: id,
          username: "janedoe",
        },
      })
    )
      .assertStatusCode(Status.BadRequest)
      .assertError([
        {
          message: "Invalid ID format",
          path: "groupId",
        },
      ]);
  });

  it("should return 400 if limit and offset is not a number", async () => {
    (
      await testBuilder.request({
        app,
        type: HTTPRequest.GET,
        route: `/api/v1/users/search`,
        queryParams: {
          limit: "limit",
          page: "offset",
          groupId: generateUUID(),
          username: "janedoe",
        },
      })
    )
      .assertStatusCode(Status.BadRequest)
      .assertError([
        {
          message: "Limit must be a positive number",
          path: "limit",
        },
        {
          message: "Page must be a non-negative number",
          path: "page",
        },
      ]);
  });

  it("should return 400 if limit and offset is negative", async () => {
    (
      await testBuilder.request({
        app,
        type: HTTPRequest.GET,
        route: `/api/v1/users/search`,
        queryParams: {
          limit: "-1",
          page: "-5",
          groupId: generateUUID(),
          username: "janedoe",
        },
      })
    )
      .assertStatusCode(Status.BadRequest)
      .assertError([
        {
          message: "Limit must be a positive number",
          path: "limit",
        },
        {
          message: "Page must be a non-negative number",
          path: "page",
        },
      ]);
  });
});
