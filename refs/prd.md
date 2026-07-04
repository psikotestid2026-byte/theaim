# Product Requirements Document (PRD)
## TheAIM Digital Platform — PT Abadi Insan Manfaat

| | |
|---|---|
| **Product Name** | TheAIM Platform (theaim.id) |
| **Company** | PT Abadi Insan Manfaat ("TheAIM") |
| **Document Version** | 1.0 |
| **Status** | Draft for Engineering Review |
| **Last Updated** | 28 June 2026 |

---

## 1. Background & Context

PT Abadi Insan Manfaat ("**TheAIM**") is an Indonesia-based integrated ecosystem for personal development and organizational effectiveness. It connects individuals (B2C) and companies/institutions (B2B) with licensed psychologists, certified coaches, and therapists across talent assessment, mental health, financial psychology, and corporate HR solutions.

The current asset is a static marketing website (multi-page HTML mockups, "Rooting" prototype set) covering the service catalog, lead-capture forms (registration, corporate inquiry, partnership proposal, proposal download, career application), a rate card, articles, testimonials, and a manual WhatsApp-driven confirmation flow for scheduling and payment. This PRD defines the requirements to turn that prototype into a production web platform with a managed backend (CMS + lead/booking pipeline + payment tracking), while preserving the existing Bahasa Indonesia content, service taxonomy, and pricing structure captured in the mockups.

## 2. Goals & Objectives

1. Digitize and operationalize the full service catalog (Assessment, Coaching, Counseling, Therapy, Financial Consultation, Digital Products, Workshops, and Corporate/B2B solutions) with manageable pricing (rate card) instead of hard-coded HTML.
2. Capture and track every lead/registration generated from the public site (individual service registration, corporate inquiry, partnership proposal, proposal download, job application) in a single backend so no WhatsApp lead is lost.
3. Support a semi-manual payment flow (QRIS & bank transfer) with admin confirmation, while leaving the data model ready for a future payment-gateway integration (Xendit/Midtrans-style).
4. Provide a content management capability for Articles & Activities, Testimonials, Job Postings, and Corporate Partner logos so non-technical staff can update the site.
5. Preserve strict confidentiality of sensitive personal data (psychological test results, financial situation, mental health information) consistent with the "100% Private & Confidential" promise made throughout the service pages.
6. Design the data layer to comfortably handle high read traffic on public marketing pages (services, articles, rate card) while keeping write paths (registrations, payments, applications) fast and auditable.

## 3. Target Users / Personas

| Persona | Description | Primary Goals |
|---|---|---|
| **Individual Visitor (B2C)** | Job seekers, students, employees, couples looking for self-development, mental health, or financial guidance | Discover a service, understand pricing, register, pay, get scheduled |
| **Corporate / Institution Lead (B2B)** | HR, school admin, NGO management | Learn about Hiring & Assessment, EAP, In-House Training, HR Consulting/HRIS; submit an inquiry; download proposal |
| **Partnership Applicant** | Universities, communities, brands, sponsors | Submit a free-form collaboration proposal outside the standard B2B catalog |
| **Job Applicant** | External candidates | Browse open roles, filter by department/type, apply with CV |
| **Internal Admin / CS** | TheAIM operations staff | Manage leads, confirm schedules via WhatsApp, verify payments, publish content |
| **Consultant (Psychologist/Coach/Therapist/Financial Coach)** | Service delivery staff | Be assigned to registrations, viewed on service pages as credibility proof |
| **Content Editor** | Marketing/editorial team | Publish articles, testimonials, manage partner logos and job postings |

## 4. Scope

### 4.1 In Scope
- Public website: homepage, service catalog (per category), rate card / investment summary, articles & activities, careers, "About TheAIM" / "TheAIM Ecosystem", corporate (B2B) landing page.
- Lead/booking forms: service registration (*pendaftaran*), payment selection (*pembayaran*), corporate inquiry (*perusahaan*), partnership submission (*kerjasama*), proposal download lead capture (*unduh proposal*), job application (*apply*).
- **Psychometric test engine (retail core product):** question bank per `test_code`, magic-link token-controlled test sessions (`test_sessions`), individual answer recording (`test_responses`), server-side result computation (`test_results`), and a permanent result page rendered server-side and printable as PDF directly from the browser — no server-side PDF generation required.
- Admin-facing data model for: service catalog & pricing management, registration/booking pipeline, payment confirmation, corporate leads CRM, partnership review, job postings & applicants, articles, testimonials, corporate partner logos, consultant directory, the "Life Reset" 7-day e-course, and test session management.
- File uploads: CV (job application), partnership proposal document.
- Manual payment confirmation workflow (QRIS / bank transfer), admin-verified.

### 4.2 Out of Scope (Phase 1)
- Real-time online scheduling/calendar with consultant availability (currently WhatsApp-confirmed).
- Automated payment gateway webhook integration (data model is forward-compatible, but gateway integration itself is a future phase).
- Full self-service customer account dashboard (the "Masuk" entry point is reserved for Phase 2). **Note:** psychometric tests do NOT require a login — access is controlled entirely by the magic-link `access_token` sent via WhatsApp, and results are permanently accessible via a separate `result_token` URL. No OTP, no password, no session cookie for customers.
- Native mobile app.
- Multi-language (English) front-end — site content remains in Bahasa Indonesia; this document and the data dictionary are in English.

## 5. Product Modules & Features

### 5.1 Public Website & Service Catalog
- Service categories: **Assessment** (Talents Mapping, Tes Psikologi/Psikotes, Mental Health Check Up), **Konsultasi & Coaching** (Konseling dengan Psikolog, Therapy/SEFT, Visual Coaching, Konsultasi Keuangan), **Digital Product** (E-Course "Life Reset: 7 Days Re-Discover Yourself"), **Webinar & Workshop**, and **Untuk Perusahaan** (B2B).
- Each service has a marketing landing page with problem framing, methodology, proof points/stats, and a CTA to view session packages.
- **Rate Card / Service Directory** page lists every package with price type (fixed price, price range, or negotiable/subsidized) and feature bullets, grouped into: (1) Assessment & Testing, (2) Exclusive Coaching, (3) Training & Workshop (Corporate/Group), (4) Add-ons & Digital Products.
- Standalone **Psychometric Tests** (Strength Typology 30, Enneagram, DISC, MBTI, Papikostik, Cognitive/IQ, Management Style, Holland RIASEC, Gaya Belajar) sold individually at a flat rate.
- Homepage shows trust indicators: years of experience, clients served, partner/client logos, and an active corporate partnership badge.
- Testimonials carousel segmented by customer occupation (e.g., Fresh Graduate, Karyawan Swasta, Ibu Rumah Tangga, Wirausaha).
- "5-step process" explainer (Pilih Layanan → Registrasi Awal → Konfirmasi Jadwal via WhatsApp → Asesmen/Pengisian → Review & Konsultasi).

### 5.2 Service Registration Flow (*Pendaftaran*)
- Visitor selects a service and package (price pre-filled, hidden field), then submits full name and WhatsApp number.
- System creates a **Registration** record with status `pending_confirmation` and a human-readable registration code.
- Admin contacts the customer via WhatsApp to confirm schedule; price for negotiable/corporate items is confirmed manually.
- Registration status progresses: `pending_confirmation → schedule_confirmed → payment_pending → paid → completed` (or `cancelled` at any stage).

### 5.3 Payment Flow (*Pembayaran*)
- Customer selects a payment method from a managed catalog: **QRIS**, e-wallets (GoPay, ShopeePay, DANA, LinkAja), **Virtual Account** transfer (BCA, Mandiri, BNI, BRI), or **manual bank transfer**. Each method carries its own display name, logo, fee structure, and active/inactive toggle, so admins can enable or retire a channel without a code change.
- Each payment method has its own step-by-step payment instructions (e.g. "how to pay via m-BCA"), editable by staff and shown contextually on the payment page.
- Total amount may show "Akan Dikonfirmasi" (to be confirmed) until the admin verifies the schedule and finalizes price.
- A **Payment** record is created per registration; admin manually confirms receipt against the uploaded proof or bank statement.
- Every gateway-bound request and webhook callback is logged (request/response payload, HTTP status) against its payment, giving an audit trail that is ready to absorb a real Xendit/Midtrans integration in Phase 2 without a schema change — Phase 1 simply has fewer log rows because confirmation is manual.

### 5.4 Corporate / B2B Inquiry (*Perusahaan*)
- Lead form for: full name, company name, position, WhatsApp number, and area of interest (Hiring & Assessment, EAP, In-House Training & Outbound, HR Consulting & HRIS).
- Creates a **Corporate Inquiry** record tracked through a simple CRM-style pipeline (`new → contacted → in_negotiation → won/lost`).

### 5.5 Partnership Submission (*Kerjasama*)
- Free-form collaboration proposal form for partners not covered by the standard B2B catalog (e.g., universities, communities, sponsorships).
- Captures PIC contact details, organization name, collaboration title/theme, idea description, expected TheAIM role, collaboration goal, estimated timeline, optional proposal file (PDF/DOCX, max 10MB), and prior-relationship flag (Sudah Pernah / Belum Pernah).

### 5.6 Proposal Download Lead Capture (*Unduh Proposal*)
- Gated download: visitor provides full name, WhatsApp number, company, and position before receiving the B2B company profile/proposal document.
- Captured as a marketing lead for B2B follow-up.

### 5.7 Careers (*Karir* & *Apply*)
- Job board filterable by department (Marketing & Partnership, HR & Psikologi, Tech & Creative) and employment type (Full-Time, Part-Time, Internship).
- Application form: full name, email, phone, LinkedIn URL, CV upload, and a short cover message.
- Applications tracked through a recruiting pipeline (`received → screening → interview → offered → rejected/hired`).

### 5.8 Articles & Activities
- Categorized content hub: Psikologi & Mental, Karir & Profesional, Tips Pengembangan Diri, Event & Aktivitas, Partnership, In The News.
- Supports a featured article, author attribution ("Tim TheAIM"), reading-time estimate, and publish scheduling.

### 5.9 Testimonials & Corporate Partners
- Editable testimonials tied to a customer label/occupation and optionally a related service.
- Corporate partner logos shown as either general client logos ("Dipercaya oleh...") or active partnership badges (e.g., Greeneration Indonesia).

### 5.10 E-Course Digital Product
- "Life Reset: 7 Days Re-Discover Yourself" is structured as 7 sequential modules (video + worksheet) granted on purchase, with lifetime access and basic progress tracking.

### 5.11 Consultant Directory
- Internal directory of psychologists, coaches, therapists, and the certified financial coach, used both for service-page credibility and for optionally assigning a consultant to a confirmed registration.

### 5.12 Admin / Internal Operations
- Role-based staff accounts (Super Admin, CS Admin, Content Editor, HR Recruiter, Finance) to manage the catalog, leads, payments, content, and recruitment pipeline.

### 5.13 Notification Templates (WhatsApp-first)
- Status-change messages (registration created, schedule confirmed, payment awaiting/confirmed, session completed/cancelled) are stored as editable templates per channel (WhatsApp today; email/SMS schema-ready), so staff can refine wording without engineering involvement.
- Every message sent is logged with its recipient, channel, and delivery status, giving a record of what was communicated and when — useful both operationally and for the confidentiality/audit posture described in Section 9.
- A dedicated template is provided for the test result notification (event: `test_completed`), which delivers the WA summary text automatically on Upstash Workflow completion.

### 5.14 Psychometric Test Engine (Retail Core Product)

The psychometric tests (MBTI, DISC, Enneagram, Strength Typology 30, Papikostik, IQ, RIASEC, Gaya Belajar, Management Style) are the primary retail revenue product. Their delivery is fully in-platform, token-controlled, and requires no customer account or login.

**Question bank.** Each test is identified by a `test_code` matching `service_packages.test_code`. Questions (`test_items`) store the question text, ordered options (as JSONB), and server-side scoring metadata. All question bank management is done by admin.

**Token-based access — two tokens per purchase.**
- `access_token` — a random UUID generated when the admin confirms payment. Delivered to the customer as a WhatsApp link (`theaim.id/tes/[access_token]`). Single-use: transitions `issued → confirming → in_progress` after identity verification, then `in_progress → completed` on submission. Expires in 30 days if never opened. Cannot be reused once completed.
- `result_token` — a second UUID generated at the same time, stored in `test_sessions`. Never expires. Used permanently at `theaim.id/hasil/[result_token]`. This is the URL the customer bookmarks, shares, or returns to anytime.

**Identity confirmation (before test starts — required).**
After the token is validated as `issued` and not expired, the customer must confirm their identity before the test begins. This step exists because the magic link could theoretically be forwarded to another person (e.g. accidentally shared by a family member or colleague), which would invalidate the result for the purchaser and violate TheAIM's confidentiality promise.

The confirmation uses the last 4 digits of the WhatsApp number registered during checkout (`customers.whatsapp_number`), which the server looks up via `test_sessions.customer_id`. This is NOT an OTP (no API cost, no SMS) — it is a lightweight honesty check that:
- Prevents casual link-forwarding without the purchaser's knowledge
- Confirms the correct person is about to receive a result that is personal and sensitive
- Takes under 5 seconds for a legitimate customer

Confirmation flow:
1. Show masked WA number: e.g. `0812••••7802` (first 4 + last 4 visible, middle masked)
2. Input field: "Masukkan 4 digit terakhir nomor WhatsApp Anda"
3. Server compares input against `customers.whatsapp_number[-4:]`
4. Correct → status `confirming → in_progress`, proceed to test
5. Wrong → increment `test_sessions.confirm_attempts`; show remaining attempts
6. 3 failed attempts → status set to `locked`, `locked_at` timestamp set; customer must contact admin to re-issue
7. Admin can view locked sessions in `admin/test-sessions` and issue a new session if identity can be verified via other means (e.g. calling the customer directly)

**Answer resilience.** Individual answers are written to `test_responses` on each question submission (via API). Upstash Redis also buffers the in-progress answer set keyed to the session, so a browser crash or accidental close does not lose answered questions — the test page reloads from the Redis snapshot on return.

**Result computation.** On final submission, the server computes dimension scores from `test_items.scoring_meta`, resolves the result type (e.g. "INTJ", "High D", "Tipe 4 — Individualis"), and writes the full result to `test_results` including a pre-rendered WhatsApp summary text. The Upstash Workflow then delivers the WA summary and marks the `test_sessions.status` as `completed`.

**Reuse prevention.** Once `test_sessions.status = 'completed'`, any subsequent request with the same `access_token` returns an HTTP 410 and redirects the user to their permanent result page via `result_token`. The token cannot be reset by the customer — only by an admin (status `revoked`, then a new session issued).

### 5.15 Test Result Delivery — "Tidak Gampang Lupa"

Results are delivered through three layers to ensure the customer can always find them, even without an account:

1. **WhatsApp text summary (immediate, stays in WA chat forever)** — sent automatically on test completion via the Upstash Workflow. Includes: result type and label (e.g. "INTJ — The Architect"), a 2–3 line interpretation summary, the permanent result URL, and a "Simpan pesan ini!" reminder. Stored in `notification_logs`. The customer can find this message by scrolling their WA chat with TheAIM at any time.

2. **Permanent result page** (`theaim.id/hasil/[result_token]`) — a server-rendered Next.js page showing the full interpretation, dimension scores, strengths, challenges, and a "Konsultasi lebih lanjut" CTA. The URL never expires. The customer bookmarks it once; it works forever. The page also includes a QR code (generated client-side) encoding the same URL, so if the customer prints the page, the printed QR still links back to the online result.

3. **Browser-print PDF** — the result page has a dedicated `@media print` stylesheet that formats the content into a clean, branded A4 layout (TheAIM logo, result type, full interpretation, QR code). The customer clicks "Simpan sebagai PDF" → browser's native print dialog → saves as PDF locally. No server-side PDF generation, no Vercel Blob storage for test results, no extra cost or infrastructure.

## 6. Public Section vs Admin Panel

TheAIM is one Next.js application split into two route groups: a **Public Section** (unauthenticated, SEO-critical, server-rendered) and an **Admin Panel** (authenticated, data-management interface). This section maps every feature in Section 5 to where it's surfaced and whether its content is dynamic (stored in and editable via the database) or hardcoded (fixed in code, changeable only by a deploy).

### 6.1 Public Section — Pages & Data Source

| Page | Primary Data Source | Dynamic or Hardcoded |
|---|---|---|
| Homepage | `services` (featured), `testimonials`, `corporate_partners` | Mostly dynamic; hero headline/subhead copy is hardcoded |
| Service landing page (per category/service) | `services`, `service_packages`, `consultants` via `service_consultants` | Dynamic |
| Rate Card / Investment Summary | `service_categories`, `services`, `service_packages` | Dynamic |
| Registration form (*Pendaftaran*) | Writes to `customers`, `registrations` | Form fields/structure hardcoded; submitted data dynamic |
| Payment page (*Pembayaran*) | `payment_methods`, `payment_instructions`; writes to `payments` | Method list & instructions dynamic; page layout hardcoded |
| Corporate landing page (*Perusahaan*) | Writes to `corporate_inquiries` | Form hardcoded; submissions dynamic |
| Partnership proposal (*Kerjasama*) | Writes to `partnership_submissions` | Form hardcoded; submissions dynamic |
| Proposal download gate (*Unduh Proposal*) | Writes to `proposal_download_leads` | Form hardcoded; submissions dynamic |
| Careers listing & detail (*Karir*) | `job_postings` | Dynamic |
| Job application (*Apply*) | Writes to `job_applications` | Form hardcoded; submissions dynamic |
| Articles & Activities | `articles` | Dynamic |
| About TheAIM / Ecosystem | Static company narrative | Hardcoded (low change frequency) |
| E-Course access pages | `ecourse_modules`, `ecourse_enrollments` | Dynamic |
| **Test page** (`/tes/[token]`) | `test_sessions` (token validation), `test_items` (question bank); writes to `test_responses` | Questions dynamic; page layout hardcoded |
| **Result page** (`/hasil/[resultToken]`) | `test_sessions`, `test_results` | Fully dynamic; page layout + `@media print` stylesheet hardcoded |
| Global navigation, footer, legal text, SEO defaults | — | Hardcoded (in code/config, not the database) |

### 6.2 Admin Panel — Full Menu Structure

The Admin Panel menu is organized into the same domains as the ERD, so every table in `erd.md` has a corresponding management screen. Menu structure itself (which groups/items exist) is hardcoded navigation; everything *inside* each screen is dynamic, sourced live from PostgreSQL.

| Group | Menu Items |
|---|---|
| Overview | Dashboard (KPI cards, registration funnel, recent activity — aggregated from live data) |
| Catalog & Pricing | Service Categories · Services · Service Packages · Consultants · Service ↔ Consultant Map |
| Customers & Booking | Customers · Registrations · Payments |
| Payment Infrastructure | Payment Methods · Payment Instructions · Payment Logs · Notification Templates · Notification Logs |
| **Test Management** | **Test Sessions · Test Items (Question Bank) · Test Results** |
| Corporate & Partnership | Corporate Inquiries · Partnership Submissions · Proposal Download Leads |
| Recruitment | Job Postings · Job Applications |
| Content & Marketing | Articles · Testimonials · Corporate Partners |
| Digital Product | E-Course Modules · E-Course Enrollments |
| System | Admin Users |

This structure matches the reference admin panel artifact built earlier in this project and is the authoritative menu list for implementation — no table in `erd.md` is left without a corresponding screen, and no screen exists without a backing table.

### 6.3 Dynamic vs Hardcoded — Quick Reference

- **Dynamic (database-backed, editable without a deploy):** every record type listed in `erd.md` — catalog, pricing, bookings, payments, payment methods/instructions, notification templates, corporate/partnership leads, job postings/applications, articles, testimonials, corporate partner logos, e-course content/progress, test items/sessions/results, and admin accounts.
- **Hardcoded (defined in code/config, changeable only via a deploy):** page layout and structure, form field definitions, global navigation and footer, legal/compliance boilerplate text, default SEO metadata, the Admin Panel's menu/group structure, and the result page's `@media print` stylesheet.
- **Hybrid (hardcoded form, dynamic submissions):** every public lead-capture form (registration, corporate inquiry, partnership submission, proposal download, job application) — the form itself is hardcoded UI, but every submission becomes a dynamic row reviewed in the Admin Panel. The test-taking page is also hybrid: questions are dynamic (from `test_items`), but the question renderer/UI is hardcoded.

## 7. Primary User Flows

### Flow 1 — B2C Consulting / Coaching / Assessment (Human-delivered)
1. **Pilih Layanan & Topik** — Visitor browses the service catalog and rate card, selects a service/package.
2. **Registrasi Awal** — Visitor submits the short registration form (name, WhatsApp number).
3. **Konfirmasi Jadwal** — Admin reaches out via WhatsApp to confirm date/time and finalize price if applicable.
4. **Pembayaran** — Customer pays via QRIS or bank transfer; admin confirms the payment.
5. **Asesmen / Pengisian** — Customer completes the relevant online/offline test or pre-session data.
6. **Review & Konsultasi** — Customer meets the assigned psychologist/coach/therapist to review results.

### Flow 2 — Psychometric Test Retail (Token-based, No Login)
1. **Pilih Tes** — Visitor selects a standalone psychometric test (e.g. MBTI, DISC) from the rate card at Rp 75.000.
2. **Registrasi & Pembayaran** — Same registration + payment flow as Flow 1; admin confirms payment.
3. **Token Diterbitkan** — System generates `access_token` and `result_token` for the session; admin triggers (or Upstash Workflow auto-triggers on payment confirmed).
4. **Link WA Terkirim** — Customer receives WhatsApp message: "Klik link ini untuk mulai tes: theaim.id/tes/[access_token] (berlaku 30 hari)".
5. **Verifikasi Identitas** — Customer opens the link; system validates the token (`issued`, not expired). Customer is shown the masked WA number used at checkout and must enter the last 4 digits. Up to 3 attempts; on 3 failures, session is `locked` and customer must contact admin. On success, status transitions `issued → confirming → in_progress`.
6. **Customer Mengerjakan Tes** — Customer answers questions; each answer is saved to `test_responses` and buffered in Redis. Token status: `in_progress`.
7. **Submit & Komputasi Hasil** — On final submit, server computes result, writes to `test_results`, Upstash Workflow sends WA summary. Token status: `in_progress → completed`.
8. **Akses Hasil Selamanya** — Customer receives permanent result URL (`theaim.id/hasil/[result_token]`). Can re-open at any time, print to PDF from browser, or share with others. No account required.

## 8. Non-Functional Requirements

### 8.1 Rendering Strategy: Server-Rendered, Not a Single-Page App
TheAIM will be rebuilt as a **Next.js (App Router) application using Server-Side Rendering and Server Components — not a client-rendered SPA** — specifically to optimize first-load speed and SEO:
- Public pages (homepage, service pages, rate card, articles, careers) are rendered on the server (SSR/ISR) so search engines and link-preview crawlers receive fully formed HTML, not an empty shell waiting on client-side JavaScript.
- Data for public pages is fetched directly inside Server Components (no client-side fetch waterfall), with Incremental Static Regeneration for content that changes infrequently (service catalog, articles, rate card) and on-demand revalidation triggered the moment an admin publishes a change.
- The Admin Panel is authenticated and operationally interactive (tables, drag-and-drop ordering, charts), so it uses Client Components where interactivity is required, but each admin page still loads its first data set server-side to avoid a blank-loading-spinner SPA experience.
- See `trd.md` for the full technical architecture (routing, data layer, caching, and infrastructure) that implements this strategy.

### 8.2 Performance & Scalability
- Public pages (homepage, service pages, rate card, articles) are read-heavy and must remain performant under high concurrent traffic (e.g., campaign spikes); content should be served from indexed, query-efficient tables suitable for caching/CDN in front of the API.
- Write paths (registrations, payments, job applications, partnership submissions) must remain fast and consistent even as historical volume grows into the millions of rows; large append-heavy tables should use time-correlated indexing strategies (see ERD) rather than full-table scans.
- Database design uses `bigserial` primary keys (not UUID) to keep indexes compact and insert-friendly at high volume.

### 8.3 Security & Data Privacy
- Psychological test results, mental health information, and financial details are explicitly promised to be "100% private and confidential" on the service pages; access to this data must be restricted to authorized admin/consultant roles only.
- File uploads (CV, partnership proposals, payment proof) must be stored in access-controlled storage, never publicly listable.
- WhatsApp numbers, emails, and other PII must be protected against bulk export by unauthorized roles.
- Admin actions on sensitive records (viewing/confirming payments, accessing test results) should be auditable (`created_at`/`updated_at`, and confirming-admin reference on payments).

### 8.4 Integrations
- WhatsApp (manual, staff-operated) is the primary scheduling/confirmation channel in Phase 1; the schema should allow a future WhatsApp Business API integration without redesign.
- Payment methods: QRIS (all e-wallets) and bank transfer, manually reconciled in Phase 1; schema is gateway-ready for Phase 2.
- File storage for CV, proposal documents, and payment proof (object storage with signed URLs recommended).

### 8.5 Availability
- The public marketing site and lead forms are business-critical and should target high availability, since every form is a monetizable lead (individual booking, corporate deal, or job applicant).

## 9. Success Metrics (KPIs)

- Number of registrations created per service category per month.
- Lead-to-paid conversion rate (registrations reaching `paid`/`completed` status).
- Corporate inquiry pipeline conversion rate (`new` → `won`).
- Time-to-confirmation (registration created → `schedule_confirmed`) as an operational efficiency metric.
- Article and rate-card page engagement (supports future analytics integration).
- Job application volume per posting and recruiting funnel conversion.

## 10. Assumptions & Constraints

- Scheduling and price confirmation for non-fixed-price items (corporate training, group activities, community sessions) remain manually negotiated by admin staff in Phase 1.
- All customer-facing content remains in Bahasa Indonesia; only internal documentation (this PRD, the ERD, and code/schema identifiers) is in English.
- Corporate/group training pricing is intentionally modeled as a range (e.g., Rp 5 Jt–Rp 15 Jt per day) or as negotiable/subsidized ("Subsidi Silang") rather than a single fixed price.

## 11. Future Considerations (Phase 2+)

- Self-service customer login/dashboard (the existing "Masuk" entry point) with registration history and e-course progress.
- Online consultant scheduling/calendar with real-time slot availability.
- **Live** payment gateway integration (Xendit/Midtrans-style) wired to the already-modeled `payment_methods`/`payment_logs` tables — Phase 1 ships the catalog and audit trail; Phase 2 connects it to a real API and automates confirmation via webhook instead of manual review.
- **Live** WhatsApp Business API delivery wired to the already-modeled `notification_templates`/`notification_logs` tables — Phase 1 ships the editable templates; Phase 2 sends them automatically instead of staff copy-pasting.
- Search and filtering enhancements across articles and the service catalog.
