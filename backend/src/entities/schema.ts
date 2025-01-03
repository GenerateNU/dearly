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
    .references(() => usersTable.id),
});

export const postsTable = pgTable("posts", {
  id: uuid().primaryKey().defaultRandom(),
  groupId: uuid()
    .notNull()
    .references(() => groupsTable.id),
  userId: uuid()
    .notNull()
    .references(() => usersTable.id),
  createdAt: timestamp().notNull().defaultNow(),
  caption: varchar({ length: 500 }),
  thumbnail: varchar(),
});

export const mediaTable = pgTable("media", {
  id: uuid().primaryKey().defaultRandom(),
  mediaType: mediaTypeEnum().notNull(),
  media: varchar().notNull(),
  postId: uuid().references(() => postsTable.id),
  commentId: uuid().references(() => commentsTable.id),
});

export const membersTable = pgTable("members", {
  userId: uuid()
    .notNull()
    .references(() => usersTable.id),
  groupId: uuid()
    .notNull()
    .references(() => groupsTable.id),
  joinedAt: timestamp().notNull().defaultNow(),
  role: memberRoleEnum().notNull().default("MEMBER"),
});

export const likesTable = pgTable("likes", {
  id: uuid().primaryKey().defaultRandom(),
  userId: uuid()
    .notNull()
    .references(() => usersTable.id),
  postId: uuid()
    .notNull()
    .references(() => postsTable.id),
});

export const commentsTable = pgTable("comments", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid()
    .notNull()
    .references(() => usersTable.id),
  postId: uuid()
    .notNull()
    .references(() => postsTable.id),
  content: varchar({ length: 500 }),
});

export const notificationsTable = pgTable("notifications", {
  id: uuid().primaryKey().defaultRandom(),
  actorId: uuid()
    .notNull()
    .references(() => usersTable.id),
  receiverId: uuid()
    .notNull()
    .references(() => usersTable.id),
  groupId: uuid().references(() => groupsTable.id),
  referenceType: referenceTypeEnum().notNull(),
  postId: uuid().references(() => postsTable.id),
  commentId: uuid().references(() => commentsTable.id),
  likeId: uuid().references(() => likesTable.id),
  invitationId: uuid().references(() => invitationsTable.id),
  title: varchar({ length: 100 }).notNull(),
  description: varchar({ length: 300 }).notNull(),
});

export const linksTable = pgTable("links", {
  id: uuid().primaryKey().defaultRandom(),
  groupId: uuid()
    .notNull()
    .references(() => groupsTable.id),
  token: varchar().notNull(),
  expiresAt: timestamp().notNull(),
  createdAt: timestamp().notNull().defaultNow(),
});

export const invitationsTable = pgTable("invitations", {
  id: uuid().primaryKey().defaultRandom(),
  groupId: uuid()
    .notNull()
    .references(() => groupsTable.id),
  invitationLinkId: uuid().references(() => linksTable.id),
  recipientId: uuid()
    .notNull()
    .references(() => usersTable.id),
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
