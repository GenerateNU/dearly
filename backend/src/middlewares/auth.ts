import * as jwt from "jsonwebtoken";
import { Context, Next } from "hono";
import { validate } from "uuid";

export const isAuthorized = (jwtSecretKey: string) => {
  return async (ctx: Context, next: Next) => {
    const authHeader = ctx.req.header("Authorization");

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return ctx.json({ error: "Unauthorized" }, 401);
    }

    const token = authHeader.split(" ")[1];

    try {
      const decoded = jwt.verify(token!, jwtSecretKey) as jwt.JwtPayload;

      if (!decoded.sub || !validate(decoded.sub)) {
        return ctx.json({ error: "Unauthorized" }, 401);
      }

      const userId = decoded.sub;

      ctx.set("userId", userId);
      await next();
    } catch {
      return ctx.json({ error: "Unauthorized" }, 401);
    }
  };
};
