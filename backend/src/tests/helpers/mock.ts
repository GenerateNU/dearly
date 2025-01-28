import { mock, jest } from "bun:test";
import { MOCK_SIGNED_URL } from "./test-constants";

mock.module("@aws-sdk/s3-request-presigner", () => {
  return {
    getSignedUrl: jest.fn().mockResolvedValue(MOCK_SIGNED_URL),
  };
});
