DROP TABLE IF EXISTS "media" CASCADE; -- statement-breakpoint

DO $$
BEGIN
    IF EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'posts' AND column_name = 'thumbnail'
    ) THEN
        ALTER TABLE "posts" RENAME COLUMN "thumbnail" TO "media";
    END IF;
END $$; -- statement-breakpoint

ALTER TABLE "comments" ADD COLUMN IF NOT EXISTS "voiceMemo" varchar; -- statement-breakpoint

ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "notificationsEnabled" boolean DEFAULT true NOT NULL; -- statement-breakpoint

ALTER TABLE "users" DROP COLUMN IF EXISTS "ageGroup"; -- statement-breakpoint

DROP TYPE IF EXISTS "public"."ageGroup"; -- statement-breakpoint

DROP TYPE IF EXISTS "public"."mediaType"; -- statement-breakpoint
