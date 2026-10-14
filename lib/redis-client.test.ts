import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { REDIS_BUFFER_COOLDOWN_MS, REDIS_REQUEST_TIMEOUT_MS, isUnreachableRedisHost, noteRedisBufferFailure, redisBufferSkipped, redisClientOptions, resetRedisBufferCircuit } from "./redis";
import { redisRestConfig } from "./redis-env";

describe("redis client", () => {
  it("does not retry a missing host and stays a no-op when unset", () => {
    const options = redisClientOptions();
    assert.equal(options.retry.retries, 0);
    assert.ok(REDIS_REQUEST_TIMEOUT_MS > 0 && REDIS_REQUEST_TIMEOUT_MS <= 2_000);
    assert.equal(redisRestConfig({}), null);
  });

  it("skips the answer buffer after the host does not resolve", () => {
    resetRedisBufferCircuit();
    assert.equal(redisBufferSkipped(0), false);
    const err = new TypeError("fetch failed");
    err.cause = Object.assign(new Error("getaddrinfo"), { code: "ENOTFOUND" });
    assert.equal(isUnreachableRedisHost(err), true);
    noteRedisBufferFailure(err, 1_000);
    assert.equal(redisBufferSkipped(1_000 + REDIS_BUFFER_COOLDOWN_MS - 1), true);
    assert.equal(redisBufferSkipped(1_000 + REDIS_BUFFER_COOLDOWN_MS), false);
    resetRedisBufferCircuit();
    assert.equal(redisBufferSkipped(5_000), false);
  });
});
