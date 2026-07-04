import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getRegistrationByCode } from "@/lib/queries/registrations";
import { getActivePaymentMethods } from "@/lib/queries/payment-methods";
import { getInstructionsByMethod } from "@/lib/queries/payment-instructions";
import type { PaymentInstruction } from "@/types/db";
import PaymentFlow from "@/components/public/PaymentFlow";

export const metadata: Metadata = {
  title: "Pembayaran Pendaftaran",
  description: "Selesaikan pembayaran untuk mengamankan jadwal layanan TheAIM Anda.",
};

export default async function PaymentPage({ params }: { params: Promise<{ registrationCode: string }> }) {
  const { registrationCode } = await params;
  const registration = await getRegistrationByCode(registrationCode).catch(() => null);
  if (!registration) notFound();

  const methods = await getActivePaymentMethods().catch(() => []);

  const instructionsByMethod: Record<number, PaymentInstruction[]> = {};
  await Promise.all(
    methods.map(async (m) => {
      instructionsByMethod[m.id] = await getInstructionsByMethod(m.id).catch(() => []);
    })
  );

  return (
    <section className="py-20 px-4 bg-slate-50 min-h-[80vh] flex items-center justify-center">
      <div className="max-w-[500px] w-full bg-white rounded-3xl p-8 md:p-12 shadow-xl border border-slate-100">
        <PaymentFlow
          registration={registration}
          methods={methods}
          instructionsByMethod={instructionsByMethod}
        />
      </div>
    </section>
  );
}
