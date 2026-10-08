-- IST per-subtest clocks: { "SE": <epoch ms>, ... }. Each key is written once by the section-timer route.
ALTER TABLE "test_sessions" ADD COLUMN IF NOT EXISTS "section_started_at" jsonb DEFAULT '{}'::jsonb NOT NULL;
