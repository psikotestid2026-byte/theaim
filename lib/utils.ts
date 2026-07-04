import { type ClassValue, clsx } from "clsx";

export function cn(...inputs: ClassValue[]) {
  return inputs.filter(Boolean).join(" ");
}

/** Generate human-readable registration code e.g. REG-20260704-0001 */
export function generateRegistrationCode(seq: number): string {
  const date = new Date().toISOString().slice(0, 10).replace(/-/g, "");
  return `REG-${date}-${String(seq).padStart(4, "0")}`;
}

/** Generate human-readable payment code e.g. PAY-20260704-0001 */
export function generatePaymentCode(seq: number): string {
  const date = new Date().toISOString().slice(0, 10).replace(/-/g, "");
  return `PAY-${date}-${String(seq).padStart(4, "0")}`;
}

/** Mask a WA number: 081234567802 → 0812••••7802 */
export function maskWhatsApp(wa: string): string {
  if (wa.length <= 8) return wa;
  const first4 = wa.slice(0, 4);
  const last4 = wa.slice(-4);
  return `${first4}••••${last4}`;
}

/** Format price in IDR */
export function formatIDR(amount: number | string | null | undefined): string {
  if (amount === null || amount === undefined) return "–";
  const n = typeof amount === "string" ? parseFloat(amount) : amount;
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(n);
}

/** Format date in Indonesian locale */
export function formatDate(date: string | Date | null): string {
  if (!date) return "–";
  return new Date(date).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

/** Slugify a string */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();
}

/** Get initials from full name */
export function getInitials(name: string): string {
  return name
    .split(" ")
    .slice(0, 2)
    .map((n) => n[0])
    .join("")
    .toUpperCase();
}
