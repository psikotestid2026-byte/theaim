"use client";
export default function PrintButton() {
  return (
    <button
      onClick={() => window.print()}
      className="btn-primary py-3 px-6 rounded-xl text-sm inline-flex items-center gap-2 no-print"
    >
      🖨️ Simpan PDF
    </button>
  );
}
