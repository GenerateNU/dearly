import { Hono } from "hono";
import { isAuthorized } from "../../middlewares/auth";
import {
  generateExpiredJWT,
  generateJWTForTesting,
  generateJWTToken,
  generateUUID,
} from "../helpers/test-token";
import { Configuration } from "../../types/config";
import { getConfigurations } from "../../config/config";
import { TestBuilder } from "../helpers/test-builder";
import * as jwt from "jsonwebtoken";
import { Context } from "hono";

describe("Authorization Middleware", () => {
  let app: Hono;
  const testBuilder = new TestBuilder();
  const config: Configuration = getConfigurations();

  beforeEach(() => {
    app = new Hono();

    app.use(isAuthorized(config.authorization.jwtSecretKey));

    app.get("/protected", (ctx: Context) => {
      const userId = ctx.get("userId");
      return ctx.json({ message: "Authorized", sub: userId });
    });
  });

  it("should return 401 if no Authorization header is provided", async () => {
    (
      await testBuilder.request({
        app,
        route: "/protected",
        autoAuthorized: false,
      })
    )
      .assertStatusCode(401)
      .assertMessage("Unauthorized");
  });

  it("should return 401 if Authorization header doesn't start with Bearer", async () => {
    (
      await testBuilder.request({
        app,
        route: "/protected",
        autoAuthorized: false,
        headers: {
          Authorization: "Basic invalidToken",
        },
      })
    )
      .assertStatusCode(401)
      .assertMessage("Unauthorized");
  });

  it("should return 401 if token is invalid", async () => {
    (
      await testBuilder.request({
        app,
        route: "/protected",
        autoAuthorized: false,
        headers: {
          Authorization: "Bearer invalidtoken",
        },
      })
    )
      .assertStatusCode(401)
      .assertMessage("Unauthorized");
  });

  it("should return 401 if token has expired", async () => {
    const expiredToken = generateExpiredJWT(config.authorization.jwtSecretKey);
    (
      await testBuilder.request({
        app,
        route: "/protected",
        autoAuthorized: false,
        headers: {
          Authorization: `Bearer ${expiredToken}`,
        },
      })
    )
      .assertStatusCode(401)
      .assertMessage("Unauthorized");
  });

  it("should return 200 if token is valid", async () => {
    const validToken = generateJWTForTesting(config.authorization.jwtSecretKey);
    (
      await testBuilder.request({
        app,
        route: "/protected",
        autoAuthorized: false,
        headers: {
          Authorization: `Bearer ${validToken}`,
        },
      })
    )
      .assertStatusCode(200)
      .assertMessage("Authorized");
  });

  it("should return 401 if decoded JWT sub field is not UUID", async () => {
    const noSubFieldJWT = generateJWTToken(3600, config.authorization.jwtSecretKey, "not uuid");
    (
      await testBuilder.request({
        app,
        route: "/protected",
        autoAuthorized: false,
        headers: {
          Authorization: `Bearer ${noSubFieldJWT}`,
        },
      })
    )
      .assertStatusCode(401)
      .assertMessage("Unauthorized");
  });

  it("should return 401 if decoded JWT has no sub field", async () => {
    const now = Math.floor(Date.now() / 1000);
    const payload = {
      iat: now,
      exp: now + 3600,
    };
    const noSubFieldJWT = jwt.sign(payload, config.authorization.jwtSecretKey);
    (
      await testBuilder.request({
        app,
        route: "/protected",
        autoAuthorized: false,
        headers: {
          Authorization: `Bearer ${noSubFieldJWT}`,
        },
      })
    )
      .assertStatusCode(401)
      .assertMessage("Unauthorized");
  });

  it("decoded sub should match given ID when encode in sub", async () => {
    const uuid = generateUUID();
    const generatedJWT = generateJWTToken(3600, config.authorization.jwtSecretKey, uuid);
    (
      await testBuilder.request({
        app,
        route: "/protected",
        autoAuthorized: false,
        headers: {
          Authorization: `Bearer ${generatedJWT}`,
        },
      })
    )
      .assertStatusCode(200)
      .assertBody({
        message: "Authorized",
        sub: uuid,
      });
  });
});
