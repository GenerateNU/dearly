import { Hono } from "hono";
import { startTestApp } from "../helpers/test-app";
import { TestBuilder } from "../helpers/test-builder";
import { generateUUID } from "../helpers/test-token";
import { HTTPRequest, Status } from "../../constants/http";

describe("GET /users/search", () => {
  let app: Hono;
  const testBuilder = new TestBuilder();

  beforeAll(async () => {
    app = await startTestApp();
  });

  it("should return 200 if group not found", async () => {
    (
      await testBuilder.request({
        app,
        type: HTTPRequest.GET,
        route: `/api/v1/users/search`,
        queryParams: {
          groupId: generateUUID(),
          username: "bobthebuilder",
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
