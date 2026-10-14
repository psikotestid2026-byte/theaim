import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { describe, it } from "node:test";
import { assetPathFromStoredRef, decodeBytea, safeAssetPath, safeImageContentType, sessionMayReadAsset, withAssetToken } from "./test-assets";

describe("test asset paths", () => {
  it("accepts the staging figure paths and rejects traversal", () => {
    assert.equal(safeAssetPath("tests/ist/fa/FA_117.png"), "tests/ist/fa/FA_117.png");
    assert.equal(safeAssetPath("tests/ist/wu/WU_option_a.png"), "tests/ist/wu/WU_option_a.png");
    assert.equal(safeAssetPath("tests/wpt/WPT_07_stimulus.png"), "tests/wpt/WPT_07_stimulus.png");
    assert.equal(safeAssetPath("../tests/ist/fa/FA_117.png"), null);
    assert.equal(safeAssetPath("tests/ist/../secret.png"), null);
    assert.equal(safeAssetPath("tests/other/x.png"), null);
  });

  it("appends the session or result token for gated figures and leaves other urls", () => {
    assert.equal(
      withAssetToken("/api/test-assets/tests/ist/fa/FA_117.png", "access-token"),
      "/api/test-assets/tests/ist/fa/FA_117.png?t=access-token",
    );
    assert.equal(
      withAssetToken("/tests/wpt/WPT_49.png", "result-token"),
      "/api/test-assets/tests/wpt/WPT_49.png?t=result-token",
    );
    assert.equal(withAssetToken("/Logo2/Logo theaim.id.png", "token"), "/Logo2/Logo theaim.id.png");
    assert.equal(assetPathFromStoredRef("/api/test-assets/tests/ist/wu/WU_option_a.png?t=old"), "tests/ist/wu/WU_option_a.png");
  });

  it("allows image content types only", () => {
    assert.equal(safeImageContentType("image/png"), "image/png");
    assert.equal(safeImageContentType("text/html"), null);
  });

  it("lets a confirmed session read its own figure and rejects everyone else", () => {
    const own = { referencedByOwnTest: true };
    assert.equal(sessionMayReadAsset({ isAccess: true, isResult: false, status: "in_progress", ...own }), true);
    assert.equal(sessionMayReadAsset({ isAccess: true, isResult: false, status: "issued", ...own }), false);
    assert.equal(sessionMayReadAsset({ isAccess: true, isResult: false, status: "confirming", ...own }), false);
    assert.equal(sessionMayReadAsset({ isAccess: true, isResult: false, status: "completed", ...own }), false);
    assert.equal(sessionMayReadAsset({ isAccess: true, isResult: false, status: "locked", ...own }), false);
    assert.equal(sessionMayReadAsset({ isAccess: true, isResult: false, status: "in_progress", referencedByOwnTest: false }), false);
    assert.equal(sessionMayReadAsset({ isAccess: false, isResult: true, status: "completed", ...own }), false);
  });

  it("decodes bytea without the Buffer constructor", () => {
    assert.deepEqual(Array.from(decodeBytea("\\x0102") ?? []), [1, 2]);
    assert.deepEqual(Array.from(decodeBytea("AQID") ?? []), [1, 2, 3]);
    assert.equal(decodeBytea(""), null);
    assert.equal(decodeBytea("\\xzz"), null);
    const source = readFileSync(new URL("./test-assets.ts", import.meta.url), "utf8");
    const query = readFileSync(new URL("./queries/test-assets.ts", import.meta.url), "utf8");
    assert.equal(/Buffer\s*\(/.test(source), false);
    assert.equal(/Buffer\s*\(/.test(query), false);
    assert.match(query, /status = 'in_progress'|status === "in_progress"/);
    assert.match(query, /test_items/);
    assert.match(query, /HASIL_RENDERS_ITEM_FIGURES/);
  });
});
