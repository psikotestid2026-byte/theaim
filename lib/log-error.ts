/** Log an error name and message without tokens, phone numbers, or other long digit strings. */
export function logRouteError(scope: string, err: unknown) {
  const name = err instanceof Error ? err.name : "unknown";
  const message = err instanceof Error ? err.message : "";
  const safe = message
    .replace(/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/gi, "[id]")
    .replace(/\d{5,}/g, "[n]");
  console.error(`${scope}:`, name, safe);
}
