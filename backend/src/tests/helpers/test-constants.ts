import {
  commentsTable,
  groupsTable,
  likesTable,
  mediaTable,
  postsTable,
} from "../../entities/schema";
import { CreateGroupPayload } from "../../types/api/internal/groups";
import { CreateUserPayload, SearchedUser } from "../../types/api/internal/users";
import { Notification } from "../../types/api/internal/notification";

export const INVALID_ID_ARRAY = ["1", "%2", "123abc", "!!$$", "123 456", "@ID", null, undefined];
export const USER_ALICE_ID = "00000000-0000-0000-0000-000000000000";
export const USER_BOB_ID = "ae6be85f-157c-40db-afd2-2f388d8ff7b5";
export const USER_ANA_ID = "6d56421d-4c0d-44d9-b2b1-8d897207fc5b";
export const USER_BILL_ID = "e8f8a2d1-57c7-4b71-9c8b-9b5f09a9db49";
export const DEARLY_GROUP_ID = "ab674eaf-e6f0-47c1-8a38-81079577880b";
export const POST_ID = "d1c51f6d-3a57-474a-872e-bde646fe338b";
export const MEDIA_ONE_ID = "c41f01cf-2c1b-44ad-b80f-05bddd607ee1";
export const MEDIA_TWO_ID = "43bd915c-122c-448f-8d2b-bdc983934e86";
export const MEDIA_THREE_ID = "a9c2d3f7-5b84-42e1-91f0-3d6a8b4c7e12";
export const ANOTHER_GROUP_ID = "678d8ff3-c24c-8002-ad06-052ae4f44075";
export const NEW_POST_ID = "e3f4b2c1-8d67-4f9b-90a4-6b1f3d2e5c78";
export const MOCK_SIGNED_URL = "https://mocked-url.com";
export const MOCK_RANDOM_UUID = "fe01a74f-96b1-444a-b6c9-11e4d672946c";
export const MOCK_LIKE_NOTIF_UUID = "31e51a64-1d5e-41ed-ace9-27b8e7c4de1c";
export const MOCK_COMMENT_NOTIF_UUID = "8e3e964b-6696-4150-b4f3-09f66e7b74de";
export const MOCK_POST_NOTIF_UUID = "601e8b6b-360a-4b53-8a15-aba8a9bdf027";
export const DEARLY_COMMENT_ID = "679c0331-2dfc-8002-b4a4-22b09d6c3c73";
export const NEW_COMMENT_ID = "4b789855-0c17-4aa0-8eb4-d8e2b20bc1bf";
export const MOCK_EXPO_TOKEN = "ExponentPushToken[Z9Hfn6ZxWVXaAs7MG3Pya8]";

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
    objectKey: "photo1",
    type: "VIDEO",
    id: MEDIA_ONE_ID,
    order: 0,
  },
  {
    postId: POST_ID,
    objectKey: "photo2",
    type: "PHOTO",
    id: MEDIA_TWO_ID,
    order: 1,
  },
];

export const POST_MOCK: (typeof postsTable.$inferInsert)[] = [
  {
    userId: USER_ALICE_ID,
    groupId: DEARLY_GROUP_ID,
    id: POST_ID,
    createdAt: new Date(-1),
    caption: "my first post",
  },
  {
    userId: USER_BOB_ID,
    groupId: ANOTHER_GROUP_ID,
    id: NEW_POST_ID,
    createdAt: new Date(),
    caption: "having fun at the beach!",
  },
];

export const GROUP_MOCK: (typeof groupsTable.$inferInsert)[] = [
  {
    id: DEARLY_GROUP_ID,
    name: "dearly",
    description: "dearly",
    managerId: USER_ALICE_ID,
  },
  {
    id: ANOTHER_GROUP_ID,
    name: "family",
    description: "family",
    managerId: USER_ANA_ID,
  },
];

export const USER_ALICE: CreateUserPayload = {
  name: "Alice",
  username: "alice123",
  mode: "BASIC",
  id: USER_ALICE_ID,
};

export const SEARCHED_ALICE: SearchedUser = {
  id: USER_ALICE_ID,
  name: USER_ALICE["name"],
  username: USER_ALICE["username"],
  profilePhoto: null,
  isMember: true,
  lastNudgedAt: null,
};

export const USER_BOB: CreateUserPayload = {
  name: "Bob",
  username: "bobthebuilder",
  mode: "ADVANCED",
  id: USER_BOB_ID,
};

export const SEARCHED_BOB: SearchedUser = {
  id: USER_BOB_ID,
  name: USER_BOB["name"],
  username: USER_BOB["username"],
  profilePhoto: null,
  isMember: true,
  lastNudgedAt: null,
};

export const USER_ANA: CreateUserPayload = {
  name: "Ana",
  username: "ana",
  mode: "BASIC",
  id: USER_ANA_ID,
  profilePhoto: "https://mocked-url.com",
};

export const SEARCHED_ANA: SearchedUser = {
  id: USER_ANA_ID,
  name: USER_ANA["name"],
  username: USER_ANA["username"],
  profilePhoto: "https://mocked-url.com",
  isMember: true,
  lastNudgedAt: null,
};

export const USER_BILL: CreateUserPayload = {
  name: "Bill",
  username: "bill",
  mode: "BASIC",
  id: USER_BILL_ID,
};

export const DEARLY_GROUP: CreateGroupPayload = {
  name: "dearly",
  description: "dearly",
  managerId: USER_ALICE_ID,
  id: DEARLY_GROUP_ID,
};

export const ANOTHER_GROUP: CreateGroupPayload = {
  name: "family",
  description: "family",
  managerId: USER_ANA_ID,
  id: ANOTHER_GROUP_ID,
};

export const MOCK_MEDIA_WITH_URL = MEDIA_MOCK.map((media) => ({
  id: media.id,
  postId: media.postId,
  type: media.type,
  url: MOCK_SIGNED_URL,
}));

export const COMMENTS: (typeof commentsTable.$inferInsert)[] = [
  {
    id: DEARLY_COMMENT_ID,
    postId: POST_ID,
    userId: USER_BOB_ID,
    content: "amazing photos!",
  },
  {
    id: NEW_COMMENT_ID,
    postId: NEW_POST_ID,
    userId: USER_BILL_ID,
    content: "looks like fun!",
  },
];

export const NOTIFICATIONS_MOCK: Notification[] = [
  {
    id: MOCK_COMMENT_NOTIF_UUID,
    actorId: USER_BILL_ID,
    receiverId: USER_BOB_ID,
    postId: null,
    referenceType: "POST",
    title: "New Comment",
    description: "Bill commented on your post",
    createdAt: new Date(),
    groupId: DEARLY_GROUP_ID,
    commentId: NEW_COMMENT_ID,
    likeId: null,
    mediaURL: MOCK_SIGNED_URL,
  },
  {
    id: MOCK_LIKE_NOTIF_UUID,
    actorId: USER_ANA_ID,
    receiverId: USER_BOB_ID,
    postId: null,
    referenceType: "LIKE",
    title: "New Like",
    description: "Ana liked your post",
    createdAt: new Date(),
    groupId: DEARLY_GROUP_ID,
    commentId: null,
    likeId: MOCK_RANDOM_UUID,
    mediaURL: SEARCHED_ANA["profilePhoto"],
  },
  {
    id: MOCK_POST_NOTIF_UUID,
    actorId: USER_ALICE_ID,
    receiverId: USER_BOB_ID,
    postId: POST_ID,
    referenceType: "POST",
    title: "New Post",
    description: "Alice posted in your group",
    createdAt: new Date(),
    groupId: DEARLY_GROUP_ID,
    commentId: null,
    likeId: null,
    mediaURL: MOCK_MEDIA_WITH_URL[0]?.url ?? MOCK_SIGNED_URL,
  },
];

export const LIKE_MOCK: (typeof likesTable.$inferInsert)[] = [
  {
    id: MOCK_RANDOM_UUID,
    postId: NEW_POST_ID,
    userId: USER_ANA_ID,
    createdAt: new Date(),
  },
];
