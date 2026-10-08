"use client";

import { useState } from "react";
import { TYPED_ANSWER_MAX } from "@/lib/scoring/item-meta";

/** Free-text answer box. The parent stores the answer only when the participant confirms it. */
export default function TypedAnswer({
  itemId,
  saved,
  numeric,
  saving,
  onSave,
}: {
  itemId: number;
  saved: string | undefined;
  numeric: boolean;
  saving: boolean;
  onSave: (value: string) => void;
}) {
  const [draft, setDraft] = useState(saved ?? "");
  const trimmed = draft.trim();
  const valid = trimmed.length > 0 && (!numeric || /^\d{1,6}$/.test(trimmed));
  const dirty = trimmed !== (saved ?? "");

  function commit() {
    if (valid && dirty) onSave(trimmed);
  }

  return (
    <form
      key={itemId}
      onSubmit={(event) => {
        event.preventDefault();
        commit();
      }}
      className="space-y-3"
    >
      <label htmlFor={`answer-${itemId}`} className="block text-sm font-bold text-slate-700">
        {numeric ? "Ketik jawaban berupa angka" : "Ketik jawaban Anda"}
      </label>
      <input
        id={`answer-${itemId}`}
        value={draft}
        onChange={(event) => setDraft(numeric ? event.target.value.replace(/\D/g, "") : event.target.value)}
        onBlur={commit}
        inputMode={numeric ? "numeric" : "text"}
        autoComplete="off"
        maxLength={TYPED_ANSWER_MAX}
        className="w-full rounded-2xl border-2 border-slate-200 bg-white px-4 py-4 text-lg font-semibold text-slate-900 focus:border-red-500 focus:outline-none"
      />
      <div className="flex items-center justify-between gap-3">
        <p className="text-xs text-slate-500">
          {saving ? "Menyimpan..." : saved && !dirty ? `Tersimpan: ${saved}` : "Tekan Enter atau Simpan."}
        </p>
        <button type="submit" disabled={!valid || !dirty} className="btn-primary px-5 py-2 rounded-xl text-sm disabled:opacity-40">
          Simpan
        </button>
      </div>
    </form>
  );
}
