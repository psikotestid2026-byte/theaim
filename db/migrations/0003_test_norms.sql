CREATE TABLE "test_norms" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"test_id" integer NOT NULL,
	"age_group" varchar(30),
	"raw_score" varchar(20) NOT NULL,
	"norm_score" varchar(50) NOT NULL,
	"label" varchar(50) NOT NULL,
	"description" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "test_norms" ADD CONSTRAINT "test_norms_test_id_master_tests_id_fk" FOREIGN KEY ("test_id") REFERENCES "public"."master_tests"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_test_norms_test_raw" ON "test_norms" USING btree ("test_id","raw_score");