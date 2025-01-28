ALTER TABLE "members" ADD COLUMN "notificationsEnabled" boolean DEFAULT true NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "timezone" varchar;--> statement-breakpoint
ALTER TABLE "users" DROP COLUMN "notificationsEnabled";--> statement-breakpoint
ALTER TABLE "public"."notifications" ALTER COLUMN "referenceType" SET DATA TYPE text;--> statement-breakpoint
DROP TYPE "public"."referenceType";--> statement-breakpoint
CREATE TYPE "public"."referenceType" AS ENUM('POST', 'COMMENT', 'LIKE', 'NUDGE');--> statement-breakpoint
ALTER TABLE "public"."notifications" ALTER COLUMN "referenceType" SET DATA TYPE "public"."referenceType" USING "referenceType"::"public"."referenceType";