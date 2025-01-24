import { DeleteObjectCommand, PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { mockClient } from "aws-sdk-client-mock";
import S3Impl from "../../services/s3Service";
import fs from "fs";
import { resolve } from "node:path";
import { NotFoundError } from "../../utilities/errors/app-error";
import { MediaType } from "../../constants/database";
const PROJECT_ROOT = resolve(__dirname, "../..");

describe("S3 Service Testing", () => {
  it("Should return the valid s3 link", async () => {
    const mockS3Client = mockClient(S3Client);
    const client = mockS3Client
      .on(PutObjectCommand)
      .resolves({ Size: 42069 }) as unknown as S3Client;
    let buffer = fs.readFileSync(PROJECT_ROOT + "/tests/test-assets/test_image.tiff");
    let blob = new Blob([buffer]);
    const s3Impl = new S3Impl(client);
    const expected = await s3Impl.saveObject(blob, "test", MediaType.PHOTO);
    expect(expected).not.toBeNull();
    expect(expected.length).toBeGreaterThan(3);
  });

  it("test that delete throws error when url is not found", async () => {
    const mockS3Client = mockClient(S3Client);
    const client = mockS3Client
      .on(DeleteObjectCommand)
      .resolves({ $metadata: { httpStatusCode: 400 } }) as unknown as S3Client;
    const s3Impl = new S3Impl(client);
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
    const s3Impl = new S3Impl(client);
    const res = await s3Impl.deleteObject("");
    expect(res).toBe(true);
  });

  it("test image compression", async () => {
    const mockS3Client = mockClient(S3Client);
    const s3Impl = new S3Impl(mockS3Client as unknown as S3Client);
    let buffer = fs.readFileSync(PROJECT_ROOT + "/tests/test-assets/test_image.tiff");
    let blob = new Blob([buffer]);
    const compressed_image = await s3Impl.compressImage(blob);
    expect(blob.size).toBeGreaterThan(compressed_image.size);
  });

  it("test audio compression", async () => {
    const mockS3Client = mockClient(S3Client);
    const s3Impl = new S3Impl(mockS3Client as unknown as S3Client);
    let buffer = fs.readFileSync(PROJECT_ROOT + "/tests/test-assets/test_audio.m4a");
    let blob = new Blob([buffer]);
    const compressed_audio = await s3Impl.compressAudio(blob);
    expect(blob.size).toBeGreaterThan(compressed_audio.size);
  });
});
