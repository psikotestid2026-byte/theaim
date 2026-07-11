# ADMIN_PANEL.md
## TheAIM Admin Panel — Complete Menu, Page & Feature Specification

| | |
|---|---|
| **Base route** | `/admin` |
| **Auth guard** | `middleware.ts` — redirects unauthenticated requests to `/admin/login` |
| **Layout** | Persistent sidebar (collapsible on mobile, see `theaim-admin-panel.jsx` for visual reference) + topbar with breadcrumb, search, notification bell, user avatar |
| **Companion docs** | `prd.md` §6.2 (menu structure), `erd.md` (all table schemas), `trd.md` §5 (route files), `TEST_SCORING.md` (test engine pages) |

---

## 1. Navigation Map

```
/admin
├── Dashboard
│
├── Catalog & Pricing
│   ├── Service Categories        /admin/service-categories
│   ├── Services                  /admin/services
│   ├── Service Packages          /admin/service-packages
│   ├── Consultants               /admin/consultants
│   └── Service ↔ Consultant Map  /admin/service-consultants
│
├── Customers & Booking
│   ├── Customers                 /admin/customers
│   ├── Registrations             /admin/registrations
│   └── Payments                  /admin/payments
│
├── Payment Infrastructure
│   ├── Payment Methods           /admin/payment-methods
│   ├── Payment Instructions      /admin/payment-instructions
│   ├── Payment Logs              /admin/payment-logs
│   ├── Notification Templates    /admin/notification-templates
│   └── Notification Logs         /admin/notification-logs
│
├── Test Management
│   ├── Test Sessions             /admin/test-sessions
│   ├── Test Items (Question Bank)/admin/test-items
│   ├── Test Results              /admin/test-results
│   └── Scoring Rubrics           /admin/scoring-rubrics
│
├── Corporate & Partnership
│   ├── Corporate Inquiries       /admin/corporate-inquiries
│   ├── Partnership Submissions   /admin/partnership-submissions
│   └── Proposal Download Leads   /admin/proposal-leads
│
├── Recruitment
│   ├── Job Postings              /admin/job-postings
│   └── Job Applications          /admin/job-applications
│
├── Content & Marketing
│   ├── Articles                  /admin/articles
│   ├── Testimonials              /admin/testimonials
│   └── Corporate Partners        /admin/corporate-partners
│
├── Digital Product
│   ├── E-Course Modules          /admin/ecourse-modules
│   └── E-Course Enrollments      /admin/ecourse-enrollments
│
└── System
    └── Admin Users               /admin/admin-users
```

---

## 2. Role-Based Access Control (RBAC)

Roles are stored in `admin_users.role` (varchar + CHECK). Access legend: **✓** full access (read + write) · **R** read-only · **–** no access.

| Menu / Page | super_admin | cs_admin | content_editor | hr_recruiter | finance |
|---|:---:|:---:|:---:|:---:|:---:|
| **Dashboard** | ✓ | ✓ | ✓ | ✓ | ✓ |
| Service Categories | ✓ | – | ✓ | – | – |
| Services | ✓ | – | ✓ | – | – |
| Service Packages | ✓ | – | ✓ | – | – |
| Consultants | ✓ | – | ✓ | – | – |
| Service ↔ Consultant Map | ✓ | – | ✓ | – | – |
| Customers | ✓ | ✓ | – | – | R |
| Registrations | ✓ | ✓ | – | – | R |
| Payments | ✓ | ✓ | – | – | ✓ |
| Payment Methods | ✓ | – | – | – | ✓ |
| Payment Instructions | ✓ | – | ✓ | – | – |
| Payment Logs | ✓ | – | – | – | R |
| Notification Templates | ✓ | ✓ | – | – | – |
| Notification Logs | ✓ | ✓ | – | – | – |
| Test Sessions | ✓ | ✓ | – | – | – |
| Test Items (Question Bank) | ✓ | – | – | – | – |
| Test Results | ✓ | ✓ | – | – | – |
| Scoring Rubrics | ✓ | – | – | – | – |
| Corporate Inquiries | ✓ | ✓ | – | – | – |
| Partnership Submissions | ✓ | ✓ | – | – | – |
| Proposal Download Leads | ✓ | ✓ | – | – | R |
| Job Postings | ✓ | – | R | ✓ | – |
| Job Applications | ✓ | – | – | ✓ | – |
| Articles | ✓ | – | ✓ | – | – |
| Testimonials | ✓ | – | ✓ | – | – |
| Corporate Partners | ✓ | – | ✓ | – | – |
| E-Course Modules | ✓ | – | ✓ | – | – |
| E-Course Enrollments | ✓ | ✓ | – | – | – |
| Admin Users | ✓ | – | – | – | – |

> Server enforces RBAC per route handler and page component. Client sidebar hides inaccessible items but server is the authority.

---

## 3. Global UI Conventions (All Pages)

- **List page layout:** topbar breadcrumb → page title + description → filter/search bar → data table → pagination footer.
- **Pagination:** server-side, 20 rows per page default. Footer shows "Showing N–M of Total" + Previous / page numbers / Next.
- **Empty state:** illustrated empty state with a clear action button (e.g. "Add first service").
- **Loading state:** skeleton rows during server render for initial data; spinner overlay for subsequent client mutations.
- **Search:** client-side debounce (300ms) calls `GET /api/{model}?q=...`. Searches relevant text fields per page.
- **Filters:** dropdowns rendered above the table. Active filters shown as removable chips. URL state preserved on browser back.
- **Sorting:** click column header to toggle asc/desc. URL state preserved.
- **Row actions:** `⋯` menu at end of each row with contextual actions. Destructive actions (delete, revoke) show a confirmation modal.
- **Status badges:** consistent color system matching ERD CHECK values — amber=pending, blue=confirming, emerald=active/confirmed/completed, rose=cancelled/revoked/rejected, slate=inactive/draft.
- **Drag-and-drop reorder:** pages with `display_order` or `item_order` support dnd-kit drag handles on rows. Reorder persists via `PATCH /api/{model}/{id}/reorder`.
- **Export:** pages marked with export capability provide a "Download XLSX" button via SheetJS on filtered current view.
- **Timestamps:** all `created_at` / `updated_at` shown as Indonesian locale date + time. Hover shows full ISO timestamp.
- **Responsive:** sidebar collapses to hamburger drawer on mobile (< 1024px). Tables become horizontally scrollable. All action buttons remain accessible.

---

## 4. Dashboard

**Route:** `/admin` (or `/admin/dashboard`)
**ERD:** Aggregate queries across `registrations`, `payments`, `test_sessions`, `corporate_inquiries`, `job_applications`, `notification_logs`
**Access:** all roles

### KPI Cards (top row, 4 cards)
| Card | Value | Sub-label |
|---|---|---|
| Total Registrations | COUNT(*) | N completed · N pending |
| Payments Awaiting | COUNT(*) WHERE `status='awaiting_confirmation'` | Total Rp value pending |
| Open Corporate Pipeline | COUNT(*) WHERE status NOT IN (won, lost) | of N total inquiries |
| Open Job Postings | COUNT(*) WHERE `status='open'` | N applications received |

### Registration Funnel Chart
- Horizontal stacked bar — one segment per `status` value
- Segments: `pending_confirmation` (amber) · `schedule_confirmed` (sky) · `payment_pending` (orange) · `paid` (emerald) · `completed` (teal) · `cancelled` (rose)
- Below bar: count + percentage per status as a legend grid
- Component: custom div-based, no recharts needed

### Test Session Summary (if any sessions exist)
- Small stat row: Issued · In Progress · Completed · Locked · Expired
- Quick link → Test Sessions page filtered by each status

### Revenue Chart
- `recharts` BarChart — daily or weekly registration revenue (sum of `payments.amount` WHERE `status='confirmed'`)
- Toggle: last 7 days / last 30 days / this month
- X-axis: date labels · Y-axis: Rp formatted

### Recent Activity Feed
- Last 10 events across: new registration, payment confirmed, corporate inquiry, test session completed, job application received
- Each row: event icon + description + time-ago label + link to relevant record

### Quick Action Shortcuts
- "Konfirmasi Pembayaran Tertunda" → deep link to Payments filtered by `awaiting_confirmation`
- "Sesi Terkunci" → deep link to Test Sessions filtered by `locked`
- "Lamaran Baru" → deep link to Job Applications filtered by `received`

---

## 5. Catalog & Pricing

### 5.1 Service Categories
**Route:** `/admin/service-categories`
**ERD:** `service_categories`
**Access:** super_admin, content_editor

**Table columns:** ID · Name · Slug · Display Order · Services Count · Actions

**Actions per row:** Edit · Delete (only if `services_count = 0`)

**Page actions:** Add Category (modal form: Name, Slug auto-generated from name, Display Order)

**Features:**
- Drag-and-drop reorder rows (dnd-kit) → updates `display_order` in batch via `PATCH /api/service-categories/reorder`
- Slug is editable but warns "Changing slug breaks existing URLs" if services exist under this category

---

### 5.2 Services
**Route:** `/admin/services` · `/admin/services/new` · `/admin/services/[id]`
**ERD:** `services`, `service_categories`
**Access:** super_admin, content_editor

**Table columns:** ID · Category · Name · Slug · Delivery Mode · Audience Type · Featured · Status · Actions

**Actions per row:** Edit · View on Site · Archive · Toggle Featured

**Filters:** Category (dropdown) · Status (published / draft / archived) · Audience Type · Delivery Mode

**Search:** by name, slug

**Add / Edit form (full page, not modal):**
- Category (select from `service_categories`)
- Name, Slug (auto-generated, editable)
- Short Description (255 chars, single line)
- Description (Tiptap rich text)
- Delivery Mode (online / offline / hybrid)
- Audience Type (individual / corporate / both)
- Status (draft → published → archived)
- Is Featured (toggle)

**Notes:**
- Archiving a service does not delete packages; packages become inaccessible from the public rate card
- Publishing triggers `revalidateTag('services')` to update ISR pages

---

### 5.3 Service Packages
**Route:** `/admin/service-packages` · `/admin/service-packages/new` · `/admin/service-packages/[id]`
**ERD:** `service_packages`, `services`
**Access:** super_admin, content_editor

**Table columns:** ID · Service · Test Code · Package Name · Price Type · Price · Unit · Popular · Status · Actions

**Actions per row:** Edit · Toggle Active · Toggle Popular · Delete

**Filters:** Service (dropdown) · Price Type (fixed / range / negotiable) · Status

**Search:** by package name, test code

**Add / Edit form:**
- Service (select)
- Test Code (varchar, optional — only for psychometric tests, must match a `test_code` in `test_items`)
- Package Name
- Price Type (radio: Fixed / Range / Negotiable)
  - If Fixed: Price Amount + Unit
  - If Range: Price Min + Price Max + Unit
  - If Negotiable: Unit only
- Features (tag-style multi-input → stored as JSONB array of strings)
- Is Popular (toggle)
- Status (active / inactive)

**Notes:**
- `test_code` field shows autocomplete populated from distinct `test_code` values in `test_items`
- Changing price of an active package does not retroactively change confirmed registrations

---

### 5.4 Consultants
**Route:** `/admin/consultants` · `/admin/consultants/new` · `/admin/consultants/[id]`
**ERD:** `consultants`
**Access:** super_admin, content_editor

**Table columns:** Photo · Full Name · Role Title · Specialization · Certification · Status · Actions

**Actions per row:** Edit · Toggle Active/Inactive

**Filters:** Status

**Search:** by name, role title

**Add / Edit form:**
- Full Name
- Role Title (e.g. "Psikolog Klinis", "Certified Financial Planner")
- Specialization
- Certification
- Bio (Tiptap rich text, rendered on service landing pages)
- Photo (upload → Vercel Blob via `lib/blob.ts`)
- Status (active / inactive)

---

### 5.5 Service ↔ Consultant Map
**Route:** `/admin/service-consultants`
**ERD:** `service_consultants`, `services`, `consultants`
**Access:** super_admin, content_editor

**Table columns:** ID · Service · Consultant · Linked Since · Actions

**Actions per row:** Remove mapping

**Page actions:** Add Mapping (form: select Service + select Consultant)

**Features:**
- Groupable view: group by Service (shows all consultants for each service) or by Consultant (shows all their services)
- Duplicate mapping prevented by `UNIQUE(service_id, consultant_id)` constraint; UI pre-validates before POST

---

## 6. Customers & Booking

### 6.1 Customers
**Route:** `/admin/customers` · `/admin/customers/[id]`
**ERD:** `customers`
**Access:** super_admin, cs_admin (R: finance)

**Table columns:** ID · Full Name · WhatsApp · Email · City · Status · Registered · Actions

**Actions per row:** View Detail · Block / Unblock

**Filters:** Status (active / blocked) · City

**Search:** by name, WhatsApp number, email

**Detail page `/admin/customers/[id]`:**
- Customer profile card (name, WA, email, city, status, joined date)
- Tab: Registrations — list of all their registrations with status badges + links
- Tab: Test Sessions — list of all their sessions with status + results link
- Tab: E-Course Enrollments — progress per course
- No direct edit of customer data by admin (customer data is captured at registration)

**Notes:**
- `Block` sets `status = 'blocked'`; blocked customers cannot submit new registrations (enforced server-side)
- WA number and email are PII — finance role sees only hashed last 4 digits

---

### 6.2 Registrations
**Route:** `/admin/registrations` · `/admin/registrations/[id]`
**ERD:** `registrations`, `customers`, `services`, `service_packages`, `consultants`
**Access:** super_admin, cs_admin (R: finance)

**Table columns:** Registration Code · Customer · Service · Package · Price Quoted · Status · Scheduled At · Consultant · Created · Actions

**Actions per row:** View Detail · Confirm Schedule · Cancel · Update Price · Assign Consultant

**Filters:** Status (all 6 states) · Service · Date Range (created_at) · Has Consultant (yes/no)

**Search:** by registration code, customer name, WA number

**Status pipeline (visual stepper on detail page):**
```
pending_confirmation → schedule_confirmed → payment_pending → paid → completed
                                                                  ↘ cancelled (any stage)
```

**Detail page `/admin/registrations/[id]`:**
- Registration info card (code, service, package, price, source channel)
- Customer info with click-through to customer detail
- Status stepper — admin can advance status with confirmation modal
- "Konfirmasi Jadwal" action: sets `scheduled_at` (date-time picker) + assign `consultant_id` + set `price_quoted` if negotiable + advances status to `schedule_confirmed`
- "Buat Sesi Tes" button (appears when service has a `test_code`): generates a `test_sessions` row via `POST /api/test-sessions` and shows the access_token link to copy to WA
- Timeline: audit log of status transitions with timestamp and admin name
- Related payment(s) section with quick confirm shortcut

**Export:** XLSX of filtered registrations (for monthly reports)

---

### 6.3 Payments
**Route:** `/admin/payments` · `/admin/payments/[id]`
**ERD:** `payments`, `payment_methods`, `registrations`, `admin_users`
**Access:** super_admin, cs_admin, finance

**Table columns:** Payment Code · Registration Code · Method · Amount · Status · Confirmed By · Created · Actions

**Actions per row:** Confirm · Reject · View Proof

**Filters:** Status (awaiting_confirmation / confirmed / rejected / refunded) · Method · Date Range
- Default filter on page load: `status = 'awaiting_confirmation'` (the operational queue)

**Search:** by payment code, registration code

**Confirm action:**
- Modal: shows amount, method, registration summary
- "Bukti Pembayaran" — display uploaded proof image/PDF in modal (from `proof_file_url`)
- Button: "Konfirmasi Pembayaran" → PATCH `/api/payments/[id]/confirm` → sets `status='confirmed'`, `confirmed_by=current_admin_id`, `confirmed_at=now()`
- On confirm: triggers Upstash Workflow → notification sent → registration status advanced to `paid`

**Reject action:**
- Requires reason (free text)
- Sets `status = 'rejected'`
- Sends WA notification to customer

**Notes:**
- `confirmed_by` is always set to the `admin_users.id` making the action (never editable)
- Payment proof is stored on Vercel Blob; URL displayed inline in admin, not publicly accessible
- Finance role can confirm/reject; cs_admin can view and confirm but not reject (super_admin only for reject)

---

## 7. Payment Infrastructure

### 7.1 Payment Methods
**Route:** `/admin/payment-methods`
**ERD:** `payment_methods`
**Access:** super_admin, finance

**Table columns:** Sort · Logo · Code · Name · Channel Type · Provider · Admin Fee · Active · Actions

**Actions per row:** Edit · Toggle Active · Drag to Reorder

**Page actions:** Add Payment Method

**Add / Edit form:**
- Code (unique, e.g. `BCA_VA`) · Name · Channel Type (dropdown) · Provider (xendit / midtrans / manual)
- Admin Fee Flat (Rp) · Admin Fee Percent (%)
- Logo URL (upload to Vercel Blob)
- Is Active · Is Redirect (for e-wallets that use redirect flow)
- Sort Order (also controllable via drag)

**Notes:**
- Deactivating a method hides it from the public payment page immediately (ISR revalidation triggered)
- `provider = 'manual'` methods bypass all Xendit API calls; `proof_file_url` is required for these

---

### 7.2 Payment Instructions
**Route:** `/admin/payment-instructions`
**ERD:** `payment_instructions`, `payment_methods`
**Access:** super_admin, content_editor

**Table columns:** Payment Method · Title · Steps (count) · Sort Order · Actions

**Actions per row:** Edit · Delete · Reorder within method

**Page actions:** Add Instructions (select method first)

**Add / Edit form:**
- Payment Method (select) · Title (e.g. "Pembayaran via m-BCA")
- Content (Tiptap rich text — renders ordered list `<ol><li>...</li></ol>` steps)
- Sort Order

**Features:**
- Grouped view by Payment Method (accordion)
- Reorder within a method group via drag

---

### 7.3 Payment Logs
**Route:** `/admin/payment-logs`
**ERD:** `payment_logs`
**Access:** super_admin (R: finance)

**Table columns:** ID · Payment Code · Provider Reference · Log Type · Endpoint · HTTP Status · Created

**Actions per row:** View Payload (expandable drawer showing `request_payload` and `response_payload` as formatted JSON)

**Filters:** Log Type (payment_request / callback / webhook) · HTTP Status (200 / 4xx / 5xx) · Date Range

**Search:** by payment code, provider reference

**Notes:**
- Read-only — no add, edit, or delete
- HTTP 4xx/5xx rows highlighted in amber/rose for quick error identification
- Large payload JSON collapsed by default; expand button shows full content in monospace

---

### 7.4 Notification Templates
**Route:** `/admin/notification-templates`
**ERD:** `notification_templates`
**Access:** super_admin, cs_admin

**Table columns:** Event Trigger · Channel · Message Preview · Active · Actions

**Actions per row:** Edit · Toggle Active

**No add/delete:** The set of event triggers is fixed (`registration_created`, `schedule_confirmed`, `payment_awaiting_confirmation`, `payment_confirmed`, `registration_completed`, `registration_cancelled`, `test_completed`). Admin can only edit the message and toggle active status.

**Edit form:**
- Channel (read-only — set at creation)
- Event Trigger (read-only)
- Message Content (Tiptap rich text — renders with available placeholder variables)
- Available variables shown as chips: `{nama}`, `{layanan}`, `{tanggal}`, `{nominal}`, `{konsultan}`, `{result_type}`, `{result_token}`
- Live preview panel: renders a sample message with dummy values
- Is Active toggle

---

### 7.5 Notification Logs
**Route:** `/admin/notification-logs`
**ERD:** `notification_logs`, `notification_templates`
**Access:** super_admin, cs_admin

**Table columns:** ID · Event · Registration Code · Recipient · Channel · Status · Created

**Actions per row:** View Payload · Retry (only if `status = 'failed'`)

**Filters:** Status (sent / failed / pending) · Channel · Date Range
- Default: last 7 days

**Search:** by registration code, recipient number

**Retry action:** POSTs to the delivery provider again with the same rendered message; creates a new `notification_logs` row (does not overwrite the failed one)

---

## 8. Test Management

### 8.1 Test Sessions
**Route:** `/admin/test-sessions` · `/admin/test-sessions/[id]`
**ERD:** `test_sessions`, `customers`, `service_packages`, `registrations`
**Access:** super_admin, cs_admin

**Table columns:** Registration Code · Customer Name · WA · Test Code · Status · Confirm Attempts · Issued At · Expires At · Started At · Completed At · Actions

**Actions per row:**
- **Issue** (only when no active session exists for this registration) → modal with registration selector → generates `access_token` + `result_token` → triggers WA notification
- **Revoke** (status: issued / confirming / in_progress) → confirmation modal with reason → sets `status = 'revoked'` + deletes Redis key
- **Re-issue** (status: locked / expired / revoked) → creates a NEW `test_sessions` row (old row preserved as audit) → triggers WA with new link
- **Copy Access Link** — copies `theaim.id/tes/[access_token]` to clipboard (issued / confirming only)
- **View Result** (status: completed) → opens `/hasil/[result_token]` in new tab

**Filters:** Status (all 7 states, default: issued+confirming+in_progress) · Test Code · Date Range

**Search:** by customer name, WA number, registration code

**Detail page `/admin/test-sessions/[id]`:**
- Session info: both tokens shown (access masked after completion), status timeline
- Customer info with WA click-to-message link
- Confirm attempts counter with visual indicator (0/3, 1/3, 2/3, 3/3 locked)
- If `status = 'completed'`: link to test result + result type badge
- Audit trail: issued_at, started_at, completed_at, locked_at if applicable

**Locked sessions alert:**
- Locked sessions appear prominently at top of list (or as a separate alert card on Dashboard)
- Admin must contact customer externally, verify identity, then use "Re-issue" to unblock

---

### 8.2 Test Items (Question Bank)
**Route:** `/admin/test-items`
**ERD:** `test_items`
**Access:** super_admin only

**Table columns:** Test Code · Section · Order · Question Preview (truncated) · Options Count · Tiebreaker · Actions

**Actions per row:** Edit · Delete (with warning if sessions exist for this test_code)

**Filters:** Test Code (MBTI / DISC / etc.) · Section

**Page actions:** Add Question (select test_code first)

**Grouped view:** grouped by Test Code → then by Section; rows reorderable within section via dnd-kit → updates `item_order` in batch

**Add / Edit form:**
- Test Code (select)
- Section (text, e.g. 'EI', 'SN', 'G01')
- Item Order (auto-set to next available, editable)
- Question Text (Tiptap rich text)
- Options editor (dynamic list):
  - Each option: Value (A/B/C/D) · Label (text) · Score Key (letter) · Score Val (number)
  - For DISC: 4 options always; for MBTI: exactly 2 options (A and B)
  - Format (scoring_meta): `most_least` for DISC, blank for MBTI
- Tiebreaker toggle (MBTI only — exactly 1 per dimension section)
- Scoring Meta (raw JSON preview, auto-generated from fields above)

**Critical warning banner:**
> Editing or deleting questions after sessions exist for this test_code will make historical `raw_scores` inconsistent with the question bank. Only super_admin can proceed after acknowledging this.

---

### 8.3 Test Results
**Route:** `/admin/test-results` · `/admin/test-results/[id]`
**ERD:** `test_results`, `test_sessions`, `customers`, `test_scoring_rubrics`
**Access:** super_admin, cs_admin

**Table columns:** ID · Customer · WA · Test Code · Result Type · Validity Flag · Completed At · Actions

**Actions per row:** View Full Result · Copy Result Link

**Filters:** Test Code · Validity Flag (valid / suspect_speed / suspect_response_set) · Date Range

**Search:** by customer WA number, customer name

**Detail page `/admin/test-results/[id]`:**
- Customer header (name, WA, registration code)
- Result type badge (e.g. INTJ in teal, with label and tagline)
- Dimension chart (MBTI: 4 `DimensionBar` components; DISC: `DISCChart` with M/L/C graphs from `disc_graphs`)
- PCI table (MBTI): per-dimension pole, raw score, percentage, category
- Interpretation snapshot: description, strengths, challenges, careers (read from `test_results.interpretation` — the snapshotted rubric, not the live rubric)
- WA Summary preview (collapsible bubble showing `wa_summary_text`)
- Validity flag indicator: if `suspect_speed` or `suspect_response_set`, show warning card with detected issue
- Per-question response table (from `test_responses`): question → answer → score_key → time_spent_ms — useful for auditing suspect results
- Permanent result URL with copy button

**Export:** XLSX of all results for a selected date range + test_code filter

**Notes:** No add/delete of test_responses through the admin panel — responses are immutable once written. The per-question response table shown in this detail page is read-only and used purely for auditing suspect results (speed flags, response-set flags per `TEST_SCORING.md` §1.2–§1.3).

---

### 8.4 Scoring Rubrics
**Route:** `/admin/scoring-rubrics` · `/admin/scoring-rubrics/[id]`
**ERD:** `test_scoring_rubrics`
**Access:** super_admin only

**Purpose:** Admin-editable interpretation text for every test result type. Editing a rubric updates all *future* result page renders without a code deploy. Historical `test_results.interpretation` (a snapshot taken at compute time) is not retroactively changed.

**Table columns:** Test Code · Result Type · Label (EN) · Label (ID) · Primary Dimension · Secondary Dimension · Active Color · Updated At · Actions

**Actions per row:** Edit · Preview Result Page

**Filters:** Test Code (MBTI / DISC)

**Search:** by result_type, label

**Grouped view:** by Test Code (MBTI group: 16 types · DISC group: 8+ patterns)

**Add form (super_admin only — use sparingly, for new test_code roll-outs):**
- Test Code · Result Type (unique per test_code) · Result Label EN · Result Label ID
- Tagline (single line, Indonesian) · Color Hex (color picker)
- Primary Dimension (optional, DISC only) · Secondary Dimension (optional, DISC only)

**Edit form:**
- Tagline (single line textarea)
- Description (Tiptap rich text — 3–5 sentences, Indonesian)
- Strengths (dynamic tag list → stored as JSONB array)
- Challenges (dynamic tag list → stored as JSONB array)
- Careers (dynamic tag list → stored as JSONB array)
- Color Hex (color picker — used for result type badge on the public result page)

**Preview action:**
- Opens a modal showing a simulated result page using the current (unsaved) rubric content
- Simulated scores auto-populated from a default profile for that result_type
- Lets admin review wording and formatting before saving

**Validation rules:**
- `strengths`, `challenges`, `careers` must each have at least 3 items
- Description must be ≥ 100 and ≤ 800 characters
- Tagline must be ≤ 255 characters
- `result_type` must match an existing value in `test_scoring_rubrics` — no new types can be added for existing `test_code` (would break the scoring function dispatch)

---

## 9. Corporate & Partnership

### 9.1 Corporate Inquiries
**Route:** `/admin/corporate-inquiries` · `/admin/corporate-inquiries/[id]`
**ERD:** `corporate_inquiries`
**Access:** super_admin, cs_admin

**Table columns:** ID · Contact Name · Company · Position · Interested Service · Status · Created · Actions

**Actions per row:** View Detail · Advance Status · Open WA Chat

**Filters:** Status (new / contacted / in_negotiation / won / lost) · Date Range
- Default: new + contacted

**Search:** by company name, contact name, WA

**Status pipeline (Kanban or list with stepper):**
```
new → contacted → in_negotiation → won
                                 ↘ lost
```

**Detail page:**
- Contact card (name, company, position, WA — click-to-open WA)
- Interested service label
- Internal notes editor (free text, admin-only, saved to a `notes` column — add via ALTER if not already present)
- Status change with confirmation
- Timeline of status transitions

---

### 9.2 Partnership Submissions
**Route:** `/admin/partnership-submissions` · `/admin/partnership-submissions/[id]`
**ERD:** `partnership_submissions`
**Access:** super_admin, cs_admin

**Table columns:** ID · PIC Name · Organization · Collaboration Title · Prior Relation · Status · Created · Actions

**Actions per row:** View Detail · Update Status · Download Proposal

**Filters:** Status (submitted / reviewing / approved / rejected) · Prior Relation (yes / no) · Date Range

**Search:** by organization name, PIC name

**Detail page:**
- Full submission details (idea description, expected role, collaboration goal, timeline)
- Prior relation badge
- Proposal file download button (from `proposal_file_url` on Vercel Blob — signed URL)
- Status update with confirmation modal
- Internal admin notes

---

### 9.3 Proposal Download Leads
**Route:** `/admin/proposal-leads`
**ERD:** `proposal_download_leads`
**Access:** super_admin, cs_admin (R: finance)

**Table columns:** ID · Full Name · Company · Position · WA · Date

**Actions per row:** Open WA Chat (click-to-WA link)

**Filters:** Date Range (created_at)

**Search:** by company, name, WA

**Page actions:** Export XLSX (all filtered rows) — used for B2B follow-up campaigns

**Notes:** No status to manage — these are raw marketing leads. Follow-up is handled via WA outside the system.

---

## 10. Recruitment

### 10.1 Job Postings
**Route:** `/admin/job-postings` · `/admin/job-postings/new` · `/admin/job-postings/[id]`
**ERD:** `job_postings`
**Access:** super_admin, hr_recruiter (R: content_editor)

**Table columns:** ID · Title · Department · Type · Location · Status · Posted At · Applications · Actions

**Actions per row:** Edit · Open/Close · View Applications (deep link to Job Applications filtered by this posting)

**Filters:** Department · Employment Type · Status

**Search:** by title

**Add / Edit form (full page):**
- Title · Slug (auto-generated) · Department (marketing_partnership / hr_psikologi / tech_creative)
- Employment Type (full_time / part_time / internship) · Location
- Description (Tiptap rich text — job description, responsibilities)
- Requirements (Tiptap rich text)
- Status (draft → open → closed)
- Posted At (defaults to now() when status first set to open)
- Closed At (set when status changed to closed)

**Notes:**
- Publishing a job posting triggers `revalidateTag('job-postings')` for the careers page ISR

---

### 10.2 Job Applications
**Route:** `/admin/job-applications`
**ERD:** `job_applications`, `job_postings`
**Access:** super_admin, hr_recruiter

**Table columns:** ID · Applicant Name · Role Applied · Email · WA · Status · Applied · Actions

**Actions per row:** View Detail · Update Status · Download CV · Open WA Chat

**Filters:** Job Posting (dropdown of open + recently closed postings) · Status · Date Range
- Default: `received` + `screening`

**Search:** by applicant name, email

**Status pipeline:**
```
received → screening → interview → offered → hired
                                           ↘ rejected (any stage after received)
```

**Detail page `/admin/job-applications/[id]`:**
- Applicant info (name, email, WA, LinkedIn URL)
- Job applied for (with link to posting)
- Cover message (displayed)
- CV download button (Vercel Blob signed URL)
- Status stepper + history
- Internal HR notes

**Kanban view (optional):**
- Columns: Received · Screening · Interview · Offered · Hired / Rejected
- Cards: applicant name + role applied
- Drag card between columns via dnd-kit → PATCH status

---

## 11. Content & Marketing

### 11.1 Articles
**Route:** `/admin/articles` · `/admin/articles/new` · `/admin/articles/[slug]`
**ERD:** `articles`
**Access:** super_admin, content_editor

**Table columns:** ID · Title · Category · Author · Read Time · Status · Published At · Featured · Actions

**Actions per row:** Edit · Publish / Unpublish / Archive · Toggle Featured · Preview

**Filters:** Category (6 values) · Status (draft / published / archived)

**Search:** by title, slug

**Add / Edit form (full page with split preview):**
- Title · Slug (auto-generated, editable) · Category (dropdown)
- Cover Image (upload → Vercel Blob)
- Author Name (default "Tim TheAIM", editable)
- Reading Time (minutes, auto-estimated from word count or manual override)
- Excerpt (255 chars — used for OG description and article card)
- Content (Tiptap rich text — full article body with heading, bold, italic, image embed, link)
- Status toggle + Published At (schedule: can set future date-time)
- Is Featured (only 2 articles can be featured at once — enforced by UI warning)

**Publish action:** sets `status = 'published'`, `published_at = now()` → triggers `revalidateTag('articles')` + `revalidatePath('/artikel')`

---

### 11.2 Testimonials
**Route:** `/admin/testimonials`
**ERD:** `testimonials`, `services`
**Access:** super_admin, content_editor

**Table columns:** Order · Customer Name · Role Label · Related Service · Rating (stars) · Published · Actions

**Actions per row:** Edit · Toggle Published · Drag to Reorder

**Page actions:** Add Testimonial

**Add / Edit form:**
- Customer Name · Role Label (e.g. "Fresh Graduate", "Karyawan Swasta")
- Related Service (optional dropdown from `services`)
- Content (textarea, shown as testimonial quote)
- Rating (1–5 star selector)
- Photo URL (upload to Vercel Blob, optional)
- Is Published toggle

**Features:**
- Drag-and-drop reorder (dnd-kit) → `display_order` batch update
- Published vs unpublished rows visually distinct

---

### 11.3 Corporate Partners
**Route:** `/admin/corporate-partners`
**ERD:** `corporate_partners`
**Access:** super_admin, content_editor

**Table columns:** Order · Logo · Name · Partnership Type · Status · Actions

**Actions per row:** Edit · Toggle Active/Inactive · Drag to Reorder

**Page actions:** Add Corporate Partner

**Add / Edit form:**
- Name · Partnership Type (client / active_partnership)
- Logo (upload → Vercel Blob)
- Status (active / inactive)
- Display Order (also via drag)

---

## 12. Digital Product

### 12.1 E-Course Modules
**Route:** `/admin/ecourse-modules`
**ERD:** `ecourse_modules`, `services`
**Access:** super_admin, content_editor

**Table columns:** Service · Day · Title · Has Video · Has Worksheet · Actions

**Actions per row:** Edit

**Grouped view:** by Service (currently only "E-Course Life Reset")
- 7 rows per course (Day 1–7), ordered by `day_number`

**Add / Edit form:**
- Service (select — only services with `category = 'Add-ons & Digital Products'`)
- Day Number (1–7, unique per service)
- Title
- Content Body (Tiptap rich text — module text/learning content)
- Video URL (text — YouTube embed or direct URL)
- Worksheet File URL (upload PDF to Vercel Blob)

**Notes:**
- `item_order` here is `day_number`; drag-and-drop reorder swaps day numbers between modules
- Warning shown if reordering a module that has active enrollments with recorded progress

---

### 12.2 E-Course Enrollments
**Route:** `/admin/ecourse-enrollments`
**ERD:** `ecourse_enrollments`, `customers`, `services`
**Access:** super_admin, cs_admin

**Table columns:** ID · Customer · Service · Progress (Day N/7 bar) · Status · Access Granted · Actions

**Actions per row:** Revoke Access

**Filters:** Status (active / completed / revoked) · Service

**Search:** by customer name, WA

**Revoke action:**
- Sets `status = 'revoked'`
- Shows warning: "Customer will lose all access to this course"
- Revoke reason (free text, internal only)

---

## 13. System

### 13.1 Admin Users
**Route:** `/admin/admin-users` · `/admin/admin-users/new` · `/admin/admin-users/[id]`
**ERD:** `admin_users`
**Access:** super_admin only

**Table columns:** ID · Full Name · Email · Role · Status · Last Login · Actions

**Actions per row:** Edit Role · Suspend / Reactivate · Reset Password

**Page actions:** Invite Admin (sends email with setup link)

**Add / Edit form:**
- Full Name · Email (must be unique)
- Role (dropdown: super_admin / cs_admin / content_editor / hr_recruiter / finance)
- Status (active / suspended)
- On add: temporary password is generated and shown once; admin must change on first login

**Reset Password action:**
- Generates a reset link (or temporary password if no email configured)
- Does not show password to the performing admin — only to the target user

**Notes:**
- The currently logged-in admin cannot suspend themselves or change their own role
- Deleting admin users is not supported — only suspend, to preserve audit trail on `payments.confirmed_by` etc.

---

## 14. Supporting Pages (Outside Main Nav)

### 14.1 Login
**Route:** `/admin/login`
**Access:** public (unauthenticated)
**ERD:** `admin_users`
- Email + Password form
- Rate-limited via Upstash Redis (5 failed attempts → 15-minute lockout per IP)
- No "forgot password" self-service in Phase 1 — admin must contact super_admin

### 14.2 Profile / Settings
**Route:** `/admin/profile`
**Access:** all roles (own profile only)
- Change own display name
- Change own password (requires current password)
- View own role and last login time (read-only)

### 14.3 Registration Detail (Deep Link)
**Route:** `/admin/registrations/[id]`
- Referenced from: Dashboard activity feed, Customer detail tab, Payment detail, Test Session detail
- Described in §6.2 above

### 14.4 Customer Detail (Deep Link)
**Route:** `/admin/customers/[id]`
- Referenced from: Registration detail, Test Session detail
- Described in §6.1 above

---

## 15. Page Component Inventory

Each page type maps to a specific component pattern from `components/admin/`:

| Pattern | Used by | Component |
|---|---|---|
| Plain data table (read-heavy) | Payment Logs, Notification Logs, Proposal Leads | `<DataTable columns={} data={} />` |
| Table with status pipeline | Registrations, Payments, Corporate Inquiries, Job Applications | `<DataTable />` + `<StatusStepper />` |
| Table with drag-and-drop reorder | Service Categories, Payment Methods, Testimonials, Corporate Partners, E-Course Modules | `<SortableTable />` (dnd-kit wrapper) |
| Full-page form with rich text | Services, Articles, Job Postings, E-Course Modules | `<AdminForm />` + `<TiptapEditor />` |
| Options editor (dynamic list) | Service Packages (features), Test Items (options) | `<TagInput />` / `<OptionsEditor />` |
| Chart + metric dashboard | Dashboard | `<KpiCard />`, `<FunnelChart />`, `<RevenueChart />` |
| Detail page with tabs | Customer detail, Registration detail, Test Result detail | `<DetailPage />` + `<Tabs />` |
| Kanban board | Job Applications (optional) | `<KanbanBoard />` (dnd-kit) |
| Result viewer with dimension chart | Test Results detail | `<MBTIChart />` / `<DISCChart />` (see TEST_SCORING.md §2.6, §3.5) |
| Rubric editor with live preview | Scoring Rubrics edit | `<RubricEditor />` + `<TiptapEditor />` + `<TagInput />` + `<ResultPreviewModal />` |
