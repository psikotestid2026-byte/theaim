"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";

const SERVICES_MENU = [
  {
    label: "Assessment",
    children: [
      { label: "Talents Mapping", href: "/layanan/talents-mapping" },
      { label: "Tes Psikologi (Psikotes)", href: "/layanan/tes-psikologi" },
      { label: "Mental Health Check Up", href: "/layanan/mental-health-checkup" },
    ],
  },
  {
    label: "Konsultasi & Coaching",
    children: [
      { label: "Konseling dengan Psikolog", href: "/layanan/konseling-psikolog" },
      { label: "Therapy (SEFT)", href: "/layanan/therapy-seft" },
      { label: "Visual Coaching", href: "/layanan/visual-coaching" },
      { label: "Konsultasi Keuangan", href: "/layanan/konsultasi-keuangan" },
    ],
  },
  {
    label: "Digital Product",
    children: [
      { label: "E-Course Life Reset: 7 Days", href: "/layanan/ecourse-life-reset" },
    ],
  },
  { label: "Webinar & Workshop", href: "/layanan/webinar-workshop" },
];

export default function Navigation() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [openGroup, setOpenGroup] = useState<string | null>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
      <nav
        className={`sticky top-0 z-50 w-full transition-all duration-300 ${
          scrolled ? "glass-nav shadow-sm" : "bg-white/98 glass-nav"
        }`}
      >
        <div className="max-w-[1400px] mx-auto px-4 lg:px-8 py-3 flex items-center justify-between gap-4">
          {/* Logo */}
          <Link href="/" className="flex items-center shrink-0">
            <Image
              src="/Logo2/Logo theaim.id.png"
              alt="TheAIM — PT Abadi Insan Manfaat"
              width={140}
              height={50}
              className="h-12 w-auto object-contain"
              priority
            />
          </Link>

          {/* Desktop Nav */}
          <div className="hidden lg:flex items-center gap-1 font-medium text-[14.5px] text-slate-600">
            <Link
              href="/"
              className="px-3.5 py-2 rounded-lg hover:bg-slate-100 hover:text-slate-900 transition-colors font-semibold"
            >
              Beranda
            </Link>

            {/* Layanan mega-dropdown */}
            <div
              className="relative group"
              onMouseEnter={() => setOpenGroup("layanan")}
              onMouseLeave={() => setOpenGroup(null)}
            >
              <button className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg hover:bg-slate-100 transition-colors focus:outline-none">
                Layanan
                <svg
                  className={`w-3 h-3 text-slate-400 transition-transform ${openGroup === "layanan" ? "rotate-180" : ""}`}
                  fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {openGroup === "layanan" && (
                <div className="absolute left-0 top-full pt-2 z-50">
                  <div className="w-64 bg-white rounded-xl shadow-[0_15px_40px_-10px_rgba(0,0,0,0.1)] border border-slate-100 py-2">
                    {SERVICES_MENU.map((group) =>
                      group.children ? (
                        <div key={group.label} className="relative group/sub">
                          <div className="px-5 py-2.5 text-sm text-slate-600 hover:bg-slate-50 hover:text-red-600 transition-colors flex justify-between items-center cursor-default">
                            {group.label}
                            <svg className="w-3 h-3 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                            </svg>
                          </div>
                          <div className="absolute left-full top-0 opacity-0 invisible group-hover/sub:opacity-100 group-hover/sub:visible transition-all">
                            <div className="w-64 bg-white rounded-xl shadow-lg border border-slate-100 py-2 ml-1">
                              {group.children.map((item) => (
                                <Link
                                  key={item.href}
                                  href={item.href}
                                  className="block px-5 py-2.5 text-sm text-slate-600 hover:bg-slate-50 hover:text-red-600 transition-colors"
                                >
                                  {item.label}
                                </Link>
                              ))}
                            </div>
                          </div>
                        </div>
                      ) : (
                        <Link
                          key={group.label}
                          href={group.href!}
                          className="block px-5 py-2.5 text-sm text-slate-600 hover:bg-slate-50 hover:text-red-600 transition-colors"
                        >
                          {group.label}
                        </Link>
                      )
                    )}
                  </div>
                </div>
              )}
            </div>

            <Link href="/perusahaan" className="px-3.5 py-2 rounded-lg hover:bg-slate-100 hover:text-slate-900 transition-colors">
              Untuk Perusahaan
            </Link>
            <Link href="/rate-card" className="px-3.5 py-2 rounded-lg hover:bg-slate-100 hover:text-slate-900 transition-colors">
              Rate Card
            </Link>
            <Link href="/artikel" className="px-3.5 py-2 rounded-lg hover:bg-slate-100 hover:text-slate-900 transition-colors">
              Artikel
            </Link>
            <Link href="/karir" className="px-3.5 py-2 rounded-lg hover:bg-slate-100 hover:text-slate-900 transition-colors">
              Karir
            </Link>

            {/* Tentang dropdown */}
            <div
              className="relative group"
              onMouseEnter={() => setOpenGroup("tentang")}
              onMouseLeave={() => setOpenGroup(null)}
            >
              <button className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg hover:bg-slate-100 transition-colors focus:outline-none">
                Tentang Kami
                <svg
                  className={`w-3 h-3 text-slate-400 transition-transform ${openGroup === "tentang" ? "rotate-180" : ""}`}
                  fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {openGroup === "tentang" && (
                <div className="absolute right-0 top-full pt-2 z-50">
                  <div className="w-52 bg-white rounded-xl shadow-lg border border-slate-100 py-2">
                    <Link href="/tentang" className="block px-5 py-2.5 text-sm text-slate-600 hover:bg-slate-50 hover:text-red-600 transition-colors">
                      Tentang TheAIM
                    </Link>
                    <Link href="/tentang/ecosystem" className="block px-5 py-2.5 text-sm text-slate-600 hover:bg-slate-50 hover:text-red-600 transition-colors">
                      TheAIM Ecosystem
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* CTA + Hamburger */}
          <div className="flex items-center gap-3">
            <a
              href="https://wa.me/6281999554599"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-corp hidden md:inline-flex px-6 py-2.5 rounded-full text-sm gap-2"
            >
              <svg className="w-4 h-4 text-green-400" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
                <path d="M12 0C5.373 0 0 5.373 0 12c0 2.137.567 4.143 1.548 5.879L0 24l6.319-1.524A11.93 11.93 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818a9.787 9.787 0 01-4.992-1.363l-.358-.213-3.712.895.928-3.605-.234-.37A9.776 9.776 0 012.182 12C2.182 6.578 6.578 2.182 12 2.182S21.818 6.578 21.818 12 17.422 21.818 12 21.818z"/>
              </svg>
              Hubungi CS
            </a>

            <button
              id="mobile-menu-btn"
              className="lg:hidden p-2 rounded-lg text-slate-700 hover:bg-slate-100 transition-colors"
              onClick={() => setMobileOpen((v) => !v)}
              aria-label="Toggle menu"
            >
              {mobileOpen ? (
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="lg:hidden fixed top-[64px] left-0 right-0 z-40 bg-white shadow-xl border-t border-slate-100 py-4 px-6 flex flex-col gap-1 font-medium text-[15px] max-h-[80vh] overflow-y-auto">
          <Link href="/" className="py-3 border-b border-slate-100 text-slate-800 font-bold" onClick={() => setMobileOpen(false)}>Beranda</Link>
          <p className="pt-3 pb-1 text-[10px] font-black text-slate-400 uppercase tracking-widest">Layanan</p>
          <Link href="/layanan/talents-mapping" className="py-2 pl-3 text-slate-600 hover:text-red-600" onClick={() => setMobileOpen(false)}>Talents Mapping</Link>
          <Link href="/layanan/mental-health-checkup" className="py-2 pl-3 text-slate-600 hover:text-red-600" onClick={() => setMobileOpen(false)}>Mental Health Check Up</Link>
          <Link href="/layanan/konseling-psikolog" className="py-2 pl-3 text-slate-600 hover:text-red-600" onClick={() => setMobileOpen(false)}>Konseling dengan Psikolog</Link>
          <Link href="/layanan/therapy-seft" className="py-2 pl-3 text-slate-600 hover:text-red-600" onClick={() => setMobileOpen(false)}>Therapy (SEFT)</Link>
          <Link href="/layanan/visual-coaching" className="py-2 pl-3 text-slate-600 hover:text-red-600" onClick={() => setMobileOpen(false)}>Visual Coaching</Link>
          <Link href="/layanan/konsultasi-keuangan" className="py-2 pl-3 text-slate-600 hover:text-red-600" onClick={() => setMobileOpen(false)}>Konsultasi Keuangan</Link>
          <Link href="/layanan/ecourse-life-reset" className="py-2 pl-3 text-slate-600 hover:text-red-600" onClick={() => setMobileOpen(false)}>E-Course Life Reset</Link>
          <Link href="/perusahaan" className="py-3 border-t border-slate-100 text-slate-700 hover:text-red-600" onClick={() => setMobileOpen(false)}>Untuk Perusahaan</Link>
          <Link href="/rate-card" className="py-2 text-slate-700 hover:text-red-600" onClick={() => setMobileOpen(false)}>Rate Card</Link>
          <Link href="/artikel" className="py-2 text-slate-700 hover:text-red-600" onClick={() => setMobileOpen(false)}>Artikel & Aktivitas</Link>
          <Link href="/karir" className="py-2 text-slate-700 hover:text-red-600" onClick={() => setMobileOpen(false)}>Karir</Link>
          <Link href="/tentang" className="py-2 text-slate-700 hover:text-red-600" onClick={() => setMobileOpen(false)}>Tentang TheAIM</Link>
          <a
            href="https://wa.me/6281999554599"
            target="_blank"
            rel="noopener noreferrer"
            className="mt-3 btn-primary px-6 py-3 rounded-full text-sm text-center gap-2"
            onClick={() => setMobileOpen(false)}
          >
            Hubungi CS / Admin
          </a>
        </div>
      )}
    </>
  );
}
