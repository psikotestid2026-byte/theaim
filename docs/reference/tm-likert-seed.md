# Talents Mapping Likert seed (TheAIM original)

The 170 stems live in `db/seed-data/tm-likert-items.ts`. `db/seed.ts` upserts them onto `test_items` by `(test_code, item_order)` for `talents_mapping`. An existing row is updated in place. A missing row is inserted. The seed does not delete rows.

## Staging status

The bank was first applied to Neon staging `ep-noisy-shadow` only. Production is a separate database.

## Scoring map

- Likert 1–5 (Sangat tidak sesuai … Sangat sesuai), polarity positive
- Sum 5 items per `scoring_meta.theme_code` → theme_total
- Rank 34 themes by theme_total DESC (tie: theme_code ASC)
- Bands: 1–7 dominant/red, 8–14 supporting/yellow, 15–20 neutral/white, 21–27 weak/gray, 28–34 least/black

## Not included

- ST-30 theme→typology formula
- SWA items
- Official Gallup 170 statements (proprietary; intentionally not copied)

## Authorship

All 170 stems are TheAIM-authored Indonesian adaptations for a Talents Mapping-style assessment. They are not Gallup CliftonStrengths item text.
