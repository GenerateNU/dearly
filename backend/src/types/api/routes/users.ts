import { TypedResponse } from "hono";
import { USER_API } from "../schemas/users";
import { API_ERROR } from "../schemas/error";
import { paths } from "../../../gen/openapi";

export type USER_RESPONSE = TypedResponse<USER_API | API_ERROR>;
export type DEL_USER = TypedResponse<
  paths["/api/v1/users/me"]["delete"]["responses"]["200"]["content"]["application/json"] | API_ERROR
>;
export type DEVICE_RESPONSE = TypedResponse<
  | paths["/api/v1/users/devices"]["delete"]["responses"]["200"]["content"]["application/json"]
  | API_ERROR
>;
