import * as jwt from "jsonwebtoken";
import { Context, Next } from "hono";
import { validate } from "uuid";

/**
 * Middleware for verifying the authenticity of a JWT token in the `Authorization` header.
 *
 * This middleware checks if the incoming request contains a valid Bearer token in the `Authorization` header,
 * verifies the token using a provided JWT secret key, and extracts the user ID (`sub`) from the decoded payload.
 * If the token is valid, the user ID is added to the context (`ctx.set("userId", userId)`) for use in subsequent middleware or handlers.
 * If the token is missing, invalid, or expired, a 401 Unauthorized response is returned.
 *
 * @param jwtSecretKey - The secret key used to verify the JWT token.
 * @returns An asynchronous middleware function that performs authorization checks and passes control to the next handler.
 */
export const isAuthorized = (jwtSecretKey: string) => {
  return async (ctx: Context, next: Next) => {
    const authHeader = ctx.req.header("Authorization");

    // Check if the Authorization header exists and starts with "Bearer "
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return ctx.json({ error: "Unauthorized" }, 401); // Respond with 401 if not valid
    }

    const token = authHeader.split(" ")[1];

    // If no token exists, return 401 Unauthorized
    if (!token) {
      return ctx.json({ error: "Unauthorized" }, 401);
    }

    try {
      // Verify the token and extract the payload
      const decoded = jwt.verify(token, jwtSecretKey) as jwt.JwtPayload;

      // Ensure the 'sub' field exists and is a valid UUID
      if (!decoded.sub || !validate(decoded.sub)) {
        return ctx.json({ error: "Unauthorized" }, 401); // Invalid user ID in token
      }

      const userId = decoded.sub;

      // Add the user ID to the request context
      ctx.set("userId", userId);

      // Proceed to the next middleware/handler
      await next();
    } catch {
      // Catch any errors related to token verification and respond with 401 Unauthorized
      return ctx.json({ error: "Unauthorized" }, 401);
    }
  };
};
