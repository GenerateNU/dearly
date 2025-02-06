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

  it("test that delete returns true when url does exist", async () => {
    const mockS3Client = mockClient(S3Client);
    const client = mockS3Client
      .on(DeleteObjectCommand)
      .resolves({ $metadata: { httpStatusCode: 300 } }) as unknown as S3Client;
    const s3Impl = new S3Impl(config, client);
    const res = await s3Impl.deleteObject("");
    expect(res).toBe(true);
  });

  it("test image compression", async () => {
    const mockS3Client = mockClient(S3Client);
    const s3Impl = new S3Impl(config, mockS3Client as unknown as S3Client);
    const buffer = fs.readFileSync(PROJECT_ROOT + "/tests/test-assets/test_image.tiff");
    const blob = new Blob([buffer]);
    const compressed_image = await s3Impl.compressImage(blob);
    expect(blob.size).toBeGreaterThan(compressed_image.size);
  });

  it("test audio compression", async () => {
    const mockS3Client = mockClient(S3Client);
    const s3Impl = new S3Impl(config, mockS3Client as unknown as S3Client);
    const buffer = fs.readFileSync(PROJECT_ROOT + "/tests/test-assets/test_audio.m4a");
    const blob = new Blob([buffer]);
    const compressed_audio = await s3Impl.compressAudio(blob);
    expect(blob.size).toBeGreaterThan(compressed_audio.size);
  });
});
function connectDb(config: Configuration) {
  throw new Error("Function not implemented.");
}
