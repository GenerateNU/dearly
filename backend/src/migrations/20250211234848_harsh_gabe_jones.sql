CREATE TYPE "public"."dayOfWeek" AS ENUM('MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN');--> statement-breakpoint
CREATE TYPE "public"."frequency" AS ENUM('DAILY', 'WEEKLY', 'BIWEEKLY', 'MONTHLY', 'YEARLY');--> statement-breakpoint
CREATE TABLE "scheduledNudges" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"groupId" uuid NOT NULL,
	"frequency" "frequency" DEFAULT 'WEEKLY' NOT NULL,
	"daysOfWeek" "dayOfWeek"[],
	"day" integer,
	"month" integer,
	"nudgeAt" timestamp with time zone NOT NULL,
	"isActive" boolean DEFAULT true NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "day_check" CHECK ("scheduledNudges"."day" > 0 AND "scheduledNudges"."day" <= 31),
	CONSTRAINT "month_check" CHECK ("scheduledNudges"."month" > 0 AND "scheduledNudges"."month" <= 12),
	CONSTRAINT "weekly_biweekly_day_check" CHECK (
        ("scheduledNudges"."frequency" = 'WEEKLY' OR "scheduledNudges"."frequency" = 'BIWEEKLY') 
        AND array_length("scheduledNudges"."daysOfWeek", 1) > 0
      ),
	CONSTRAINT "monthly_day_check" CHECK (
        "scheduledNudges"."frequency" = 'MONTHLY' AND "scheduledNudges"."day" IS NOT NULL
      ),
	CONSTRAINT "yearly_day_month_check" CHECK (
        "scheduledNudges"."frequency" = 'YEARLY' 
        AND "scheduledNudges"."day" IS NOT NULL AND "scheduledNudges"."month" IS NOT NULL
      )
);
--> statement-breakpoint
ALTER TABLE "scheduledNudges" ADD CONSTRAINT "scheduledNudges_groupId_groups_id_fk" FOREIGN KEY ("groupId") REFERENCES "public"."groups"("id") ON DELETE cascade ON UPDATE no action;