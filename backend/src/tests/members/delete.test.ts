import { Hono } from "hono";
import { startTestApp } from "../helpers/test-app";
import { TestBuilder } from "../helpers/test-builder";
import { HTTPRequest, Status } from "../../constants/http";
import { generateJWTFromID, generateUUID } from "../helpers/test-token";

import { DEARLY_GROUP_ID, USER_ALICE_ID, USER_ANA_ID, USER_BILL_ID, USER_BOB, USER_BOB_ID } from "./../helpers/test-constants";

describe("DELETE groups/{id}/members/{userId}", () => {
  let app: Hono;
  const testBuilder = new TestBuilder();
  const jwt = generateJWTFromID(generateUUID());
  const manager_jwt = generateJWTFromID(USER_ALICE_ID);
  const ana_jwt = generateJWTFromID(USER_ANA_ID);
  const bob_jwt = generateJWTFromID(USER_BOB_ID);
  const forbiddenMessage = "You do not have the rights to remove this member.";

  const authPayload = (jwt: string) => {
    return {
      autoAuthorized: false,
      headers: {
        Authorization: `Bearer ${jwt}`,
      },
    }
  };

  async function addMember(memberId:string) {
    (
      await testBuilder.request({
        app,
        type: HTTPRequest.POST,
        route: `/api/v1/groups/${DEARLY_GROUP_ID}/members/${memberId}`
      })
    ).assertStatusCode(Status.Created);
  }

  beforeAll(async () => {
    app = await startTestApp();
  });

  // Initialize every test with a userid
  // beforeEach(async () => {
  //   console.log(addMember(USER_ANA_ID))
  // });

  afterEach(async () => {
    (
      await testBuilder.request({
        app,
        type: HTTPRequest.DELETE,
        route: `/api/v1/groups/${DEARLY_GROUP_ID}/members/${USER_ANA_ID}`,
        ...authPayload(ana_jwt),
      })
    )
      .assertStatusCode(Status.OK)
      .assertMessage("Successfully delete user");
  });

  it("should return 200 if user is successfully deleted when deleted by manager", async () => {
    addMember(USER_ANA_ID)
    console.log(authPayload(manager_jwt));
    (
      await testBuilder.request({
        app,
        type: HTTPRequest.DELETE,
        route: `/api/v1/groups/${DEARLY_GROUP_ID}/members/${USER_ANA_ID}`,
        ...authPayload(manager_jwt),
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
        ...authPayload(manager_jwt),
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
        ...authPayload(ana_jwt)
      })
    )
      .assertStatusCode(Status.OK)
      .assertMessage("Successfully delete user");
  });


  it.skip("should return 200 if user not in group", async () => {
    // TODO
    (
      await testBuilder.request({
        app,
        type: HTTPRequest.DELETE,
        route: `/api/v1/groups/${DEARLY_GROUP_ID}/members/${USER_BILL_ID}`,
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
        ...authPayload(ana_jwt)
      })
    )
      .assertStatusCode(Status.Forbidden)
      .assertMessage(forbiddenMessage);
  });
});
