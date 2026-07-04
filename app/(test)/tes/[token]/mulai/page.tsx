import { notFound, redirect } from "next/navigation";
import { getSessionByAccessToken } from "@/lib/queries/test-sessions";
import { getItemsByTestCode } from "@/lib/queries/test-items";
import TestEngine from "@/components/test/TestEngine";

export default async function TestStartPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const session = await getSessionByAccessToken(token).catch(() => null);

  if (!session) return notFound();
  if (session.status === "completed") redirect(`/hasil/${session.result_token}`);
  if (!["in_progress"].includes(session.status)) redirect(`/tes/${token}`);

  const items = await getItemsByTestCode(session.test_code);
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

  return (
    <TestEngine
      sessionId={session.id}
      token={token}
      testCode={session.test_code}
      items={items}
      resultToken={session.result_token}
    />
  );
}
