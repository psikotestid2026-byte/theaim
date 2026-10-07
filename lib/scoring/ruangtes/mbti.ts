// MBTI scoring — 70-item forced-choice A/B instrument.
// Answers are keyed by question index (0-based, matches question_banks.order_number - 1),
// value = the exact option text the participant selected (option[0] = pole A, option[1] = pole B),
// following the same convention as lib/scoring/papi.ts.
//
// Structure verified against refs/docs/mbti.md Section 3 and the live question_banks rows
// (test_code='mbti'): 70 items arranged in 10 blocks of 7 positions. Position-in-block
// determines the dimension pair; option index 0 = first pole (E/S/T/J), option index 1 =
// second pole (I/N/F/P). This mapping is purely positional (not dependent on exact item
// wording), so it is safe to apply even though the full canonical item text is not itself
// documented elsewhere.

export type MbtiPoleGroup = 'EI' | 'SN' | 'TF' | 'JP';

// Position within each 7-item block (1-7) -> dimension group.
const BLOCK_POSITION_GROUP: Record<number, MbtiPoleGroup> = {
  1: 'EI',
  2: 'SN',
  3: 'SN',
  4: 'TF',
  5: 'TF',
  6: 'JP',
  7: 'JP',
};

const GROUP_POLES: Record<MbtiPoleGroup, [string, string]> = {
  EI: ['E', 'I'],
  SN: ['S', 'N'],
  TF: ['T', 'F'],
  JP: ['J', 'P'],
};

const GROUP_MAX_ITEMS: Record<MbtiPoleGroup, number> = {
  EI: 10,
  SN: 20,
  TF: 20,
  JP: 20,
};

// [optionTextA (first pole), optionTextB (second pole)] for each of the 70 items, in
// order_number order. Source: live question_banks rows for test_code='mbti' (verified to
// match refs/docs/mbti.md's technical matching dictionary in Section 5, e.g. item 2
// "realistik"/"spekulatif", item 4 "prinsip"/"perasaan").
const MBTI_OPTIONS: [string, string][] = [
  ['bergaul dengan banyak orang termasuk orang-orang yang baru Anda kenal', 'bergaul dengan beberapa orang yang telah Anda kenal saja'],
  ['realistik', 'spekulatif'],
  ['tenggelam dalam mengandai-andai', 'terlanjur basah kerepotan di tengah jalan'],
  ['prinsip', 'perasaan'],
  ['argumen logis', 'argumen emotif (feeling)'],
  ['menggunakan batas waktu', 'kapan-kapan saja'],
  ['secara berhati-hati', 'secara spontan'],
  ['tinggal sampai pesta berakhir dengan semakin segar', 'meninggalkan pesta lebih cepat dengan kondisi capai/lelah'],
  ['banyak menggunakan akal sehat', 'imajinatif'],
  ['apa yang aktual', 'apa yang mungkin'],
  ['hukum daripada situasi/keadaannya', 'situasi/keadaannya daripada hukum'],
  ['tidak melibatkan perasaan dan menjaga jarak', 'melibatkan diri secara pribadi dan mencoba membuat orang tersebut tertarik'],
  ['tepat waktu', 'santai'],
  ['tidak lengkap/tidak terselesaikan', 'sudah lengkap/terselesaikan'],
  ['mengetahui kejadian-kejadian yang dialami oleh orang lain', 'biasanya ketinggalan berita'],
  ['mengerjakannya dengan cara lazimnya orang', 'mengerjakannya dengan cara Anda sendiri'],
  ['menuliskan kata-kata dengan arti yang sebenarnya', 'menggunakan kiasan-kiasan'],
  ['konsisten dan teguh dengan pemikiran/ide Anda', 'menjaga keharmonisan hubungan sosial'],
  ['keputusan logis', 'keputusan berdasar nilai-nilai'],
  ['menyukai segala hal terselesaikan', 'membiarkan berbagai pilihan dengan berbagai kemungkinan'],
  ['tegas, saklek, keras pendirian/kemauan', 'nyantai, bisa menyesuaikan pendirian/kemauan (easy-going)'],
  ['langsung berbicara', 'menyusun dulu kata-kata yang diucapkan'],
  ['menggambarkan apa yang terjadi', 'biasanya perlu diinterpretasi'],
  ['informasi praktis', 'ide-ide abstrak'],
  ['berpikiran jernih', 'berperasaan hangat'],
  ['adil daripada pemaaf', 'pemaaf daripada adil'],
  ['harus direncanakan dan berdasarkan pilihan', 'biarlah berjalan dengan sendirinya'],
  ['langsung beli/dipesankan', 'mempunyai pilihan-pilihan'],
  ['memulai pembicaraan-pembicaraan', 'menunggu untuk ditanya'],
  ['biasanya bisa dipercaya', 'sering menimbulkan salah tafsir'],
  ['cukup sering melakukan kegiatan bermanfaat', 'cukup berfantasi'],
  ['mempertahankan prinsip', 'bersikap simpatik'],
  ['tegas daripada lemah lembut', 'lemah-lembut daripada tegas'],
  ['terorganisasi dengan baik', 'terbuka untuk kemungkinan-kemungkinan'],
  ['sesuatu yang pasti', 'sesuatu yang berubah-ubah'],
  ['menggugah semangat Anda', 'menguras tenaga Anda'],
  ['orang yang praktis', 'orang yang teoritis'],
  ['dari bagaimana kemanfaatannya', 'dari bagaimana kelihatannya'],
  ['mendiskusikan suatu topik sampai tuntas', 'mencapai kesepakatan tentang suatu permasalahan'],
  ['pemikiran', 'perasaan'],
  ['berdasarkan kontrak', 'tidak terikat'],
  ['rapi dan teratur', 'tergantung situasi'],
  ['banyak teman dengan hubungan yang singkat', 'beberapa teman dengan hubungan yang lama/langgeng'],
  ['fakta-fakta', 'kaidah-kaidah'],
  ['produksi dan distribusi/hasil akhir', 'perencana, penelitian'],
  ['orang yang sangat logis', 'orang yang sangat sentimentil (mengedepankan perasaan)'],
  ['berpendirian teguh', 'penuh pengabdian'],
  ['pernyataan-pernyataan final dan tidak bisa diganggu-gugat', 'pernyataan-pernyataan tidak bersifat pasti (tentative)/masih awal'],
  ['sesudah pengambilan keputusan', 'sebelum pengambilan keputusan'],
  ['berbicara dengan mudah dan panjang lebar dengan orang yang baru dikenal', 'sulit bicara dengan orang yang baru dikenal'],
  ['pengalaman-pengalaman', 'firasat/dugaan/prasangka'],
  ['lebih praktis daripada kreatif', 'lebih kreatif daripada praktis'],
  ['rasio jelas', 'perasaan yang kuat'],
  ['adil apa adanya/tanpa prasangka', 'manruh perhatian (simpatis)'],
  ['memastikan segala sesuatu ditata dahulu', 'membiarkan hal-hal yang terjadi begitu saja'],
  ['mengatur segala sesuatu', 'menunda-nunda penyelesaian'],
  ['segera menerima telepon tersebut', 'berharap orang lain yang menerimanya'],
  ['kemampuan memahami realita', 'kemampuan imajinasi yang baik'],
  ['azas', 'penyesuaian'],
  ['netral', 'pemurah'],
  ['keras hati/teguh', 'lunak hati/halus'],
  ['kejadian-kejadian yang telah terjadwal', 'kejadian-kejadian yang datang begitu saja'],
  ['hal-hal yang bersifat rutin', 'hal-hal yang tidak biasa'],
  ['mudah didekati', 'agak menjaga jarak'],
  ['memakai kata-kata dengan arti yang sebenarnya', 'menggunakan kata-kata kiasan'],
  ['mengalami sendiri dan nyata', 'membayangkan'],
  ['berpikiran jernih', 'menunjukkan perasaan yang kuat'],
  ['adil daripada toleran', 'toleran daripada adil'],
  ['kegiatan yang terencana', 'kegiatan yang tidak terencana'],
  ['hati-hati daripada spontan', 'spontan daripada hati-hati'],
];

export interface MbtiScoreResult {
  raw: { E: number; I: number; S: number; N: number; T: number; F: number; J: number; P: number };
  percent: { E: number; I: number; S: number; N: number; T: number; F: number; J: number; P: number };
  type: string;
  unanswered: number;
  validityStatus: 'Valid' | 'Kurang Lengkap' | 'Tidak Valid';
  completed: boolean;
  total_answers: number;
  submitted_at: string;
}

function norm(s: unknown): string {
  return String(s ?? '').trim().toLowerCase().replace(/\s+/g, ' ');
}

function groupForItem(index0: number): MbtiPoleGroup {
  const position = (index0 % 7) + 1; // 1-based position within its block of 7
  return BLOCK_POSITION_GROUP[position];
}

export function calculateMbtiScore(answers: Record<string | number, unknown>): MbtiScoreResult {
  const raw = { E: 0, I: 0, S: 0, N: 0, T: 0, F: 0, J: 0, P: 0 };
  let unanswered = 0;

  for (let i = 0; i < 70; i++) {
    const a = answers[i] ?? answers[String(i)];
    const group = groupForItem(i);
    const [poleA, poleB] = GROUP_POLES[group];

    if (a === undefined || a === null || norm(a) === '') {
      unanswered++;
      continue;
    }

    const val = norm(a);
    const opts = MBTI_OPTIONS[i];

    let matchedPole: string | null = null;
    if (opts) {
      if (val === norm(opts[0])) matchedPole = poleA;
      else if (val === norm(opts[1])) matchedPole = poleB;
    }

    // Fallback: literal 'a'/'b' style answers.
    if (!matchedPole) {
      // TheAIM stores option values "1"/"2" (first/second pole). RuangTes also accepts a/b.
      if (val === 'a' || val === '1') matchedPole = poleA;
      else if (val === 'b' || val === '2') matchedPole = poleB;
    }

    if (matchedPole) {
      raw[matchedPole as keyof typeof raw]++;
    } else {
      unanswered++;
    }
  }

  const percent = {
    E: Math.round((raw.E / GROUP_MAX_ITEMS.EI) * 100),
    I: Math.round((raw.I / GROUP_MAX_ITEMS.EI) * 100),
    S: Math.round((raw.S / GROUP_MAX_ITEMS.SN) * 100),
    N: Math.round((raw.N / GROUP_MAX_ITEMS.SN) * 100),
    T: Math.round((raw.T / GROUP_MAX_ITEMS.TF) * 100),
    F: Math.round((raw.F / GROUP_MAX_ITEMS.TF) * 100),
    J: Math.round((raw.J / GROUP_MAX_ITEMS.JP) * 100),
    P: Math.round((raw.P / GROUP_MAX_ITEMS.JP) * 100),
  };

  // Tie-break: seri jatuh ke kutub kedua (I, N, F, P) — sesuai refs/docs/mbti.md Bagian 4.5.
  const type =
    (raw.E > raw.I ? 'E' : 'I') +
    (raw.S > raw.N ? 'S' : 'N') +
    (raw.T > raw.F ? 'T' : 'F') +
    (raw.J > raw.P ? 'J' : 'P');

  let validityStatus: MbtiScoreResult['validityStatus'] = 'Valid';
  if (unanswered > 15) validityStatus = 'Tidak Valid';
  else if (unanswered > 5) validityStatus = 'Kurang Lengkap';

  return {
    raw,
    percent,
    type,
    unanswered,
    validityStatus,
    completed: true,
    total_answers: Object.keys(answers || {}).length,
    submitted_at: new Date().toISOString(),
  };
}
