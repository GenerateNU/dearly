import {
  USER_ANA_ID,
  USER_ALICE_ID,
  INVALID_ID_ARRAY,
  DEARLY_GROUP_ID,
} from "../helpers/test-constants";
import { Hono } from "hono";
import { startTestApp } from "../helpers/test-app";
import { TestBuilder } from "../helpers/test-builder";
import { generateJWTFromID, generateUUID } from "../helpers/test-token";
import { HTTPRequest, Status } from "../../constants/http";
import { resolve } from "node:path";
const PROJECT_ROOT = resolve(__dirname, "../..");
import fs from "fs";

describe("POST /groups/:id/media", () => {
  let app: Hono;
  const testBuilder = new TestBuilder();

  const ALICE_JWT = generateJWTFromID(USER_ALICE_ID);
  const ANA_JWT = generateJWTFromID(USER_ANA_ID);
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
        route: `/api/v1/groups/${DEARLY_GROUP_ID}/media`,
        autoAuthorized: false,
        headers: {
          Authorization: `Bearer ${ALICE_JWT}`,
        },
        requestBody: formData,
      })
    )
      .assertStatusCode(Status.Created)
      .assertArraySize(1)
      .assertArrayFieldExists("objectKey")
      .assertArrayFieldExists("type");
  });

  it("should return 201 if upload more than one media (image and audio)", async () => {
    const audio = fs.readFileSync(PROJECT_ROOT + "/tests/test-assets/test_audio.m4a");
    const audioFile = new File([audio], "test_audio.m4a");
    formData.append("media", audioFile);

    (
      await testBuilder.request({
        app,
        type: HTTPRequest.POST,
        route: `/api/v1/groups/${DEARLY_GROUP_ID}/media`,
        autoAuthorized: false,
        headers: {
          Authorization: `Bearer ${ALICE_JWT}`,
        },
        requestBody: formData,
      })
    )
      .assertStatusCode(Status.Created)
      .assertArraySize(2)
      .assertArrayFieldExists("objectKey")
      .assertArrayFieldExists("type");
  });

  it("should return 400 if media type is not PHOTO or AUDIO", async () => {
    const formData = new FormData();
    const text = fs.readFileSync(PROJECT_ROOT + "/tests/test-assets/test_invalid_filetype.txt");
    const file = new File([text], "test_invalid_filetype.txt");
    formData.append("media", file);

    (
      await testBuilder.request({
        app,
        type: HTTPRequest.POST,
        route: `/api/v1/groups/${DEARLY_GROUP_ID}/media`,
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

  it("should return 403 if user not member of group", async () => {
    const formData = new FormData();
    const buffer = fs.readFileSync(PROJECT_ROOT + "/tests/test-assets/test_image.tiff");
    const blob = new Blob([buffer]);
    formData.append("media", blob);

    (
      await testBuilder.request({
        app,
        type: HTTPRequest.POST,
        route: `/api/v1/groups/${DEARLY_GROUP_ID}/media`,
        autoAuthorized: false,
        headers: {
          Authorization: `Bearer ${ANA_JWT}`,
        },
        requestBody: formData,
      })
    ).assertStatusCode(Status.Forbidden);
  });

  it("should return 404 if group does not exist", async () => {
    const formData = new FormData();
    const buffer = fs.readFileSync(PROJECT_ROOT + "/tests/test-assets/test_image.tiff");
    const blob = new Blob([buffer]);
    formData.append("media", blob);

    (
      await testBuilder.request({
        app,
        type: HTTPRequest.POST,
        route: `/api/v1/groups/${generateUUID()}/media`,
        autoAuthorized: false,
        headers: {
          Authorization: `Bearer ${ALICE_JWT}`,
        },
        requestBody: formData,
      })
    )
      .assertStatusCode(Status.NotFound)
      .assertError("Group does not exist.");
  });

  it("should return 400 if no media field", async () => {
    (
      await testBuilder.request({
        app,
        type: HTTPRequest.POST,
        route: `/api/v1/groups/${generateUUID()}/media`,
        autoAuthorized: false,
        headers: {
          Authorization: `Bearer ${ALICE_JWT}`,
        },
      })
    )
      .assertStatusCode(Status.BadRequest)
      .assertError("No media found");
  });

  it.each(
    INVALID_ID_ARRAY.map((id) => [id === null ? "null" : id === undefined ? "undefined" : id, id]),
  )("should return 400 if invalid ID %s", async (id) => {
    (
      await testBuilder.request({
        app,
        type: HTTPRequest.POST,
        route: `/api/v1/groups/${id}/media`,
      })
    )
      .assertStatusCode(Status.BadRequest)
      .assertError("Invalid ID format");
  });
});
