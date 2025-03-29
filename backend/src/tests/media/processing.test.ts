import {
    DEARLY_GROUP_ID,
    USER_ALICE_ID,
  } from "./../helpers/test-constants";
  import { Hono } from "hono";
  import { startTestApp } from "../helpers/test-app";
  import { TestBuilder } from "../helpers/test-builder";
  import { generateJWTFromID, generateUUID } from "../helpers/test-token";
  import { HTTPRequest, Status } from "../../constants/http";
  import { resolve } from "node:path";
  const PROJECT_ROOT = resolve(__dirname, "../..");

  describe("POST /media/processing", () => {
    let app: Hono;
    const testBuilder = new TestBuilder();
    const ALICE_JWT = generateJWTFromID(USER_ALICE_ID);
  
    const goodRequestBody = {
        url: PROJECT_ROOT + "/tests/test-assets/test_audio_2.m4a"
    }

    const badRequestBody = {
        url: "random_website.com"
    }

    beforeAll(async () => {
      app = await startTestApp();
    });
  
    it("should return 200 when processing", async () => {
        (
            await testBuilder.request({
              app,
              type: HTTPRequest.POST,
              route: `/api/v1/media/processing`,
              requestBody: {
                ...goodRequestBody,
              },
              autoAuthorized: false,
              headers: {
                Authorization: `Bearer ${ALICE_JWT}`,
              },
            })
        ).assertStatusCode(201)
        .assertField("length", 5)
        .assertArrayFieldExists("data")
    });

    it("should return 400 when file is not from the dearly s3 bucket", async () => {
        (
            await testBuilder.request({
              app,
              type: HTTPRequest.POST,
              route: `/api/v1/media/processing`,
              requestBody: {
                ...badRequestBody,
              },
              autoAuthorized: false,
              headers: {
                Authorization: `Bearer ${ALICE_JWT}`,
              },
            })
        ).assertStatusCode(400)
    });

  });
  