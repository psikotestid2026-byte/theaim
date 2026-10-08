import { NextRequest, NextResponse } from "next/server";
import { assetTokenCanRead, getTestAsset } from "@/lib/queries/test-assets";
import { safeAssetPath, safeImageContentType } from "@/lib/test-assets";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

function notFound(): NextResponse {
  return new NextResponse(null, { status: 404 });
}

/** GET /api/test-assets/tests/ist/fa/FA_117.png?t=<access-or-result-token> */
export async function GET(req: NextRequest, ctx: { params: Promise<{ path: string[] }> }) {
  const { path: segments } = await ctx.params;
  const token = req.nextUrl.searchParams.get("t") ?? "";
  const assetPath = safeAssetPath((segments ?? []).join("/"));
  if (!assetPath || !(await assetTokenCanRead(token))) return notFound();

  const asset = await getTestAsset(assetPath).catch(() => null);
  const contentType = asset ? safeImageContentType(asset.content_type) : null;
  if (!asset || !contentType) return notFound();

  return new NextResponse(new Uint8Array(asset.data), {
    status: 200,
    headers: {
      "Content-Type": contentType,
      "Content-Length": String(asset.data.length),
      "Cache-Control": "private, max-age=3600",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
