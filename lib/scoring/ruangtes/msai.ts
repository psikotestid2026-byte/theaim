// MSAI (Management Skills Assessment Instrument) scoring — Competing Values Framework (Quinn).
// Answers are keyed by question index (0-based, matches question_banks.order_number - 1),
// value = the exact Likert option text the participant selected, following the same
// convention as lib/scoring/papi.ts. Likert scale: "Sangat Kurang".."Sangat Baik" -> 1..5.
//
// All 87 canonical items (refs/docs/msai.md Section 3) are seeded in question_banks as of
// the fix that corrected the two mislabeled Importance rows (76-77 previously held the
// wrong statement text) and inserted the remaining 78-87. Importance/Gap are computed for
// all 12 skills; null only occurs if a participant genuinely left an item unanswered.

export type MsaiQuadrant = 'Adhocracy' | 'Market' | 'Hierarchy' | 'Clan';

export interface MsaiSkillDef {
  name: string;
  quadrant: MsaiQuadrant;
  actualItems: number[]; // 1-based item numbers (Q1-Q60)
  effectivenessItem: number; // Q61-Q72
  importanceItem: number; // Q76-Q87
}

export const MSAI_SKILLS: MsaiSkillDef[] = [
  { name: 'Managing Innovation', quadrant: 'Adhocracy', actualItems: [2, 8, 27, 45, 51], effectivenessItem: 64, importanceItem: 79 },
  { name: 'Managing the Future', quadrant: 'Adhocracy', actualItems: [9, 14, 28, 46, 59], effectivenessItem: 65, importanceItem: 80 },
  { name: 'Managing Continuous Improvement', quadrant: 'Adhocracy', actualItems: [26, 29, 44, 52, 53], effectivenessItem: 66, importanceItem: 81 },
  { name: 'Managing Competitiveness', quadrant: 'Market', actualItems: [15, 30, 35, 42, 43], effectivenessItem: 67, importanceItem: 82 },
  { name: 'Energising Employees', quadrant: 'Market', actualItems: [3, 6, 7, 31, 60], effectivenessItem: 68, importanceItem: 83 },
  { name: 'Managing Customer Services', quadrant: 'Market', actualItems: [32, 33, 41, 54, 55], effectivenessItem: 69, importanceItem: 84 },
  { name: 'Managing Coordination', quadrant: 'Hierarchy', actualItems: [11, 17, 37, 38, 57], effectivenessItem: 72, importanceItem: 87 },
  { name: 'Managing the Control System', quadrant: 'Hierarchy', actualItems: [4, 16, 19, 36, 39], effectivenessItem: 71, importanceItem: 86 },
  { name: 'Managing Acculturation', quadrant: 'Hierarchy', actualItems: [10, 34, 40, 56, 58], effectivenessItem: 70, importanceItem: 85 },
  { name: 'Managing the Development of Others', quadrant: 'Clan', actualItems: [5, 20, 24, 25, 47], effectivenessItem: 63, importanceItem: 78 },
  { name: 'Managing Interpersonal Relationships', quadrant: 'Clan', actualItems: [1, 13, 23, 48, 50], effectivenessItem: 62, importanceItem: 77 },
  { name: 'Managing Teams', quadrant: 'Clan', actualItems: [12, 18, 21, 22, 49], effectivenessItem: 61, importanceItem: 76 },
];

const VALUE_MAP: Record<string, number> = {
  'sangat kurang': 1,
  'kurang': 2,
  'cukup': 3,
  'baik': 4,
  'sangat baik': 5,
};

function norm(s: any): string {
  return String(s ?? '').trim().toLowerCase();
}

function parseLikert(val: any): number | null {
  if (val === undefined || val === null) return null;
  const n = norm(val);
  if (n === '') return null;
  if (VALUE_MAP[n] !== undefined) return VALUE_MAP[n];
  const asNum = Number(n);
  if (Number.isFinite(asNum) && asNum >= 1 && asNum <= 5) return asNum;
  return null;
}

export interface MsaiSkillResult {
  name: string;
  quadrant: MsaiQuadrant;
  actual: number | null;
  effectiveness: number | null;
  importance: number | null;
  gap: number | null;
}

export interface MsaiScoreResult {
  skills: MsaiSkillResult[];
  quadrantScores: Record<MsaiQuadrant, number | null>;
  missingCount: number;
  dataGapNote: string;
  completed: boolean;
  total_answers: number;
  submitted_at: string;
}

export function calculateMsaiScore(answers: Record<string | number, any>): MsaiScoreResult {
  // Item N (1-based, per refs/docs/msai.md) lives at answer index N-1.
  const getItem = (n: number): number | null => {
    const a = answers[n - 1] ?? answers[String(n - 1)];
    return parseLikert(a);
  };

  let missingCount = 0;
  const skills: MsaiSkillResult[] = MSAI_SKILLS.map((def) => {
    const values: number[] = [];
    for (const itemNum of def.actualItems) {
      const v = getItem(itemNum);
      if (v === null) {
        missingCount++;
      } else {
        values.push(v);
      }
    }
    const actual = values.length > 0 ? values.reduce((a, b) => a + b, 0) / values.length : null;
    const effectiveness = getItem(def.effectivenessItem);
    const importance = getItem(def.importanceItem);
    const gap = importance !== null && actual !== null ? importance - actual : null;

    return {
      name: def.name,
      quadrant: def.quadrant,
      actual: actual !== null ? parseFloat(actual.toFixed(2)) : null,
      effectiveness,
      importance,
      gap,
    };
  });

  const quadrants: MsaiQuadrant[] = ['Adhocracy', 'Market', 'Hierarchy', 'Clan'];
  const quadrantScores = {} as Record<MsaiQuadrant, number | null>;
  for (const q of quadrants) {
    const members = skills.filter((s) => s.quadrant === q && s.actual !== null);
    quadrantScores[q] = members.length > 0
      ? parseFloat((members.reduce((sum, s) => sum + (s.actual as number), 0) / members.length).toFixed(2))
      : null;
  }

  return {
    skills,
    quadrantScores,
    missingCount,
    dataGapNote:
      missingCount > 0
        ? `${missingCount} item Actual Behaviour tidak dijawab oleh peserta ini — skor skill terkait dihitung proporsional dari item yang terisi.`
        : '',
    completed: true,
    total_answers: Object.keys(answers || {}).length,
    submitted_at: new Date().toISOString(),
  };
}
