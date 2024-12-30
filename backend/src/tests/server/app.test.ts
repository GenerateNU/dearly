import { Hono } from "hono";
import { startTestApp } from "../helpers/test-app";
import { TestBuilder } from "../helpers/test-builder";

describe("Healthcheck and Routes", () => {
  let app: Hono;
  const testBuilder = new TestBuilder();

  beforeEach(async () => {
    app = await startTestApp();
  });

  it("should return OK for healthcheck", async () => {
    (
      await testBuilder.request({
        app,
        route: "/healthcheck",
      })
    )
      .assertStatusCode(200)
      .assertBody({ message: "OK" });
  });

  it("should return 404 if invalid route and authorized", async () => {
    (
      await testBuilder.request({
        app,
        route: "/api/v1",
      })
    ).assertStatusCode(404);
  });

  it("should return 401 if unauthorized", async () => {
    (
      await testBuilder.request({
        app,
        route: "/api/v1",
        autoAuthorized: false,
      })
    ).assertStatusCode(401);
  });
});
