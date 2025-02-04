import {
  TEXT_MAX_LIMIT,
  DEVICE_TOKEN_MAX_LIMIT,
  NOTIFICATION_BODY_MAX_LIMIT,
} from "./../constants/database";
import {
  timestamp,
  uuid,
  pgEnum,
  pgTable,
  varchar,
  boolean,
  primaryKey,
  integer,
  unique,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { NAME_MAX_LIMIT } from "../constants/database";

export const userModeEnum = pgEnum("mode", ["BASIC", "ADVANCED"]);
export const postMediaEnum = pgEnum("mediaType", ["VIDEO", "PHOTO"]);
export const memberRoleEnum = pgEnum("role", ["MEMBER", "MANAGER"]);
export const referenceTypeEnum = pgEnum("referenceType", [
  "POST",
  "COMMENT",
  "LIKE",
  "NUDGE",
  "LIKE-COMMENT",
]);
export const invitationStatusEnum = pgEnum("status", ["PENDING", "ACCEPTED"]);

export const usersTable = pgTable("users", {
  id: uuid().primaryKey().defaultRandom(),
  name: varchar({ length: NAME_MAX_LIMIT }).notNull(),
  username: varchar({ length: NAME_MAX_LIMIT }).notNull().unique(),
  mode: userModeEnum().notNull().default("BASIC"),
  profilePhoto: varchar(),
  timezone: varchar(),
});

export const devicesTable = pgTable("devices", {
  id: uuid().primaryKey().defaultRandom(),
  userId: uuid()
    .notNull()
    .references(() => usersTable.id, { onDelete: "cascade" }),
  token: varchar({ length: DEVICE_TOKEN_MAX_LIMIT }).notNull(),
});

export const groupsTable = pgTable("groups", {
  id: uuid().primaryKey().defaultRandom(),
  name: varchar({ length: NAME_MAX_LIMIT }).notNull(),
  description: varchar({ length: TEXT_MAX_LIMIT }),
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
  caption: varchar({ length: TEXT_MAX_LIMIT }),
  location: varchar({ length: NAME_MAX_LIMIT }),
});

export const mediaTable = pgTable("media", {
  id: uuid().primaryKey().defaultRandom(),
  postId: uuid()
    .notNull()
    .references(() => postsTable.id, { onDelete: "cascade" }),
  objectKey: varchar().notNull(),
  type: postMediaEnum().notNull(),
  order: integer("order").notNull().default(0),
});

export const membersTable = pgTable(
  "members",
  {
    userId: uuid()
      .notNull()
      .references(() => usersTable.id, { onDelete: "cascade" }),
    groupId: uuid()
      .notNull()
      .references(() => groupsTable.id, { onDelete: "cascade" }),
    joinedAt: timestamp().notNull().defaultNow(),
    role: memberRoleEnum().notNull().default("MEMBER"),
    notificationsEnabled: boolean().notNull().default(true),
    lastManualNudge: timestamp(),
  },
  (table) => {
    return [primaryKey({ columns: [table.userId, table.groupId] })];
  },
);

export const likesTable = pgTable("likes", {
  id: uuid().primaryKey().defaultRandom(),
  userId: uuid()
    .notNull()
    .references(() => usersTable.id, { onDelete: "cascade" }),
  postId: uuid()
    .notNull()
    .references(() => postsTable.id, { onDelete: "cascade" }),
  createdAt: timestamp().notNull().defaultNow(),
});

export const commentsTable = pgTable("comments", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid()
    .notNull()
    .references(() => usersTable.id, { onDelete: "cascade" }),
  postId: uuid()
    .notNull()
    .references(() => postsTable.id, { onDelete: "cascade" }),
  content: varchar({ length: TEXT_MAX_LIMIT }),
  voiceMemo: varchar(),
  createdAt: timestamp().notNull().defaultNow(),
});

export const likeCommentsTable = pgTable(
  "likeComments",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    createdAt: timestamp().notNull().defaultNow(),
    userId: uuid()
      .notNull()
      .references(() => usersTable.id, { onDelete: "cascade" }),
    commentId: uuid()
      .notNull()
      .references(() => commentsTable.id, { onDelete: "cascade" }),
  },
  (table) => [
    {
      unique: unique().on(table.userId, table.commentId),
    },
  ],
);

export const notificationsTable = pgTable("notifications", {
  id: uuid().primaryKey().defaultRandom(),
  actorId: uuid()
    .notNull()
    .references(() => usersTable.id, { onDelete: "cascade" }),
  receiverId: uuid()
    .notNull()
    .references(() => usersTable.id, { onDelete: "cascade" }),
  createdAt: timestamp().notNull().defaultNow(),
  groupId: uuid().references(() => groupsTable.id, { onDelete: "cascade" }),
  referenceType: referenceTypeEnum().notNull(),
  postId: uuid().references(() => postsTable.id, { onDelete: "cascade" }),
  commentId: uuid().references(() => commentsTable.id, { onDelete: "cascade" }),
  likeId: uuid().references(() => likesTable.id, { onDelete: "cascade" }),
  likeCommentId: uuid().references(() => likeCommentsTable.id, { onDelete: "cascade" }),
  title: varchar({ length: NAME_MAX_LIMIT }).notNull(),
  description: varchar({ length: NOTIFICATION_BODY_MAX_LIMIT }).notNull(),
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

export const likeCommentRelations = relations(likeCommentsTable, ({ one }) => ({
  user: one(usersTable, {
    fields: [likeCommentsTable.userId],
    references: [usersTable.id],
  }),
  comment: one(commentsTable, {
    fields: [likeCommentsTable.commentId],
    references: [commentsTable.id],
  }),
}));

export const userRelations = relations(usersTable, ({ many }) => ({
  posts: many(postsTable),
  comments: many(commentsTable),
  likes: many(likesTable),
  memberships: many(membersTable),
  devices: many(devicesTable),
  sentNotifications: many(notificationsTable, { relationName: "actorNotifications" }),
  receivedNotifications: many(notificationsTable, { relationName: "receiverNotifications" }),
  receivedInvitations: many(invitationsTable),
}));

export const groupRelations = relations(groupsTable, ({ one, many }) => ({
  posts: many(postsTable),
  members: many(membersTable),
  invitationLinks: many(linksTable),
  invitations: many(invitationsTable),
  manager: one(usersTable, {
    fields: [groupsTable.managerId],
    references: [usersTable.id],
  }),
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
  comments: many(commentsTable),
  likes: many(likesTable),
  media: many(mediaTable),
  notifications: many(notificationsTable),
}));

export const deviceRelations = relations(devicesTable, ({ one }) => ({
  user: one(usersTable, {
    fields: [devicesTable.userId],
    references: [usersTable.id],
  }),
}));

export const mediaRelations = relations(mediaTable, ({ one }) => ({
  post: one(postsTable, {
    fields: [mediaTable.postId],
    references: [postsTable.id],
  }),
}));

export const commentRelations = relations(commentsTable, ({ one, many }) => ({
  user: one(usersTable, {
    fields: [commentsTable.userId],
    references: [usersTable.id],
  }),
  post: one(postsTable, {
    fields: [commentsTable.postId],
    references: [postsTable.id],
  }),
  notifications: many(notificationsTable),
}));

export const likeRelations = relations(likesTable, ({ one, many }) => ({
  user: one(usersTable, {
    fields: [likesTable.userId],
    references: [usersTable.id],
  }),
  post: one(postsTable, {
    fields: [likesTable.postId],
    references: [postsTable.id],
  }),
  notifications: many(notificationsTable),
}));

export const memberRelations = relations(membersTable, ({ one }) => ({
  user: one(usersTable, {
    fields: [membersTable.userId],
    references: [usersTable.id],
  }),
  group: one(groupsTable, {
    fields: [membersTable.groupId],
    references: [groupsTable.id],
  }),
}));

export const notificationRelations = relations(notificationsTable, ({ one }) => ({
  actor: one(usersTable, {
    fields: [notificationsTable.actorId],
    references: [usersTable.id],
    relationName: "actorNotifications",
  }),
  receiver: one(usersTable, {
    fields: [notificationsTable.receiverId],
    references: [usersTable.id],
    relationName: "receiverNotifications",
  }),
  group: one(groupsTable, {
    fields: [notificationsTable.groupId],
    references: [groupsTable.id],
  }),
  post: one(postsTable, {
    fields: [notificationsTable.postId],
    references: [postsTable.id],
  }),
  comment: one(commentsTable, {
    fields: [notificationsTable.commentId],
    references: [commentsTable.id],
  }),
  like: one(likesTable, {
    fields: [notificationsTable.likeId],
    references: [likesTable.id],
  }),
  likeComment: one(likeCommentsTable, {
    fields: [notificationsTable.likeCommentId],
    references: [likeCommentsTable.id],
  }),
}));

export const linkRelations = relations(linksTable, ({ one, many }) => ({
  group: one(groupsTable, {
    fields: [linksTable.groupId],
    references: [groupsTable.id],
  }),
  invitations: many(invitationsTable),
}));

export const invitationRelations = relations(invitationsTable, ({ one, many }) => ({
  group: one(groupsTable, {
    fields: [invitationsTable.groupId],
    references: [groupsTable.id],
  }),
  invitationLink: one(linksTable, {
    fields: [invitationsTable.invitationLinkId],
    references: [linksTable.id],
  }),
  recipient: one(usersTable, {
    fields: [invitationsTable.recipientId],
    references: [usersTable.id],
  }),
  notifications: many(notificationsTable),
}));
