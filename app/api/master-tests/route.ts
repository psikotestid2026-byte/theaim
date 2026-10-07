import { NextResponse } from "next/server";
import { listMasterTests } from "@/lib/queries/master-tests";

export async function GET() {
  try {
    const tests = await listMasterTests();
    return NextResponse.json({ tests });
  } catch (err) {
    console.error("list master tests error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
