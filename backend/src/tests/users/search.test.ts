import { Hono } from "hono";
import { startTestApp } from "../helpers/test-app";
import { TestBuilder } from "../helpers/test-builder";
import { generateJWTFromID, generateUUID } from "../helpers/test-token";
import { HTTPRequest, Status } from "../../constants/http";
import {
  DEARLY_GROUP_ID,
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
      .assertBody([BOB, BILL, ANA]);
  });

  it("should return 200 if is manager with increasing page", async () => {
    (
      await testBuilder.request({
        app,
        type: HTTPRequest.GET,
        route: `/api/v1/users/search`,
        queryParams: {
          groupId: DEARLY_GROUP_ID,
          username: "bob",
          limit: "1",
          page: "1",
        },
        autoAuthorized: false,
        headers: {
          Authorization: `Bearer ${generateJWTFromID(USER_ALICE_ID)}`,
        },
      })
    )
      .assertStatusCode(Status.OK)
      .assertBody([BOB]);

    (
      await testBuilder.request({
        app,
        type: HTTPRequest.GET,
        route: `/api/v1/users/search`,
        queryParams: {
          groupId: DEARLY_GROUP_ID,
          username: "bob",
          limit: "1",
          page: "2",
        },
        autoAuthorized: false,
        headers: {
          Authorization: `Bearer ${generateJWTFromID(USER_ALICE_ID)}`,
        },
      })
    )
      .assertStatusCode(Status.OK)
      .assertBody([BILL]);

    (
      await testBuilder.request({
        app,
        type: HTTPRequest.GET,
        route: `/api/v1/users/search`,
        queryParams: {
          groupId: DEARLY_GROUP_ID,
          username: "bob",
          limit: "1",
          page: "3",
        },
        autoAuthorized: false,
        headers: {
          Authorization: `Bearer ${generateJWTFromID(USER_ALICE_ID)}`,
        },
      })
    )
      .assertStatusCode(Status.OK)
      .assertBody([ANA]);

    (
      await testBuilder.request({
        app,
        type: HTTPRequest.GET,
        route: `/api/v1/users/search`,
        queryParams: {
          groupId: DEARLY_GROUP_ID,
          username: "bob",
          limit: "1",
          page: "4",
        },
        autoAuthorized: false,
        headers: {
          Authorization: `Bearer ${generateJWTFromID(USER_ALICE_ID)}`,
        },
      })
    )
      .assertStatusCode(Status.OK)
      .assertBody([]);
  });

  it("should return 200 if is manager and increasing limit", async () => {
    (
      await testBuilder.request({
        app,
        type: HTTPRequest.GET,
        route: `/api/v1/users/search`,
        queryParams: {
          groupId: DEARLY_GROUP_ID,
          username: "bob",
          limit: "1",
          page: "1",
        },
        autoAuthorized: false,
        headers: {
          Authorization: `Bearer ${generateJWTFromID(USER_ALICE_ID)}`,
        },
      })
    )
      .assertStatusCode(Status.OK)
      .assertBody([BOB]);

    (
      await testBuilder.request({
        app,
        type: HTTPRequest.GET,
        route: `/api/v1/users/search`,
        queryParams: {
          groupId: DEARLY_GROUP_ID,
          username: "bob",
          limit: "2",
          page: "1",
        },
        autoAuthorized: false,
        headers: {
          Authorization: `Bearer ${generateJWTFromID(USER_ALICE_ID)}`,
        },
      })
    )
      .assertStatusCode(Status.OK)
      .assertBody([BOB, BILL]);

    (
      await testBuilder.request({
        app,
        type: HTTPRequest.GET,
        route: `/api/v1/users/search`,
        queryParams: {
          groupId: DEARLY_GROUP_ID,
          username: "bob",
          limit: "3",
          page: "1",
        },
        autoAuthorized: false,
        headers: {
          Authorization: `Bearer ${generateJWTFromID(USER_ALICE_ID)}`,
        },
      })
    )
      .assertStatusCode(Status.OK)
      .assertBody([BOB, BILL, ANA]);

    (
      await testBuilder.request({
        app,
        type: HTTPRequest.GET,
        route: `/api/v1/users/search`,
        queryParams: {
          groupId: DEARLY_GROUP_ID,
          username: "bob",
          limit: "4",
          page: "1",
        },
        autoAuthorized: false,
        headers: {
          Authorization: `Bearer ${generateJWTFromID(USER_ALICE_ID)}`,
        },
      })
    )
      .assertStatusCode(Status.OK)
      .assertBody([BOB, BILL, ANA]);
  });

  it("should return 200 if is manager and limit = 2", async () => {
    (
      await testBuilder.request({
        app,
        type: HTTPRequest.GET,
        route: `/api/v1/users/search`,
        queryParams: {
          groupId: DEARLY_GROUP_ID,
          username: "bob",
          limit: "2",
          page: "1",
        },
        autoAuthorized: false,
        headers: {
          Authorization: `Bearer ${generateJWTFromID(USER_ALICE_ID)}`,
        },
      })
    )
      .assertStatusCode(Status.OK)
      .assertBody([BOB, BILL]);

    (
      await testBuilder.request({
        app,
        type: HTTPRequest.GET,
        route: `/api/v1/users/search`,
        queryParams: {
          groupId: DEARLY_GROUP_ID,
          username: "bob",
          limit: "2",
          page: "2",
        },
        autoAuthorized: false,
        headers: {
          Authorization: `Bearer ${generateJWTFromID(USER_ALICE_ID)}`,
        },
      })
    )
      .assertStatusCode(Status.OK)
      .assertBody([ANA]);

    (
      await testBuilder.request({
        app,
        type: HTTPRequest.GET,
        route: `/api/v1/users/search`,
        queryParams: {
          groupId: DEARLY_GROUP_ID,
          username: "bob",
          limit: "2",
          page: "3",
        },
        autoAuthorized: false,
        headers: {
          Authorization: `Bearer ${generateJWTFromID(USER_ALICE_ID)}`,
        },
      })
    )
      .assertStatusCode(Status.OK)
      .assertBody([]);
  });

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
