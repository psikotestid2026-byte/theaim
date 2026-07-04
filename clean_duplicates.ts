import { neon } from "@neondatabase/serverless";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const sql = neon(process.env.DATABASE_URL_UNPOOLED!);

async function main() {
  console.log("Cleaning duplicate packages...");
  // Delete all but the lowest ID for each service_id
  await sql`
    DELETE FROM service_packages 
    WHERE id NOT IN (
      SELECT MIN(id) 
      FROM service_packages 
      GROUP BY service_id, name
    )
  `;
  console.log("Cleaned service_packages");

  // Also clean articles duplicates if any
  await sql`
    DELETE FROM articles
    WHERE id NOT IN (
      SELECT MIN(id)
      FROM articles
      GROUP BY slug
    )
  `;
  console.log("Cleaned articles");

  // Also clean job_postings duplicates if any
  await sql`
    DELETE FROM job_postings
    WHERE id NOT IN (
      SELECT MIN(id)
      FROM job_postings
      GROUP BY slug
    )
  `;
  console.log("Cleaned job_postings");

  console.log("Done!");
}

main().catch(console.error);
