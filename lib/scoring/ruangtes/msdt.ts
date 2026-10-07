// MSDT (Management Style Diagnostic Test) scoring — implements refs/docs/msdt.md Section 5.
// Answers keyed by question index (0-based, matches question_banks.order_number - 1),
// value = the exact statement text the participant selected (Pernyataan A or B).

export type MsdtDimension = 'Ds' | 'Mi' | 'Au' | 'Co' | 'Bu' | 'Dv' | 'Ba' | 'E';

const DIMENSION_ORDER: MsdtDimension[] = ['Ds', 'Mi', 'Au', 'Co', 'Bu', 'Dv', 'Ba', 'E'];

const CORRECTION: Record<MsdtDimension, number> = {
  Ds: 1, Mi: 2, Au: 1, Co: 0, Bu: 3, Dv: -1, Ba: 0, E: -4,
};

// [statementA, statementB] for each of the 64 items, in order_number order.
// Source: refs/docs/msdt.md Section 4 (identical to the seeded question_banks rows).
// Grid position for item i (0-based): block = floor(i/8), position = i % 8.
const MSDT_KEYS: [string, string][] = [
  ['Saya mengabaikan pelanggar-pelanggar peraturan bila saya merasa pasti bahwa tidak ada satu orangpun yang mengetahui tentang pelanggar-pelanggar tersebut.', 'Bila saya mengumumkan suatu keputusan yang kurang menyenangkan, saya akan menjelaskan kepada bawahan saya bahwa keputusan ini dibuat oleh Direktur.'],
  ['Bila ada seorang karyawan yang hasil kerjanya selalu tidak memuaskan saya, saya akan menunggu suatu kesempatan untuk memindahkannya dan bukan untuk memecatnya.', 'Bila ada bawahan saya yang dikucilkan dari kelompok kerjanya, saya akan mencarikan cara-cara agar supaya orang lain dapat berteman dengannya.'],
  ['Bila Direktur memberikan perintah yang kurang menyenangkan, saya pikir adalah cukup bijaksana bila saya menyebutkan namanya dan bukan nama saya.', 'Saya biasanya membuat keputusan-keputusan saya sendiri dan menyampaikannya kepada bawahan saya.'],
  ['Bila saya ditegur oleh atasan saya, saya akan memanggil semua bawahan saya dan mengatakan semua teguran tersebut kepada mereka.', 'Saya selalu memberikan tugas-tugas yang sangat sulit kepada karyawan-karyawan yang paling berpengalaman.'],
  ['Saya selalu melakukan diskusi-diskusi untuk mencapai kata sepakat.', 'Saya selalu menganjurkan kepada bawahan saya untuk memberikan usul-usul, tetapi kadang-kadang juga saya langsung membuat suatu tindakan tertentu.'],
  ['Kadang-kadang saya berpikir bahwa perasaan-perasaan saya dan sikap-sikap saya adalah mementingkan tugas saya.', 'Saya mengijinkan bawahan-bawahan saya untuk ikut serta mengambil keputusan yang dibuat berdasarkan atas suara terbanyak.'],
  ['Bila jumlah dan mutu hasil kerja bagian saya tidak memuaskan, saya menjelaskan kepada bawahan-bawahan saya bahwa Direktur merasa kecewa dan oleh karena itu mereka harus memperbaiki kerja mereka.', 'Saya membuat keputusan-keputusan sendiri dan kemudian saya mencoba untuk menjual keputusan-keputusan itu kepada bawahan saya.'],
  ['Bila saya mengumumkan suatu keputusan yang kurang menyenangkan, saya akan menjelaskan kepada bawahan saya bahwa keputusan ini dibuat oleh Direktur.', 'Saya mengijinkan bawahan-bawahan saya untuk ikut serta di dalam pengambilan keputusan, tetapi sayapun menyediakan sesuatu keputusan terakhir.'],
  ['Saya akan memberikan tugas-tugas yang sulit kepada bawahan saya yang belum berpengalaman, tetapi bila mereka memperoleh kesukaran, saya akan mengambil alih tanggung jawab mereka.', 'Bila jumlah dan mutu hasil kerja bagian saya tidak memuaskan, saya menjelaskan kepada bawahan-bawahan saya bahwa Direktur merasa kecewa dan oleh karena itu mereka harus memperbaiki mutu kerja mereka itu.'],
  ['Saya merasa bahwa adalah penting agar bawahan-bawahan menyukai saya apabila saya bekerja keras untuk mereka.', 'Saya membiarkan orang-orang lain menangani tugas-tugas mereka masing-masing, walaupun mereka membuat banyak kesalahan.'],
  ['Saya menunjukkan minat saya terhadap kehidupan pribadi bawahan-bawahan saya, sebab saya merasa bahwa saya mengerti mengapa mereka mengerjakan sesuatu hal sejauh mereka mengerjakan hal tersebut.', 'Saya merasa bahwa adalah tidak terlalu perlu untuk bawahan-bawahan saya mengerti mengapa mereka mengerjakan sesuatu hal sejauh mereka mengerjakan hal tersebut.'],
  ['Saya percaya bahwa bawahan-bawahan yang disiplin tidak akan memperbaiki jumlah atau mutu kerja mereka di dalam jangka waktu yang panjang.', 'Bila menghadapi masalah yang sulit, saya berusaha untuk mencapai pemecahan yang paling sedikit bisa diterima oleh sebagian besar orang-orang yang bersangkutan.'],
  ['Saya berpikir bahwa bila beberapa bawahan saya merasa tidak berbahagia, saya akan mencoba melakukan sesuatu mengenai hal tersebut.', 'Saya mengurusi pekerjaan saya sendiri dan saya merasa bahwa pekerjaan saya itu bisa mencapai "Dewan Direksi" untuk mengembangkan ide-ide baru.'],
  ['Saya menyetujui kenaikan tunjangan-tunjangan untuk staf dan karyawan.', 'Saya menunjukkan persetujuan untuk meningkatkan pengetahuan tentang pekerjaan dan perusahaan dari bawahan-bawahan saya, walaupun hal itu sebenarnya belum diperlukan untuk kedudukan mereka sekarang.'],
  ['Saya membiarkan orang-orang lain menangani tugas-tugas mereka masing-masing, walaupun mereka membuat banyak kesalahan.', 'Saya membuat keputusan-keputusan sendiri tetapi saya akan mempertimbangkan usul-usul yang masuk di akal dari bawahan-bawahan saya untuk memperbaiki keputusan tersebut apabila saya bertanya kepada mereka.'],
  ['Bila ada bawahan saya yang dikucilkan dari kelompok kerjanya, saya akan mencarikan cara-cara agar supaya orang lain dapat berteman dengannya.', 'Bila seorang karyawan tidak sanggup menyelesaikan tugasnya, saya akan membantu dia untuk menyelesaikan tugas tersebut.'],
  ['Saya percaya bahwa suatu penerapan disiplin adalah merupakan seperangkat contoh untuk karyawan-karyawan lainnya.', 'Kadang-kadang saya berpikir bahwa perasaan-perasaan saya dan sikap-sikap saya adalah mementingkan tugas saya.'],
  ['Saya mencela pembicaraan-pembicaraan yang tidak perlu di antara bawahan-bawahan saya selama mereka bekerja.', 'Saya menyetujui tunjangan-tunjangan untuk staf dan karyawan-karyawan.'],
  ['Saya selalu memperhatikan mengenai keterlambatan dan kemangkiran.', 'Saya percaya bahwa Serikat-Serikat Buruh akan mencoba untuk meruntuhkan kewibawaan pimpinan perusahaan.'],
  ['Kadang-kadang saya menentang keluhan-keluhan serikat buruh sebagai suatu perkara yang prinsipil.', 'Saya merasa bahwa keluhan-keluhan tidak dapat dicegah dan saya mencoba sebaik mungkin untuk dapat dilenyapkan.'],
  ['Adalah penting bagi saya untuk memperoleh nilai kredit bagi ide-ide saya yang baik.', 'Saya menyuarakan pendapat-pendapat saya di muka umum hanya bila saya merasa bahwa orang lain akan setuju dengan saya.'],
  ['Saya percaya bahwa Serikat-Serikat Buruh akan mencoba meruntuhkan kewibawaan pimpinan perusahaan.', 'Saya percaya bahwa pertemuan-pertemuan yang sering dengan karyawan secara pribadi adalah membantu pengembangan diri mereka.'],
  ['Saya merasa bahwa tidak terlalu perlu untuk bawahan-bawahan saya mengerti mengapa mereka mengerjakan sesuatu hal sejauh mereka mengerjakan hal tersebut.', 'Saya merasa bahwa jam pencatat waktu datang dan pulangnya para pegawai, mengurangi keterlambatan.'],
  ['Saya biasanya membuat keputusan-keputusan saya sendiri dan menyampaikannya kepada bawahan saya.', 'Saya merasa bahwa Serikat-Serikat Buruh dan pimpinan perusahaan adalah bekerja untuk mencapai tujuan-tujuan yang sama.'],
  ['Saya menyukai penggunaan dari skala penggajian karyawan.', 'Saya selalu melakukan diskusi-diskusi untuk mencapai kata sepakat.'],
  ['Saya merasa bangga di dalam kenyataannya bahwa saya biasanya tidak akan menanyakan kepada seseorang untuk mengerjakan suatu tugas yang kalau untuk saya sendiri, tidak akan saya kerjakan.', 'Saya berpikir bahwa bila beberapa bawahan saya merasa tidak berbahagia, saya akan mencoba melakukan sesuatu mengenai hal tersebut.'],
  ['Bila ada suatu tugas yang mendesak, walaupun semua peralatannya sudah disediakan saya akan membiarkannya saja, dan mengatakan kepada salah seorang bawahan saya untuk mengerjakan sesuatu tugas tersebut.', 'Adalah penting bagi saya untuk memperoleh nilai kredit bagi ide-ide saya yang baik.'],
  ['Tujuan saya adalah mencapai bagaimana tugas-tugas dapat dikerjakan, tanpa saya merasa lebih benci daripada siapapun yang mengerjakan.', 'Saya mungkin menentukan tugas-tugas tanpa banyak mempertimbangkan pengalaman atau kemampuan, tetapi saya lebih menuntut pada pencapaian hasil-hasilnya saja.'],
  ['Saya mungkin menentukan tugas-tugas tanpa banyak mempertimbangkan pengalaman atau kemampuan, tetapi saya lebih menuntut pada pencapaian hasil-hasilnya saja.', 'Saya dengan sabar mendengarkan keluhan-keluhan dan ketidakpuasan-ketidakpuasan dari bawahan saya tetapi seringkali saya meralat apa yang mereka katakan.'],
  ['Saya merasa bahwa keluhan-keluhan tidak dapat dicegah dan saya mencoba sebaik mungkin untuk dapat dilenyapkan.', 'Saya percaya bahwa bawahan-bawahan saya akan merasakan kepuasan kerja mereka tanpa merasakan tekanan apapun dari saya.'],
  ['Bila menghadapi masalah yang sulit, saya berusaha untuk mencapai pemecahan yang paling sedikit bisa diterima oleh sebagian besar orang-orang yang bersangkutan.', 'Saya percaya bahwa latihan melalui pengalaman bekerja, adalah lebih bermanfaat daripada pendidikan teoritis.'],
  ['Saya selalu memberikan tugas-tugas yang sangat sulit kepada karyawan-karyawan yang paling berpengalaman.', 'Saya percaya bahwa kenaikan jabatan adalah semata-mata berdasarkan kemampuan yang ada.'],
  ['Saya merasa bahwa masalah-masalah yang timbul di antara para karyawan biasanya akan dapat diselesaikan di antara mereka sendiri, tanpa campur tangan dari saya.', 'Bila saya ditegur oleh atasan saya, saya akan memanggil semua bawahan saya dan mengatakan semua teguran tersebut kepada mereka.'],
  ['Saya tidak peduli dengan apa yang dikerjakan oleh karyawan saya di luar jam kerja kantornya.', 'Saya percaya bahwa bawahan-bawahan yang disiplin tidak akan memperbaiki jumlah atau mutu kerja mereka di dalam jangka waktu panjang.'],
  ['Saya memberikan informasi kepada "Dewan Direksi" tidak lebih dari pada apa yang mereka tanyakan.', 'Kadang-kadang saya menentang keluhan-keluhan Serikat Buruh sebagai sesuatu perkara yang prinsipil.'],
  ['Saya kadang-kadang merasa ragu-ragu untuk membuat suatu keputusan yang akan tidak disukai oleh bawahan-bawahan saya.', 'Tujuan saya adalah mencapai bagaimana tugas-tugas dapat dikerjakan, tanpa saya merasa lebih benci daripada siapapun yang mengerjakannya.'],
  ['Saya dengan sabar mendengarkan keluhan-keluhan dan ketidakpuasan-ketidakpuasan dari bawahan saya, tetapi seringkali saya meralat apa yang mereka katakan.', 'Saya kadang-kadang merasa ragu-ragu untuk membuat keputusan-keputusan yang akan tidak disukai oleh bawahan-bawahan saya.'],
  ['Saya menyuarakan pendapat-pendapat saya di muka umum hanya bila saya merasa bahwa orang lain akan setuju dengan saya.', 'Sebagian besar dari bawahan-bawahan saya dapat menyelesaikan tugas-tugas mereka, bila perlu, tanpa kehadiran saya.'],
  ['Saya mengurusi pekerjaan saya sendiri, dan saya merasa bahwa pekerjaan saya itu bisa mencapai "Dewan Direksi" untuk mengembangkan ide-ide baru.', 'Bila saya memberikan perintah kepada bawahan-bawahan saya, saya menentukan batas waktu untuk mereka menyelesaikannya.'],
  ['Saya selalu menganjurkan kepada bawahan saya untuk memberikan usul-usul, tetapi kadang-kadang juga saya langsung membuat suatu tindakan tertentu.', 'Saya mencoba untuk membuat bawahan-bawahan saya merasa senang hatinya apabila mereka berbicara dengan saya.'],
  ['Di dalam diskusi, saya memberikan fakta-fakta seperti apa yang mereka pahami, dan membiarkan mereka melukiskan kesimpulan-kesimpulan mereka sendiri.', 'Bila Direktur memberikan perintah yang kurang menyenangkan, saya pikir adalah cukup bijaksana bila saya menyebutkan namanya dan bukan nama saya.'],
  ['Bila ada tugas-tugas yang tidak dikehendaki yang harus dikerjakan, sebelumnya saya akan menanyakan kepada beberapa sukarelawan yang mau mengerjakan tugas tersebut.', 'Saya menunjukkan minat saya terhadap kehidupan pribadi bawahan-bawahan saya, sebab saya merasa bahwa sayapun mengharapkan mereka berbuat seperti itu kepada saya.'],
  ['Saya adalah seorang yang sangat memperhatikan kebahagiaan karyawan-karyawan saya di dalam mereka mengerjakan tugas-tugas mereka.', 'Saya selalu memperhatikan mengenai keterlambatan dan kemangkiran.'],
  ['Sebagian besar dari bawahan-bawahan saya dapat menyelesaikan tugas-tugas mereka, bila perlu tanpa kehadiran saya.', 'Bila ada sesuatu tugas yang mendesak, walaupun semua peralatannya sesudah disediakan, saya akan membiarkannya saja dan mengatakan kepada salah seorang bawahan saya untuk mengerjakan tugas tersebut.'],
  ['Saya percaya bahwa bawahan-bawahan saya akan merasakan kepuasan kerja mereka tanpa merasakan tekanan apapun dari saya.', 'Saya memberikan informasi kepada "Dewan Direksi" tidak lebih daripada apa yang mereka tanyakan.'],
  ['Saya percaya bahwa pertemuan-pertemuan yang sering dengan karyawan secara pribadi adalah membantu pengembangan diri mereka.', 'Saya adalah seorang yang sangat memperhatikan karyawan-karyawan saya di dalam mereka mengerjakan tugas-tugas mereka.'],
  ['Saya menunjukkan persetujuan untuk meningkatkan pengetahuan tentang pekerjaan dan perusahaan dari bawahan-bawahan saya, walaupun hal itu sebenarnya belum diperlukan untuk kedudukan mereka sekarang.', 'Saya mengawasi benar bawahan-bawahan saya yang kurang mahir di dalam bekerjanya atau bawahan-bawahan saya yang hasil kerjanya kurang memuaskan.'],
  ['Saya mengijinkan bawahan-bawahan saya untuk ikut serta mengambil keputusan dan saya selalu mematuhi keputusan yang dibuat berdasarkan atas suara terbanyak.', 'Saya membuat bawahan-bawahan saya bekerja keras, dan saya berusaha meyakinkan mereka bahwa biasanya mereka mendapat perlakuan yang adil dari "Dewan Direksi".'],
  ['Saya merasa bahwa semua karyawan pada jabatan yang sama seharusnya memperoleh gaji yang sama.', 'Bila ada seorang karyawan yang hasil kerjanya selalu tidak memuaskan saya, saya akan menunggu suatu kesempatan untuk memindahkannya dan bukan untuk memecatnya.'],
  ['Saya merasa bahwa tujuan-tujuan Serikat Buruh dan tujuan-tujuan perusahaan adalah saling berbeda dan saya mencoba untuk tidak membuat pandangan saya secara jelas.', 'Saya merasa bahwa adalah penting agar bawahan saya menyukai saya apabila saya bekerja keras untuk mereka.'],
  ['Saya mengawasi benar bawahan-bawahan saya yang kurang mahir di dalam bekerjanya atau bawahan-bawahan saya yang hasil kerjanya kurang memuaskan.', 'Saya mencela pembicaraan-pembicaraan yang tidak perlu di antara bawahan-bawahan saya selama mereka bekerja.'],
  ['Bila saya memberikan perintah kepada bawahan-bawahan saya, saya menentukan batas waktu untuk mereka menyelesaikannya.', 'Saya merasa bangga di dalam kenyataannya bahwa saya biasanya tidak akan menanyakan kepada seseorang untuk mengerjakan suatu tugas yang kalau saya sendiri tidak akan saya kerjakan.'],
  ['Saya percaya bahwa latihan melalui pengalaman bekerja, adalah lebih bermanfaat daripada pendidikan teoritis.', 'Saya tidak peduli dengan apa yang dikerjakan oleh para pegawai saya di luar jam kantornya.'],
  ['Saya merasa bahwa jam pencatat waktu datang dan pulangnya para pegawai, mengurangi keterlambatan.', 'Saya mengijinkan bawahan-bawahan saya untuk ikut serta mengambil keputusan dan saya selalu mematuhi keputusan yang dibuat berdasarkan atas suara terbanyak.'],
  ['Saya mengambil keputusan-keputusan saya sendiri, tetapi saya dapat mempertimbangkan saran-saran yang wajar dari bawahan-bawahan saya untuk saya manfaatkan, bilamana saya bertanya kepada mereka.', 'Saya merasa bahwa tujuan-tujuan Serikat Buruh dan tujuan-tujuan perusahaan adalah saling berbeda, dan saya mencoba untuk tidak membuat pandangan saya secara jelas.'],
  ['Saya membuat keputusan-keputusan sendiri dan kemudian saya mencoba untuk "menjual" keputusan-keputusan itu kepada bawahan saya.', 'Apabila mungkin saya membentuk kelompok-kelompok kerja yang terdiri dari orang-orang yang sudah menjadi teman-teman baik saya.'],
  ['Saya tidak akan ragu-ragu untuk mempekerjakan pegawai-pegawai yang cacat jasmaninya, bilamana saya merasa pasti bahwa dia dapat mempelajari pekerjaannya.', 'Saya mengabaikan pelanggar-pelanggar peraturan bila saya merasa pasti bahwa tidak ada satu orangpun yang mengetahui tentang pelanggaran-pelanggaran tersebut.'],
  ['Apabila mungkin saya membentuk kelompok-kelompok kerja yang terdiri dari orang-orang yang sudah menjadi teman-teman baik saya.', 'Saya akan memberikan tugas-tugas yang sulit kepada bawahan-bawahan saya yang berpengalaman, tetapi bila mereka memperoleh kesukaran, saya akan mengambil alih tanggung jawab mereka.'],
  ['Saya membuat bawahan-bawahan saya bekerja keras, dan saya berusaha meyakinkan mereka bahwa biasanya mereka mendapat perlakuan yang adil dari "Dewan Direksi".', 'Saya percaya bahwa suatu penerapan disiplin adalah merupakan seperangkat contoh untuk karyawan-karyawan lainnya.'],
  ['Saya mencoba untuk membuat bawahan-bawahan saya merasa senang hatinya apabila mereka berbicara dengan saya.', 'Saya menyukai penggunaan dari skala penggajian karyawan.'],
  ['Saya percaya bahwa kenaikan jabatan adalah semata-mata berdasarkan kemampuan yang ada.', 'Saya merasa bahwa masalah-masalah yang timbul di antara para karyawan biasanya akan dapat diselesaikan di antara mereka sendiri, tanpa campur tangan dari saya.'],
  ['Saya merasa bahwa Serikat-Serikat Buruh dan pimpinan perusahaan adalah bekerja untuk mencapai tujuan-tujuan yang sama.', 'Di dalam diskusi, saya memberikan fakta-fakta seperti apa yang mereka pahami, dan membiarkan mereka melukiskan kesimpulan-kesimpulan mereka sendiri.'],
  ['Bila seorang karyawan tidak sanggup menyelesaikan tugasnya, saya akan membantu dia untuk menyelesaikan tugas tersebut.', 'Saya merasa bahwa semua karyawan pada jabatan yang sama seharusnya memperoleh gaji yang sama.'],
  ['Saya mengijinkan bawahan-bawahan saya untuk ikut serta di dalam pengambilan keputusan, tetapi sayapun menyediakan sesuatu yang jitu untuk membuat keputusan terakhir.', 'Saya tidak akan ragu-ragu untuk mempekerjakan pegawai-pegawai yang cacat jasmaninya, bilamana saya merasa bahwa dia dapat mempelajari pekerjaannya.'],
];

export const MSDT_TYPE_DETAILS: Record<MsdtDimension, { name: string; desc: string; narrative: string }> = {
  E: { name: 'Executive', desc: 'Gaya eksekutif / executive', narrative: 'Gaya ini dianggap efektif karena dapat mengelola dengan baik antara tugas dan hubungan. Model ini adalah sisi efektif dari gaya kompromis. Pola yang dilakukan dapat mengintegrasikan antara tugas dan hubungan dengan baik, mengelola dan memanfaatkan kedua aspek dengan sinergi yang optimal. Pendekatan ini dapat dikatakan sebagai pendekatan konsultatif, interaktif dan pemecah masalah.' },
  Co: { name: 'Compromiser', desc: 'Gaya kompromis / compromiser', narrative: 'Mengandalkan tugas dan relasi yang seimbang, namun dianggap kurang efektif karena tidak berpendirian tetap, tidak ada keputusan yang jelas. Dalam menghadapi tekanan, maka akan cenderung kompromi sehingga berbagai tujuan seringkali menyimpang dan tidak tercapai.' },
  Ba: { name: 'Benevolent Autocrat', desc: 'Gaya otokrat bijak / benevolent autocrat', narrative: 'Gaya ini dianggap efektif karena memberikan unsur komunikatif dalam melakukan gaya otokratik. Gaya ini masih mengandalkan instruksi dan intervensi, namun tidak mengesampingkan komunikasi kepada bawahan secara lebih fleksibel serta bertindak adil.' },
  Au: { name: 'Autocrat', desc: 'Gaya otokrat / autocrat', narrative: 'Lebih perhatian hanya pada produktivitas dan hasil. Memberikan tugas ke bawahan berdasarkan instruksi dan mengawasi secara ketat proses yang terjadi. Kesalahan tidak bisa ditolerir, penyimpangan harus dihindari.' },
  Dv: { name: 'Developer', desc: 'Gaya pembangun / developer', narrative: 'Gaya manajemen developer adalah sisi efektif dari gaya missionary. Bawahan diberikan kesempatan untuk memberikan ide, pandangan atau peran lebih dari kebijakan yang ada untuk mengembangkan potensi. Sifat pendekatan berupa kolegial, bawahan sebagai partner.' },
  Mi: { name: 'Missionary', desc: 'Gaya penolong / missionary', narrative: 'Menggunakan unsur afektif yang sangat kental. Missionary berupaya mendorong situasi positif dalam manajemen dengan memberikan kandungan sensitivitas, kepedulian, dan berupaya menjaga orang lain tetap bahagia. Gaya ini kurang efektif karena kesulitan menolak atau berkata tidak.' },
  Bu: { name: 'Bureaucrat', desc: 'Gaya birokrat / bureaucrat', narrative: 'Prosedural, berdasarkan aturan atau tata pelaksanaan, menerima dengan tulus hirarki kewenangan dan menggunakan komunikasi sangat formal dalam bersikap. Gaya ini tampak kaku dan dapat membosankan bagi orang-orang yang fleksibel.' },
  Ds: { name: 'Deserter', desc: 'Gaya melepaskan diri / laisser-faire', narrative: 'Suka mengabaikan masalah, cuci tangan, tidak mau bertanggung jawab (laisser-faire). Sikapnya selalu mencoba netral terhadap apa yang terjadi di keseharian. Pola ini berupaya menjaga keadaan status-quo dan menghindari perubahan drastis.' },
};

export interface MsdtScoreResult {
  scores: Record<MsdtDimension, number>;
  rawCounts: Record<MsdtDimension, { a: number; b: number }>;
  orientation: { TO: number; RO: number; E: number; O: number };
  orientationConversion: { TO: number; RO: number; E: number };
  orientationCategory: { TO: 'Tinggi' | 'Rendah'; RO: 'Tinggi' | 'Rendah'; E: 'Tinggi' | 'Rendah' };
  dominantType: MsdtDimension;
  dominantLabel: string;
  totalAnswered: number;
  isValid: boolean;
  completed: boolean;
  total_answers: number;
  submitted_at: string;
}

function norm(s: any): string {
  return String(s ?? '').trim().toLowerCase().replace(/\s+/g, ' ');
}

function convertOrientation(val: number): number {
  if (val < 30) return 0.0;
  if (val <= 31) return 0.6;
  if (val === 32) return 1.2;
  if (val === 33) return 1.8;
  if (val === 34) return 2.4;
  if (val === 35) return 3.0;
  if (val <= 37) return 3.6;
  return 4.0;
}

const FINAL_RESULT_MATRIX: Record<string, MsdtDimension> = {
  HHH: 'E', HHL: 'Co', HLH: 'Ba', HLL: 'Au',
  LHH: 'Dv', LHL: 'Mi', LLH: 'Bu', LLL: 'Ds',
};

export function calculateMsdtScore(answers: Record<string | number, any>): MsdtScoreResult {
  // grid[block][position] = 'a' | 'b' | null, block/position 0-based
  const grid: (('a' | 'b') | null)[][] = Array.from({ length: 8 }, () => Array(8).fill(null));
  let totalAnswered = 0;

  for (let i = 0; i < MSDT_KEYS.length; i++) {
    const raw = answers[i] ?? answers[String(i)];
    if (raw === undefined || raw === null || norm(raw) === '') continue;

    const [stmtA, stmtB] = MSDT_KEYS[i];
    const val = norm(raw);
    const block = Math.floor(i / 8);
    const position = i % 8;

    let match: 'a' | 'b' | null = null;
    if (val === 'a' || val === '1' || val === norm(stmtA)) match = 'a';
    else if (val === 'b' || val === '2' || val === norm(stmtB)) match = 'b';

    if (match) {
      grid[block][position] = match;
      totalAnswered++;
    }
  }

  const rawCounts = {} as Record<MsdtDimension, { a: number; b: number }>;
  const scores = {} as Record<MsdtDimension, number>;

  DIMENSION_ORDER.forEach((dim, n) => {
    const aCount = grid[n].filter((v) => v === 'a').length; // full row n
    const bCount = grid.filter((row) => row[n] === 'b').length; // full column n
    rawCounts[dim] = { a: aCount, b: bCount };
    scores[dim] = aCount + bCount + CORRECTION[dim];
  });

  const TO = scores.Au + scores.Co + scores.Ba + scores.E;
  const RO = scores.Mi + scores.Co + scores.Dv + scores.E;
  const Eo = scores.Bu + scores.Dv + scores.Ba + scores.E;
  const O = scores.Ds;

  const TOc = convertOrientation(TO);
  const ROc = convertOrientation(RO);
  const Ec = convertOrientation(Eo);

  const catTO: 'Tinggi' | 'Rendah' = TOc > 2 ? 'Tinggi' : 'Rendah';
  const catRO: 'Tinggi' | 'Rendah' = ROc > 2 ? 'Tinggi' : 'Rendah';
  const catE: 'Tinggi' | 'Rendah' = Ec > 2 ? 'Tinggi' : 'Rendah';

  const key = `${catTO === 'Tinggi' ? 'H' : 'L'}${catRO === 'Tinggi' ? 'H' : 'L'}${catE === 'Tinggi' ? 'H' : 'L'}`;
  const dominantType = FINAL_RESULT_MATRIX[key] || 'Ds';

  return {
    scores,
    rawCounts,
    orientation: { TO, RO, E: Eo, O },
    orientationConversion: { TO: TOc, RO: ROc, E: Ec },
    orientationCategory: { TO: catTO, RO: catRO, E: catE },
    dominantType,
    dominantLabel: `${dominantType} - ${MSDT_TYPE_DETAILS[dominantType].name}`,
    totalAnswered,
    isValid: totalAnswered === 64,
    completed: true,
    total_answers: Object.keys(answers || {}).length,
    submitted_at: new Date().toISOString(),
  };
}
