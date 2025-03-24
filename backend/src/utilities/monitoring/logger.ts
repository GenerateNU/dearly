import pino from "pino";

const logger = pino({
  level:
    process.env.NODE_ENV === "production"
      ? "warn"
      : process.env.NODE_ENV === "test"
        ? "silent"
        : "debug",
  transport:
    process.env.NODE_ENV === "production"
      ? undefined
      : { target: "pino-pretty", options: { colorize: true } },
});

export default logger;
