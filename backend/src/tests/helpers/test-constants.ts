import { mediaTable, postsTable } from "../../entities/schema";
import { generateUUID } from "./test-token";

export const INVALID_ID_ARRAY = ["1", "%2", "123abc", "!!$$", "123 456", "@ID", null, undefined];
export const USER_ALICE_ID = "00000000-0000-0000-0000-000000000000";
export const USER_BOB_ID = generateUUID();
export const USER_ANA_ID = generateUUID();
export const DEARLY_GROUP_ID = generateUUID();
export const POST_ID = generateUUID();
export const MEDIA_ONE_ID = generateUUID();
export const MEDIA_TWO_ID = generateUUID();
export const MEDIA_THREE_ID = generateUUID();

export const GROUP_EMPTY_FIELDS_ERRORS = [
  {
    field: "name",
    requestBody: { name: "", description: "Valid description" },
    expectedError: [
      {
        message: "Name must be at least 1 character long",
        path: "name",
      },
    ],
  },
  {
    field: "description",
    requestBody: { name: "Valid name", description: "" },
    expectedError: [
      {
        message: "Description must be at least 1 character long",
        path: "description",
      },
    ],
  },
];

export const MEDIA_MOCK: (typeof mediaTable.$inferInsert)[] = [
  {
    postId: POST_ID,
    url: "https://google.com",
    type: "VIDEO",
    id: MEDIA_ONE_ID,
  },
  {
    postId: POST_ID,
    url: "https://google.com",
    type: "PHOTO",
    id: MEDIA_TWO_ID,
  },
];

export const POST_MOCK: (typeof postsTable.$inferInsert)[] = [
  {
    userId: USER_ALICE_ID,
    groupId: DEARLY_GROUP_ID,
    id: POST_ID,
    createdAt: new Date(),
    caption: "my first post",
  },
];
