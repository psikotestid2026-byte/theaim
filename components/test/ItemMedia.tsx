/* eslint-disable @next/next/no-img-element -- figures are served by the token-gated asset route */
import { itemImage, itemOptionsImage } from "@/lib/scoring/item-meta";
import { withAssetToken } from "@/lib/test-assets";

/** Stimulus figure and (for IST FA) the shared answer-choice sheet stored in scoring_meta. */
export default function ItemMedia({ item, token }: { item: { item_order: number; scoring_meta?: unknown }; token: string }) {
  const image = withAssetToken(itemImage(item), token);
  const sheet = withAssetToken(itemOptionsImage(item), token);
  if (!image && !sheet) return null;
  return (
    <div className="mt-5 space-y-4">
      {image && (
        <img
          src={image}
          alt={`Gambar soal ${item.item_order}`}
          className="mx-auto max-h-[360px] w-auto max-w-full rounded-xl border border-slate-100 bg-white"
        />
      )}
      {sheet && (
        <div>
          <p className="text-xs font-bold text-slate-500 mb-2">Pilihan bentuk</p>
          <img
            src={sheet}
            alt="Pilihan jawaban a sampai e"
            className="mx-auto max-h-[200px] w-auto max-w-full rounded-xl border border-slate-100 bg-white"
          />
        </div>
      )}
    </div>
  );
}
