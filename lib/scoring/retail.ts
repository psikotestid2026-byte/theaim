import type { TestItem, TestResultPayload } from "@/types/db";
import { choiceLabel, discIndexAnswers, indexAnswers, itemOptions } from "./answer-map";
import { calculateBigFiveFromItems, MIN_HEADLINE_ITEMS, thinBigFiveNote } from "./ruangtes/bigfive";
import { calculateDiscScore } from "./ruangtes/disc";
import { findDiscTypeInfo } from "./ruangtes/disc_dictionary";
import { getEnneagramCoreInfo, getEnneagramWingInfo } from "./ruangtes/enneagram_dictionary";
import { ENNEAGRAM_QUESTION_TYPES } from "./ruangtes/enneagram_mapping";
import { IST_CORRECT_BY_ORDER } from "./ruangtes/ist-correct";
import { calculateMbtiScore } from "./ruangtes/mbti";
import { calculateMsaiScore } from "./ruangtes/msai";
import { calculateMsdtScore, MSDT_TYPE_DETAILS } from "./ruangtes/msdt";
import { calculatePapiScore, PAPI_ASPECT_DETAILS, type PapiAspect } from "./ruangtes/papi";
import { calculateRiasecScore, RIASEC_TYPE_DETAILS } from "./ruangtes/riasec";
import { calculateWptScore } from "./ruangtes/wpt";

const BIGFIVE_NAMES: Record<string, string> = {
  O: "Openness",
  C: "Conscientiousness",
  E: "Ekstraversi",
  A: "Agreeableness",
  N: "Neuroticism",
};

const ENNEAGRAM_LABELS: Record<string, number> = {
  "sangat tidak sesuai": 1,
  "tidak sesuai": 2,
  netral: 3,
  sesuai: 4,
  "sangat sesuai": 5,
};

function normText(value: string): string {
  return value.trim().toLowerCase().replace(/\s+/g, " ");
}

function enneagramPoints(raw: string): number | null {
  const numeric = Number(raw);
  if (Number.isInteger(numeric) && numeric >= 1 && numeric <= 5) return numeric;
  return ENNEAGRAM_LABELS[normText(raw)] ?? null;
}

function summary(testName: string, headline: string): string {
  return `Hasil ${testName} kamu sudah siap.\n\n${headline}\n\nLaporan lengkap ada di halaman hasil.`;
}

function computeMbtiRetail(responses: Record<number, string>, items: TestItem[]): TestResultPayload {
  const scored = calculateMbtiScore(indexAnswers(items, responses, "value"));
  const poles = ["E", "I", "S", "N", "T", "F", "J", "P"] as const;
  return {
    raw_scores: scored.raw,
    result_type: scored.type,
    result_label: `${scored.type} · ${scored.validityStatus}`,
    interpretation: {
      description: `Tipe ${scored.type}. Status kelengkapan: ${scored.validityStatus}. ${scored.unanswered} butir tidak terhitung.`,
      strengths: poles.filter((pole) => scored.type.includes(pole)).map((pole) => `${pole}: ${scored.percent[pole]}%`),
      challenges: scored.validityStatus === "Valid" ? [] : [`Jawaban kosong: ${scored.unanswered}`],
      detail: {
        kind: "mbti",
        percent: scored.percent,
        unanswered: scored.unanswered,
        validityStatus: scored.validityStatus,
      },
    },
    wa_summary_text: summary("MBTI", `Tipe ${scored.type} (${scored.validityStatus}).`),
  };
}

function computeDiscRetail(responses: Record<number, string>, items: TestItem[]): TestResultPayload {
  const scored = calculateDiscScore(discIndexAnswers(items, responses));
  const info = findDiscTypeInfo(scored.dominantLabel);
  const jobs = (info?.jobs ?? "").split(",").map((job) => job.trim()).filter(Boolean);
  const notes: string[] = [];
  if (scored.hasStressPotential) notes.push("Grafik Paling dan Kurang berbeda pada dimensi utama.");
  if (scored.isSuperSyndrome) notes.push("Super syndrome: keempat dimensi Change di atas nol.");
  if (scored.isUndershift) notes.push("Undershift: keempat dimensi Change pada atau di bawah nol.");
  return {
    raw_scores: { D: scored.g3.D, I: scored.g3.I, S: scored.g3.S, C: scored.g3.C },
    result_type: scored.dominantLabel,
    result_label: info?.name ?? scored.dominantType,
    interpretation: {
      description: info?.description ?? `Profil DISC ${scored.dominantLabel}.`,
      strengths: scored.recommendations,
      challenges: notes,
      careers: jobs,
      detail: {
        kind: "disc",
        most: scored.most,
        least: scored.least,
        change: scored.change,
        g1: scored.g1,
        g2: scored.g2,
        g3: scored.g3,
        subTraits: scored.subTraits,
        isSuperSyndrome: scored.isSuperSyndrome,
        isUndershift: scored.isUndershift,
        hasStressPotential: scored.hasStressPotential,
      },
    },
    wa_summary_text: summary("DISC", `Profil ${scored.dominantLabel} — ${info?.name ?? scored.dominantType}.`),
  };
}

function computeBigFive(responses: Record<number, string>, items: TestItem[]): TestResultPayload {
  const scored = calculateBigFiveFromItems(items, responses);
  const dimensions = Object.entries(scored.dimensions).map(([code, row]) => ({
    code,
    name: BIGFIVE_NAMES[code] ?? code,
    raw: row.raw as number,
    max: row.max as number,
    percent: row.percent as number,
    category: row.category as string,
    narrative: row.narrative as string,
    itemCount: row.itemCount,
  }));
  const raw_scores: Record<string, number> = {};
  for (const row of dimensions) raw_scores[row.code] = row.raw;
  const eligible = dimensions.filter((row) => row.itemCount >= MIN_HEADLINE_ITEMS);
  const thin = dimensions.filter((row) => row.itemCount < MIN_HEADLINE_ITEMS);
  const highest = [...eligible].sort((a, b) => b.percent - a.percent || a.code.localeCompare(b.code))[0];
  const thinNote = thin.map((row) => thinBigFiveNote(row.name, row.itemCount)).join(" ");
  const headline = highest
    ? `Faktor tertinggi: ${highest.name} (${highest.category}).`
    : "Tidak ada faktor dengan cukup butir untuk menjadi headline.";
  return {
    raw_scores,
    result_type: highest ? `${highest.code} ${highest.category}` : "Big Five",
    result_label: highest ? `${highest.name} · ${highest.category}` : "Big Five",
    interpretation: {
      description: `Skor tiap faktor dibanding maksimumnya. ${headline}${thinNote ? ` ${thinNote}` : ""}`,
      strengths: dimensions.filter((row) => row.category === "Tinggi" && row.code !== "N" && row.itemCount >= MIN_HEADLINE_ITEMS).map((row) => `${row.name}: ${row.narrative}`),
      challenges: dimensions.filter((row) => row.itemCount >= MIN_HEADLINE_ITEMS && (row.category === "Rendah" || (row.code === "N" && row.category === "Tinggi"))).map((row) => `${row.name}: ${row.narrative}`),
      detail: { kind: "bigfive", dimensions, thinItemCodes: thin.map((row) => row.code) },
    },
    wa_summary_text: summary("Big Five", highest ? `${highest.name} ${highest.category}.` : "Profil lima faktor sudah siap."),
  };
}

function computeEnneagramRetail(responses: Record<number, string>, items: TestItem[]): TestResultPayload {
  // The overlap bank is a 1–5 Likert. RuangTes' sheet used 0–3 and drops 4–5 as invalid.
  // The type key and wing rule are the same; the points are the values this bank stores.
  const scores: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0, 8: 0, 9: 0 };
  for (const item of items) {
    const raw = responses[item.id];
    if (!raw) continue;
    const points = enneagramPoints(choiceLabel(item, raw)) ?? enneagramPoints(raw);
    if (points === null) continue;
    const type = ENNEAGRAM_QUESTION_TYPES[item.item_order - 1];
    if (type >= 1 && type <= 9) scores[type] += points;
  }

  let maxScore = -1;
  for (let type = 1; type <= 9; type++) if (scores[type] > maxScore) maxScore = scores[type];
  const dominant = [];
  for (let type = 1; type <= 9; type++) if (scores[type] === maxScore) dominant.push(type);

  const neighbors: Record<number, [number, number]> = {
    1: [9, 2], 2: [1, 3], 3: [2, 4], 4: [3, 5], 5: [4, 6], 6: [5, 7], 7: [6, 8], 8: [7, 9], 9: [8, 1],
  };
  let wingCode: string | null = null;
  if (dominant.length === 1) {
    const [left, right] = neighbors[dominant[0]];
    if (scores[left] > scores[right]) wingCode = `${dominant[0]}w${left}`;
    else if (scores[right] > scores[left]) wingCode = `${dominant[0]}w${right}`;
  }

  const core = dominant.length === 1 ? getEnneagramCoreInfo(dominant[0]) : undefined;
  const wing = wingCode ? getEnneagramWingInfo(wingCode) : undefined;
  const raw_scores: Record<string, number> = {};
  for (let type = 1; type <= 9; type++) raw_scores[`Tipe ${type}`] = scores[type];
  const resultType = dominant.length === 1 ? `Tipe ${dominant[0]}` : dominant.map((type) => `Tipe ${type}`).join(" & ");

  return {
    raw_scores,
    result_type: wingCode ?? resultType,
    result_label: wing?.label ?? core?.name ?? resultType,
    interpretation: {
      description: wing?.description ?? core?.description ?? resultType,
      strengths: wing?.traits ?? core?.traits ?? [],
      challenges: [],
      detail: { kind: "enneagram", scores, wingCode, traits: core?.traits ?? [] },
    },
    wa_summary_text: summary("Enneagram", `${wingCode ?? resultType} — ${wing?.label ?? core?.name ?? ""}`.trim()),
  };
}

function computeRiasec(responses: Record<number, string>, items: TestItem[]): TestResultPayload {
  const scored = calculateRiasecScore(indexAnswers(items, responses, "label"));
  const primary = scored.ranking[0];
  const detail = RIASEC_TYPE_DETAILS[primary];
  const rows = scored.ranking.map((code) => ({
    code,
    name: RIASEC_TYPE_DETAILS[code].name,
    score: scored.scores[code],
    desc: RIASEC_TYPE_DETAILS[code].desc,
  }));
  return {
    raw_scores: scored.scores,
    result_type: scored.interestCode,
    result_label: `${detail.name} · konsistensi ${scored.consistency}`,
    interpretation: {
      description: `${detail.desc} Kode minat ${scored.interestCode}. Konsistensi dua huruf teratas: ${scored.consistency}.`,
      strengths: RIASEC_TYPE_DETAILS[primary].professions,
      challenges: [],
      careers: scored.comboProfessions,
      detail: { kind: "riasec", rows, consistency: scored.consistency, interestCode: scored.interestCode },
    },
    wa_summary_text: summary("RIASEC", `Kode minat ${scored.interestCode} (${detail.name}).`),
  };
}

function computePapi(responses: Record<number, string>, items: TestItem[]): TestResultPayload {
  const scored = calculatePapiScore(indexAnswers(items, responses, "value"));
  const aspects = (Object.keys(PAPI_ASPECT_DETAILS) as PapiAspect[]).map((code) => {
    const info = PAPI_ASPECT_DETAILS[code];
    const score = scored.scores[code];
    return {
      code,
      name: info.name,
      score,
      note: score >= 6 ? info.high : score <= 3 ? info.low : info.desc,
    };
  });
  const raw_scores: Record<string, number> = {};
  for (const row of aspects) raw_scores[row.code] = row.score;
  const dominant = scored.dominantAspect ? PAPI_ASPECT_DETAILS[scored.dominantAspect] : null;
  return {
    raw_scores,
    result_type: scored.dominantLabel,
    result_label: dominant?.name ?? "Profil PAPI",
    interpretation: {
      description: dominant
        ? `${scored.dominantLabel}. ${dominant.desc} ${dominant.high}`
        : "Tidak ada aspek yang mencapai pita tinggi.",
      strengths: scored.highAspects.map((code) => `${code} — ${PAPI_ASPECT_DETAILS[code].name}: ${PAPI_ASPECT_DETAILS[code].high}`),
      challenges: scored.lowAspects.map((code) => `${code} — ${PAPI_ASPECT_DETAILS[code].name}: ${PAPI_ASPECT_DETAILS[code].low}`),
      detail: { kind: "papi", aspects, isValid: scored.isValid, totalScore: scored.totalScore },
    },
    wa_summary_text: summary("PAPI", scored.dominantLabel),
  };
}

function computeWpt(responses: Record<number, string>, items: TestItem[]): TestResultPayload {
  const scored = calculateWptScore(indexAnswers(items, responses, "label"));
  return {
    raw_scores: { benar: scored.raw_score, iq: scored.iq },
    result_type: String(scored.iq),
    result_label: scored.label,
    interpretation: {
      description: `${scored.description} Jawaban benar: ${scored.raw_score} dari 50.`,
      strengths: [`IQ ${scored.iq}`, scored.label],
      challenges: [],
      detail: { kind: "wpt", rawScore: scored.raw_score, iq: scored.iq, label: scored.label },
    },
    wa_summary_text: summary("WPT", `IQ ${scored.iq} (${scored.label}).`),
  };
}

/** True only when the chosen option's label is the key. The stored value is an index and is never a key. */
export function istAnswerMatchesKey(item: TestItem, raw: string, correct: string): boolean {
  const chosen = itemOptions(item).find((option) => option.value === raw);
  if (!chosen || typeof chosen.label !== "string") return false;
  return normText(chosen.label) === normText(correct);
}

function computeIst(responses: Record<number, string>, items: TestItem[]): TestResultPayload {
  let raScore = 0;
  let zrScore = 0;
  for (const item of items) {
    const correct = IST_CORRECT_BY_ORDER[item.item_order];
    if (!correct) continue;
    const raw = responses[item.id];
    if (!raw || !istAnswerMatchesKey(item, raw, correct)) continue;
    if (item.item_order <= 96) raScore += 1;
    else zrScore += 1;
  }
  const numeric = raScore + zrScore;
  const note =
    "Hanya subtes RA (aritmatika) dan ZR (deret angka) yang diskor. " +
    "Subtes verbal tidak diskor, dan angka ini bukan IQ IST.";
  return {
    raw_scores: { RA: raScore, ZR: zrScore },
    result_type: `${numeric}/40`,
    result_label: "Numerik dan logika (parsial)",
    interpretation: {
      description: `${note} RA ${raScore}/20, ZR ${zrScore}/20.`,
      strengths: [`RA ${raScore}/20`, `ZR ${zrScore}/20`],
      challenges: [],
      detail: { kind: "ist", raScore, zrScore, numeric, note },
    },
    wa_summary_text: summary("IST", `Skor numerik parsial ${numeric}/40. Bukan IQ penuh.`),
  };
}

function computeMsdt(responses: Record<number, string>, items: TestItem[]): TestResultPayload {
  const scored = calculateMsdtScore(indexAnswers(items, responses, "value"));
  const info = MSDT_TYPE_DETAILS[scored.dominantType];
  const raw_scores: Record<string, number> = {};
  for (const [code, score] of Object.entries(scored.scores)) raw_scores[code] = score;
  return {
    raw_scores,
    result_type: scored.dominantType,
    result_label: info.name,
    interpretation: {
      description: info.narrative,
      strengths: [
        scored.orientationCategory.TO === "Tinggi" ? "Orientasi tugas: Tinggi" : "",
        scored.orientationCategory.RO === "Tinggi" ? "Orientasi relasi: Tinggi" : "",
        scored.orientationCategory.E === "Tinggi" ? "Efektivitas: Tinggi" : "",
      ].filter((line) => line.length > 0),
      challenges: scored.isValid ? [] : [`Butir terhitung ${scored.totalAnswered} dari 64.`],
      detail: {
        kind: "msdt",
        scores: scored.scores,
        orientationCategory: scored.orientationCategory,
        isValid: scored.isValid,
      },
    },
    wa_summary_text: summary("MSDT", `${scored.dominantType} — ${info.name}.`),
  };
}

function computeMsai(responses: Record<number, string>, items: TestItem[]): TestResultPayload {
  const scored = calculateMsaiScore(indexAnswers(items, responses, "value"));
  const raw_scores: Record<string, number> = {};
  for (const [quadrant, score] of Object.entries(scored.quadrantScores)) {
    if (typeof score === "number") raw_scores[quadrant] = score;
  }
  const leaders = Object.entries(scored.quadrantScores)
    .filter((entry): entry is [string, number] => typeof entry[1] === "number")
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));
  const topScore = leaders[0]?.[1];
  const tied = topScore === undefined ? [] : leaders.filter((entry) => entry[1] === topScore);
  const tie = tied.length > 1;
  const tieNames = tied.map(([name]) => name).join(", ");
  const gapNote = scored.dataGapNote || "Skor keterampilan manajerial dihitung dari perilaku aktual, efektivitas, dan kepentingan.";
  return {
    raw_scores,
    result_type: tie ? "Seri" : (tied[0]?.[0] ?? "MSAI"),
    result_label: tie ? `Seri · ${tieNames} · ${topScore}` : tied[0] ? `${tied[0][0]} · ${tied[0][1]}` : "MSAI",
    interpretation: {
      description: tie ? `${gapNote} Kuadran seri pada skor ${topScore}: ${tieNames}.` : gapNote,
      strengths: scored.skills.filter((skill) => skill.gap !== null && skill.gap <= 0).map((skill) => skill.name),
      challenges: scored.skills.filter((skill) => skill.gap !== null && skill.gap > 0).map((skill) => `${skill.name} (selisih ${Number(skill.gap).toFixed(2)})`),
      detail: { kind: "msai", skills: scored.skills, quadrantScores: scored.quadrantScores, tie },
    },
    wa_summary_text: summary("MSAI", tie ? `Kuadran seri: ${tieNames}.` : tied[0] ? `Kuadran tertinggi: ${tied[0][0]}.` : "Profil keterampilan sudah siap."),
  };
}

const RETAIL: Record<string, (responses: Record<number, string>, items: TestItem[]) => TestResultPayload> = {
  mbti: computeMbtiRetail,
  disc: computeDiscRetail,
  bigfive: computeBigFive,
  enneagram: computeEnneagramRetail,
  riasec: computeRiasec,
  papi: computePapi,
  wpt: computeWpt,
  ist: computeIst,
  msdt: computeMsdt,
  msai: computeMsai,
};

export function computeRetail(
  testCode: string,
  responses: Record<number, string>,
  items: TestItem[],
): TestResultPayload {
  const fn = RETAIL[testCode];
  if (!fn) throw new Error(`No scoring function for test_code: ${testCode}`);
  return fn(responses, items);
}

export function isRetailCode(testCode: string): boolean {
  return testCode in RETAIL;
}
