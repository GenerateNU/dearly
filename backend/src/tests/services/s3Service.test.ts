import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { mockClient } from "aws-sdk-client-mock";
import S3Impl from "../../services/s3Service";
import fs from "fs";
import { resolve } from "node:path";

const PROJECT_ROOT = resolve(__dirname, "../..");

describe("Save an object to s3 testing", () => {
  it("Should return the valid s3 link", async () => {
    const mockS3Client = mockClient(S3Client);
    const client = mockS3Client
      .on(PutObjectCommand)
      .resolves({ Size: 42069 }) as unknown as S3Client;
    let buffer = fs.readFileSync(PROJECT_ROOT + "/../../frontend/assets/icon.png");
    let blob = new Blob([buffer]);
    const s3Impl = new S3Impl(client);
    const expected = await s3Impl.saveObject(blob, "test", "image");
    const expectedString = "https://dearly.s3.amazonaws.com/";
    expect(expected).not.toBeNull();
    expect(expected).toContain(expectedString);
  });
});
