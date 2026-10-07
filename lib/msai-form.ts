export type MsaiBlockId = "actual" | "effectiveness" | "career" | "importance";

export type MsaiBlock = {
  id: MsaiBlockId;
  title: string;
  instruction: string;
  from: number;
  to: number;
};

export const MSAI_BLOCKS: readonly MsaiBlock[] = [
  {
    id: "actual",
    title: "Bagian 1 · Perilaku manajerial aktual",
    instruction: "Nilai apa yang benar-benar Anda lakukan sehari-hari. 1 = Sangat Tidak Setuju, 5 = Sangat Setuju.",
    from: 1,
    to: 60,
  },
  {
    id: "effectiveness",
    title: "Bagian 2 · Efektivitas manajerial",
    instruction: "Nilai seberapa efektif Anda menjalankan kompetensi ini. 1 = Buruk, 5 = Luar Biasa. Teksnya sengaja sama dengan bagian kepentingan.",
    from: 61,
    to: 73,
  },
  {
    id: "career",
    title: "Bagian 3 · Pertanyaan karier",
    instruction: "Pilih satu pernyataan yang paling sesuai. Ini bukan skala Sangat Kurang sampai Sangat Baik.",
    from: 74,
    to: 75,
  },
  {
    id: "importance",
    title: "Bagian 4 · Kepentingan bagi organisasi",
    instruction: "Nilai seberapa penting kompetensi ini bagi peran Anda sekarang. 1 = Kurang Penting, 5 = Sangat Kritikal.",
    from: 76,
    to: 87,
  },
];

const ACTUAL = ["Sangat Tidak Setuju", "Tidak Setuju", "Netral", "Setuju", "Sangat Setuju"];
const EFFECTIVENESS = ["Buruk", "Di bawah rata-rata", "Rata-rata", "Di atas rata-rata", "Luar Biasa"];
const IMPORTANCE = ["Kurang Penting", "Cukup Penting", "Penting", "Sangat Penting", "Sangat Kritikal"];

/** RuangTes Q74 labels, in Bahasa, from lowest to highest career expectation. */
const CAREER_HEIGHT = [
  "Tidak lebih tinggi dari posisi saat ini",
  "Satu tingkat di atas posisi saat ini",
  "Sampai posisi senior (tim manajemen senior)",
  "Mendekati puncak, tepat di bawah CEO",
  "Sampai puncak organisasi",
];

/** RuangTes Q75 labels, in Bahasa, from lowest to highest self-rating. */
const CAREER_RATING = [
  "Di paruh bawah dibanding manajer lain",
  "Termasuk 50% teratas",
  "Termasuk 25% teratas",
  "Termasuk 10% teratas",
  "Termasuk 5% teratas",
];

export function msaiBlockForOrder(order: number): MsaiBlock | null {
  return MSAI_BLOCKS.find((block) => order >= block.from && order <= block.to) ?? null;
}

export function msaiOptionLabels(order: number): string[] | null {
  const block = msaiBlockForOrder(order);
  if (!block) return null;
  if (block.id === "actual") return ACTUAL;
  if (block.id === "effectiveness") return EFFECTIVENESS;
  if (block.id === "importance") return IMPORTANCE;
  if (order === 74) return CAREER_HEIGHT;
  if (order === 75) return CAREER_RATING;
  return null;
}

export function msaiScaleOptions(order: number): { value: string; label: string }[] | null {
  const labels = msaiOptionLabels(order);
  if (!labels) return null;
  return labels.map((label, index) => ({ value: String(index + 1), label }));
}
