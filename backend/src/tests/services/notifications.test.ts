import { getConfigurations } from "./../../config/config";
import { DeleteObjectCommand, PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { mockClient } from "aws-sdk-client-mock";
import { NotFoundError } from "../../utilities/errors/app-error";
import { ExpoNotificationService, INotificationService } from "../../services/notificationsService";
import { connectDB } from "../../database/connect";
import {
  USER_ANA_ID,
  USER_BOB_ID,
  USER_ALICE_ID,
  INVALID_ID_ARRAY,
} from "./../helpers/test-constants";
import { Hono } from "hono";
import { TestBuilder } from "../helpers/test-builder";
import { generateJWTFromID } from "../helpers/test-token";
import { startTestApp } from "../helpers/test-app";
import { chunkPushNotificationsSpy } from "../helpers/mock";

describe("S3 Service Testing", () => {
  let app: Hono;
  const testBuilder = new TestBuilder();

  const ALICE_JWT = generateJWTFromID(USER_ALICE_ID);

  beforeAll(async () => {
    app = await startTestApp();
  });

  beforeEach(() => {
    // to reset number of times its method gets called
    chunkPushNotificationsSpy.mockClear();
  });

  const config = getConfigurations().s3Config;

  it("Should throw error for invalid userID", async () => {
    const config = getConfigurations();
    const db = connectDB(config);
    const notifService: INotificationService = new ExpoNotificationService(config, db);

    let expected;
    try {
      expected = notifService.unsubscribe("123456");
      expect(expected).toBe(NotFoundError);
    } catch (Error: unknown) {
      expect(Error);
    }
  });
});
