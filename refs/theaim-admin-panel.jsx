import React, { useState, useMemo } from "react";
import {
  LayoutDashboard, FolderTree, Package, Tag, Users, UserCog, Link2,
  ClipboardList, CreditCard, Building2, Handshake, FileDown, Briefcase,
  FileText, Newspaper, Quote, Image as ImageIcon, BookOpen, GraduationCap,
  ShieldCheck, Search, Bell, Star, ChevronRight, MoreHorizontal, Plus,
  ArrowUpRight, Wallet, ListChecks, Webhook, MessageSquare, Activity,
  Menu, X,
} from "lucide-react";

/* ---------------------------------------------------------------------- */
/* Seed data — mirrors erd.md tables for PT Abadi Insan Manfaat (TheAIM)  */
/* ---------------------------------------------------------------------- */

const serviceCategories = [
  { id: 1, name: "Assessment & Testing", slug: "assessment-testing", display_order: 1, services_count: 4 },
  { id: 2, name: "Exclusive Coaching", slug: "exclusive-coaching", display_order: 2, services_count: 4 },
  { id: 3, name: "Training & Workshop", slug: "training-workshop", display_order: 3, services_count: 3 },
  { id: 4, name: "Add-ons & Digital Products", slug: "addons-digital-products", display_order: 4, services_count: 1 },
];

const services = [
  { id: 1, category: "Assessment & Testing", name: "Talents Mapping", slug: "talents-mapping", delivery_mode: "hybrid", audience_type: "individual", status: "published", is_featured: true },
  { id: 2, category: "Assessment & Testing", name: "Tes Psikologi (Psikotes)", slug: "tes-psikologi", delivery_mode: "offline", audience_type: "individual", status: "published", is_featured: false },
  { id: 3, category: "Assessment & Testing", name: "Mental Health Checkup", slug: "mental-health-checkup", delivery_mode: "hybrid", audience_type: "individual", status: "published", is_featured: false },
  { id: 4, category: "Assessment & Testing", name: "Psychometric Test", slug: "psychometric-test", delivery_mode: "online", audience_type: "individual", status: "published", is_featured: false },
  { id: 5, category: "Exclusive Coaching", name: "Konseling dengan Psikolog", slug: "konseling-psikolog", delivery_mode: "hybrid", audience_type: "individual", status: "published", is_featured: false },
  { id: 6, category: "Exclusive Coaching", name: "Therapy (SEFT)", slug: "therapy-seft", delivery_mode: "offline", audience_type: "individual", status: "published", is_featured: false },
  { id: 7, category: "Exclusive Coaching", name: "Visual Coaching", slug: "visual-coaching", delivery_mode: "hybrid", audience_type: "individual", status: "published", is_featured: false },
  { id: 8, category: "Exclusive Coaching", name: "Konsultasi Keuangan", slug: "konsultasi-keuangan", delivery_mode: "online", audience_type: "individual", status: "published", is_featured: true },
  { id: 9, category: "Training & Workshop", name: "In-House Training", slug: "in-house-training", delivery_mode: "offline", audience_type: "corporate", status: "published", is_featured: false },
  { id: 10, category: "Training & Workshop", name: "Leadership & Outbound", slug: "leadership-outbound", delivery_mode: "offline", audience_type: "corporate", status: "published", is_featured: false },
  { id: 11, category: "Training & Workshop", name: "Upgrading Relawan & Kajian", slug: "upgrading-relawan-kajian", delivery_mode: "offline", audience_type: "both", status: "published", is_featured: false },
  { id: 12, category: "Add-ons & Digital Products", name: "E-Course Life Reset", slug: "ecourse-life-reset", delivery_mode: "online", audience_type: "individual", status: "published", is_featured: false },
];

const servicePackages = [
  { id: 1, service: "Talents Mapping", name: "Assessment Only", test_code: null, price_type: "fixed", price_amount: 300000, price_min: null, price_max: null, price_unit: "per_session", is_popular: false, status: "active" },
  { id: 2, service: "Talents Mapping", name: "Assessment + Consul", test_code: null, price_type: "fixed", price_amount: 500000, price_min: null, price_max: null, price_unit: "per_session", is_popular: true, status: "active" },
  { id: 3, service: "Mental Health Checkup", name: "Enneagram + Coaching", test_code: null, price_type: "fixed", price_amount: 500000, price_min: null, price_max: null, price_unit: "per_session", is_popular: false, status: "active" },
  { id: 4, service: "Psychometric Test", name: "Strength Typology 30", test_code: "STRENGTH30", price_type: "fixed", price_amount: 75000, price_min: null, price_max: null, price_unit: "per_access", is_popular: false, status: "active" },
  { id: 5, service: "Psychometric Test", name: "Enneagram Personality", test_code: "ENNEAGRAM", price_type: "fixed", price_amount: 75000, price_min: null, price_max: null, price_unit: "per_access", is_popular: false, status: "active" },
  { id: 6, service: "Psychometric Test", name: "DISC Assessment", test_code: "DISC", price_type: "fixed", price_amount: 75000, price_min: null, price_max: null, price_unit: "per_access", is_popular: false, status: "active" },
  { id: 7, service: "Psychometric Test", name: "MBTI", test_code: "MBTI", price_type: "fixed", price_amount: 75000, price_min: null, price_max: null, price_unit: "per_access", is_popular: false, status: "active" },
  { id: 8, service: "Psychometric Test", name: "Papikostick", test_code: "PAPIKOSTIK", price_type: "fixed", price_amount: 75000, price_min: null, price_max: null, price_unit: "per_access", is_popular: false, status: "active" },
  { id: 9, service: "Psychometric Test", name: "Cognitive Test (IQ)", test_code: "IQ", price_type: "fixed", price_amount: 75000, price_min: null, price_max: null, price_unit: "per_access", is_popular: false, status: "active" },
  { id: 10, service: "Psychometric Test", name: "Management Style", test_code: "MGMT_STYLE", price_type: "fixed", price_amount: 75000, price_min: null, price_max: null, price_unit: "per_access", is_popular: false, status: "active" },
  { id: 11, service: "Psychometric Test", name: "Holland RIASEC", test_code: "RIASEC", price_type: "fixed", price_amount: 75000, price_min: null, price_max: null, price_unit: "per_access", is_popular: false, status: "active" },
  { id: 12, service: "Psychometric Test", name: "Gaya Belajar", test_code: "GAYA_BELAJAR", price_type: "fixed", price_amount: 75000, price_min: null, price_max: null, price_unit: "per_access", is_popular: false, status: "active" },
  { id: 13, service: "Konseling dengan Psikolog", name: "Individual Session", test_code: null, price_type: "fixed", price_amount: 400000, price_min: null, price_max: null, price_unit: "per_session", is_popular: true, status: "active" },
  { id: 14, service: "Konseling dengan Psikolog", name: "Dual Session (Couple)", test_code: null, price_type: "fixed", price_amount: 550000, price_min: null, price_max: null, price_unit: "per_session", is_popular: false, status: "active" },
  { id: 15, service: "Visual Coaching", name: "Add-on Session", test_code: null, price_type: "fixed", price_amount: 150000, price_min: null, price_max: null, price_unit: "per_session", is_popular: false, status: "active" },
  { id: 16, service: "Therapy (SEFT)", name: "Add-on Session", test_code: null, price_type: "fixed", price_amount: 150000, price_min: null, price_max: null, price_unit: "per_session", is_popular: false, status: "active" },
  { id: 17, service: "Konsultasi Keuangan", name: "Sesi Konsultasi", test_code: null, price_type: "fixed", price_amount: 450000, price_min: null, price_max: null, price_unit: "per_session", is_popular: false, status: "active" },
  { id: 18, service: "In-House Training", name: "Baseline / Hari", test_code: null, price_type: "range", price_amount: null, price_min: 5000000, price_max: 15000000, price_unit: "per_day", is_popular: false, status: "active" },
  { id: 19, service: "Leadership & Outbound", name: "Baseline / Pax", test_code: null, price_type: "range", price_amount: null, price_min: 350000, price_max: 750000, price_unit: "per_pax", is_popular: false, status: "active" },
  { id: 20, service: "Upgrading Relawan & Kajian", name: "Baseline / Sesi (Subsidi Silang)", test_code: null, price_type: "negotiable", price_amount: null, price_min: null, price_max: null, price_unit: "per_session", is_popular: false, status: "active" },
  { id: 21, service: "E-Course Life Reset", name: "Akses Selamanya", test_code: null, price_type: "fixed", price_amount: 100000, price_min: null, price_max: null, price_unit: "per_access", is_popular: false, status: "active" },
];

const consultants = [
  { id: 1, full_name: "Dr. Ratna Puspitasari, M.Psi., Psikolog", role_title: "Psikolog Klinis", specialization: "Trauma & Kecemasan", certification: "HIMPSI Certified", status: "active" },
  { id: 2, full_name: "Alif Maulana, CPC", role_title: "Life & Visual Coach", specialization: "Karir & Pengembangan Diri", certification: "ICF Certified Coach", status: "active" },
  { id: 3, full_name: "Saefudin Zuhri, S.Psi.", role_title: "Asesor Talents Mapping", specialization: "Psikometri & Asesmen", certification: "Certified TM Assessor", status: "active" },
  { id: 4, full_name: "Wahid Hidayat, CFP®", role_title: "Financial Coach", specialization: "Financial Psychology", certification: "CFP Certified", status: "active" },
  { id: 5, full_name: "Citra Ayu Lestari, M.Psi.", role_title: "Terapis SEFT", specialization: "Trauma Release & SEFT", certification: "SEFT Certified Practitioner", status: "active" },
  { id: 6, full_name: "Zuhud Akbar", role_title: "Outbound Facilitator", specialization: "Leadership Training", certification: "—", status: "inactive" },
];

const serviceConsultants = [
  { id: 1, service: "Talents Mapping", consultant: "Saefudin Zuhri, S.Psi." },
  { id: 2, service: "Mental Health Checkup", consultant: "Dr. Ratna Puspitasari, M.Psi., Psikolog" },
  { id: 3, service: "Konseling dengan Psikolog", consultant: "Dr. Ratna Puspitasari, M.Psi., Psikolog" },
  { id: 4, service: "Therapy (SEFT)", consultant: "Citra Ayu Lestari, M.Psi." },
  { id: 5, service: "Visual Coaching", consultant: "Alif Maulana, CPC" },
  { id: 6, service: "Konsultasi Keuangan", consultant: "Wahid Hidayat, CFP®" },
  { id: 7, service: "In-House Training", consultant: "Alif Maulana, CPC" },
  { id: 8, service: "Leadership & Outbound", consultant: "Zuhud Akbar" },
];

const customers = [
  { id: 1, full_name: "Aliyah Maharani", whatsapp_number: "081234567801", email: "aliyah.m@gmail.com", city: "Bandung", status: "active" },
  { id: 2, full_name: "Budi Prasetyo", whatsapp_number: "081234567802", email: "budi.p@yahoo.com", city: "Jakarta", status: "active" },
  { id: 3, full_name: "Citra Wulandari", whatsapp_number: "081234567803", email: "citra.w@gmail.com", city: "Bandung", status: "active" },
  { id: 4, full_name: "David Hutapea", whatsapp_number: "081234567804", email: "david.h@outlook.com", city: "Bekasi", status: "active" },
  { id: 5, full_name: "Maya Sari Dewi", whatsapp_number: "081234567805", email: "maya.sari@gmail.com", city: "Bandung", status: "active" },
  { id: 6, full_name: "Rangga Saputra", whatsapp_number: "081234567806", email: "rangga.s@gmail.com", city: "Surabaya", status: "active" },
  { id: 7, full_name: "Nadia Kusuma", whatsapp_number: "081234567807", email: "—", city: "Bandung", status: "active" },
  { id: 8, full_name: "Fajar Nugroho", whatsapp_number: "081234567808", email: "fajar.n@gmail.com", city: "Bandung", status: "blocked" },
];

const registrations = [
  { id: 1, registration_code: "REG-20260601-0001", customer: "Aliyah Maharani", service: "Talents Mapping", package: "Assessment + Consul", price_quoted: 500000, status: "completed", scheduled_at: "2026-06-03", consultant: "Saefudin Zuhri, S.Psi.", created_at: "2026-06-01" },
  { id: 2, registration_code: "REG-20260605-0002", customer: "Budi Prasetyo", service: "Konseling dengan Psikolog", package: "Individual Session", price_quoted: 400000, status: "completed", scheduled_at: "2026-06-07", consultant: "Dr. Ratna Puspitasari, M.Psi., Psikolog", created_at: "2026-06-05" },
  { id: 3, registration_code: "REG-20260610-0003", customer: "Citra Wulandari", service: "Therapy (SEFT)", package: "Add-on Session", price_quoted: 150000, status: "completed", scheduled_at: "2026-06-12", consultant: "Citra Ayu Lestari, M.Psi.", created_at: "2026-06-10" },
  { id: 4, registration_code: "REG-20260615-0004", customer: "David Hutapea", service: "Konsultasi Keuangan", package: "Sesi Konsultasi", price_quoted: 450000, status: "paid", scheduled_at: "2026-06-18", consultant: "Wahid Hidayat, CFP®", created_at: "2026-06-15" },
  { id: 5, registration_code: "REG-20260618-0005", customer: "Maya Sari Dewi", service: "Psychometric Test", package: "MBTI", price_quoted: 75000, status: "paid", scheduled_at: null, consultant: "—", created_at: "2026-06-18" },
  { id: 6, registration_code: "REG-20260620-0006", customer: "Rangga Saputra", service: "Visual Coaching", package: "Add-on Session", price_quoted: 150000, status: "payment_pending", scheduled_at: "2026-06-25", consultant: "Alif Maulana, CPC", created_at: "2026-06-20" },
  { id: 7, registration_code: "REG-20260622-0007", customer: "Nadia Kusuma", service: "Mental Health Checkup", package: "Enneagram + Coaching", price_quoted: 500000, status: "schedule_confirmed", scheduled_at: "2026-06-29", consultant: "Dr. Ratna Puspitasari, M.Psi., Psikolog", created_at: "2026-06-22" },
  { id: 8, registration_code: "REG-20260624-0008", customer: "Fajar Nugroho", service: "Talents Mapping", package: "Assessment Only", price_quoted: null, status: "cancelled", scheduled_at: null, consultant: "—", created_at: "2026-06-24" },
  { id: 9, registration_code: "REG-20260626-0009", customer: "Aliyah Maharani", service: "E-Course Life Reset", package: "Akses Selamanya", price_quoted: 100000, status: "paid", scheduled_at: null, consultant: "—", created_at: "2026-06-26" },
  { id: 10, registration_code: "REG-20260627-0010", customer: "Budi Prasetyo", service: "Psychometric Test", package: "DISC Assessment", price_quoted: null, status: "pending_confirmation", scheduled_at: null, consultant: "—", created_at: "2026-06-27" },
];

const payments = [
  { id: 1, payment_code: "PAY-20260601-0001", registration_code: "REG-20260601-0001", payment_method: "BCA Virtual Account", amount: 500000, status: "confirmed", confirmed_by: "Sari Dewanti", created_at: "2026-06-01" },
  { id: 2, payment_code: "PAY-20260605-0002", registration_code: "REG-20260605-0002", payment_method: "QRIS Dinamis", amount: 400000, status: "confirmed", confirmed_by: "Sari Dewanti", created_at: "2026-06-05" },
  { id: 3, payment_code: "PAY-20260610-0003", registration_code: "REG-20260610-0003", payment_method: "QRIS Dinamis", amount: 150000, status: "confirmed", confirmed_by: "Nadia Oktaviani", created_at: "2026-06-10" },
  { id: 4, payment_code: "PAY-20260615-0004", registration_code: "REG-20260615-0004", payment_method: "Mandiri Virtual Account", amount: 450000, status: "confirmed", confirmed_by: "Sari Dewanti", created_at: "2026-06-15" },
  { id: 5, payment_code: "PAY-20260618-0005", registration_code: "REG-20260618-0005", payment_method: "GoPay", amount: 75000, status: "confirmed", confirmed_by: "Nadia Oktaviani", created_at: "2026-06-18" },
  { id: 6, payment_code: "PAY-20260620-0006", registration_code: "REG-20260620-0006", payment_method: "ShopeePay", amount: 150000, status: "awaiting_confirmation", confirmed_by: "—", created_at: "2026-06-20" },
  { id: 7, payment_code: "PAY-20260626-0007", registration_code: "REG-20260626-0009", payment_method: "DANA", amount: 100000, status: "confirmed", confirmed_by: "Nadia Oktaviani", created_at: "2026-06-26" },
  { id: 8, payment_code: "PAY-20260627-0008", registration_code: "REG-20260627-0010", payment_method: "Transfer Manual BCA", amount: 75000, status: "awaiting_confirmation", confirmed_by: "—", created_at: "2026-06-27" },
];

const paymentMethods = [
  { id: 1, code: "QRIS", name: "QRIS Dinamis", channel_type: "qris", provider: "xendit", admin_fee_flat: 0, admin_fee_pct: 0, is_active: true, sort_order: 1 },
  { id: 2, code: "GOPAY", name: "GoPay", channel_type: "e_wallet", provider: "xendit", admin_fee_flat: 0, admin_fee_pct: 0, is_active: true, sort_order: 2 },
  { id: 3, code: "SHOPEEPAY", name: "ShopeePay", channel_type: "e_wallet", provider: "xendit", admin_fee_flat: 0, admin_fee_pct: 0, is_active: true, sort_order: 3 },
  { id: 4, code: "DANA", name: "DANA", channel_type: "e_wallet", provider: "xendit", admin_fee_flat: 0, admin_fee_pct: 0, is_active: true, sort_order: 4 },
  { id: 5, code: "LINKAJA", name: "LinkAja", channel_type: "e_wallet", provider: "xendit", admin_fee_flat: 0, admin_fee_pct: 0, is_active: true, sort_order: 5 },
  { id: 6, code: "BCA_VA", name: "BCA Virtual Account", channel_type: "virtual_account", provider: "xendit", admin_fee_flat: 4000, admin_fee_pct: 0, is_active: true, sort_order: 6 },
  { id: 7, code: "MANDIRI_VA", name: "Mandiri Virtual Account", channel_type: "virtual_account", provider: "xendit", admin_fee_flat: 4000, admin_fee_pct: 0, is_active: true, sort_order: 7 },
  { id: 8, code: "BNI_VA", name: "BNI Virtual Account", channel_type: "virtual_account", provider: "xendit", admin_fee_flat: 4000, admin_fee_pct: 0, is_active: true, sort_order: 8 },
  { id: 9, code: "BRI_VA", name: "BRI Virtual Account", channel_type: "virtual_account", provider: "xendit", admin_fee_flat: 4000, admin_fee_pct: 0, is_active: true, sort_order: 9 },
  { id: 10, code: "BCA_MANUAL", name: "Transfer Manual BCA", channel_type: "bank_transfer_manual", provider: "manual", admin_fee_flat: 0, admin_fee_pct: 0, is_active: true, sort_order: 10 },
  { id: 11, code: "MANDIRI_MANUAL", name: "Transfer Manual Mandiri", channel_type: "bank_transfer_manual", provider: "manual", admin_fee_flat: 0, admin_fee_pct: 0, is_active: false, sort_order: 11 },
];

const paymentInstructions = [
  { id: 1, payment_method: "BCA Virtual Account", title: "Pembayaran via m-BCA", steps: 4, sort_order: 1 },
  { id: 2, payment_method: "BCA Virtual Account", title: "Pembayaran via ATM BCA", steps: 6, sort_order: 2 },
  { id: 3, payment_method: "Mandiri Virtual Account", title: "Pembayaran via Livin' by Mandiri", steps: 5, sort_order: 1 },
  { id: 4, payment_method: "QRIS Dinamis", title: "Pembayaran via QRIS", steps: 4, sort_order: 1 },
  { id: 5, payment_method: "GoPay", title: "Pembayaran via Gojek / GoPay", steps: 3, sort_order: 1 },
  { id: 6, payment_method: "Transfer Manual BCA", title: "Instruksi Transfer Manual BCA", steps: 3, sort_order: 1 },
];

const paymentLogs = [
  { id: 1, payment_code: "PAY-20260601-0001", provider_reference: "va-bca-REG20260601", log_type: "payment_request", endpoint: "https://api.xendit.co/v2/virtual_accounts", http_status: 200, created_at: "2026-06-01" },
  { id: 2, payment_code: "PAY-20260601-0001", provider_reference: "va-bca-REG20260601", log_type: "callback", endpoint: "https://api.xendit.co/callback/virtual_accounts", http_status: 200, created_at: "2026-06-02" },
  { id: 3, payment_code: "PAY-20260605-0002", provider_reference: "qr-REG20260605", log_type: "payment_request", endpoint: "https://api.xendit.co/qr_codes", http_status: 200, created_at: "2026-06-05" },
  { id: 4, payment_code: "PAY-20260605-0002", provider_reference: "qr-REG20260605", log_type: "webhook", endpoint: "/api/webhooks/xendit:payment.succeeded", http_status: 200, created_at: "2026-06-05" },
  { id: 5, payment_code: "PAY-20260620-0006", provider_reference: "ewc-shopeepay-REG20260620", log_type: "payment_request", endpoint: "https://api.xendit.co/ewallets/charges", http_status: 200, created_at: "2026-06-20" },
];

const notificationTemplates = [
  { id: 1, event_trigger: "registration_created", channel: "whatsapp", message_preview: "Halo {nama}, terima kasih telah mendaftar layanan {layanan} di TheAIM...", is_active: true },
  { id: 2, event_trigger: "schedule_confirmed", channel: "whatsapp", message_preview: "Jadwal sesi {layanan} Anda telah dikonfirmasi pada {tanggal}...", is_active: true },
  { id: 3, event_trigger: "payment_awaiting_confirmation", channel: "whatsapp", message_preview: "Pembayaran sebesar {nominal} untuk {layanan} sedang kami verifikasi...", is_active: true },
  { id: 4, event_trigger: "payment_confirmed", channel: "whatsapp", message_preview: "Pembayaran Anda sebesar {nominal} telah kami terima...", is_active: true },
  { id: 5, event_trigger: "registration_completed", channel: "whatsapp", message_preview: "Sesi {layanan} Anda telah selesai. Terima kasih telah mempercayakan...", is_active: true },
  { id: 6, event_trigger: "registration_completed", channel: "email", message_preview: "Halo {nama}, ringkasan hasil asesmen {layanan} Anda telah kami kirimkan...", is_active: false },
];

const notificationLogs = [
  { id: 1, event_trigger: "registration_completed", registration_code: "REG-20260626-0009", recipient: "081234567801", channel: "whatsapp", status: "sent", created_at: "2026-06-26" },
  { id: 2, event_trigger: "schedule_confirmed", registration_code: "REG-20260622-0007", recipient: "081234567807", channel: "whatsapp", status: "sent", created_at: "2026-06-22" },
  { id: 3, event_trigger: "payment_awaiting_confirmation", registration_code: "REG-20260620-0006", recipient: "081234567806", channel: "whatsapp", status: "sent", created_at: "2026-06-20" },
  { id: 4, event_trigger: "payment_confirmed", registration_code: "REG-20260605-0002", recipient: "081234567802", channel: "whatsapp", status: "sent", created_at: "2026-06-05" },
  { id: 5, event_trigger: "schedule_confirmed", registration_code: "REG-20260618-0005", recipient: "081234567805", channel: "whatsapp", status: "failed", created_at: "2026-06-18" },
];

const corporateInquiries = [
  { id: 1, full_name: "Hendra Wijaya", company_name: "PT Greeneration Indonesia", position: "HRD Manager", whatsapp_number: "081345670001", interested_service: "Employee Assistance Program (EAP)", status: "won", created_at: "2026-05-20" },
  { id: 2, full_name: "Sri Mulyani Hadi", company_name: "SMK IT Baitul Amin", position: "Kepala Sekolah", whatsapp_number: "081345670002", interested_service: "Hiring & Asesmen Rekrutmen", status: "contacted", created_at: "2026-06-02" },
  { id: 3, full_name: "Dimas Anggoro", company_name: "PT Telkomsel Mitra", position: "HR Business Partner", whatsapp_number: "081345670003", interested_service: "HR Consulting & HRIS System", status: "in_negotiation", created_at: "2026-06-10" },
  { id: 4, full_name: "Lutfi Hakim", company_name: "Koperasi Mitra Sejahtera", position: "Ketua Koperasi", whatsapp_number: "081345670004", interested_service: "In-House Training & Outbound", status: "new", created_at: "2026-06-21" },
  { id: 5, full_name: "Putri Ramadhani", company_name: "Universitas Mulia", position: "Wakil Rektor Kemahasiswaan", whatsapp_number: "081345670005", interested_service: "Hiring & Asesmen Rekrutmen", status: "new", created_at: "2026-06-23" },
  { id: 6, full_name: "Yusuf Maulana", company_name: "Yayasan Bina Sejahtera (YBM BRI)", position: "Program Manager", whatsapp_number: "081345670006", interested_service: "Employee Assistance Program (EAP)", status: "lost", created_at: "2026-05-05" },
];

const partnershipSubmissions = [
  { id: 1, pic_full_name: "Rizky Ananda", organization_name: "Greeneration Indonesia", collaboration_title: "Kolaborasi Webinar Lingkungan & Kesehatan Mental", previous_relation: "yes", status: "approved", created_at: "2026-05-18" },
  { id: 2, pic_full_name: "Lina Marlina", organization_name: "Universitas Negeri Bandung", collaboration_title: "Program Talents Mapping Mahasiswa Baru", previous_relation: "no", status: "reviewing", created_at: "2026-06-12" },
  { id: 3, pic_full_name: "Bayu Setiawan", organization_name: "Komunitas Bertumbuh", collaboration_title: "Sponsorship Kajian & Upgrading Relawan", previous_relation: "no", status: "submitted", created_at: "2026-06-19" },
  { id: 4, pic_full_name: "Intan Permatasari", organization_name: "Tokoparts Indonesia", collaboration_title: "Employee Wellness Day", previous_relation: "no", status: "submitted", created_at: "2026-06-24" },
  { id: 5, pic_full_name: "Farhan Ramadhan", organization_name: "Radio Republik Indonesia (RRI)", collaboration_title: "Talkshow Kesehatan Mental Bulanan", previous_relation: "yes", status: "rejected", created_at: "2026-05-29" },
];

const proposalDownloadLeads = [
  { id: 1, full_name: "Agus Salim", company_name: "PT Karya Gemilang Sukses", position: "HR Manager", whatsapp_number: "081567780001", proposal_type: "corporate_b2b", created_at: "2026-06-11" },
  { id: 2, full_name: "Devi Permatasari", company_name: "SMK Bina Sejahtera", position: "Waka Kurikulum", whatsapp_number: "081567780002", proposal_type: "corporate_b2b", created_at: "2026-06-14" },
  { id: 3, full_name: "Taufik Hidayat", company_name: "Bank Pembangunan Mandiri", position: "Learning & Dev Lead", whatsapp_number: "081567780003", proposal_type: "corporate_b2b", created_at: "2026-06-17" },
  { id: 4, full_name: "Wulan Suci", company_name: "Komunitas Muda Berdaya", position: "Koordinator", whatsapp_number: "081567780004", proposal_type: "corporate_b2b", created_at: "2026-06-20" },
  { id: 5, full_name: "Bagus Saputro", company_name: "PT Lokadesa Nusantara", position: "CEO", whatsapp_number: "081567780005", proposal_type: "corporate_b2b", created_at: "2026-06-23" },
  { id: 6, full_name: "Sinta Marlina", company_name: "Yayasan Generasi Tangguh", position: "Ketua Yayasan", whatsapp_number: "081567780006", proposal_type: "corporate_b2b", created_at: "2026-06-26" },
];

const jobPostings = [
  { id: 1, title: "Corporate BD & Marketing Lead", department: "marketing_partnership", employment_type: "full_time", location: "Bandung", status: "open", posted_at: "2026-05-20" },
  { id: 2, title: "Psikolog Klinis (Konseling & Terapi)", department: "hr_psikologi", employment_type: "full_time", location: "Bandung", status: "open", posted_at: "2026-06-01" },
  { id: 3, title: "Content Creator & Social Media Specialist", department: "tech_creative", employment_type: "full_time", location: "Bandung", status: "open", posted_at: "2026-06-10" },
  { id: 4, title: "HR & Recruitment Intern", department: "hr_psikologi", employment_type: "internship", location: "Bandung", status: "open", posted_at: "2026-06-15" },
  { id: 5, title: "UI/UX Designer (Part-Time)", department: "tech_creative", employment_type: "part_time", location: "Remote", status: "closed", posted_at: "2026-04-02" },
];

const jobApplications = [
  { id: 1, job_posting: "Corporate BD & Marketing Lead", full_name: "Salsabila Putri", email: "salsabila.p@gmail.com", status: "interview", created_at: "2026-06-03" },
  { id: 2, job_posting: "Corporate BD & Marketing Lead", full_name: "Reza Maulana", email: "reza.maulana@gmail.com", status: "screening", created_at: "2026-06-05" },
  { id: 3, job_posting: "Psikolog Klinis (Konseling & Terapi)", full_name: "Dewi Anggraini, M.Psi.", email: "dewi.anggraini@gmail.com", status: "offered", created_at: "2026-06-08" },
  { id: 4, job_posting: "Content Creator & Social Media Specialist", full_name: "Fikri Ramadhan", email: "fikri.r@gmail.com", status: "received", created_at: "2026-06-19" },
  { id: 5, job_posting: "Content Creator & Social Media Specialist", full_name: "Anisa Rahmawati", email: "anisa.r@gmail.com", status: "rejected", created_at: "2026-06-20" },
  { id: 6, job_posting: "HR & Recruitment Intern", full_name: "Naufal Adi", email: "naufal.adi@gmail.com", status: "received", created_at: "2026-06-22" },
  { id: 7, job_posting: "UI/UX Designer (Part-Time)", full_name: "Yoga Pratama", email: "yoga.p@gmail.com", status: "hired", created_at: "2026-04-10" },
];

const articles = [
  { id: 1, title: "Kenali Tanda-Tanda Burnout Sebelum Terlambat (dan Cara Keluar Darinya)", category: "psikologi_mental", author_name: "Tim TheAIM", reading_time_minutes: 6, status: "published", published_at: "2026-01-10", is_featured: true },
  { id: 2, title: "Cara Negosiasi Gaji Berdasarkan Profil Bakat — Bukan Sekadar Angka", category: "karir_profesional", author_name: "Tim TheAIM", reading_time_minutes: 8, status: "published", published_at: "2026-01-03", is_featured: false },
  { id: 3, title: "5 Kebiasaan Pagi yang Terbukti Mengubah Energi & Produktivitasmu", category: "tips_pengembangan_diri", author_name: "Tim TheAIM", reading_time_minutes: 5, status: "published", published_at: "2025-12-28", is_featured: false },
  { id: 4, title: "Kemitraan Strategis TheAIM & Universitas Negeri Resmi Disepakati", category: "partnership", author_name: "Tim TheAIM", reading_time_minutes: 4, status: "published", published_at: "2025-11-18", is_featured: false },
  { id: 5, title: "Kolaborasi Besar Peningkatan Budaya Kerja Bersama 3 BUMN Unggulan Indonesia", category: "event_aktivitas", author_name: "Tim TheAIM", reading_time_minutes: 5, status: "published", published_at: "2025-12-20", is_featured: true },
  { id: 6, title: "TheAIM Diundang sebagai Pembicara di Konferensi HR Nasional", category: "in_the_news", author_name: "Tim TheAIM", reading_time_minutes: 3, status: "draft", published_at: null, is_featured: false },
  { id: 7, title: "Quarter-Life Crisis: Normal atau Perlu Bantuan Profesional?", category: "psikologi_mental", author_name: "Tim TheAIM", reading_time_minutes: 7, status: "published", published_at: "2025-12-15", is_featured: false },
];

const testimonials = [
  { id: 1, customer_name: "Aliyah M.", role_label: "Fresh Graduate", related_service: "Talents Mapping", rating: 5, is_published: true, display_order: 1 },
  { id: 2, customer_name: "Budi P.", role_label: "Karyawan Swasta", related_service: "Konseling dengan Psikolog", rating: 5, is_published: true, display_order: 2 },
  { id: 3, customer_name: "Citra W.", role_label: "Ibu Rumah Tangga", related_service: "Therapy (SEFT)", rating: 5, is_published: true, display_order: 3 },
  { id: 4, customer_name: "David H.", role_label: "Wirausaha", related_service: "Konsultasi Keuangan", rating: 4, is_published: true, display_order: 4 },
  { id: 5, customer_name: "Maya S.", role_label: "Mahasiswi", related_service: "Psychometric Test", rating: 5, is_published: false, display_order: 5 },
];

const corporatePartners = [
  { id: 1, name: "Greeneration Indonesia", partnership_type: "active_partnership", status: "active", display_order: 1 },
  { id: 2, name: "Telkomsel", partnership_type: "client", status: "active", display_order: 2 },
  { id: 3, name: "Tokopedia (Tokoparts)", partnership_type: "client", status: "active", display_order: 3 },
  { id: 4, name: "YBM BRI", partnership_type: "client", status: "active", display_order: 4 },
  { id: 5, name: "MPR RI", partnership_type: "client", status: "active", display_order: 5 },
  { id: 6, name: "Mulia University", partnership_type: "client", status: "active", display_order: 6 },
  { id: 7, name: "SMK IT Baitul Amin", partnership_type: "client", status: "active", display_order: 7 },
  { id: 8, name: "Dinas Kebudayaan & Pariwisata", partnership_type: "client", status: "inactive", display_order: 8 },
];

const ecourseModules = [
  { id: 1, service: "E-Course Life Reset", day_number: 1, title: "Mengenal Ulang Dirimu", has_video: true, has_worksheet: true },
  { id: 2, service: "E-Course Life Reset", day_number: 2, title: "Melepas Beban Emosi Lama", has_video: true, has_worksheet: true },
  { id: 3, service: "E-Course Life Reset", day_number: 3, title: "Menemukan Nilai Hidup Inti", has_video: true, has_worksheet: true },
  { id: 4, service: "E-Course Life Reset", day_number: 4, title: "Membangun Pola Pikir Baru", has_video: true, has_worksheet: false },
  { id: 5, service: "E-Course Life Reset", day_number: 5, title: "Merancang Rutinitas yang Mendukung", has_video: true, has_worksheet: true },
  { id: 6, service: "E-Course Life Reset", day_number: 6, title: "Memperkuat Relasi & Lingkungan", has_video: true, has_worksheet: true },
  { id: 7, service: "E-Course Life Reset", day_number: 7, title: "Komitmen & Rencana 90 Hari Ke Depan", has_video: true, has_worksheet: true },
];

const ecourseEnrollments = [
  { id: 1, customer: "Aliyah Maharani", service: "E-Course Life Reset", progress_day: 7, status: "completed", access_granted_at: "2026-06-26" },
  { id: 2, customer: "Maya Sari Dewi", service: "E-Course Life Reset", progress_day: 3, status: "active", access_granted_at: "2026-06-20" },
  { id: 3, customer: "Rangga Saputra", service: "E-Course Life Reset", progress_day: 1, status: "active", access_granted_at: "2026-06-25" },
  { id: 4, customer: "Fajar Nugroho", service: "E-Course Life Reset", progress_day: 0, status: "revoked", access_granted_at: "2026-06-10" },
];

const adminUsers = [
  { id: 1, full_name: "Sari Dewanti", email: "sari.d@theaim.id", role: "finance", status: "active", last_login_at: "2026-06-28 08:12" },
  { id: 2, full_name: "Nadia Oktaviani", email: "nadia.o@theaim.id", role: "cs_admin", status: "active", last_login_at: "2026-06-28 09:45" },
  { id: 3, full_name: "Reza Firmansyah", email: "reza.f@theaim.id", role: "content_editor", status: "active", last_login_at: "2026-06-27 16:30" },
  { id: 4, full_name: "Dicky Pratama", email: "dicky.p@theaim.id", role: "hr_recruiter", status: "active", last_login_at: "2026-06-26 14:05" },
  { id: 5, full_name: "Alifya Ihya Muhammad", email: "alifya.i@theaim.id", role: "super_admin", status: "active", last_login_at: "2026-06-28 07:00" },
  { id: 6, full_name: "Hadi Susanto", email: "hadi.s@theaim.id", role: "cs_admin", status: "suspended", last_login_at: "2026-05-02 11:20" },
];

/* ---------------------------------------------------------------------- */
/* Helpers                                                                 */
/* ---------------------------------------------------------------------- */

const STATUS_STYLES = {
  pending_confirmation: "bg-amber-50 text-amber-700 ring-amber-200",
  schedule_confirmed: "bg-sky-50 text-sky-700 ring-sky-200",
  payment_pending: "bg-orange-50 text-orange-700 ring-orange-200",
  paid: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  completed: "bg-teal-50 text-teal-700 ring-teal-200",
  cancelled: "bg-rose-50 text-rose-700 ring-rose-200",
  awaiting_confirmation: "bg-amber-50 text-amber-700 ring-amber-200",
  confirmed: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  rejected: "bg-rose-50 text-rose-700 ring-rose-200",
  refunded: "bg-slate-100 text-slate-600 ring-slate-200",
  active: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  inactive: "bg-slate-100 text-slate-600 ring-slate-200",
  blocked: "bg-rose-50 text-rose-700 ring-rose-200",
  suspended: "bg-rose-50 text-rose-700 ring-rose-200",
  published: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  draft: "bg-slate-100 text-slate-600 ring-slate-200",
  archived: "bg-slate-100 text-slate-500 ring-slate-200",
  open: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  closed: "bg-slate-100 text-slate-600 ring-slate-200",
  new: "bg-sky-50 text-sky-700 ring-sky-200",
  contacted: "bg-amber-50 text-amber-700 ring-amber-200",
  in_negotiation: "bg-orange-50 text-orange-700 ring-orange-200",
  won: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  lost: "bg-rose-50 text-rose-700 ring-rose-200",
  submitted: "bg-sky-50 text-sky-700 ring-sky-200",
  reviewing: "bg-amber-50 text-amber-700 ring-amber-200",
  approved: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  received: "bg-sky-50 text-sky-700 ring-sky-200",
  screening: "bg-amber-50 text-amber-700 ring-amber-200",
  interview: "bg-orange-50 text-orange-700 ring-orange-200",
  offered: "bg-teal-50 text-teal-700 ring-teal-200",
  hired: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  revoked: "bg-rose-50 text-rose-700 ring-rose-200",
  fixed: "bg-slate-100 text-slate-600 ring-slate-200",
  range: "bg-sky-50 text-sky-700 ring-sky-200",
  negotiable: "bg-amber-50 text-amber-700 ring-amber-200",
  yes: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  no: "bg-slate-100 text-slate-600 ring-slate-200",
  qris: "bg-violet-50 text-violet-700 ring-violet-200",
  bank_transfer: "bg-sky-50 text-sky-700 ring-sky-200",
  online: "bg-sky-50 text-sky-700 ring-sky-200",
  offline: "bg-slate-100 text-slate-600 ring-slate-200",
  hybrid: "bg-violet-50 text-violet-700 ring-violet-200",
  individual: "bg-slate-100 text-slate-600 ring-slate-200",
  corporate: "bg-teal-50 text-teal-700 ring-teal-200",
  both: "bg-violet-50 text-violet-700 ring-violet-200",
  client: "bg-slate-100 text-slate-600 ring-slate-200",
  active_partnership: "bg-teal-50 text-teal-700 ring-teal-200",
  super_admin: "bg-teal-50 text-teal-700 ring-teal-200",
  cs_admin: "bg-sky-50 text-sky-700 ring-sky-200",
  content_editor: "bg-violet-50 text-violet-700 ring-violet-200",
  hr_recruiter: "bg-amber-50 text-amber-700 ring-amber-200",
  finance: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  virtual_account: "bg-sky-50 text-sky-700 ring-sky-200",
  e_wallet: "bg-violet-50 text-violet-700 ring-violet-200",
  bank_transfer_manual: "bg-slate-100 text-slate-600 ring-slate-200",
  retail_outlet: "bg-amber-50 text-amber-700 ring-amber-200",
  xendit: "bg-teal-50 text-teal-700 ring-teal-200",
  midtrans: "bg-sky-50 text-sky-700 ring-sky-200",
  manual: "bg-slate-100 text-slate-600 ring-slate-200",
  payment_request: "bg-slate-100 text-slate-600 ring-slate-200",
  callback: "bg-sky-50 text-sky-700 ring-sky-200",
  webhook: "bg-violet-50 text-violet-700 ring-violet-200",
  sent: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  failed: "bg-rose-50 text-rose-700 ring-rose-200",
  pending: "bg-amber-50 text-amber-700 ring-amber-200",
  whatsapp: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  email: "bg-sky-50 text-sky-700 ring-sky-200",
  sms: "bg-slate-100 text-slate-600 ring-slate-200",
  registration_created: "bg-sky-50 text-sky-700 ring-sky-200",
  payment_awaiting_confirmation: "bg-amber-50 text-amber-700 ring-amber-200",
  registration_completed: "bg-teal-50 text-teal-700 ring-teal-200",
  registration_cancelled: "bg-rose-50 text-rose-700 ring-rose-200",
};

const BAR_SOLID = {
  pending_confirmation: "bg-amber-400",
  schedule_confirmed: "bg-sky-400",
  payment_pending: "bg-orange-400",
  paid: "bg-emerald-500",
  completed: "bg-teal-600",
  cancelled: "bg-rose-400",
};

function prettify(value) {
  if (value === null || value === undefined || value === "—") return "—";
  return String(value).replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

function StatusBadge({ value }) {
  if (value === null || value === undefined) return <span className="text-slate-400">—</span>;
  const cls = STATUS_STYLES[value] || "bg-slate-100 text-slate-600 ring-slate-200";
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset ${cls}`}>
      {prettify(value)}
    </span>
  );
}

function formatIDR(n) {
  if (n === null || n === undefined) return null;
  return "Rp " + n.toLocaleString("id-ID");
}

function formatDate(d) {
  if (!d) return "—";
  const dt = new Date(d);
  return dt.toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" });
}

function PriceCell({ row }) {
  if (row.price_type === "fixed") {
    return <span className="font-medium text-slate-800">{formatIDR(row.price_amount)}</span>;
  }
  if (row.price_type === "range") {
    return <span className="font-medium text-slate-800">{formatIDR(row.price_min)} – {formatIDR(row.price_max)}</span>;
  }
  return <span className="italic text-slate-500">Negotiable</span>;
}

function Stars({ count }) {
  return (
    <span className="inline-flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star key={i} size={13} className={i < count ? "fill-amber-400 text-amber-400" : "text-slate-200"} />
      ))}
    </span>
  );
}

/* ---------------------------------------------------------------------- */
/* Table configuration                                                     */
/* ---------------------------------------------------------------------- */

const TABLES = {
  service_categories: {
    title: "Service Categories",
    description: "Top-level grouping shown on the public rate card and service catalog.",
    data: serviceCategories,
    columns: [
      { label: "ID", render: (r) => <span className="font-mono text-xs text-slate-400">#{r.id}</span> },
      { label: "Name", render: (r) => <span className="font-medium text-slate-800">{r.name}</span> },
      { label: "Slug", render: (r) => <span className="font-mono text-xs text-slate-500">{r.slug}</span> },
      { label: "Order", render: (r) => r.display_order },
      { label: "Services", render: (r) => <span className="text-slate-500">{r.services_count} services</span> },
    ],
  },
  services: {
    title: "Services",
    description: "Individual service offerings shown on each service landing page.",
    data: services,
    columns: [
      { label: "ID", render: (r) => <span className="font-mono text-xs text-slate-400">#{r.id}</span> },
      { label: "Name", render: (r) => (
        <span className="flex items-center gap-1.5 font-medium text-slate-800">
          {r.name} {r.is_featured && <Star size={13} className="fill-amber-400 text-amber-400" />}
        </span>
      ) },
      { label: "Category", render: (r) => <span className="text-slate-500">{r.category}</span> },
      { label: "Delivery", render: (r) => <StatusBadge value={r.delivery_mode} /> },
      { label: "Audience", render: (r) => <StatusBadge value={r.audience_type} /> },
      { label: "Status", render: (r) => <StatusBadge value={r.status} /> },
    ],
  },
  service_packages: {
    title: "Service Packages",
    description: "Rate card line items — pricing variants for each service.",
    data: servicePackages,
    columns: [
      { label: "ID", render: (r) => <span className="font-mono text-xs text-slate-400">#{r.id}</span> },
      { label: "Package", render: (r) => (
        <span className="flex items-center gap-1.5 font-medium text-slate-800">
          {r.name} {r.is_popular && <span className="rounded-full bg-amber-100 px-1.5 py-0.5 text-[10px] font-semibold text-amber-700">Popular</span>}
        </span>
      ) },
      { label: "Service", render: (r) => <span className="text-slate-500">{r.service}</span> },
      { label: "Test Code", render: (r) => r.test_code ? <span className="font-mono text-xs text-slate-500">{r.test_code}</span> : <span className="text-slate-300">—</span> },
      { label: "Price Type", render: (r) => <StatusBadge value={r.price_type} /> },
      { label: "Price", render: (r) => <PriceCell row={r} /> },
      { label: "Unit", render: (r) => <span className="text-slate-500">{prettify(r.price_unit)}</span> },
      { label: "Status", render: (r) => <StatusBadge value={r.status} /> },
    ],
  },
  consultants: {
    title: "Consultants",
    description: "Psychologists, coaches, and therapists delivering TheAIM services.",
    data: consultants,
    columns: [
      { label: "ID", render: (r) => <span className="font-mono text-xs text-slate-400">#{r.id}</span> },
      { label: "Name", render: (r) => <span className="font-medium text-slate-800">{r.full_name}</span> },
      { label: "Role", render: (r) => <span className="text-slate-500">{r.role_title}</span> },
      { label: "Specialization", render: (r) => <span className="text-slate-500">{r.specialization}</span> },
      { label: "Certification", render: (r) => <span className="text-slate-500">{r.certification}</span> },
      { label: "Status", render: (r) => <StatusBadge value={r.status} /> },
    ],
  },
  service_consultants: {
    title: "Service ↔ Consultant Map",
    description: "Which consultant is associated with which service for credibility & assignment.",
    data: serviceConsultants,
    columns: [
      { label: "ID", render: (r) => <span className="font-mono text-xs text-slate-400">#{r.id}</span> },
      { label: "Service", render: (r) => <span className="font-medium text-slate-800">{r.service}</span> },
      { label: "Consultant", render: (r) => <span className="text-slate-500">{r.consultant}</span> },
    ],
  },
  customers: {
    title: "Customers",
    description: "Individuals who have registered for at least one service.",
    data: customers,
    columns: [
      { label: "ID", render: (r) => <span className="font-mono text-xs text-slate-400">#{r.id}</span> },
      { label: "Name", render: (r) => <span className="font-medium text-slate-800">{r.full_name}</span> },
      { label: "WhatsApp", render: (r) => <span className="font-mono text-xs text-slate-500">{r.whatsapp_number}</span> },
      { label: "Email", render: (r) => <span className="text-slate-500">{r.email}</span> },
      { label: "City", render: (r) => <span className="text-slate-500">{r.city}</span> },
      { label: "Status", render: (r) => <StatusBadge value={r.status} /> },
    ],
  },
  registrations: {
    title: "Registrations",
    description: "Booking pipeline from initial submission through completed session.",
    data: registrations,
    columns: [
      { label: "Code", render: (r) => <span className="font-mono text-xs text-slate-600">{r.registration_code}</span> },
      { label: "Customer", render: (r) => <span className="font-medium text-slate-800">{r.customer}</span> },
      { label: "Service", render: (r) => <span className="text-slate-500">{r.service}</span> },
      { label: "Package", render: (r) => <span className="text-slate-500">{r.package}</span> },
      { label: "Price", render: (r) => r.price_quoted ? <span className="font-medium text-slate-800">{formatIDR(r.price_quoted)}</span> : <span className="italic text-slate-400">Awaiting confirmation</span> },
      { label: "Status", render: (r) => <StatusBadge value={r.status} /> },
      { label: "Scheduled", render: (r) => <span className="text-slate-500">{formatDate(r.scheduled_at)}</span> },
      { label: "Consultant", render: (r) => <span className="text-slate-500">{r.consultant}</span> },
    ],
  },
  payments: {
    title: "Payments",
    description: "Payment records per registration — channel comes from the Payment Methods catalog, admin-verified.",
    data: payments,
    columns: [
      { label: "Code", render: (r) => <span className="font-mono text-xs text-slate-600">{r.payment_code}</span> },
      { label: "Registration", render: (r) => <span className="font-mono text-xs text-slate-500">{r.registration_code}</span> },
      { label: "Method", render: (r) => <span className="text-slate-600">{r.payment_method}</span> },
      { label: "Amount", render: (r) => <span className="font-medium text-slate-800">{formatIDR(r.amount)}</span> },
      { label: "Status", render: (r) => <StatusBadge value={r.status} /> },
      { label: "Confirmed By", render: (r) => <span className="text-slate-500">{r.confirmed_by}</span> },
      { label: "Date", render: (r) => <span className="text-slate-500">{formatDate(r.created_at)}</span> },
    ],
  },
  payment_methods: {
    title: "Payment Methods",
    description: "Configurable catalog of payment channels shown on the payment page — toggle availability and fees without a code deploy.",
    data: paymentMethods,
    columns: [
      { label: "ID", render: (r) => <span className="font-mono text-xs text-slate-400">#{r.id}</span> },
      { label: "Code", render: (r) => <span className="font-mono text-xs text-slate-500">{r.code}</span> },
      { label: "Name", render: (r) => <span className="font-medium text-slate-800">{r.name}</span> },
      { label: "Channel Type", render: (r) => <StatusBadge value={r.channel_type} /> },
      { label: "Provider", render: (r) => <StatusBadge value={r.provider} /> },
      { label: "Admin Fee", render: (r) => <span className="text-slate-500">{r.admin_fee_flat > 0 ? formatIDR(r.admin_fee_flat) : "Free"}</span> },
      { label: "Active", render: (r) => <StatusBadge value={r.is_active ? "active" : "inactive"} /> },
      { label: "Sort", render: (r) => r.sort_order },
    ],
  },
  payment_instructions: {
    title: "Payment Instructions",
    description: "Step-by-step \"how to pay\" content per payment method, editable by CS staff.",
    data: paymentInstructions,
    columns: [
      { label: "ID", render: (r) => <span className="font-mono text-xs text-slate-400">#{r.id}</span> },
      { label: "Payment Method", render: (r) => <span className="font-medium text-slate-800">{r.payment_method}</span> },
      { label: "Title", render: (r) => <span className="text-slate-600">{r.title}</span> },
      { label: "Steps", render: (r) => <span className="text-slate-500">{r.steps} steps</span> },
      { label: "Order", render: (r) => r.sort_order },
    ],
  },
  payment_logs: {
    title: "Payment Logs",
    description: "Raw gateway request/response audit trail — ready for live Xendit/Midtrans integration in Phase 2.",
    data: paymentLogs,
    columns: [
      { label: "ID", render: (r) => <span className="font-mono text-xs text-slate-400">#{r.id}</span> },
      { label: "Payment", render: (r) => <span className="font-mono text-xs text-slate-500">{r.payment_code}</span> },
      { label: "Provider Ref", render: (r) => <span className="font-mono text-xs text-slate-500">{r.provider_reference}</span> },
      { label: "Type", render: (r) => <StatusBadge value={r.log_type} /> },
      { label: "Endpoint", render: (r) => <span className="line-clamp-1 text-xs text-slate-400">{r.endpoint}</span> },
      { label: "HTTP", render: (r) => <span className="font-mono text-xs text-emerald-600">{r.http_status}</span> },
      { label: "Date", render: (r) => <span className="text-slate-500">{formatDate(r.created_at)}</span> },
    ],
  },
  notification_templates: {
    title: "Notification Templates",
    description: "Editable status-change messages per channel — WhatsApp today, email/SMS schema-ready.",
    data: notificationTemplates,
    columns: [
      { label: "ID", render: (r) => <span className="font-mono text-xs text-slate-400">#{r.id}</span> },
      { label: "Event", render: (r) => <StatusBadge value={r.event_trigger} /> },
      { label: "Channel", render: (r) => <StatusBadge value={r.channel} /> },
      { label: "Message Preview", render: (r) => <span className="line-clamp-1 text-slate-600">{r.message_preview}</span> },
      { label: "Active", render: (r) => <StatusBadge value={r.is_active ? "active" : "inactive"} /> },
    ],
  },
  notification_logs: {
    title: "Notification Logs",
    description: "Delivery record for every templated message sent against a registration.",
    data: notificationLogs,
    columns: [
      { label: "ID", render: (r) => <span className="font-mono text-xs text-slate-400">#{r.id}</span> },
      { label: "Event", render: (r) => <StatusBadge value={r.event_trigger} /> },
      { label: "Registration", render: (r) => <span className="font-mono text-xs text-slate-500">{r.registration_code}</span> },
      { label: "Recipient", render: (r) => <span className="font-mono text-xs text-slate-500">{r.recipient}</span> },
      { label: "Channel", render: (r) => <StatusBadge value={r.channel} /> },
      { label: "Status", render: (r) => <StatusBadge value={r.status} /> },
      { label: "Date", render: (r) => <span className="text-slate-500">{formatDate(r.created_at)}</span> },
    ],
  },
  corporate_inquiries: {
    title: "Corporate Inquiries",
    description: "B2B leads from the corporate landing page, tracked through a simple CRM pipeline.",
    data: corporateInquiries,
    columns: [
      { label: "ID", render: (r) => <span className="font-mono text-xs text-slate-400">#{r.id}</span> },
      { label: "Contact", render: (r) => <span className="font-medium text-slate-800">{r.full_name}</span> },
      { label: "Company", render: (r) => <span className="text-slate-500">{r.company_name}</span> },
      { label: "Position", render: (r) => <span className="text-slate-500">{r.position}</span> },
      { label: "Interest", render: (r) => <span className="text-slate-500">{r.interested_service}</span> },
      { label: "Status", render: (r) => <StatusBadge value={r.status} /> },
      { label: "Date", render: (r) => <span className="text-slate-500">{formatDate(r.created_at)}</span> },
    ],
  },
  partnership_submissions: {
    title: "Partnership Submissions",
    description: "Free-form collaboration proposals from universities, communities, and brands.",
    data: partnershipSubmissions,
    columns: [
      { label: "ID", render: (r) => <span className="font-mono text-xs text-slate-400">#{r.id}</span> },
      { label: "PIC", render: (r) => <span className="font-medium text-slate-800">{r.pic_full_name}</span> },
      { label: "Organization", render: (r) => <span className="text-slate-500">{r.organization_name}</span> },
      { label: "Title", render: (r) => <span className="text-slate-500">{r.collaboration_title}</span> },
      { label: "Prior Relation", render: (r) => <StatusBadge value={r.previous_relation} /> },
      { label: "Status", render: (r) => <StatusBadge value={r.status} /> },
      { label: "Date", render: (r) => <span className="text-slate-500">{formatDate(r.created_at)}</span> },
    ],
  },
  proposal_download_leads: {
    title: "Proposal Download Leads",
    description: "Gated B2B proposal downloads — captured as marketing leads for follow-up.",
    data: proposalDownloadLeads,
    columns: [
      { label: "ID", render: (r) => <span className="font-mono text-xs text-slate-400">#{r.id}</span> },
      { label: "Name", render: (r) => <span className="font-medium text-slate-800">{r.full_name}</span> },
      { label: "Company", render: (r) => <span className="text-slate-500">{r.company_name}</span> },
      { label: "Position", render: (r) => <span className="text-slate-500">{r.position}</span> },
      { label: "WhatsApp", render: (r) => <span className="font-mono text-xs text-slate-500">{r.whatsapp_number}</span> },
      { label: "Date", render: (r) => <span className="text-slate-500">{formatDate(r.created_at)}</span> },
    ],
  },
  job_postings: {
    title: "Job Postings",
    description: "Open roles shown on the careers page, filterable by department and type.",
    data: jobPostings,
    columns: [
      { label: "ID", render: (r) => <span className="font-mono text-xs text-slate-400">#{r.id}</span> },
      { label: "Title", render: (r) => <span className="font-medium text-slate-800">{r.title}</span> },
      { label: "Department", render: (r) => <span className="text-slate-500">{prettify(r.department)}</span> },
      { label: "Type", render: (r) => <StatusBadge value={r.employment_type} /> },
      { label: "Location", render: (r) => <span className="text-slate-500">{r.location}</span> },
      { label: "Status", render: (r) => <StatusBadge value={r.status} /> },
      { label: "Posted", render: (r) => <span className="text-slate-500">{formatDate(r.posted_at)}</span> },
    ],
  },
  job_applications: {
    title: "Job Applications",
    description: "Candidate applications tracked through the recruiting pipeline.",
    data: jobApplications,
    columns: [
      { label: "ID", render: (r) => <span className="font-mono text-xs text-slate-400">#{r.id}</span> },
      { label: "Applicant", render: (r) => <span className="font-medium text-slate-800">{r.full_name}</span> },
      { label: "Role Applied", render: (r) => <span className="text-slate-500">{r.job_posting}</span> },
      { label: "Email", render: (r) => <span className="text-slate-500">{r.email}</span> },
      { label: "Status", render: (r) => <StatusBadge value={r.status} /> },
      { label: "Date", render: (r) => <span className="text-slate-500">{formatDate(r.created_at)}</span> },
    ],
  },
  articles: {
    title: "Articles",
    description: "Content hub posts shown under Articles & Activities.",
    data: articles,
    columns: [
      { label: "ID", render: (r) => <span className="font-mono text-xs text-slate-400">#{r.id}</span> },
      { label: "Title", render: (r) => (
        <span className="flex items-center gap-1.5 font-medium text-slate-800">
          {r.is_featured && <Star size={13} className="fill-amber-400 text-amber-400 shrink-0" />}
          <span className="line-clamp-1">{r.title}</span>
        </span>
      ) },
      { label: "Category", render: (r) => <span className="text-slate-500">{prettify(r.category)}</span> },
      { label: "Author", render: (r) => <span className="text-slate-500">{r.author_name}</span> },
      { label: "Read Time", render: (r) => <span className="text-slate-500">{r.reading_time_minutes} min</span> },
      { label: "Status", render: (r) => <StatusBadge value={r.status} /> },
      { label: "Published", render: (r) => <span className="text-slate-500">{formatDate(r.published_at)}</span> },
    ],
  },
  testimonials: {
    title: "Testimonials",
    description: "Customer success stories shown on the homepage carousel.",
    data: testimonials,
    columns: [
      { label: "ID", render: (r) => <span className="font-mono text-xs text-slate-400">#{r.id}</span> },
      { label: "Customer", render: (r) => <span className="font-medium text-slate-800">{r.customer_name}</span> },
      { label: "Role", render: (r) => <span className="text-slate-500">{r.role_label}</span> },
      { label: "Related Service", render: (r) => <span className="text-slate-500">{r.related_service}</span> },
      { label: "Rating", render: (r) => <Stars count={r.rating} /> },
      { label: "Published", render: (r) => <StatusBadge value={r.is_published ? "published" : "draft"} /> },
      { label: "Order", render: (r) => r.display_order },
    ],
  },
  corporate_partners: {
    title: "Corporate Partners",
    description: "Client and partner logos shown on the homepage trust strip.",
    data: corporatePartners,
    columns: [
      { label: "ID", render: (r) => <span className="font-mono text-xs text-slate-400">#{r.id}</span> },
      { label: "Name", render: (r) => <span className="font-medium text-slate-800">{r.name}</span> },
      { label: "Type", render: (r) => <StatusBadge value={r.partnership_type} /> },
      { label: "Status", render: (r) => <StatusBadge value={r.status} /> },
      { label: "Order", render: (r) => r.display_order },
    ],
  },
  ecourse_modules: {
    title: "E-Course Modules",
    description: "The 7-day module structure for the Life Reset digital product.",
    data: ecourseModules,
    columns: [
      { label: "ID", render: (r) => <span className="font-mono text-xs text-slate-400">#{r.id}</span> },
      { label: "Day", render: (r) => <span className="font-medium text-slate-800">Day {r.day_number}</span> },
      { label: "Title", render: (r) => <span className="text-slate-700">{r.title}</span> },
      { label: "Video", render: (r) => <StatusBadge value={r.has_video ? "yes" : "no"} /> },
      { label: "Worksheet", render: (r) => <StatusBadge value={r.has_worksheet ? "yes" : "no"} /> },
    ],
  },
  ecourse_enrollments: {
    title: "E-Course Enrollments",
    description: "Customer access and progress through the Life Reset e-course.",
    data: ecourseEnrollments,
    columns: [
      { label: "ID", render: (r) => <span className="font-mono text-xs text-slate-400">#{r.id}</span> },
      { label: "Customer", render: (r) => <span className="font-medium text-slate-800">{r.customer}</span> },
      { label: "Service", render: (r) => <span className="text-slate-500">{r.service}</span> },
      { label: "Progress", render: (r) => (
        <span className="inline-flex items-center gap-2">
          <span className="h-1.5 w-16 overflow-hidden rounded-full bg-slate-100">
            <span className="block h-full rounded-full bg-teal-500" style={{ width: `${(r.progress_day / 7) * 100}%` }} />
          </span>
          <span className="text-xs text-slate-500">{r.progress_day}/7</span>
        </span>
      ) },
      { label: "Status", render: (r) => <StatusBadge value={r.status} /> },
      { label: "Granted", render: (r) => <span className="text-slate-500">{formatDate(r.access_granted_at)}</span> },
    ],
  },
  admin_users: {
    title: "Admin Users",
    description: "Internal staff accounts with role-based access to this panel.",
    data: adminUsers,
    columns: [
      { label: "ID", render: (r) => <span className="font-mono text-xs text-slate-400">#{r.id}</span> },
      { label: "Name", render: (r) => <span className="font-medium text-slate-800">{r.full_name}</span> },
      { label: "Email", render: (r) => <span className="text-slate-500">{r.email}</span> },
      { label: "Role", render: (r) => <StatusBadge value={r.role} /> },
      { label: "Status", render: (r) => <StatusBadge value={r.status} /> },
      { label: "Last Login", render: (r) => <span className="text-slate-500">{r.last_login_at}</span> },
    ],
  },
};

const NAV_GROUPS = [
  { group: "Overview", items: [{ key: "dashboard", label: "Dashboard", icon: LayoutDashboard }] },
  { group: "Catalog & Pricing", items: [
    { key: "service_categories", label: "Service Categories", icon: FolderTree },
    { key: "services", label: "Services", icon: Package },
    { key: "service_packages", label: "Service Packages", icon: Tag },
    { key: "consultants", label: "Consultants", icon: UserCog },
    { key: "service_consultants", label: "Service ↔ Consultant Map", icon: Link2 },
  ]},
  { group: "Customers & Booking", items: [
    { key: "customers", label: "Customers", icon: Users },
    { key: "registrations", label: "Registrations", icon: ClipboardList },
    { key: "payments", label: "Payments", icon: CreditCard },
  ]},
  { group: "Payment Infrastructure", items: [
    { key: "payment_methods", label: "Payment Methods", icon: Wallet },
    { key: "payment_instructions", label: "Payment Instructions", icon: ListChecks },
    { key: "payment_logs", label: "Payment Logs", icon: Webhook },
    { key: "notification_templates", label: "Notification Templates", icon: MessageSquare },
    { key: "notification_logs", label: "Notification Logs", icon: Activity },
  ]},
  { group: "Corporate & Partnership", items: [
    { key: "corporate_inquiries", label: "Corporate Inquiries", icon: Building2 },
    { key: "partnership_submissions", label: "Partnership Submissions", icon: Handshake },
    { key: "proposal_download_leads", label: "Proposal Download Leads", icon: FileDown },
  ]},
  { group: "Recruitment", items: [
    { key: "job_postings", label: "Job Postings", icon: Briefcase },
    { key: "job_applications", label: "Job Applications", icon: FileText },
  ]},
  { group: "Content & Marketing", items: [
    { key: "articles", label: "Articles", icon: Newspaper },
    { key: "testimonials", label: "Testimonials", icon: Quote },
    { key: "corporate_partners", label: "Corporate Partners", icon: ImageIcon },
  ]},
  { group: "Digital Product", items: [
    { key: "ecourse_modules", label: "E-Course Modules", icon: BookOpen },
    { key: "ecourse_enrollments", label: "E-Course Enrollments", icon: GraduationCap },
  ]},
  { group: "System", items: [
    { key: "admin_users", label: "Admin Users", icon: ShieldCheck },
  ]},
];

const FLAT_NAV = NAV_GROUPS.flatMap((g) => g.items);

/* ---------------------------------------------------------------------- */
/* Dashboard                                                               */
/* ---------------------------------------------------------------------- */

function Dashboard({ go }) {
  const totalRegistrations = registrations.length;
  const pendingPayments = payments.filter((p) => p.status === "awaiting_confirmation");
  const pendingPaymentsAmount = pendingPayments.reduce((s, p) => s + p.amount, 0);
  const openCorporate = corporateInquiries.filter((c) => !["won", "lost"].includes(c.status));
  const openJobs = jobPostings.filter((j) => j.status === "open");

  const statusOrder = ["pending_confirmation", "schedule_confirmed", "payment_pending", "paid", "completed", "cancelled"];
  const statusCounts = statusOrder.map((s) => ({
    status: s,
    count: registrations.filter((r) => r.status === s).length,
  }));

  const recentActivity = [
    { type: "registration", label: `${registrations[9].customer} registered for ${registrations[9].service}`, time: registrations[9].created_at },
    { type: "payment", label: `Payment ${payments[7].payment_code} awaiting confirmation`, time: payments[7].created_at },
    { type: "corporate", label: `${corporateInquiries[4].full_name} inquired about ${corporateInquiries[4].interested_service}`, time: corporateInquiries[4].created_at },
    { type: "registration", label: `${registrations[8].customer} purchased ${registrations[8].service}`, time: registrations[8].created_at },
    { type: "partnership", label: `${partnershipSubmissions[3].pic_full_name} submitted a partnership proposal`, time: partnershipSubmissions[3].created_at },
  ];

  const kpis = [
    { label: "Total Registrations", value: totalRegistrations, sub: `${statusCounts.find((s) => s.status === "completed").count} completed`, icon: ClipboardList, key: "registrations" },
    { label: "Payments Awaiting Confirmation", value: pendingPayments.length, sub: formatIDR(pendingPaymentsAmount), icon: CreditCard, key: "payments" },
    { label: "Open Corporate Pipeline", value: openCorporate.length, sub: `of ${corporateInquiries.length} total inquiries`, icon: Building2, key: "corporate_inquiries" },
    { label: "Open Job Postings", value: openJobs.length, sub: `${jobApplications.length} applications received`, icon: Briefcase, key: "job_postings" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold text-slate-900">Selamat datang kembali</h1>
        <p className="mt-1 text-sm text-slate-500">Here's what's happening across TheAIM's services today, 28 June 2026.</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {kpis.map((k) => (
          <button key={k.label} onClick={() => go(k.key)} className="group rounded-2xl border border-slate-200 bg-white p-5 text-left shadow-sm transition hover:border-teal-200 hover:shadow-md">
            <div className="flex items-center justify-between">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-teal-50 text-teal-700">
                <k.icon size={18} />
              </span>
              <ArrowUpRight size={15} className="text-slate-300 transition group-hover:text-teal-500" />
            </div>
            <p className="mt-4 font-display text-2xl font-semibold text-slate-900">{k.value}</p>
            <p className="text-xs font-medium text-slate-500">{k.label}</p>
            <p className="mt-1 text-xs text-slate-400">{k.sub}</p>
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm lg:col-span-2">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-sm font-semibold text-slate-800">Registration Funnel</h2>
            <button onClick={() => go("registrations")} className="text-xs font-medium text-teal-700 hover:underline">View all</button>
          </div>
          <p className="mt-0.5 text-xs text-slate-400">Distribution of all {totalRegistrations} registrations by current status</p>

          <div className="mt-5 flex h-3 w-full overflow-hidden rounded-full bg-slate-100">
            {statusCounts.map((s) => (
              s.count > 0 && (
                <div key={s.status} className={`${BAR_SOLID[s.status]} h-full`} style={{ width: `${(s.count / totalRegistrations) * 100}%` }} title={`${prettify(s.status)}: ${s.count}`} />
              )
            ))}
          </div>

          <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
            {statusCounts.map((s) => (
              <div key={s.status} className="flex items-center gap-2">
                <span className={`h-2 w-2 rounded-full ${BAR_SOLID[s.status]}`} />
                <span className="text-xs text-slate-600">{prettify(s.status)}</span>
                <span className="text-xs font-semibold text-slate-800">{s.count}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="font-display text-sm font-semibold text-slate-800">Recent Activity</h2>
          <ul className="mt-4 space-y-4">
            {recentActivity.map((a, i) => (
              <li key={i} className="flex gap-3">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-teal-500" />
                <div>
                  <p className="text-xs text-slate-700">{a.label}</p>
                  <p className="text-[11px] text-slate-400">{formatDate(a.time)}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------------- */
/* Generic data table                                                      */
/* ---------------------------------------------------------------------- */

function DataTable({ tableKey, searchTerm }) {
  const config = TABLES[tableKey];

  const filtered = useMemo(() => {
    if (!searchTerm) return config.data;
    const q = searchTerm.toLowerCase();
    return config.data.filter((row) => JSON.stringify(row).toLowerCase().includes(q));
  }, [config, searchTerm]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-semibold text-slate-900">{config.title}</h1>
          <p className="mt-1 text-sm text-slate-500">{config.description}</p>
        </div>
        <button className="flex items-center gap-1.5 rounded-xl bg-teal-700 px-3.5 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-teal-800">
          <Plus size={15} /> Add New
        </button>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/60">
                {config.columns.map((c) => (
                  <th key={c.label} className="whitespace-nowrap px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-400">{c.label}</th>
                ))}
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {filtered.map((row) => (
                <tr key={row.id} className="border-b border-slate-50 transition hover:bg-slate-50/70">
                  {config.columns.map((c) => (
                    <td key={c.label} className="whitespace-nowrap px-4 py-3">{c.render(row)}</td>
                  ))}
                  <td className="px-4 py-3 text-right">
                    <button className="rounded-lg p-1.5 text-slate-300 transition hover:bg-slate-100 hover:text-slate-500">
                      <MoreHorizontal size={16} />
                    </button>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={config.columns.length + 1} className="px-4 py-10 text-center text-sm text-slate-400">
                    No records match "{searchTerm}".
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="flex items-center justify-between border-t border-slate-100 px-4 py-3 text-xs text-slate-400">
          <span>Showing {filtered.length} of {config.data.length} entries</span>
          <div className="flex gap-1">
            <span className="rounded-lg border border-slate-200 px-2.5 py-1 font-medium text-slate-500">Previous</span>
            <span className="rounded-lg bg-teal-700 px-2.5 py-1 font-medium text-white">1</span>
            <span className="rounded-lg border border-slate-200 px-2.5 py-1 font-medium text-slate-500">Next</span>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------------- */
/* Shell: sidebar + topbar                                                 */
/* ---------------------------------------------------------------------- */

function Sidebar({ active, onSelect, open, onClose }) {
  return (
    <>
      {/* Mobile backdrop */}
      <div
        onClick={onClose}
        className={`fixed inset-0 z-30 bg-slate-900/50 transition-opacity duration-200 lg:hidden ${
          open ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
      />

      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-72 flex-col border-r border-slate-200 bg-white transition-transform duration-200 ease-out lg:static lg:z-auto lg:w-64 lg:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between px-5 py-5">
          <div className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-teal-700 font-display text-base font-semibold text-white">A</span>
            <div>
              <p className="font-display text-sm font-semibold leading-tight text-slate-900">TheAIM</p>
              <p className="text-[11px] leading-tight text-slate-400">Admin Panel</p>
            </div>
          </div>
          <button onClick={onClose} className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-50 hover:text-slate-600 lg:hidden">
            <X size={18} />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 pb-6">
          {NAV_GROUPS.map((g) => (
            <div key={g.group} className="mb-4">
              <p className="px-3 pb-1.5 pt-3 text-[10px] font-semibold uppercase tracking-wider text-slate-400">{g.group}</p>
              <div className="space-y-0.5">
                {g.items.map((item) => {
                  const isActive = active === item.key;
                  return (
                    <button
                      key={item.key}
                      onClick={() => onSelect(item.key)}
                      className={`flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-left text-sm transition ${
                        isActive ? "bg-teal-50 font-medium text-teal-800" : "text-slate-600 hover:bg-slate-50"
                      }`}
                    >
                      <item.icon size={16} className={isActive ? "text-teal-700" : "text-slate-400"} />
                      <span className="flex-1 truncate">{item.label}</span>
                      {isActive && <ChevronRight size={14} className="text-teal-400" />}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>
      </aside>
    </>
  );
}

function Topbar({ active, searchTerm, setSearchTerm, onMenuClick }) {
  const navItem = FLAT_NAV.find((n) => n.key === active);
  const group = NAV_GROUPS.find((g) => g.items.some((i) => i.key === active));

  return (
    <header className="flex items-center justify-between gap-4 border-b border-slate-200 bg-white px-4 py-3.5 sm:px-6">
      <div className="flex items-center gap-3">
        <button onClick={onMenuClick} className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-50 lg:hidden">
          <Menu size={20} />
        </button>
        <div className="hidden items-center gap-1.5 text-xs text-slate-400 sm:flex">
          <span>{group ? group.group : "Overview"}</span>
          <ChevronRight size={13} />
          <span className="font-medium text-slate-600">{navItem ? navItem.label : "Dashboard"}</span>
        </div>
        <span className="text-sm font-medium text-slate-700 sm:hidden">{navItem ? navItem.label : "Dashboard"}</span>
      </div>

      <div className="flex flex-1 items-center justify-end gap-2 sm:gap-3">
        {active !== "dashboard" && (
          <div className="relative w-full max-w-[160px] sm:max-w-xs">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300" />
            <input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={`Search...`}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2 pl-9 pr-3 text-sm text-slate-700 placeholder:text-slate-400 focus:border-teal-300 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-100"
            />
          </div>
        )}
        <button className="relative rounded-xl p-2 text-slate-400 hover:bg-slate-50 hover:text-slate-600">
          <Bell size={17} />
          <span className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-rose-500" />
        </button>
        <div className="hidden items-center gap-2.5 border-l border-slate-200 pl-3 sm:flex">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-100 font-display text-xs font-semibold text-amber-700">AI</span>
          <div className="hidden sm:block">
            <p className="text-xs font-medium leading-tight text-slate-700">Alifya Ihya Muhammad</p>
            <p className="text-[11px] leading-tight text-slate-400">Super Admin</p>
          </div>
        </div>
      </div>
    </header>
  );
}

/* ---------------------------------------------------------------------- */
/* App                                                                     */
/* ---------------------------------------------------------------------- */

export default function TheAimAdminPanel() {
  const [active, setActive] = useState("dashboard");
  const [searchTerm, setSearchTerm] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const go = (key) => {
    setActive(key);
    setSearchTerm("");
    setSidebarOpen(false);
  };

  return (
    <div className="flex h-screen w-full overflow-hidden bg-slate-50 text-slate-900" style={{ fontFamily: "'Inter', system-ui, sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700&family=Inter:wght@400;500;600&display=swap');
        .font-display { font-family: 'Space Grotesk', system-ui, sans-serif; }
      `}</style>

      <Sidebar active={active} onSelect={go} open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar active={active} searchTerm={searchTerm} setSearchTerm={setSearchTerm} onMenuClick={() => setSidebarOpen(true)} />
        <main className="flex-1 overflow-y-auto px-4 py-5 sm:px-6 sm:py-6">
          {active === "dashboard" ? (
            <Dashboard go={go} />
          ) : (
            <DataTable tableKey={active} searchTerm={searchTerm} />
          )}
        </main>
      </div>
    </div>
  );
}
