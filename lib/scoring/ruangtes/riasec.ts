// Holland RIASEC scoring — implements refs/docs/riasec.md Section 4.
// Answers keyed by question index (0-based, matches question_banks.order_number - 1),
// value = the exact option text the participant selected. The live question_banks rows
// for 'riasec' use options ["Suka", "Tidak Suka"] (see QuestionStage.tsx fallback), so
// both that pair and the doc's original "Ya"/"Tidak" wording are accepted.

export type RiasecType = 'R' | 'I' | 'A' | 'S' | 'E' | 'C';

const TYPE_ORDER: RiasecType[] = ['R', 'I', 'A', 'S', 'E', 'C'];

// Dimension for each of the 108 items, in order_number order.
// Source: refs/docs/riasec.md Section 3 (identical to the seeded question_banks rows).
const RIASEC_DIMENSIONS: RiasecType[] = [
  'A', 'S', 'A', 'I', 'I', 'A', 'I', 'R', 'I', 'C',
  'E', 'C', 'C', 'R', 'A', 'C', 'I', 'S', 'E', 'R',
  'E', 'I', 'A', 'R', 'S', 'E', 'I', 'S', 'C', 'R',
  'S', 'I', 'R', 'A', 'A', 'S', 'A', 'I', 'S', 'E',
  'S', 'I', 'R', 'R', 'A', 'A', 'A', 'C', 'S', 'C',
  'C', 'A', 'S', 'S', 'S', 'I', 'I', 'E', 'R', 'E',
  'R', 'C', 'I', 'E', 'A', 'R', 'E', 'E', 'E', 'C',
  'I', 'S', 'R', 'I', 'E', 'A', 'R', 'S', 'R', 'I',
  'A', 'R', 'R', 'C', 'C', 'E', 'S', 'C', 'E', 'C',
  'A', 'E', 'I', 'R', 'E', 'C', 'S', 'I', 'S', 'C',
  'R', 'A', 'S', 'A', 'E', 'E', 'C', 'C',
];

const CONSISTENCY_MAP: Record<'high' | 'medium' | 'low', string[]> = {
  high: ['RI', 'RC', 'IR', 'IA', 'AI', 'AS', 'SA', 'SE', 'ES', 'CE', 'EC', 'CR'],
  medium: ['RA', 'RE', 'IS', 'IC', 'AR', 'AE', 'SI', 'SC', 'EA', 'ER', 'CS', 'CI'],
  low: ['RS', 'IE', 'AC', 'SR', 'EI', 'CA'],
};

export const RIASEC_TYPE_DETAILS: Record<RiasecType, { name: string; color: string; desc: string; professions: string[] }> = {
  R: { name: 'Realistic', color: '#f97316', desc: 'Profil ini menyukai pekerjaan yang mencakup masalah dan jawaban praktis dan langsung. Menyukai kegiatan yang melibatkan keterampilan motorik, peralatan, mesin.', professions: ['Mekanik', 'Insinyur', 'Pengawas Bangunan', 'Petani/Peternak Modern', 'Atlet', 'Operator', 'Polisi', 'Pemadam Kebakaran', 'Koki'] },
  I: { name: 'Investigative', color: '#3b82f6', desc: 'Profil ini menyukai pekerjaan yang berkaitan dengan ide dan pemikiran. Memilih kegiatan penyelidikan yang observasional, simbolis, sistematis dan kreatif.', professions: ['Ahli antropologi', 'Ahli astronomi', 'Ahli biologi', 'Ahli botani', 'Ahli kimia', 'Editor penerbitan ilmiah', 'Ahli geologi', 'Peneliti'] },
  A: { name: 'Artistic', color: '#ec4899', desc: 'Profil ini menyukai pekerjaan dan aktivitas yang bebas, tidak sistematis. Memiliki kompetensi artistik, bahasa, musik, drama, mengarang.', professions: ['Desainer', 'Penulis', 'Musisi', 'Arsitek', 'Wartawan', 'Penari', 'Translator', 'Artis'] },
  S: { name: 'Social', color: '#22c55e', desc: 'Profil ini menyukai aktivitas yang melibatkan berelasi, berkomunikasi dan mengajar orang. Pekerjaannya sering melibatkan membantu atau memberikan layanan kepada orang lain.', professions: ['Guru', 'Terapis', 'Tour Guide', 'Perawat', 'Hakim', 'Konselor', 'Psikolog', 'Sejarawan', 'Pekerja Sosial'] },
  E: { name: 'Enterprising', color: '#eab308', desc: 'Profil ini mendorong individu menikmati memanipulasi kegiatan orang lain dalam usahanya mencapai tujuan organisasi atau keuntungan ekonomi. Memiliki kompetensi kepemimpinan dan persuasif.', professions: ['Pengacara', 'Politikus', 'Pegawai Humas', 'Manajer Penjualan', 'Staf Penjualan', 'Perwakilan Dagang'] },
  C: { name: 'Conventional', color: '#8b5cf6', desc: 'Profil ini menyukai aktivitas yang teratur dan sistematis seperti mengarsipkan sesuatu, mereproduksi material, mencatat dan mengolah data. Menyukai prosedur dan rutinitas yang ditetapkan.', professions: ['Akuntan', 'Aktuaris', 'Ahli Statistik', 'Analis Keuangan', 'Operator Komputer', 'Pustakawan', 'Programer Bisnis', 'Pengarsip'] },
};

const COMBO_PROFESSIONS: Record<string, string[]> = {
  RI: ['Network Engineer', 'Mechanical Engineer', 'Automotive Engineer', 'Electronic Engineer', 'Pilot', 'Laboratory Technician'],
  RC: ['Lorry Driver', 'Machine Operator', 'Security Guard', 'Plumber', 'Warehouse Operative', 'Service Technician'],
  RA: ['Photographer', 'Tailor', 'Artist', 'Pastry Chef', 'Furniture Designer'],
  RE: ['Koki', 'Engineering Manager', 'Police Officer', 'Process Operator', 'Taxi Driver'],
  RS: ['Asisten Perawatan', 'Fire Fighter', 'Masseur', 'Sports Coach', 'Veterinary Assistant'],
  IR: ['Aerospace Engineer', 'Biomedical Engineer', 'Biologist', 'Electrical Engineer', 'Veterinarian'],
  IA: ['Architect', 'Technical Writer', 'Animator', 'Desktop Publisher'],
  IS: ['Dokter', 'Physics Teacher', 'Nurse', 'Physiotherapist', 'Coach'],
  IC: ['Software Developer', 'UX Designer', 'Paralegal', 'Data Analyst', 'Quality Controller'],
  IE: ['Consultant', 'Detektif', 'Market Researcher', 'Business Controller', 'Online Marketer'],
  AI: ['Architect', 'Poet', 'Special Effects Artist', 'Animator'],
  AS: ['Guru', 'Translator', 'Nanny', 'Career Advisor', 'Interpreter'],
  AE: ['Design Interior', 'Illustrator', 'Entrepreneur', 'Journalist', 'Producer', 'Art Director', 'Copywriter'],
  AR: ['Camera Operator', 'Furniture Finisher', 'Museum Technician', 'Sound Engineering Technician'],
  AC: ['Graphic Designer', 'Proofreader', 'Web/Mobile Design', 'UI Designer', 'Visual Designer'],
  SA: ['Interpreter', 'Translator', 'Choreographer'],
  SE: ['HR Manager', 'Account Manager', 'Customer Service Advisor', 'Waiter/Waitress'],
  SI: ['Dokter', 'Audiologist', 'Dietitian', 'Epidemiologist', 'School Psychologist'],
  SC: ['Librarian', 'Telephone Operator', 'Medical Assistant', 'Teaching Assistant'],
  SR: ['Asisten Perawatan', 'Fire Fighter', 'Sports Coach'],
  EA: ['Talent Director', 'Advertising Manager', 'Producer', 'Public Relations Specialist'],
  EC: ['General Manager', 'Air Traffic Controller', 'Branch Manager', 'Fundraiser', 'Recruiter'],
  ES: ['HR Manager', 'Social and Community Service Manager', 'Training and Development Manager'],
  ER: ['Koki', 'Engineering Manager', 'Police Officer'],
  EI: ['Lawyer', 'Natural Sciences Manager'],
  CE: ['Bill Collector', 'Bookkeeper', 'Cost Estimator', 'Cashier', 'Legal Secretary', 'Tax Examiner'],
  CS: ['Medical Secretary', 'Library Technician', 'Social and Human Service Assistant'],
  CR: ['Postal Clerk', 'Pharmacy Technician', 'Medical Transcriptionist', 'Meter Reader'],
  CI: ['Archivist', 'Database Administrator', 'Statistician', 'Clinical Data Manager'],
  CA: ['Proofreader', 'Copy Marker'],
};

export interface RiasecScoreResult {
  scores: Record<RiasecType, number>;
  ranking: RiasecType[];
  interestCode: string;
  consistency: 'Tinggi' | 'Sedang' | 'Rendah' | 'Tidak Diketahui';
  comboProfessions: string[];
  totalYa: number;
  unanswered: number;
  completed: boolean;
  total_answers: number;
  submitted_at: string;
}

function norm(s: any): string {
  return String(s ?? '').trim().toLowerCase();
}

function isYes(val: string): boolean {
  if (['ya', 'y', '1', 'true', 'suka'].includes(val)) return true;
  if (val.startsWith('ya') || val.startsWith('suka')) return true;
  return false;
}

function isNo(val: string): boolean {
  if (['tidak', 'n', '0', 'false', 'x', 'tidak suka'].includes(val)) return true;
  if (val.startsWith('ti') || val.startsWith('tidak')) return true;
  return false;
}

export function calculateRiasecScore(answers: Record<string | number, any>): RiasecScoreResult {
  const scores = { R: 0, I: 0, A: 0, S: 0, E: 0, C: 0 } as Record<RiasecType, number>;
  let totalYa = 0;
  let unanswered = 0;

  for (let i = 0; i < RIASEC_DIMENSIONS.length; i++) {
    const raw = answers[i] ?? answers[String(i)];
    const val = norm(raw);
    const dim = RIASEC_DIMENSIONS[i];

    if (val === '') {
      unanswered++;
      continue;
    }

    if (isYes(val)) {
      scores[dim]++;
      totalYa++;
    } else if (isNo(val)) {
      // counted as answered, no score
    } else {
      unanswered++;
    }
  }

  const ranking = [...TYPE_ORDER].sort((a, b) => {
    if (scores[b] !== scores[a]) return scores[b] - scores[a];
    return TYPE_ORDER.indexOf(a) - TYPE_ORDER.indexOf(b);
  });

  const top3 = ranking.slice(0, 3);
  const interestCode = top3.join('');

  const pair = `${top3[0]}${top3[1]}`;
  const pairReversed = `${top3[1]}${top3[0]}`;
  let consistency: RiasecScoreResult['consistency'] = 'Tidak Diketahui';
  if (CONSISTENCY_MAP.high.includes(pair) || CONSISTENCY_MAP.high.includes(pairReversed)) consistency = 'Tinggi';
  else if (CONSISTENCY_MAP.medium.includes(pair) || CONSISTENCY_MAP.medium.includes(pairReversed)) consistency = 'Sedang';
  else if (CONSISTENCY_MAP.low.includes(pair) || CONSISTENCY_MAP.low.includes(pairReversed)) consistency = 'Rendah';

  const comboProfessions = COMBO_PROFESSIONS[pair] || COMBO_PROFESSIONS[pairReversed] || [];

  return {
    scores,
    ranking,
    interestCode,
    consistency,
    comboProfessions,
    totalYa,
    unanswered,
    completed: true,
    total_answers: Object.keys(answers || {}).length,
    submitted_at: new Date().toISOString(),
  };
}
