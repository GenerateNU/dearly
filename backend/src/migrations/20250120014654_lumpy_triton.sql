CREATE INDEX username_tsvector_idx ON users USING GIN (to_tsvector('english', username));
ALTER TABLE "notifications" ADD COLUMN "createdAt" timestamp DEFAULT now() NOT NULL;