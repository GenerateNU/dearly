import { Comment } from "../../types/api/internal/comments";
import { groupsTable, mediaTable, postsTable } from "../../entities/schema";
import { CreateGroupPayload, Group } from "../../types/api/internal/groups";
import { Post } from "../../types/api/internal/posts";
import { CreateUserPayload, SearchedUser, User } from "../../types/api/internal/users";
import { Member } from "../../types/api/internal/members";
import { Like } from "../../types/api/internal/like";

export const INVALID_ID_ARRAY = ["1", "%2", "123abc", "!!$$", "123 456", "@ID", null, undefined];
export const USER_ALICE_ID = "00000000-0000-0000-0000-000000000000";
export const ADRIENNE_COMMENT_ID = "ab674eaf-9999-aaaa-8a38-811234567000";
export const USER_ADRIENNE_ID = "ab674eaf-9999-aaaa-8a38-811258295746";
export const BIG_THIEF_GROUP_ID = "ab674eaf-9999-1111-8a38-811234567890";
export const USER_BUCK_ID = "ab674eaf-9999-abcd-4444-811234567890";
export const BUCK_POST_ID = "ab674eaf-9999-abcd-8a38-811234567890";
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
export const DEARLY_COMMENT_ID = "679c0331-2dfc-8002-b4a4-22b09d6c3c73";
export const MOCK_EXPO_TOKEN = "ExponentPushToken[Z9Hfn6ZxWVXaAs7MG3Pya8]";
export const USER_Josh_ID = "61111211-4c0d-44d9-b2b1-8d897207f111";
export const USER_Nubs_ID = "99111219-4c0d-44d9-b2b1-8d897207f111";
export const USER_MAI_ID = "6a1b095b-b2bd-4cc8-85ef-a28d24dd8577";
export const USER_STONE_ID = "a19382b4-c050-49ea-ac60-c9ae423f2461";
export const GROUP_FULL_SNAPPER_ID = "2df88233-47b3-432d-b032-b66ef7885cfb";
export const SNAPPER_GROUP_ID = "ab674eaf-9999-47c1-8a38-81079577880b";
export const SNAPPER_POST = "ab674eaf-9999-47c1-8a38-811234567890";
export const JOSH_DEVICE_TOKEN = "ab674eaf-9999-1234-8a38-811234561234";
export const NUBS_DEVICE_TOKEN = "ab674eaf-0000-1234-8a38-811234561234";
export const POST_EXAMPLE_ID = "ab674eaf-9999-47c1-8a38-811234567890";
export const SNAPPER_COMMENT_ID = "f46a2916-99e7-4ebb-a796-d1c29d6e4786";
export const FULL_SNAPPER_POST_ID = "6bc21e8a-7a8e-4c66-8403-ab4259311795";
export const MEMBER_ID = "ab674eaf-9999-aaaa-8a38-811234567890";
export const MAI_DEVICE_TOKEN = "4dff72c9-afbc-49e5-b757-1de7d89d8234";

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
};

export const SEARCHED_ANA: SearchedUser = {
  id: USER_ANA_ID,
  name: USER_ANA["name"],
  username: USER_ANA["username"],
  profilePhoto: null,
  isMember: true,
  lastNudgedAt: null,
};

export const USER_BILL: CreateUserPayload = {
  name: "Bill",
  username: "bill",
  mode: "BASIC",
  id: USER_BILL_ID,
};

export const USER_JOSH: CreateUserPayload = {
  name: "Josh",
  username: "josh",
  mode: "BASIC",
  id: USER_Josh_ID,
};

export const USER_NUBS: CreateUserPayload = {
  name: "Nubs",
  username: "nubs",
  mode: "BASIC",
  id: USER_Nubs_ID,
};

export const USER_MAI: CreateUserPayload = {
  name: "Mai",
  username: "inMaiSpace",
  mode: "ADVANCED",
  id: USER_MAI_ID,
};

export const USER_STONE: CreateUserPayload = {
  name: "Stone",
  username: "theRock",
  mode: "ADVANCED",
  id: USER_STONE_ID,
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

export const SNAPPER_GROUP: CreateGroupPayload = {
  name: "snapper",
  description: "snapper",
  managerId: USER_Josh_ID,
  id: SNAPPER_GROUP_ID,
};

export const FULL_SNAPPER_GROUP: CreateGroupPayload = {
  name: "eng snapper",
  description: "Engineering team of snapper",
  managerId: USER_STONE_ID,
  id: GROUP_FULL_SNAPPER_ID,
};

export const MOCK_MEDIA_WITH_URL = MEDIA_MOCK.map((media) => ({
  id: media.id,
  postId: media.postId,
  type: media.type,
  url: MOCK_SIGNED_URL,
}));

export const COMMENTS: Comment[] = [
  {
    id: DEARLY_COMMENT_ID,
    postId: POST_ID,
    userId: USER_BOB_ID,
    content: "amazing photos!",
    voiceMemo: null,
    createdAt: new Date(),
  },
];

export const SINGLE_COMMENT: Comment = {
  id: SNAPPER_COMMENT_ID,
  userId: USER_Nubs_ID,
  createdAt: new Date(),
  postId: POST_EXAMPLE_ID,
  content: "Look at da fishes!",
  voiceMemo: null,
};

export const ADRIENNE_COMMENTS_BUCKPOST: Comment = {
  id: ADRIENNE_COMMENT_ID,
  userId: USER_ADRIENNE_ID,
  createdAt: new Date(),
  postId: BUCK_POST_ID,
  content: "yur!",
  voiceMemo: null,
};

export const BUCK_POST: Post = {
  id: BUCK_POST_ID,
  groupId: BIG_THIEF_GROUP_ID,
  userId: USER_BUCK_ID,
  createdAt: new Date(),
  caption: null,
  location: null,
};

export const BIG_THEIF_GROUP: Group = {
  name: "big thief",
  id: BIG_THIEF_GROUP_ID,
  description: null,
  managerId: USER_BUCK_ID,
};

export const ADRIENNE_MEMBER: Member = {
  userId: USER_ADRIENNE_ID,
  groupId: BIG_THIEF_GROUP_ID,
  joinedAt: new Date(),
  role: "MEMBER",
  notificationsEnabled: false,
  lastManualNudge: null,
};

export const USER_BUCK: User = {
  name: "Buck",
  id: USER_BUCK_ID,
  username: "bucky",
  mode: "BASIC",
  profilePhoto: null,
  timezone: null,
  bio: null,
  birthday: null,
};

export const USER_ADRIENNE: User = {
  name: "Adrienne",
  id: USER_ADRIENNE_ID,
  username: "adrizzy",
  mode: "ADVANCED",
  profilePhoto: null,
  timezone: null,
  bio: null,
  birthday: null,
};

export const POST_EXAMPLE: Post = {
  id: POST_EXAMPLE_ID,
  groupId: SNAPPER_GROUP_ID,
  userId: USER_Josh_ID,
  createdAt: new Date(),
  caption: "what the sigma",
  location: "Ur moms house",
};

export const FULL_SNAPPER_POST_EXAMPLE: Post = {
  id: FULL_SNAPPER_POST_ID,
  groupId: GROUP_FULL_SNAPPER_ID,
  userId: USER_STONE_ID,
  createdAt: new Date(),
  caption: "CRACKED ENGINEERS",
  location: "The sherm",
};

export const LIKE_EXAMPLE: Like = {
  id: "ab674eaf-9999-aaaa-8a38-811234567890",
  userId: USER_Nubs_ID,
  postId: POST_EXAMPLE_ID,
  createdAt: new Date(),
};

export const JOSH_LIKE_POST: Like = {
  id: "ab674eaf-9999-bbbb-8a38-811234567890",
  userId: USER_Josh_ID,
  postId: POST_EXAMPLE_ID,
  createdAt: new Date(),
};

export const JOSH_COMMENT_POST: Comment = {
  id: "ab674eaf-9999-aaaa-8b38-811234567890",
  userId: USER_Josh_ID,
  postId: POST_EXAMPLE_ID,
  createdAt: new Date(),
  content: "Look at da fishes!",
  voiceMemo: null,
};
