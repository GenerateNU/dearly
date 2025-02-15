import { getConfigurations } from "./../../config/config";
import { DeleteObjectCommand, PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { mockClient } from "aws-sdk-client-mock";
import { NotFoundError } from "../../utilities/errors/app-error";
import { ExpoNotificationService, INotificationService } from "../../services/notificationsService";
import { connectDB } from "../../database/connect";
import { USER_JOSH, USER_Josh_ID, USER_NUBS } from "./../helpers/test-constants";
import { eq, and, sql } from "drizzle-orm";
import { Hono } from "hono";
import { TestBuilder } from "../helpers/test-builder";
import { generateJWTFromID } from "../helpers/test-token";
import { startTestApp } from "../helpers/test-app";
import { chunkPushNotificationsSpy } from "../helpers/mock";
import { membersTable } from "../../entities/schema";
import { seedDatabase } from "../helpers/seed-db";

describe("S3 Service Testing", () => {
  let app: Hono;
  const testBuilder = new TestBuilder();

  const JOSH_JWT = generateJWTFromID(USER_JOSH.id);
  const NUBS_JWT = generateJWTFromID(USER_NUBS.id);

  beforeAll(async () => {
    app = await startTestApp();
  });

  beforeEach(() => {
    // to reset number of times its method gets called
    chunkPushNotificationsSpy.mockClear();
  });

  it("Unsubscribe: Should throw error for invalid userID", async () => {
    const config = getConfigurations();
    const db = connectDB(config);
    const notifService: INotificationService = new ExpoNotificationService(config, db);

    let expected;
    try {
      expected = await notifService.unsubscribe("123456");
      expect(expected).toBe(NotFoundError);
    } catch (Error: unknown) {
      expect(Error);
    }
  });

  it("Unsubscribe: Should unsubscribe user from notifications", async () => {
    const config = getConfigurations();
    const db = connectDB(config);
    const notifService: INotificationService = new ExpoNotificationService(config, db);

    let expected;
    try {
      const [preResult] = await db
        .select()
        .from(membersTable)
        .where(eq(membersTable.userId, USER_Josh_ID));
      expected = preResult?.notificationsEnabled;
      expect(expected).toBe(true);

      notifService.unsubscribe(USER_Josh_ID);

      const [endResult] = await db
        .select()
        .from(membersTable)
        .where(eq(membersTable.userId, USER_Josh_ID));
      expected = endResult?.notificationsEnabled;
      expect(expected).not.toBe(NotFoundError);
      expect(expected).toBe(false);
    } catch (Error: unknown) {
      expect(Error);
    }
  });
});
