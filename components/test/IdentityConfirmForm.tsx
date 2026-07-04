"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { maskWhatsApp } from "@/lib/utils";

interface Props {
  token: string;
  maskedWa: string;
  sessionId: number;
  resultToken: string;
}

export default function IdentityConfirmForm({ token, maskedWa, sessionId, resultToken }: Props) {
  const router = useRouter();
  const [digits, setDigits] = useState(["", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [remaining, setRemaining] = useState(3);

  const combined = digits.join("");

  function handleDigit(idx: number, val: string) {
    if (!/^\d?$/.test(val)) return;
    const next = [...digits];
    next[idx] = val;
    setDigits(next);
    if (val && idx < 3) {
      document.getElementById(`d${idx + 1}`)?.focus();
    }
  }

  function handleKeyDown(idx: number, e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Backspace" && !digits[idx] && idx > 0) {
      document.getElementById(`d${idx - 1}`)?.focus();
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (combined.length !== 4) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/test-sessions/confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, last4: combined }),
      });
      const data = await res.json();
      if (res.status === 200 && data.ok) {
        router.push(`/tes/${token}/mulai`);
      } else if (res.status === 423) {
        setError("Akses terkunci. Terlalu banyak percobaan gagal. Hubungi admin TheAIM.");
      } else if (res.status === 422) {
        setRemaining(data.remaining ?? remaining - 1);
        setError(`4 digit terakhir tidak sesuai. Sisa percobaan: ${data.remaining ?? remaining - 1}`);
        setDigits(["", "", "", ""]);
        document.getElementById("d0")?.focus();
      } else {
        setError("Terjadi kesalahan. Silakan coba lagi.");
      }
    } catch {
      setError("Gagal terhubung ke server.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4 py-16">
      <div className="max-w-[420px] w-full bg-white rounded-3xl p-8 md:p-12 shadow-xl border border-slate-100">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-red-50 text-red-600 rounded-2xl flex items-center justify-center text-3xl mx-auto mb-5">🔐</div>
          <h1 className="text-2xl font-extrabold text-slate-900 mb-3 tracking-tight">Verifikasi Identitas</h1>
          <p className="text-slate-500 text-sm leading-relaxed">
            Masukkan <strong>4 digit terakhir</strong> nomor WhatsApp yang Anda daftarkan:
          </p>
          <div className="mt-3 inline-flex items-center gap-2 bg-slate-100 px-4 py-2 rounded-full">
            <span className="text-sm font-bold text-slate-700">{maskedWa}</span>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="flex justify-center gap-3 mb-8">
            {digits.map((d, i) => (
              <input
                key={i}
                id={`d${i}`}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={d}
                onChange={e => handleDigit(i, e.target.value)}
                onKeyDown={e => handleKeyDown(i, e)}
                className={`w-14 h-16 text-center text-2xl font-black border-2 rounded-xl outline-none transition-all ${
                  error ? "border-red-400 bg-red-50" : d ? "border-red-600 bg-red-50" : "border-slate-200 bg-slate-50 focus:border-red-500"
                }`}
              />
            ))}
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6 text-center">
              <p className="text-red-700 text-sm font-medium">{error}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={combined.length !== 4 || loading}
            className="w-full btn-primary py-4 rounded-xl text-sm gap-2 shadow-lg shadow-red-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Memverifikasi..." : "Verifikasi & Mulai Tes →"}
          </button>
        </form>

        <p className="text-center text-[11px] text-slate-400 mt-6">
          Nomor berbeda? Hubungi admin TheAIM via{" "}
          <a href="https://wa.me/6281999554599" className="text-red-600 font-semibold hover:underline">WhatsApp</a>.
        </p>
      </div>
    </div>
  );
}
