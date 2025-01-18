export const INVALID_ID_ARRAY = ["1", "%2", "123abc", "!!$$", "123 456", "@ID", null, undefined];
export const USER_ALICE_ID = "00000000-0000-0000-0000-000000000000";
export const USER_BOB_ID = "00000000-0000-0000-0000-000000000001";
export const USER_ANA_ID = "00000000-0000-0000-0000-000000000002";
export const DEARLY_GROUP_ID = "11111111-1111-1111-1111-111111111111";

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
