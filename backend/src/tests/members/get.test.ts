import {
  USER_ANA_ID,
  USER_BOB_ID,
  DEARLY_GROUP_ID,
  USER_ALICE_ID,
  INVALID_ID_ARRAY,
  ANOTHER_GROUP_ID,
  SEARCHED_ALICE,
  SEARCHED_BOB,
  SEARCHED_ANA,
} from "./../helpers/test-constants";
import { Hono } from "hono";
import { startTestApp } from "../helpers/test-app";
import { TestBuilder } from "../helpers/test-builder";
import { generateJWTFromID, generateUUID } from "../helpers/test-token";
import { HTTPRequest, Status } from "../../constants/http";

describe.only("GET /groups/:id/members", () => {
  let app: Hono;
  const testBuilder = new TestBuilder();

  const ALICE_JWT = generateJWTFromID(USER_ALICE_ID);
  const BOB_JWT = generateJWTFromID(USER_BOB_ID);
  const ANA_JWT = generateJWTFromID(USER_ANA_ID);

  beforeAll(async () => {
    app = await startTestApp();
  });

  it("should return 200 and a list of all members when requested by member or manager", async () => {
    // member of group
    (
      await testBuilder.request({
        app,
        type: HTTPRequest.GET,
        route: `/api/v1/groups/${DEARLY_GROUP_ID}/members`,
        autoAuthorized: false,
        headers: {
          Authorization: `Bearer ${BOB_JWT}`,
        },
      })
    )
      .assertStatusCode(Status.OK)
      .assertArraySize(2)
      .assertBody([SEARCHED_ALICE, SEARCHED_BOB]);

    // manager of group
    (
      await testBuilder.request({
        app,
        type: HTTPRequest.GET,
        route: `/api/v1/groups/${DEARLY_GROUP_ID}/members`,
        queryParams: {
          limit: "10",
          offset: "0",
        },
        autoAuthorized: false,
        headers: {
          Authorization: `Bearer ${ALICE_JWT}`,
        },
      })
    )
      .assertStatusCode(Status.OK)
      .assertArraySize(2)
      .assertBody([SEARCHED_ALICE, SEARCHED_BOB]);
  });

  it("should return 403 when requested by a non-member", async () => {
    const wrongId = generateJWTFromID(generateUUID());

    (
      await testBuilder.request({
        app,
        type: HTTPRequest.GET,
        route: `/api/v1/groups/${DEARLY_GROUP_ID}/members`,
        queryParams: {
          limit: "10",
          offset: "0",
        },
        autoAuthorized: false,
        headers: {
          Authorization: `Bearer ${wrongId}`,
        },
      })
    )
      .assertStatusCode(Status.Forbidden)
      .assertError("You do not have the rights to the member list of this group.");
  });

  it.each(
    INVALID_ID_ARRAY.map((id) => [id === null ? "null" : id === undefined ? "undefined" : id, id]),
  )("should return 400 if invalid groupId %s", async (id) => {
    (
      await testBuilder.request({
        app,
        type: HTTPRequest.GET,
        route: `/api/v1/groups/${id}/members`,
      })
    ).assertStatusCode(Status.BadRequest);
  });

  it.each([
    ["1", "1", [SEARCHED_ALICE]],
    ["1", "2", [SEARCHED_BOB]],
    ["1", "3", []],
    ["1", "4", []],
    ["2", "1", [SEARCHED_ALICE, SEARCHED_BOB]],
    ["2", "2", []],
  ])("should return 200 with limit %s and page %s", async (limit, page, expectedBody) => {
    (
      await testBuilder.request({
        app,
        type: HTTPRequest.GET,
        route: `/api/v1/groups/${DEARLY_GROUP_ID}/members`,
        queryParams: {
          limit,
          page,
        },
        autoAuthorized: false,
        headers: {
          Authorization: `Bearer ${ALICE_JWT}`,
        },
      })
    )
      .assertStatusCode(Status.OK)
      .assertBody(expectedBody);
  });

  it("should return 200 even with no params (default limit and page)", async () => {
    (
      await testBuilder.request({
        app,
        type: HTTPRequest.GET,
        route: `/api/v1/groups/${ANOTHER_GROUP_ID}/members`,
        autoAuthorized: false,
        headers: {
          Authorization: `Bearer ${ANA_JWT}`,
        },
      })
    )
      .assertStatusCode(Status.OK)
      .assertArraySize(2)
      .assertBody([SEARCHED_ALICE, SEARCHED_ANA]);
  });

  it("should return 400 if limit and page not number", async () => {
    (
      await testBuilder.request({
        app,
        type: HTTPRequest.GET,
        route: `/api/v1/groups/${DEARLY_GROUP_ID}/members`,
        queryParams: {
          limit: "limit",
          page: "page",
        },
        autoAuthorized: false,
        headers: {
          Authorization: `Bearer ${generateJWTFromID(USER_ALICE_ID)}`,
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
          message: "Page must be a positive number",
          path: "page",
        },
      ]);

    it("should return 400 if limit and page is not positive", async () => {
      (
        await testBuilder.request({
          app,
          type: HTTPRequest.GET,
          route: `/api/v1/groups/${DEARLY_GROUP_ID}/members`,
          queryParams: {
            limit: "0",
            page: "-1",
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
            message: "Limit must be a positive number",
            path: "limit",
          },
          {
            message: "Page must be a positive number",
            path: "page",
          },
        ]);
    });
  });
});
