import { Context, MiddlewareHandler } from "hono";

/**
 * Middleware for logging HTTP request details including method, path, status, and response time.
 *
 * This middleware logs the following information about each HTTP request:
 * - **Method**: The HTTP method used for the request (e.g., GET, POST).
 * - **Path**: The URL path of the request.
 * - **Status**: The HTTP response status code.
 * - **Duration**: The time it took to process the request, in milliseconds.
 * - **Timestamp**: The exact time of the request, formatted as `YYYY-MM-DD HH:MM:SS`.
 *
 * The log is output to the console in the following format:
 * ```
 * [YYYY-MM-DD HH:MM:SS] METHOD /path - STATUS_CODE - duration_ms
 * ```
 *
 * **How it works:**
 * - The middleware first captures the start time of the request.
 * - It waits for the request to be processed by invoking the `next()` handler.
 * - Once the request is completed, it calculates the response time (duration).
 * - The method logs the relevant details (method, path, status, duration, timestamp) to the console.
 *
 * **Log Format:**
 * ```
 * [YYYY-MM-DD HH:MM:SS] METHOD /path - STATUS_CODE - duration_ms
 * ```
 *
 * **Example Output:**
 * ```
 * [2025-03-22 14:30:21] GET /api/users - 200 - 25.123ms
 * ```
 *
 * @returns A middleware handler that logs request details and execution time.
 */
export const logger: MiddlewareHandler = async (ctx: Context, next: () => Promise<void>) => {
  const { method, path } = ctx.req;
  const start = performance.now();

  await next();

  const duration = performance.now() - start;

  const status = ctx.res.status;

  const now = new Date();
  const formattedTime = now.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });

  console.log(
    `[${now.toISOString().split("T")[0]} ${formattedTime}] ${method} ${path} - ${status} - ${duration.toFixed(3)}ms`,
  );
};
