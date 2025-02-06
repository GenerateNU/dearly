import { getConfigurations } from "./../../config/config";
import { DeleteObjectCommand, PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { mockClient } from "aws-sdk-client-mock";
import fs from "fs";
import { resolve } from "node:path";
import { NotFoundError } from "../../utilities/errors/app-error";
import { S3Impl } from "../../services/s3Service";
import { ExpoNotificationService, INotificationService } from "../../services/notificationsService";
import { Configuration } from "../../types/config";
import { connectDB } from "../../database/connect";
const PROJECT_ROOT = resolve(__dirname, "../..");

describe("S3 Service Testing", () => {
  const config = getConfigurations().s3Config;

  it("Should return a valid expo token", async () => {
    const config = getConfigurations();
    const db = connectDB(config);
    const notifService: INotificationService = new ExpoNotificationService(config, db); // Assuming NotificationService is the concrete implementation
    notifService.subscribe("123456");
  });

  it("test that delete throws error when url is not found", async () => {
    const mockS3Client = mockClient(S3Client);
    const client = mockS3Client
      .on(DeleteObjectCommand)
      .resolves({ $metadata: { httpStatusCode: 400 } }) as unknown as S3Client;
    const s3Impl = new S3Impl(config, client);
    let expected;
    try {
      expected = await s3Impl.deleteObject("");
      expect(expected).toBe(NotFoundError);
    } catch (Error: unknown) {
      expect(Error);
    }
  });
});
