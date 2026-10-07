// PAPI Kostick scoring — implements refs/docs/papi.md Section 4-5.
// Answers are keyed by question index (0-based, matches question_banks.order_number - 1),
// value = the exact statement text the participant selected (Pernyataan A or B),
// following the same convention as lib/scoring/bigfive.ts.

export type PapiAspect =
  | 'N' | 'G' | 'A' | 'L' | 'P' | 'I' | 'T' | 'V' | 'X' | 'S'
  | 'B' | 'O' | 'R' | 'D' | 'C' | 'Z' | 'E' | 'K' | 'F' | 'W';

// [statementA, aspectA, statementB, aspectB] for each of the 90 items, in order_number order.
// Source: refs/docs/papi.md Section 3 (identical to the seeded question_banks rows).
const PAPI_KEYS: [string, PapiAspect, string, PapiAspect][] = [
  ['Saya seorang pekerja keras', 'G', 'Saya tidak suka uring-uringan', 'E'],
  ['Saya suka menghasilkan pekerjaan yang lebih baik daripada orang lain', 'A', 'Saya akan tetap menangani suatu pekerjaan sampai selesai', 'N'],
  ['Saya suka menunjukkan pada orang lain cara melakukan sesuatu', 'P', 'Saya ingin berusaha sebaik mungkin', 'A'],
  ['Saya suka melucu', 'X', 'Saya senang memberitahu orang lain hal-hal yang harus dikerjakan', 'P'],
  ['Saya suka bergabung dengan kelompok', 'B', 'Saya senang diperhatikan oleh kelompok', 'X'],
  ['Saya suka menjalin hubungan pribadi yang akrab', 'O', 'Saya suka berteman dengan kelompok', 'B'],
  ['Saya dapat cepat berubah jika merasa perlu', 'Z', 'Saya berusaha menjalin hubungan pribadi yang akrab', 'O'],
  ['Saya suka menyerang kembali jika benar-benar disakiti', 'K', 'Saya suka melakukan hal-hal yang baru dan berbeda', 'Z'],
  ['Saya ingin agar atasan menyukai saya', 'F', 'Saya suka menegur orang lain jika mereka melakukan kesalahan', 'K'],
  ['Saya suka mengikuti petunjuk-petunjuk yang diberikan pada saya', 'W', 'Saya suka menyenangkan orang-orang yang menjadi atasan saya', 'F'],
  ['Saya berusaha keras sekali', 'G', 'Saya seorang yang teratur. Saya meletakkan segala sesuatu pada tempatnya', 'C'],
  ['Saya dapat membuat orang lain melakukan apa yang saya inginkan', 'L', 'Saya tidak mudah marah', 'E'],
  ['Saya suka memberitahu kelompok, hal-hal yang harus mereka kerjakan', 'P', 'Saya selalu bertahan pada suatu pekerjaan sampai selesai', 'N'],
  ['Saya ingin menjadi orang yang penuh gairah dan menarik', 'X', 'Saya ingin menjadi orang yang sangat berhasil', 'A'],
  ['Saya ingin menjadi bagian dalam kelompok', 'B', 'Saya suka membantu orang lain mengambil keputusan', 'P'],
  ['Saya cemas bila seseorang tidak menyukai saya', 'O', 'Saya ingin agar orang lain memperhatikan saya', 'X'],
  ['Saya suka mencoba hal-hal baru', 'Z', 'Saya lebih suka bekerja bersama orang lain daripada sendiri', 'B'],
  ['Kadang-kadang saya menyalahkan orang lain jika ada yang tidak beres', 'K', 'Saya merasa terganggu jika seseorang tidak menyukai saya', 'O'],
  ['Saya suka menyenangkan orang yang menjadi atasan saya', 'F', 'Saya senang mencoba pekerjaan yang baru dan berbeda', 'Z'],
  ['Saya menyukai petunjuk-petunjuk terperinci untuk melaksanakan tugas', 'W', 'Saya suka memberitahu orang lain apabila mereka menjengkelkan', 'K'],
  ['Saya selalu berusaha keras', 'G', 'Saya selalu melaksanakan setiap langkah dengan sangat hati-hati', 'D'],
  ['Saya seorang pemimpin yang baik', 'L', 'Saya menata pekerjaan dengan baik', 'C'],
  ['Saya mudah marah', 'I', 'Saya lambat dalam membuat keputusan', 'E'],
  ['Saya suka mengerjakan beberapa tugas pada saat yang bersamaan', 'X', 'Bila berada dalam satu kelompok, saya suka berdiam diri', 'N'],
  ['Saya senang sekali bila diundang', 'B', 'Saya ingin melakukan sesuatu lebih baik dari pada orang lain', 'A'],
  ['Saya suka menjalin hubungan pribadi yang akrab', 'O', 'Saya suka memberi nasihat pada orang lain', 'P'],
  ['Saya suka melakukan hal-hal yang baru dan berbeda', 'Z', 'Saya suka menceritakan bagaimana saya berhasil dalam melakukan sesuatu', 'X'],
  ['Apabila pendapat saya benar, saya suka mempertahankannya', 'K', 'Saya ingin menjadi bagian dari suatu kelompok', 'B'],
  ['Saya tidak mau berbeda dari orang lain', 'F', 'Saya berusaha akrab dengan orang lain', 'O'],
  ['Saya senang diberitahu bagaimana melakukan suatu pekerjaan', 'W', 'Saya mudah bosan', 'Z'],
  ['Saya bekerja keras', 'G', 'Saya banyak berpikir dan membuat rencana', 'R'],
  ['Saya memimpin kelompok', 'L', 'Detail (hal-hal kecil) menarik buat saya', 'D'],
  ['Saya membuat keputusan dengan mudah dan cepat', 'I', 'Saya menyimpan barang-barang secara rapi dan teratur', 'C'],
  ['Saya membuat keputusan dengan mudah dan cepat', 'T', 'Saya jarang marah atau sedih', 'E'],
  ['Saya ingin menjadi bagian dalam kelompok', 'B', 'Saya ingin melakukan hanya satu pekerjaan pada satu waktu', 'N'],
  ['Saya berusaha berteman secara akrab', 'O', 'Saya berusaha sangat keras untuk menjadi yang terbaik', 'A'],
  ['Saya suka gaya terbaru dalam hal pakaian dan mobil', 'Z', 'Saya suka bertanggung jawab atas orang lain', 'P'],
  ['Saya senang berdebat', 'K', 'Saya suka mendapat perhatian', 'X'],
  ['Saya suka menyenangkan orang yang menjadi atasan saya', 'F', 'Saya tertarik untuk menjadi bagian dari kelompok', 'B'],
  ['Saya suka mengikuti peraturan dengan hati-hati', 'W', 'Saya suka orang lain mengenal saya dengan baik', 'O'],
  ['Saya berusaha keras sekali', 'G', 'Saya sangat ramah', 'S'],
  ['Orang lain berpendapat bahwa saya pemimpin yang baik', 'L', 'Saya berpikir hati-hati dan lama', 'R'],
  ['Saya sering memanfaatkan kesempatan', 'I', 'Saya suka cerewet mengenai hal-hal yang kecil', 'D'],
  ['Orang lain berpendapat bahwa saya bekerja cepat', 'T', 'Orang lain berpendapat bahwa saya menyimpan segala sesuatu secara teratur dan rapi', 'C'],
  ['Saya menyukai permainan dan olahraga', 'V', 'Saya sangat menyenangkan', 'E'],
  ['Saya senang bila orang lain bersikap akrab dan ramah', 'O', 'Saya selalu berusaha menyelesaikan sesuatu yang telah saya mulai', 'N'],
  ['Saya suka bereksperimen dan mencoba hal-hal baru', 'Z', 'Saya suka melaksanakan pekerjaan yang sulit dengan baik', 'A'],
  ['Saya suka diperlakukan secara adil', 'K', 'Saya suka memberitahu orang lain cara mengerjakan sesuatu', 'P'],
  ['Saya suka melakukan hal-hal yang diharapkan dari saya', 'F', 'Saya suka mendapat perhatian', 'X'],
  ['Saya suka petunjuk-petunjuk terperinci untuk melaksanakan suatu tugas', 'W', 'Saya senang berada bersama orang lain', 'B'],
  ['Saya selalu berusaha melakukan pekerjaan secara sempurna', 'G', 'Orang mengatakan bahwa saya hampir tidak pernah lelah', 'V'],
  ['Saya tipe seorang pemimpin', 'L', 'Saya mudah berteman', 'S'],
  ['Saya memanfaatkan kesempatan', 'I', 'Saya banyak sekali berpikir', 'R'],
  ['Saya bekerja dengan tempo yang cepat dan mantap', 'T', 'Saya senang menangani pekerjaan detail', 'D'],
  ['Saya memiliki banyak tenaga untuk permainan dan olahraga', 'V', 'Saya menyimpan segala sesuatu secara rapi dan teratur', 'C'],
  ['Saya bergaul dengan semua orang', 'S', 'Saya berwatak tenang', 'E'],
  ['Saya ingin bertemu orang-orang baru dan melakukan hal-hal baru', 'Z', 'Saya selalu ingin menyelesaikan pekerjaan yang telah saya mulai', 'N'],
  ['Saya biasanya suka mempertahankan keyakinan saya', 'K', 'Saya biasanya suka bekerja keras', 'A'],
  ['Saya menyukai saran-saran dari orang-orang yang saya kagumi', 'F', 'Saya suka bertanggung jawab terhadap orang lain', 'P'],
  ['Saya membiarkan orang lain memengaruhi diri saya secara kuat', 'W', 'Saya suka mendapat banyak perhatian', 'X'],
  ['Saya biasanya bekerja keras sekali', 'G', 'Saya biasanya bekerja cepat', 'T'],
  ['Apabila saya berbicara, kelompok menyimak', 'L', 'Saya terampil menggunakan peralatan', 'V'],
  ['Saya lambat dalam berteman', 'I', 'Saya lambat dalam mengambil keputusan', 'S'],
  ['Saya biasa makan dengan cepat', 'T', 'Saya senang membaca', 'R'],
  ['Saya menyukai pekerjaan yang membuat saya banyak bergerak', 'V', 'Saya menyukai pekerjaan yang harus saya kerjakan secara hati-hati', 'D'],
  ['Saya berteman dengan sebanyak mungkin orang', 'S', 'Saya dapat menemukan sesuatu yang telah saya sisihkan', 'C'],
  ['Saya merencanakan jauh dimuka', 'R', 'Saya selalu menyenangkan', 'E'],
  ['Saya sangat bangga akan nama baik saya', 'K', 'Saya tetap menangani suatu permasalahan sampai terpecahkan', 'N'],
  ['Saya suka menyenangkan orang-orang yang saya kagumi', 'F', 'Saya ingin berhasil', 'A'],
  ['Saya suka orang-orang lain membuat keputusan-keputusan untuk kelompok', 'W', 'Saya suka membuat keputusan-keputusan untuk kelompok', 'P'],
  ['Saya selalu berusaha sangat keras', 'G', 'Saya membuat keputusan secara mudah & cepat', 'I'],
  ['Kelompok biasanya melaksanakan keinginan saya', 'L', 'Saya biasa tergesa-gesa', 'T'],
  ['Saya sering merasa lelah', 'I', 'Saya lambat dalam membuat keputusan', 'V'],
  ['Saya bekerja cepat', 'T', 'Saya mudah berteman', 'S'],
  ['Saya biasa bersemangat atau bergairah', 'V', 'Saya menggunakan banyak waktu untuk berpikir', 'R'],
  ['Saya sangat ramah terhadap orang lain', 'S', 'Saya menyukai pekerjaan yang menuntut ketelitian', 'D'],
  ['Saya banyak berpikir dan merencanakan', 'R', 'Saya menyimpan segala sesuatu pada tempatnya', 'C'],
  ['Saya menyukai pekerjaan yang menuntut hal-hal yang mendetail', 'D', 'Saya tidak cepat marah', 'E'],
  ['Saya suka mengikuti orang-orang yang saya kagumi', 'F', 'Saya selalu menyelesaikan pekerjaan yang telah saya mulai', 'N'],
  ['Saya menyukai petunjuk-petunjuk yang jelas', 'W', 'Saya suka bekerja keras', 'A'],
  ['Saya mengejar hal-hal yang menjadi keinginan saya', 'G', 'Saya seorang pemimpin yang baik', 'L'],
  ['Saya membuat orang lain bekerja keras', 'L', 'Saya suka bersenang-senang', 'I'],
  ['Saya membuat keputusan dengan cepat', 'I', 'Saya berbicara cepat', 'T'],
  ['Saya biasanya bekerja secara tergesa-gesa', 'T', 'Saya berolahraga secara teratur', 'V'],
  ['Saya tidak suka bertemu orang-orang lain', 'V', 'Saya cepat lelah', 'S'],
  ['Saya berteman dengan banyak sekali orang', 'S', 'Saya menggunakan banyak waktu untuk berpikir', 'R'],
  ['Saya suka bekerja dengan teori', 'R', 'Saya suka melaksanakan pekerjaan detail', 'D'],
  ['Saya suka melaksanakan pekerjaan detail', 'D', 'Saya suka mengatur pekerjaan saya', 'C'],
  ['Saya meletakkan segala sesuatu pada tempatnya', 'C', 'Saya selalu menyenangkan', 'E'],
  ['Saya senang diberitahu hal-hal yang harus saya kerjakan', 'W', 'Saya harus menyelesaikan apa yang telah saya mulai', 'N'],
];

export const PAPI_ASPECT_DETAILS: Record<PapiAspect, { name: string; desc: string; high: string; low: string }> = {
  N: { name: 'Need to Finish a Task', desc: 'Dorongan untuk menyelesaikan pekerjaan sampai tuntas', high: 'Sangat berkomitmen dan berorientasi pada penyelesaian tugas secara tuntas.', low: 'Kurang mendesak atau fleksibel dalam penyelesaian akhir tugas.' },
  G: { name: 'Hard Intense Worker', desc: 'Kecenderungan bekerja keras dan sungguh-sungguh', high: 'Memiliki etos kerja yang kuat, gigih, dan pekerja keras.', low: 'Menyukai gaya kerja yang santai dan menghindari tekanan berlebih.' },
  A: { name: 'Need for Achievement', desc: 'Dorongan berprestasi dan melakukan yang terbaik', high: 'Memiliki motivasi berprestasi tinggi dan ingin selalu menghasilkan karya terbaik.', low: 'Kurang terdorong untuk bersaing secara performa atau berprestasi menonjol.' },
  L: { name: 'Leadership Role', desc: 'Kecenderungan memimpin dan mengambil tanggung jawab', high: 'Cenderung dominan, mengambil inisiatif, dan percaya diri memimpin kelompok.', low: 'Lebih nyaman sebagai anggota kelompok dan menghindari peran kepemimpinan.' },
  P: { name: 'Need to Control Others', desc: 'Keinginan mengarahkan dan mengontrol orang lain', high: 'Suka memegang kendali, mengarahkan, dan mengontrol pekerjaan orang lain.', low: 'Menghindari perilaku mendikte dan cenderung membiarkan orang lain mandiri.' },
  I: { name: 'Ease in Decision Making', desc: 'Kemampuan membuat keputusan dengan mudah dan cepat', high: 'Sangat tanggap, cepat, dan percaya diri dalam mengambil keputusan.', low: 'Cenderung ragu-ragu atau membutuhkan waktu lama untuk mempertimbangkan keputusan.' },
  T: { name: 'Pace / Tempo', desc: 'Kecenderungan bekerja dengan tempo cepat', high: 'Bekerja dengan tempo dan dinamika yang cepat serta cekatan.', low: 'Bekerja dengan tenang, berhati-hati, dan cenderung lambat.' },
  V: { name: 'Vigour', desc: 'Energi fisik dan gairah dalam aktivitas', high: 'Memiliki energi fisik yang besar dan menyukai aktivitas dinamis.', low: 'Memiliki keterbatasan stamina atau cenderung cepat lelah secara fisik.' },
  X: { name: 'Need for Recognition', desc: 'Keinginan mendapat perhatian dan pengakuan', high: 'Sangat termotivasi oleh apresiasi, pujian, dan sorotan publik.', low: 'Rendah hati dan tidak terlalu membutuhkan perhatian atau panggung.' },
  S: { name: 'Social Extensiveness', desc: 'Keluasan dalam pergaulan sosial', high: 'Sangat ramah, terbuka, dan senang menjalin jaringan sosial yang luas.', low: 'Lebih introvert, pendiam, dan selektif dalam bersosialisasi.' },
  B: { name: 'Need to Belong to Groups', desc: 'Keinginan menjadi bagian dari kelompok', high: 'Sangat berorientasi kelompok dan membutuhkan keterlibatan sosial tim.', low: 'Individualis dan mandiri, tidak terlalu tergantung pada kelompok.' },
  O: { name: 'Need for Closeness & Affection', desc: 'Kebutuhan kedekatan emosional dan afeksi', high: 'Membutuhkan hubungan interpersonal yang erat, hangat, dan akrab.', low: 'Lebih menjaga jarak secara emosional dan mandiri dalam relasi.' },
  R: { name: 'Theoretical Type', desc: 'Kecenderungan berpikir analitis dan teoritis', high: 'Suka menganalisis konsep, teori, dan berpikir secara mendalam.', low: 'Lebih praktis dan pragmatis, berfokus pada eksekusi nyata daripada teori.' },
  D: { name: 'Detail Conscious', desc: 'Perhatian terhadap hal-hal detail dan ketelitian', high: 'Sangat teliti, cermat, dan peduli pada detail-detail kecil.', low: 'Lebih berfokus pada gambaran besar (big picture) dan cenderung abai detail.' },
  C: { name: 'Organized Type', desc: 'Kecenderungan bersikap teratur dan sistematis', high: 'Sangat terstruktur, rapi, dan terorganisir dalam bekerja.', low: 'Spontan, kurang terstruktur, dan fleksibel dalam penataan.' },
  Z: { name: 'Need for Change', desc: 'Dorongan untuk mencoba hal baru dan perubahan', high: 'Menyukai variasi, inovasi, dan mudah beradaptasi dengan perubahan.', low: 'Lebih menyukai rutinitas yang stabil dan cenderung menolak perubahan mendadak.' },
  E: { name: 'Emotional Restraint', desc: 'Kemampuan mengendalikan emosi', high: 'Sangat tenang, berkepala dingin, dan mampu mengendalikan emosi dengan baik.', low: 'Ekspresif, reaktif secara emosional, atau mudah terpancing stres.' },
  K: { name: 'Need for Aggression', desc: 'Kecenderungan asertif/agresif mempertahankan pendapat', high: 'Asertif, kompetitif, dan berani bersikap konfrontatif demi keyakinannya.', low: 'Pasif, menghindari konflik, dan cenderung mengalah demi kedamaian.' },
  F: { name: 'Need for Support & Dependence', desc: 'Kebutuhan dukungan dari figur otoritas', high: 'Membutuhkan bimbingan, persetujuan, dan kepastian dari atasan.', low: 'Sangat mandiri dan tidak terlalu membutuhkan validasi dari otoritas.' },
  W: { name: 'Need for Rules & Supervision', desc: 'Kenyamanan dengan aturan dan pengawasan', high: 'Taat aturan, patuh, dan merasa aman dengan instruksi yang jelas.', low: 'Lebih suka kebebasan dalam bertindak dan tidak menyukai birokrasi ketat.' },
};

export interface PapiScoreResult {
  scores: Record<PapiAspect, number>;
  totalScore: number;
  isValid: boolean;
  highAspects: PapiAspect[];
  lowAspects: PapiAspect[];
  dominantAspect: PapiAspect | null;
  dominantLabel: string;
  completed: boolean;
  total_answers: number;
  submitted_at: string;
}

function norm(s: unknown): string {
  return String(s ?? '').trim().toLowerCase().replace(/\s+/g, ' ');
}

export function calculatePapiScore(answers: Record<string | number, unknown>): PapiScoreResult {
  const aspects = Object.keys(PAPI_ASPECT_DETAILS) as PapiAspect[];
  const scores = {} as Record<PapiAspect, number>;
  aspects.forEach((a) => (scores[a] = 0));

  let totalScore = 0;

  for (let i = 0; i < PAPI_KEYS.length; i++) {
    const a = answers[i] ?? answers[String(i)];
    if (a === undefined || a === null || norm(a) === '') continue;

    const [stmtA, aspectA, stmtB, aspectB] = PAPI_KEYS[i];
    const val = norm(a);

    if (val === '1' || val === 'a' || val === norm(stmtA)) {
      scores[aspectA]++;
      totalScore++;
    } else if (val === '2' || val === 'b' || val === norm(stmtB)) {
      scores[aspectB]++;
      totalScore++;
    }
  }

  const highAspects = aspects.filter((a) => scores[a] >= 6).sort((a, b) => scores[b] - scores[a]);
  const lowAspects = aspects.filter((a) => scores[a] <= 3).sort((a, b) => scores[a] - scores[b]);

  const dominantAspect = highAspects.length > 0 ? highAspects[0] : null;
  const dominantLabel = dominantAspect ? `${dominantAspect} - ${PAPI_ASPECT_DETAILS[dominantAspect].name}` : 'Profil Seimbang';

  return {
    scores,
    totalScore,
    isValid: totalScore === 90,
    highAspects,
    lowAspects,
    dominantAspect,
    dominantLabel,
    completed: true,
    total_answers: Object.keys(answers || {}).length,
    submitted_at: new Date().toISOString(),
  };
}
