import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { calculateMsaiScore } from "./scoring/ruangtes/msai";
import { msaiBlockForOrder, msaiOptionLabels } from "./msai-form";

describe("MSAI sections", () => {
  it("separates duplicate skill texts into effectiveness and importance", () => {
    const effectiveness = msaiBlockForOrder(61);
    const importance = msaiBlockForOrder(76);
    assert.equal(effectiveness?.id, "effectiveness");
    assert.equal(importance?.id, "importance");
    assert.notEqual(effectiveness?.title, importance?.title);
    assert.deepEqual(msaiOptionLabels(1)?.[0], "Sangat Tidak Setuju");
    assert.deepEqual(msaiOptionLabels(61), ["Buruk", "Di bawah rata-rata", "Rata-rata", "Di atas rata-rata", "Luar Biasa"]);
    assert.equal(msaiOptionLabels(74)?.[0], "Tidak lebih tinggi dari posisi saat ini");
    assert.equal(msaiOptionLabels(74)?.includes("Sangat Baik"), false);
    assert.equal(msaiOptionLabels(76)?.[0], "Kurang Penting");
    assert.equal(msaiOptionLabels(87)?.at(-1), "Sangat Kritikal");
  });

  it("scores the replacement scale labels", () => {
    const answers: Record<number, string> = {};
    for (let index = 0; index < 60; index += 1) answers[index] = "Sangat Setuju";
    answers[60] = "Luar Biasa";
    answers[75] = "Sangat Kritikal";
    const scored = calculateMsaiScore(answers);
    const teams = scored.skills.find((skill) => skill.name === "Managing Teams");
    assert.equal(teams?.actual, 5);
    assert.equal(teams?.effectiveness, 5);
    assert.equal(teams?.importance, 5);
    assert.equal(teams?.gap, 0);
  });

  it("rounds a gap that is not a binary-safe decimal", () => {
    const answers: Record<number, string> = {};
    for (const order of [12, 18, 21, 22]) answers[order - 1] = "5";
    answers[49 - 1] = "2";
    answers[76 - 1] = "5";
    const scored = calculateMsaiScore(answers);
    const teams = scored.skills.find((skill) => skill.name === "Managing Teams");
    assert.equal(teams?.gap, 0.6);
    assert.equal(teams?.gap?.toFixed(2), "0.60");
    assert.equal(String(teams?.gap).includes("000000"), false);
  });
});
