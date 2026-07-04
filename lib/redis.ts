import { Redis } from "@upstash/redis";

export const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

// Key conventions per TRD §7
export const redisKeys = {
  testAccess: (token: string) => `test:access:${token}`,
  testResult: (resultToken: string) => `test:result:${resultToken}`,
  testAnswers: (sessionId: number) => `test:answers:${sessionId}`,
  paymentIdempotency: (ref: string) => `payment:idempotency:${ref}`,
  rateLimit: (ip: string, route: string) => `rl:${route}:${ip}`,
};

/** Cache a test session by access token (60s TTL) */
export async function cacheTestSession(token: string, session: object) {
  await redis.setex(redisKeys.testAccess(token), 60, JSON.stringify(session));
}

/** Get cached test session */
export async function getCachedTestSession(token: string) {
  const raw = await redis.get<string>(redisKeys.testAccess(token));
  if (!raw) return null;
  return typeof raw === "string" ? JSON.parse(raw) : raw;
}

/** Cache test result permanently */
export async function cacheTestResult(resultToken: string, result: object) {
  await redis.set(redisKeys.testResult(resultToken), JSON.stringify(result));
}

/** Get cached test result */
export async function getCachedTestResult(resultToken: string) {
  const raw = await redis.get<string>(redisKeys.testResult(resultToken));
  if (!raw) return null;
  return typeof raw === "string" ? JSON.parse(raw) : raw;
}

/** Buffer an answer in Redis (48h TTL) */
export async function bufferAnswer(sessionId: number, itemId: number, value: string) {
  await redis.hset(redisKeys.testAnswers(sessionId), { [itemId]: value });
  await redis.expire(redisKeys.testAnswers(sessionId), 48 * 3600);
}

/** Get all buffered answers */
export async function getBufferedAnswers(sessionId: number): Promise<Record<string, string>> {
  const data = await redis.hgetall(redisKeys.testAnswers(sessionId));
  return (data as Record<string, string>) ?? {};
}

/** Invalidate access token cache */
export async function invalidateTestAccess(token: string) {
  await redis.del(redisKeys.testAccess(token));
}
