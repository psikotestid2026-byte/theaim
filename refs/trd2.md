# Technical Requirements Document (TRD)
## TheAIM Digital Platform — Architecture & Implementation Rules

| | |
|---|---|
| **Companion Documents** | `prd.md`, `erd.md`, `CLAUDE.md`, `AGENTS.md` |
| **Status** | Authoritative — these rules override convenience or convention if they ever conflict |
| **Reference Artifact** | `theaim-admin-panel.jsx` is a **visual/UX reference only**. It is plain React with inline mock data. It is *not* the implementation target — it exists to show layout, navigation, and table structure. The real Admin Panel is rebuilt in Next.js per this document. |

---

## 1. Non-Negotiable Architecture Rules

These are stated up front because they are easy to accidentally violate one file at a time. Every section below expands on one of these.

1. **No SPA.** The application is a Next.js (App Router) project rendered with **SSR / Server Components / ISR**. There is no client-side-only bootstrapped app, no client-side route-driven data fetching for content that could be rendered on the server. This is a speed-and-SEO requirement, not a style preference.
2. **`html`/`jsx` mockups are reference only.** Nothing from `theaim-admin-panel.jsx` is copy-pasted verbatim into the real app. Its layout/IA is the spec; its code is not.
3. **Hosting is Vercel.** Production and preview deployments both run on Vercel.
4. **File/image storage is Vercel Blob.** No S3, no Cloudinary, no local filesystem persistence.
5. **Database is Neon Postgres (serverless).** Accessed from Next.js Route Handlers using the `@neondatabase/serverless` driver.
6. **All runtime SQL is raw SQL.** No ORM query builder of any kind executes at request time. This includes Drizzle's query builder — it is not used here, not even for a single `SELECT`.
7. **Drizzle is migration/seed tooling only.** `drizzle-kit` generates and runs migrations from a schema file; a seed script uses Drizzle (or raw SQL — either is fine in the seed script specifically) to idempotently populate reference/demo data. Drizzle's runtime client is never imported by anything under `app/api` or `lib/queries`.
8. **One route per model, raw SQL lives elsewhere.** Every model gets `app/api/{model}/route.ts` (and `[id]/route.ts` where item-level operations apply). These files contain **zero raw SQL**. They call functions from `lib/queries/{model}.ts`, which is the only place raw SQL is written. The same query functions are imported directly by Server Components for public/admin page rendering — pages do not fetch their own API over HTTP.
9. **Components are shared and composed**, not duplicated per page. A `DataTable`, `StatusBadge`, `Sidebar`, etc. exist once in `components/` and are configured per screen, mirroring the pattern already established in the reference artifact.
10. **Payments run through Xendit.** `payment_methods.provider = 'xendit'` rows are live channels; `'manual'` rows stay staff-reconciled.
11. **Upstash Redis** provides caching, rate limiting, and idempotency keys. **Upstash Workflow** provides durable, retryable background steps (notification delivery, payment reconciliation fallback).
12. **Required dependencies:** PDF generation, XLSX export/import, `dnd-kit` drag-and-drop, `recharts` charts, and Tiptap rich text are all part of the stack (full list in Section 11).

---

## 2. Rendering Strategy in Detail

| Route group | Rendering | Why |
|---|---|---|
| `app/(public)/**` | Server Components by default; SSR on request, **ISR** (`revalidate`) for catalog/article/rate-card pages; `revalidateTag`/`revalidatePath` fired the moment an admin edits the underlying row | First paint is real HTML with real content — fast Largest Contentful Paint, crawlable by search engines and link-unfurlers without executing JS |
| `app/(public)/daftar`, `/pembayaran`, lead-capture forms | Server Component shell + a small Client Component for the interactive form itself | The page still SSRs its static content; only the form needs client interactivity |
| `app/(admin)/**` | Server Component page wrapper fetches the first page of data server-side (no loading-spinner-on-arrival); the interactive table/board/chart inside is a Client Component | Avoids the classic SPA "blank screen → spinner → data" admin experience while still allowing rich client interactivity (sorting, drag-and-drop, modals) |
| `app/api/**` | Route Handlers (Node.js runtime unless a specific route benefits from Edge, e.g. the Xendit webhook for low latency) | Used by Client Components for mutations, by external systems (Xendit webhook), and by anything that genuinely needs an HTTP boundary |

**Rule of thumb:** if a Server Component can call `lib/queries/x.ts` directly, it does — it does not `fetch("/api/x")` itself. The API layer exists for client-side JS and external callers, not for server-to-server self-calls.

### 2.1 SEO Implementation
- `generateMetadata()` per page (services, articles, careers) pulling `title`/`description`/OG image from the relevant row.
- JSON-LD structured data: `Organization` sitewide, `Article` on blog posts, `JobPosting` on career listings, `FAQPage` where applicable.
- Dynamic `sitemap.xml` and `robots.txt` generated from published `services`, `articles`, and `job_postings`.
- `next/image` for all imagery (cover images, consultant photos, partner logos), sourced from Vercel Blob URLs.

---

## 3. Hosting & Infrastructure

| Concern | Service | Notes |
|---|---|---|
| Hosting / compute | **Vercel** | Production + per-PR preview deployments |
| Database | **Neon Postgres (serverless)** | Branch-per-preview recommended (Neon's branching matches Vercel preview deployments) |
| File/image storage | **Vercel Blob** | CV uploads, partnership proposal documents, payment proof, article cover images, consultant photos, corporate partner logos |
| Cache / rate limit / idempotency | **Upstash Redis** | See Section 9 |
| Durable background steps | **Upstash Workflow** | See Section 10 |
| Payments | **Xendit** | QRIS, e-wallets, Virtual Account; manual bank transfer stays outside the gateway |

---

## 4. Data Layer — Raw SQL Rules

### 4.1 Connection
```ts
// lib/db.ts
import { neon } from "@neondatabase/serverless";

export const sql = neon(process.env.DATABASE_URL!);
```
This `sql` tagged-template client is the **only** way the application talks to Postgres at runtime. It is imported by `lib/queries/*` files and nowhere else (route handlers and components never import `lib/db.ts` directly — they go through the query layer).

### 4.2 Query layer convention
Every table in `erd.md` gets a corresponding file in `lib/queries/`. Each file exports plain async functions, fully typed, with the raw SQL inline:

```ts
// lib/queries/services.ts
import { sql } from "@/lib/db";
import type { Service } from "@/types/db";

export async function getPublishedServices(): Promise<Service[]> {
  const rows = await sql`
    SELECT s.id, s.name, s.slug, s.short_description, s.delivery_mode,
           s.audience_type, s.is_featured, c.name AS category_name
    FROM services s
    JOIN service_categories c ON c.id = s.category_id
    WHERE s.status = 'published'
    ORDER BY c.display_order, s.is_featured DESC, s.name ASC
  `;
  return rows as Service[];
}

export async function getServiceBySlug(slug: string): Promise<Service | null> {
  const rows = await sql`
    SELECT * FROM services WHERE slug = ${slug} AND status = 'published' LIMIT 1
  `;
  return (rows[0] as Service) ?? null;
}

export async function createService(input: NewService) {
  const rows = await sql`
    INSERT INTO services (category_id, name, slug, short_description, delivery_mode, audience_type, status)
    VALUES (${input.categoryId}, ${input.name}, ${input.slug}, ${input.shortDescription},
            ${input.deliveryMode}, ${input.audienceType}, 'draft')
    RETURNING *
  `;
  return rows[0];
}
```

### 4.3 Route handler convention
Route handlers are thin. They validate input (Zod), call a query function, and shape the HTTP response — nothing else:

```ts
// app/api/services/route.ts
import { NextResponse } from "next/server";
import { getPublishedServices, createService } from "@/lib/queries/services";
import { createServiceSchema } from "@/lib/validators/services";

export async function GET() {
  const data = await getPublishedServices();
  return NextResponse.json(data);
}

export async function POST(req: Request) {
  const body = createServiceSchema.parse(await req.json());
  const created = await createService(body);
  return NextResponse.json(created, { status: 201 });
}
```

### 4.4 Server Component convention (no self-fetch)
```tsx
// app/(public)/layanan/[slug]/page.tsx
import { getServiceBySlug } from "@/lib/queries/services";
import { getPackagesByServiceId } from "@/lib/queries/service-packages";

export default async function ServicePage({ params }: { params: { slug: string } }) {
  const service = await getServiceBySlug(params.slug);
  if (!service) return notFound();
  const packages = await getPackagesByServiceId(service.id);
  return <ServiceLandingTemplate service={service} packages={packages} />;
}
```

### 4.5 Drizzle's actual job (and only job)
```ts
// db/schema.ts — used ONLY by drizzle-kit for migration generation
import { pgTable, bigserial, varchar, boolean, integer, timestamp } from "drizzle-orm/pg-core";

export const serviceCategories = pgTable("service_categories", {
  id: bigserial("id", { mode: "number" }).primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  slug: varchar("slug", { length: 120 }).notNull().unique(),
  displayOrder: integer("display_order").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});
// ...every other table from erd.md mirrored here, field-for-field.
```
```ts
// db/seed.ts — idempotent, safe to re-run
import { db } from "./drizzle-client"; // a Drizzle client used ONLY inside this script
import { serviceCategories } from "./schema";
import { sql } from "drizzle-orm";

async function seed() {
  await db.insert(serviceCategories)
    .values([
      { name: "Assessment & Testing", slug: "assessment-testing", displayOrder: 1 },
      { name: "Exclusive Coaching", slug: "exclusive-coaching", displayOrder: 2 },
    ])
    .onConflictDoNothing({ target: serviceCategories.slug });
  // ...repeat per table, always keyed on a natural unique column so re-running is a no-op.
}
seed();
```
`db/drizzle-client.ts` (the Drizzle runtime client) is imported **only** by `db/seed.ts` and `drizzle.config.ts`. It must never appear in an import graph that includes anything under `app/` or `lib/queries/`. A lint rule (Section 12) enforces this boundary.

---

## 5. Project Structure

```
theaim/
├── app/
│   ├── (public)/
│   │   ├── page.tsx                         # homepage
│   │   ├── layanan/[slug]/page.tsx          # service landing
│   │   ├── rate-card/page.tsx
│   │   ├── artikel/page.tsx
│   │   ├── artikel/[slug]/page.tsx
│   │   ├── karir/page.tsx
│   │   ├── karir/[slug]/page.tsx
│   │   ├── perusahaan/page.tsx
│   │   ├── kerjasama/page.tsx
│   │   ├── unduh-proposal/page.tsx
│   │   ├── tentang/page.tsx
│   │   ├── tentang/ecosystem/page.tsx
│   │   ├── daftar/[serviceSlug]/page.tsx
│   │   ├── pembayaran/[registrationCode]/page.tsx
│   │   └── status/[registrationCode]/page.tsx
│   ├── (test)/                              # separate route group — no shared layout with public/admin
│   │   ├── tes/[token]/page.tsx             # test-taking page (magic link entry point)
│   │   │                                    #   Server Component validates token server-side,
│   │   │                                    #   returns 410 if completed, 404 if not found,
│   │   │                                    #   410 redirect to /hasil/[result_token] if completed.
│   │   │                                    #   Renders <TestEngine> Client Component with questions.
│   │   └── hasil/[resultToken]/page.tsx     # permanent result page (SSR, @media print CSS)
│   │                                        #   generateMetadata() for OG share card.
│   │                                        #   QR code generated client-side (qrcode library).
│   │                                        #   "Simpan PDF" button triggers window.print().
│   ├── (admin)/
│   │   └── admin/
│   │       ├── layout.tsx                   # sidebar shell + auth guard
│   │       ├── page.tsx                     # dashboard
│   │       ├── service-categories/page.tsx
│   │       ├── services/page.tsx
│   │       ├── service-packages/page.tsx
│   │       ├── consultants/page.tsx
│   │       ├── customers/page.tsx
│   │       ├── registrations/page.tsx
│   │       ├── payments/page.tsx
│   │       ├── payment-methods/page.tsx
│   │       ├── payment-instructions/page.tsx
│   │       ├── payment-logs/page.tsx
│   │       ├── notification-templates/page.tsx
│   │       ├── notification-logs/page.tsx
│   │       ├── test-sessions/page.tsx       # admin view: token status, issue new, revoke
│   │       ├── test-items/page.tsx          # question bank management per test_code
│   │       ├── test-results/page.tsx        # view results; search by WA number
│   │       ├── scoring-rubrics/page.tsx     # edit interpretation text per result_type (super_admin only)
│   │       ├── corporate-inquiries/page.tsx
│   │       ├── partnership-submissions/page.tsx
│   │       ├── proposal-leads/page.tsx
│   │       ├── job-postings/page.tsx
│   │       ├── job-applications/page.tsx
│   │       ├── articles/page.tsx
│   │       ├── testimonials/page.tsx
│   │       ├── corporate-partners/page.tsx
│   │       ├── ecourse-modules/page.tsx
│   │       ├── ecourse-enrollments/page.tsx
│   │       └── admin-users/page.tsx
│   ├── api/
│   │   ├── services/route.ts
│   │   ├── services/[id]/route.ts
│   │   ├── service-packages/route.ts
│   │   ├── registrations/route.ts
│   │   ├── registrations/[id]/route.ts
│   │   ├── payments/route.ts
│   │   ├── payments/[id]/confirm/route.ts
│   │   ├── test-sessions/route.ts           # admin: issue token, list sessions
│   │   ├── test-sessions/[token]/route.ts   # validate token, update status
│   │   ├── test-responses/route.ts          # save individual answers (Client Component calls this)
│   │   ├── test-results/route.ts            # trigger result computation on final submit
│   │   ├── webhooks/xendit/route.ts
│   │   ├── webhooks/upstash/route.ts        # Upstash Workflow callback handler
│   │   ├── ... (one folder per model from erd.md, same pattern)
│   │   └── uploads/route.ts                 # Vercel Blob upload handler
│   ├── sitemap.ts
│   └── robots.ts
├── lib/
│   ├── db.ts                                # neon() raw SQL client — runtime only
│   ├── queries/
│   │   ├── service-categories.ts
│   │   ├── services.ts
│   │   ├── service-packages.ts
│   │   ├── consultants.ts
│   │   ├── customers.ts
│   │   ├── registrations.ts
│   │   ├── payments.ts
│   │   ├── payment-methods.ts
│   │   ├── payment-instructions.ts
│   │   ├── payment-logs.ts
│   │   ├── notification-templates.ts
│   │   ├── notification-logs.ts
│   │   ├── test-sessions.ts                 # getSessionByAccessToken, getSessionByResultToken,
│   │   │                                    # createSession, updateStatus, getSessionsByCustomer
│   │   ├── test-items.ts                    # getItemsByTestCode (loads full question bank)
│   │   ├── test-responses.ts                # upsertResponse, getResponsesBySession
│   │   ├── test-results.ts                  # createResult, getResultBySessionId
│   │   ├── corporate-inquiries.ts
│   │   ├── partnership-submissions.ts
│   │   ├── proposal-leads.ts
│   │   ├── job-postings.ts
│   │   ├── job-applications.ts
│   │   ├── articles.ts
│   │   ├── testimonials.ts
│   │   ├── corporate-partners.ts
│   │   ├── ecourse-modules.ts
│   │   ├── ecourse-enrollments.ts
│   │   └── admin-users.ts
│   ├── scoring/                             # test result computation — pure functions, no DB
│   │   ├── index.ts                         # dispatch: computeResult(test_code, responses, items)
│   │   ├── mbti.ts
│   │   ├── disc.ts
│   │   ├── enneagram.ts
│   │   └── ...                              # one file per test_code
│   ├── validators/                          # one Zod schema file per model
│   ├── redis.ts                             # Upstash Redis client + cache helpers
│   ├── workflow.ts                          # Upstash Workflow client + step helpers
│   ├── xendit.ts                            # Xendit SDK wrapper (checkout, webhook verify)
│   ├── blob.ts                              # Vercel Blob upload/delete helpers
│   ├── auth.ts                              # admin session/role helpers
│   └── utils.ts
├── components/
│   ├── ui/                                  # primitives: Button, Badge, Input, Modal...
│   ├── admin/                               # DataTable, Sidebar, Topbar, KpiCard, Dashboard widgets
│   ├── public/                              # ServiceCard, RateCardTable, TestimonialCarousel...
│   └── test/                               # TestEngine (Client), QuestionStep, ResultCard, PrintButton
├── db/
│   ├── schema.ts                            # Drizzle schema — migration generation only
│   ├── drizzle-client.ts                    # Drizzle runtime client — seed.ts only, never elsewhere
│   ├── migrate.ts
│   └── seed.ts
├── types/
│   └── db.ts                                # hand-written types mirroring erd.md rows
├── drizzle.config.ts
├── middleware.ts                            # admin auth guard, rate-limit hook
└── next.config.ts
```

---

## 6. Component Architecture

- **`components/ui/`** — framework-agnostic primitives (Button, Badge, Input, Select, Modal, Drawer). Used by both public and admin surfaces.
- **`components/admin/`** — composed, data-shaped components: `DataTable` (generic, column-config driven, mirrors the reference artifact's table), `Sidebar`/`Topbar` (with the responsive drawer behavior already prototyped), `KpiCard`, `StatusBadge`, `RegistrationFunnelChart` (recharts), `KanbanBoard` (dnd-kit, for job-application/registration pipelines if adopted).
- **`components/public/`** — `ServiceCard`, `RateCardTable`, `TestimonialCarousel`, `ArticleCard`, `JobPostingCard`, `RegistrationForm`, `PaymentMethodPicker`.
- Every admin list screen is the **same** `DataTable` component configured with a different column set and query — exactly the pattern already established in `theaim-admin-panel.jsx`, just now backed by real data instead of inline arrays.

---

## 7. Caching & High-Traffic Strategy

| Layer | Mechanism |
|---|---|
| Public page HTML | ISR with `revalidate` per route; `revalidateTag()` called from the relevant `app/api/{model}/route.ts` mutation handlers the moment an admin publishes/edits a row |
| Hot read queries (rate card, homepage featured services, published articles list) | Cached in **Upstash Redis** with a short TTL (60–300s) as a defense-in-depth layer in front of Neon, invalidated on write |
| Public form submissions (registration, corporate inquiry, partnership, proposal download, job application) | **Upstash Redis** rate limiting per IP/WhatsApp number to absorb spam/bot bursts without touching Postgres |
| **Test page token validation** (`/tes/[token]`) | `access_token` session record cached in Redis (60s TTL) on first validation. Cache key: `test:access:{token}`. On `in_progress → completed` transition, key is deleted immediately so any retry correctly sees the completed state and redirects to the result page |
| **Result page** (`/hasil/[resultToken]`) | Full `test_results` row cached indefinitely in Redis (key: `test:result:{resultToken}`). Result never changes after computation; Redis prevents any Postgres hit on repeat visits or link sharing. Cache is only invalidated if an admin explicitly deletes a result record |
| **In-progress answer buffer** | During an active test session, each answered `item_id → answer_value` pair is written to Redis hash (`test:answers:{sessionId}`) in addition to `test_responses` DB table. On test page reload/resume, the Server Component reads Redis first to restore answered state client-side without a DB query. Redis TTL: 48h from last write |
| Payment webhook idempotency | **Upstash Redis** SETNX-style key on `provider_reference` so a duplicated Xendit webhook delivery never double-processes a payment |
| Database connection | Neon's serverless HTTP driver (`@neondatabase/serverless`) — no connection pooling needed in the traditional sense, compatible with Vercel's function-per-request model |

---

## 8. Background Jobs — Upstash Workflow

Upstash Workflow handles every multi-step or retry-prone process so a single Vercel function invocation doesn't have to do it synchronously and isn't lost if a step fails:

1. **Notification delivery** — on `registration_created`, `schedule_confirmed`, `payment_confirmed`, etc., a workflow renders the matching `notification_templates` row, calls the WhatsApp delivery provider, and writes the result to `notification_logs` with automatic retry on transient failure.
2. **Payment reconciliation fallback** — if a Xendit webhook never arrives within an expected window, a workflow polls the Xendit API for the payment's actual status and reconciles `payments`/`payment_logs` accordingly.
3. **E-course access provisioning** — on `payments.status = 'confirmed'` for an e-course package, a workflow creates the `ecourse_enrollments` row and sends the access notification.
4. **Test completion workflow** — triggered by `POST /api/test-results` (called by `<TestEngine>` on final answer submit). Steps, each retryable independently:
   a. Load all `test_responses` for the session from DB (Redis answer buffer used as fallback if DB write lagged).
   b. Call `lib/scoring/{test_code}.ts` → compute `raw_scores`, `result_type`, `result_label`, `interpretation`, `wa_summary_text`.
   c. Write `test_results` row to DB.
   d. Update `test_sessions.status = 'completed'` and `completed_at = now()`.
   e. Delete Redis key `test:access:{access_token}` (force-expire so the next page hit correctly redirects to result).
   f. Cache `test:result:{result_token}` in Redis indefinitely.
   g. Render the WA summary text (interpolate `{result_token}` URL, `{result_type}`, etc. from the `test_completed` `notification_templates` row).
   h. Send via WhatsApp delivery provider; write to `notification_logs`.
   
   **Why Workflow here instead of synchronous API response?** Steps c–h must complete for the customer to receive their result link. If the WhatsApp send fails at step h, Upstash Workflow retries it automatically. If the Vercel function times out mid-workflow, the workflow resumes from the last committed step — not from the beginning. This is not possible with a simple `async` function in a route handler.

---

## 9. Payments — Xendit

- `payment_methods` rows with `provider = 'xendit'` map to live Xendit payment channels (QRIS, e-wallets, Virtual Account); `provider = 'manual'` rows are staff-reconciled bank transfers and never touch the Xendit API.
- `lib/xendit.ts` wraps checkout/charge creation and webhook-signature verification.
- `app/api/webhooks/xendit/route.ts` verifies the signature, writes the raw payload to `payment_logs`, updates `payments.status`, and triggers the relevant Upstash Workflow (notification +, where applicable, e-course provisioning).
- All gateway request/response payloads are persisted to `payment_logs` regardless of outcome, per the audit requirement in `erd.md` Section 11.

---

## 10. File & Media Storage — Vercel Blob

| Use case | Source field |
|---|---|
| Job application CV | `job_applications.cv_file_url` |
| Partnership proposal document | `partnership_submissions.proposal_file_url` |
| Payment proof | `payments.proof_file_url` |
| Article cover image | `articles.cover_image_url` |
| Consultant photo | `consultants.photo_url` |
| Corporate partner / payment method logo | `corporate_partners.logo_url`, `payment_methods.logo_url` |

`lib/blob.ts` wraps `@vercel/blob`'s `put`/`del`. Uploads happen via `app/api/uploads/route.ts`, which validates file type/size before storing and returns the Blob URL to be persisted by the relevant query function.

---

## 11. Dependencies

| Purpose | Package(s) |
|---|---|
| Framework | `next`, `react`, `react-dom` |
| Database (runtime) | `@neondatabase/serverless` |
| Database (migration/seed only) | `drizzle-orm`, `drizzle-kit` |
| Validation | `zod` |
| File storage | `@vercel/blob` |
| Cache / rate limit | `@upstash/redis`, `@upstash/ratelimit` |
| Background workflows | `@upstash/workflow` |
| Payments | `xendit-node` |
| PDF (admin exports only) | `pdf-lib` — used for admin-facing document exports (e.g. bulk result reports), **not** for test result delivery. Test results are printed to PDF by the customer directly from `theaim.id/hasil/[resultToken]` using the browser's native print dialog (`window.print()` triggered by a "Simpan PDF" button). The result page has a dedicated `@media print` stylesheet. No server-side PDF generation, no Vercel Blob storage for test result PDFs. |
| QR code (result page) | `qrcode` (lightweight, client-side) — renders a QR code on the result page encoding the permanent `result_token` URL. When the customer prints the page, the QR code is printed too. Scanning it from a printout takes them straight back to the online result. Zero server overhead. |
| Spreadsheet export/import | `xlsx` (SheetJS) |
| Drag-and-drop | `@dnd-kit/core`, `@dnd-kit/sortable` |
| Charts | `recharts` |
| Rich text editor | `@tiptap/react`, `@tiptap/starter-kit` (used for `articles.content`, `job_postings.description`, `notification_templates.message_content`, `test_items.question_text` long-form variants) |
| Icons | `lucide-react` |

---

## 12. Guardrails / Lint Rules

To keep the rules in Section 1 from drifting as the codebase grows:
- An import-boundary lint rule (e.g. `eslint-plugin-boundaries` or a custom rule) forbids `db/drizzle-client` from being imported anywhere outside `db/`.
- A second rule forbids any file under `app/api/**` from containing a raw SQL template literal directly — SQL may only appear inside `lib/queries/**`.
- Route handlers and Server Components import query functions, never `lib/db.ts` directly, keeping the raw `sql` client encapsulated inside the query layer.

---

## 13. Environment Variables

```
DATABASE_URL=                  # Neon Postgres connection string (runtime, @neondatabase/serverless)
DATABASE_URL_UNPOOLED=         # Neon direct connection, used by drizzle-kit for migrations
BLOB_READ_WRITE_TOKEN=         # Vercel Blob
UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=
QSTASH_TOKEN=                  # Upstash Workflow runs on top of QStash
XENDIT_SECRET_KEY=
XENDIT_WEBHOOK_VERIFICATION_TOKEN=
NEXTAUTH_SECRET=                # or equivalent admin-session secret
```

---

## 14. Explicit Non-Goals

- No Single-Page Application shell anywhere in the public site or test engine.
- No ORM query builder executing at request time (Drizzle, Prisma, or otherwise) — raw SQL only, via `lib/queries/**`.
- No S3/Cloudinary/local disk storage — Vercel Blob only (and only for uploads, not test result PDFs).
- No server-to-server self-fetch from a Server Component to this app's own `app/api` route when a direct query-layer call is available.
- No copy-pasting markup from `theaim-admin-panel.jsx` into the real app — it is a layout/IA reference, not source code.
- No server-side PDF generation for test results — browser print handles this at zero cost and zero infrastructure.
- No login / OTP for customers taking psychometric tests — the `access_token` magic link IS the authentication mechanism for the test session.

---

## 15. Token Strategy — Magic Link Architecture

This section is the authoritative technical specification for the two-token, no-login access model used by the psychometric test engine.

### Two tokens, two lifetimes, two purposes

| Token | Field | Lifetime | Purpose | Reuse |
|---|---|---|---|---|
| `access_token` | `test_sessions.access_token` | One-time; expires 30 days from `issued_at` if never used; permanently consumed on `completed` | Opens the test page; transitions session status | Never reusable |
| `result_token` | `test_sessions.result_token` | Permanent, never expires | Opens the result page; shareable, bookmarkable | Unlimited reads |

Both tokens are generated as `crypto.randomUUID()` (or `randomBytes(64).toString('hex')`) at session creation. They are stored in `test_sessions` before the WhatsApp link is sent.

### Token validation logic (`lib/queries/test-sessions.ts`)

```ts
export async function getSessionByAccessToken(token: string) {
  const rows = await sql`
    SELECT s.id, s.status, s.test_code, s.package_id, s.customer_id,
           s.result_token, s.expires_at, s.started_at, s.confirm_attempts,
           s.locked_at, c.whatsapp_number
    FROM test_sessions s
    JOIN customers c ON c.id = s.customer_id
    WHERE s.access_token = ${token}
    LIMIT 1
  `;
  return rows[0] ?? null;
}
```

The Server Component at `app/(test)/tes/[token]/page.tsx` applies this gate:

```ts
if (!session)                             return notFound();                         // 404
if (session.status === 'revoked')         return notFound();                         // 404 — don't expose revoked
if (session.status === 'locked')          return <LockedScreen />;                   // too many failed attempts
if (session.status === 'expired')         return <TokenExpiredPage />;
if (session.status === 'completed')       redirect(`/hasil/${session.result_token}`); // already done → go to result
if (new Date() > session.expires_at) {
  await updateSessionStatus(session.id, 'expired');
  return <TokenExpiredPage />;
}
// status is 'issued' or 'confirming' or 'in_progress' — render identity check or test
if (session.status === 'issued' || session.status === 'confirming') {
  return <IdentityConfirmPage session={session} />;   // WA digit check — see §15.1 below
}
// status is 'in_progress' — render the test engine (resume if browser was closed)
return <TestEngine session={session} />;
```

### §15.1 — Identity Confirmation (`<IdentityConfirmPage>`)

The customer must confirm they are the registered purchaser before the test begins. This is a mandatory gate between token validation and test access.

**What it is:** A form asking for the last 4 digits of the WhatsApp number used at checkout. NOT an OTP. NOT a password. A lightweight honesty check that prevents casual link-forwarding from invalidating a purchased result.

**Why it matters:** TheAIM's value proposition includes "100% Private & Confidential" results. If a forwarded link allows the wrong person to take the test, the result is meaningless for the actual purchaser, and that person's psychological profile is exposed without their knowledge.

**Server action — `app/api/test-sessions/[token]/confirm/route.ts`:**
```ts
export async function POST(req: Request, { params }: { params: { token: string } }) {
  const { last4 } = z.object({ last4: z.string().length(4).regex(/^\d{4}$/) }).parse(await req.json());
  const session = await getSessionByAccessToken(params.token);
  if (!session || ['completed','expired','revoked','locked'].includes(session.status)) {
    return NextResponse.json({ error: 'invalid_token' }, { status: 410 });
  }
  const correct = session.whatsapp_number.slice(-4);
  if (last4 !== correct) {
    const newAttempts = session.confirm_attempts + 1;
    const MAX = 3;
    if (newAttempts >= MAX) {
      await lockSession(session.id);    // UPDATE status='locked', locked_at=now()
      return NextResponse.json({ error: 'locked', remaining: 0 }, { status: 423 });
    }
    await incrementConfirmAttempts(session.id, newAttempts);
    return NextResponse.json({ error: 'wrong_digits', remaining: MAX - newAttempts }, { status: 422 });
  }
  // Correct — transition to in_progress
  await updateSessionStatus(session.id, 'in_progress', { started_at: new Date() });
  // Invalidate Redis cache so next request sees in_progress, not issued
  await redis.del(`test:access:${params.token}`);
  return NextResponse.json({ ok: true });
}
```

**Masking rule:** Show the customer their own WA number partially masked: first 4 digits + `••••` + last 4 digits. E.g. `081234567802` → displayed as `0812••••7802`. This gives enough context to recognize it's theirs without revealing the full number to someone who has only the link.

### Reuse prevention

The transition `in_progress → completed` is a single `UPDATE … WHERE status = 'in_progress' RETURNING id` (optimistic lock). If two concurrent requests somehow reach the submit endpoint with the same session, only one UPDATE succeeds; the other sees 0 rows updated and returns a 409. The Upstash Workflow for test completion is triggered only on the successful UPDATE.

The `confirm_attempts` increment is similarly guarded: `UPDATE … SET confirm_attempts = confirm_attempts + 1 WHERE id = $1 AND confirm_attempts < 3 RETURNING confirm_attempts`. If the result is 0 rows (race condition on the 3rd attempt), the session is treated as already locked.

### Result page (`app/(test)/hasil/[resultToken]/page.tsx`)

```ts
export async function generateMetadata({ params }) {
  const result = await getResultByResultToken(params.resultToken);
  return {
    title: `Hasil ${result.test_code} — ${result.result_type} | TheAIM`,
    description: result.interpretation.description.slice(0, 155),
    openGraph: { title: `${result.result_type} — ${result.result_label}`, ... }
  };
}

export default async function ResultPage({ params }) {
  const session = await getSessionByResultToken(params.resultToken);
  if (!session || session.status !== 'completed') return notFound();
  const result   = await getResultBySessionId(session.id);
  return <ResultTemplate session={session} result={result} />;
}
```

`<ResultTemplate>` is a Server Component. The only Client Component inside it is `<PrintButton>` (calls `window.print()`) and `<QRCode value={url} />` (renders client-side using the `qrcode` package). Everything else — the result type, label, interpretation, dimension scores — is rendered as static HTML on the server, so it's fast, SEO-friendly (for users who share the URL), and works without JavaScript for the read path.

### Admin token management

Admins can:
- **Issue** a new session (after payment confirmed) from `admin/test-sessions` → triggers the Upstash Workflow notification.
- **Revoke** a session (customer purchased wrong test, suspected share) → sets `status = 'revoked'`, deletes Redis cache.
- **Re-issue** — create a new `test_sessions` row with a new `access_token` for the same `registration_id`. The old session remains in DB as audit trail.

No customer-facing token reset exists. Customers contact admin (WhatsApp), admin handles it. This is intentional — keeps the surface area minimal for Phase 1.
