import { notFound, redirect } from "next/navigation";
import { getSessionByAccessToken, readSectionTimers } from "@/lib/queries/test-sessions";
import { getItemsByTestCode } from "@/lib/queries/test-items";
import { getIstPublicSubtests } from "@/lib/queries/ist-content";
import { presentTakerItems } from "@/lib/taker-view";
import { getResponsesBySession } from "@/lib/queries/test-responses";
import { getMasterTestByCode } from "@/lib/queries/master-tests";
import { canStartTest } from "@/lib/test-access";
import { timedDurationSec } from "@/lib/test-timer";
import TestEngine from "@/components/test/TestEngine";
import IstRunner from "@/components/test/IstRunner";

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
  const visibleItems = presentTakerItems(items);

  if (session.test_code.toLowerCase() === "ist") {
    const [timers, subtests] = await Promise.all([readSectionTimers(session.id), getIstPublicSubtests()]);
    if (!timers) redirect(`/tes/${token}`);
    if (!subtests?.length) {
      return (
        <div className="min-h-screen flex items-center justify-center p-8 text-center">
          <div>
            <h1 className="text-xl font-bold text-slate-900 mb-2">Jadwal Subtes Belum Tersedia</h1>
            <p className="text-slate-500 text-sm">Silakan hubungi admin TheAIM.</p>
          </div>
        </div>
      );
    }
    return (
      <IstRunner
        sessionId={session.id}
        token={token}
        testName={master?.name ?? session.test_code}
        subtests={subtests}
        items={visibleItems}
        initialAnswers={initialAnswers}
        initialStarts={timers.starts}
        serverNowMs={timers.nowMs}
      />
    );
  }

  return (
    <TestEngine
      sessionId={session.id}
      token={token}
      testCode={session.test_code}
      testName={master?.name ?? session.test_code}
      instructions={master?.instructions?.trim() || null}
      durationSec={master?.duration_sec ?? 0}
      timeLimitSec={timedDurationSec(session.test_code) ?? 0}
      items={visibleItems}
      initialAnswers={initialAnswers}
    />
  );
}
