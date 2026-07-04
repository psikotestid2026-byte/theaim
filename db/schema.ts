import {
  pgTable,
  bigserial,
  varchar,
  text,
  timestamp,
  boolean,
  integer,
  jsonb,
  date,
} from "drizzle-orm/pg-core";

export const serviceCategories = pgTable("service_categories", {
  id: bigserial("id", { mode: "number" }).primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  slug: varchar("slug", { length: 255 }).notNull().unique(),
  description: text("description"),
  display_order: integer("display_order").default(0).notNull(),
  created_at: timestamp("created_at").defaultNow().notNull(),
  updated_at: timestamp("updated_at").defaultNow().notNull(),
});

export const services = pgTable("services", {
  id: bigserial("id", { mode: "number" }).primaryKey(),
  category_id: integer("category_id").references(() => serviceCategories.id).notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  slug: varchar("slug", { length: 255 }).notNull().unique(),
  short_description: text("short_description"),
  description: text("description"),
  delivery_mode: varchar("delivery_mode", { length: 50 }).notNull(), // online, offline, hybrid
  audience_type: varchar("audience_type", { length: 50 }).notNull(), // individual, corporate, both
  is_featured: boolean("is_featured").default(false).notNull(),
  status: varchar("status", { length: 50 }).default("published").notNull(), // draft, published, archived
  created_at: timestamp("created_at").defaultNow().notNull(),
  updated_at: timestamp("updated_at").defaultNow().notNull(),
});

export const servicePackages = pgTable("service_packages", {
  id: bigserial("id", { mode: "number" }).primaryKey(),
  service_id: integer("service_id").references(() => services.id).notNull(),
  test_code: varchar("test_code", { length: 50 }),
  name: varchar("name", { length: 255 }).notNull(),
  price_type: varchar("price_type", { length: 50 }).notNull(), // fixed, range, negotiable
  price_amount: varchar("price_amount", { length: 20 }),
  price_min: varchar("price_min", { length: 20 }),
  price_max: varchar("price_max", { length: 20 }),
  price_unit: varchar("price_unit", { length: 50 }).notNull(),
  features: jsonb("features").$type<string[]>().default([]).notNull(),
  is_popular: boolean("is_popular").default(false).notNull(),
  status: varchar("status", { length: 50 }).default("active").notNull(),
  created_at: timestamp("created_at").defaultNow().notNull(),
  updated_at: timestamp("updated_at").defaultNow().notNull(),
});

export const consultants = pgTable("consultants", {
  id: bigserial("id", { mode: "number" }).primaryKey(),
  full_name: varchar("full_name", { length: 255 }).notNull(),
  role_title: varchar("role_title", { length: 255 }).notNull(),
  specialization: varchar("specialization", { length: 255 }),
  certification: varchar("certification", { length: 255 }),
  bio: text("bio"),
  photo_url: varchar("photo_url", { length: 1024 }),
  status: varchar("status", { length: 50 }).default("active").notNull(),
  created_at: timestamp("created_at").defaultNow().notNull(),
  updated_at: timestamp("updated_at").defaultNow().notNull(),
});

export const serviceConsultants = pgTable("service_consultants", {
  service_id: integer("service_id").references(() => services.id).notNull(),
  consultant_id: integer("consultant_id").references(() => consultants.id).notNull(),
});

export const customers = pgTable("customers", {
  id: bigserial("id", { mode: "number" }).primaryKey(),
  full_name: varchar("full_name", { length: 255 }).notNull(),
  whatsapp_number: varchar("whatsapp_number", { length: 20 }).notNull().unique(),
  email: varchar("email", { length: 255 }),
  city: varchar("city", { length: 255 }),
  status: varchar("status", { length: 50 }).default("active").notNull(),
  created_at: timestamp("created_at").defaultNow().notNull(),
  updated_at: timestamp("updated_at").defaultNow().notNull(),
});

export const registrations = pgTable("registrations", {
  id: bigserial("id", { mode: "number" }).primaryKey(),
  registration_code: varchar("registration_code", { length: 20 }).notNull().unique(),
  customer_id: integer("customer_id").references(() => customers.id).notNull(),
  service_id: integer("service_id").references(() => services.id).notNull(),
  package_id: integer("package_id").references(() => servicePackages.id),
  full_name: varchar("full_name", { length: 255 }).notNull(),
  whatsapp_number: varchar("whatsapp_number", { length: 20 }).notNull(),
  notes: text("notes"),
  price_quoted: varchar("price_quoted", { length: 20 }),
  status: varchar("status", { length: 50 }).default("pending_confirmation").notNull(),
  scheduled_at: timestamp("scheduled_at"),
  assigned_consultant_id: integer("assigned_consultant_id").references(() => consultants.id),
  source_channel: varchar("source_channel", { length: 50 }).default("website").notNull(),
  created_at: timestamp("created_at").defaultNow().notNull(),
  updated_at: timestamp("updated_at").defaultNow().notNull(),
});

export const paymentMethods = pgTable("payment_methods", {
  id: bigserial("id", { mode: "number" }).primaryKey(),
  code: varchar("code", { length: 50 }).notNull().unique(),
  name: varchar("name", { length: 255 }).notNull(),
  logo_url: varchar("logo_url", { length: 1024 }),
  channel_type: varchar("channel_type", { length: 50 }).notNull(),
  provider: varchar("provider", { length: 50 }).notNull(),
  admin_fee_flat: varchar("admin_fee_flat", { length: 20 }).default("0").notNull(),
  admin_fee_pct: varchar("admin_fee_pct", { length: 10 }).default("0").notNull(),
  is_active: boolean("is_active").default(true).notNull(),
  is_redirect: boolean("is_redirect").default(false).notNull(),
  sort_order: integer("sort_order").default(0).notNull(),
  created_at: timestamp("created_at").defaultNow().notNull(),
  updated_at: timestamp("updated_at").defaultNow().notNull(),
});

export const paymentInstructions = pgTable("payment_instructions", {
  id: bigserial("id", { mode: "number" }).primaryKey(),
  payment_method_id: integer("payment_method_id").references(() => paymentMethods.id).notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  content: text("content").notNull(),
  sort_order: integer("sort_order").default(0).notNull(),
  created_at: timestamp("created_at").defaultNow().notNull(),
  updated_at: timestamp("updated_at").defaultNow().notNull(),
});

export const payments = pgTable("payments", {
  id: bigserial("id", { mode: "number" }).primaryKey(),
  registration_id: integer("registration_id").references(() => registrations.id).notNull(),
  payment_method_id: integer("payment_method_id").references(() => paymentMethods.id).notNull(),
  payment_code: varchar("payment_code", { length: 20 }).notNull().unique(),
  amount: varchar("amount", { length: 20 }).notNull(),
  status: varchar("status", { length: 50 }).default("awaiting_confirmation").notNull(),
  proof_file_url: varchar("proof_file_url", { length: 1024 }),
  confirmed_by: integer("confirmed_by"),
  confirmed_at: timestamp("confirmed_at"),
  created_at: timestamp("created_at").defaultNow().notNull(),
  updated_at: timestamp("updated_at").defaultNow().notNull(),
});

export const paymentLogs = pgTable("payment_logs", {
  id: bigserial("id", { mode: "number" }).primaryKey(),
  payment_id: integer("payment_id").references(() => payments.id),
  provider_reference: varchar("provider_reference", { length: 255 }),
  endpoint: varchar("endpoint", { length: 255 }),
  log_type: varchar("log_type", { length: 50 }).notNull(),
  request_payload: jsonb("request_payload"),
  response_payload: jsonb("response_payload"),
  http_status: integer("http_status"),
  created_at: timestamp("created_at").defaultNow().notNull(),
});

export const testSessions = pgTable("test_sessions", {
  id: bigserial("id", { mode: "number" }).primaryKey(),
  registration_id: integer("registration_id").references(() => registrations.id),
  customer_id: integer("customer_id").references(() => customers.id).notNull(),
  package_id: integer("package_id").references(() => servicePackages.id).notNull(),
  test_code: varchar("test_code", { length: 50 }).notNull(),
  access_token: varchar("access_token", { length: 36 }).notNull().unique(),
  result_token: varchar("result_token", { length: 36 }).notNull().unique(),
  status: varchar("status", { length: 50 }).default("issued").notNull(),
  confirm_attempts: integer("confirm_attempts").default(0).notNull(),
  locked_at: timestamp("locked_at"),
  issued_at: timestamp("issued_at").defaultNow().notNull(),
  expires_at: timestamp("expires_at").notNull(),
  started_at: timestamp("started_at"),
  completed_at: timestamp("completed_at"),
  created_at: timestamp("created_at").defaultNow().notNull(),
  updated_at: timestamp("updated_at").defaultNow().notNull(),
});

export const testItems = pgTable("test_items", {
  id: bigserial("id", { mode: "number" }).primaryKey(),
  test_code: varchar("test_code", { length: 50 }).notNull(),
  section: varchar("section", { length: 100 }),
  item_order: integer("item_order").notNull(),
  question_text: text("question_text").notNull(),
  options: jsonb("options").notNull(),
  scoring_meta: jsonb("scoring_meta"),
  created_at: timestamp("created_at").defaultNow().notNull(),
  updated_at: timestamp("updated_at").defaultNow().notNull(),
});

export const testResponses = pgTable("test_responses", {
  id: bigserial("id", { mode: "number" }).primaryKey(),
  session_id: integer("session_id").references(() => testSessions.id).notNull(),
  item_id: integer("item_id").references(() => testItems.id).notNull(),
  answer_value: varchar("answer_value", { length: 255 }).notNull(),
  answered_at: timestamp("answered_at").defaultNow().notNull(),
});

export const testResults = pgTable("test_results", {
  id: bigserial("id", { mode: "number" }).primaryKey(),
  session_id: integer("session_id").references(() => testSessions.id).notNull().unique(),
  test_code: varchar("test_code", { length: 50 }).notNull(),
  raw_scores: jsonb("raw_scores").notNull(),
  result_type: varchar("result_type", { length: 255 }).notNull(),
  result_label: varchar("result_label", { length: 255 }).notNull(),
  interpretation: jsonb("interpretation").notNull(),
  wa_summary_text: text("wa_summary_text").notNull(),
  created_at: timestamp("created_at").defaultNow().notNull(),
});

export const articles = pgTable("articles", {
  id: bigserial("id", { mode: "number" }).primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  slug: varchar("slug", { length: 255 }).notNull().unique(),
  category: varchar("category", { length: 100 }).notNull(),
  excerpt: text("excerpt"),
  content: text("content").notNull(),
  cover_image_url: varchar("cover_image_url", { length: 1024 }),
  author_name: varchar("author_name", { length: 255 }).default("Tim TheAIM").notNull(),
  reading_time_minutes: integer("reading_time_minutes"),
  is_featured: boolean("is_featured").default(false).notNull(),
  status: varchar("status", { length: 50 }).default("draft").notNull(),
  published_at: timestamp("published_at"),
  created_at: timestamp("created_at").defaultNow().notNull(),
  updated_at: timestamp("updated_at").defaultNow().notNull(),
});

export const testimonials = pgTable("testimonials", {
  id: bigserial("id", { mode: "number" }).primaryKey(),
  customer_name: varchar("customer_name", { length: 255 }).notNull(),
  role_label: varchar("role_label", { length: 255 }),
  related_service_id: integer("related_service_id").references(() => services.id),
  content: text("content").notNull(),
  rating: integer("rating"),
  photo_url: varchar("photo_url", { length: 1024 }),
  is_published: boolean("is_published").default(true).notNull(),
  display_order: integer("display_order").default(0).notNull(),
  created_at: timestamp("created_at").defaultNow().notNull(),
  updated_at: timestamp("updated_at").defaultNow().notNull(),
});

export const corporatePartners = pgTable("corporate_partners", {
  id: bigserial("id", { mode: "number" }).primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  logo_url: varchar("logo_url", { length: 1024 }).notNull(),
  partnership_type: varchar("partnership_type", { length: 50 }).default("client").notNull(),
  status: varchar("status", { length: 50 }).default("active").notNull(),
  display_order: integer("display_order").default(0).notNull(),
  created_at: timestamp("created_at").defaultNow().notNull(),
  updated_at: timestamp("updated_at").defaultNow().notNull(),
});

export const corporateInquiries = pgTable("corporate_inquiries", {
  id: bigserial("id", { mode: "number" }).primaryKey(),
  full_name: varchar("full_name", { length: 255 }).notNull(),
  company_name: varchar("company_name", { length: 255 }).notNull(),
  position: varchar("position", { length: 255 }),
  whatsapp_number: varchar("whatsapp_number", { length: 20 }).notNull(),
  interested_service: varchar("interested_service", { length: 255 }),
  message: text("message"),
  status: varchar("status", { length: 50 }).default("new").notNull(),
  created_at: timestamp("created_at").defaultNow().notNull(),
  updated_at: timestamp("updated_at").defaultNow().notNull(),
});

export const jobPostings = pgTable("job_postings", {
  id: bigserial("id", { mode: "number" }).primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  slug: varchar("slug", { length: 255 }).notNull().unique(),
  department: varchar("department", { length: 100 }).notNull(),
  employment_type: varchar("employment_type", { length: 50 }).notNull(),
  location: varchar("location", { length: 255 }).notNull(),
  description: text("description"),
  requirements: text("requirements"),
  status: varchar("status", { length: 50 }).default("open").notNull(),
  posted_at: timestamp("posted_at"),
  closed_at: timestamp("closed_at"),
  created_at: timestamp("created_at").defaultNow().notNull(),
  updated_at: timestamp("updated_at").defaultNow().notNull(),
});

export const jobApplications = pgTable("job_applications", {
  id: bigserial("id", { mode: "number" }).primaryKey(),
  job_posting_id: integer("job_posting_id").references(() => jobPostings.id).notNull(),
  full_name: varchar("full_name", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }).notNull(),
  whatsapp_number: varchar("whatsapp_number", { length: 20 }),
  linkedin_url: varchar("linkedin_url", { length: 1024 }),
  cv_file_url: varchar("cv_file_url", { length: 1024 }).notNull(),
  cover_message: text("cover_message"),
  status: varchar("status", { length: 50 }).default("received").notNull(),
  created_at: timestamp("created_at").defaultNow().notNull(),
  updated_at: timestamp("updated_at").defaultNow().notNull(),
});

export const adminUsers = pgTable("admin_users", {
  id: bigserial("id", { mode: "number" }).primaryKey(),
  full_name: varchar("full_name", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  password_hash: varchar("password_hash", { length: 255 }).notNull(),
  role: varchar("role", { length: 50 }).notNull(),
  status: varchar("status", { length: 50 }).default("active").notNull(),
  last_login_at: timestamp("last_login_at"),
  created_at: timestamp("created_at").defaultNow().notNull(),
  updated_at: timestamp("updated_at").defaultNow().notNull(),
});

export const seqRegistrations = pgTable("seq_registrations", { id: bigserial("id", { mode: "number" }).primaryKey() });
export const seqPayments = pgTable("seq_payments", { id: bigserial("id", { mode: "number" }).primaryKey() });
