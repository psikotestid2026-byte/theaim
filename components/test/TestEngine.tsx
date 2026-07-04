"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import type { TestItem } from "@/types/db";

interface Props {
  sessionId: number;
  token: string;
  testCode: string;
  items: TestItem[];
  resultToken: string;
}

export default function TestEngine({ sessionId, token, testCode, items, resultToken }: Props) {
  const router = useRouter();
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [saving, setSaving] = useState(false);

  const item = items[current];
  const progress = ((current) / items.length) * 100;
  const options = Array.isArray(item.options) ? item.options : JSON.parse(item.options as unknown as string);

  const saveAnswer = useCallback(async (itemId: number, value: string) => {
    setSaving(true);
    try {
      await fetch("/api/test-responses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ session_id: sessionId, item_id: itemId, answer_value: value }),
      });
    } finally {
      setSaving(false);
    }
  }, [sessionId]);

  async function selectAnswer(value: string) {
    const updated = { ...answers, [item.id]: value };
    setAnswers(updated);
    await saveAnswer(item.id, value);

    if (current < items.length - 1) {
      setTimeout(() => setCurrent(c => c + 1), 350);
    }
  }

  async function handleSubmit() {
    setSubmitting(true);
    try {
      const res = await fetch("/api/test-sessions/complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, session_id: sessionId }),
      });
      const data = await res.json();
      if (data.result_token) {
        router.push(`/hasil/${data.result_token}`);
      } else {
        router.push(`/hasil/${resultToken}`);
      }
    } catch {
      router.push(`/hasil/${resultToken}`);
    }
  }

  const isLast = current === items.length - 1;
  const hasCurrentAnswer = !!answers[item.id];
  const totalAnswered = Object.keys(answers).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-red-50/30 flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-slate-100 sticky top-0 z-10">
        <div className="max-w-[640px] mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-red-600 rounded-lg flex items-center justify-center">
                <span className="text-white text-xs font-black">T</span>
              </div>
              <div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">{testCode} Test</p>
                <p className="text-sm font-bold text-slate-900">Soal {current + 1} dari {items.length}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-xs text-slate-400 font-medium">{totalAnswered} terjawab</p>
              <p className="text-xs text-slate-400">{items.length - totalAnswered} tersisa</p>
            </div>
          </div>
          <div className="test-progress-bar">
            <div className="test-progress-fill" style={{ width: `${progress}%` }} />
          </div>
        </div>
      </div>

      {/* Question */}
      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="max-w-[580px] w-full">
          <div className="bg-white rounded-3xl p-8 shadow-lg border border-slate-100 mb-6 animate-fade-in">
            {item.section && (
              <span className="inline-block text-[10px] font-black text-red-600 uppercase tracking-widest bg-red-50 px-3 py-1 rounded-full mb-4">
                {item.section}
              </span>
            )}
            <p className="text-xl font-bold text-slate-900 leading-relaxed">{item.question_text}</p>
          </div>

          <div className="space-y-3">
            {options.map((opt: { value: string; label: string }) => (
              <button
                key={opt.value}
                onClick={() => selectAnswer(opt.value)}
                className={`test-option-btn ${answers[item.id] === opt.value ? "selected" : ""}`}
              >
                <span className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-black shrink-0 transition-all ${
                  answers[item.id] === opt.value ? "bg-red-600 text-white" : "bg-slate-100 text-slate-500"
                }`}>
                  {opt.value}
                </span>
                <span className="flex-1 text-left">{opt.label}</span>
                {saving && answers[item.id] === opt.value && (
                  <span className="text-xs text-slate-400 animate-pulse">Menyimpan...</span>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Nav footer */}
      <div className="bg-white border-t border-slate-100 px-4 py-4 sticky bottom-0">
        <div className="max-w-[580px] mx-auto flex items-center justify-between gap-4">
          <button
            onClick={() => setCurrent(c => Math.max(0, c - 1))}
            disabled={current === 0}
            className="btn-outline px-6 py-3 rounded-xl text-sm disabled:opacity-40"
          >
            ← Sebelumnya
          </button>

          {!isLast ? (
            <button
              onClick={() => setCurrent(c => c + 1)}
              disabled={!hasCurrentAnswer}
              className="btn-primary px-6 py-3 rounded-xl text-sm disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Selanjutnya →
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={submitting || totalAnswered < items.length}
              className="btn-primary px-8 py-3 rounded-xl text-sm disabled:opacity-40 disabled:cursor-not-allowed shadow-lg shadow-red-200"
            >
              {submitting ? "Memproses Hasil..." : `✅ Selesai & Lihat Hasil (${totalAnswered}/${items.length})`}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
