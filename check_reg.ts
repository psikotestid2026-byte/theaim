import { neon } from "@neondatabase/serverless";
import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

const sql = neon(process.env.DATABASE_URL_UNPOOLED!);

async function main() {
  const code = 'REG-20260704-0003';
  const res = await sql`
    SELECT r.registration_code, r.package_id, p.test_code, p.name 
    FROM registrations r 
    LEFT JOIN service_packages p ON r.package_id = p.id 
    WHERE r.registration_code = ${code};
  `;
  console.log(res);
}

main().catch(console.error);
