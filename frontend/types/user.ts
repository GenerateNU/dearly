export interface User {
  id: string;
  name: string;
  username: string;
  ageGroup: string;
  mode: string;
  profilePhoto: string;
  deviceTokens: string[];
}

export interface CreateUserPayload {
  name: string;
  username: string;
  ageGroup: string;
}

export enum AgeGroup {
  CHILD = "CHILD",
  TEEN = "TEEN",
  ADULT = "ADULT",
  SENIOR = "SENIOR",
}
