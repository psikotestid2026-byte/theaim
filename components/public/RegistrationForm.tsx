"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Service, ServicePackage } from "@/types/db";
import { formatIDR } from "@/lib/utils";

interface Props {
  services: Service[];
  packagesByService: Record<number, ServicePackage[]>;
  preselectedServiceId?: number;
}

export default function RegistrationForm({ services, packagesByService, preselectedServiceId }: Props) {
  const router = useRouter();
  const [selectedServiceId, setSelectedServiceId] = useState<number | "">(preselectedServiceId ?? "");
  const [selectedPackageId, setSelectedPackageId] = useState<number | "">("");
  const [fullName, setFullName] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const selectedService = services.find(s => s.id === selectedServiceId);
  const packages = selectedServiceId ? (packagesByService[selectedServiceId] ?? []) : [];
  const selectedPackage = packages.find(p => p.id === selectedPackageId);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedServiceId || !fullName || !whatsapp) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/registrations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          service_id: selectedServiceId,
          package_id: selectedPackageId || undefined,
          full_name: fullName,
          whatsapp_number: `62${whatsapp.replace(/^0/, "")}`,
          notes,
        }),
      });
      if (!res.ok) throw new Error("Gagal mendaftar. Silakan coba lagi.");
      const data = await res.json();
      // Redirect to payment page
      router.push(`/pembayaran/${data.registration_code}`);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan.");
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Order summary */}
      {selectedService && selectedPackage && (
        <div className="bg-slate-50 rounded-2xl border border-slate-100 p-5 mb-2 animate-fade-in">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">Ringkasan Pesanan</p>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-bold text-slate-900 text-sm">{selectedService.name}</p>
              <p className="text-slate-500 text-xs font-medium mt-0.5">Paket: {selectedPackage.name}</p>
            </div>
            <div className="text-right">
              <p className="font-black text-red-600 text-xl tracking-tight">
                {selectedPackage.price_type === "negotiable" ? "Dikonfirmasi" : formatIDR(Number(selectedPackage.price_amount))}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Service select */}
      <div>
        <label htmlFor="layanan" className="form-label">Layanan yang Dipilih <span className="text-red-600">*</span></label>
        <select
          id="layanan"
          required
          value={selectedServiceId}
          onChange={e => { setSelectedServiceId(Number(e.target.value)); setSelectedPackageId(""); }}
          className="form-input"
        >
          <option value="">-- Pilih Layanan --</option>
          {services.map(s => (
            <option key={s.id} value={s.id}>{s.name}</option>
          ))}
        </select>
      </div>

      {/* Package select */}
      <div>
        <label htmlFor="paket" className="form-label">Paket / Sesi <span className="text-red-600">*</span></label>
        <select
          id="paket"
          required
          value={selectedPackageId}
          onChange={e => setSelectedPackageId(Number(e.target.value))}
          className="form-input"
          disabled={!selectedServiceId}
        >
          <option value="">-- Pilih Paket --</option>
          {packages.map(p => (
            <option key={p.id} value={p.id}>
              {p.name} {p.price_amount ? `– ${formatIDR(Number(p.price_amount))}` : "– Harga dikonfirmasi admin"}
            </option>
          ))}
        </select>
      </div>

      <div className="h-px w-full bg-slate-100" />

      {/* Name */}
      <div>
        <label htmlFor="nama" className="form-label">Nama Lengkap <span className="text-red-600">*</span></label>
        <input
          id="nama"
          type="text"
          required
          value={fullName}
          onChange={e => setFullName(e.target.value)}
          placeholder="Masukkan nama lengkap Anda"
          className="form-input"
        />
      </div>

      {/* WhatsApp */}
      <div>
        <label htmlFor="nohp" className="form-label">Nomor WhatsApp <span className="text-red-600">*</span></label>
        <div className="relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 font-bold border-r border-slate-200 pr-3 text-sm">+62</span>
          <input
            id="nohp"
            type="tel"
            required
            value={whatsapp}
            onChange={e => {
              let val = e.target.value.replace(/\D/g, "");
              if (val.startsWith("62")) val = val.slice(2);
              if (val.startsWith("0")) val = val.slice(1);
              setWhatsapp(val);
            }}
            placeholder="81234567890"
            className="form-input"
            style={{ paddingLeft: "3.5rem" }}
          />
        </div>
        <p className="text-[11px] text-slate-500 mt-2">ℹ️ Pastikan nomor aktif. Informasi lanjutan akan dikirimkan ke nomor ini.</p>
      </div>

      {/* Notes */}
      <div>
        <label htmlFor="catatan" className="form-label">Catatan Tambahan <span className="text-slate-400 text-[11px] font-normal">(opsional)</span></label>
        <textarea
          id="catatan"
          value={notes}
          onChange={e => setNotes(e.target.value)}
          rows={3}
          placeholder="Tuliskan kondisi atau pertanyaan khusus yang ingin Anda sampaikan ke konsultan kami..."
          className="form-input resize-none"
        />
      </div>

      {error && <p className="text-red-600 text-sm font-medium bg-red-50 p-3 rounded-xl">{error}</p>}

      <button
        type="submit"
        disabled={loading}
        className="w-full btn-primary py-4 rounded-xl text-sm gap-2 shadow-lg shadow-red-200 disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {loading ? "Memproses..." : <>Lanjut ke Pembayaran →</>}
      </button>
    </form>
  );
}
