export default function IncompleteBankScreen({ messages }: { messages: string[] }) {
  const lines = messages.length > 0 ? messages : ["Bank soal yang tersimpan belum cukup untuk dikerjakan."];
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4 py-16">
      <div className="max-w-[560px] w-full bg-white rounded-3xl border border-slate-100 shadow-xl p-8 md:p-10">
        <p className="text-xs font-black uppercase tracking-widest text-red-600 mb-3">IST</p>
        <h1 className="text-2xl font-extrabold text-slate-900 mb-3">Bank soal belum lengkap</h1>
        <p className="text-sm text-slate-600 mb-4 leading-relaxed">
          Tes ini belum bisa dikerjakan. Bank soal yang tersimpan belum cukup, jadi kami tidak menampilkan soal yang rusak dan tidak meminta verifikasi WhatsApp.
        </p>
        <ul className="space-y-2 text-sm text-slate-700">
          {lines.map((message) => (
            <li key={message}>{message}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}
