DROP INDEX "post_idx";--> statement-breakpoint
CREATE UNIQUE INDEX "post_idx" ON "notifications" USING btree ("postId","receiverId");