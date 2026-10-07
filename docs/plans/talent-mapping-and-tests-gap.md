# Gap analysis: Talents Mapping and additional test types

Status: Phase A is implemented on this branch (catalog tables, nullable `test_id`, seed, read-only admin list). `/tes` and `/hasil` are unchanged. `service_package_tests` is not in this slice.

Compared on 7 Oct 2026:

- Uploaded Talents Mapping implementation guide (v2.0.0)
- Uploaded TheAIM product document (v1.0)
- Uploaded Super Admin panel document
- Uploaded platform schema SQL and seed SQL
- This repository at `main` (`db/schema.ts`, migrations `0000` and `0001`, `lib/scoring`, `app/(test)`, `app/(admin)/panel`)

Short version of the hypothesis: the app has a generic token runner and three real scorers. It does **not** have a `master_tests` table, and it does **not** have the Talents Mapping multi-instrument model (TM + PSS + ST-30 + SWA) or a report UI for it. A public service named "Talents Mapping" is seeded with `test_code = null`.

## 1. What already exists

### Test engine (retail, token-based)

| Piece | Where | What it actually does |
|---|---|---|
| Session | `test_sessions` in `db/schema.ts` | One row per issued attempt. `test_code` is a `varchar(50)`, not a foreign key. Tokens are `varchar(36)`. Status defaults to `issued`. Columns cover confirm attempts, lock, expiry, start, complete |
| Identity gate | `app/(test)/tes/[token]`, `POST /api/test-sessions/confirm` | Last 4 digits of `customers.whatsapp_number`. Three failures lock the session and set `locked_at` |
| Question runner | `components/test/TestEngine.tsx` | One string answer per item, auto-advance, previous/next. Posts to `POST /api/test-responses` |
| Completion | `POST /api/test-sessions/complete` | Loads items by `test_code`, calls `computeResult`, inserts `test_results`, sets status `completed`, drops Redis `test:access:{token}`, caches the result. Scoring runs inside the route, not in an Upstash Workflow |
| Result page | `app/(test)/hasil/[resultToken]` | `generateMetadata` OG card, strengths/challenges lists, bar breakdown of `raw_scores`, client QR, `window.print()` via `PrintButton`. One layout for every test |
| Scoring | `lib/scoring/{mbti,disc,enneagram}.ts` plus `lib/scoring/index.ts` | Real functions for `MBTI`, `DISC`, `ENNEAGRAM`. Stubs via `genericScorer` for `STRENGTH30`, `PAPIKOSTIK`, `IQ`, `MGMT_STYLE`, `RIASEC`, `GAYA_BELAJAR` |
| Question bank | `test_items` | Keyed by `test_code` string. `options` and `scoring_meta` are JSONB. Seed inserts **two** MBTI items. No unique `(test_code, item_order)` |
| Admin | `/panel/test-sessions`, `/panel/test-items`, `/panel/test-results`, `/panel/scoring-rubrics` | Sessions and results read existing rows. Question bank lists up to 100 items with a non-functional Edit label. Scoring rubrics renders an empty `DataTable` |

There is no `master_tests`, `scoring_configs`, `test_norms`, `tm_results`, `service_package_tests`, `orders`, or `customer_test_access` table. Migrations on disk stop at `0001_puzzling_nicolaos` (ecourse, notifications, partnership, proposal leads).

### Catalog around tests

`service_packages.test_code` is a single nullable string. Seed sets it to `MBTI` only for the MBTI service. The Talents Mapping service (`slug: talents-mapping`) gets a package with `test_code: null`, so paying for it cannot open a test.

Customers have no password, date of birth, or gender. Checkout is `registrations` + `payments` (Xendit), not the product doc's `orders` / `order_items`. That is enough to sell a package and, after payment, issue a `test_sessions` row. It cannot express a bundle of three instruments (`service_package_tests`).

### Code names that do not match the product pack

| This repo | Product pack |
|---|---|
| `MBTI`, `DISC`, `ENNEAGRAM` (uppercase) | `mbti`, `disc`, `enneagram` |
| `STRENGTH30` stub | ST-30 is an instrument inside Talents Mapping, not a standalone `test_code` in the seed |
| `PAPIKOSTIK` | `papi` |
| `IQ` | `wpt` and `ist` are separate tests |
| `MGMT_STYLE` | `msdt` (and `msai` is a second leadership test) |
| `GAYA_BELAJAR` | not in the 12-test catalog |
| no `bigfive`, `talents_mapping`, `tech_js` scorer | all three are in the catalog |

`npm run test` is documented in `AGENTS.md` and is not a script in `package.json`. No `*.test.ts` files are in the repo.

## 2. Likely database changes

Principle for every later PR: **add tables and nullable columns. Do not rename or drop `test_sessions`.** Production and staging are separate Postgres databases. `drizzle.config.ts` migrates whichever database `DATABASE_URL_UNPOOLED` points at. Generating SQL in git does not apply it. Promoting a migration means running `npm run db:migrate` on staging and, separately, on production.

Drizzle stays migration-only. New queries go in `lib/queries/{model}.ts`. The admin question-bank page currently embeds SQL in the Server Component; new screens should not copy that.

### Add, mapped onto current Drizzle style (`bigserial`, `varchar` + check in SQL, JSONB)

These match the product schema and do not require the guide's UUID `users` / `assessment_sessions` model.

**`master_tests`**

| Column | Notes |
|---|---|
| `id` | `bigserial` PK |
| `code` | unique, lowercase (`mbti`, `talents_mapping`, …) |
| `name`, `category`, `description`, `instructions` | category is varchar, not a Postgres enum |
| `duration_sec`, `total_questions`, `is_active` | |
| timestamps | |

**`scoring_configs`**

`test_id` unique FK → `master_tests.id`, `formula_type` varchar, `config_data` jsonb. One row per test. Formula type is data; the implementation stays a pure function in `lib/scoring/`, same as today. Do not interpret JSON inside a route handler.

**`talent_themes`**, **`strength_activities`**, **`strength_typologies`**

Master data from the guide, with `bigserial` ids (the guide uses `SERIAL`; this repo uses `bigserial`). Columns:

- themes: `code` (3–5 chars, unique), `name`, `domain` varchar (include `Executing` until product picks one list), `description`, `suitable_roles` jsonb, `strengths`, `watch_out`
- activities: `code` unique (preserve spaces in names such as `MANUAL SKILL`), `name`, `cluster` nullable until the cluster map exists, `definition`
- typologies: `code` unique, `name`, `category`, `description`, `personal_branding`

**`tm_results`**

FK to existing `test_results.id` and `test_sessions.id` (the product schema points these at `customer_test_access`; this repo should point them at the session that already exists). JSONB columns: `talent_ranking`, `domain_distribution`, `strength_potentials`, `st30_scores`, `personal_branding`, `career_recommendations`. Unique on `session_id`.

**`test_norms`**

`test_id`, `age_group`, `raw_score`, `norm_score`, `label`, `description`. Required before IST can be scored. The seed file defines the table and inserts no rows.

**`service_package_tests`**

`(package_id, test_id)` PK plus `sort_order`. This is how a bundle (Karir Starter = MBTI + DISC + RIASEC, Talents Pro = TM + DISC + Big Five) is expressed. Keep `service_packages.test_code` for the current single-test packages until issuance reads the join table.

### Alter, carefully

| Change | Why | Risk |
|---|---|---|
| `test_items.test_id` nullable FK → `master_tests` | Product items belong to a test row. Today they only have `test_code` | Backfill from `code`. Do not drop `test_code` in the same migration |
| `test_sessions.test_id` nullable FK | Same | Existing rows use `MBTI`. Map to `mbti` in the backfill, keep the string column until every reader uses the FK |
| `test_results.customer_id`, `test_id`, `scored_by` default `'auto'`, `notes_by_admin` | Admin report screen in the Super Admin doc | Additive. `interpretation` stays JSONB and must not be logged |
| `test_responses.response_ms` | Guide and product schema both store it | Additive, nullable |
| `service_packages.is_bundle` boolean | Product seed | Additive |
| `customers.date_of_birth` | IST norms need age. Product schema also has gender, photo, password | Add date of birth only when IST is in scope. Do not add `password_hash` in a test-catalog migration |
| Unique `(test_items.test_code, item_order)` or `(test_id, item_order)` | Seed currently calls `onConflictDoNothing()` with no unique target, so re-seed can duplicate items | Add the unique index only after a duplicate check |

### Do not add in the Talents Mapping work

| Product / guide object | Why it stays out |
|---|---|
| `orders`, `order_items` replacing `registrations` | Checkout already works. A second order model is a payment migration, not a test migration |
| `customer_test_access` with `UNIQUE (customer_id, test_id)` | Blocks the repo rule that a retake is a **new** `test_sessions` row. Completed sessions are never moved back to `issued` / `in_progress` |
| Guide tables `users`, `assessment_sessions`, `tm_answers`, `pss_answers`, `st30_answers`, `talent_rankings`, `domain_distribution`, `strength_potentials`, `st30_scores`, `career_recommendations` as row-per-score tables | Duplicates `test_responses` and `tm_results`. The product schema already chose one JSONB report row |
| `customers.password_hash`, customer login | Contradicts the live magic-link flow in TRD §15 |
| Stored PDF blob for results | Repo rule: print from the browser |

### How a Talents Mapping attempt should sit on the current session

One `test_sessions` row per purchased `talents_mapping` access, same tokens and the same confirm/lock rules. The 170 statements, 114 activities, and 30 typology prompts are `test_items` distinguished by `section` (`tm`, `pss`, `st30`), or three child sessions created together if product wants separate expiry. Child sessions are a later choice. The first scoring slice only needs the 170 statements.

`result_token` stays permanent. Revoke and lock still delete `test:access:{access_token}`.

## 3. Likely API and server changes

Keep handlers thin. SQL stays in `lib/queries`. Scoring stays pure and unit-tested.

| Surface | Change |
|---|---|
| `lib/scoring/index.ts` | Dispatch on lowercase `master_tests.code`. Register `talents_mapping` only after the rank function exists. Leave unknown codes throwing, as today |
| `lib/scoring/talents-mapping.ts` | Input: responses + items. Output: the existing `TestResultPayload` plus a `tm_results` object. No DB import. First version: sum Likert per theme, sort, assign the five rank bands. Do not compute PSP colors, ST-30 signed scores, or careers until the missing maps exist |
| `lib/scoring/bigfive.ts`, `riasec.ts`, `papi.ts`, `wpt.ts`, `msdt.ts`, `msai.ts` | One file per formula type, matching the product table. `ist` waits on norms **and** date of birth |
| `POST /api/test-sessions/complete` | After `createTestResult`, if code is `talents_mapping`, insert `tm_results` in the same request **or** move both writes into the workflow the TRD already specifies. Today scoring is inline. A TM report should not add more inline side effects (WhatsApp, PDF) |
| `POST /api/test-responses` | Stay one upsert plus Redis. Likert values are still a string (`"1"`…`"5"`). DISC Most/Least needs a defined encoding (for example `most:A|least:C`) agreed before that widget ships. Do not add scoring here |
| `lib/queries/test-items.ts` | List by `test_id` or `test_code`, ordered. Admin import validates unique `item_order` and refuses deletes when `test_responses` exist (Super Admin doc rule) |
| `lib/queries/master-tests.ts`, `scoring-configs.ts`, `tm-results.ts` | list / get / create / update. List endpoints never return `access_token` or `result_token` |
| Issuance after payment | Read `service_package_tests` when present, otherwise `service_packages.test_code`. One session per test in a bundle. A new attempt is a new session row |
| Admin actions | Edit scoring JSON, simulate scoring with dummy answers, edit `notes_by_admin` without rewriting `raw_scores`. Re-score writes a new result only if product explicitly allows it; it must not reopen a completed session |
| Validators | Zod in `lib/validators/`. Likert 1–5, DISC pair, theme code enum from `talent_themes` |

WhatsApp copy stays a short `wa_summary_text` plus the permanent result URL. The product example is a two-or-three sentence summary, not the full report.

## 4. Likely front-end flows

### Take a test

`/tes/[token]` already confirms identity and then renders `TestEngine`. Extend the engine rather than adding a second app:

1. Instructions from `master_tests.instructions` before the first item.
2. Likert control for scale items (TM, PSS, Big Five, Enneagram). Single-select A/B stays for MBTI-style pairs.
3. Section intro screens when `section` changes (`tm` → `pss` → `st30`). The guide's flow is sequential: 170 statements (about 30–40 minutes, random order), then 114 activities by cluster, then 30 typology descriptions.
4. DISC block: two picks, Most and Least, cannot be the same option.
5. WPT: a 12-minute timer. IST: nine timed subtests plus an age check against `customers.date_of_birth`.
6. Autosave already exists per answer. Restore `current` from saved responses so a refresh does not restart at item 1 (the engine today keeps answers only in React state).

SWA has no screen until the five questions exist.

### Result report

`/hasil/[resultToken]` branches on `test_code`.

Shared chrome stays: print stylesheet, client QR of the result URL, no server PDF, `generateMetadata` that does not leak interpretation text into logs. OG title can show the headline type (`result_type`) the way it already shows `test_code`.

**Talents Mapping page**, only the blocks whose data exists:

- Ranked 34 themes with the five colors.
- Domain counts. If Executing is still an open product question, show the stored domain and do not collapse it.
- PSS / cluster map, ST-30 bars, personal branding, career list: render when `tm_results` has those arrays, otherwise omit the section. Do not fake scores.
- The guide asks for radar, heatmap, and social share. Charts can wait until the rank list is correct. Share must not widen who can see psychological data beyond the unguessable `result_token` URL that already exists.

**PSS and ST-30** are sections of that report, not separate public URLs, unless a package sells them alone. The product seed does not sell them alone.

**Other tests** reuse the current page until a type needs a specific graphic (DISC wheel, OCEAN radar, PAPI 0–9 profile, WPT band). The generic bar list is an acceptable placeholder for a first slice of Big Five or RIASEC.

### Admin

The Super Admin doc's test section maps onto nav that already exists:

| Doc screen | Current page | Gap |
|---|---|---|
| Daftar alat tes | none | New `/panel/master-tests` using `DataTable`. Code immutable once responses exist. Inactive tests stay playable for sessions already issued |
| Bank soal | `/panel/test-items` | Filter by test, real edit form, CSV preview-then-import, drag reorder, block delete when responses exist. Update `total_questions` |
| Scoring config | `/panel/scoring-rubrics` (empty) | One JSON row per test, formula dropdown, simulate panel |
| Tabel norma | none | `/panel/test-norms`, IST age groups, CSV import |
| Semua hasil | `/panel/test-results` | Join customer and test name. Show `scored_by`. Notes field. Restrict rows to `super_admin` and `cs_admin` as already required |
| Hasil Talents Mapping | none | Detail view of `tm_results` for one session. No `raw_scores` in application logs |

Bundle editing belongs on service packages: multi-select of `master_tests` into `service_package_tests`, `is_bundle` when the count is greater than one.

## 5. Seed and master data

Idempotent inserts in `db/seed.ts`, keyed on natural unique columns (`master_tests.code`, theme `code`, activity `code`, typology `code`). Do not copy the sample customer, order, or password-hash rows from the uploaded seed.

| Data | In the uploads? | Safe to seed now? |
|---|---|---|
| 12 `master_tests` rows (code, name, category, duration, question count, instructions) | yes | yes |
| `scoring_configs.formula_type` labels and empty or obviously-marked draft `config_data` | formula names yes; MBTI key JSON is internally inconsistent | store the type, not the sample MBTI key, until keys are reviewed |
| 34 themes (code, name, domain from the per-theme table) | yes | yes, with the domain conflict called out in a comment |
| 114 activity names | yes, with definitions | names and definitions yes; `cluster` null |
| 30 typology names and short descriptions | yes | yes |
| 170 TM statement texts | **no.** Two sample items only | blocked on content from the rights holder |
| Theme → activity weights (PSP) | **no** | blocks strength potentials |
| Activity → cluster for all 114 | **no** (only 14 examples) | blocks the cluster map |
| ST-30 scoring formula | **no** (and the two docs disagree on whether the user answers it) | blocks ST-30 numbers |
| SWA questions | **no** | out of scope |
| Full banks for the other 11 tests | two items each for MBTI, DISC, TM, WPT, Big Five | runner can be demoed; retail launch needs the real banks |
| IST norms by age | table described, zero rows | blocks IST |
| Package links for MBTI, DISC, TM, Big Five, Enneagram, RIASEC, PAPI, WPT, plus two bundles | yes, in product seed | yes, after `master_tests` exists. Set the existing Talents Mapping package's `test_code` to `talents_mapping` |
| Career copy per dominant theme | guide has a table | content review before it is shown to customers |

Customer-facing seed copy stays Bahasa Indonesia. Codes and comments stay English.

## 6. Migration risk checklist (before any PR merges to `main`)

This document does not migrate anything. The checklist is for the first PR that changes `db/schema.ts`.

1. Migration is generated with `npm run db:generate` and committed. It is not applied from this analysis branch.
2. SQL is additive: new tables, nullable columns, new indexes. No `DROP`, no rewrite of `test_sessions.status`, no change to token uniqueness.
3. Apply on the **staging** database first (`DATABASE_URL_UNPOOLED` for that Neon branch). Run the app against staging. Only then apply the same migration files to **production**. The two databases do not share a migration run.
4. Confirm `drizzle.__drizzle_migrations` (or the journal Drizzle uses) on each database matches `db/migrations/meta/_journal.json` before migrating. A database that was created outside these files will not match a fresh `0002`.
5. Backfill `test_id` from `test_code` with an explicit map (`MBTI` → `mbti`). Fail the migration check if any live `test_code` is unmapped, rather than inserting a guessed row.
6. Duplicate `(test_code, item_order)` rows must be resolved before a unique index is added.
7. Completed sessions stay completed. The migration must not `UPDATE test_sessions SET status = 'issued'` or clear `confirm_attempts`.
8. No Redis flush is required for an additive catalog migration. A later revoke/lock change must still delete `test:access:{access_token}`.
9. Seed after migrate, and seed must be re-runnable. Explicit `id` values in the uploaded seed will collide with sequences; the app seed should omit ids and use `ON CONFLICT (code)`.
10. `test_results.interpretation` and `tm_results` payloads are confidential. Admin list queries for the new screens stay behind `super_admin` and `cs_admin`.
11. Rollback plan is "do not drop the new tables in production if any `tm_results` row exists." Practice rollback only on staging.
12. Do not point `drizzle.config.ts` at production while developing the migration.

## 7. Suggested implementation phases

Ordered so each slice is shippable and does not pretend missing formulas exist.

### Phase A — Catalog only (first implementation slice)

No change to `/tes` or `/hasil`.

- Drizzle tables: `master_tests`, `scoring_configs`, `talent_themes`, `strength_activities`, `strength_typologies`.
- Seed the 12 tests, 34 themes, 114 activity names, 30 typologies, and formula-type labels.
- Nullable `test_items.test_id` / `test_sessions.test_id` backfill, string `test_code` kept.
- Point the existing Talents Mapping package at `talents_mapping`.
- Admin list of master tests (read-only is enough).
- Migration applied to staging only until the production checklist in section 6 is done.

This is the smallest slice that is not blocked by missing question text.

### Phase B — TM statements and a rank report

Blocked until the 170 statement wordings are provided.

- Items in `test_items` with `section = 'tm'`, five per theme, `score_key` = theme code, `score_val` = 1–5.
- Likert control and progress restore in `TestEngine`.
- `lib/scoring/talents-mapping.ts` plus unit tests: ranking and bands only.
- `tm_results.talent_ranking` and `domain_distribution`.
- Result page section for that ranking. Print stylesheet covers it.
- Session rules unchanged: new row to re-issue, lock clears Redis, completed is terminal.

### Phase C — The rest of the TM report, still without invented math

- Seed cluster and PSP weights when product supplies them.
- PSS items (114) and ST-30 prompts (30) as later sections on the same session.
- Fill `strength_potentials`, `st30_scores`, `personal_branding` only from a formula that product has signed off. Until then the UI hides those blocks.
- SWA stays unbuilt.

### Phase D — Other retail tests, one formula at a time

Suggested order, because the runner work differs:

1. Big Five and Enneagram (Likert, same widget as Phase B). Enneagram scorer exists but the bank does not, and the code is uppercase.
2. RIASEC (like / dislike or Likert).
3. MBTI bank completion to 93 items, lowercase code, reviewed keys. The current scorer can stay if the bipolar counts match the product doc.
4. DISC Most/Least widget.
5. PAPI pairs, MSDT pairs.
6. WPT timer and correct-count.
7. MSAI dual rating.
8. IST only with norms CSV and date of birth.
9. `tech_js` last; it has no formula in the pack.

Normalize stub codes (`PAPIKOSTIK`, `IQ`, `MGMT_STYLE`, `STRENGTH30`, `GAYA_BELAJAR`) when those packages are real, not before.

### Phase E — Admin authoring and bundles

- Question import, scoring JSON editor, simulate scoring, norms import.
- `service_package_tests` and `is_bundle`.
- Issuance creates one session per test in the bundle.
- TM admin detail and `notes_by_admin`.

### Explicitly later, not part of this feature

Customer passwords, replacing registrations with orders, Midtrans, stored PDFs, promo codes, and the guide's UUID schema.

## 8. Invariants this work must keep

- A completed `test_sessions` row is never set back to `issued`, `confirming`, or `in_progress`.
- Lock and revoke delete the Redis access key.
- `result_token` does not expire.
- List APIs do not return either token.
- Scoring modules do not import `lib/db.ts`.
- Result pages are not rendered to PDF on the server.
