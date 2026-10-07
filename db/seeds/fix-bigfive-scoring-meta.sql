-- Staging only. Idempotent Big Five dimension keys for the stored Indonesian stems.
-- Safe to re-run. Does not change question text, options, tokens, or session status.
BEGIN;

UPDATE test_items
SET scoring_meta = COALESCE(scoring_meta, '{}'::jsonb) || '{"dimension":"N","reversed":false}'::jsonb,
    updated_at = now()
WHERE test_code = 'bigfive'
  AND regexp_replace(lower(regexp_replace(btrim(question_text), '\s+', ' ', 'g')), '\.+$', '') = 'saya mudah cemas';

UPDATE test_items
SET scoring_meta = COALESCE(scoring_meta, '{}'::jsonb) || '{"dimension":"E","reversed":false}'::jsonb,
    updated_at = now()
WHERE test_code = 'bigfive'
  AND regexp_replace(lower(regexp_replace(btrim(question_text), '\s+', ' ', 'g')), '\.+$', '') = 'saya ramah dan mudah bergaul';

UPDATE test_items
SET scoring_meta = COALESCE(scoring_meta, '{}'::jsonb) || '{"dimension":"C","reversed":false}'::jsonb,
    updated_at = now()
WHERE test_code = 'bigfive'
  AND regexp_replace(lower(regexp_replace(btrim(question_text), '\s+', ' ', 'g')), '\.+$', '') = 'saya suka menjaga kerapian';

UPDATE test_items
SET scoring_meta = COALESCE(scoring_meta, '{}'::jsonb) || '{"dimension":"N","reversed":false}'::jsonb,
    updated_at = now()
WHERE test_code = 'bigfive'
  AND regexp_replace(lower(regexp_replace(btrim(question_text), '\s+', ' ', 'g')), '\.+$', '') = 'saya mudah marah';

UPDATE test_items
SET scoring_meta = COALESCE(scoring_meta, '{}'::jsonb) || '{"dimension":"O","reversed":false}'::jsonb,
    updated_at = now()
WHERE test_code = 'bigfive'
  AND regexp_replace(lower(regexp_replace(btrim(question_text), '\s+', ' ', 'g')), '\.+$', '') = 'saya memiliki imajinasi yang kaya';

UPDATE test_items
SET scoring_meta = COALESCE(scoring_meta, '{}'::jsonb) || '{"dimension":"N","reversed":true}'::jsonb,
    updated_at = now()
WHERE test_code = 'bigfive'
  AND regexp_replace(lower(regexp_replace(btrim(question_text), '\s+', ' ', 'g')), '\.+$', '') = 'saya tenang dalam menghadapi tekanan';

UPDATE test_items
SET scoring_meta = COALESCE(scoring_meta, '{}'::jsonb) || '{"dimension":"E","reversed":true}'::jsonb,
    updated_at = now()
WHERE test_code = 'bigfive'
  AND regexp_replace(lower(regexp_replace(btrim(question_text), '\s+', ' ', 'g')), '\.+$', '') = 'saya cenderung pendiam';

UPDATE test_items
SET scoring_meta = COALESCE(scoring_meta, '{}'::jsonb) || '{"dimension":"C","reversed":true}'::jsonb,
    updated_at = now()
WHERE test_code = 'bigfive'
  AND regexp_replace(lower(regexp_replace(btrim(question_text), '\s+', ' ', 'g')), '\.+$', '') = 'saya bisa ceroboh';

UPDATE test_items
SET scoring_meta = COALESCE(scoring_meta, '{}'::jsonb) || '{"dimension":"A","reversed":false}'::jsonb,
    updated_at = now()
WHERE test_code = 'bigfive'
  AND regexp_replace(lower(regexp_replace(btrim(question_text), '\s+', ' ', 'g')), '\.+$', '') = 'saya sangat sabar';

UPDATE test_items
SET scoring_meta = COALESCE(scoring_meta, '{}'::jsonb) || '{"dimension":"O","reversed":true}'::jsonb,
    updated_at = now()
WHERE test_code = 'bigfive'
  AND regexp_replace(lower(regexp_replace(btrim(question_text), '\s+', ' ', 'g')), '\.+$', '') = 'saya tidak terlalu tertarik pada seni';

UPDATE test_items
SET scoring_meta = COALESCE(scoring_meta, '{}'::jsonb) || '{"dimension":"N","reversed":false}'::jsonb,
    updated_at = now()
WHERE test_code = 'bigfive'
  AND regexp_replace(lower(regexp_replace(btrim(question_text), '\s+', ' ', 'g')), '\.+$', '') = 'saya sering khawatir';

UPDATE test_items
SET scoring_meta = COALESCE(scoring_meta, '{}'::jsonb) || '{"dimension":"E","reversed":false}'::jsonb,
    updated_at = now()
WHERE test_code = 'bigfive'
  AND regexp_replace(lower(regexp_replace(btrim(question_text), '\s+', ' ', 'g')), '\.+$', '') = 'saya penuh energi';

UPDATE test_items
SET scoring_meta = COALESCE(scoring_meta, '{}'::jsonb) || '{"dimension":"C","reversed":false}'::jsonb,
    updated_at = now()
WHERE test_code = 'bigfive'
  AND regexp_replace(lower(regexp_replace(btrim(question_text), '\s+', ' ', 'g')), '\.+$', '') = 'saya dapat diandalkan';

UPDATE test_items
SET scoring_meta = COALESCE(scoring_meta, '{}'::jsonb) || '{"dimension":"N","reversed":true}'::jsonb,
    updated_at = now()
WHERE test_code = 'bigfive'
  AND regexp_replace(lower(regexp_replace(btrim(question_text), '\s+', ' ', 'g')), '\.+$', '') = 'saya jarang sedih';

UPDATE test_items
SET scoring_meta = COALESCE(scoring_meta, '{}'::jsonb) || '{"dimension":"O","reversed":false}'::jsonb,
    updated_at = now()
WHERE test_code = 'bigfive'
  AND regexp_replace(lower(regexp_replace(btrim(question_text), '\s+', ' ', 'g')), '\.+$', '') = 'saya ingin tahu banyak hal';

UPDATE test_items
SET scoring_meta = COALESCE(scoring_meta, '{}'::jsonb) || '{"dimension":"N","reversed":false}'::jsonb,
    updated_at = now()
WHERE test_code = 'bigfive'
  AND regexp_replace(lower(regexp_replace(btrim(question_text), '\s+', ' ', 'g')), '\.+$', '') = 'saya mudah stres';

UPDATE test_items
SET scoring_meta = COALESCE(scoring_meta, '{}'::jsonb) || '{"dimension":"E","reversed":false}'::jsonb,
    updated_at = now()
WHERE test_code = 'bigfive'
  AND regexp_replace(lower(regexp_replace(btrim(question_text), '\s+', ' ', 'g')), '\.+$', '') = 'saya suka bertemu orang baru';

UPDATE test_items
SET scoring_meta = COALESCE(scoring_meta, '{}'::jsonb) || '{"dimension":"C","reversed":true}'::jsonb,
    updated_at = now()
WHERE test_code = 'bigfive'
  AND regexp_replace(lower(regexp_replace(btrim(question_text), '\s+', ' ', 'g')), '\.+$', '') = 'saya cenderung tidak terorganisir';

UPDATE test_items
SET scoring_meta = COALESCE(scoring_meta, '{}'::jsonb) || '{"dimension":"N","reversed":false}'::jsonb,
    updated_at = now()
WHERE test_code = 'bigfive'
  AND regexp_replace(lower(regexp_replace(btrim(question_text), '\s+', ' ', 'g')), '\.+$', '') = 'saya mudah tersinggung';

UPDATE test_items
SET scoring_meta = COALESCE(scoring_meta, '{}'::jsonb) || '{"dimension":"O","reversed":false}'::jsonb,
    updated_at = now()
WHERE test_code = 'bigfive'
  AND regexp_replace(lower(regexp_replace(btrim(question_text), '\s+', ' ', 'g')), '\.+$', '') = 'saya suka refleksi mendalam';

UPDATE test_items
SET scoring_meta = COALESCE(scoring_meta, '{}'::jsonb) || '{"dimension":"N","reversed":true}'::jsonb,
    updated_at = now()
WHERE test_code = 'bigfive'
  AND regexp_replace(lower(regexp_replace(btrim(question_text), '\s+', ' ', 'g')), '\.+$', '') = 'saya stabil secara emosional';

UPDATE test_items
SET scoring_meta = COALESCE(scoring_meta, '{}'::jsonb) || '{"dimension":"E","reversed":false}'::jsonb,
    updated_at = now()
WHERE test_code = 'bigfive'
  AND regexp_replace(lower(regexp_replace(btrim(question_text), '\s+', ' ', 'g')), '\.+$', '') = 'saya suka jadi pusat perhatian';

UPDATE test_items
SET scoring_meta = COALESCE(scoring_meta, '{}'::jsonb) || '{"dimension":"C","reversed":false}'::jsonb,
    updated_at = now()
WHERE test_code = 'bigfive'
  AND regexp_replace(lower(regexp_replace(btrim(question_text), '\s+', ' ', 'g')), '\.+$', '') = 'saya pekerja keras';

UPDATE test_items
SET scoring_meta = COALESCE(scoring_meta, '{}'::jsonb) || '{"dimension":"N","reversed":true}'::jsonb,
    updated_at = now()
WHERE test_code = 'bigfive'
  AND regexp_replace(lower(regexp_replace(btrim(question_text), '\s+', ' ', 'g')), '\.+$', '') = 'saya jarang merasa sedih';

UPDATE test_items
SET scoring_meta = COALESCE(scoring_meta, '{}'::jsonb) || '{"dimension":"O","reversed":false}'::jsonb,
    updated_at = now()
WHERE test_code = 'bigfive'
  AND regexp_replace(lower(regexp_replace(btrim(question_text), '\s+', ' ', 'g')), '\.+$', '') = 'saya kreatif dan imajinatif';

UPDATE test_items
SET scoring_meta = COALESCE(scoring_meta, '{}'::jsonb) || '{"dimension":"N","reversed":false}'::jsonb,
    updated_at = now()
WHERE test_code = 'bigfive'
  AND regexp_replace(lower(regexp_replace(btrim(question_text), '\s+', ' ', 'g')), '\.+$', '') = 'saya mudah panik';

UPDATE test_items
SET scoring_meta = COALESCE(scoring_meta, '{}'::jsonb) || '{"dimension":"E","reversed":false}'::jsonb,
    updated_at = now()
WHERE test_code = 'bigfive'
  AND regexp_replace(lower(regexp_replace(btrim(question_text), '\s+', ' ', 'g')), '\.+$', '') = 'saya suka mengobrol';

UPDATE test_items
SET scoring_meta = COALESCE(scoring_meta, '{}'::jsonb) || '{"dimension":"C","reversed":false}'::jsonb,
    updated_at = now()
WHERE test_code = 'bigfive'
  AND regexp_replace(lower(regexp_replace(btrim(question_text), '\s+', ' ', 'g')), '\.+$', '') = 'saya tepat waktu dan terencana';

UPDATE test_items
SET scoring_meta = COALESCE(scoring_meta, '{}'::jsonb) || '{"dimension":"N","reversed":false}'::jsonb,
    updated_at = now()
WHERE test_code = 'bigfive'
  AND regexp_replace(lower(regexp_replace(btrim(question_text), '\s+', ' ', 'g')), '\.+$', '') = 'saya mudah kesal';

UPDATE test_items
SET scoring_meta = COALESCE(scoring_meta, '{}'::jsonb) || '{"dimension":"O","reversed":false}'::jsonb,
    updated_at = now()
WHERE test_code = 'bigfive'
  AND regexp_replace(lower(regexp_replace(btrim(question_text), '\s+', ' ', 'g')), '\.+$', '') = 'saya menghargai pengalaman baru';

UPDATE test_items
SET scoring_meta = COALESCE(scoring_meta, '{}'::jsonb) || '{"dimension":"N","reversed":true}'::jsonb,
    updated_at = now()
WHERE test_code = 'bigfive'
  AND regexp_replace(lower(regexp_replace(btrim(question_text), '\s+', ' ', 'g')), '\.+$', '') = 'saya jarang gugup';

UPDATE test_items
SET scoring_meta = COALESCE(scoring_meta, '{}'::jsonb) || '{"dimension":"E","reversed":false}'::jsonb,
    updated_at = now()
WHERE test_code = 'bigfive'
  AND regexp_replace(lower(regexp_replace(btrim(question_text), '\s+', ' ', 'g')), '\.+$', '') = 'saya antusias';

UPDATE test_items
SET scoring_meta = COALESCE(scoring_meta, '{}'::jsonb) || '{"dimension":"C","reversed":false}'::jsonb,
    updated_at = now()
WHERE test_code = 'bigfive'
  AND regexp_replace(lower(regexp_replace(btrim(question_text), '\s+', ' ', 'g')), '\.+$', '') = 'saya efisien';

UPDATE test_items
SET scoring_meta = COALESCE(scoring_meta, '{}'::jsonb) || '{"dimension":"N","reversed":false}'::jsonb,
    updated_at = now()
WHERE test_code = 'bigfive'
  AND regexp_replace(lower(regexp_replace(btrim(question_text), '\s+', ' ', 'g')), '\.+$', '') = 'saya sering merasa tidak aman';

UPDATE test_items
SET scoring_meta = COALESCE(scoring_meta, '{}'::jsonb) || '{"dimension":"O","reversed":false}'::jsonb,
    updated_at = now()
WHERE test_code = 'bigfive'
  AND regexp_replace(lower(regexp_replace(btrim(question_text), '\s+', ' ', 'g')), '\.+$', '') = 'saya memiliki rasa seni yang tinggi';

UPDATE test_items
SET scoring_meta = COALESCE(scoring_meta, '{}'::jsonb) || '{"dimension":"N","reversed":false}'::jsonb,
    updated_at = now()
WHERE test_code = 'bigfive'
  AND regexp_replace(lower(regexp_replace(btrim(question_text), '\s+', ' ', 'g')), '\.+$', '') = 'saya mudah takut';

UPDATE test_items
SET scoring_meta = COALESCE(scoring_meta, '{}'::jsonb) || '{"dimension":"E","reversed":false}'::jsonb,
    updated_at = now()
WHERE test_code = 'bigfive'
  AND regexp_replace(lower(regexp_replace(btrim(question_text), '\s+', ' ', 'g')), '\.+$', '') = 'saya suka bersosialisasi';

UPDATE test_items
SET scoring_meta = COALESCE(scoring_meta, '{}'::jsonb) || '{"dimension":"C","reversed":false}'::jsonb,
    updated_at = now()
WHERE test_code = 'bigfive'
  AND regexp_replace(lower(regexp_replace(btrim(question_text), '\s+', ' ', 'g')), '\.+$', '') = 'saya membuat rencana dan mengikutinya';

UPDATE test_items
SET scoring_meta = COALESCE(scoring_meta, '{}'::jsonb) || '{"dimension":"O","reversed":false}'::jsonb,
    updated_at = now()
WHERE test_code = 'bigfive'
  AND regexp_replace(lower(regexp_replace(btrim(question_text), '\s+', ' ', 'g')), '\.+$', '') = 'saya suka hal-hal yang kompleks';

UPDATE test_items
SET scoring_meta = COALESCE(scoring_meta, '{}'::jsonb) || '{"dimension":"N","reversed":true}'::jsonb,
    updated_at = now()
WHERE test_code = 'bigfive'
  AND regexp_replace(lower(regexp_replace(btrim(question_text), '\s+', ' ', 'g')), '\.+$', '') = 'saya jarang cemas';

UPDATE test_items
SET scoring_meta = COALESCE(scoring_meta, '{}'::jsonb) || '{"dimension":"E","reversed":false}'::jsonb,
    updated_at = now()
WHERE test_code = 'bigfive'
  AND regexp_replace(lower(regexp_replace(btrim(question_text), '\s+', ' ', 'g')), '\.+$', '') = 'saya penuh semangat';

UPDATE test_items
SET scoring_meta = COALESCE(scoring_meta, '{}'::jsonb) || '{"dimension":"C","reversed":true}'::jsonb,
    updated_at = now()
WHERE test_code = 'bigfive'
  AND regexp_replace(lower(regexp_replace(btrim(question_text), '\s+', ' ', 'g')), '\.+$', '') = 'saya mudah terganggu';

UPDATE test_items
SET scoring_meta = COALESCE(scoring_meta, '{}'::jsonb) || '{"dimension":"O","reversed":false}'::jsonb,
    updated_at = now()
WHERE test_code = 'bigfive'
  AND regexp_replace(lower(regexp_replace(btrim(question_text), '\s+', ' ', 'g')), '\.+$', '') = 'saya memiliki imajinasi yang aktif';

UPDATE test_items
SET scoring_meta = COALESCE(scoring_meta, '{}'::jsonb) || '{"dimension":"O","reversed":false}'::jsonb,
    updated_at = now()
WHERE test_code = 'bigfive'
  AND regexp_replace(lower(regexp_replace(btrim(question_text), '\s+', ' ', 'g')), '\.+$', '') = 'saya memiliki pemahaman yang baik dalam seni, musik, atau sastra';

DO $$
DECLARE
  missing text;
  updated_n int;
BEGIN
  SELECT count(*) INTO updated_n
  FROM test_items
  WHERE test_code = 'bigfive'
    AND scoring_meta ? 'dimension'
    AND scoring_meta ? 'reversed';
  IF updated_n <> 44 THEN
    RAISE EXCEPTION 'Big Five scoring_meta expected 44 keyed rows, found %', updated_n;
  END IF;

  SELECT string_agg(stem, ' | ')
  INTO missing
  FROM (VALUES
    ('saya mudah cemas'),
    ('saya ramah dan mudah bergaul'),
    ('saya suka menjaga kerapian'),
    ('saya mudah marah'),
    ('saya memiliki imajinasi yang kaya'),
    ('saya tenang dalam menghadapi tekanan'),
    ('saya cenderung pendiam'),
    ('saya bisa ceroboh'),
    ('saya sangat sabar'),
    ('saya tidak terlalu tertarik pada seni'),
    ('saya sering khawatir'),
    ('saya penuh energi'),
    ('saya dapat diandalkan'),
    ('saya jarang sedih'),
    ('saya ingin tahu banyak hal'),
    ('saya mudah stres'),
    ('saya suka bertemu orang baru'),
    ('saya cenderung tidak terorganisir'),
    ('saya mudah tersinggung'),
    ('saya suka refleksi mendalam'),
    ('saya stabil secara emosional'),
    ('saya suka jadi pusat perhatian'),
    ('saya pekerja keras'),
    ('saya jarang merasa sedih'),
    ('saya kreatif dan imajinatif'),
    ('saya mudah panik'),
    ('saya suka mengobrol'),
    ('saya tepat waktu dan terencana'),
    ('saya mudah kesal'),
    ('saya menghargai pengalaman baru'),
    ('saya jarang gugup'),
    ('saya antusias'),
    ('saya efisien'),
    ('saya sering merasa tidak aman'),
    ('saya memiliki rasa seni yang tinggi'),
    ('saya mudah takut'),
    ('saya suka bersosialisasi'),
    ('saya membuat rencana dan mengikutinya'),
    ('saya suka hal-hal yang kompleks'),
    ('saya jarang cemas'),
    ('saya penuh semangat'),
    ('saya mudah terganggu'),
    ('saya memiliki imajinasi yang aktif'),
    ('saya memiliki pemahaman yang baik dalam seni, musik, atau sastra')
  ) AS expected(stem)
  WHERE NOT EXISTS (
    SELECT 1 FROM test_items
    WHERE test_code = 'bigfive'
      AND regexp_replace(lower(regexp_replace(btrim(question_text), '\s+', ' ', 'g')), '\.+$', '') = expected.stem
  );
  IF missing IS NOT NULL THEN
    RAISE EXCEPTION 'Big Five stems not found: %', missing;
  END IF;
END $$;

COMMIT;
