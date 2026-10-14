type SiteEnv = {
  NEXT_PUBLIC_SITE_URL?: string;
  VERCEL_BRANCH_URL?: string;
  VERCEL_URL?: string;
  VERCEL_ENV?: string;
};

export type SiteOriginInput = {
  forwardedHost?: string | null;
  host?: string | null;
  forwardedProto?: string | null;
  env?: SiteEnv;
};

const PRODUCTION_ORIGIN = "https://theaim.id";

function firstValue(value: string | null | undefined): string {
  return (value ?? "").split(",")[0]?.trim() ?? "";
}

function cleanHost(value: string | null | undefined): string | null {
  const host = firstValue(value).toLowerCase();
  if (!/^[a-z0-9.-]+(?::\d+)?$/.test(host)) return null;
  return host;
}

function originFromHost(host: string, proto: string | null | undefined): string {
  const forwarded = firstValue(proto).toLowerCase();
  const scheme =
    forwarded === "http" || forwarded === "https"
      ? forwarded
      : host.startsWith("localhost") || host.startsWith("127.0.0.1")
        ? "http"
        : "https";
  return `${scheme}://${host}`;
}

function configuredUrl(value: string | undefined): string | null {
  const raw = value?.trim();
  if (!raw) return null;
  const withScheme = /^https?:\/\//i.test(raw) ? raw : `https://${raw}`;
  try {
    const url = new URL(withScheme);
    return url.origin;
  } catch {
    return null;
  }
}

/**
 * Origin for test and result links.
 * A request host wins, so a preview page never stamps the production domain onto its QR.
 * Without a request: NEXT_PUBLIC_SITE_URL, then the Vercel branch or deployment host.
 * https://theaim.id is used only when this process is the production deployment.
 */
export function siteOrigin(input: SiteOriginInput = {}): string {
  const host = cleanHost(input.forwardedHost) ?? cleanHost(input.host);
  if (host) return originFromHost(host, input.forwardedProto);

  const env = input.env ?? process.env;
  const configured =
    configuredUrl(env.NEXT_PUBLIC_SITE_URL) ??
    configuredUrl(env.VERCEL_BRANCH_URL) ??
    configuredUrl(env.VERCEL_URL);
  if (configured) return configured;

  if (env.VERCEL_ENV === "production") return PRODUCTION_ORIGIN;
  return "http://localhost:3000";
}

export function resultPageUrl(resultToken: string, origin: string): string {
  return `${origin}/hasil/${resultToken}`;
}

export function testPageUrl(accessToken: string, origin: string): string {
  return `${origin}/tes/${accessToken}`;
}

export function appendResultLink(summary: string, url: string): string {
  if (summary.includes(url)) return summary;
  return `${summary}\n\nHasil lengkap: ${url}`;
}
