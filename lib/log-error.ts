/** Log an error name and message without tokens, phone numbers, or other long digit strings. */
export function logRouteError(scope: string, err: unknown) {
  const name = err instanceof Error ? err.name : "unknown";
  const message = err instanceof Error ? err.message : "";
  const safe = redact(message);
  const cause = err instanceof Error ? err.cause : undefined;
  const causeCode = cause && typeof cause === "object" && "code" in cause ? String(cause.code) : "";
  const causeMessage = cause instanceof Error ? redact(cause.message) : "";
  console.error(`${scope}:`, name, [safe, causeCode, causeMessage].filter(Boolean).join(" "));
}

function redact(message: string): string {
  return message
    .replace(/https?:\/\/\S+/gi, "[url]")
    .replace(/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/gi, "[id]")
    .replace(/\d{5,}/g, "[n]");
}
