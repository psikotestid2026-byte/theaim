-- Staging only. Idempotent MSAI section headers and scale labels.
-- Q61-Q73 effectiveness, Q74-Q75 career statements, Q76-Q87 importance.
-- Safe to re-run. Does not change question text or session rows.
BEGIN;

UPDATE test_items
SET section = 'actual',
    options = '[{"value":"1","label":"Sangat Tidak Setuju"},{"value":"2","label":"Tidak Setuju"},{"value":"3","label":"Netral"},{"value":"4","label":"Setuju"},{"value":"5","label":"Sangat Setuju"}]'::jsonb,
    scoring_meta = COALESCE(scoring_meta, '{}'::jsonb) || '{"msai_block":"actual"}'::jsonb,
    updated_at = now()
WHERE test_code = 'msai' AND item_order BETWEEN 1 AND 60;

UPDATE test_items
SET section = 'effectiveness',
    options = '[{"value":"1","label":"Buruk"},{"value":"2","label":"Di bawah rata-rata"},{"value":"3","label":"Rata-rata"},{"value":"4","label":"Di atas rata-rata"},{"value":"5","label":"Luar Biasa"}]'::jsonb,
    scoring_meta = COALESCE(scoring_meta, '{}'::jsonb) || '{"msai_block":"effectiveness"}'::jsonb,
    updated_at = now()
WHERE test_code = 'msai' AND item_order BETWEEN 61 AND 73;

UPDATE test_items
SET section = 'career',
    options = '[{"value":"1","label":"Tidak lebih tinggi dari posisi saat ini"},{"value":"2","label":"Satu tingkat di atas posisi saat ini"},{"value":"3","label":"Sampai posisi senior (tim manajemen senior)"},{"value":"4","label":"Mendekati puncak, tepat di bawah CEO"},{"value":"5","label":"Sampai puncak organisasi"}]'::jsonb,
    scoring_meta = COALESCE(scoring_meta, '{}'::jsonb) || '{"msai_block":"career"}'::jsonb,
    updated_at = now()
WHERE test_code = 'msai' AND item_order = 74;

UPDATE test_items
SET section = 'career',
    options = '[{"value":"1","label":"Di paruh bawah dibanding manajer lain"},{"value":"2","label":"Termasuk 50% teratas"},{"value":"3","label":"Termasuk 25% teratas"},{"value":"4","label":"Termasuk 10% teratas"},{"value":"5","label":"Termasuk 5% teratas"}]'::jsonb,
    scoring_meta = COALESCE(scoring_meta, '{}'::jsonb) || '{"msai_block":"career"}'::jsonb,
    updated_at = now()
WHERE test_code = 'msai' AND item_order = 75;

UPDATE test_items
SET section = 'importance',
    options = '[{"value":"1","label":"Kurang Penting"},{"value":"2","label":"Cukup Penting"},{"value":"3","label":"Penting"},{"value":"4","label":"Sangat Penting"},{"value":"5","label":"Sangat Kritikal"}]'::jsonb,
    scoring_meta = COALESCE(scoring_meta, '{}'::jsonb) || '{"msai_block":"importance"}'::jsonb,
    updated_at = now()
WHERE test_code = 'msai' AND item_order BETWEEN 76 AND 87;

DO $$
DECLARE
  n int;
BEGIN
  SELECT count(*) INTO n FROM test_items WHERE test_code = 'msai' AND section = 'actual' AND item_order BETWEEN 1 AND 60;
  IF n <> 60 THEN RAISE EXCEPTION 'MSAI actual expected 60, found %', n; END IF;
  SELECT count(*) INTO n FROM test_items WHERE test_code = 'msai' AND section = 'effectiveness' AND item_order BETWEEN 61 AND 73;
  IF n <> 13 THEN RAISE EXCEPTION 'MSAI effectiveness expected 13, found %', n; END IF;
  SELECT count(*) INTO n FROM test_items WHERE test_code = 'msai' AND section = 'career' AND item_order IN (74, 75);
  IF n <> 2 THEN RAISE EXCEPTION 'MSAI career expected 2, found %', n; END IF;
  SELECT count(*) INTO n FROM test_items WHERE test_code = 'msai' AND section = 'importance' AND item_order BETWEEN 76 AND 87;
  IF n <> 12 THEN RAISE EXCEPTION 'MSAI importance expected 12, found %', n; END IF;
  SELECT count(*) INTO n FROM test_items
  WHERE test_code = 'msai' AND item_order = 74 AND options->0->>'label' = 'Tidak lebih tinggi dari posisi saat ini';
  IF n <> 1 THEN RAISE EXCEPTION 'MSAI Q74 options were not replaced'; END IF;
END $$;

COMMIT;
