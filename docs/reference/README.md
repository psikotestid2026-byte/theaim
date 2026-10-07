# Reference extracts for Talents Mapping and additional tests

These notes were copied from the product pack reviewed on 7 Oct 2026 so later implementation PRs do not depend on chat uploads. They are extracts, not a second schema source of truth.

The running schema remains `db/schema.ts`, generated from Drizzle and applied with `npm run db:migrate` against `DATABASE_URL_UNPOOLED`. Staging and production are separate databases. A migration that lands on `main` still has to be applied to each database when that environment is promoted.

## What is here

| File | Contents |
|---|---|
| `test-catalog-and-tm-instruments.md` | The 12 retail test codes, formula types, Talents Mapping instrument counts, and the `tm_results` JSON shape from the product schema |

## What was left out on purpose

- Password hashes and sample customer rows from the seed SQL.
- The full personal Talents Mapping report used as a worked example. A PDF of that report already lives under `refs/` and should not be duplicated.
- The 34 theme essays, career-recommendation copy, and the 114 activity definitions. Names and codes are enough to plan tables. Narrative copy stays with the rights holder until it is seeded.
- The Talents Mapping guide's standalone PostgreSQL sketch (`users` UUID, `assessment_sessions`, per-answer tables). It conflicts with both the product schema (`BIGSERIAL`, `tm_results` JSONB) and this repo (`test_sessions` magic links). Do not migrate toward that sketch.
