CREATE TABLE "likeComments" (
	"userId" uuid NOT NULL,
	"commentId" uuid NOT NULL,
	CONSTRAINT "likeComments_userId_commentId_pk" PRIMARY KEY("userId","commentId")
);
--> statement-breakpoint
ALTER TABLE "likeComments" ADD CONSTRAINT "likeComments_userId_users_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "likeComments" ADD CONSTRAINT "likeComments_commentId_comments_id_fk" FOREIGN KEY ("commentId") REFERENCES "public"."comments"("id") ON DELETE cascade ON UPDATE no action;