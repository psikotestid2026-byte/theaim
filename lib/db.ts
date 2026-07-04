import { neon } from "@neondatabase/serverless";

// Raw SQL client — runtime only. Never import this directly in app/ or route handlers.
// Only lib/queries/*.ts files may import this.
export const sql = neon(process.env.DATABASE_URL!);
