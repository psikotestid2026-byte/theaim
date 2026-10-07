/** Neon returns bigint/bigserial as a string. Coerce before compare, JSON, or Zod. */
export function asId(value: unknown): number {
  if (typeof value === "bigint") {
    const n = Number(value);
    if (!Number.isSafeInteger(n) || n <= 0) throw new Error("Invalid id");
    return n;
  }
  const n = typeof value === "number" ? value : typeof value === "string" && value.trim() !== "" ? Number(value) : NaN;
  if (!Number.isSafeInteger(n) || n <= 0) throw new Error("Invalid id");
  return n;
}

export function asCount(value: unknown): number {
  const n = typeof value === "number" ? value : Number(value);
  if (!Number.isSafeInteger(n) || n < 0) return 0;
  return n;
}
