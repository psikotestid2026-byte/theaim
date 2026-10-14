/** Token-gated figure URLs. Item banks stay in the database; the browser only receives a path plus `t`. */

const ASSET_PREFIX = "/api/test-assets/";

export function safeAssetPath(path: string): string | null {
  if (!path || path.length > 240) return null;
  if (path.startsWith("/") || path.includes("..") || path.includes("\\") || path.includes("\0")) return null;
  if (!/^tests\/(ist|wpt)\/[A-Za-z0-9._/-]+$/.test(path)) return null;
  if (path.endsWith("/")) return null;
  return path;
}

/** Relative path stored in test_assets, from a stored image reference. */
export function assetPathFromStoredRef(src: string): string | null {
  const bare = src.split("#")[0]?.split("?")[0] ?? "";
  if (bare.startsWith(ASSET_PREFIX)) return safeAssetPath(bare.slice(ASSET_PREFIX.length));
  if (bare.startsWith("/tests/ist/") || bare.startsWith("/tests/wpt/")) return safeAssetPath(bare.slice(1));
  return null;
}

/**
 * Appends the session access token or the result token as `t`.
 * Leaves unrelated URLs (including Big Five, which has no figures) unchanged.
 */
export function withAssetToken(src: string | null | undefined, token: string): string | null {
  if (!src) return null;
  const path = assetPathFromStoredRef(src);
  if (!path) return src;
  const params = new URLSearchParams();
  const query = src.split("#")[0]?.split("?")[1];
  if (query) {
    const existing = new URLSearchParams(query);
    existing.forEach((value, key) => {
      if (key !== "t") params.append(key, value);
    });
  }
  if (token) params.set("t", token);
  const search = params.toString();
  return `${ASSET_PREFIX}${path}${search ? `?${search}` : ""}`;
}

export function safeImageContentType(value: string): string | null {
  const type = value.trim().toLowerCase();
  return /^image\/[a-z0-9.+-]+$/.test(type) ? type : null;
}

/**
 * /hasil paints item figures (presentTakerResult appends the result token).
 * A result token may read only figures referenced by its own completed test.
 */
export const HASIL_RENDERS_ITEM_FIGURES = true;

export function sessionMayReadAsset(input: {
  isAccess: boolean;
  isResult: boolean;
  status: string;
  referencedByOwnTest: boolean;
}): boolean {
  if (!input.referencedByOwnTest) return false;
  if (input.isAccess && input.status === "in_progress") return true;
  if (input.isResult && input.status === "completed" && HASIL_RENDERS_ITEM_FIGURES) return true;
  return false;
}

/** Decode a Neon bytea value without the deprecated Buffer constructor. */
export function decodeBytea(value: unknown): Uint8Array | null {
  if (value instanceof Uint8Array) {
    return value.byteLength > 0 ? new Uint8Array(value) : null;
  }
  if (typeof value !== "string" || value.length === 0) return null;
  if (value.startsWith("\\x")) return decodeHex(value.slice(2));
  return decodeBase64(value);
}

function decodeHex(hex: string): Uint8Array | null {
  if (hex.length === 0 || hex.length % 2 !== 0 || /[^0-9a-fA-F]/.test(hex)) return null;
  const out = new Uint8Array(hex.length / 2);
  for (let i = 0; i < out.length; i += 1) {
    out[i] = Number.parseInt(hex.slice(i * 2, i * 2 + 2), 16);
  }
  return out;
}

function decodeBase64(value: string): Uint8Array | null {
  const cleaned = value.replace(/\s/g, "");
  if (!cleaned || cleaned.length % 4 !== 0 || /[^A-Za-z0-9+/=]/.test(cleaned)) return null;
  try {
    const binary = globalThis.atob(cleaned);
    if (binary.length === 0) return null;
    const out = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i += 1) out[i] = binary.charCodeAt(i);
    return out;
  } catch {
    return null;
  }
}
