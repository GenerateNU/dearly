import { timestamp, uuid, pgEnum, pgTable, varchar } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

export const ageGroupEnum = pgEnum("ageGroup", ["CHILD", "TEEN", "ADULT", "SENIOR"]);
export const userModeEnum = pgEnum("mode", ["BASIC", "ADVANCED"]);
export const mediaTypeEnum = pgEnum("mediaType", ["IMAGE", "VIDEO", "AUDIO"]);
export const memberRoleEnum = pgEnum("role", ["MEMBER", "MANAGER"]);
export const referenceTypeEnum = pgEnum("referenceType", [
  "POST",
  "COMMENT",
  "LIKE",
  "INVITE",
  "NUDGE",
]);
export const invitationStatusEnum = pgEnum("status", ["PENDING", "ACCEPTED"]);

export const usersTable = pgTable("users", {
  id: uuid().primaryKey().defaultRandom(),
  name: varchar({ length: 100 }).notNull(),
  username: varchar({ length: 100 }).notNull().unique(),
  ageGroup: ageGroupEnum().notNull(),
  mode: userModeEnum().default("BASIC"),
  profilePhoto: varchar(),
  deviceTokens: varchar({ length: 152 }).array().default([]),
});

export const groupsTable = pgTable("groups", {
  id: uuid().primaryKey().defaultRandom(),
  name: varchar({ length: 100 }).notNull(),
  description: varchar({ length: 500 }),
  managerId: uuid()
    .notNull()
    .references(() => usersTable.id, { onDelete: "cascade" }),
});

export const postsTable = pgTable("posts", {
  id: uuid().primaryKey().defaultRandom(),
  groupId: uuid()
    .notNull()
    .references(() => groupsTable.id, { onDelete: "cascade" }),
  userId: uuid()
    .notNull()
    .references(() => usersTable.id, { onDelete: "cascade" }),
  createdAt: timestamp().notNull().defaultNow(),
  caption: varchar({ length: 500 }),
  thumbnail: varchar(),
});

export const mediaTable = pgTable("media", {
  id: uuid().primaryKey().defaultRandom(),
  mediaType: mediaTypeEnum().notNull(),
  media: varchar().notNull(),
  postId: uuid().references(() => postsTable.id, { onDelete: "cascade" }),
  commentId: uuid().references(() => commentsTable.id, { onDelete: "cascade" }),
});

export const membersTable = pgTable("members", {
  userId: uuid()
    .notNull()
    .references(() => usersTable.id, { onDelete: "cascade" }),
  groupId: uuid()
    .notNull()
    .references(() => groupsTable.id, { onDelete: "cascade" }),
  joinedAt: timestamp().notNull().defaultNow(),
  role: memberRoleEnum().notNull().default("MEMBER"),
});

export const likesTable = pgTable("likes", {
  id: uuid().primaryKey().defaultRandom(),
  userId: uuid()
    .notNull()
    .references(() => usersTable.id, { onDelete: "cascade" }),
  postId: uuid()
    .notNull()
    .references(() => postsTable.id, { onDelete: "cascade" }),
});

export const commentsTable = pgTable("comments", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid()
    .notNull()
    .references(() => usersTable.id, { onDelete: "cascade" }),
  postId: uuid()
    .notNull()
    .references(() => postsTable.id, { onDelete: "cascade" }),
  content: varchar({ length: 500 }),
});

export const notificationsTable = pgTable("notifications", {
  id: uuid().primaryKey().defaultRandom(),
  actorId: uuid()
    .notNull()
    .references(() => usersTable.id, { onDelete: "cascade" }),
  receiverId: uuid()
    .notNull()
    .references(() => usersTable.id, { onDelete: "cascade" }),
  groupId: uuid().references(() => groupsTable.id, { onDelete: "cascade" }),
  referenceType: referenceTypeEnum().notNull(),
  postId: uuid().references(() => postsTable.id, { onDelete: "cascade" }),
  commentId: uuid().references(() => commentsTable.id, { onDelete: "cascade" }),
  likeId: uuid().references(() => likesTable.id, { onDelete: "cascade" }),
  invitationId: uuid().references(() => invitationsTable.id, { onDelete: "cascade" }),
  title: varchar({ length: 100 }).notNull(),
  description: varchar({ length: 300 }).notNull(),
});

export const linksTable = pgTable("links", {
  id: uuid().primaryKey().defaultRandom(),
  groupId: uuid()
    .notNull()
    .references(() => groupsTable.id, { onDelete: "cascade" }),
  token: varchar().notNull(),
  expiresAt: timestamp().notNull(),
  createdAt: timestamp().notNull().defaultNow(),
});

export const invitationsTable = pgTable("invitations", {
  id: uuid().primaryKey().defaultRandom(),
  groupId: uuid()
    .notNull()
    .references(() => groupsTable.id, { onDelete: "cascade" }),
  invitationLinkId: uuid().references(() => linksTable.id, { onDelete: "cascade" }),
  recipientId: uuid()
    .notNull()
    .references(() => usersTable.id, { onDelete: "cascade" }),
  status: invitationStatusEnum().notNull().default("PENDING"),
  createdAt: timestamp().notNull().defaultNow(),
});

export const userRelations = relations(usersTable, ({ many }) => ({
  posts: many(postsTable),
  comments: many(commentsTable),
  likes: many(likesTable),
  memberships: many(membersTable),
}));

export const groupRelations = relations(groupsTable, ({ many }) => ({
  posts: many(postsTable),
  members: many(membersTable),
  invitationLinks: many(linksTable),
  invitations: many(invitationsTable),
}));

export const postRelations = relations(postsTable, ({ one, many }) => ({
  group: one(groupsTable, {
    fields: [postsTable.groupId],
    references: [groupsTable.id],
  }),
  user: one(usersTable, {
    fields: [postsTable.userId],
    references: [usersTable.id],
  }),
  media: many(mediaTable),
  comments: many(commentsTable),
  likes: many(likesTable),
}));
