import { Hono } from "hono";
import { startTestApp } from "../helpers/test-app";
import { TestBuilder } from "../helpers/test-builder";
import { HTTPRequest, Status } from "../../constants/http";
import { generateJWTFromID, generateUUID } from "../helpers/test-token";

import {
  DEARLY_GROUP_ID,
  USER_ALICE_ID,
  USER_ANA_ID,
  USER_BOB_ID,
} from "./../helpers/test-constants";

describe("DELETE groups/:id/members/:userId", () => {
  let app: Hono;
  const testBuilder = new TestBuilder();
  const RANDOM_JWT = generateJWTFromID(generateUUID());
  const ALICE_JWT = generateJWTFromID(USER_ALICE_ID);
  const ANA_JWT = generateJWTFromID(USER_ANA_ID);
  const BOB_JWT = generateJWTFromID(USER_BOB_ID);
  const forbiddenMessage = "You do not have the rights to remove this member.";

  const authPayload = (jwt: string) => {
    return {
      autoAuthorized: false,
      headers: {
        Authorization: `Bearer ${jwt}`,
      },
    };
  };

  async function addMember(memberId: string) {
    (
      await testBuilder.request({
        app,
        type: HTTPRequest.POST,
        route: `/api/v1/groups/${DEARLY_GROUP_ID}/members/${memberId}`,
      })
    ).assertStatusCode(Status.Created);
  }

  beforeAll(async () => {
    app = await startTestApp();
  });

  afterEach(async () => {
    (
      await testBuilder.request({
        app,
        type: HTTPRequest.DELETE,
        route: `/api/v1/groups/${DEARLY_GROUP_ID}/members/${USER_ANA_ID}`,
        ...authPayload(ANA_JWT),
      })
    )
      .assertStatusCode(Status.OK)
      .assertMessage("Successfully delete user");
  });

  it("should return 200 if user is successfully deleted when deleted by manager", async () => {
    await addMember(USER_ANA_ID);
    (
      await testBuilder.request({
        app,
        type: HTTPRequest.DELETE,
        route: `/api/v1/groups/${DEARLY_GROUP_ID}/members/${USER_ANA_ID}`,
        ...authPayload(ALICE_JWT),
      })
    )
      .assertStatusCode(Status.OK)
      .assertMessage("Successfully delete user");

    // idempotency test by deleting again
    (
      await testBuilder.request({
        app,
        type: HTTPRequest.DELETE,
        route: `/api/v1/groups/${DEARLY_GROUP_ID}/members/${USER_ANA_ID}`,
        ...authPayload(ALICE_JWT),
      })
    )
      .assertStatusCode(Status.OK)
      .assertMessage("Successfully delete user");
  });

  it("should return 200 when deleting oneself from the group", async () => {
    addMember(USER_ANA_ID);
    (
      await testBuilder.request({
        app,
        type: HTTPRequest.DELETE,
        route: `/api/v1/groups/${DEARLY_GROUP_ID}/members/${USER_ANA_ID}`,
        ...authPayload(ANA_JWT),
      })
    )
      .assertStatusCode(Status.OK)
      .assertMessage("Successfully delete user");
  });

  it("should return 200 if user not in group", async () => {
    (
      await testBuilder.request({
        app,
        type: HTTPRequest.DELETE,
        route: `/api/v1/groups/${DEARLY_GROUP_ID}/members/${USER_BOB_ID}`,
        ...authPayload(BOB_JWT),
      })
    )
      .assertStatusCode(Status.OK)
      .assertMessage("Successfully delete user");
  });

  it("should return 403 if client is not the manager nor the member to be removed", async () => {
    await addMember(USER_ANA_ID);

    (
      await testBuilder.request({
        app,
        type: HTTPRequest.DELETE,
        route: `/api/v1/groups/${DEARLY_GROUP_ID}/members/${USER_ALICE_ID}`,
        ...authPayload(ANA_JWT),
      })
    )
      .assertStatusCode(Status.Forbidden)
      .assertError(forbiddenMessage);

    (
      await testBuilder.request({
        app,
        type: HTTPRequest.DELETE,
        route: `/api/v1/groups/${DEARLY_GROUP_ID}/members/${USER_ALICE_ID}`,
        ...authPayload(RANDOM_JWT),
      })
    )
      .assertStatusCode(Status.Forbidden)
      .assertError(forbiddenMessage);
  });

  it("should return 403 if client is not in the group", async () => {
    await addMember(USER_ANA_ID);

    (
      await testBuilder.request({
        app,
        type: HTTPRequest.DELETE,
        route: `/api/v1/groups/${DEARLY_GROUP_ID}/members/${USER_ALICE_ID}`,
        ...authPayload(BOB_JWT),
      })
    )
      .assertStatusCode(Status.Forbidden)
      .assertError(forbiddenMessage);
  });
});
