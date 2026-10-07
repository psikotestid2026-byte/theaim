import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { REDIS_REQUEST_TIMEOUT_MS, redisClientOptions } from "./redis";
import { redisRestConfig } from "./redis-env";

describe("redis client", () => {
  it("does not retry a missing host and stays a no-op when unset", () => {
    const options = redisClientOptions();
    assert.equal(options.retry.retries, 0);
    assert.ok(REDIS_REQUEST_TIMEOUT_MS > 0 && REDIS_REQUEST_TIMEOUT_MS <= 2_000);
    assert.equal(redisRestConfig({}), null);
  });
});
