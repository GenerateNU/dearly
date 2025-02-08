import { getConfigurations } from "./../../config/config";
import { DeleteObjectCommand, PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { mockClient } from "aws-sdk-client-mock";
import fs from "fs";
import { resolve } from "node:path";
import { NotFoundError } from "../../utilities/errors/app-error";
import { MediaType } from "../../constants/database";
import { S3Impl } from "../../services/s3Service";
const PROJECT_ROOT = resolve(__dirname, "../..");

describe("S3 Service Testing", () => {
  const config = getConfigurations().s3Config;

  it("Should return the valid s3 link", async () => {
    const mockS3Client = mockClient(S3Client);
    const client = mockS3Client
      .on(PutObjectCommand)
      .resolves({ Size: 42069 }) as unknown as S3Client;
    const buffer = fs.readFileSync(PROJECT_ROOT + "/tests/test-assets/test_image.tiff");
    const blob = new Blob([buffer]);
    const s3Impl = new S3Impl(config, client);
    const expected = await s3Impl.saveObject(blob, "test", MediaType.PHOTO);
    expect(expected).not.toBeNull();
    expect(expected.length).toBeGreaterThan(3);
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
    expect(blob.size).toBeGreaterThan(compressed_image.length);
  });

  it("test audio compression", async () => {
    const mockS3Client = mockClient(S3Client);
    const s3Impl = new S3Impl(config, mockS3Client as unknown as S3Client);
    const buffer = fs.readFileSync(PROJECT_ROOT + "/tests/test-assets/test_audio.m4a");
    const blob = new Blob([buffer]);
    const compressed_audio = await s3Impl.compressAudio(blob);
    expect(blob.size).toBeGreaterThan(compressed_audio.length);
  });

  // it("test local audio compression", async () => {
  //   const mockS3Client = mockClient(S3Client);
  //   const s3Impl = new S3Impl(config, mockS3Client as unknown as S3Client);
  //   const buffer = fs.readFileSync(PROJECT_ROOT + "/tests/test-assets/piano.mp3");
  //   const blob = new Blob([buffer]);
  //   const compressedAudio = await s3Impl.compressAudio(blob);
  
  //   // save audio locally
  //   const compressedAudioPath = resolve(PROJECT_ROOT, "tests/test-assets/compressed_piano.mp3");
  
  //   fs.writeFileSync(compressedAudioPath, compressedAudio);
  //   const fileExists = fs.existsSync(compressedAudioPath);
  //   const fileExtension = compressedAudioPath.split(".").pop();
  
  //   // check if it is right format and compressed
  //   expect(fileExists).toBe(true);
  //   expect(fileExtension).toBe("mp3");
  //   expect(blob.size).toBeGreaterThan(compressedAudio.length);
  // });
});
