import type { TestItem, TestResultPayload } from "@/types/db";

// MBTI type labels
const MBTI_LABELS: Record<string, string> = {
  INTJ: "The Architect — Perancang Visioner",
  INTP: "The Logician — Pemikir Logis",
  ENTJ: "The Commander — Pemimpin Karismatik",
  ENTP: "The Debater — Penantang Ide",
  INFJ: "The Advocate — Pejuang Idealisme",
  INFP: "The Mediator — Penyembuh Jiwa",
  ENFJ: "The Protagonist — Pemimpin Inspiratif",
  ENFP: "The Campaigner — Jiwa Bebas",
  ISTJ: "The Logistician — Penjaga Tradisi",
  ISFJ: "The Defender — Pelindung Setia",
  ESTJ: "The Executive — Manajer Tegas",
  ESFJ: "The Consul — Tuan Rumah Peduli",
  ISTP: "The Virtuoso — Pengrajin Ahli",
  ISFP: "The Adventurer — Seniman Bebas",
  ESTP: "The Entrepreneur — Pebisnis Dinamis",
  ESFP: "The Entertainer — Jiwa Pesta",
};

const MBTI_INTERPRETATIONS: Record<
  string,
  { description: string; strengths: string[]; challenges: string[]; careers: string[] }
> = {
  INTJ: {
    description:
      "INTJ adalah individu yang sangat analitis dan terorganisir dengan visi jangka panjang yang kuat. Mereka menggabungkan logika dengan imajinasi untuk menciptakan strategi yang inovatif.",
    strengths: ["Pemikir strategis", "Mandiri dan percaya diri", "Berorientasi pada solusi", "Terorganisir dan efisien"],
    challenges: ["Terlalu kritis terhadap diri sendiri dan orang lain", "Dapat tampak arogan", "Kesulitan mengekspresikan emosi"],
    careers: ["Analis Sistem", "Ilmuwan Riset", "Arsitek", "Konsultan Manajemen"],
  },
  ENFP: {
    description:
      "ENFP adalah individu yang penuh semangat dan kreativitas, selalu melihat potensi dalam setiap situasi dan orang. Mereka adalah komunikator yang handal dengan empati tinggi.",
    strengths: ["Kreatif dan inovatif", "Energetik dan antusias", "Empati tinggi", "Komunikatif"],
    challenges: ["Mudah bosan dengan rutinitas", "Sulit fokus pada satu proyek", "Overthinking"],
    careers: ["Konselor", "Jurnalis", "Kreator Konten", "Fasilitator"],
  },
};

// Fallback interpretation for types not explicitly defined
function getInterpretation(type: string) {
  return (
    MBTI_INTERPRETATIONS[type] ?? {
      description: `Anda adalah tipe ${type}. Tipe kepribadian ini memiliki karakteristik unik yang membentuk cara Anda berinteraksi dengan dunia.`,
      strengths: ["Autentik dalam nilai-nilai diri", "Konsisten dalam prinsip", "Mampu beradaptasi"],
      challenges: ["Perlu eksplorasi lebih lanjut tentang kekuatan unik Anda"],
      careers: ["Berbagai profesi yang sesuai dengan minat dan bakat Anda"],
    }
  );
}

export function computeMBTI(
  responses: Record<number, string>,
  items: TestItem[]
): TestResultPayload {
  const scores: Record<string, number> = { E: 0, I: 0, S: 0, N: 0, T: 0, F: 0, J: 0, P: 0 };

  for (const item of items) {
    const answer = responses[item.id];
    if (!answer) continue;
    const options = Array.isArray(item.options) ? item.options : JSON.parse(item.options as unknown as string);
    const opt = options.find((o: { value: string }) => o.value === answer);
    if (opt?.score_key && opt.score_key in scores) {
      scores[opt.score_key] += opt.score_val ?? 1;
    }
  }

  const type = [
    scores.E >= scores.I ? "E" : "I",
    scores.S >= scores.N ? "S" : "N",
    scores.T >= scores.F ? "T" : "F",
    scores.J >= scores.P ? "J" : "P",
  ].join("");

  const label = MBTI_LABELS[type] ?? `${type} — Tipe Kepribadian Unik`;
  const interp = getInterpretation(type);

  const wa_summary_text = `🎉 Hasil Tes MBTI kamu sudah siap!\n\n*${type} — ${label}*\n\n✨ ${interp.strengths[0]} · ${interp.strengths[1]}\n\n💡 ${interp.description.slice(0, 120)}...`;

  return { raw_scores: scores, result_type: type, result_label: label, interpretation: interp, wa_summary_text };
}
