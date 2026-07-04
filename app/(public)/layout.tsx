import type { Metadata } from "next";
import Navigation from "@/components/public/Navigation";
import Footer from "@/components/public/Footer";

export const metadata: Metadata = {
  metadataBase: new URL("https://theaim.id"),
  title: {
    default: "TheAIM — PT Abadi Insan Manfaat | Psikologi, Coaching & HR",
    template: "%s | TheAIM",
  },
  description:
    "Satu ekosistem terintegrasi untuk pertumbuhan diri dan efektivitas organisasi. Layanan pemetaan potensi bakat, konseling psikolog, coaching, terapi, konsultasi keuangan, dan solusi HR korporat.",
  keywords: ["psikologi", "talents mapping", "konseling", "coaching", "MBTI", "DISC", "Bandung", "TheAIM"],
  openGraph: {
    type: "website",
    locale: "id_ID",
    url: "https://theaim.id",
    siteName: "TheAIM",
    images: [{ url: "/Logo2/Logo theaim.id.png", width: 400, height: 200 }],
  },
};

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Navigation />
      <main className="flex-1">{children}</main>
      <Footer />
    </>
  );
}
