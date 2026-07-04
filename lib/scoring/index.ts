import type { TestItem, TestResultPayload } from "@/types/db";
import { computeMBTI } from "./mbti";
import { computeDISC } from "./disc";
import { computeEnneagram } from "./enneagram";

// Dispatch map: test_code → compute function
const DISPATCH: Record<
  string,
  (responses: Record<number, string>, items: TestItem[]) => TestResultPayload
> = {
  MBTI: computeMBTI,
  DISC: computeDISC,
  ENNEAGRAM: computeEnneagram,
  // Stubs for other test codes — use a generic scorer
  STRENGTH30: genericScorer("STRENGTH30"),
  PAPIKOSTIK: genericScorer("PAPIKOSTIK"),
  IQ: genericScorer("IQ"),
  MGMT_STYLE: genericScorer("MGMT_STYLE"),
  RIASEC: genericScorer("RIASEC"),
  GAYA_BELAJAR: genericScorer("GAYA_BELAJAR"),
};

function genericScorer(testCode: string) {
  return (responses: Record<number, string>, items: TestItem[]): TestResultPayload => {
    const scores: Record<string, number> = {};
    for (const item of items) {
      const answer = responses[item.id];
      if (!answer) continue;
      const options = Array.isArray(item.options) ? item.options : JSON.parse(item.options as unknown as string);
      const opt = options.find((o: { value: string }) => o.value === answer);
      if (opt?.score_key) {
        scores[opt.score_key] = (scores[opt.score_key] ?? 0) + (opt.score_val ?? 1);
      }
    }
    const dominant = Object.entries(scores).sort((a, b) => b[1] - a[1])[0];
    const resultType = dominant ? dominant[0] : testCode;
    return {
      raw_scores: scores,
      result_type: resultType,
      result_label: `Tipe ${resultType}`,
      interpretation: {
        description: `Berdasarkan hasil ${testCode} Anda, profil dominan Anda adalah tipe ${resultType}.`,
        strengths: ["Autentik", "Konsisten", "Adaptif"],
        challenges: ["Eksplorasi lebih lanjut diperlukan"],
      },
      wa_summary_text: `🎉 Hasil Tes ${testCode} kamu sudah siap!\n\n*Tipe ${resultType}*\n\n💡 Lihat hasil lengkap di halaman hasilmu.`,
    };
  };
}

/** Main dispatch function — called by the test completion workflow */
export function computeResult(
  testCode: string,
  responses: Record<number, string>,
  items: TestItem[]
): TestResultPayload {
  const fn = DISPATCH[testCode];
  if (!fn) throw new Error(`No scoring function for test_code: ${testCode}`);
  return fn(responses, items);
}
