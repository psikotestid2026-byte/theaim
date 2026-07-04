import { NextRequest, NextResponse } from "next/server";
import { getRegistrationByCode, updateRegistrationStatus } from "@/lib/queries/registrations";
import { createTestSession } from "@/lib/queries/test-sessions";
import { getPackageById } from "@/lib/queries/service-packages";
import { randomUUID } from "crypto";
import { z } from "zod";

const schema = z.object({ registration_code: z.string() });

// POST /api/payments/simulate-paid
// Dev/demo: marks registration as paid and creates a test session
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { registration_code } = schema.parse(body);

    const registration = await getRegistrationByCode(registration_code);
    if (!registration) {
      return NextResponse.json({ error: "Registration not found" }, { status: 404 });
    }

    // Mark as paid
    await updateRegistrationStatus(registration.id, "paid");

    // Create test session if package has a test_code
    let testLink: string | null = null;
    if (registration.package_id) {
      const pkg = await getPackageById(registration.package_id);
      if (pkg?.test_code) {
        const accessToken = randomUUID();
        const resultToken = randomUUID();
        const expiresAt = new Date(Date.now() + 72 * 3600 * 1000); // 72h

        await createTestSession({
          registration_id: registration.id,
          customer_id: registration.customer_id,
          package_id: registration.package_id,
          test_code: pkg.test_code,
          access_token: accessToken,
          result_token: resultToken,
          expires_at: expiresAt,
        });
        testLink = `/tes/${accessToken}`;
      }
    }

    return NextResponse.json({ success: true, test_link: testLink });
  } catch (err) {
    if (err instanceof z.ZodError) return NextResponse.json({ error: err.errors }, { status: 400 });
    console.error("simulate-paid error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
