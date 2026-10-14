ALTER TABLE "test_responses" ADD CONSTRAINT "uq_test_responses_session_item" UNIQUE("session_id","item_id");
