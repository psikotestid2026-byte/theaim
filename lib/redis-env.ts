export type RedisRestConfig = { url: string; token: string };

type RedisEnv = Record<string, string | undefined>;

/** Upstash REST credentials. Preview/staging exposes these as Vercel KV variables. */
export function redisRestConfig(env: RedisEnv = process.env): RedisRestConfig | null {
  const url = env.UPSTASH_REDIS_REST_URL?.trim() || env.KV_REST_API_URL?.trim() || "";
  const token = env.UPSTASH_REDIS_REST_TOKEN?.trim() || env.KV_REST_API_TOKEN?.trim() || "";
  if (!url || !token) return null;
  return { url, token };
}
