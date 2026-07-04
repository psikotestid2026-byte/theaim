import { sql } from "@/lib/db";
import type { EcourseModule, EcourseEnrollment } from "@/types/db";

export async function getModulesByService(serviceId: number): Promise<EcourseModule[]> {
  const rows = await sql`
    SELECT * FROM ecourse_modules WHERE service_id = ${serviceId} ORDER BY day_number
  `;
  return rows as EcourseModule[];
}

export async function getAllModules(): Promise<EcourseModule[]> {
  const rows = await sql`SELECT * FROM ecourse_modules ORDER BY service_id, day_number`;
  return rows as EcourseModule[];
}

export async function getAllEnrollments(): Promise<EcourseEnrollment[]> {
  const rows = await sql`
    SELECT ee.*, c.full_name AS customer_name, s.name AS service_name
    FROM ecourse_enrollments ee
    JOIN customers c ON c.id = ee.customer_id
    JOIN services s ON s.id = ee.service_id
    ORDER BY ee.created_at DESC
  `;
  return rows as EcourseEnrollment[];
}
