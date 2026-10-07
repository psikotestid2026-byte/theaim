/**
 * WPT (Wonderlic Personnel Test) Scoring Engine
 * Synchronized with refs/psikoscoring engine and norm tables.
 */

export const WPT_RS_TO_IQ = [
  59,  // RS 0
  59,  // RS 1
  61,  // RS 2
  64,  // RS 3
  67,  // RS 4
  69,  // RS 5
  71,  // RS 6
  73,  // RS 7
  75,  // RS 8
  78,  // RS 9
  80,  // RS 10
  81,  // RS 11
  83,  // RS 12
  86,  // RS 13
  88,  // RS 14
  90,  // RS 15
  93,  // RS 16
  95,  // RS 17
  97,  // RS 18
  98,  // RS 19
  100, // RS 20
  102, // RS 21
  104, // RS 22
  106, // RS 23
  108, // RS 24
  111, // RS 25
  113, // RS 26
  114, // RS 27
  116, // RS 28
  118, // RS 29
  120, // RS 30
  121, // RS 31
  123, // RS 32
  125, // RS 33
  126, // RS 34
  128, // RS 35
  130, // RS 36
  132, // RS 37
  134, // RS 38
  136, // RS 39
  138, // RS 40
  140, // RS 41
  142, // RS 42
  143, // RS 43
  146, // RS 44
  146, // RS 45
  146, // RS 46
  146, // RS 47
  146, // RS 48
  146, // RS 49
  146, // RS 50
];

export const WPT_CATEGORIES = [
  { minIQ: 130, label: 'Sangat Superior', description: 'Kapasitas kognitif dan daya tangkap logika sangat luar biasa.' },
  { minIQ: 120, label: 'Superior', description: 'Kapasitas analitis sangat baik, mampu memecahkan arsitektur permasalahan yang rumit dengan cepat.' },
  { minIQ: 110, label: 'Rata-rata Atas', description: 'Kapasitas intelektual di atas rata-rata populasi umum.' },
  { minIQ: 100, label: 'Rata-rata', description: 'Kapasitas intelektual dan kognitif umum berada pada tingkat rata-rata populasi.' },
  { minIQ: 90,  label: 'Rata-rata Bawah', description: 'Daya tangkap logika cukup baik namun membutuhkan waktu belajar lebih.' },
  { minIQ: 80,  label: 'Di Bawah Rata-rata', description: 'Kapasitas pemecahan masalah berada di bawah rata-rata.' },
  { minIQ: 0,   label: 'Sangat Rendah', description: 'Kapasitas intelektual memerlukan pendampingan intensif.' },
];

export const WPT_ANSWER_KEYS: Record<number, string | string[]> = {
  1: 'Desember',
  2: 'Membebaskan',
  3: 'Mobil',
  4: ['Tidak', 'jawablah yang tidak perlu', 'jawablah jika tidak perlu'],
  5: 'Berpartisipasi',
  6: ['Jarang', 'Luar Biasa'],
  7: 'Bentuk 3',
  8: ['1/8', '0.125', '0,125'],
  9: 'Memiliki arti yang sama',
  10: ['Bau wangi', 'Hidung'],
  11: 'Musim Semi',
  12: ['6000', '6.000 kaki', '6000 kaki'],
  13: 'Benar',
  14: 'Dekat',
  15: ['20', '20 rupiah'],
  16: ['2', '2 pasang'],
  17: ['A', 'S', 'P', 'D', 'M'],
  18: ['13', '13 tahun'],
  19: 'Memiliki tata bahasa dan arti berbeda',
  20: 'Benar',
  21: ['20', '20 barel'],
  22: 'Salah',
  23: ['1 dan 3', '1,3', '1 & 3', '1 dan 2'],
  24: ['2', '2 detik'],
  25: 'Memiliki arti berbeda',
  26: 'Benar',
  27: ['3.33 sen', '3,33', '3.33', '1/30'],
  28: 'Memiliki arti berbeda',
  29: ['6', '6 ikan'],
  30: ['216 m³', '216', '216 m3'],
  31: ['1/100000', '1/100.000', '1/9'],
  32: 'Ya',
  33: 'Memiliki arti berbeda',
  34: ['20', '20 rok'],
  35: ['0.25', '0.25 detik', '0,25', '0,25 detik'],
  36: ['24', '24 permainan'],
  37: '82',
  38: 'Dua segitiga siku-siku sama kaki',
  39: 'Karyawan/alat baru sering bekerja sangat efisien',
  40: ['3', '3 pasangan'],
  41: ['1 dan 3', '1,3', '1 & 3'],
  42: 'Dua trapesium siku-siku',
  43: '0.33',
  44: 'Kejujuran adalah nilai moral yang tidak perlu disesali',
  45: ['Rp 1.250', '1250', '1.250'],
  46: 'Kubus',
  47: 'Salah (Sesat Pikir)',
  48: ['Rp 300.000', '300000', '300.000'],
  49: ['Potongan 1, 2, 4, 5', '1,2,4,5', '1245'],
  50: ['50 menit', '50'],
};

export function normalizeWptAnswer(val: any): string {
  if (val === undefined || val === null) return '';
  let s = String(val).trim().toLowerCase();
  // Strip common trailing zeroes or punctuation
  if (s.endsWith('.0') && !s.includes('/')) {
    s = s.slice(0, -2);
  }
  return s;
}

export function checkWptAnswer(qNum: number, rawAns: any): boolean {
  if (rawAns === undefined || rawAns === null) return false;
  const ans = normalizeWptAnswer(rawAns);
  if (!ans) return false;

  const key = WPT_ANSWER_KEYS[qNum];
  if (!key) return false;

  if (Array.isArray(key)) {
    return key.some(k => {
      const normK = normalizeWptAnswer(k);
      return ans === normK || ans.includes(normK) || normK.includes(ans);
    });
  }

  const normKey = normalizeWptAnswer(key);
  return ans === normKey || ans.includes(normKey) || normKey.includes(ans);
}

export function calculateWptScore(rawAnswers: Record<string, any>) {
  let rs = 0;

  for (let qNum = 1; qNum <= 50; qNum++) {
    // rawAnswers can be indexed by 0-based index or 1-based index or question id
    const userAns = rawAnswers[qNum - 1] ?? rawAnswers[qNum] ?? rawAnswers[String(qNum - 1)] ?? rawAnswers[String(qNum)];
    if (checkWptAnswer(qNum, userAns)) {
      rs++;
    }
  }

  const iqIndex = Math.max(0, Math.min(rs, WPT_RS_TO_IQ.length - 1));
  const iq = WPT_RS_TO_IQ[iqIndex];

  let kategoriObj = WPT_CATEGORIES[WPT_CATEGORIES.length - 1];
  for (const cat of WPT_CATEGORIES) {
    if (iq >= cat.minIQ) {
      kategoriObj = cat;
      break;
    }
  }

  return {
    raw_score: rs,
    iq,
    score: String(iq),
    label: kategoriObj.label,
    description: kategoriObj.description,
    category: kategoriObj,
  };
}
