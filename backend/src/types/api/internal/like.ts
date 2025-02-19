import { likesTable } from "../../../entities/schema";

export type Like = typeof likesTable.$inferSelect;
