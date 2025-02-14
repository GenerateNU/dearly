import { notificationsTable } from "../../../entities/schema";

export type Notification = typeof notificationsTable.$inferSelect;
