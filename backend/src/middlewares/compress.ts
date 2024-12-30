import { Context, MiddlewareHandler } from "hono";

export const compress = (): MiddlewareHandler => {
  const MIN_COMPRESSION_SIZE: number = 500;

  return async (ctx: Context, next: () => Promise<void>) => {
    await next();

    if (!ctx.res) return;

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
