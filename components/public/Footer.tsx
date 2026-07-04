import Link from "next/link";
import Image from "next/image";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-[#0f172a] pt-16 border-t border-slate-800 text-slate-400">
      <div className="max-w-[1200px] mx-auto px-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
        {/* Col 1: Brand */}
        <div className="pr-4">
          <Link href="/" className="flex items-center mb-8">
            <div className="bg-white rounded-2xl px-4 py-2 inline-flex items-center shadow-sm">
              <Image
                src="/Logo2/Logo theaim.id.png"
                alt="TheAIM Logo"
                width={120}
                height={44}
                className="h-10 w-auto object-contain"
              />
            </div>
          </Link>
          <p className="text-sm leading-relaxed mb-6">
            Mitra strategis Anda dalam pemetaan potensi diri, konsultasi profesional, dan pemeliharaan kesehatan mental terpadu.
          </p>
          <div className="flex gap-3">
            <a
              href="https://wa.me/6281999554599"
              target="_blank"
              rel="noopener noreferrer"
              className="w-9 h-9 rounded-xl bg-slate-800 hover:bg-green-600 text-slate-400 hover:text-white flex items-center justify-center transition-all"
              aria-label="WhatsApp"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
                <path d="M12 0C5.373 0 0 5.373 0 12c0 2.137.567 4.143 1.548 5.879L0 24l6.319-1.524A11.93 11.93 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818a9.787 9.787 0 01-4.992-1.363l-.358-.213-3.712.895.928-3.605-.234-.37A9.776 9.776 0 012.182 12C2.182 6.578 6.578 2.182 12 2.182S21.818 6.578 21.818 12 17.422 21.818 12 21.818z" />
              </svg>
            </a>
            <a
              href="https://instagram.com/theaim.id"
              target="_blank"
              rel="noopener noreferrer"
              className="w-9 h-9 rounded-xl bg-slate-800 hover:bg-pink-600 text-slate-400 hover:text-white flex items-center justify-center transition-all"
              aria-label="Instagram"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
              </svg>
            </a>
          </div>
        </div>

        {/* Col 2: Layanan Utama */}
        <div>
          <h4 className="font-extrabold text-white text-base mb-6 tracking-tight">Layanan Utama</h4>
          <ul className="space-y-3 font-medium text-sm border-l-2 border-slate-700 pl-4">
            <li><Link href="/layanan/talents-mapping" className="hover:text-red-400 transition-colors">Asesmen & Talents Mapping</Link></li>
            <li><Link href="/layanan/konseling-psikolog" className="hover:text-red-400 transition-colors">Konseling Psikolog & Terapi</Link></li>
            <li><Link href="/layanan/visual-coaching" className="hover:text-red-400 transition-colors">Visual Coaching & Finansial</Link></li>
            <li><Link href="/layanan/ecourse-life-reset" className="hover:text-red-400 transition-colors">Webinar & E-Course Reset</Link></li>
            <li><Link href="/rate-card" className="hover:text-red-400 transition-colors">Lihat Rate Card Lengkap</Link></li>
          </ul>
        </div>

        {/* Col 3: Untuk Perusahaan */}
        <div>
          <h4 className="font-extrabold text-white text-base mb-6 tracking-tight">Untuk Perusahaan</h4>
          <ul className="space-y-3 font-medium text-sm border-l-2 border-slate-700 pl-4">
            <li><Link href="/perusahaan" className="hover:text-red-400 transition-colors">Hiring & Asesmen Rekrutmen</Link></li>
            <li><Link href="/perusahaan" className="hover:text-red-400 transition-colors">Employee Assistance Program</Link></li>
            <li><Link href="/perusahaan" className="hover:text-red-400 transition-colors">In-House Training & Outbound</Link></li>
            <li><Link href="/perusahaan" className="hover:text-red-400 transition-colors">HR Consulting & HRIS</Link></li>
            <li><Link href="/kerjasama" className="hover:text-red-400 transition-colors">Pengajuan Kerjasama</Link></li>
          </ul>
        </div>

        {/* Col 4: Informasi */}
        <div>
          <h4 className="font-extrabold text-white text-base mb-6 tracking-tight">Informasi</h4>
          <ul className="space-y-3 font-medium text-sm border-l-2 border-slate-700 pl-4">
            <li><Link href="/tentang" className="hover:text-red-400 transition-colors">Tentang TheAIM</Link></li>
            <li><Link href="/tentang/ecosystem" className="hover:text-red-400 transition-colors">TheAIM Ecosystem</Link></li>
            <li><Link href="/artikel" className="hover:text-red-400 transition-colors">Artikel & Aktivitas</Link></li>
            <li><Link href="/karir" className="hover:text-red-400 transition-colors">Karir di TheAIM</Link></li>
            <li><Link href="/unduh-proposal" className="hover:text-red-400 transition-colors">Unduh Company Profile</Link></li>
          </ul>

          <div className="mt-8 p-4 rounded-2xl bg-slate-800/60 border border-slate-700">
            <p className="text-xs font-semibold text-slate-300 mb-1">Hubungi CS / Admin</p>
            <a
              href="https://wa.me/6281999554599"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm font-bold text-white hover:text-green-400 transition-colors flex items-center gap-2"
            >
              <span>+62 819-9955-4599</span>
            </a>
            <p className="text-[11px] text-slate-500 mt-1">Senin – Sabtu, 08.00–17.00 WIB</p>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-slate-800 py-6">
        <div className="max-w-[1200px] mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-3">
          <p className="text-xs text-slate-500">
            © {currentYear} PT Abadi Insan Manfaat (TheAIM). Seluruh hak cipta dilindungi.
          </p>
          <div className="flex gap-6 text-xs text-slate-500">
            <span className="text-slate-600">100% Private & Confidential</span>
            <span>·</span>
            <span>Bandung, Indonesia</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
