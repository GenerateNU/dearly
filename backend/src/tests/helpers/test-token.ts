import * as jwt from "jsonwebtoken";
import { v4 as uuidv4 } from "uuid";

export const generateJWTToken = (
  validDuration: number,
  secretKey: string,
  sub: string | undefined = generateUUID(),
) => {
  const now = Math.floor(Date.now() / 1000);
  const expirationTime = now + validDuration;

  const finalPayload = {
    sub,
    iat: now,
    exp: expirationTime,
  };

  const token = jwt.sign(finalPayload, secretKey);
  return token;
};

export const generateJWTForTesting = (secretKey: string) => {
  return generateJWTToken(60 * 60 * 5, secretKey);
};

export const generateExpiredJWT = (secretKey: string): string => {
  const expiredTime = Math.floor(Date.now() / 1000) - 3600;
  const finalPayload = {
    sub: generateUUID(),
    iat: Math.floor(Date.now() / 1000),
    exp: expiredTime,
  };

  return jwt.sign(finalPayload, secretKey);
};

export const generateUUID = (): string => {
  return uuidv4();
};
