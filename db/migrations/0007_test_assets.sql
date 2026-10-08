CREATE TABLE IF NOT EXISTS test_assets (path text PRIMARY KEY, content_type text NOT NULL, data bytea NOT NULL, created_at timestamptz NOT NULL DEFAULT now());
