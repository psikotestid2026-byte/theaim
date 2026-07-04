import { sql } from "@/lib/db";
import type { PaymentLog } from "@/types/db";

export async function logPaymentEvent(input: {
  payment_id?: number;
  provider_reference?: string;
  endpoint?: string;
  log_type: "payment_request" | "callback" | "webhook";
  request_payload?: object;
  response_payload?: object;
  http_status?: number;
}) {
  const rows = await sql`
    INSERT INTO payment_logs
      (payment_id, provider_reference, endpoint, log_type, request_payload, response_payload, http_status)
    VALUES
      (${input.payment_id ?? null}, ${input.provider_reference ?? null}, ${input.endpoint ?? null},
       ${input.log_type}, ${JSON.stringify(input.request_payload ?? null)},
       ${JSON.stringify(input.response_payload ?? null)}, ${input.http_status ?? null})
    RETURNING *
  `;
  return rows[0];
}

export async function getPaymentLogs(paymentId?: number, limit = 50): Promise<PaymentLog[]> {
  if (paymentId) {
    const rows = await sql`
      SELECT * FROM payment_logs WHERE payment_id = ${paymentId}
      ORDER BY created_at DESC LIMIT ${limit}
    `;
    return rows as PaymentLog[];
  }
  const rows = await sql`
    SELECT * FROM payment_logs ORDER BY created_at DESC LIMIT ${limit}
  `;
  return rows as PaymentLog[];
}
