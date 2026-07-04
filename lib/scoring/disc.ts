import type { TestItem, TestResultPayload } from "@/types/db";

const DISC_PROFILES: Record<string, { label: string; description: string; strengths: string[]; challenges: string[] }> = {
  D: {
    label: "Dominance — Pemimpin Tegas",
    description: "Anda adalah tipe D (Dominance) yang tinggi. Anda berorientasi hasil, tegas, dan suka mengambil kendali. Anda berkembang dalam tantangan dan tidak takut mengambil keputusan sulit.",
    strengths: ["Berorientasi hasil", "Tegas dan percaya diri", "Pemikir cepat", "Pemimpin alami"],
    challenges: ["Bisa tampak terlalu agresif", "Kurang sabar dengan detail", "Sulit mendengarkan orang lain"],
  },
  I: {
    label: "Influence — Komunikator Inspiratif",
    description: "Anda adalah tipe I (Influence) yang tinggi. Anda energetik, antusias, dan mampu memotivasi orang di sekitar Anda. Anda unggul dalam komunikasi dan membangun hubungan.",
    strengths: ["Komunikatif dan persuasif", "Optimis dan antusias", "Kreatif", "Pembangun jaringan"],
    challenges: ["Kurang perhatian terhadap detail", "Mudah terdistraksi", "Dapat overcommit"],
  },
  S: {
    label: "Steadiness — Penyeimbang Handal",
    description: "Anda adalah tipe S (Steadiness) yang tinggi. Anda stabil, sabar, dan dapat diandalkan. Anda adalah perekat tim yang menjaga harmoni dan konsistensi.",
    strengths: ["Sabar dan konsisten", "Pendengar yang baik", "Dapat diandalkan", "Pemain tim sejati"],
    challenges: ["Kesulitan menghadapi perubahan mendadak", "Sulit menolak permintaan", "Terlalu menghindari konflik"],
  },
  C: {
    label: "Conscientiousness — Analis Presisi",
    description: "Anda adalah tipe C (Conscientiousness) yang tinggi. Anda analitis, terstruktur, dan berorientasi kualitas. Anda unggul dalam pekerjaan yang membutuhkan ketepatan dan standar tinggi.",
    strengths: ["Analitis dan teliti", "Berorientasi kualitas", "Terorganisir", "Pemikir sistematis"],
    challenges: ["Terlalu perfeksionis", "Lambat dalam mengambil keputusan", "Over-analysis"],
  },
};

export function computeDISC(
  responses: Record<number, string>,
  items: TestItem[]
): TestResultPayload {
  const scores: Record<string, number> = { D: 0, I: 0, S: 0, C: 0 };

  for (const item of items) {
    const answer = responses[item.id];
    if (!answer) continue;
    const options = Array.isArray(item.options) ? item.options : JSON.parse(item.options as unknown as string);
    const opt = options.find((o: { value: string }) => o.value === answer);
    if (opt?.score_key && opt.score_key in scores) {
      scores[opt.score_key] += opt.score_val ?? 1;
    }
  }

  const dominantKey = Object.entries(scores).sort((a, b) => b[1] - a[1])[0][0];
  const profile = DISC_PROFILES[dominantKey];

  const wa_summary_text = `🎉 Hasil Tes DISC kamu sudah siap!\n\n*High ${dominantKey} — ${profile.label}*\n\n✨ ${profile.strengths[0]} · ${profile.strengths[1]}\n\n💡 ${profile.description.slice(0, 120)}...`;

  return {
    raw_scores: scores,
    result_type: `High ${dominantKey}`,
    result_label: profile.label,
    interpretation: { description: profile.description, strengths: profile.strengths, challenges: profile.challenges },
    wa_summary_text,
  };
}
