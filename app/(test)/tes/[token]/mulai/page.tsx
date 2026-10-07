import { notFound, redirect } from "next/navigation";
import { getSessionByAccessToken } from "@/lib/queries/test-sessions";
import { getItemsByTestCode } from "@/lib/queries/test-items";
import { getResponsesBySession } from "@/lib/queries/test-responses";
import { getMasterTestByCode } from "@/lib/queries/master-tests";
import { canStartTest } from "@/lib/test-access";
import { inspectIstBank } from "@/lib/ist-bank";
import { timedDurationSec } from "@/lib/test-timer";
import TestEngine from "@/components/test/TestEngine";

export default async function TestStartPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const session = await getSessionByAccessToken(token).catch(() => null);

  if (!session) return notFound();
  if (session.status === "completed") redirect(`/hasil/${session.result_token}`);
  if (!canStartTest(session.status)) redirect(`/tes/${token}`);

  const [items, saved, master] = await Promise.all([
    getItemsByTestCode(session.test_code),
    getResponsesBySession(session.id).catch(() => []),
    getMasterTestByCode(session.test_code).catch(() => null),
  ]);
  if (session.test_code.toLowerCase() === "ist") {
    const bank = inspectIstBank(items);
    if (!bank.usable) {
      return (
        <div className="min-h-screen flex items-center justify-center p-8">
          <div className="max-w-[560px] bg-white rounded-3xl border border-slate-100 shadow-lg p-8">
            <p className="text-xs font-black uppercase tracking-widest text-red-600 mb-3">IST</p>
            <h1 className="text-xl font-black text-slate-900 mb-3">Bank soal belum lengkap</h1>
            <p className="text-sm text-slate-600 mb-4">
              Tes IST belum bisa dikerjakan. Bank soal yang tersimpan belum cukup untuk sembilan subtes, jadi kami tidak menampilkan soal yang rusak.
            </p>
            <ul className="space-y-2 text-sm text-slate-700">
              {bank.messages.map((message) => (
                <li key={message}>{message}</li>
              ))}
            </ul>
          </div>
        </div>
      );
    }
  }

  if (!items.length) {
    return (
      <div className="min-h-screen flex items-center justify-center p-8 text-center">
        <div>
          <p className="text-2xl mb-4">⚠️</p>
          <h1 className="text-xl font-bold text-slate-900 mb-2">Bank Soal Belum Tersedia</h1>
          <p className="text-slate-500 text-sm">Silakan hubungi admin TheAIM.</p>
        </div>
      </div>
    );
  }

  const initialAnswers: Record<string, string> = {};
  for (const row of saved) initialAnswers[String(row.item_id)] = row.answer_value;

  return (
    <TestEngine
      sessionId={session.id}
      token={token}
      testCode={session.test_code}
      testName={master?.name ?? session.test_code}
      instructions={master?.instructions?.trim() || null}
      durationSec={master?.duration_sec ?? 0}
      timeLimitSec={timedDurationSec(session.test_code) ?? 0}
      items={items}
      initialAnswers={initialAnswers}
    />
  );
}
