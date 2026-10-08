import type { IstScoringTables } from "@/lib/ist-types";
import type { TestItem, TestResultPayload } from "@/types/db";
import { computeDISC } from "./disc";
import { computeEnneagram } from "./enneagram";
import { computeMBTI } from "./mbti";
import { computeRetail, isRetailCode } from "./retail";
import { computeTalentsMapping, type TalentsMappingScore } from "./talents-mapping";

export type ScoredResult = TestResultPayload & { tm?: TalentsMappingScore["tm"] };

export type ScoringContext = { ist?: IstScoringTables };

/**
 * Dispatch on master_tests.code.
 * Lowercase codes use the RuangTes formulas (or Talents Mapping rank bands).
 * Uppercase MBTI / DISC / ENNEAGRAM stay on the original score_key scorers so
 * sessions that already use those demo banks keep the same result.
 * Any other code throws — scores are not invented.
 */
export function computeResult(
  testCode: string,
  responses: Record<number, string>,
  items: TestItem[],
  context?: ScoringContext,
): ScoredResult {
  if (testCode === "talents_mapping") return computeTalentsMapping(responses, items);
  if (isRetailCode(testCode)) return computeRetail(testCode, responses, items, context);
  if (testCode === "MBTI") return computeMBTI(responses, items);
  if (testCode === "DISC") return computeDISC(responses, items);
  if (testCode === "ENNEAGRAM") return computeEnneagram(responses, items);
  throw new Error(`No scoring function for test_code: ${testCode}`);
}
