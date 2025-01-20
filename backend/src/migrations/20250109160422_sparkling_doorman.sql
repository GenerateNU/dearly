CREATE TYPE "public"."mediaType" AS ENUM('VIDEO', 'PHOTO');--> statement-breakpoint
CREATE TABLE "devices" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"userId" uuid NOT NULL,
	"token" varchar(152) NOT NULL,
	CONSTRAINT "unique_user_device_token" UNIQUE ("userId", "token")
);
--> statement-breakpoint
CREATE TABLE "media" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"postId" uuid NOT NULL,
	"url" varchar NOT NULL,
	"type" "mediaType" NOT NULL
);
--> statement-breakpoint
ALTER TABLE "devices" ADD CONSTRAINT "devices_userId_users_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "media" ADD CONSTRAINT "media_postId_posts_id_fk" FOREIGN KEY ("postId") REFERENCES "public"."posts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "posts" DROP COLUMN "media";--> statement-breakpoint
ALTER TABLE "users" DROP COLUMN "deviceTokens";
