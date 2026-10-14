import { sql } from "@/lib/db";
import { decodeBytea, HASIL_RENDERS_ITEM_FIGURES, safeAssetPath, sessionMayReadAsset } from "@/lib/test-assets";

export async function getTestAsset(path: string): Promise<{ content_type: string; data: Uint8Array } | null> {
  const rows = await sql`
    SELECT content_type, data
    FROM test_assets
    WHERE path = ${path}
    LIMIT 1
  `;
  const row = rows[0] as { content_type?: unknown; data?: unknown } | undefined;
  if (!row || typeof row.content_type !== "string") return null;
  const data = decodeBytea(row.data);
  if (!data) return null;
  return { content_type: row.content_type, data };
}

function asBool(value: unknown): boolean {
  return value === true || value === "t" || value === "true" || value === 1;
}

/**
 * An access token may read a figure only after identity confirmation
 * (`in_progress`), before completion, and only when that session's own
 * test references the path: an item image, an option image, or a
 * scoring_config subtest exampleImage.
 * A result token is allowed only when /hasil actually renders that figure.
 * /hasil does not, so result tokens are denied. Callers respond 404 either way.
 */
export async function assetTokenCanRead(token: string, assetPath: string): Promise<boolean> {
  if (!token || token.length > 128 || !safeAssetPath(assetPath)) return false;
  const rows = await sql`
    SELECT status,
           test_code,
           (access_token = ${token}) AS is_access,
           (result_token = ${token}) AS is_result
    FROM test_sessions
    WHERE access_token = ${token} OR result_token = ${token}
    LIMIT 2
  `;
  for (const row of rows as { status?: unknown; test_code?: unknown; is_access?: unknown; is_result?: unknown }[]) {
    const isAccess = asBool(row.is_access);
    const isResult = asBool(row.is_result);
    const status = typeof row.status === "string" ? row.status : "";
    const testCode = typeof row.test_code === "string" ? row.test_code : "";
    const needsLookup = (isAccess && status === "in_progress") || (isResult && HASIL_RENDERS_ITEM_FIGURES);
    const referenced = needsLookup && testCode ? await testReferencesAsset(testCode, assetPath) : false;
    if (sessionMayReadAsset({ isAccess, isResult, status, referencedByOwnTest: referenced })) return true;
  }
  return false;
}

async function testReferencesAsset(testCode: string, assetPath: string): Promise<boolean> {
  const rows = await sql`
    SELECT 1
    FROM test_items ti
    WHERE lower(ti.test_code) = lower(${testCode})
      AND (
        regexp_replace(split_part(split_part(COALESCE(ti.scoring_meta->>'image', ''), '#', 1), '?', 1), '^(/api/test-assets/|/)', '') = ${assetPath}
        OR regexp_replace(split_part(split_part(COALESCE(ti.scoring_meta->>'options_image', ''), '#', 1), '?', 1), '^(/api/test-assets/|/)', '') = ${assetPath}
        OR EXISTS (
          SELECT 1
          FROM jsonb_array_elements(
            CASE WHEN jsonb_typeof(ti.options) = 'array' THEN ti.options ELSE '[]'::jsonb END
          ) AS opt
          WHERE regexp_replace(split_part(split_part(COALESCE(opt->>'image', ''), '#', 1), '?', 1), '^(/api/test-assets/|/)', '') = ${assetPath}
        )
      )
    UNION ALL
    SELECT 1
    FROM scoring_configs sc
    JOIN master_tests mt ON mt.id = sc.test_id
    CROSS JOIN LATERAL jsonb_array_elements(
      CASE
        WHEN jsonb_typeof(sc.config_data->'subtests') = 'array' THEN sc.config_data->'subtests'
        ELSE '[]'::jsonb
      END
    ) AS elem(item)
    WHERE lower(mt.code) = lower(${testCode})
      AND regexp_replace(split_part(split_part(COALESCE(elem.item->>'exampleImage', ''), '#', 1), '?', 1), '^(/api/test-assets/|/)', '') = ${assetPath}
    LIMIT 1
  `;
  return rows.length > 0;
}
