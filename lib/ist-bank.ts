const FIGURE_SUBTESTS = ["FA", "WU"] as const;
const PLACEHOLDER_STEM = "stem soal tidak tersedia";

type BankOption = { label?: string; value?: string } | string;

export type IstBankItem = {
  item_order: number;
  question_text?: string | null;
  section?: string | null;
  options?: BankOption[] | string | null;
  scoring_meta?: unknown;
};

function optionLabels(options: IstBankItem["options"]): string[] {
  if (typeof options === "string") {
    try {
      return optionLabels(JSON.parse(options) as BankOption[]);
    } catch {
      return [];
    }
  }
  if (!Array.isArray(options)) return [];
  return options.map((option) => (typeof option === "string" ? option : option.label ?? option.value ?? ""));
}

function subtestOf(item: IstBankItem): string {
  const meta = item.scoring_meta;
  if (meta && typeof meta === "object" && "subtest" in meta) {
    const code = (meta as { subtest?: unknown }).subtest;
    if (typeof code === "string") return code.trim().toUpperCase();
  }
  const section = (item.section ?? "").trim().toUpperCase();
  if (section === "FA" || section === "WU" || section === "ME") return section;
  return "";
}

function hasFigure(item: IstBankItem): boolean {
  const meta = item.scoring_meta;
  if (!meta || typeof meta !== "object") return false;
  const image = (meta as { image?: unknown; image_url?: unknown }).image
    ?? (meta as { image_url?: unknown }).image_url;
  return typeof image === "string" && image.trim().length > 0;
}

export type IstBankReport = {
  usable: boolean;
  letterOnlyItems: number;
  missingStems: number;
  strayOptionItems: number;
  missingSubtests: string[];
  hasMemorizePhase: boolean;
  messages: string[];
};

export function inspectIstBank(items: IstBankItem[]): IstBankReport {
  let letterOnlyItems = 0;
  let missingStems = 0;
  let strayOptionItems = 0;
  let hasMemorizePhase = false;
  const tagged = new Set<string>();

  for (const item of items) {
    const text = (item.question_text ?? "").trim();
    const labels = optionLabels(item.options);
    const folded = text.toLowerCase();
    if (!text || folded.startsWith(PLACEHOLDER_STEM)) missingStems += 1;
    if (labels.length > 0 && labels.every((label) => /^[A-E]$/i.test(label.trim())) && !hasFigure(item)) {
      letterOnlyItems += 1;
    }
    if (labels.some((label) => label.trim() === "38.")) strayOptionItems += 1;
    const subtest = subtestOf(item);
    if (subtest) tagged.add(subtest);
    const phase = item.scoring_meta && typeof item.scoring_meta === "object"
      ? String((item.scoring_meta as { phase?: unknown }).phase ?? "")
      : "";
    if (/menghafal|fase hafalan|memorize/i.test(`${text} ${phase} ${item.section ?? ""}`)) {
      hasMemorizePhase = true;
    }
  }

  const missingSubtests = FIGURE_SUBTESTS.filter((code) => !tagged.has(code));
  const messages: string[] = [];
  if (letterOnlyItems > 0) {
    messages.push(`${letterOnlyItems} soal hanya punya pilihan huruf A–E, tanpa teks jawaban.`);
  }
  if (missingStems > 0) {
    messages.push(`${missingStems} soal tidak punya naskah pertanyaan.`);
  }
  if (strayOptionItems > 0) {
    messages.push("Ada pilihan nyasar (\"38.\") yang bukan jawaban soal.");
  }
  if (missingSubtests.length > 0) {
    messages.push(`Subtes gambar yang tidak ada di bank: ${missingSubtests.join(", ")}.`);
  }
  if (!hasMemorizePhase) {
    messages.push("Subtes memori (ME) tidak punya tahap menghafal.");
  }

  const usable = messages.length === 0;
  return {
    usable,
    letterOnlyItems,
    missingStems,
    strayOptionItems,
    missingSubtests: [...missingSubtests],
    hasMemorizePhase,
    messages: usable ? [] : messages,
  };
}
