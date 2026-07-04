import type { TestItem, TestResultPayload } from "@/types/db";

const ENNEAGRAM_TYPES: Record<
  number,
  { label: string; description: string; strengths: string[]; challenges: string[] }
> = {
  1: {
    label: "Tipe 1 — Sang Reformis",
    description: "Anda adalah Enneagram Tipe 1: Sang Reformis. Anda sangat prinsipil, terorganisir, dan memiliki standar tinggi. Anda didorong oleh keinginan untuk membuat dunia menjadi lebih baik.",
    strengths: ["Berprinsip kuat", "Terorganisir", "Bertanggung jawab", "Berorientasi pada perbaikan"],
    challenges: ["Perfeksionisme berlebihan", "Kritik diri yang keras", "Sulit bersantai"],
  },
  2: {
    label: "Tipe 2 — Sang Penolong",
    description: "Anda adalah Enneagram Tipe 2: Sang Penolong. Anda peduli, hangat, dan tulus dalam membantu orang lain. Anda memiliki empati yang tinggi dan senang membangun hubungan bermakna.",
    strengths: ["Empatik dan peduli", "Hangat dan ramah", "Dermawan", "Membangun hubungan dengan mudah"],
    challenges: ["Sulit mengatakan tidak", "Mencari validasi eksternal", "Mengabaikan kebutuhan diri sendiri"],
  },
  3: {
    label: "Tipe 3 — Sang Pencapai",
    description: "Anda adalah Enneagram Tipe 3: Sang Pencapai. Anda ambisius, adaptif, dan berorientasi pada kesuksesan. Anda memiliki energi tinggi dan kemampuan memotivasi diri yang luar biasa.",
    strengths: ["Ambisius dan berorientasi tujuan", "Adaptif", "Energetik", "Inspiratif bagi orang lain"],
    challenges: ["Terlalu fokus pada citra", "Workaholism", "Kesulitan merasakan emosi otentik"],
  },
  4: {
    label: "Tipe 4 — Sang Individualis",
    description: "Anda adalah Enneagram Tipe 4: Sang Individualis. Anda kreatif, introspektif, dan autentik. Anda menghargai kedalaman, keunikan, dan ekspresi diri yang bermakna.",
    strengths: ["Kreatif dan artistik", "Introspektif", "Empatik mendalam", "Autentik"],
    challenges: ["Mudah merasa berbeda atau terasing", "Mood yang berfluktuasi", "Melankolik"],
  },
  5: {
    label: "Tipe 5 — Sang Investigator",
    description: "Anda adalah Enneagram Tipe 5: Sang Investigator. Anda analitis, mandiri, dan haus pengetahuan. Anda lebih suka mengobservasi sebelum bertindak dan menghargai privasi.",
    strengths: ["Analitis dan cermat", "Mandiri", "Objektif", "Pemikir mendalam"],
    challenges: ["Isolasi sosial", "Kesulitan mengekspresikan emosi", "Over-analysis"],
  },
  6: {
    label: "Tipe 6 — Sang Loyalis",
    description: "Anda adalah Enneagram Tipe 6: Sang Loyalis. Anda setia, bertanggung jawab, dan mampu mengantisipasi masalah. Anda membangun kepercayaan yang kuat dengan orang-orang di sekitar Anda.",
    strengths: ["Loyal dan dapat diandalkan", "Bertanggung jawab", "Kolaboratif", "Antisipatif terhadap risiko"],
    challenges: ["Kecemasan berlebihan", "Keraguan dalam mengambil keputusan", "Mencari kepastian terus-menerus"],
  },
  7: {
    label: "Tipe 7 — Sang Petualang",
    description: "Anda adalah Enneagram Tipe 7: Sang Petualang. Anda antusias, optimis, dan selalu mencari pengalaman baru. Anda membawa energi positif dan semangat ke dalam setiap situasi.",
    strengths: ["Optimis dan antusias", "Kreatif", "Cepat beradaptasi", "Menyenangkan"],
    challenges: ["Mudah bosan", "Sulit berkomitmen jangka panjang", "Menghindari rasa sakit emosional"],
  },
  8: {
    label: "Tipe 8 — Sang Penantang",
    description: "Anda adalah Enneagram Tipe 8: Sang Penantang. Anda kuat, tegas, dan melindungi orang-orang yang Anda pedulikan. Anda memiliki keberanian dan kepercayaan diri yang tinggi.",
    strengths: ["Tegas dan berani", "Pelindung", "Pemimpin alami", "Energi tinggi"],
    challenges: ["Dominan dan konfrontasional", "Kesulitan menunjukkan kerentanan", "Impulsif"],
  },
  9: {
    label: "Tipe 9 — Sang Pendamai",
    description: "Anda adalah Enneagram Tipe 9: Sang Pendamai. Anda damai, menerima, dan mampu melihat berbagai sudut pandang. Anda adalah pemersatu dan mediator alami.",
    strengths: ["Damai dan harmonis", "Inklusif", "Mediator alami", "Tidak menghakimi"],
    challenges: ["Sulit menetapkan prioritas", "Menghindari konflik berlebihan", "Pasif"],
  },
};

export function computeEnneagram(
  responses: Record<number, string>,
  items: TestItem[]
): TestResultPayload {
  const scores: Record<number, number> = {};
  for (let i = 1; i <= 9; i++) scores[i] = 0;

  for (const item of items) {
    const answer = responses[item.id];
    if (!answer) continue;
    const options = Array.isArray(item.options) ? item.options : JSON.parse(item.options as unknown as string);
    const opt = options.find((o: { value: string }) => o.value === answer);
    if (opt?.score_key) {
      const key = parseInt(opt.score_key);
      if (key >= 1 && key <= 9) scores[key] += opt.score_val ?? 1;
    }
  }

  const dominant = Object.entries(scores).sort((a, b) => b[1] - a[1])[0];
  const tipe = parseInt(dominant[0]);
  const profile = ENNEAGRAM_TYPES[tipe] ?? ENNEAGRAM_TYPES[1];

  const rawScores: Record<string, number> = {};
  Object.entries(scores).forEach(([k, v]) => { rawScores[`Tipe${k}`] = v; });

  const wa_summary_text = `🎉 Hasil Tes Enneagram kamu sudah siap!\n\n*${profile.label}*\n\n✨ ${profile.strengths[0]} · ${profile.strengths[1]}\n\n💡 ${profile.description.slice(0, 120)}...`;

  return {
    raw_scores: rawScores,
    result_type: `Tipe ${tipe}`,
    result_label: profile.label,
    interpretation: {
      description: profile.description,
      strengths: profile.strengths,
      challenges: profile.challenges,
    },
    wa_summary_text,
  };
}
