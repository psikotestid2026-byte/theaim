import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { assetPathFromStoredRef, safeAssetPath, safeImageContentType, withAssetToken } from "./test-assets";

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
});
