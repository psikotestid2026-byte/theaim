// Xendit SDK wrapper — checkout creation + webhook verification
// Install: xendit-node
// TRD §9: All gateway requests/responses are logged to payment_logs

const XENDIT_BASE_URL = "https://api.xendit.co";
const XENDIT_SECRET_KEY = process.env.XENDIT_SECRET_KEY!;
const XENDIT_WEBHOOK_TOKEN = process.env.XENDIT_WEBHOOK_VERIFICATION_TOKEN!;

function xenditAuthHeader() {
  return `Basic ${Buffer.from(XENDIT_SECRET_KEY + ":").toString("base64")}`;
}

export interface CreateInvoiceInput {
  externalId: string;
  amount: number;
  payerEmail?: string;
  description?: string;
  paymentMethods?: string[];
  successRedirectUrl?: string;
  failureRedirectUrl?: string;
}

export interface XenditInvoice {
  id: string;
  external_id: string;
  invoice_url: string;
  status: string;
  amount: number;
  expiry_date: string;
}

/** Create a Xendit invoice (payment link) */
export async function createXenditInvoice(
  input: CreateInvoiceInput
): Promise<XenditInvoice> {
  const res = await fetch(`${XENDIT_BASE_URL}/v2/invoices`, {
    method: "POST",
    headers: {
      Authorization: xenditAuthHeader(),
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      external_id: input.externalId,
      amount: input.amount,
      payer_email: input.payerEmail,
      description: input.description,
      payment_methods: input.paymentMethods,
      success_redirect_url: input.successRedirectUrl,
      failure_redirect_url: input.failureRedirectUrl,
      currency: "IDR",
    }),
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(`Xendit createInvoice failed: ${JSON.stringify(err)}`);
  }

  return res.json();
}

/** Verify Xendit webhook signature */
export function verifyXenditWebhook(
  callbackToken: string
): boolean {
  return callbackToken === XENDIT_WEBHOOK_TOKEN;
}

/** Get payment status from Xendit */
export async function getXenditInvoice(invoiceId: string): Promise<XenditInvoice> {
  const res = await fetch(`${XENDIT_BASE_URL}/v2/invoices/${invoiceId}`, {
    headers: { Authorization: xenditAuthHeader() },
  });
  if (!res.ok) throw new Error(`Xendit getInvoice failed for ${invoiceId}`);
  return res.json();
}
