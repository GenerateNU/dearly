import { TypedResponse } from "hono";
import { USER_API } from "../schemas/users";
import { API_ERROR } from "../schemas/error";
import { paths } from "../../../gen/schema";

export type CREATE_USER = TypedResponse<USER_API | API_ERROR>;
export type GET_USER = TypedResponse<USER_API | API_ERROR>;
export type PUT_USER = TypedResponse<USER_API | API_ERROR>;
export type DEL_USER = TypedResponse<
  paths["/api/v1/users/me"]["delete"]["responses"]["204"]["content"]["text/plain"] | API_ERROR
>;
