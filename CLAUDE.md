# CLAUDE.md

Guidance for Claude (and Claude Code) when working in this repository. This file is project-specific instruction, not product documentation — for *what* the product does, read `prd.md` and `erd.md`; for *how* it's built, read `trd.md`. This file is the condensed "how to act in this repo" layer on top of those.

---

## Project in one paragraph

TheAIM is a Next.js (App Router) platform for PT Abadi Insan Manfaat — an Indonesian psychology/coaching/HR-services company. It has three surfaces: a public marketing + lead-capture site, an authenticated Admin Panel, and a token-gated psychometric test engine (the primary retail product — standalone assessments like MBTI, DISC, Enneagram sold at Rp 75.000/each). Database is Neon Postgres, queried with **raw SQL only** at runtime. Drizzle exists solely for migrations and idempotent seeding. Hosting is Vercel; files go to Vercel Blob; payments go through Xendit; caching/rate-limiting/idempotency uses Upstash Redis; durable background steps (including the post-test result delivery workflow) use Upstash Workflow.

---

## Read this first, in this order

1. `prd.md` — what the product does, what's dynamic vs hardcoded, public vs admin breakdown (§6), both user flows (§7 — consulting flow AND test retail flow).
2. `erd.md` — every table, every column, every constraint. Source of truth for the data model, including the four test-engine tables added in §10. If code and `erd.md` disagree, `erd.md` wins unless the person explicitly asks to change the schema (update `erd.md` too, same change).
3. `trd.md` — architecture rules. §1 is non-negotiable. §15 is the full spec for the two-token magic link system — read it before touching anything under `app/(test)/` or `lib/queries/test-*`.
4. `theaim-admin-panel.jsx` — **visual reference only** for Admin Panel layout, navigation structure, and table column patterns. It is plain React with inline mock arrays. Never import it, copy its markup, or treat it as a real route.

---

## The two rules that matter most

### Rule 1 — Raw SQL lives in `lib/queries/{model}.ts`. Nowhere else.

- `app/api/{model}/route.ts` calls a function from `lib/queries/{model}.ts`. It never contains a SQL template literal itself.
- Server Components call `lib/queries/{model}.ts` functions directly. They never `fetch()` this app's own API routes.
- `db/schema.ts` and `db/drizzle-client.ts` are migration/seed-only. If you find yourself importing Drizzle's query builder (`db.select()`, `db.insert()`, etc.) inside `app/` or `lib/queries/`, stop — that's the one thing this codebase deliberately does not do.

If a task seems to require breaking this, don't. Add the function to `lib/queries/{model}.ts` instead, even for a one-off.

### Rule 2 — Never regenerate or reset test tokens silently.

The `access_token` and `result_token` in `test_sessions` are security-critical. Specific rules:
- Never generate a new `access_token` for an existing `test_sessions` row — create a new row entirely (the old session stays as audit trail).
- Never set `status = 'issued'` or `status = 'in_progress'` on a session that has already reached `'completed'` — this would allow a second attempt on a finished test.
- Never reset `confirm_attempts` without an explicit admin action. The counter is append-only from the customer's perspective; only admin can reset it by re-issuing a new session row.
- When status transitions to `'locked'` (after `confirm_attempts >= MAX_CONFIRM_ATTEMPTS`), also set `locked_at = now()`. Both fields must be written atomically.
- Revoking a session (`status = 'revoked'`) must also delete the Redis cache key `test:access:{access_token}`. Failure to invalidate the cache means the old token still works from Redis for up to 60 seconds.
- `result_token` is permanent by design. Do not set an expiry on it. Do not delete the Redis key `test:result:{resultToken}` unless the session is being hard-deleted for a data-subject request.

Valid status transitions (one-way, no rollback):
```
issued → confirming → in_progress → completed
issued → expired       (expires_at passed)
issued/confirming → locked   (confirm_attempts >= 3)
any → revoked          (admin action only)
```

---

## Adding a new model/table — the full loop

When asked to add something that needs a new table:

1. Add the DDL to `erd.md` (bigserial PK; `varchar` + `CHECK` instead of native enum; matching existing style).
2. Add it to the **Entity Overview** table and **Mermaid diagram** in `erd.md` — both, in the same edit.
3. Mirror the schema in `db/schema.ts` (for `drizzle-kit generate` only).
4. Add idempotent seed rows to `db/seed.ts`, keyed on a natural unique column.
5. Write `lib/queries/{model}.ts` with raw SQL functions (list/get/create/update at minimum).
6. Write `lib/validators/{model}.ts` (Zod) for anything the route accepts as input.
7. Add `app/api/{model}/route.ts` (+ `[id]/route.ts` if item-level operations exist) — thin handlers calling step 5's functions.
8. Wire up the UI: public page, or Admin Panel screen via the shared `DataTable` from `components/admin/` — add the nav entry matching the group structure in `prd.md` §6.2.
9. Update `prd.md` §6 (public vs admin table; dynamic vs hardcoded list) if the new table affects either.

### Special case: adding a new psychometric test (new `test_code`)

Adding a new test (e.g. "Holland RIASEC" if not yet implemented) requires all of the above PLUS:
- Add seed rows to `test_items` in `db/seed.ts` for the full question bank, with correct `scoring_meta` per option.
- Add `lib/scoring/{test_code}.ts` implementing the `computeResult()` function — pure TypeScript, no DB calls, unit-testable.
- Register the new code in `lib/scoring/index.ts`'s dispatch map.
- Add the `test_code` value to the relevant `service_packages.test_code` seed row in `db/seed.ts`.

Skipping any step means a test can be purchased but not started, or started but not scored. Don't do this silently.

---

## Test engine — specific conventions

- **Identity confirmation is mandatory before test access.** After token validation, the customer must enter the last 4 digits of their registered WhatsApp number (`customers.whatsapp_number[-4:]`). The server compares against `test_sessions.customer_id → customers.whatsapp_number`. This is a lightweight honesty check (not OTP, not login) that prevents casual link-forwarding from invalidating a purchased result. Implemented in `app/api/test-sessions/[token]/confirm/route.ts` and `lib/queries/test-sessions.ts#incrementConfirmAttempts`.
- **3 failed confirmations → locked.** On the 3rd wrong answer, set `status = 'locked'` and `locked_at = now()` atomically. Show `<LockedScreen>` (not `notFound()` — the customer needs to know to contact admin). Do not allow any further confirmation attempts or test access on a locked session.
- **No server-side PDF.** Results are printed from the browser via `window.print()`. The result page (`/hasil/[resultToken]`) has an `@media print` stylesheet. Never add server-side PDF generation (pdf-lib, Puppeteer, etc.) for test results.
- **QR code is client-side only.** `<QRCode />` from the `qrcode` package renders client-side on the result page. It encodes the full `result_token` URL.
- **Scoring lives in `lib/scoring/`, not in `lib/queries/`.** Scoring functions are pure TypeScript — they take `responses` and `items` as arguments and return a `TestResultPayload`. They never import `lib/db.ts` or call any database function.
- **Answer writes are hot.** `POST /api/test-responses` is called on every question answer during an active session. Keep this route handler lean — one upsert query, one Redis HSET, return 200. No extra logic.
- **The result page must have `generateMetadata()`.** The `result_token` URL gets shared (WhatsApp forwards, social, printout QR scans). It must render a proper OG card showing the result type and label.

---

## Conventions to follow without being asked

- Component reuse over duplication: a new admin list screen should configure the existing `DataTable`, not invent a new table component.
- Status values are `varchar` + `CHECK`, not enums — match `snake_case` like `pending_confirmation`, `in_progress`, `completed`.
- All customer-facing copy and seed content stays in Bahasa Indonesia. Code, comments, schema identifiers, and documentation stay in English.
- New public pages need `generateMetadata()` and, where relevant, JSON-LD — don't ship a page without it. SEO is a stated product requirement.
- File uploads go through `lib/blob.ts` → Vercel Blob. Never write to local disk.
- Anything payment-related that touches Xendit must log to `payment_logs` regardless of success or failure — this is an audit requirement, not optional error handling.
- Redis key naming convention: `test:access:{token}`, `test:result:{resultToken}`, `test:answers:{sessionId}` — match this pattern when adding new test-related cache keys.

---

## Commands

```bash
npm run dev            # local dev server
npm run build          # production build (catches SSR boundary mistakes)
npm run lint           # eslint + import-boundary rules (trd.md §12)
npm run db:generate    # drizzle-kit: schema.ts → migration SQL
npm run db:migrate     # apply pending migrations (DATABASE_URL_UNPOOLED)
npm run db:seed        # idempotent seed — safe to re-run
npm run test           # unit tests, especially lib/scoring/**
```

---

## When in doubt

Prefer stating an assumption over guessing silently on anything that touches:
- The data model (`erd.md`)
- The raw-SQL / no-ORM-at-runtime boundary
- Token lifecycle (trd.md §15) — especially anything that could allow a test to be retaken
- Payment correctness

Everything else (component styling, exact copy wording, animation timing) is fine to make a reasonable call on and move forward.
