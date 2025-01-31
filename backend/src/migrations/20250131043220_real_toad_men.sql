ALTER TYPE "public"."referenceType" ADD VALUE 'LIKE-COMMENT';--> statement-breakpoint
ALTER TABLE "notifications" RENAME COLUMN "invitationId" TO "likeCommentId";--> statement-breakpoint
ALTER TABLE "notifications" DROP CONSTRAINT "notifications_invitationId_invitations_id_fk";
--> statement-breakpoint
ALTER TABLE "likeComments" DROP CONSTRAINT "likeComments_userId_commentId_pk";--> statement-breakpoint
ALTER TABLE "likeComments" ADD COLUMN "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL;--> statement-breakpoint
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_likeCommentId_likeComments_id_fk" FOREIGN KEY ("likeCommentId") REFERENCES "public"."likeComments"("id") ON DELETE cascade ON UPDATE no action;