import { USER_ALICE_ID } from "./../helpers/test-constants";
import { Hono } from "hono";
import { startTestApp } from "../helpers/test-app";
import { TestBuilder } from "../helpers/test-builder";
import { generateJWTFromID } from "../helpers/test-token";
import { HTTPRequest, Status } from "../../constants/http";
import { resolve } from "node:path";
const PROJECT_ROOT = resolve(__dirname, "../..");

describe("GET /media/processing", () => {
  let app: Hono;
  const testBuilder = new TestBuilder();
  const ALICE_JWT = generateJWTFromID(USER_ALICE_ID);

  beforeAll(async () => {
    app = await startTestApp();
  });

  it("should return 200 when processing", async () => {
    (
      await testBuilder.request({
        app,
        type: HTTPRequest.GET,
        route: `/api/v1/media/processing`,
        autoAuthorized: false,
        queryParams: {
          url: PROJECT_ROOT + "/tests/test-assets/test_audio_2.m4a",
        },
        headers: {
          Authorization: `Bearer ${ALICE_JWT}`,
        },
      })
    )
      .assertStatusCode(Status.OK)
      .assertField("length", 6)
      .assertArrayFieldExists("data");
  });
});
