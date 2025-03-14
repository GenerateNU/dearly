ALTER TABLE "members" ADD COLUMN "commentNotificationEnabled" boolean DEFAULT true NOT NULL;--> statement-breakpoint
ALTER TABLE "members" ADD COLUMN "likeNotificationEnabled" boolean DEFAULT true NOT NULL;--> statement-breakpoint
ALTER TABLE "members" ADD COLUMN "postNotificationEnabled" boolean DEFAULT true NOT NULL;--> statement-breakpoint
ALTER TABLE "members" ADD COLUMN "nudgeNotificationEnabled" boolean DEFAULT true NOT NULL;--> statement-breakpoint
ALTER TABLE "members" DROP COLUMN "notificationsEnabled";