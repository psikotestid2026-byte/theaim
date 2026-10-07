import { BIG_FIVE_NARRATIVES } from './bigfive-narratives';

const DIMENSIONS = {
  E: [1, 6, 11, 16, 21, 26, 31, 36],
  A: [2, 7, 12, 17, 22, 27, 32, 37, 42],
  C: [3, 8, 13, 18, 23, 28, 33, 38, 43],
  N: [4, 9, 14, 19, 24, 29, 34, 39],
  O: [5, 10, 15, 20, 25, 30, 35, 40, 41, 44]
};

const REVERSED_ITEMS = [2, 6, 8, 9, 12, 18, 21, 23, 24, 27, 31, 34, 35, 37, 41, 43];

const VALUE_MAP: Record<string, number> = {
  'Sangat Tidak Setuju': 1,
  'Tidak Setuju': 2,
  'Netral': 3,
  'Setuju': 4,
  'Sangat Setuju': 5,
};

export function calculateBigFiveScore(answers: Record<string, string>) {
  const scores: Record<string, { sum: number; count: number }> = {
    E: { sum: 0, count: 0 },
    A: { sum: 0, count: 0 },
    C: { sum: 0, count: 0 },
    N: { sum: 0, count: 0 },
    O: { sum: 0, count: 0 },
  };

  for (const [key, value] of Object.entries(answers || {})) {
    const questionNumber = parseInt(key) + 1;
    
    const normalizedValue = String(value).trim();
    let rawScore = VALUE_MAP[normalizedValue];
    
    if (rawScore === undefined && !isNaN(Number(normalizedValue))) {
       rawScore = Number(normalizedValue);
    }
    
    if (rawScore === undefined || rawScore < 1 || rawScore > 5) continue;

    const isReversed = REVERSED_ITEMS.includes(questionNumber);
    const finalScore = isReversed ? (6 - rawScore) : rawScore;

    let foundDim = null;
    for (const [dim, items] of Object.entries(DIMENSIONS)) {
      if (items.includes(questionNumber)) {
        foundDim = dim;
        break;
      }
    }

    if (foundDim) {
      scores[foundDim].sum += finalScore;
      scores[foundDim].count += 1;
    }
  }

  const finalResults: Record<string, { raw: number; max: number; percent: number; category: string; narrative: string }> = {};
  
  for (const [dim, data] of Object.entries(scores)) {
    const finalMax = data.count * 5;
    const finalPercent = finalMax > 0 ? (data.sum / finalMax) * 100 : 0;
    
    let category = 'Rendah';
    if (finalPercent >= 75) {
      category = 'Tinggi';
    } else if (finalPercent >= 50) {
      category = 'Sedang';
    }

    finalResults[dim] = {
      raw: data.sum,
      max: finalMax,
      percent: parseFloat(finalPercent.toFixed(2)),
      category: category,
      narrative: BIG_FIVE_NARRATIVES[dim as keyof typeof BIG_FIVE_NARRATIVES]?.[category as keyof (typeof BIG_FIVE_NARRATIVES)[keyof typeof BIG_FIVE_NARRATIVES]] || '',
    };
  }

  return {
    completed: true,
    total_answers: Object.keys(answers || {}).length,
    submitted_at: new Date().toISOString(),
    dimensions: finalResults,
  };
}
