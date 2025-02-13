ALTER TABLE "comments" 
ALTER COLUMN "voiceMemo" 
SET DATA TYPE uuid USING "voiceMemo"::uuid;
