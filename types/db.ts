// Hand-written TypeScript interfaces mirroring erd.md rows
// These are returned by lib/queries/*.ts functions

export interface ServiceCategory {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  display_order: number;
  created_at: string;
  updated_at: string;
}

export interface Service {
  id: number;
  category_id: number;
  name: string;
  slug: string;
  short_description: string | null;
  description: string | null;
  delivery_mode: "online" | "offline" | "hybrid";
  audience_type: "individual" | "corporate" | "both";
  is_featured: boolean;
  status: "draft" | "published" | "archived";
  created_at: string;
  updated_at: string;
  category_name?: string;
}

export interface ServicePackage {
  id: number;
  service_id: number;
  test_code: string | null;
  name: string;
  price_type: "fixed" | "range" | "negotiable";
  price_amount: string | null;
  price_min: string | null;
  price_max: string | null;
  price_unit: "per_session" | "per_day" | "per_pax" | "per_access" | "per_hour";
  features: string[];
  is_popular: boolean;
  status: "active" | "inactive";
  created_at: string;
  updated_at: string;
  service_name?: string;
}

export interface Consultant {
  id: number;
  full_name: string;
  role_title: string;
  specialization: string | null;
  certification: string | null;
  bio: string | null;
  photo_url: string | null;
  status: "active" | "inactive";
  created_at: string;
  updated_at: string;
}

export interface Customer {
  id: number;
  full_name: string;
  whatsapp_number: string;
  email: string | null;
  city: string | null;
  status: "active" | "blocked";
  created_at: string;
  updated_at: string;
}

export interface Registration {
  id: number;
  registration_code: string;
  customer_id: number;
  service_id: number;
  package_id: number | null;
  full_name: string;
  whatsapp_number: string;
  notes: string | null;
  price_quoted: string | null;
  status:
    | "pending_confirmation"
    | "schedule_confirmed"
    | "payment_pending"
    | "paid"
    | "completed"
    | "cancelled";
  scheduled_at: string | null;
  assigned_consultant_id: number | null;
  source_channel: string;
  created_at: string;
  updated_at: string;
  service_name?: string;
  package_name?: string;
  customer_name?: string;
  customer_wa?: string;
}

export interface PaymentMethod {
  id: number;
  code: string;
  name: string;
  logo_url: string | null;
  channel_type: "qris" | "virtual_account" | "e_wallet" | "bank_transfer_manual" | "retail_outlet";
  provider: "xendit" | "midtrans" | "manual";
  admin_fee_flat: string;
  admin_fee_pct: string;
  is_active: boolean;
  is_redirect: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface PaymentInstruction {
  id: number;
  payment_method_id: number;
  title: string;
  content: string;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface Payment {
  id: number;
  registration_id: number;
  payment_method_id: number;
  payment_code: string;
  amount: string;
  status: "awaiting_confirmation" | "confirmed" | "rejected" | "refunded";
  proof_file_url: string | null;
  confirmed_by: number | null;
  confirmed_at: string | null;
  created_at: string;
  updated_at: string;
  method_name?: string;
  registration_code?: string;
}

export interface PaymentLog {
  id: number;
  payment_id: number | null;
  provider_reference: string | null;
  endpoint: string | null;
  log_type: "payment_request" | "callback" | "webhook";
  request_payload: object | null;
  response_payload: object | null;
  http_status: number | null;
  created_at: string;
}

export interface NotificationTemplate {
  id: number;
  event_trigger: string;
  channel: "whatsapp" | "email" | "sms";
  message_content: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface NotificationLog {
  id: number;
  template_id: number | null;
  registration_id: number | null;
  recipient: string;
  channel: "whatsapp" | "email" | "sms";
  request_payload: object | null;
  response_payload: object | null;
  status: "sent" | "failed" | "pending";
  created_at: string;
}

export interface TestSession {
  id: number;
  registration_id: number | null;
  customer_id: number;
  package_id: number;
  test_code: string;
  access_token: string;
  result_token: string;
  status: "issued" | "confirming" | "in_progress" | "completed" | "expired" | "revoked" | "locked";
  confirm_attempts: number;
  locked_at: string | null;
  issued_at: string;
  expires_at: string;
  started_at: string | null;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
  // joined fields
  whatsapp_number?: string;
  customer_name?: string;
  package_name?: string;
}

export interface TestItem {
  id: number;
  test_code: string;
  section: string | null;
  item_order: number;
  question_text: string;
  options: TestItemOption[];
  scoring_meta: object | null;
  created_at: string;
  updated_at: string;
}

export interface TestItemOption {
  value: string;
  label: string;
  score_key: string;
  score_val: number;
}

export interface TestResponse {
  id: number;
  session_id: number;
  item_id: number;
  answer_value: string;
  answered_at: string;
}

export interface TestResult {
  id: number;
  session_id: number;
  test_code: string;
  raw_scores: Record<string, number>;
  result_type: string;
  result_label: string;
  interpretation: {
    description: string;
    strengths: string[];
    challenges: string[];
    careers?: string[];
  };
  wa_summary_text: string;
  created_at: string;
  // joined
  customer_name?: string;
  whatsapp_number?: string;
}

export interface TestResultPayload {
  raw_scores: Record<string, number>;
  result_type: string;
  result_label: string;
  interpretation: {
    description: string;
    strengths: string[];
    challenges: string[];
    careers?: string[];
  };
  wa_summary_text: string;
}

export interface CorporateInquiry {
  id: number;
  full_name: string;
  company_name: string;
  position: string | null;
  whatsapp_number: string;
  interested_service: string | null;
  message: string | null;
  status: "new" | "contacted" | "in_negotiation" | "won" | "lost";
  created_at: string;
  updated_at: string;
}

export interface PartnershipSubmission {
  id: number;
  pic_full_name: string;
  pic_whatsapp_number: string;
  organization_name: string;
  collaboration_title: string;
  idea_description: string;
  expected_role: string | null;
  collaboration_goal: string | null;
  estimated_timeline: string | null;
  proposal_file_url: string | null;
  previous_relation: "yes" | "no";
  status: "submitted" | "reviewing" | "approved" | "rejected";
  created_at: string;
  updated_at: string;
}

export interface ProposalDownloadLead {
  id: number;
  full_name: string;
  whatsapp_number: string;
  company_name: string | null;
  position: string | null;
  proposal_type: string;
  created_at: string;
}

export interface JobPosting {
  id: number;
  title: string;
  slug: string;
  department: "marketing_partnership" | "hr_psikologi" | "tech_creative";
  employment_type: "full_time" | "part_time" | "internship";
  location: string;
  description: string | null;
  requirements: string | null;
  status: "open" | "closed";
  posted_at: string | null;
  closed_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface JobApplication {
  id: number;
  job_posting_id: number;
  full_name: string;
  email: string;
  whatsapp_number: string | null;
  linkedin_url: string | null;
  cv_file_url: string;
  cover_message: string | null;
  status: "received" | "screening" | "interview" | "offered" | "rejected" | "hired";
  created_at: string;
  updated_at: string;
  job_title?: string;
}

export interface Article {
  id: number;
  title: string;
  slug: string;
  category:
    | "psikologi_mental"
    | "karir_profesional"
    | "tips_pengembangan_diri"
    | "event_aktivitas"
    | "partnership"
    | "in_the_news";
  excerpt: string | null;
  content: string;
  cover_image_url: string | null;
  author_name: string;
  reading_time_minutes: number | null;
  is_featured: boolean;
  status: "draft" | "published" | "archived";
  published_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface Testimonial {
  id: number;
  customer_name: string;
  role_label: string | null;
  related_service_id: number | null;
  content: string;
  rating: number | null;
  photo_url: string | null;
  is_published: boolean;
  display_order: number;
  created_at: string;
  updated_at: string;
}

export interface CorporatePartner {
  id: number;
  name: string;
  logo_url: string;
  partnership_type: "client" | "active_partnership";
  status: "active" | "inactive";
  display_order: number;
  created_at: string;
  updated_at: string;
}

export interface AdminUser {
  id: number;
  full_name: string;
  email: string;
  password_hash: string;
  role: "super_admin" | "cs_admin" | "content_editor" | "hr_recruiter" | "finance";
  status: "active" | "suspended";
  last_login_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface EcourseModule {
  id: number;
  service_id: number;
  day_number: number;
  title: string;
  content_body: string | null;
  video_url: string | null;
  worksheet_file_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface EcourseEnrollment {
  id: number;
  registration_id: number | null;
  customer_id: number;
  service_id: number;
  access_granted_at: string;
  progress_day: number;
  status: "active" | "completed" | "revoked";
  created_at: string;
  updated_at: string;
  customer_name?: string;
  service_name?: string;
}
