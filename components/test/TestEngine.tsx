"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import type { TestItem, TestItemOption } from "@/types/db";
import { encodeDiscAnswer, parseDiscAnswer } from "@/lib/scoring/disc-answer";
import { msaiBlockForOrder, msaiScaleOptions } from "@/lib/msai-form";
import { initialQuestionIndex } from "@/lib/test-access";
import { EXPIRY_AUTO_SUBMIT_HEADING, EXPIRY_NOTICE_MS, expiryAnsweredLine } from "@/lib/test-timer";
import { isAnswerComplete, widgetForItem, type AnswerWidget } from "@/lib/test-widget";

interface Props {
  sessionId: number;
  token: string;
  testCode: string;
  testName: string;
  instructions: string | null;
  durationSec?: number;
  timeLimitSec?: number;
  items: TestItem[];
  initialAnswers?: Record<string, string>;
}

function optionsOf(item: TestItem): TestItemOption[] {
  const raw = item.options as unknown;
  if (Array.isArray(raw)) return raw as TestItemOption[];
  if (typeof raw === "string") {
    try {
      const parsed = JSON.parse(raw) as TestItemOption[];
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }
  return [];
}

function runnerOptions(testCode: string, item: TestItem): TestItemOption[] {
  if (testCode.toLowerCase() === "msai") {
    const scale = msaiScaleOptions(item.item_order);
    if (scale) {
      return scale.map((option) => ({
        value: option.value,
        label: option.label,
        score_key: "",
        score_val: Number(option.value),
      }));
    }
  }
  return optionsOf(item);
}

function normalizeAnswers(initial: Record<string, string> | undefined): Record<number, string> {
  const answers: Record<number, string> = {};
  for (const [key, value] of Object.entries(initial ?? {})) {
    if (value) answers[Number(key)] = value;
  }
  return answers;
}

function formatClock(ms: number): string {
  const total = Math.ceil(ms / 1000);
  const minutes = Math.floor(total / 60);
  const seconds = total % 60;
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

type Clock = {
  startedAtMs: number;
  serverNowMs: number;
  fetchedAtMs: number;
  durationSec: number;
};

export default function TestEngine({
  sessionId,
  token,
  testCode,
  testName,
  instructions,
  durationSec = 0,
  timeLimitSec = 0,
  items,
  initialAnswers,
}: Props) {
  const router = useRouter();
  const saved = normalizeAnswers(initialAnswers);
  const [answers, setAnswers] = useState<Record<number, string>>(saved);
  const [current, setCurrent] = useState(() =>
    initialQuestionIndex(
      items.map((row) => row.id),
      (itemId) => {
        const row = items.find((item) => item.id === itemId);
        return row ? isAnswerComplete(testCode, row, saved[itemId]) : false;
      },
    ),
  );
  const [phase, setPhase] = useState<"instructions" | "questions">(
    instructions && Object.keys(saved).length === 0 ? "instructions" : "questions",
  );
  const [saving, setSaving] = useState(false);
  const [pendingSaves, setPendingSaves] = useState(0);
  const [failedSaves, setFailedSaves] = useState<Record<number, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [clock, setClock] = useState<Clock | null>(null);
  const [timerError, setTimerError] = useState<string | null>(null);
  const [timerNonce, setTimerNonce] = useState(0);
  const [remaining, setRemaining] = useState<number | null>(null);
  const advanceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pendingRef = useRef(0);
  const failedRef = useRef(failedSaves);
  const autoSubmitted = useRef(false);
  const submitRef = useRef<() => Promise<void>>(async () => {});

  const timed = timeLimitSec > 0;

  useEffect(() => {
    failedRef.current = failedSaves;
  }, [failedSaves]);

  useEffect(() => {
    if (phase !== "questions" || !timed || clock) return;
    let cancelled = false;
    void (async () => {
      setTimerError(null);
      try {
        const res = await fetch("/api/test-sessions/timer", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token, session_id: Number(sessionId) }),
        });
        const data = await res.json().catch(() => ({}));
        if (cancelled) return;
        const startedAtMs = typeof data.timer_started_at === "string" ? Date.parse(data.timer_started_at) : Number.NaN;
        const serverNowMs = typeof data.server_now === "string" ? Date.parse(data.server_now) : Number.NaN;
        if (!res.ok || Number.isNaN(startedAtMs) || Number.isNaN(serverNowMs)) {
          setTimerError("Waktu pengerjaan belum bisa dimulai. Periksa koneksi, lalu coba lagi.");
          return;
        }
        const fetchedAtMs = Date.now();
        const duration = typeof data.duration_sec === "number" ? data.duration_sec : timeLimitSec;
        const elapsed = serverNowMs - startedAtMs;
        setClock({ startedAtMs, serverNowMs, fetchedAtMs, durationSec: duration });
        setRemaining(Math.max(0, duration * 1000 - elapsed));
      } catch {
        if (!cancelled) setTimerError("Waktu pengerjaan belum bisa dimulai. Periksa koneksi, lalu coba lagi.");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [phase, timed, clock, token, sessionId, timeLimitSec, timerNonce]);

  useEffect(() => {
    if (!clock) return;
    const tick = () => {
      const elapsed = clock.serverNowMs - clock.startedAtMs + (Date.now() - clock.fetchedAtMs);
      setRemaining(Math.max(0, clock.durationSec * 1000 - elapsed));
    };
    tick();
    const id = setInterval(tick, 250);
    return () => clearInterval(id);
  }, [clock]);

  const item = items[current];
  const widget: AnswerWidget = item ? widgetForItem(testCode, item) : "choice";
  const options = item ? runnerOptions(testCode, item) : [];
  const totalAnswered = items.filter((row) => isAnswerComplete(testCode, row, answers[row.id])).length;
  const progress = items.length > 0 ? (totalAnswered / items.length) * 100 : 0;
  const failedCount = Object.keys(failedSaves).length;
  const timeUp = remaining === 0;

  async function saveAnswer(itemId: number, value: string): Promise<boolean> {
    pendingRef.current += 1;
    setPendingSaves(pendingRef.current);
    setSaving(true);
    try {
      const res = await fetch("/api/test-responses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token,
          session_id: Number(sessionId),
          item_id: Number(itemId),
          answer_value: value,
        }),
      });
      const payload = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) {
        if (payload.error === "bank_incomplete") {
          setError("Bank soal belum lengkap. Jawaban tidak disimpan.");
          return false;
        }
        setFailedSaves((prev) => ({ ...prev, [itemId]: value }));
        if (res.status === 409 && payload.error === "expired") setRemaining(0);
        return false;
      }
      setFailedSaves((prev) => {
        if (!(itemId in prev)) return prev;
        const next = { ...prev };
        delete next[itemId];
        return next;
      });
      return true;
    } catch {
      setFailedSaves((prev) => ({ ...prev, [itemId]: value }));
      return false;
    } finally {
      pendingRef.current = Math.max(0, pendingRef.current - 1);
      setPendingSaves(pendingRef.current);
      if (pendingRef.current === 0) setSaving(false);
    }
  }

  async function retryFailed(): Promise<boolean> {
    const pending = Object.entries(failedRef.current);
    let ok = true;
    for (const [id, value] of pending) {
      const savedOk = await saveAnswer(Number(id), value);
      if (!savedOk) ok = false;
    }
    return ok;
  }

  function remember(itemId: number, value: string) {
    setAnswers((prev) => ({ ...prev, [itemId]: value }));
    void saveAnswer(itemId, value);
  }

  function advanceFrom(index: number) {
    if (advanceTimer.current) clearTimeout(advanceTimer.current);
    if (index >= items.length - 1) return;
    advanceTimer.current = setTimeout(() => setCurrent(index + 1), 350);
  }

  function selectChoice(value: string) {
    if (!item) return;
    remember(item.id, value);
    advanceFrom(current);
  }

  function selectDisc(role: "P" | "K", index: number) {
    if (!item) return;
    const currentAnswer = parseDiscAnswer(answers[item.id]);
    const next = { ...currentAnswer };
    if (role === "P") {
      next.P = next.P === index ? null : index;
      if (next.K === index) next.K = null;
    } else {
      next.K = next.K === index ? null : index;
      if (next.P === index) next.P = null;
    }
    const encoded = encodeDiscAnswer(next);
    setAnswers((prev) => ({ ...prev, [item.id]: encoded }));
    if (next.P !== null && next.K !== null && next.P !== next.K) {
      void saveAnswer(item.id, encoded);
    }
  }

  async function handleSubmit() {
    if (submitting) return;
    setSubmitting(true);
    setError(null);
    if (Object.keys(failedRef.current).length > 0) {
      const savedOk = await retryFailed();
      if (!savedOk && remaining !== 0) {
        setError("Beberapa jawaban belum tersimpan. Simpan ulang sebelum menyelesaikan tes.");
        setSubmitting(false);
        autoSubmitted.current = false;
        return;
      }
    }
    try {
      const res = await fetch("/api/test-sessions/complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, session_id: Number(sessionId) }),
      });
      const data = await res.json().catch(() => ({}));
      const nextToken = typeof data.result_token === "string" ? data.result_token : "";
      if (res.status === 409 && data.error === "bank_incomplete") {
        setError("Bank soal belum lengkap. Hasil tidak dihitung.");
        setSubmitting(false);
        autoSubmitted.current = false;
        return;
      }
      if (res.status === 422 && data.error === "incomplete") {
        const missing = typeof data.missing === "number" ? data.missing : 0;
        setError(`Masih ada ${missing} soal yang belum tersimpan. Lengkapi jawaban, lalu coba lagi.`);
        setSubmitting(false);
        autoSubmitted.current = false;
        return;
      }
      if (!res.ok || !nextToken) {
        setError("Hasil belum bisa diproses. Periksa koneksi Anda, lalu coba lagi.");
        setSubmitting(false);
        autoSubmitted.current = false;
        return;
      }
      router.push(`/hasil/${nextToken}`);
    } catch {
      setError("Hasil belum bisa diproses. Periksa koneksi Anda, lalu coba lagi.");
      setSubmitting(false);
      autoSubmitted.current = false;
    }
  }
  useEffect(() => {
    submitRef.current = handleSubmit;
  });

  useEffect(() => {
    if (remaining !== 0 || !clock || autoSubmitted.current || pendingRef.current > 0) return;
    const delay = setTimeout(() => {
      if (autoSubmitted.current || pendingRef.current > 0) return;
      autoSubmitted.current = true;
      void submitRef.current();
    }, EXPIRY_NOTICE_MS);
    return () => clearTimeout(delay);
  }, [remaining, clock, pendingSaves]);

  if (phase === "instructions" && instructions) {
    const minutes = durationSec > 0 ? Math.round(durationSec / 60) : 0;
    const limitMinutes = timeLimitSec > 0 ? Math.round(timeLimitSec / 60) : 0;
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-red-50/30 flex items-center justify-center px-4 py-12">
        <div className="max-w-[640px] w-full bg-white rounded-3xl p-8 md:p-10 shadow-lg border border-slate-100">
          <p className="text-xs font-black text-red-600 uppercase tracking-widest mb-3">{testName}</p>
          <h1 className="text-2xl font-black text-slate-900 mb-4">Petunjuk pengerjaan</h1>
          <p className="text-slate-600 leading-relaxed whitespace-pre-line">{instructions}</p>
          {limitMinutes > 0 ? (
            <p className="text-sm text-slate-700 mt-4 font-semibold">
              Waktu pengerjaan: {limitMinutes} menit. Hitungan mundur dimulai saat Anda menekan mulai, dan tetap berjalan jika halaman dimuat ulang.
            </p>
          ) : minutes > 0 ? (
            <p className="text-sm text-slate-500 mt-4">Perkiraan waktu: {minutes} menit · {items.length} soal</p>
          ) : null}
          <button type="button" onClick={() => setPhase("questions")} className="btn-primary mt-8 px-8 py-3 rounded-xl text-sm">
            Mulai mengerjakan
          </button>
        </div>
      </div>
    );
  }

  if (timed && !clock) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-red-50/30 flex items-center justify-center px-4 py-12">
        <div className="max-w-[520px] w-full bg-white rounded-3xl p-8 shadow-lg border border-slate-100 text-center">
          <h1 className="text-xl font-black text-slate-900 mb-3">{timerError ? "Waktu belum mulai" : "Menyiapkan waktu"}</h1>
          <p className="text-sm text-slate-600">
            {timerError ?? "Hitungan mundur disiapkan dari server supaya tetap jalan jika halaman dimuat ulang."}
          </p>
          {timerError && (
            <button type="button" onClick={() => setTimerNonce((value) => value + 1)} className="btn-primary mt-6 px-6 py-3 rounded-xl text-sm">
              Coba lagi
            </button>
          )}
        </div>
      </div>
    );
  }

  if (timed && clock && remaining === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-red-50/30 flex items-center justify-center px-4 py-12">
        <div role="status" aria-live="polite" className="max-w-[520px] w-full bg-white rounded-3xl p-8 shadow-lg border border-amber-200 text-center">
          <h1 className="text-xl font-black text-slate-900 mb-3">{EXPIRY_AUTO_SUBMIT_HEADING}</h1>
          <p className="text-sm font-semibold text-slate-700">{expiryAnsweredLine(totalAnswered, items.length)}</p>
          <p className="text-sm text-slate-500 mt-3">
            {submitting ? "Mengirim jawaban..." : pendingSaves > 0 ? "Menyimpan sisa jawaban..." : "Jawaban dikirim sebentar lagi."}
          </p>
          {error && <p className="mt-4 text-sm text-red-700 bg-red-50 border border-red-100 rounded-xl px-4 py-3">{error}</p>}
          {error && (
            <button type="button" onClick={() => void handleSubmit()} className="btn-primary mt-6 px-6 py-3 rounded-xl text-sm">
              Kirim lagi
            </button>
          )}
        </div>
      </div>
    );
  }

  if (!item) return null;

  const disc = widget === "disc" ? parseDiscAnswer(answers[item.id]) : null;
  const hasCurrentAnswer = isAnswerComplete(testCode, item, answers[item.id]);
  const isLast = current === items.length - 1;
  const block = testCode.toLowerCase() === "msai" ? msaiBlockForOrder(item.item_order) : null;
  const submitBlocked = submitting || pendingSaves > 0 || failedCount > 0 || (!timeUp && totalAnswered < items.length);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-red-50/30 flex flex-col">
      <div className="bg-white border-b border-slate-100 sticky top-0 z-10">
        <div className="max-w-[640px] mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-red-600 rounded-lg flex items-center justify-center">
                <span className="text-white text-xs font-black">T</span>
              </div>
              <div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">{testName}</p>
                <p className="text-sm font-bold text-slate-900">Soal {current + 1} dari {items.length}</p>
              </div>
            </div>
            <div className="text-right">
              {timed && remaining !== null ? (
                <p aria-live="polite" className={`text-sm font-black tabular-nums ${remaining < 60_000 ? "text-red-600" : "text-slate-800"}`}>
                  {formatClock(remaining)}
                </p>
              ) : (
                <p className="text-xs text-slate-400 font-medium">{totalAnswered} terjawab</p>
              )}
              <p className="text-xs text-slate-400">{items.length - totalAnswered} tersisa</p>
            </div>
          </div>
          <div className="test-progress-bar">
            <div className="test-progress-fill" style={{ width: `${progress}%` }} />
          </div>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="max-w-[580px] w-full">
          {block && (
            <div className="mb-4 rounded-2xl border border-red-100 bg-red-50 px-4 py-3">
              <p className="text-xs font-black uppercase tracking-widest text-red-700">{block.title}</p>
              <p className="text-sm text-slate-700 mt-1">{block.instruction}</p>
            </div>
          )}
          <div className="bg-white rounded-3xl p-8 shadow-lg border border-slate-100 mb-6">
            {widget === "disc" && (
              <span className="inline-block text-[10px] font-black text-red-600 uppercase tracking-widest bg-red-50 px-3 py-1 rounded-full mb-4">
                Pilih 1 Paling (P) dan 1 Kurang (K)
              </span>
            )}
            <p className="text-xl font-bold text-slate-900 leading-relaxed">{item.question_text}</p>
          </div>

          {widget === "likert" ? (
            <LikertScale
              options={options}
              selected={answers[item.id]}
              saving={saving}
              onSelect={selectChoice}
            />
          ) : widget === "disc" && disc ? (
            <div className="space-y-3">
              {options.map((opt, index) => {
                const isP = disc.P === index;
                const isK = disc.K === index;
                return (
                  <div
                    key={`${opt.value}-${index}`}
                    className={`p-4 rounded-2xl border-2 flex items-center justify-between gap-3 ${
                      isP ? "border-emerald-500 bg-emerald-50" : isK ? "border-amber-500 bg-amber-50" : "border-slate-200 bg-white"
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="w-8 h-8 rounded-lg bg-slate-100 text-slate-600 flex items-center justify-center text-sm font-black shrink-0">
                        {String.fromCharCode(65 + index)}
                      </span>
                      <span className="text-sm font-semibold text-slate-800">{opt.label}</span>
                    </div>
                    <div className="flex gap-2 shrink-0">
                      <button type="button" aria-pressed={isP} onClick={() => selectDisc("P", index)} className={`px-3 py-2 rounded-lg text-xs font-black ${isP ? "bg-emerald-600 text-white" : "bg-slate-100 text-slate-600"}`}>
                        {isP ? "P (Paling)" : "P"}
                      </button>
                      <button type="button" aria-pressed={isK} onClick={() => selectDisc("K", index)} className={`px-3 py-2 rounded-lg text-xs font-black ${isK ? "bg-amber-600 text-white" : "bg-slate-100 text-slate-600"}`}>
                        {isK ? "K (Kurang)" : "K"}
                      </button>
                    </div>
                  </div>
                );
              })}
              {!hasCurrentAnswer && (
                <p className="text-xs font-semibold text-amber-700 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 text-center">
                  Pilih satu Paling dan satu Kurang. Keduanya tidak boleh pernyataan yang sama.
                </p>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              {options.map((opt, index) => {
                const selected = answers[item.id] === opt.value;
                return (
                  <button
                    key={`${opt.value}-${index}`}
                    type="button"
                    aria-pressed={selected}
                    onClick={() => selectChoice(opt.value)}
                    className={`test-option-btn ${selected ? "selected" : ""}`}
                  >
                    <span className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-black shrink-0 ${selected ? "bg-red-600 text-white" : "bg-slate-100 text-slate-500"}`}>
                      {String.fromCharCode(65 + index)}
                    </span>
                    <span className="flex-1 text-left">{opt.label}</span>
                    {saving && selected && <span className="text-xs text-slate-400">Menyimpan...</span>}
                  </button>
                );
              })}
            </div>
          )}
          {failedCount > 0 && (
            <div className="mt-4 text-sm text-red-800 bg-red-50 border border-red-100 rounded-xl px-4 py-3">
              <p>{failedCount} jawaban belum tersimpan. Anda tetap bisa pindah soal. Simpan ulang sebelum menyelesaikan tes.</p>
              <button type="button" onClick={() => void retryFailed()} className="mt-2 font-bold underline">
                Simpan ulang
              </button>
            </div>
          )}
          {error && <p className="mt-4 text-sm text-red-700 bg-red-50 border border-red-100 rounded-xl px-4 py-3">{error}</p>}
        </div>
      </div>

      <div className="bg-white border-t border-slate-100 px-4 py-4 sticky bottom-0">
        <div className="max-w-[580px] mx-auto flex items-center justify-between gap-4">
          <button
            type="button"
            onClick={() => setCurrent((value) => Math.max(0, value - 1))}
            disabled={current === 0}
            className="btn-outline px-6 py-3 rounded-xl text-sm disabled:opacity-40"
          >
            ← Sebelumnya
          </button>
          {!isLast ? (
            <button
              type="button"
              onClick={() => setCurrent((value) => value + 1)}
              disabled={!hasCurrentAnswer}
              className="btn-primary px-6 py-3 rounded-xl text-sm disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Selanjutnya →
            </button>
          ) : (
            <button
              type="button"
              onClick={() => void handleSubmit()}
              disabled={submitBlocked}
              className="btn-primary px-8 py-3 rounded-xl text-sm disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {submitting ? "Memproses Hasil..." : timeUp ? "Waktu habis, lihat hasil" : `Selesai dan lihat hasil (${totalAnswered}/${items.length})`}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function LikertScale({
  options,
  selected,
  saving,
  onSelect,
}: {
  options: TestItemOption[];
  selected: string | undefined;
  saving: boolean;
  onSelect: (value: string) => void;
}) {
  const selectedLabel = options.find((opt) => opt.value === selected)?.label;
  return (
    <div>
      <div className="grid grid-cols-5 gap-2">
        {options.map((opt) => {
          const active = selected === opt.value;
          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => onSelect(opt.value)}
              aria-pressed={active}
              className={`rounded-2xl border-2 py-4 text-center transition-colors ${
                active ? "border-red-600 bg-red-600 text-white" : "border-slate-200 bg-white text-slate-700 hover:border-red-300"
              }`}
            >
              <span className="block text-lg font-black">{opt.value}</span>
            </button>
          );
        })}
      </div>
      <div className="flex justify-between gap-4 mt-3 text-[11px] text-slate-500">
        <span>{options[0]?.label}</span>
        <span className="text-right">{options[options.length - 1]?.label}</span>
      </div>
      {selectedLabel && (
        <p className="text-center text-sm font-semibold text-slate-700 mt-3">
          {selectedLabel}
          {saving ? " · Menyimpan..." : ""}
        </p>
      )}
    </div>
  );
}
