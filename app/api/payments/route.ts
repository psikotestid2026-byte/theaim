import { NextRequest, NextResponse } from "next/server";
import { createPayment, getNextPaymentSeq } from "@/lib/queries/payments";
import { getRegistrationByCode, getRegistrationById, updateRegistrationStatus } from "@/lib/queries/registrations";
import { getPaymentMethodById } from "@/lib/queries/payment-methods";
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

    const registration = await getRegistrationById(data.registration_id);
    const method = await getPaymentMethodById(data.payment_method_id);

    let amount = 0;
    if (registration?.price_quoted && method) {
      amount = Number(registration.price_quoted) + Number(method.admin_fee_flat);
    }

    const payment = await createPayment({
      registration_id: data.registration_id,
      payment_method_id: data.payment_method_id,
      payment_code: paymentCode,
      amount,
    });

    return NextResponse.json({ payment_code: paymentCode, id: payment.id }, { status: 201 });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.flatten().fieldErrors }, { status: 400 });
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
