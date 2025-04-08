import { z } from "zod";
import { MediaType } from "../../../constants/database";
import { mediaTable } from "../../../entities/schema";

export type Media = typeof mediaTable.$inferSelect;

export type MediaWithURL = {
  id: string;
  url: string;
  postId: string;
  type: "VIDEO" | "PHOTO";
};

export type MediaResponse = {
  objectKey: string;
  type: MediaType;
};

export type WaveForm = {
  length: number;
  data: number[];
};

export const processURLValidate = z.string();
