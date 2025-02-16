ALTER TABLE "notifications" DROP CONSTRAINT "notifications_likeCommentId_likeComments_id_fk";
--> statement-breakpoint
ALTER TABLE "notifications" DROP COLUMN "likeCommentId";