"use client";

/* eslint-disable @next/next/no-img-element -- figures are served by the token-gated asset route */
import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import type { TestItem, TestItemOption } from "@/types/db";
import type { IstMemorizeList, IstSubtestPublic } from "@/lib/ist-types";
import { istLastStartedIndex, istPhaseAt, type SectionStarts } from "@/lib/ist-flow";
import { istSubtestOf } from "@/lib/scoring/ist";
import { itemMeta } from "@/lib/scoring/item-meta";
import { withAssetToken } from "@/lib/test-assets";
import ItemMedia from "@/components/test/ItemMedia";
import TypedAnswer from "@/components/test/TypedAnswer";

interface Props {
  sessionId: number;
  token: string;
  testName: string;
  subtests: IstSubtestPublic[];
  items: TestItem[];
  initialAnswers?: Record<string, string>;
  initialStarts: SectionStarts;
  serverNowMs: number;
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

function formatClock(ms: number): string {
  const total = Math.max(0, Math.ceil(ms / 1000));
  return `${String(Math.floor(total / 60)).padStart(2, "0")}:${String(total % 60).padStart(2, "0")}`;
}

function minutes(sec: number): number {
  return Math.round(sec / 60);
}

export default function IstRunner({ sessionId, token, testName, subtests, items, initialAnswers, initialStarts, serverNowMs }: Props) {
  const router = useRouter();
  const [answers, setAnswers] = useState<Record<number, string>>(() => {
    const out: Record<number, string> = {};
    for (const [key, value] of Object.entries(initialAnswers ?? {})) if (value) out[Number(key)] = value;
    return out;
  });
  const [starts, setStarts] = useState<SectionStarts>(initialStarts);
  const offsetRef = useRef<number | null>(null);
  const [now, setNow] = useState(serverNowMs);
  const [closedThrough, setClosedThrough] = useState(-1);
  const [cursor, setCursor] = useState<Record<string, number>>({});
  const [busy, setBusy] = useState(false);
  const [pending, setPending] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const submitted = useRef(false);
  const advanceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (offsetRef.current === null) offsetRef.current = serverNowMs - Date.now();
    const tick = () => setNow(Date.now() + (offsetRef.current ?? 0));
    tick();
    const id = setInterval(tick, 250);
    return () => clearInterval(id);
  }, [serverNowMs]);

  const bySection = useMemo(() => {
    const map = new Map<string, TestItem[]>();
    for (const sub of subtests) map.set(sub.code, []);
    for (const item of [...items].sort((a, b) => a.item_order - b.item_order)) {
      const code = istSubtestOf(item);
      if (code) map.get(code)?.push(item);
    }
    return map;
  }, [items, subtests]);

  const last = istLastStartedIndex(subtests, starts);
  const current = last >= 0 ? subtests[last] : null;
  const phase = current ? istPhaseAt(current, starts[current.code], now) : null;
  const sectionOpen = Boolean(current && phase && phase.phase !== "over" && closedThrough < last);
  const nextIndex = last + 1;
  const view: "section" | "intro" | "finish" = sectionOpen ? "section" : nextIndex < subtests.length ? "intro" : "finish";

  function syncClock(serverNow: unknown) {
    const ms = Number(serverNow);
    if (Number.isFinite(ms)) offsetRef.current = ms - Date.now();
  }

  async function startSection(code: string) {
    if (busy) return;
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/test-sessions/section-timer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, session_id: Number(sessionId), section: code }),
      });
      const data = await res.json().catch(() => ({}));
      if (data && typeof data.starts === "object" && data.starts) setStarts(data.starts as SectionStarts);
      syncClock(data?.server_now_ms);
      if (!res.ok) setError("Subtes belum bisa dimulai. Muat ulang halaman, lalu coba lagi.");
    } catch {
      setError("Gagal terhubung ke server. Periksa koneksi, lalu coba lagi.");
    } finally {
      setBusy(false);
    }
  }

  async function saveAnswer(itemId: number, value: string) {
    setPending((n) => n + 1);
    try {
      const res = await fetch("/api/test-responses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, session_id: Number(sessionId), item_id: Number(itemId), answer_value: value }),
      });
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) {
        setError(
          data.error === "section_closed"
            ? "Waktu subtes ini sudah habis. Jawaban terakhir tidak disimpan."
            : "Jawaban belum tersimpan. Periksa koneksi, lalu pilih jawaban lagi.",
        );
      }
    } catch {
      setError("Jawaban belum tersimpan. Periksa koneksi, lalu pilih jawaban lagi.");
    } finally {
      setPending((n) => Math.max(0, n - 1));
    }
  }

  function remember(itemId: number, value: string) {
    setError(null);
    setAnswers((prev) => ({ ...prev, [itemId]: value }));
    void saveAnswer(itemId, value);
  }

  async function submit() {
    if (submitted.current) return;
    submitted.current = true;
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/test-sessions/complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, session_id: Number(sessionId) }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok && typeof data.result_token === "string") {
        router.push(`/hasil/${data.result_token}`);
        return;
      }
      setError("Hasil belum bisa diproses. Periksa koneksi Anda, lalu coba lagi.");
    } catch {
      setError("Hasil belum bisa diproses. Periksa koneksi Anda, lalu coba lagi.");
    }
    submitted.current = false;
    setSubmitting(false);
  }

  const submitRef = useRef(submit);
  useEffect(() => {
    submitRef.current = submit;
  });
  useEffect(() => {
    if (view === "finish" && pending === 0 && !submitted.current) void submitRef.current();
  }, [view, pending]);

  if (view === "finish") {
    return (
      <Shell>
        <div className="bg-white rounded-3xl p-8 shadow-lg border border-slate-100 text-center">
          <p className="text-xs font-black text-red-600 uppercase tracking-widest mb-3">{testName}</p>
          <h1 className="text-2xl font-black text-slate-900 mb-3">Semua subtes selesai</h1>
          <p className="text-slate-600">{submitting ? "Mengirim jawaban dan menghitung hasil..." : "Jawaban Anda siap dikirim."}</p>
          {error && <p className="mt-4 text-sm text-red-700 bg-red-50 border border-red-100 rounded-xl px-4 py-3">{error}</p>}
          {!submitting && (
            <button type="button" onClick={() => void submit()} className="btn-primary mt-6 px-6 py-3 rounded-xl text-sm">
              Kirim jawaban
            </button>
          )}
        </div>
      </Shell>
    );
  }

  if (view === "intro") {
    const sub = subtests[nextIndex];
    const prev = nextIndex > 0 ? subtests[nextIndex - 1] : null;
    const prevExpired = prev && closedThrough < nextIndex - 1 && typeof starts[prev.code] === "number";
    return (
      <Shell>
        <div className="bg-white rounded-3xl p-8 md:p-10 shadow-lg border border-slate-100">
          {prevExpired && (
            <p className="mb-5 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-900">
              Waktu subtes {prev.code} sudah habis. Tes berlanjut ke subtes berikutnya.
            </p>
          )}
          <p className="text-xs font-black text-red-600 uppercase tracking-widest mb-2">
            {testName} · Subtes {nextIndex + 1} dari {subtests.length}
          </p>
          <h1 className="text-2xl font-black text-slate-900 mb-1">{sub.code} — {sub.name}</h1>
          <p className="text-sm text-slate-500 mb-5">
            Soal {sub.from}–{sub.to} · Waktu {minutes(sub.timeLimitSec)} menit
            {sub.memorizeSec ? ` (didahului ${minutes(sub.memorizeSec)} menit menghafal)` : ""}
          </p>
          <p className="text-slate-700 leading-relaxed whitespace-pre-line">{sub.instructions}</p>
          {(sub.code === "RA" || sub.code === "ZR") && (
            <p className="text-sm text-slate-600 mt-3">Pada tes online, ketik jawaban berupa angka. Urutan angka tidak dinilai.</p>
          )}
          {sub.code === "GE" && <p className="text-sm text-slate-600 mt-3">Ketik satu kata atau frasa singkat untuk setiap soal.</p>}
          {sub.examples.length > 0 && (
            <div className="mt-6 rounded-2xl bg-slate-50 p-4 space-y-3">
              <p className="text-xs font-black uppercase tracking-widest text-slate-500">Contoh</p>
              {sub.exampleImage && (
                <img src={withAssetToken(sub.exampleImage, token) ?? sub.exampleImage} alt={`Contoh subtes ${sub.code}`} className="mx-auto max-h-[420px] w-auto max-w-full rounded-xl border border-slate-200 bg-white" />
              )}
              {sub.examples.map((example, index) => (
                <div key={index} className="text-sm text-slate-700">
                  {example.stem && <p className="font-semibold">{example.stem}</p>}
                  {example.options && (
                    <p className="text-slate-600">
                      {example.options.map((option, i) => `${String.fromCharCode(97 + i)}) ${option}`).join("   ")}
                    </p>
                  )}
                  <p className="text-emerald-700 font-semibold">Jawaban: {example.key}</p>
                </div>
              ))}
            </div>
          )}
          <p className="text-sm text-slate-700 mt-6 font-semibold">
            Hitungan mundur dimulai saat Anda menekan tombol di bawah dan tetap berjalan jika halaman dimuat ulang. Setelah subtes selesai,
            Anda tidak bisa kembali ke subtes ini.
          </p>
          {error && <p className="mt-4 text-sm text-red-700 bg-red-50 border border-red-100 rounded-xl px-4 py-3">{error}</p>}
          <button type="button" disabled={busy} onClick={() => void startSection(sub.code)} className="btn-primary mt-6 px-8 py-3 rounded-xl text-sm disabled:opacity-40">
            {busy ? "Memulai..." : `Mulai subtes ${sub.code}`}
          </button>
        </div>
      </Shell>
    );
  }

  // view === "section"
  const sub = current!;
  const info = phase!;
  const remaining = info.endsMs - now;

  if (info.phase === "memorize") {
    return <MemorizeBoard sessionId={sessionId} token={token} testName={testName} code={sub.code} remaining={remaining} />;
  }

  const list = bySection.get(sub.code) ?? [];
  const index = Math.min(cursor[sub.code] ?? 0, Math.max(0, list.length - 1));
  const item = list[index];
  const goTo = (next: number) => setCursor((prev) => ({ ...prev, [sub.code]: Math.max(0, Math.min(list.length - 1, next)) }));
  const answeredCount = list.filter((row) => answers[row.id]).length;
  const typed = item ? itemMeta(item).answer_type === "text" || itemMeta(item).answer_type === "number" : false;

  function finishEarly() {
    const open = list.length - answeredCount;
    const message = open > 0
      ? `Masih ada ${open} soal kosong di subtes ${sub.code}. Selesaikan subtes ini? Anda tidak bisa kembali.`
      : `Selesaikan subtes ${sub.code}? Anda tidak bisa kembali.`;
    if (window.confirm(message)) setClosedThrough(last);
  }

  return (
    <Shell>
      <Header
        testName={testName}
        title={`${sub.code} — Soal ${item?.item_order ?? ""} (${index + 1}/${list.length})`}
        clock={remaining}
        sub={`${answeredCount} dari ${list.length} terjawab`}
      />
      {item && (
        <>
          <div className="bg-white rounded-3xl p-8 shadow-lg border border-slate-100 mb-6">
            <p className="text-xl font-bold text-slate-900 leading-relaxed whitespace-pre-line">{item.question_text}</p>
            <ItemMedia item={item} token={token} />
          </div>
          {typed ? (
            <TypedAnswer
              key={item.id}
              itemId={item.id}
              saved={answers[item.id]}
              numeric={itemMeta(item).answer_type === "number"}
              saving={pending > 0}
              onSave={(value) => remember(item.id, value)}
            />
          ) : (
            <div className="space-y-3">
              {optionsOf(item).map((opt, i) => {
                const selected = answers[item.id] === opt.value;
                return (
                  <button
                    key={`${opt.value}-${i}`}
                    type="button"
                    aria-pressed={selected}
                    onClick={() => {
                      remember(item.id, opt.value);
                      if (advanceTimer.current) clearTimeout(advanceTimer.current);
                      if (index < list.length - 1) advanceTimer.current = setTimeout(() => goTo(index + 1), 300);
                    }}
                    className={`test-option-btn ${selected ? "selected" : ""}`}
                  >
                    <span className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-black shrink-0 ${selected ? "bg-red-600 text-white" : "bg-slate-100 text-slate-500"}`}>
                      {String.fromCharCode(65 + i)}
                    </span>
                    <span className="flex-1 text-left">
                      {opt.image ? <img src={withAssetToken(opt.image, token) ?? opt.image} alt={opt.label} className="max-h-24 w-auto" /> : opt.label}
                    </span>
                  </button>
                );
              })}
            </div>
          )}
        </>
      )}
      {error && <p className="mt-4 text-sm text-red-700 bg-red-50 border border-red-100 rounded-xl px-4 py-3">{error}</p>}
      <div className="mt-6 flex flex-wrap gap-1.5">
        {list.map((row, i) => (
          <button
            key={row.id}
            type="button"
            onClick={() => goTo(i)}
            aria-label={`Soal ${row.item_order}`}
            className={`w-9 h-9 rounded-lg text-xs font-bold ${i === index ? "bg-red-600 text-white" : answers[row.id] ? "bg-emerald-100 text-emerald-800" : "bg-slate-100 text-slate-500"}`}
          >
            {row.item_order}
          </button>
        ))}
      </div>
      <div className="mt-6 flex items-center justify-between gap-4">
        <button type="button" onClick={() => goTo(index - 1)} disabled={index === 0} className="btn-outline px-6 py-3 rounded-xl text-sm disabled:opacity-40">
          ← Sebelumnya
        </button>
        {index < list.length - 1 ? (
          <button type="button" onClick={() => goTo(index + 1)} className="btn-primary px-6 py-3 rounded-xl text-sm">
            Selanjutnya →
          </button>
        ) : (
          <button type="button" onClick={finishEarly} disabled={pending > 0} className="btn-primary px-6 py-3 rounded-xl text-sm disabled:opacity-40">
            Selesai subtes {sub.code}
          </button>
        )}
      </div>
    </Shell>
  );
}

function MemorizeBoard({
  sessionId,
  token,
  testName,
  code,
  remaining,
}: {
  sessionId: number;
  token: string;
  testName: string;
  code: string;
  remaining: number;
}) {
  const [list, setList] = useState<IstMemorizeList | null>(null);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const res = await fetch("/api/test-sessions/memorize-list", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token, session_id: Number(sessionId) }),
        });
        const data = (await res.json().catch(() => null)) as { list?: unknown } | null;
        if (cancelled) return;
        const words = data?.list;
        if (res.ok && words && typeof words === "object" && !Array.isArray(words)) setList(words as IstMemorizeList);
      } catch {
        if (!cancelled) setList(null);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [sessionId, token, code]);

  return (
    <Shell>
      <Header testName={testName} title={`${code} — Hafalkan`} clock={remaining} sub="Daftar ditutup otomatis saat waktu hafalan habis." />
      <div className="bg-white rounded-3xl p-8 shadow-lg border border-slate-100">
        {!list && <p className="mb-4 text-sm text-slate-600">Daftar hafalan sedang dimuat. Jika kosong, muat ulang halaman.</p>}
        <div className="grid grid-cols-1 sm:grid-cols-5 gap-4">
          {Object.entries(list ?? {}).map(([group, words]) => (
            <div key={group}>
              <p className="text-xs font-black uppercase tracking-widest text-red-600 mb-2">{group}</p>
              <ul className="space-y-1">
                {words.map((word) => (
                  <li key={word} className="text-base font-semibold text-slate-900">{word}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </Shell>
  );
}

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-red-50/30 px-4 py-10">
      <div className="max-w-[680px] mx-auto">{children}</div>
    </div>
  );
}

function Header({ testName, title, clock, sub }: { testName: string; title: string; clock: number; sub: string }) {
  return (
    <div className="mb-6 flex items-start justify-between gap-4">
      <div>
        <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">{testName}</p>
        <p className="text-base font-black text-slate-900">{title}</p>
        <p className="text-xs text-slate-500 mt-1">{sub}</p>
      </div>
      <p aria-live="polite" className={`text-2xl font-black tabular-nums ${clock < 60_000 ? "text-red-600" : "text-slate-800"}`}>
        {formatClock(clock)}
      </p>
    </div>
  );
}
