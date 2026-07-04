"use client";

import { useState } from "react";
import type { PaymentMethod, PaymentInstruction, Registration } from "@/types/db";
import { formatIDR } from "@/lib/utils";

interface Props {
  registration: Registration;
  methods: PaymentMethod[];
  instructionsByMethod: Record<number, PaymentInstruction[]>;
}

type Step = "select" | "instructions" | "success";

export default function PaymentFlow({ registration, methods, instructionsByMethod }: Props) {
  const [step, setStep] = useState<Step>("select");
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod | null>(null);
  const [loading, setLoading] = useState(false);
  const [testLink, setTestLink] = useState<string | null>(null);
  const [paymentCode, setPaymentCode] = useState<string>("");

  async function handleConfirmMethod() {
    if (!selectedMethod) return;
    setLoading(true);
    try {
      const res = await fetch("/api/payments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          registration_id: registration.id,
          payment_method_id: selectedMethod.id,
        }),
      });
      const data = await res.json();
      setPaymentCode(data.payment_code ?? "");
      setStep("instructions");
    } catch {
      alert("Gagal memproses. Silakan coba lagi.");
    } finally {
      setLoading(false);
    }
  }

  async function handleSimulatePaid() {
    setLoading(true);
    try {
      const res = await fetch(`/api/payments/simulate-paid`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ registration_code: registration.registration_code }),
      });
      const data = await res.json();
      setTestLink(data.test_link ?? null);
      setStep("success");
    } catch {
      // Still show success with mock link for demo
      setTestLink(`/tes/demo-token-${registration.registration_code}`);
      setStep("success");
    } finally {
      setLoading(false);
    }
  }

  const instructions = selectedMethod ? (instructionsByMethod[selectedMethod.id] ?? []) : [];
  const amount = registration.price_quoted ? Number(registration.price_quoted) : null;

  if (step === "success") {
    return (
      <div className="text-center animate-fade-in">
        <div className="w-20 h-20 bg-green-50 text-green-500 rounded-full flex items-center justify-center text-4xl mx-auto mb-6">✅</div>
        <h2 className="text-2xl font-extrabold text-slate-900 mb-3">Pembayaran Dikonfirmasi!</h2>
        <p className="text-slate-500 text-sm mb-8 leading-relaxed">
          Terima kasih! Pendaftaran Anda telah kami terima. Link tes psikologi Anda sudah siap — silakan buka di tab baru.
        </p>
        {testLink && (
          <div className="bg-slate-50 rounded-2xl p-5 mb-6 border border-slate-100">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Link Tes Anda</p>
            <a
              href={testLink}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 btn-primary px-8 py-3.5 rounded-xl text-sm w-full justify-center mb-3"
            >
              🔗 Buka Link Tes → (Tab Baru)
            </a>
            <p className="text-[11px] text-slate-400">Link ini hanya dapat digunakan sekali. Simpan URL hasil tes untuk akses permanen.</p>
          </div>
        )}
        <a
          href={`/status/${registration.registration_code}`}
          className="text-sm text-slate-500 hover:text-red-600 underline underline-offset-2 transition-colors"
        >
          Cek status pendaftaran
        </a>
      </div>
    );
  }

  if (step === "instructions" && selectedMethod) {
    return (
      <div className="animate-fade-in">
        <div className="flex items-center gap-3 mb-6">
          <button onClick={() => setStep("select")} className="p-2 rounded-lg hover:bg-slate-100 transition-colors">
            <span className="text-slate-500">←</span>
          </button>
          <div>
            <h2 className="text-xl font-extrabold text-slate-900">Instruksi Pembayaran</h2>
            <p className="text-sm text-slate-500">{selectedMethod.name}</p>
          </div>
        </div>

        {/* Amount box */}
        <div className="bg-red-50 rounded-2xl p-5 mb-6 border border-red-100">
          <p className="text-xs font-bold text-red-400 uppercase tracking-widest mb-2">Total yang harus dibayar</p>
          <p className="text-3xl font-black text-red-600 tracking-tight">
            {amount ? formatIDR(amount) : "Akan dikonfirmasi admin"}
          </p>
          {paymentCode && <p className="text-xs text-slate-500 mt-1">Kode: <strong>{paymentCode}</strong></p>}
        </div>

        {/* Instructions list */}
        {instructions.length > 0 ? (
          <ol className="space-y-4 mb-8">
            {instructions.map((inst, i) => (
              <li key={inst.id} className="flex gap-4">
                <div className="w-7 h-7 rounded-full bg-slate-900 text-white text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">{i + 1}</div>
                <div>
                  {inst.title && <p className="font-bold text-slate-900 text-sm mb-0.5">{inst.title}</p>}
                  <p className="text-slate-600 text-sm leading-relaxed">{inst.content}</p>
                </div>
              </li>
            ))}
          </ol>
        ) : (
          <div className="bg-slate-50 rounded-2xl p-6 mb-8 text-sm text-slate-500 leading-relaxed">
            <p className="font-bold text-slate-900 mb-2">Cara Pembayaran {selectedMethod.name}:</p>
            <ol className="space-y-2 list-decimal list-inside">
              <li>Buka aplikasi {selectedMethod.name} Anda</li>
              <li>Pilih menu Transfer / Bayar</li>
              <li>Masukkan nominal: <strong>{amount ? formatIDR(amount) : "sesuai konfirmasi admin"}</strong></li>
              <li>Masukkan kode referensi: <strong>{paymentCode}</strong></li>
              <li>Selesaikan pembayaran dan simpan bukti</li>
            </ol>
          </div>
        )}

        <div className="space-y-3">
          {/* Simulate Paid button (for demo purposes) */}
          <button
            onClick={handleSimulatePaid}
            disabled={loading}
            className="w-full btn-primary py-4 rounded-xl text-sm gap-2 shadow-lg shadow-red-200 disabled:opacity-60"
          >
            {loading ? "Memproses..." : "✅ Simulasi: Sudah Bayar → Dapatkan Link Tes"}
          </button>
          <a
            href="https://wa.me/6281999554599"
            target="_blank"
            rel="noopener noreferrer"
            className="w-full btn-corp py-3.5 rounded-xl text-sm gap-2 flex items-center justify-center"
          >
            💬 Konfirmasi via WhatsApp ke Admin
          </a>
        </div>
        <p className="text-center text-[11px] text-slate-400 mt-4">Admin akan memverifikasi pembayaran dan mengirimkan link tes dalam 1×24 jam hari kerja.</p>
      </div>
    );
  }

  // Step: select method
  return (
    <div>
      <div className="text-center mb-8">
        <div className="w-14 h-14 bg-red-50 text-red-600 rounded-2xl flex items-center justify-center text-2xl mx-auto mb-4">💳</div>
        <h2 className="text-2xl font-extrabold text-slate-900 mb-2">Pilih Metode Pembayaran</h2>
        <p className="text-slate-500 font-medium text-sm">Selesaikan pembayaran untuk mengamankan pendaftaran Anda.</p>
      </div>

      {/* Registration summary */}
      <div className="bg-slate-50 rounded-2xl p-5 mb-8 border border-slate-100">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Ringkasan Pendaftaran</h3>
        <div className="flex justify-between items-start mb-1">
          <span className="text-xs text-slate-400 font-semibold uppercase">Layanan</span>
          <span className="text-sm font-bold text-slate-900 text-right">{registration.service_name ?? "—"}</span>
        </div>
        <div className="flex justify-between items-start pb-3 border-b border-slate-200">
          <span className="text-xs text-slate-400 font-semibold uppercase">Paket</span>
          <span className="text-sm font-medium text-slate-600 text-right">{registration.package_name ?? "—"}</span>
        </div>
        <div className="flex justify-between items-center pt-3">
          <span className="text-sm font-bold text-slate-900">Total Tagihan</span>
          <span className="text-xl font-black text-red-600">
            {amount ? formatIDR(amount) : "Akan Dikonfirmasi"}
          </span>
        </div>
        {!amount && (
          <p className="text-[11px] text-slate-500 mt-2 italic">* Harga akan dikonfirmasi oleh admin setelah verifikasi jadwal.</p>
        )}
      </div>

      {/* Payment methods */}
      <div className="space-y-3 mb-8">
        {(methods.length > 0 ? methods : [
          { id: 1, name: "QRIS (Semua E-Wallet)", code: "QRIS", channel_type: "qris", is_active: true, sort_order: 1 } as PaymentMethod,
          { id: 2, name: "Transfer Bank BCA/Mandiri", code: "VA_BCA", channel_type: "virtual_account", is_active: true, sort_order: 2 } as PaymentMethod,
          { id: 3, name: "GoPay", code: "GOPAY", channel_type: "e_wallet", is_active: true, sort_order: 3 } as PaymentMethod,
        ]).map(method => (
          <label
            key={method.id}
            className={`block border-2 rounded-xl p-4 cursor-pointer transition-all ${
              selectedMethod?.id === method.id
                ? "border-red-600 bg-red-50"
                : "border-slate-200 hover:border-red-300"
            }`}
          >
            <input
              type="radio"
              name="payment"
              className="sr-only"
              checked={selectedMethod?.id === method.id}
              onChange={() => setSelectedMethod(method)}
            />
            <div className="flex items-center gap-4">
              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${
                selectedMethod?.id === method.id ? "border-red-600" : "border-slate-300"
              }`}>
                {selectedMethod?.id === method.id && <div className="w-2.5 h-2.5 bg-red-600 rounded-full" />}
              </div>
              <div className="flex-1">
                <p className="font-bold text-slate-900 text-sm">{method.name}</p>
                <p className="text-xs text-slate-500 font-medium mt-0.5 capitalize">{method.channel_type.replace(/_/g, " ")}</p>
              </div>
              <span className="text-2xl">
                {method.channel_type === "qris" ? "📱" : method.channel_type === "e_wallet" ? "💚" : "🏦"}
              </span>
            </div>
          </label>
        ))}
      </div>

      <button
        onClick={handleConfirmMethod}
        disabled={!selectedMethod || loading}
        className="w-full btn-primary py-4 rounded-xl text-sm gap-2 shadow-lg shadow-red-200 disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {loading ? "Memproses..." : "Lanjut ke Instruksi Pembayaran →"}
      </button>
    </div>
  );
}
