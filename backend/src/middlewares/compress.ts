import { Context, MiddlewareHandler } from "hono";

/**
 * Middleware to apply gzip compression to response bodies based on content type and size.
 *
 * This middleware checks the response content type and compresses the response body using
 * gzip if the content type is suitable (e.g., `text/*`, `application/json`, etc.) and the response
 * body exceeds a certain minimum size threshold.
 *
 * **How it works:**
 * - The middleware first checks if the response body is large enough (above the `MIN_COMPRESSION_SIZE`).
 * - If the body is suitable for compression and the content type matches the target types (e.g., text, JSON),
 *   the middleware compresses the response body using gzip.
 * - The response is then updated with the `Content-Encoding: gzip` header and the compressed body is returned.
 *
 * **Content Types Supported for Compression:**
 * - `text/*`
 * - `application/json`
 * - `application/javascript`
 * - `application/xml`
 * - `application/x-www-form-urlencoded`
 *
 * **Compression Criteria:**
 * - The response body must be larger than `MIN_COMPRESSION_SIZE` (500 bytes by default).
 *
 * @returns A middleware handler that compresses the response body using gzip if applicable.
 */
export const compress = (): MiddlewareHandler => {
  const MIN_COMPRESSION_SIZE: number = 500;

  return async (ctx: Context, next: () => Promise<void>) => {
    await next();

    if (!ctx.res) return;

    // Check if the response content type should be compressed
    const contentType = ctx.res.headers.get("content-type") || "";
    const shouldCompress = [
      "text/",
      "application/json",
      "application/javascript",
      "application/xml",
      "application/x-www-form-urlencoded",
    ].some((type) => contentType.includes(type));

    let originalBody;
    try {
      originalBody = await ctx.res.clone().arrayBuffer();
    } catch {
      return;
    }

    // If compression is not needed or response is too small, return
    if (!shouldCompress || originalBody.byteLength < MIN_COMPRESSION_SIZE) {
      return;
    }

    // Compress the response body using gzip
    const compressedBody = Bun.gzipSync(new Uint8Array(originalBody));

    const newHeaders = new Headers(ctx.res.headers);
    newHeaders.set("content-encoding", "gzip");

    // Replace the response with compressed version
    ctx.res = new Response(compressedBody, {
      status: ctx.res.status,
      headers: newHeaders,
    });
  };
};
