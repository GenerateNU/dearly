import {
  USER_ANA_ID,
  USER_BOB_ID,
  DEARLY_GROUP_ID,
  USER_ALICE_ID,
  POST_ID,
  POST_MOCK,
  MEDIA_MOCK,
  INVALID_ID_ARRAY,
  USER_BOB,
  USER_BILL_ID,
} from "./../helpers/test-constants";
import { Hono } from "hono";
import { startTestApp } from "../helpers/test-app";
import { TestBuilder } from "../helpers/test-builder";
import { generateJWTFromID, generateUUID } from "../helpers/test-token";
import { HTTPRequest, Status } from "../../constants/http";

describe.only("GET /members", () => {
  let app: Hono;
  const testBuilder = new TestBuilder();

  const ALICE_JWT = generateJWTFromID(USER_ALICE_ID);
  const BOB_JWT = generateJWTFromID(USER_BOB_ID);
  const ANA_JWT = generateJWTFromID(USER_ANA_ID);
  const BILL_JWT = generateJWTFromID(USER_BILL_ID);

  beforeAll(async () => {
    app = await startTestApp();
  });

  async function addMember(memberId: string) {
    (
      await testBuilder.request({
        app,
        type: HTTPRequest.POST,
        route: `/api/v1/groups/${DEARLY_GROUP_ID}/members/${memberId}`,
      })
    ).assertStatusCode(Status.Created);
  }

  it("should return 200 and a list of all members when requested by member or manager", async () => {
    await addMember(USER_ANA_ID);
    await addMember(USER_BOB_ID);

    // member of group
    (
      await testBuilder.request({
        app,
        type: HTTPRequest.GET,
        route: `/api/v1/groups/${DEARLY_GROUP_ID}/members`,
        autoAuthorized: false,
        headers: {
          Authorization: `Bearer ${BOB_JWT}`,
        },
      })
    ).assertStatusCode(Status.OK);

    // manager of group
    (
      await testBuilder.request({
        app,
        type: HTTPRequest.GET,
        route: `/api/v1/groups/${DEARLY_GROUP_ID}/members`,
        queryParams: {
          limit: "10",
          offset: "0",
        },
        autoAuthorized: false,
        headers: {
          Authorization: `Bearer ${ALICE_JWT}`,
        },
      })
    ).assertStatusCode(Status.OK);
  });

  it("should return 403 when requested by a non-member", async () => {
    await addMember(USER_ANA_ID);
    await addMember(USER_BOB_ID);

    const wrongId = generateJWTFromID(generateUUID());

    (
      await testBuilder.request({
        app,
        type: HTTPRequest.GET,
        route: `/api/v1/groups/${DEARLY_GROUP_ID}/members`,
        autoAuthorized: false,
        headers: {
          Authorization: `Bearer ${wrongId}`,
        },
      })
    ).assertStatusCode(Status.Forbidden);
  });
});
