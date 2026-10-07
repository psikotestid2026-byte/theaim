-- Attempt clock for timed tests. Identity confirmation still sets started_at earlier.
-- Matches started_at (timestamp without time zone) in the Drizzle schema.
ALTER TABLE "test_sessions" ADD COLUMN IF NOT EXISTS "timer_started_at" timestamp;
