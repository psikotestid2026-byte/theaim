CREATE TABLE "master_tests" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"code" varchar(50) NOT NULL,
	"name" varchar(255) NOT NULL,
	"category" varchar(50) DEFAULT 'PERSONALITY' NOT NULL,
	"description" text,
	"instructions" text,
	"duration_sec" integer DEFAULT 0 NOT NULL,
	"total_questions" integer DEFAULT 0 NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "master_tests_code_unique" UNIQUE("code"),
	CONSTRAINT "ck_master_tests_category" CHECK ("master_tests"."category" IN ('PERSONALITY','COGNITIVE','LEADERSHIP','VOKASIONAL','TECHNICAL','GENERAL'))
);
--> statement-breakpoint
CREATE TABLE "scoring_configs" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"test_id" integer NOT NULL,
	"formula_type" varchar(100) NOT NULL,
	"config_data" jsonb NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "scoring_configs_test_id_unique" UNIQUE("test_id")
);
--> statement-breakpoint
CREATE TABLE "strength_activities" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"code" varchar(40) NOT NULL,
	"name" varchar(100) NOT NULL,
	"cluster" varchar(30),
	"definition" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "strength_activities_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE "strength_typologies" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"code" varchar(5) NOT NULL,
	"name" varchar(50) NOT NULL,
	"category" varchar(50),
	"description" text,
	"personal_branding" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "strength_typologies_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE "talent_themes" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"code" varchar(5) NOT NULL,
	"name" varchar(100) NOT NULL,
	"domain" varchar(20) NOT NULL,
	"description" text,
	"suitable_roles" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"strengths" text,
	"watch_out" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "talent_themes_code_unique" UNIQUE("code"),
	CONSTRAINT "ck_talent_themes_domain" CHECK ("talent_themes"."domain" IN ('Striving','Thinking','Relating','Influencing','Executing'))
);
--> statement-breakpoint
CREATE TABLE "tm_results" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"test_result_id" integer NOT NULL,
	"session_id" integer NOT NULL,
	"customer_id" integer NOT NULL,
	"talent_ranking" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"domain_distribution" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"strength_potentials" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"st30_scores" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"personal_branding" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"career_recommendations" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "tm_results_test_result_id_unique" UNIQUE("test_result_id"),
	CONSTRAINT "tm_results_session_id_unique" UNIQUE("session_id")
);
--> statement-breakpoint
ALTER TABLE "test_items" ADD COLUMN "test_id" integer;--> statement-breakpoint
ALTER TABLE "test_sessions" ADD COLUMN "test_id" integer;--> statement-breakpoint
ALTER TABLE "scoring_configs" ADD CONSTRAINT "scoring_configs_test_id_master_tests_id_fk" FOREIGN KEY ("test_id") REFERENCES "public"."master_tests"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tm_results" ADD CONSTRAINT "tm_results_test_result_id_test_results_id_fk" FOREIGN KEY ("test_result_id") REFERENCES "public"."test_results"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tm_results" ADD CONSTRAINT "tm_results_session_id_test_sessions_id_fk" FOREIGN KEY ("session_id") REFERENCES "public"."test_sessions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tm_results" ADD CONSTRAINT "tm_results_customer_id_customers_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."customers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_master_tests_category" ON "master_tests" USING btree ("category");--> statement-breakpoint
CREATE INDEX "idx_tm_results_customer" ON "tm_results" USING btree ("customer_id");--> statement-breakpoint
ALTER TABLE "test_items" ADD CONSTRAINT "test_items_test_id_master_tests_id_fk" FOREIGN KEY ("test_id") REFERENCES "public"."master_tests"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "test_sessions" ADD CONSTRAINT "test_sessions_test_id_master_tests_id_fk" FOREIGN KEY ("test_id") REFERENCES "public"."master_tests"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_test_items_test_id" ON "test_items" USING btree ("test_id");--> statement-breakpoint
CREATE INDEX "idx_test_sessions_test_id" ON "test_sessions" USING btree ("test_id");