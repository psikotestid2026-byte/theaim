import { sql } from "@/lib/db";

function decodeBytea(value: unknown): Buffer | null {
  if (Buffer.isBuffer(value)) return value;
  if (value instanceof Uint8Array) return Buffer.from(value);
  if (typeof value !== "string" || value.length === 0) return null;
  if (value.startsWith("\\x")) {
    const hex = Buffer.from(value.slice(2), "hex");
    return hex.length > 0 ? hex : null;
  }
  const decoded = Buffer.from(value, "base64");
  return decoded.length > 0 ? decoded : null;
}

export async function getTestAsset(path: string): Promise<{ content_type: string; data: Buffer } | null> {
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

/**
 * Access tokens work until the session is completed.
 * A result token works for /hasil, including after completion.
 * Anything else is denied. Callers respond 404 either way.
 */
export async function assetTokenCanRead(token: string): Promise<boolean> {
  if (!token || token.length > 128) return false;
  const rows = await sql`
    SELECT (access_token = ${token}) AS is_access,
           (result_token = ${token}) AS is_result,
           status
    FROM test_sessions
    WHERE access_token = ${token} OR result_token = ${token}
    LIMIT 2
  `;
  for (const row of rows as { is_access?: boolean; is_result?: boolean; status?: string }[]) {
    if (row.is_result) return true;
    if (row.is_access && row.status !== "completed") return true;
  }
  return false;
}
