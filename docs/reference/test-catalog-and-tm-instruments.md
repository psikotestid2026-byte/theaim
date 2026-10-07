# Test catalog and Talents Mapping instruments

Source: TheAIM product document, Super Admin panel document, platform schema SQL, platform seed SQL, and the Talents Mapping implementation guide (v2.0.0). Where those sources disagree, the disagreement is listed at the bottom.

The catalog seed stores the product seed's `scoring_configs.config_data` for formulas that JSON defines. An approved RuangTes overlap export then replaces ten of those rows (`mbti_scale`, `disc_matrix`, `bigfive_matrix`, `enneagram_scale`, `riasec_scale`, `papi_scale`, `matching_key`, `ist_scale`, `msdt_scale`, `msai_scale`) and loads the matching question banks into `test_items` under the lowercase code. `talents_mapping` stays on `tm_rank_scale`. The uppercase `MBTI` demo items are not deleted.

`test_norms` holds the flat IST, DISC, and WPT rows from that export. Identical copies are collapsed. `age_group` is null because the export has no age column. IST age tables remain inside `scoring_configs.config_data` for `ist_scale`.

## Still absent after the enrichment seed

Searched the guide, the product doc, the admin doc, the schema SQL, and the seed SQL.

| Item | What the files actually contain |
|---|---|
| Official Gallup 170 statement texts | Not present, and not copied. `db/seed-data/tm-likert-items.ts` is a separate TheAIM-authored Likert bank (5 stems × 34 themes) upserted onto `test_items` |
| ST-30 scoring formula or theme-to-typology map | Not present. Product text says `tm_rank_scale` "generates" ST-30. The guide's flow is a 1–5 self-rating. Sample scores are signed. No formula JSON exists |
| SWA questions | Not present. Named once as "Seven Working Area — 5 pertanyaan wilayah kerja", plus `SWA` in a CHECK list. No question text |
| Activity cluster for the other 100 activities | Not present. Only COMMUNICATING, GREETING, MOTIVATING, SERVING, SPIRITUALIZING, SUPPORTING, TRAINING, ENTERTAINING, TEACHING, INFLUENCING, ADVISING, PRESENTING, SELLING, VOLUNTEERING have a cluster, from the worked example |
| Theme `strengths` and `watch_out` | Not labeled on the 34 theme sections. One API sketch for SIG includes both strings; that sketch does not match the SIG section and is not seeded. Tips Manajemen exists for all 34 and is not stored (no column, and it is not `watch_out`) |
| Typology category and personal branding for the other 25 codes | Not present. Five codes only: COM, SER, SEL, MOT, EDU |
| IST norm rows in the original product pack | Not present there. The later RuangTes overlap export supplies flat `test_norms` rows for IST, DISC, and WPT |
| `tech_js` formula | Not present |

## Twelve retail instruments

Codes are lowercase in the product seed. This repo currently stores `MBTI` in uppercase on `service_packages.test_code`, `test_sessions.test_code`, and `test_items.test_code`.

| Code | Name | Category | Items | Duration | `formula_type` in seed | Seeded scoring row |
|---|---|---|---|---|---|---|
| `wpt` | Wonderlic Personnel Test | COGNITIVE | 50 | 12 min | `wpt_correct_count` | yes |
| `ist` | Intelligenz Struktur Test | COGNITIVE | 176 (9 subtests) | 90 min | `ist_norms` (named in the product doc, no JSON in the seed) | draft marker only |
| `mbti` | Myers-Briggs Type Indicator | PERSONALITY | 93 | 15 min | `mbti_bipolar` | yes, illustrative only |
| `disc` | DISC | PERSONALITY | 28 blocks | 10 min | `disc_most_least` | yes |
| `papi` | PAPI Kostick | PERSONALITY | 90 | 15 min | `papi_scale` | yes |
| `bigfive` | Big Five OCEAN | PERSONALITY | 44 | 15 min | `bigfive_matrix` | yes |
| `enneagram` | Enneagram | PERSONALITY | 180 | 20 min | `enneagram_scale` | yes |
| `talents_mapping` | Talents Mapping® | PERSONALITY | 170 TM statements | 40 min | `tm_rank_scale` | yes, rank bands only |
| `riasec` | Holland RIASEC | VOKASIONAL | 108 | 15 min | `riasec_scale` | yes |
| `msdt` | Management Style Diagnostic Test | LEADERSHIP | 80 | 20 min | `msdt_scale` | yes |
| `msai` | MSAI | LEADERSHIP | 90 | 20 min | `msai_scale` | yes |
| `tech_js` | Javascript & Node.js Developer Test | TECHNICAL | 40 | 30 min | none named | no |

`master_tests.category` values in the product schema: `PERSONALITY`, `COGNITIVE`, `LEADERSHIP`, `VOKASIONAL`, `TECHNICAL`, `GENERAL`.

Item `options` JSON in the product seed uses `{ value, label, score_key, score_val }`. That matches the shape already stored on `test_items.options` in this repo.

## Talents Mapping is four instruments, one stored report

The product seed has a single `master_tests` row, `talents_mapping`, with `total_questions = 170`. PSS, ST-30, and SWA are not separate catalog rows. The implementation guide treats them as four assessment types.

| Instrument | Count | Response | What the docs actually specify |
|---|---|---|---|
| TM | 170 statements, 5 per theme, presented in random order | Likert 1–5 | Rank 34 themes. Bands: 1–7 dominant/red, 8–14 supporting/yellow, 15–20 neutral/white, 21–27 weak/grey, 28–34 very weak/black |
| PSS | 114 activities in 8 clusters | Likert 1–5, optional comment | Outer-box color (red / yellow / white / black). Numeric cutoffs are not specified |
| ST-30 | 30 typologies | Guide: self-rating 1–5. Product formula text: "generate ST-30" from TM scoring | Published sample scores run from about −25 to +91, so they are not raw 1–5 sums. The formula is not specified |
| SWA | "5 pertanyaan wilayah kerja" | not specified | Mentioned once. No question text, no answer table, no column on `tm_results` |

### 34 theme codes

`ACH ACT ADA ANA ARR BEL CMD COM CMP CON CST CTX DEL DEV DIS EMP FOC FUT HAR IDE INC IND INP INT LRN MAX POS REL RES RST SAU SIG STR WOO`

The per-theme table in the guide assigns each code a domain of Striving, Thinking, Relating, Influencing, or **Executing**. A later "4 kelompok" section drops Executing, moves some Executing themes into Striving, and lists Self-Assurance and Significance under two domains. The worked example still labels six themes as Executing (`RES ARR RST DEL CST DIS`). Store the per-theme domain, including Executing, until product confirms a single membership list.

### Eight activity clusters

Reasoning, Elementary, Networking, Generating Idea, Servicing, Headman, Technical, Thinking.

The guide lists all 114 activity names and a one-line definition for each. It does **not** assign a cluster to each activity. Cluster labels exist only for the 14 activities in the worked example. PSP (inner box) requires a theme-to-activity weight map. That map is not in any uploaded file, so `strength_potentials` cannot be computed from TM answers alone.

Activity names, in guide order:

`ACTING, ADVERTISING, ADVISING, ANALYSING, ANIMATING, APPRAISING, ASSEMBLING, ASSISTING, AUDITING, BEAUTIFYING, BOOKEEPING, BROKERING, BUDGETING, BUILDING, CARING, CASHIERING, COACHING, COLLECTING, COMMUNICATING, COMPLIANCING, CONCEPTUALIZING, CONSERVING, CONSULTING, CONTROLLING, COOKING, COOPERATING, COORDINATING, CORRESPONDING, COSTING, COUNSELING, CREATING, DANCING, DELIVERING, DESIGNING, DEVELOPING, DIAGNOSING, DISPATCHING, DISTRIBUTING, DRAFTING, DRAMATIZING, EDITING, ENTERTAINING, ESTIMATING, EVALUATING, FILING, FINISHING, GREETING, GUIDING, HOUSEKEEPING, IDEATING, IDENTIFYING, INFLUENCING, INFORMING, INSPECTING, INSTALLING, INTERPRETING, INTERROGATING, INTERVIEWING, INVESTIGATING, LIAISING, MAINTAINING, MANUAL SKILL, MARKETING, MEDIATING, MENTORING, MODELLING, MONITORING, MOTIVATING, MUSICAL ART, NEGOTIATING, OBSERVING, OPERATING, ORGANISING, PHYSICAL SKILL, PLANNING, PLANTING, PRESENTING, PRODUCING, PROGRAMMING, PUBLICIZING, PURCHASING, RECRUITING, REDACTING, RELATING, REPORTING, REPRESENTING, RESEARCHING, RESTORING, REVIEWING, SAFEKEEPING, SCHEDULING, SECURING, SELLING, SERVING, SINGING, SPIRITUALIZING, SPORT, STRATEGIZING, SUPPORTING, SURVEYING, SYNTHESIZING, TEACHING, TENDING ANIMAL, TESTING, THERAPIES, TRAINING, TRANSCRIBING, TRANSLATING, TYPEWRITING, VERIFYING, VISIONING, VISUAL ART, VOLUNTEERING, WRITING`

Several names contain spaces (`MANUAL SKILL`, `MUSICAL ART`, `PHYSICAL SKILL`, `TENDING ANIMAL`). A `code` column should keep them stable rather than slugifying silently.

### ST-30 codes

`ADM AMB ANA ARR CAR CMD COM CRE DES DIS EDU EVA EXP INT JOU MAR MED MOT OPE PRO QCA RES SAF SLC SEL SER STR SYN TRE VIS`

Names: Administrator, Ambassador, Analyst, Arranger, Caretaker, Commander, Communicator, Creator, Designer, Distributor, Educator, Evaluator, Explorer, Interpreter, Journalist, Marketer, Mediator, Motivator, Operator, Producer, Quality Controller, Restorer, Safekeeper, Selector, Seller, Server, Strategist, Synthesizer, Treasurer, Visionary.

Personal branding is the top five typologies, each with a one-paragraph description. The guide gives five sample paragraphs and no general template beyond that.

## Product `tm_results` columns

One row per completed access. All payloads are JSONB:

| Column | Shape described in the product schema |
|---|---|
| `talent_ranking` | `[{ rank, code, domain, level }]` for all 34 themes |
| `domain_distribution` | `{ Influencing: { count, dominant_count }, ... }` |
| `strength_potentials` | top 14 activities with cluster and PSP/PSS colors |
| `st30_scores` | `[{ code, name, score }]` for 30 typologies |
| `personal_branding` | top 5 `{ typology, description }` |
| `career_recommendations` | `[{ title, match_score, industry }]` |

`test_results` still holds the generic row (`raw_scores`, `result_type`, `result_label`, `interpretation`, `wa_summary_text`, `scored_by`, `notes_by_admin`). For TM, `result_type` / `result_label` are a short headline (the guide's example headline is the five branding names). The long report lives in `tm_results`.

## Answer widgets the current runner does not have

The live `TestEngine` stores one string per item and advances on a single click. The product formats that need a different control:

- Likert 1–5 (TM, Big Five, Enneagram, PSS, ST-30 self-rating).
- DISC Most and Least inside one block (two selections, `disc_most_least`).
- Forced-choice pairs (MBTI, PAPI, MSDT) — the current A/B buttons can carry this if each option has `score_key`.
- WPT / IST correct-count with a per-section timer. IST also requires the participant's age for `test_norms`.
- MSAI importance-versus-effectiveness (two ratings per competency).

## Open conflicts inside the uploaded pack

1. **ST-30 origin.** The guide's user flow asks the participant to rate 30 descriptions. The product auto-score section says `tm_rank_scale` generates ST-30. Sample scores are signed and larger than a 1–5 scale. Do not invent the formula.
2. **Domain membership.** Per-theme table and the worked example use five labels including Executing. Section 4 of the guide and product section 10 describe four domains and disagree with the per-theme table on several codes.
3. **PSS / PSP colors.** The color legend is specified. The numeric rule that paints an activity red, yellow, white, grey, or black is not.
4. **SWA.** Named, not specified.
5. **PDF.** The product doc asks for a stored PDF file. This repo's rule is browser `window.print()` on `/hasil/[resultToken]`, with no server-side PDF for test results.
6. **Identity.** The product schema adds `customers.password_hash` and an orders model. This repo issues a magic `access_token` / `result_token` pair and confirms the last four digits of WhatsApp. Those token rules stay in force (see the gap analysis).
7. **Seed MBTI keys.** The sample `mbti_bipolar` JSON reuses item numbers across poles (the F list overlaps the E list: 41, 46, 51, 56, 61, 66, 71, 76, 81, 86, 91). It is stored unchanged because the seed task asked for the published JSON. It is not a reviewed answer key.
