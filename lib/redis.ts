import { Redis } from "@upstash/redis";
import { logRouteError } from "@/lib/log-error";
import { redisRestConfig } from "@/lib/redis-env";

let client: Redis | null | undefined;

/** Fail fast when the REST host is gone. The default client retries with backoff for several seconds. */
export const REDIS_REQUEST_TIMEOUT_MS = 1_500;

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

/** Buffer an answer in Redis (48h TTL) */
export async function bufferAnswer(sessionId: number, itemId: number, value: string) {
  await run("redis bufferAnswer", async (redis) => {
    await redis.hset(redisKeys.testAnswers(sessionId), { [itemId]: value });
    await redis.expire(redisKeys.testAnswers(sessionId), 48 * 3600);
  });
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
