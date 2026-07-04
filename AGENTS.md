# AGENTS.md

This file gives any AI coding agent working in this repository the context needed to make correct changes without reading the full documentation suite. For product behavior, see `prd.md` and `erd.md`. For full architectural rationale, see `trd.md`. For Claude-Code-specific guidance, see `CLAUDE.md`. This file is the operational summary for any agent.

---

## Project Overview

TheAIM — a Next.js (App Router) platform for PT Abadi Insan Manfaat, an Indonesian psychology/coaching/HR-services company. Three surfaces in one repository:

1. **Public site** — server-rendered marketing pages and lead-capture forms (SSR/ISR, SEO-critical).
2. **Admin Panel** — authenticated dashboard for managing catalog, bookings, payments, content, test sessions, and recruitment.
3. **Test engine** — the primary retail product. Customers purchase a psychometric test (MBTI, DISC, Enneagram, etc.) and receive a one-time magic link via WhatsApp. No login required. Results are permanently accessible via a second token URL and printable as PDF from the browser.

Postgres (Neon, serverless) — raw SQL only at runtime. Drizzle — migration/seed tooling only. Hosting — Vercel. Files — Vercel Blob. Payments — Xendit. Cache/rate-limit — Upstash Redis. Background steps — Upstash Workflow.

---

## Setup Commands

```bash
npm install
cp .env.example .env.local
# Required vars: DATABASE_URL, DATABASE_URL_UNPOOLED, BLOB_READ_WRITE_TOKEN,
#                UPSTASH_REDIS_REST_URL, UPSTASH_REDIS_REST_TOKEN, QSTASH_TOKEN,
#                XENDIT_SECRET_KEY, XENDIT_WEBHOOK_VERIFICATION_TOKEN, NEXTAUTH_SECRET
# See trd.md §13 for the full list.
npm run db:generate
npm run db:migrate
npm run db:seed
npm run dev
```

---

## Dev Environment

- Node.js + Next.js App Router (three route groups: `(public)`, `(test)`, `(admin)`).
- Database: **Neon Postgres branch** — point local dev at a Neon development branch, not a local Postgres instance, because the runtime driver (`@neondatabase/serverless`) is HTTP-based.
- Vercel Blob: a valid `BLOB_READ_WRITE_TOKEN` is required even in dev for file-upload routes.
- Test engine: to test the token flow locally, create a `test_sessions` row with a known `access_token` and navigate to `localhost:3000/tes/{token}`.

---

## Architecture Rules (non-negotiable — see trd.md §1 for rationale)

- **Raw SQL only, in `lib/queries/{model}.ts`.** Route handlers call these functions; they never contain SQL. Server Components also call them directly — they do not `fetch()` this app's own `/api` routes.
- **No ORM at runtime.** Drizzle's query builder (`db.select()`, `db.insert()`, etc.) must never appear in `app/**` or `lib/queries/**`. `drizzle-orm` is only imported by `db/schema.ts` and `db/seed.ts`.
- **No SPA.** Public pages and test pages are SSR/ISR. Admin pages server-render their initial data. Only truly interactive pieces (question stepper, drag-and-drop, charts, print button) are Client Components.
- **No server-side PDF for test results.** The result page at `/hasil/[resultToken]` has an `@media print` stylesheet. Customers click "Simpan PDF" → `window.print()` → browser saves PDF. `pdf-lib` in the dependency list is for admin-facing exports only.
- **No login / OTP for test customers.** Access is controlled by `access_token` (one-time, magic link). Results are accessed by `result_token` (permanent). Both are UUIDs generated at session creation. See trd.md §15 for the full spec.
- **Components are shared.** Reuse `components/admin/DataTable` for admin list screens. Reuse `components/ui/**` primitives sitewide. No bespoke table or form component per page.
- **`erd.md` is the schema source of truth.** Any table change needs a DDL update in `erd.md` (including Entity Overview and Mermaid diagram), a `db/schema.ts` mirror, and a `db/seed.ts` entry — all in the same change.

---

## Test Engine — Critical Rules

These apply specifically to `test_sessions`, `test_items`, `test_responses`, `test_results`, and `lib/scoring/**`:

1. **Identity confirmation is mandatory before test access (PRD §5.14).** After token validation, the customer must enter the last 4 digits of their registered WhatsApp number. Server-side: compare against `customers.whatsapp_number[-4:]` (loaded via `test_sessions.customer_id`). Wrong answer: increment `test_sessions.confirm_attempts` and return HTTP 422 with remaining attempts. This is NOT OTP — no API cost. It prevents casual link-forwarding from invalidating a purchased result.
2. **3 failed confirmations → locked status.** When `confirm_attempts >= MAX_CONFIRM_ATTEMPTS (3)`, set `status = 'locked'` and `locked_at = now()` in a single atomic UPDATE. Return HTTP 423. Show `<LockedScreen>` to the customer (not 404). Admin must re-issue a new session row to unlock.
3. **Never reset a completed session.** Once `test_sessions.status = 'completed'`, it must not be set back to `'issued'`, `'confirming'`, or `'in_progress'`. Create a new row if re-attempt is authorised by admin.
4. **Token invalidation must clear Redis.** On revoke or lock, delete `test:access:{access_token}` from Redis immediately. Otherwise the old token may still work from cache for up to 60 seconds.
5. **Scoring is pure TypeScript, no DB.** `lib/scoring/{test_code}.ts` receives `responses: Record<number, string>` and `items: TestItem[]` and returns `TestResultPayload`. It imports nothing from `lib/db.ts` or `lib/queries/**`. Add unit tests for every scoring function.
6. **Result page must have `generateMetadata()`.** The `result_token` URL is shared publicly. It must produce a correct OG card.
7. **QR code is client-side.** `<QRCode />` from the `qrcode` package renders on the client inside the result page — no server-side QR generation.
8. **Answer write is the hottest route.** `POST /api/test-responses` is called for every question answered. Keep it to one upsert + one Redis HSET. No additional logic.
9. **Upstash Workflow owns post-completion.** The test completion workflow (TRD §8, step 4) handles: compute result → write DB → update session status → invalidate/set Redis → send WA summary. Do not inline these steps in the route handler.

Valid status transitions (append-only, no rollback):
- `issued → confirming → in_progress → completed`
- `issued/confirming → locked` (confirm_attempts ≥ 3)
- `issued → expired` (expires_at passed)
- `any → revoked` (admin action only)

---

## Adding a New Table/Model (checklist)

1. DDL in `erd.md`: bigserial PK; `varchar` + `CHECK` (not native enum); all FKs explicit; indexes per trd.md §7.
2. Add row to Entity Overview table and relationship to Mermaid diagram in `erd.md`.
3. Mirror in `db/schema.ts`; idempotent seed in `db/seed.ts`.
4. `lib/queries/{model}.ts` — raw SQL functions.
5. `lib/validators/{model}.ts` — Zod schema.
6. `app/api/{model}/route.ts` (+ `[id]/route.ts`) — thin handlers.
7. UI: public page or Admin Panel screen (shared `DataTable`, nav group matching `prd.md` §6.2).
8. Update `prd.md` §6 if the public/admin or dynamic/hardcoded lists change.

### Adding a new psychometric test (`test_code`)

In addition to the above (for `test_items`):
- Seed the full question bank in `db/seed.ts` with correct `options` JSONB including `score_key` and `score_val`.
- Create `lib/scoring/{test_code}.ts` implementing `computeResult()`.
- Register it in `lib/scoring/index.ts` dispatch map.
- Set `test_code` on the relevant `service_packages` seed row.

---

## Testing Instructions

- `npm run lint` — enforces import-boundary rules (trd.md §12). Must pass before any PR.
- `npm run build` — catches SSR boundary mistakes (e.g. server-only module imported into Client Component). Must pass.
- `npm run test` — unit tests. Scoring functions in `lib/scoring/**` must have coverage. New `lib/queries/**` functions should have at minimum an integration test against a Neon test branch.
- For token-flow testing: create a `test_sessions` row with known tokens via `db/seed.ts` or a seed script, then exercise `/tes/{token}` and `/hasil/{resultToken}` manually.

---

## PR / Change Instructions

- Keep `erd.md`, `trd.md`, and `prd.md` in sync with code in the same change set. No silent documentation drift.
- If a requested change would break a rule in trd.md §1 or §15 (test token security), say so explicitly rather than working around it silently.
- Customer-facing copy and seed content: Bahasa Indonesia. All code, comments, commit messages, and documentation: English.
- Every PR that touches test_sessions or test_results must include a statement confirming that no completed session can be reset and that Redis invalidation is handled correctly.

---

## Security & Data Handling

- **Test result data is sensitive.** Psychological and personality assessment results are confidential. Access to `test_results` rows in admin is restricted to `super_admin` and `cs_admin` roles only. Never log `interpretation` or `raw_scores` to application logs or error trackers.
- **Token security.** `access_token` and `result_token` are security credentials. Never return them in list-endpoint responses (`GET /api/test-sessions` must not include the token values). Return them only on session creation and only to the admin who triggered the issue.
- **File uploads** go through `lib/blob.ts` to Vercel Blob; never write to local disk.
- **Xendit**: every request/response (success or failure) is persisted to `payment_logs`. Webhook handlers must verify the Xendit signature before trusting payload contents.
- **Psychological, mental-health, and financial data** (test results, registration notes, consultation context) must never be widened beyond the roles defined in `admin_users.role`.
