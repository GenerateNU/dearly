ALTER TABLE "members" ADD COLUMN "commentNotificationEnabled" boolean DEFAULT true NOT NULL;--> statement-breakpoint
ALTER TABLE "members" ADD COLUMN "likeNotificationEnabled" boolean DEFAULT true NOT NULL;--> statement-breakpoint
ALTER TABLE "members" ADD COLUMN "postNotificationEnabled" boolean DEFAULT true NOT NULL;--> statement-breakpoint
ALTER TABLE "members" ADD COLUMN "nudgeNotificationEnabled" boolean DEFAULT true NOT NULL;--> statement-breakpoint
ALTER TABLE "scheduledNudges" ADD CONSTRAINT "scheduledNudges_groupId_groups_id_fk" FOREIGN KEY ("groupId") REFERENCES "public"."groups"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "members" DROP COLUMN "notificationsEnabled";