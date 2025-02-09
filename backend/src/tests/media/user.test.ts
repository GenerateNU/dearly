import { USER_ALICE_ID } from "../helpers/test-constants";
import { Hono } from "hono";
import { startTestApp } from "../helpers/test-app";
import { TestBuilder } from "../helpers/test-builder";
import { generateJWTFromID } from "../helpers/test-token";
import { HTTPRequest, Status } from "../../constants/http";
import { resolve } from "node:path";
const PROJECT_ROOT = resolve(__dirname, "../..");
import fs from "fs";

describe("POST /users/media", () => {
  let app: Hono;
  const testBuilder = new TestBuilder();

  const ALICE_JWT = generateJWTFromID(USER_ALICE_ID);
  const formData = new FormData();
  const image = fs.readFileSync(PROJECT_ROOT + "/tests/test-assets/test_image.tiff");
  const imageFile = new File([image], "test_image.tiff");
  formData.append("media", imageFile);

  beforeAll(async () => {
    app = await startTestApp();
  });

  it("should return 201 if upload one image", async () => {
    const formData = new FormData();
    const buffer = fs.readFileSync(PROJECT_ROOT + "/tests/test-assets/test_image.tiff");
    const blob = new Blob([buffer]);
    formData.append("media", blob);

    (
      await testBuilder.request({
        app,
        type: HTTPRequest.POST,
        route: `/api/v1/users/media`,
        autoAuthorized: false,
        headers: {
          Authorization: `Bearer ${ALICE_JWT}`,
        },
        requestBody: formData,
      })
    )
      .assertStatusCode(Status.Created)
      .assertField("type", "PHOTO")
      .assertFieldExists("objectKey");
  });

  it("should return 400 if unsupported media type", async () => {
    const formData = new FormData();
    const text = fs.readFileSync(PROJECT_ROOT + "/tests/test-assets/test_invalid_filetype.txt");
    const file = new File([text], "test_invalid_filetype.txt");
    formData.append("media", file);

    (
      await testBuilder.request({
        app,
        type: HTTPRequest.POST,
        route: `/api/v1/users/media`,
        autoAuthorized: false,
        headers: {
          Authorization: `Bearer ${ALICE_JWT}`,
        },
        requestBody: formData,
      })
    )
      .assertStatusCode(Status.BadRequest)
      .assertError("Invalid media type");
  });

  it("should return 400 if no media field", async () => {
    (
      await testBuilder.request({
        app,
        type: HTTPRequest.POST,
        route: `/api/v1/users/media`,
        autoAuthorized: false,
        headers: {
          Authorization: `Bearer ${ALICE_JWT}`,
        },
      })
    )
      .assertStatusCode(Status.BadRequest)
      .assertError("No media found");
  });
});
