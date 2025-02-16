import { Hono } from "hono";
import { startTestApp } from "../helpers/test-app";
import { TestBuilder } from "../helpers/test-builder";
import { HTTPRequest, Status } from "../../constants/http";
import { generateJWTFromID, generateUUID } from "../helpers/test-token";
import {
    USER_BOB_ID,
    USER_ALICE_ID,
    INVALID_ID_ARRAY,
    DEARLY_GROUP_ID,
    MOCK_EXPO_TOKEN,
    USER_ANA_ID,
  } from "../helpers/test-constants";
import { timestamp } from "drizzle-orm/mysql-core";


describe("POST /groups/:id/nudges/auto", () => {
    let app: Hono;
    const testBuilder = new TestBuilder();

    const ALICE_JWT = generateJWTFromID(USER_ALICE_ID);
    const BOB_JWT = generateJWTFromID(USER_BOB_ID);
    const INVALID_JWT = generateJWTFromID(generateUUID());

    const EXAMPLE_SCHEDULE = {
        frequency: "WEEKLY",
        daysOfWeek: ["MON"],
        nudgeAt: new Date(Date.now())
    }

    beforeAll(async () => {
        app = await startTestApp();
    })

    it.skip("should return a 201 if the user is a manager of the group and request was successful", async() => {
        (
            await testBuilder.request({
                app,
                type: HTTPRequest.POST,
                route: `/api/v1/groups/${DEARLY_GROUP_ID}/nudges/auto`,
                autoAuthorized: false,
                headers: {
                    Authorization: `Bearer ${ALICE_JWT}`
                },
                requestBody: {
                    ...EXAMPLE_SCHEDULE
                }
            })
        ).assertStatusCode(Status.Created)
    })

    it.skip("should return a 400 if the userId is invalid", async() => {
        (
            await testBuilder.request({
                app,
                type: HTTPRequest.POST,
                route: `/api/v1/groups/${DEARLY_GROUP_ID}/nudges/auto`,
                autoAuthorized: false,
                headers: {
                    Authorization: `Bearer ${INVALID_JWT}`
                },
                requestBody: {
                    ...EXAMPLE_SCHEDULE
                }
            })
        )
        .assertStatusCode(Status.BadRequest)
    })
    
    it("should return a 403 if the user is not a manager of the group and request was successful", async() => {
        (
            await testBuilder.request({
                app,
                type: HTTPRequest.POST,
                route: `/api/v1/groups/${DEARLY_GROUP_ID}/nudges/auto`,
                autoAuthorized: false,
                headers: {
                    Authorization: `Bearer ${BOB_JWT}`
                },
                requestBody: {
                    ...EXAMPLE_SCHEDULE
                }
            })
        )
        .assertStatusCode(Status.Forbidden)
        .assertError("Forbidden")
        
    })
    
    it("should return a 404 if the group is an invalid group", async() => {
        (
            await testBuilder.request({
                app,
                type: HTTPRequest.POST,
                route: `/api/v1/groups/${generateUUID()}/nudges/auto`,
                autoAuthorized: false,
                headers: {
                    Authorization: `Bearer ${ALICE_JWT}`
                },
                requestBody: {
                    ...EXAMPLE_SCHEDULE
                }
            })
        )
        .assertStatusCode(Status.NotFound)
        .assertError("Group does not exist.")
    })
    
    it("should return a 400 if the date is invalid", async() => {

    })
    
    it("should return a 400 if the time is invalid", async() => {

    })
    
})