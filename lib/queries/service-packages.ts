import { sql } from "@/lib/db";
import type { ServicePackage } from "@/types/db";

export async function getPackagesByServiceId(serviceId: number): Promise<ServicePackage[]> {
  const rows = await sql`
    SELECT sp.*, s.name AS service_name
    FROM service_packages sp
    JOIN services s ON s.id = sp.service_id
    WHERE sp.service_id = ${serviceId} AND sp.status = 'active'
    ORDER BY sp.is_popular DESC, sp.price_amount ASC NULLS LAST
  `;
  return rows as ServicePackage[];
}

export async function getAllPackages(): Promise<ServicePackage[]> {
  const rows = await sql`
    SELECT sp.*, s.name AS service_name
    FROM service_packages sp
    JOIN services s ON s.id = sp.service_id
    ORDER BY s.name, sp.name
  `;
  return rows as ServicePackage[];
}

export async function getPsychometricPackages(): Promise<ServicePackage[]> {
  const rows = await sql`
    SELECT sp.*, s.name AS service_name
    FROM service_packages sp
    JOIN services s ON s.id = sp.service_id
    WHERE sp.test_code IS NOT NULL AND sp.status = 'active'
    ORDER BY sp.name ASC
  `;
  return rows as ServicePackage[];
}

export async function getPackageById(id: number): Promise<ServicePackage | null> {
  const rows = await sql`
    SELECT sp.*, s.name AS service_name
    FROM service_packages sp
    JOIN services s ON s.id = sp.service_id
    WHERE sp.id = ${id}
    LIMIT 1
  `;
  return (rows[0] as ServicePackage) ?? null;
}

export async function createServicePackage(input: {
  service_id: number;
  test_code?: string;
  name: string;
  price_type: string;
  price_amount?: number;
  price_min?: number;
  price_max?: number;
  price_unit?: string;
  features?: string[];
  is_popular?: boolean;
}) {
  const rows = await sql`
    INSERT INTO service_packages
      (service_id, test_code, name, price_type, price_amount, price_min, price_max, price_unit, features, is_popular)
    VALUES
      (${input.service_id}, ${input.test_code ?? null}, ${input.name}, ${input.price_type},
       ${input.price_amount ?? null}, ${input.price_min ?? null}, ${input.price_max ?? null},
       ${input.price_unit ?? "per_session"}, ${JSON.stringify(input.features ?? [])}, ${input.is_popular ?? false})
    RETURNING *
  `;
  return rows[0];
}
