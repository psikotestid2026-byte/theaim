CREATE TABLE "ecourse_enrollments" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"registration_id" integer,
	"customer_id" integer NOT NULL,
	"service_id" integer NOT NULL,
	"access_granted_at" timestamp DEFAULT now() NOT NULL,
	"progress_day" integer DEFAULT 0 NOT NULL,
	"status" varchar(20) DEFAULT 'active' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "ecourse_modules" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"service_id" integer NOT NULL,
	"day_number" integer NOT NULL,
	"title" varchar(150) NOT NULL,
	"content_body" text,
	"video_url" varchar(255),
	"worksheet_file_url" varchar(255),
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "notification_logs" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"template_id" integer,
	"registration_id" integer,
	"recipient" varchar(150) NOT NULL,
	"channel" varchar(20) NOT NULL,
	"request_payload" jsonb,
	"response_payload" jsonb,
	"status" varchar(20) DEFAULT 'pending' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "notification_templates" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"event_trigger" varchar(50) NOT NULL,
	"channel" varchar(20) NOT NULL,
	"message_content" text NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "partnership_submissions" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"pic_full_name" varchar(150) NOT NULL,
	"pic_whatsapp_number" varchar(20) NOT NULL,
	"organization_name" varchar(150) NOT NULL,
	"collaboration_title" varchar(200) NOT NULL,
	"idea_description" text NOT NULL,
	"expected_role" text,
	"collaboration_goal" text,
	"estimated_timeline" varchar(100),
	"proposal_file_url" varchar(255),
	"previous_relation" varchar(10) DEFAULT 'no' NOT NULL,
	"status" varchar(20) DEFAULT 'submitted' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "proposal_download_leads" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"full_name" varchar(150) NOT NULL,
	"whatsapp_number" varchar(20) NOT NULL,
	"company_name" varchar(150),
	"position" varchar(100),
	"proposal_type" varchar(50) DEFAULT 'corporate_b2b' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "ecourse_enrollments" ADD CONSTRAINT "ecourse_enrollments_registration_id_registrations_id_fk" FOREIGN KEY ("registration_id") REFERENCES "public"."registrations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ecourse_enrollments" ADD CONSTRAINT "ecourse_enrollments_customer_id_customers_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."customers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ecourse_enrollments" ADD CONSTRAINT "ecourse_enrollments_service_id_services_id_fk" FOREIGN KEY ("service_id") REFERENCES "public"."services"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ecourse_modules" ADD CONSTRAINT "ecourse_modules_service_id_services_id_fk" FOREIGN KEY ("service_id") REFERENCES "public"."services"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notification_logs" ADD CONSTRAINT "notification_logs_template_id_notification_templates_id_fk" FOREIGN KEY ("template_id") REFERENCES "public"."notification_templates"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notification_logs" ADD CONSTRAINT "notification_logs_registration_id_registrations_id_fk" FOREIGN KEY ("registration_id") REFERENCES "public"."registrations"("id") ON DELETE no action ON UPDATE no action;