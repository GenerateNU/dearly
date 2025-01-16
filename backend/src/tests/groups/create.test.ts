import { Hono } from "hono";
import { startTestApp } from "../helpers/test-app";
import { TestBuilder } from "../helpers/test-builder";
import { generateJWTFromID } from "../helpers/test-token";
import { HTTPRequest } from "../../constants/http";
import { GROUP_EMPTY_FIELDS_ERRORS, USER_ALICE_ID } from "../helpers/test-constants";

describe("POST /groups", () => {
  let app: Hono;
  const testBuilder = new TestBuilder();
  const requestBody = {
    name: "dearly",
    description: "generate",
  };
  const jwt = generateJWTFromID(USER_ALICE_ID);

  beforeAll(async () => {
    app = await startTestApp();
  });

  it("should return 201 if valid payload", async () => {
    (
      await testBuilder.request({
        app,
        type: HTTPRequest.POST,
        route: "/api/v1/groups",
        requestBody: {
          ...requestBody,
          hello: "world", // irrelevant field, should be ignored
        },
        autoAuthorized: false,
        headers: {
          Authorization: `Bearer ${jwt}`,
        },
      })
    )
      .assertStatusCode(201)
      .assertFields({
        ...requestBody,
        managerId: USER_ALICE_ID,
      })
      .assertFieldExists("id");
  });

  it("should return 404 if user does not exist", async () => {
    (
      await testBuilder.request({
        app,
        type: HTTPRequest.POST,
        route: "/api/v1/groups",
        requestBody,
      })
    )
      .assertStatusCode(404)
      .assertError("User does not exist.");
  });

  // test error when name or description is defined but empty ""
  it.each(GROUP_EMPTY_FIELDS_ERRORS)(
    "should return 400 if $field is empty",
    async ({ requestBody, expectedError }) => {
      (
        await testBuilder.request({
          app,
          type: HTTPRequest.POST,
          route: "/api/v1/groups",
          requestBody,
        })
      )
        .assertStatusCode(400)
        .assertError(expectedError);
    },
  );

  it("should return 400 if no group name", async () => {
    (
      await testBuilder.request({
        app,
        type: HTTPRequest.POST,
        route: "/api/v1/groups",
        requestBody: {
          description: requestBody.description,
        },
      })
    )
      .assertStatusCode(400)
      .assertError([
        {
          path: "name",
          message: "Required",
        },
      ]);
  });

  it("should return 400 if name's length > 100 chars", async () => {
    (
      await testBuilder.request({
        app,
        type: HTTPRequest.POST,
        route: "/api/v1/groups",
        requestBody: {
          name: "a".repeat(101),
          description: requestBody.description,
        },
      })
    )
      .assertStatusCode(400)
      .assertError([
        {
          path: "name",
          message: "Name must be at most 100 characters long",
        },
      ]);
  });

  it("should return 400 if description's length > 500 chars", async () => {
    (
      await testBuilder.request({
        app,
        type: HTTPRequest.POST,
        route: "/api/v1/groups",
        requestBody: {
          name: requestBody.name,
          description: "a".repeat(501),
        },
      })
    )
      .assertStatusCode(400)
      .assertError([
        {
          path: "description",
          message: "Description must be at most 500 characters long",
        },
      ]);
  });
});
