/**
 * WPT (Wonderlic Personnel Test) scoring.
 * Item keys live in test_items.scoring_meta. Raw→IQ is Dodrill (1981) Table 1.
 */
import { itemMeta, type ItemMeta } from "../item-meta";

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

/** Raw scores outside Dodrill (1981) Table 1 (1–44). Their IQ values are kept from the old table. */
export const WPT_EXTRAPOLATED_RAW = new Set([0, 45, 46, 47, 48, 49, 50]);

function cleanNumberText(raw: string): string {
  return raw
    .trim()
    .toLowerCase()
    .replace(/½/g, "1/2")
    .replace(/¼/g, "1/4")
    .replace(/\s+/g, "")
    .replace(/^rp\.?/, "")
    .replace(/[^0-9.,/-]/g, "");
}

/** Parses an Indonesian-style number: comma or dot decimals, dot thousands, a/b fractions. */
export function parseWptNumber(raw: unknown): number | null {
  if (raw === undefined || raw === null) return null;
  const s = cleanNumberText(String(raw));
  if (!s) return null;
  if (s.includes("/")) {
    const [a, b, extra] = s.split("/");
    if (extra !== undefined) return null;
    const top = parseWptNumber(a);
    const bottom = parseWptNumber(b);
    if (top === null || bottom === null || bottom === 0) return null;
    return top / bottom;
  }
  let text = s;
  if (/^\d+,\d+$/.test(text)) text = text.replace(",", ".");
  else if (/^[1-9]\d{0,2}(\.\d{3})+$/.test(text)) text = text.replace(/\./g, "");
  else if (/^\d{1,3}(,\d{3})+$/.test(text)) return null;
  if (!/^-?(\d+\.?\d*|\.\d+)$/.test(text)) return null;
  const value = Number(text);
  return Number.isFinite(value) ? value : null;
}

function decimalsOf(raw: string): number {
  const s = cleanNumberText(raw);
  const match = s.match(/[.,](\d+)$/);
  return match && !/^[1-9]\d{0,2}(\.\d{3})+$/.test(s) ? match[1].length : 0;
}

export function normalizeWptText(val: unknown): string {
  if (val === undefined || val === null) return "";
  return String(val).trim().toLowerCase().replace(/["'“”‘’.!?]/g, "").replace(/\s+/g, " ");
}

function numbersOf(raw: string): string[] {
  return (raw.match(/\d+/g) ?? []).map((n) => String(Number(n)));
}

/** True when the stored answer satisfies the item key in scoring_meta. */
export function wptAnswerIsCorrect(meta: ItemMeta, raw: unknown): boolean {
  if (raw === undefined || raw === null) return false;
  const answer = String(raw).trim();
  const accepted = Array.isArray(meta.accepted) ? meta.accepted.map(String) : [];
  if (!answer || accepted.length === 0) return false;
  switch (meta.match ?? (meta.answer_type === "choice" ? "choice" : "text")) {
    case "choice":
      return accepted.includes(answer);
    case "text":
      return accepted.some((key) => normalizeWptText(key) === normalizeWptText(answer));
    case "number": {
      const value = parseWptNumber(answer);
      if (value === null) return false;
      const decimals = decimalsOf(answer);
      return accepted.some((key) => {
        const target = parseWptNumber(key);
        if (target === null) return false;
        if (Math.abs(value - target) < 1e-9) return true;
        // A fraction key also accepts a decimal written to at least 3 places (1/30 → 0,0333).
        return key.includes("/") && decimals >= 3 && Math.abs(value - target) <= 0.5 * 10 ** -decimals;
      });
    }
    case "numbers_set": {
      const got = numbersOf(answer).sort();
      const want = accepted.map((n) => String(Number(n))).sort();
      return got.length === want.length && got.every((n, i) => n === want[i]);
    }
    default:
      return false;
  }
}

export function wptCategory(iq: number) {
  return WPT_CATEGORIES.find((cat) => iq >= cat.minIQ) ?? WPT_CATEGORIES[WPT_CATEGORIES.length - 1];
}

export function wptIqForRaw(raw: number): number {
  const index = Math.max(0, Math.min(raw, WPT_RS_TO_IQ.length - 1));
  return WPT_RS_TO_IQ[index];
}

/** Scores WPT from item keys in scoring_meta. Responses are keyed by test_items.id. */
export function calculateWptFromItems(
  items: { id: number; item_order: number; scoring_meta?: unknown }[],
  responses: Record<number, string>,
) {
  let rs = 0;
  let keyed = 0;
  for (const item of items) {
    const meta = itemMeta(item);
    if (!Array.isArray(meta.accepted) || meta.accepted.length === 0) continue;
    keyed += 1;
    if (wptAnswerIsCorrect(meta, responses[item.id])) rs += 1;
  }
  const iq = wptIqForRaw(rs);
  const category = wptCategory(iq);
  return {
    raw_score: rs,
    keyed_items: keyed,
    iq,
    score: String(iq),
    label: category.label,
    description: category.description,
    category,
    extrapolated: WPT_EXTRAPOLATED_RAW.has(rs),
  };
}
