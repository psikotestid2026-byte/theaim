import { NextRequest, NextResponse } from "next/server";
import { createRegistration, getNextRegistrationSeq } from "@/lib/queries/registrations";
import { findOrCreateCustomer } from "@/lib/queries/customers";
import { updateRegistrationStatus } from "@/lib/queries/registrations";
import { generateRegistrationCode } from "@/lib/utils";
import { getPackageById } from "@/lib/queries/service-packages";
import { z } from "zod";

const schema = z.object({
  service_id: z.coerce.number().int().positive(),
  package_id: z.coerce.number().int().positive().optional(),
  full_name: z.string().min(2),
  whatsapp_number: z.string().min(8),
  notes: z.string().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const data = schema.parse(body);

    const customer = await findOrCreateCustomer({
      full_name: data.full_name,
      whatsapp_number: data.whatsapp_number,
    });

    const seq = await getNextRegistrationSeq();
    const code = generateRegistrationCode(seq);

    let priceQuoted = null;
    if (data.package_id) {
      const pkg = await getPackageById(data.package_id);
      if (pkg && pkg.price_amount) {
        priceQuoted = pkg.price_amount;
      }
    }

    const registration = await createRegistration({
      registration_code: code,
      customer_id: customer.id,
      service_id: data.service_id,
      package_id: data.package_id,
      full_name: data.full_name,
      whatsapp_number: data.whatsapp_number,
      notes: data.notes,
      price_quoted: priceQuoted,
    });

    // Auto-advance to payment_pending status
    await updateRegistrationStatus(registration.id, "payment_pending");

    return NextResponse.json({ registration_code: code, id: registration.id }, { status: 201 });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.flatten().fieldErrors }, { status: 400 });
    }
    console.error("POST /api/registrations error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function GET() {
  // Admin only — list registrations (no token exposure)
  const { getAllRegistrations, countRegistrations } = await import("@/lib/queries/registrations");
  try {
    const [rows, total] = await Promise.all([getAllRegistrations(), countRegistrations()]);
    return NextResponse.json({ data: rows, total });
  } catch (err) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
