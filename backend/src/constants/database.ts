export enum Mode {
  ADVANCED = "ADVANCED",
  BASIC = "BASIC",
}

export enum MediaType {
  PHOTO = "PHOTO",
  VIDEO = "VIDEO",
  AUDIO = "AUDIO",
}

export enum CommentType {
  AUDIO = "AUDIO",
  TEXT = "TEXT",
}

export enum MemberRole {
  MEMBER = "MEMBER",
  MANAGER = "MANAGER",
}

export enum NotificationType {
  POST = "POST",
  COMMENT = "COMMENT",
  LIKE = "LIKE",
  NUDGE = "NUDGE",
  LIKE_COMMENT = "LIKE-COMMENT",
}

export enum InvitationStatus {
  PENDING = "PENDING",
  ACCEPTED = "ACCEPTED",
}

export const TEXT_MAX_LIMIT = 500;
export const NAME_MAX_LIMIT = 100;
export const DEVICE_TOKEN_MAX_LIMIT = 152;
export const MIN_LIMIT = 1;
export const NOTIFICATION_BODY_MAX_LIMIT = 300;
export const MAX_MEDIA_COUNT = 3;
export const MIN_MEDIA_COUNT = 1;
