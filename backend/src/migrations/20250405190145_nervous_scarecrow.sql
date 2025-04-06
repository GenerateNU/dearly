DROP INDEX "post_like_idx";--> statement-breakpoint
DROP INDEX "post_comment_idx";--> statement-breakpoint
CREATE UNIQUE INDEX "post_idx" ON "notifications" USING btree ("postId","actorId");