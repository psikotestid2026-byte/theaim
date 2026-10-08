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
