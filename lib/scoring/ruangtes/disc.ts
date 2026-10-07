export type DiscDimension = 'D' | 'I' | 'S' | 'C';

export interface DiscRawScore {
  D: number;
  I: number;
  S: number;
  C: number;
}

export interface DiscGraphValues {
  D: number;
  I: number;
  S: number;
  C: number;
}

export interface DiscScoreResult {
  most: DiscRawScore;
  least: DiscRawScore;
  change: DiscRawScore;
  g1: DiscGraphValues; // Most (Graph 1)
  g2: DiscGraphValues; // Least (Graph 2)
  g3: DiscGraphValues; // Change (Graph 3)
  answered: number;
  dominantType: string;
  dominantLabel: string;
  subTraits: {
    g1: string;
    g2: string;
    g3: string;
  };
  isSuperSyndrome: boolean;
  isUndershift: boolean;
  hasStressPotential: boolean;
  recommendations: string[];
}

const KEYS: [string, string][] = [
  ["SIXC", "SIDC"], ["CDXS", "XDIS"], ["IXXD", "ICSX"], ["CSXD", "CSID"],
  ["SIXC", "SIDC"], ["CDIS", "XDIS"], ["SIXX", "XICD"], ["ISCD", "ISCD"],
  ["DCXX", "DCIS"], ["XDSI", "CDSX"], ["SXDC", "XIDC"], ["XCID", "SXID"],
  ["DSIX", "DXXC"], ["CISD", "CIXD"], ["SCID", "SXID"], ["XCIS", "DXIS"],
  ["XDSI", "CDSX"], ["DXXC", "DISX"], ["DSIX", "DXIC"], ["DSIC", "XSIX"],
  ["SDIX", "SDIC"], ["SXDC", "SIDC"], ["XISX", "DXSC"], ["XIDC", "SIXX"]
];

const TABEL: Record<string, (number | null)[]> = {
  "0": [-13, -15, -12, -13, 16, 15, 16, 16, 0, 1, 2, 3],
  "1": [-11, -10, -9, -10, 14, 13, 15, 15, 1, 3, 3, 6],
  "2": [-8, -5, -7, -7, 9, 8, 13, 12, 1, 4, 4, 8],
  "3": [-5, -2, -3, -3, 5, 5, 8, 8, 2, 6, 6, 9],
  "4": [-3, 2, -1, 1, 3, 2, 5, 5, 2, 8, 7, 12],
  "5": [-2, 6, 1, 4, 1, 0, 3, 3, 3, 9, 8, 13],
  "6": [0, 7, 2, 6, 0, -4, 1, 1, 4, 11, 9, 14],
  "7": [1, 11, 5, 11, -2, -6, -2, 0, 5, 12, 10, 14],
  "8": [2, 12, 6, 12, -3, -9, -4, -3, 7, 14, 11, 14],
  "9": [4, 13, 8, 13, -5, -11, -6, -5, 8, 14, 12, 14],
  "10": [6, 14, 10, 13, -6, -13, -9, -7, 10, 15, 13, 15],
  "11": [7, 15, 11, 14, -7, -14, -11, -11, 10, 15, 14, 15],
  "12": [8, 15, 12, 14, -9, -15, -13, -12, 11, 15, 14, 15],
  "13": [10, 15, 13, 15, -11, -15, -14, -13, 12, 15, 14, 15],
  "14": [11, 15, 14, 15, -12, -15, -14, -14, 13, 15, 14, 15],
  "15": [14, 15, 15, 15, -13, -15, -14, -15, 14, 15, 15, 15],
  "16": [15, 15, 15, 15, -14, -15, -15, -15, 14, 15, 15, 15],
  "17": [15, 15, 15, 16, -15, -15, -15, -16, 14, 15, 15, 16],
  "18": [15, 15, 15, null, -15, -15, -15, null, 15, 16, 15, null],
  "19": [15, 16, 15, null, -15, -16, -16, null, 15, null, 15, null],
  "20": [15, null, 16, null, -16, null, null, null, 15, null, 16, null],
  "21": [16, null, null, null, null, null, null, null, 16, null, null, null],
  "22": [null, null, null, null, null, null, null, null, null, null, null, null],
  "-1": [null, null, null, null, null, null, null, null, -1, 0, 0, 2],
  "-2": [null, null, null, null, null, null, null, null, -1, -3, -1, 1],
  "-3": [null, null, null, null, null, null, null, null, -2, -4, -2, 0],
  "-4": [null, null, null, null, null, null, null, null, -3, -6, -3, -1],
  "-5": [null, null, null, null, null, null, null, null, -4, -7, -4, -5],
  "-6": [null, null, null, null, null, null, null, null, -5, -9, -6, -6],
  "-7": [null, null, null, null, null, null, null, null, -6, -10, -7, -7],
  "-8": [null, null, null, null, null, null, null, null, -6, -12, -9, -9],
  "-9": [null, null, null, null, null, null, null, null, -7, -13, -10, -10],
  "-10": [null, null, null, null, null, null, null, null, -9, -14, -13, -12],
  "-11": [null, null, null, null, null, null, null, null, -11, -14, -14, -12],
  "-12": [null, null, null, null, null, null, null, null, -12, -14, -14, -12],
  "-13": [null, null, null, null, null, null, null, null, -13, -14, -14, -13],
  "-14": [null, null, null, null, null, null, null, null, -13, -14, -14, -13],
  "-15": [null, null, null, null, null, null, null, null, -13, -14, -15, -14],
  "-16": [null, null, null, null, null, null, null, null, -14, -14, -15, -14],
  "-17": [null, null, null, null, null, null, null, null, -14, -14, -15, -14],
  "-18": [null, null, null, null, null, null, null, null, -14, -15, -16, -14],
  "-19": [null, null, null, null, null, null, null, null, -14, null, null, -15],
  "-20": [null, null, null, null, null, null, null, null, -15, null, null, -15],
  "-21": [null, null, null, null, null, null, null, null, null, null, null, -15],
  "-22": [null, null, null, null, null, null, null, null, null, null, null, -16]
};

const ORDER: DiscDimension[] = ['D', 'I', 'S', 'C'];

import { findDiscTypeInfo } from './disc_dictionary';
const SARAN: Record<DiscDimension, string[]> = {
  D: [
    'Beri ruang otonomi, target yang menantang, dan kewenangan mengambil keputusan.',
    'Latih kesabaran untuk mendengarkan dan mempertimbangkan sudut pandang orang lain.',
    'Dorong agar lebih memperhatikan dampak gaya komunikasinya terhadap tim.'
  ],
  I: [
    'Manfaatkan kekuatan komunikasi dan kemampuan membangun jejaring.',
    'Bantu menjaga fokus pada detail, tenggat, dan tindak lanjut yang konkret.',
    'Berikan pengakuan dan apresiasi atas kontribusinya secara terbuka.'
  ],
  S: [
    'Sampaikan perubahan secara bertahap disertai alasan dan konteks yang jelas.',
    'Hargai kebutuhannya akan stabilitas dan hubungan kerja yang harmonis.',
    'Dorong untuk lebih asertif menyuarakan pendapat dan mengambil inisiatif.'
  ],
  C: [
    'Tetapkan standar, ekspektasi, dan prosedur yang jelas serta terukur.',
    'Beri waktu yang memadai untuk menganalisis sebelum mengambil keputusan.',
    'Dorong fleksibilitas dan keberanian memutuskan saat data belum lengkap.'
  ]
};

const SUB_TRAITS: Record<string, string> = {
  'DI': 'Efficiency',
  'DS': 'Self Motivation',
  'DC': 'Independence',
  'ID': 'Friendliness',
  'IS': 'Enthusiasm',
  'IC': 'Self Confidence',
  'SD': 'Patience',
  'SI': 'Thoughtfulness',
  'SC': 'Persistence',
  'CD': 'Cooperativeness',
  'CI': 'Accuracy',
  'CS': 'Sensitivity'
};

function lookupNorm(rawScore: number, colIndex: number): number {
  const keys = Object.keys(TABEL).map(Number);
  
  function nearestKey(r: number): number {
    if (TABEL[String(r)] !== undefined) return r;
    let best = keys[0];
    let bd = 1e9;
    for (const k of keys) {
      const d = Math.abs(k - r);
      if (d < bd) {
        bd = d;
        best = k;
      }
    }
    return best;
  }

  let r = nearestKey(rawScore);
  let v = TABEL[String(r)][colIndex];
  let guard = 0;

  while (v === null && guard < 40) {
    r += r > 0 ? -1 : 1;
    if (TABEL[String(r)] === undefined) {
      r = nearestKey(r);
    }
    v = TABEL[String(r)][colIndex];
    guard++;
  }

  return v === null ? 0 : v;
}

function getSubTrait(graph: DiscGraphValues): string {
  const sorted = [...ORDER].sort((a, b) => graph[b] - graph[a]);
  const high = sorted[0];
  const low = sorted[3];
  const pair = `${high}${low}`;
  return SUB_TRAITS[pair] || 'Balance';
}

function getDominantCode(graph: DiscGraphValues): string {
  const sorted = [...ORDER].sort((a, b) => graph[b] - graph[a]);
  if (graph[sorted[0]] - graph[sorted[1]] <= 2 && graph[sorted[1]] >= 1) {
    return `${sorted[0]}${sorted[1]}`;
  }
  return sorted[0];
}

export function calculateDiscScore(answers: Record<number | string, { P?: number | null; K?: number | null }>): DiscScoreResult {
  const most: DiscRawScore = { D: 0, I: 0, S: 0, C: 0 };
  const least: DiscRawScore = { D: 0, I: 0, S: 0, C: 0 };
  let answered = 0;

  for (let q = 0; q < 24; q++) {
    const a = answers[q] || answers[String(q)];
    if (!a) continue;

    if (a.P !== null && a.P !== undefined && a.K !== null && a.K !== undefined) {
      answered++;
    }

    if (a.P !== null && a.P !== undefined) {
      const pIdx = Number(a.P);
      const letter = KEYS[q]?.[0]?.[pIdx] as DiscDimension | undefined;
      if (letter && most[letter] !== undefined) {
        most[letter]++;
      }
    }

    if (a.K !== null && a.K !== undefined) {
      const kIdx = Number(a.K);
      const letter = KEYS[q]?.[1]?.[kIdx] as DiscDimension | undefined;
      if (letter && least[letter] !== undefined) {
        least[letter]++;
      }
    }
  }

  const change: DiscRawScore = {
    D: most.D - least.D,
    I: most.I - least.I,
    S: most.S - least.S,
    C: most.C - least.C
  };

  const g1: DiscGraphValues = { D: 0, I: 0, S: 0, C: 0 };
  const g2: DiscGraphValues = { D: 0, I: 0, S: 0, C: 0 };
  const g3: DiscGraphValues = { D: 0, I: 0, S: 0, C: 0 };

  ORDER.forEach((d, idx) => {
    g1[d] = lookupNorm(most[d], idx);
    g2[d] = lookupNorm(least[d], 4 + idx);
    g3[d] = lookupNorm(change[d], 8 + idx);
  });

  const dominantCode = getDominantCode(g3); // Primary is Graph 3 (Change)
  const typeInfo = findDiscTypeInfo(dominantCode);
  const dominantType = typeInfo?.name || 'DISC Profile';
  const dominantLabel = dominantCode;

  const isSuperSyndrome = ORDER.every(d => g3[d] > 0);
  const isUndershift = ORDER.every(d => g3[d] <= 0);

  const domG1 = getDominantCode(g1);
  const domG2 = getDominantCode(g2);
  const hasStressPotential = domG1[0] !== domG2[0];

  const primaryDim = dominantCode[0] as DiscDimension;
  let recommendations = SARAN[primaryDim] ? [...SARAN[primaryDim]] : [];
  if (dominantCode.length >= 2) {
    const secDim = dominantCode[1] as DiscDimension;
    if (SARAN[secDim]) {
      recommendations.push(`Pertimbangkan pula ciri khas ${secDim}: ${SARAN[secDim][0]}`);
    }
  }

  return {
    most,
    least,
    change,
    g1,
    g2,
    g3,
    answered,
    dominantType,
    dominantLabel,
    subTraits: {
      g1: getSubTrait(g1),
      g2: getSubTrait(g2),
      g3: getSubTrait(g3)
    },
    isSuperSyndrome,
    isUndershift,
    hasStressPotential,
    recommendations
  };
}
