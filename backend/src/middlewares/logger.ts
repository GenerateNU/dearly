import { Context, MiddlewareHandler } from "hono";

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
