import { Hono } from "hono";
import { startTestApp } from "../helpers/test-app";
import { TestBuilder } from "../helpers/test-builder";
import { generateUUID } from "../helpers/test-token";
import { INVALID_ID_ARRAY } from "../helpers/test-constants";
import { HTTPRequest, Status } from "../../constants/http";

describe("GET /users/:id", () => {
  let app: Hono;
  const testBuilder = new TestBuilder();
  const requestBody = {
    name: "Jane Doe",
    username: "janedoe",
  };

  beforeAll(async () => {
    app = await startTestApp();
  });

  it("should return 200 if user exists", async () => {
    const id = (
      await testBuilder.request({
        app,
        type: HTTPRequest.POST,
        route: "/api/v1/users",
        requestBody,
      })
    )
      .assertStatusCode(Status.Created)
      .getResponseId();

    (
      await testBuilder.request({
        app,
        route: `/api/v1/users/${id}`,
      })
    )
      .assertBody({
        id,
        ...requestBody,
        mode: "BASIC",
        timezone: null,
        profilePhoto: null,
      })
      .assertStatusCode(Status.OK);
  });

  it.each(
    INVALID_ID_ARRAY.map((id) => [id === null ? "null" : id === undefined ? "undefined" : id, id]),
  )("should return 400 if invalid ID %s", async (id) => {
    (
      await testBuilder.request({
        app,
        route: `/api/v1/users/${id}`,
      })
    )
      .assertStatusCode(Status.BadRequest)
      .assertError("Invalid ID format");
  });

  it("should return 404 if user not found", async () => {
    (
      await testBuilder.request({
        app,
        route: `/api/v1/users/${generateUUID()}`,
      })
    )
      .assertStatusCode(Status.NotFound)
      .assertError("User does not exist.");
  });
});
