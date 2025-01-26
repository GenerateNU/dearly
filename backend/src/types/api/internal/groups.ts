import { z } from "zod";
import {
  calendarParamsValidate,
  feedParamValidate,
  updateGroupValidate,
} from "../../../entities/groups/validator";
import { groupsTable } from "../../../entities/schema";

export type CreateGroupPayload = typeof groupsTable.$inferInsert;
export type UpdateGroupPayload = z.infer<typeof updateGroupValidate> & GroupIdPayload;

export type Group = typeof groupsTable.$inferSelect;
export type FeedParamPayload = z.infer<typeof feedParamValidate> & GroupUserIDPayload;

export type GroupUserIDPayload = {
  userId: string;
  groupId: string;
};

export type CalendarParamPayload = z.infer<typeof calendarParamsValidate> & GroupUserIDPayload;

export type DayWithObjectKey = {
  day: number;
  objectKey: string;
};

export type DayWithURL = {
  day: number;
  url: string;
};

export type ResponseWithDate<T> = {
  month: number;
  year: number;
  data: T[];
};

export type ThumbnailResponse = ResponseWithDate<DayWithObjectKey>;
export type ThumbnailResponseWithURL = ResponseWithDate<DayWithURL>;

export type GroupIdPayload = {
  userId: string;
  groupId: string;
};
