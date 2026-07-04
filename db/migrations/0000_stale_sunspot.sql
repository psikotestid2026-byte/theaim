CREATE TABLE "admin_users" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"full_name" varchar(255) NOT NULL,
	"email" varchar(255) NOT NULL,
	"password_hash" varchar(255) NOT NULL,
	"role" varchar(50) NOT NULL,
	"status" varchar(50) DEFAULT 'active' NOT NULL,
	"last_login_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "admin_users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "articles" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"title" varchar(255) NOT NULL,
	"slug" varchar(255) NOT NULL,
	"category" varchar(100) NOT NULL,
	"excerpt" text,
	"content" text NOT NULL,
	"cover_image_url" varchar(1024),
	"author_name" varchar(255) DEFAULT 'Tim TheAIM' NOT NULL,
	"reading_time_minutes" integer,
	"is_featured" boolean DEFAULT false NOT NULL,
	"status" varchar(50) DEFAULT 'draft' NOT NULL,
	"published_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "articles_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "consultants" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"full_name" varchar(255) NOT NULL,
	"role_title" varchar(255) NOT NULL,
	"specialization" varchar(255),
	"certification" varchar(255),
	"bio" text,
	"photo_url" varchar(1024),
	"status" varchar(50) DEFAULT 'active' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "corporate_inquiries" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"full_name" varchar(255) NOT NULL,
	"company_name" varchar(255) NOT NULL,
	"position" varchar(255),
	"whatsapp_number" varchar(20) NOT NULL,
	"interested_service" varchar(255),
	"message" text,
	"status" varchar(50) DEFAULT 'new' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "corporate_partners" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"logo_url" varchar(1024) NOT NULL,
	"partnership_type" varchar(50) DEFAULT 'client' NOT NULL,
	"status" varchar(50) DEFAULT 'active' NOT NULL,
	"display_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "customers" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"full_name" varchar(255) NOT NULL,
	"whatsapp_number" varchar(20) NOT NULL,
	"email" varchar(255),
	"city" varchar(255),
	"status" varchar(50) DEFAULT 'active' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "customers_whatsapp_number_unique" UNIQUE("whatsapp_number")
);
--> statement-breakpoint
CREATE TABLE "job_applications" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"job_posting_id" integer NOT NULL,
	"full_name" varchar(255) NOT NULL,
	"email" varchar(255) NOT NULL,
	"whatsapp_number" varchar(20),
	"linkedin_url" varchar(1024),
	"cv_file_url" varchar(1024) NOT NULL,
	"cover_message" text,
	"status" varchar(50) DEFAULT 'received' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "job_postings" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"title" varchar(255) NOT NULL,
	"slug" varchar(255) NOT NULL,
	"department" varchar(100) NOT NULL,
	"employment_type" varchar(50) NOT NULL,
	"location" varchar(255) NOT NULL,
	"description" text,
	"requirements" text,
	"status" varchar(50) DEFAULT 'open' NOT NULL,
	"posted_at" timestamp,
	"closed_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "job_postings_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "payment_instructions" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"payment_method_id" integer NOT NULL,
	"title" varchar(255) NOT NULL,
	"content" text NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "payment_logs" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"payment_id" integer,
	"provider_reference" varchar(255),
	"endpoint" varchar(255),
	"log_type" varchar(50) NOT NULL,
	"request_payload" jsonb,
	"response_payload" jsonb,
	"http_status" integer,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "payment_methods" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"code" varchar(50) NOT NULL,
	"name" varchar(255) NOT NULL,
	"logo_url" varchar(1024),
	"channel_type" varchar(50) NOT NULL,
	"provider" varchar(50) NOT NULL,
	"admin_fee_flat" varchar(20) DEFAULT '0' NOT NULL,
	"admin_fee_pct" varchar(10) DEFAULT '0' NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"is_redirect" boolean DEFAULT false NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "payment_methods_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE "payments" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"registration_id" integer NOT NULL,
	"payment_method_id" integer NOT NULL,
	"payment_code" varchar(20) NOT NULL,
	"amount" varchar(20) NOT NULL,
	"status" varchar(50) DEFAULT 'awaiting_confirmation' NOT NULL,
	"proof_file_url" varchar(1024),
	"confirmed_by" integer,
	"confirmed_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "payments_payment_code_unique" UNIQUE("payment_code")
);
--> statement-breakpoint
CREATE TABLE "registrations" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"registration_code" varchar(20) NOT NULL,
	"customer_id" integer NOT NULL,
	"service_id" integer NOT NULL,
	"package_id" integer,
	"full_name" varchar(255) NOT NULL,
	"whatsapp_number" varchar(20) NOT NULL,
	"notes" text,
	"price_quoted" varchar(20),
	"status" varchar(50) DEFAULT 'pending_confirmation' NOT NULL,
	"scheduled_at" timestamp,
	"assigned_consultant_id" integer,
	"source_channel" varchar(50) DEFAULT 'website' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "registrations_registration_code_unique" UNIQUE("registration_code")
);
--> statement-breakpoint
CREATE TABLE "seq_payments" (
	"id" bigserial PRIMARY KEY NOT NULL
);
--> statement-breakpoint
CREATE TABLE "seq_registrations" (
	"id" bigserial PRIMARY KEY NOT NULL
);
--> statement-breakpoint
CREATE TABLE "service_categories" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"slug" varchar(255) NOT NULL,
	"description" text,
	"display_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "service_categories_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "service_consultants" (
	"service_id" integer NOT NULL,
	"consultant_id" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE "service_packages" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"service_id" integer NOT NULL,
	"test_code" varchar(50),
	"name" varchar(255) NOT NULL,
	"price_type" varchar(50) NOT NULL,
	"price_amount" varchar(20),
	"price_min" varchar(20),
	"price_max" varchar(20),
	"price_unit" varchar(50) NOT NULL,
	"features" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"is_popular" boolean DEFAULT false NOT NULL,
	"status" varchar(50) DEFAULT 'active' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "services" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"category_id" integer NOT NULL,
	"name" varchar(255) NOT NULL,
	"slug" varchar(255) NOT NULL,
	"short_description" text,
	"description" text,
	"delivery_mode" varchar(50) NOT NULL,
	"audience_type" varchar(50) NOT NULL,
	"is_featured" boolean DEFAULT false NOT NULL,
	"status" varchar(50) DEFAULT 'published' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "services_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "test_items" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"test_code" varchar(50) NOT NULL,
	"section" varchar(100),
	"item_order" integer NOT NULL,
	"question_text" text NOT NULL,
	"options" jsonb NOT NULL,
	"scoring_meta" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "test_responses" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"session_id" integer NOT NULL,
	"item_id" integer NOT NULL,
	"answer_value" varchar(255) NOT NULL,
	"answered_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "test_results" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"session_id" integer NOT NULL,
	"test_code" varchar(50) NOT NULL,
	"raw_scores" jsonb NOT NULL,
	"result_type" varchar(255) NOT NULL,
	"result_label" varchar(255) NOT NULL,
	"interpretation" jsonb NOT NULL,
	"wa_summary_text" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "test_results_session_id_unique" UNIQUE("session_id")
);
--> statement-breakpoint
CREATE TABLE "test_sessions" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"registration_id" integer,
	"customer_id" integer NOT NULL,
	"package_id" integer NOT NULL,
	"test_code" varchar(50) NOT NULL,
	"access_token" varchar(36) NOT NULL,
	"result_token" varchar(36) NOT NULL,
	"status" varchar(50) DEFAULT 'issued' NOT NULL,
	"confirm_attempts" integer DEFAULT 0 NOT NULL,
	"locked_at" timestamp,
	"issued_at" timestamp DEFAULT now() NOT NULL,
	"expires_at" timestamp NOT NULL,
	"started_at" timestamp,
	"completed_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "test_sessions_access_token_unique" UNIQUE("access_token"),
	CONSTRAINT "test_sessions_result_token_unique" UNIQUE("result_token")
);
--> statement-breakpoint
CREATE TABLE "testimonials" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"customer_name" varchar(255) NOT NULL,
	"role_label" varchar(255),
	"related_service_id" integer,
	"content" text NOT NULL,
	"rating" integer,
	"photo_url" varchar(1024),
	"is_published" boolean DEFAULT true NOT NULL,
	"display_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "job_applications" ADD CONSTRAINT "job_applications_job_posting_id_job_postings_id_fk" FOREIGN KEY ("job_posting_id") REFERENCES "public"."job_postings"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payment_instructions" ADD CONSTRAINT "payment_instructions_payment_method_id_payment_methods_id_fk" FOREIGN KEY ("payment_method_id") REFERENCES "public"."payment_methods"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payment_logs" ADD CONSTRAINT "payment_logs_payment_id_payments_id_fk" FOREIGN KEY ("payment_id") REFERENCES "public"."payments"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payments" ADD CONSTRAINT "payments_registration_id_registrations_id_fk" FOREIGN KEY ("registration_id") REFERENCES "public"."registrations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payments" ADD CONSTRAINT "payments_payment_method_id_payment_methods_id_fk" FOREIGN KEY ("payment_method_id") REFERENCES "public"."payment_methods"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "registrations" ADD CONSTRAINT "registrations_customer_id_customers_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."customers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "registrations" ADD CONSTRAINT "registrations_service_id_services_id_fk" FOREIGN KEY ("service_id") REFERENCES "public"."services"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "registrations" ADD CONSTRAINT "registrations_package_id_service_packages_id_fk" FOREIGN KEY ("package_id") REFERENCES "public"."service_packages"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "registrations" ADD CONSTRAINT "registrations_assigned_consultant_id_consultants_id_fk" FOREIGN KEY ("assigned_consultant_id") REFERENCES "public"."consultants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "service_consultants" ADD CONSTRAINT "service_consultants_service_id_services_id_fk" FOREIGN KEY ("service_id") REFERENCES "public"."services"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "service_consultants" ADD CONSTRAINT "service_consultants_consultant_id_consultants_id_fk" FOREIGN KEY ("consultant_id") REFERENCES "public"."consultants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "service_packages" ADD CONSTRAINT "service_packages_service_id_services_id_fk" FOREIGN KEY ("service_id") REFERENCES "public"."services"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "services" ADD CONSTRAINT "services_category_id_service_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."service_categories"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "test_responses" ADD CONSTRAINT "test_responses_session_id_test_sessions_id_fk" FOREIGN KEY ("session_id") REFERENCES "public"."test_sessions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "test_responses" ADD CONSTRAINT "test_responses_item_id_test_items_id_fk" FOREIGN KEY ("item_id") REFERENCES "public"."test_items"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "test_results" ADD CONSTRAINT "test_results_session_id_test_sessions_id_fk" FOREIGN KEY ("session_id") REFERENCES "public"."test_sessions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "test_sessions" ADD CONSTRAINT "test_sessions_registration_id_registrations_id_fk" FOREIGN KEY ("registration_id") REFERENCES "public"."registrations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "test_sessions" ADD CONSTRAINT "test_sessions_customer_id_customers_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."customers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "test_sessions" ADD CONSTRAINT "test_sessions_package_id_service_packages_id_fk" FOREIGN KEY ("package_id") REFERENCES "public"."service_packages"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "testimonials" ADD CONSTRAINT "testimonials_related_service_id_services_id_fk" FOREIGN KEY ("related_service_id") REFERENCES "public"."services"("id") ON DELETE no action ON UPDATE no action;