import {
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
  const expected = [
    {
      data: [
        {
          day: 31,
          objectKey: "photo1",
        },
      ],
      month: 12,
      year: 1969,
    },
  ];

  beforeAll(async () => {
    app = await startTestApp();
  });

  it("should return 200 if valid pivot value and default range", async () => {
    (
      await testBuilder.request({
        app,
        type: HTTPRequest.GET,
        route: `/api/v1/groups/${DEARLY_GROUP_ID}/calendar`,
        autoAuthorized: false,
        headers: {
          Authorization: `Bearer ${generateJWTFromID(USER_ALICE_ID)}`,
        },
        queryParams: {
          pivot: "1969-12",
        },
      })
    )
      .assertStatusCode(Status.OK)
      .assertBody(expected);
  });

  it("should return 200 if correct pivot value", async () => {
    (
      await testBuilder.request({
        app,
        type: HTTPRequest.GET,
        route: `/api/v1/groups/${DEARLY_GROUP_ID}/calendar`,
        autoAuthorized: false,
        headers: {
          Authorization: `Bearer ${generateJWTFromID(USER_ALICE_ID)}`,
        },
        queryParams: {
          // should return thumbnail if 3 months back into the past
          pivot: "1970-02",
          range: "3",
        },
      })
    )
      .assertStatusCode(Status.OK)
      .assertBody(expected);
  });

  it.each(["bad", "-1", "0", "???"])("should return 400 if bad range %s", async (badRange) => {
    (
      await testBuilder.request({
        app,
        type: HTTPRequest.GET,
        route: `/api/v1/groups/${generateUUID()}/calendar`,
        autoAuthorized: false,
        headers: {
          Authorization: `Bearer ${generateJWTFromID()}`,
        },
        queryParams: {
          range: badRange,
        },
      })
    )
      .assertStatusCode(Status.BadRequest)
      .assertError([
        {
          message: "Range must be a positive number",
          path: "range",
        },
      ]);
  });

  it.each(["bad", "-1", "0", "???", "2025-01-23", "2019-11-14T00:55:31.820Z"])(
    "should return 400 if bad date format %s",
    async (badDate) => {
      (
        await testBuilder.request({
          app,
          type: HTTPRequest.GET,
          route: `/api/v1/groups/${generateUUID()}/calendar`,
          autoAuthorized: false,
          headers: {
            Authorization: `Bearer ${generateJWTFromID()}`,
          },
          queryParams: {
            pivot: badDate,
          },
        })
      )
        .assertStatusCode(Status.BadRequest)
        .assertError([
          {
            message: "Date must be in YYYY-MM format and cannot be in future",
            path: "pivot",
          },
        ]);
    },
  );

  it.each([
    ["month", `${new Date().getFullYear()}-0${new Date().getMonth() + 2}`],
    ["year", `${new Date().getFullYear() + 1}-0${new Date().getMonth() + 1}`],
  ])("should return 400 if future value of %s with %s", async (_, value) => {
    (
      await testBuilder.request({
        app,
        type: HTTPRequest.GET,
        route: `/api/v1/groups/${generateUUID()}/calendar`,
        autoAuthorized: false,
        headers: {
          Authorization: `Bearer ${generateJWTFromID()}`,
        },
        queryParams: {
          pivot: value,
        },
      })
    )
      .assertStatusCode(Status.BadRequest)
      .assertError([
        {
          message: "Date must be in YYYY-MM format and cannot be in future",
          path: "pivot",
        },
      ]);
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
