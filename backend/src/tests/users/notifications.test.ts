import { Hono } from "hono";
import { startTestApp } from "../helpers/test-app";
import { TestBuilder } from "../helpers/test-builder";
import { generateJWTFromID } from "../helpers/test-token";
import { HTTPRequest, Status } from "../../constants/http";
import { USER_ANA, USER_BOB, USER_ALICE, USER_BILL } from "../helpers/test-constants";

describe("GET /users/notifications", () => {
    let app: Hono;
    const testBuilder = new TestBuilder();
  
    beforeAll(async () => {
      app = await startTestApp();
    });
    const ANA = {
      username: USER_ANA.username,
      name: USER_ANA.name,
      id: USER_ANA.id,
      profilePhoto: null,
      isMember: false,
      lastNudgedAt: null,
    };
  
    const BOB = {
      username: USER_BOB.username,
      name: USER_BOB.name,
      id: USER_BOB.id,
      profilePhoto: null,
      isMember: true,
      lastNudgedAt: null,
    };
  
    const BILL = {
      username: USER_BILL.username,
      name: USER_BILL.name,
      id: USER_BILL.id,
      profilePhoto: null,
      isMember: false,
      lastNudgedAt: null,
    };
  
    it.each([
      ["bob", [BOB, ANA, BILL]],
      ["ana", [ANA, BOB, BILL]],
      ["bill", [BILL, BOB, ANA]],
    ])("should return 200 if is manager with query param %s", async (username, expectedBody) => {


    });