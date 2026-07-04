import { sql } from "@/lib/db";
import type { AdminUser } from "@/types/db";

export async function getAdminByEmail(email: string): Promise<AdminUser | null> {
  const rows = await sql`
    SELECT * FROM admin_users WHERE email = ${email} AND status = 'active' LIMIT 1
  `;
  return (rows[0] as AdminUser) ?? null;
}

export async function getAdminById(id: number): Promise<AdminUser | null> {
  const rows = await sql`SELECT * FROM admin_users WHERE id = ${id} LIMIT 1`;
  return (rows[0] as AdminUser) ?? null;
}

export async function getAllAdminUsers(): Promise<Omit<AdminUser, "password_hash">[]> {
  const rows = await sql`
    SELECT id, full_name, email, role, status, last_login_at, created_at, updated_at
    FROM admin_users ORDER BY created_at DESC
  `;
  return rows as Omit<AdminUser, "password_hash">[];
}

export async function updateAdminLastLogin(id: number) {
  await sql`
    UPDATE admin_users SET last_login_at = now(), updated_at = now() WHERE id = ${id}
  `;
}

export async function createAdminUser(input: {
  full_name: string;
  email: string;
  password_hash: string;
  role: AdminUser["role"];
}) {
  const rows = await sql`
    INSERT INTO admin_users (full_name, email, password_hash, role, status)
    VALUES (${input.full_name}, ${input.email}, ${input.password_hash}, ${input.role}, 'active')
    RETURNING id, full_name, email, role, status, created_at
  `;
  return rows[0];
}
