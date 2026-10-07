import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { appendResultLink, resultPageUrl, siteOrigin, testPageUrl } from "./site-url";
import { redisRestConfig } from "./redis-env";

const previewHost = "theaim-git-cursor-phase-b-test-ru-f27624-irvan-adrians-projects.vercel.app";

describe("site origin", () => {
  it("uses the request host so a preview QR stays on that deployment", () => {
    const origin = siteOrigin({
      forwardedHost: previewHost,
      forwardedProto: "https",
      env: { NEXT_PUBLIC_SITE_URL: "https://theaim.id", VERCEL_ENV: "preview" },
    });
    assert.equal(resultPageUrl("result-token", origin), `https://${previewHost}/hasil/result-token`);
  });

  it("prefers x-forwarded-host over host", () => {
    const origin = siteOrigin({
      forwardedHost: previewHost,
      host: "theaim.id",
      forwardedProto: "https",
      env: {},
    });
    assert.equal(origin, `https://${previewHost}`);
  });

  it("uses NEXT_PUBLIC_SITE_URL when there is no request host", () => {
    const origin = siteOrigin({
      env: { NEXT_PUBLIC_SITE_URL: "https://staging.theaim.id/", VERCEL_URL: "theaim-abc.vercel.app" },
    });
    assert.equal(testPageUrl("access-token", origin), "https://staging.theaim.id/tes/access-token");
  });

  it("falls back to the Vercel branch host, then the deployment host", () => {
    assert.equal(
      siteOrigin({ env: { VERCEL_BRANCH_URL: "theaim-git-branch.vercel.app", VERCEL_URL: "theaim-abc.vercel.app", VERCEL_ENV: "preview" } }),
      "https://theaim-git-branch.vercel.app",
    );
    assert.equal(
      siteOrigin({ env: { VERCEL_URL: "theaim-abc.vercel.app", VERCEL_ENV: "preview" } }),
      "https://theaim-abc.vercel.app",
    );
  });

  it("uses the production domain only for the production deployment", () => {
    assert.equal(siteOrigin({ env: { VERCEL_ENV: "production" } }), "https://theaim.id");
    assert.equal(siteOrigin({ env: { VERCEL_ENV: "preview" } }), "http://localhost:3000");
    assert.equal(siteOrigin({ host: "localhost:3000", env: { VERCEL_ENV: "production" } }), "http://localhost:3000");
  });

  it("appends a result link once", () => {
    const url = "https://preview.vercel.app/hasil/token";
    const once = appendResultLink("Hasil kamu sudah siap.", url);
    assert.equal(once, `Hasil kamu sudah siap.\n\nHasil lengkap: ${url}`);
    assert.equal(appendResultLink(once, url), once);
  });
});

describe("redis env fallback", () => {
  it("prefers Upstash variables and otherwise uses Vercel KV", () => {
    assert.deepEqual(
      redisRestConfig({
        UPSTASH_REDIS_REST_URL: "https://upstash.example",
        UPSTASH_REDIS_REST_TOKEN: "upstash-token",
        KV_REST_API_URL: "https://kv.example",
        KV_REST_API_TOKEN: "kv-token",
      }),
      { url: "https://upstash.example", token: "upstash-token" },
    );
    assert.deepEqual(
      redisRestConfig({ KV_REST_API_URL: "https://kv.example", KV_REST_API_TOKEN: "kv-token" }),
      { url: "https://kv.example", token: "kv-token" },
    );
  });

  it("returns null unless both url and token are present", () => {
    assert.equal(redisRestConfig({}), null);
    assert.equal(redisRestConfig({ KV_REST_API_URL: "https://kv.example" }), null);
    assert.equal(redisRestConfig({ KV_REST_API_TOKEN: "kv-token" }), null);
  });
});
