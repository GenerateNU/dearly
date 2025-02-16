import { Hono } from "hono";
import { startTestApp } from "../helpers/test-app";
import { TestBuilder } from "../helpers/test-builder";
import { generateJWTFromID } from "../helpers/test-token";
import { HTTPRequest, Status } from "../../constants/http";
import {
  ANOTHER_GROUP,
  DEARLY_GROUP,
  GENERATE_GROUP,
  USER_ALICE_ID,
  USER_ANA_ID,
  USER_BILL_ID,
  USER_BOB_ID,
} from "../helpers/test-constants";

describe("GET /users/groups", () => {
  let app: Hono;
  const testBuilder = new TestBuilder();

  beforeAll(async () => {
    app = await startTestApp();
  });

  const ANOTHER_GROUP_WITH_NOTIFICATION = {
    ...ANOTHER_GROUP,
    notificationEnabled: true,
  };

  const DEARLY_GROUP_WITH_NOTIFICATION = {
    ...DEARLY_GROUP,
    notificationEnabled: true,
  };

  const GENERATE_GROUP_WITH_NOTIFICATION = {
    ...GENERATE_GROUP,
    notificationEnabled: true,
  };

  it("should return 200 if user not found", async () => {
    (
      await testBuilder.request({
        app,
        type: HTTPRequest.GET,
        route: `/api/v1/users/groups`,
        queryParams: {
          limit: "1",
          page: "1",
        },
        autoAuthorized: false,
        headers: {
          Authorization: `Bearer ${generateJWTFromID()}`,
        },
      })
    )
      .assertStatusCode(Status.OK)
      .assertBody([]);
  });

  it.each([
    [USER_ANA_ID, [ANOTHER_GROUP_WITH_NOTIFICATION]],
    [USER_BOB_ID, [DEARLY_GROUP_WITH_NOTIFICATION]],
    [USER_BILL_ID, [GENERATE_GROUP_WITH_NOTIFICATION]],
    [USER_ALICE_ID, [DEARLY_GROUP_WITH_NOTIFICATION, ANOTHER_GROUP_WITH_NOTIFICATION]],
  ])("should return 200 if for user with ID %s", async (id, expectedGroups) => {
    (
      await testBuilder.request({
        app,
        type: HTTPRequest.GET,
        route: `/api/v1/users/groups`,
        autoAuthorized: false,
        headers: {
          Authorization: `Bearer ${generateJWTFromID(id)}`,
        },
      })
    )
      .assertStatusCode(Status.OK)
      .assertBody(expectedGroups);
  });

  it.each([
    ["1", "1", [DEARLY_GROUP_WITH_NOTIFICATION]],
    ["1", "2", [ANOTHER_GROUP_WITH_NOTIFICATION]],
    ["1", "3", []],
    ["2", "1", [DEARLY_GROUP_WITH_NOTIFICATION, ANOTHER_GROUP_WITH_NOTIFICATION]],
    ["2", "2", []],
  ])("should return 200 with limit %s and page %s", async (limit, page, expectedBody) => {
    (
      await testBuilder.request({
        app,
        type: HTTPRequest.GET,
        route: `/api/v1/users/groups`,
        queryParams: {
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
  });

  it("should return 400 if limit and page not number", async () => {
    (
      await testBuilder.request({
        app,
        type: HTTPRequest.GET,
        route: `/api/v1/users/groups`,
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
  });

  it("should return 400 if limit and page is not positive", async () => {
    (
      await testBuilder.request({
        app,
        type: HTTPRequest.GET,
        route: `/api/v1/users/groups`,
        queryParams: {
          limit: "0",
          page: "-1",
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
  });
});
