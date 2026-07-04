import { NextRequest, NextResponse } from "next/server";
import { createPayment, getNextPaymentSeq } from "@/lib/queries/payments";
import { getRegistrationByCode, updateRegistrationStatus } from "@/lib/queries/registrations";
import { generatePaymentCode } from "@/lib/utils";
import { z } from "zod";

const schema = z.object({
  registration_id: z.number().int().positive(),
  payment_method_id: z.number().int().positive(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const data = schema.parse(body);

    const seq = await getNextPaymentSeq();
    const paymentCode = generatePaymentCode(seq);

    const payment = await createPayment({
      registration_id: data.registration_id,
      payment_method_id: data.payment_method_id,
      payment_code: paymentCode,
      amount: 0, // Will be updated by admin after price confirmation
    });

    return NextResponse.json({ payment_code: paymentCode, id: payment.id }, { status: 201 });
  } catch (err) {
    if (err instanceof z.ZodError) {
      const zodErr = err as z.ZodError<any>;
      return NextResponse.json({ error: zodErr.errors }, { status: 400 });
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
