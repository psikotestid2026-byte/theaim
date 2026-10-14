import { Redis } from "@upstash/redis";
import { logRouteError } from "@/lib/log-error";
import { redisRestConfig } from "@/lib/redis-env";

let client: Redis | null | undefined;

/** Fail fast when the REST host is gone. The default client retries with backoff for several seconds. */
export const REDIS_REQUEST_TIMEOUT_MS = 1_500;

/** After a dead host, skip the answer buffer so later clicks do not pay DNS again. */
export const REDIS_BUFFER_COOLDOWN_MS = 30_000;

let bufferSkippedUntil = 0;

export function redisBufferSkipped(now = Date.now()): boolean {
  return now < bufferSkippedUntil;
}

export function resetRedisBufferCircuit(): void {
  bufferSkippedUntil = 0;
}

/** DNS and abort failures only. A live host that returns an error still gets the next try. */
export function isUnreachableRedisHost(err: unknown): boolean {
  const parts: string[] = [];
  let current: unknown = err;
  for (let depth = 0; depth < 5 && current instanceof Error; depth++) {
    parts.push(current.name, current.message);
    if ("code" in current && typeof current.code === "string") parts.push(current.code);
    const cause: unknown = current.cause;
    if (cause && typeof cause === "object" && "code" in cause && typeof (cause as { code: unknown }).code === "string") {
      parts.push((cause as { code: string }).code);
    }
    current = cause;
  }
  return /ENOTFOUND|EAI_AGAIN|ENETUNREACH|EHOSTUNREACH|TimeoutError|AbortError|timed out/i.test(parts.join(" "));
}

export function noteRedisBufferFailure(err: unknown, now = Date.now()): void {
  if (isUnreachableRedisHost(err)) bufferSkippedUntil = now + REDIS_BUFFER_COOLDOWN_MS;
}

export function redisClientOptions() {
  return {
    keepAlive: false as const,
    retry: { retries: 0 },
  };
}

function getRedis(): Redis | null {
  if (client !== undefined) return client;
  const config = redisRestConfig();
  client = config
    ? new Redis({
        url: config.url,
        token: config.token,
        ...redisClientOptions(),
        signal: () => AbortSignal.timeout(REDIS_REQUEST_TIMEOUT_MS),
      })
    : null;
  return client;
}

async function run(scope: string, command: (redis: Redis) => Promise<unknown>) {
  const redis = getRedis();
  if (!redis) return;
  try {
    await command(redis);
  } catch (err) {
    logRouteError(scope, err);
  }
}

// Key conventions per TRD §7
export const redisKeys = {
  testAccess: (token: string) => `test:access:${token}`,
  testResult: (resultToken: string) => `test:result:${resultToken}`,
  testAnswers: (sessionId: number) => `test:answers:${sessionId}`,
  paymentIdempotency: (ref: string) => `payment:idempotency:${ref}`,
  rateLimit: (ip: string, route: string) => `rl:${route}:${ip}`,
};

/** Cache a test session by access token (60s TTL). No-op when Redis is not configured. */
export async function cacheTestSession(token: string, session: object) {
  await run("redis cacheTestSession", (redis) => redis.setex(redisKeys.testAccess(token), 60, JSON.stringify(session)));
}

/** Get cached test session */
export async function getCachedTestSession(token: string) {
  const redis = getRedis();
  if (!redis) return null;
  try {
    const raw = await redis.get<string>(redisKeys.testAccess(token));
    if (!raw) return null;
    return typeof raw === "string" ? JSON.parse(raw) : raw;
  } catch (err) {
    logRouteError("redis getCachedTestSession", err);
    return null;
  }
}

/** Cache test result permanently */
export async function cacheTestResult(resultToken: string, result: object) {
  await run("redis cacheTestResult", (redis) => redis.set(redisKeys.testResult(resultToken), JSON.stringify(result)));
}

/** Get cached test result */
export async function getCachedTestResult(resultToken: string) {
  const redis = getRedis();
  if (!redis) return null;
  try {
    const raw = await redis.get<string>(redisKeys.testResult(resultToken));
    if (!raw) return null;
    return typeof raw === "string" ? JSON.parse(raw) : raw;
  } catch (err) {
    logRouteError("redis getCachedTestResult", err);
    return null;
  }
}

/**
 * Buffer an answer in Redis (48h TTL). Best-effort: the database row is the
 * source of truth. A dead REST host is skipped until the cooldown passes so
 * answer saves are not stuck on DNS.
 */
export async function bufferAnswer(sessionId: number, itemId: number, value: string) {
  if (redisBufferSkipped()) return;
  const redis = getRedis();
  if (!redis) return;
  try {
    await redis.hset(redisKeys.testAnswers(sessionId), { [itemId]: value });
    await redis.expire(redisKeys.testAnswers(sessionId), 48 * 3600);
  } catch (err) {
    noteRedisBufferFailure(err);
    logRouteError("redis bufferAnswer", err);
  }
}

/** Get all buffered answers */
export async function getBufferedAnswers(sessionId: number): Promise<Record<string, string>> {
  const redis = getRedis();
  if (!redis) return {};
  try {
    const data = await redis.hgetall(redisKeys.testAnswers(sessionId));
    return (data as Record<string, string>) ?? {};
  } catch (err) {
    logRouteError("redis getBufferedAnswers", err);
    return {};
  }
}

/** Invalidate access token cache. No-op when Redis is not configured. */
export async function invalidateTestAccess(token: string) {
  await run("redis invalidateTestAccess", (redis) => redis.del(redisKeys.testAccess(token)));
}
