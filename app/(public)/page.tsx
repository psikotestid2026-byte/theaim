import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { getPublishedTestimonials } from "@/lib/queries/testimonials";
import { getActivePartners } from "@/lib/queries/corporate-partners";
import { getFeaturedServices } from "@/lib/queries/services";

export const metadata: Metadata = {
  title: "Kembangkan Potensi Diri, Maksimalkan Kinerja Organisasi",
  description: "Satu ekosistem terintegrasi untuk pertumbuhan diri dan efektivitas organisasi. Layanan pemetaan potensi bakat, konseling psikolog, coaching, terapi, dan solusi HR korporat.",
};

export const revalidate = 300;

const SERVICES_CARDS = [
  { icon: "📋", color: "bg-red-50 text-red-600 border-red-100", title: "Tes Psikologi", desc: "Asesmen kepribadian, gaya kerja, kecerdasan (IQ), dan minat penjurusan karir secara tepercaya & ilmiah. Tersedia Online & Offline.", href: "/layanan/mental-health-checkup" },
  { icon: "🧠", color: "bg-orange-50 text-orange-600 border-orange-100", title: "Talents Mapping", desc: "Temukan pola bakat alami bawaan Anda untuk karir, penyesuaian studi siswa, hingga perencanaan masa depan yang presisi.", href: "/layanan/talents-mapping" },
  { icon: "👨‍⚕️", color: "bg-blue-50 text-blue-600 border-blue-100", title: "Konseling Psikolog", desc: "Sesi privat aman & rahasia bersama Psikolog Klinis berlisensi untuk atasi hambatan emosi, kecemasan, dan burnout.", href: "/layanan/konseling-psikolog" },
  { icon: "💓", color: "bg-teal-50 text-teal-600 border-teal-100", title: "Therapy (SEFT)", desc: "Terapi relaksasi emosional terpandu untuk melepaskan stres fisik, fobia, kecanduan, dan trauma masa lalu secara efektif.", href: "/layanan/therapy-seft" },
  { icon: "🧭", color: "bg-green-50 text-green-600 border-green-100", title: "Visual Coaching", desc: "Petakan visi kehidupan masa depan, tetapkan prioritas, dan rancang peta aksi terstruktur menggunakan media visual interaktif.", href: "/layanan/visual-coaching" },
  { icon: "💰", color: "bg-purple-50 text-purple-600 border-purple-100", title: "Konsultasi Keuangan", desc: "Rancang perencanaan keuangan pribadi (financial planning) yang sehat untuk mewujudkan kebebasan finansial jangka panjang.", href: "/layanan/konsultasi-keuangan" },
  { icon: "💻", color: "bg-yellow-50 text-yellow-600 border-yellow-100", title: "Digital E-Course", desc: 'Belajar secara mandiri melalui modul terstruktur e-course eksklusif "Life Reset: 7 Days Re-Discover Yourself".', href: "/layanan/ecourse-life-reset" },
  { icon: "🎥", color: "bg-pink-50 text-pink-600 border-pink-100", title: "Webinar & Event", desc: "Ikuti kelas interaktif, seminar, dan webinar online mengenai pengembangan potensi diri dan pemeliharaan kesehatan mental.", href: "/layanan/webinar-workshop" },
];

const STEPS = [
  { num: "1", color: "bg-red-600 text-white", title: "Pilih Layanan & Topik", desc: "Temukan asesmen, konsultasi, atau program belajar terpandu yang paling sesuai dengan tantangan hidup atau karir Anda." },
  { num: "2", color: "bg-yellow-400 text-slate-900", title: "Registrasi Awal", desc: "Lengkapi formulir pendaftaran singkat dengan biodata valid agar konsultan/admin kami dapat memahami profil dasar Anda." },
  { num: "3", color: "bg-red-600 text-white", title: "Konfirmasi Jadwal", desc: "Admin kami akan menghubungi Anda via WhatsApp untuk menyepakati tanggal dan waktu pelaksanaan sesi terdekat." },
  { num: "4", color: "bg-yellow-400 text-slate-900", title: "Asesmen / Pengisian", desc: "Lakukan tes online (Psikotes/Talents Mapping) atau pengisian data awal secara digital sesuai instruksi yang diberikan." },
  { num: "5", color: "bg-red-600 text-white", title: "Review & Konsultasi", desc: "Bertemu langsung atau tatap maya dengan Psikolog, Coach, atau Terapis untuk membahas laporan hasil secara komprehensif." },
];

const LOGO_ROW1 = ["LOGO kgs.png","Logo GF.png","Logo KI.png","Logo MPR.webp","Logo TIG.jpeg","Logo disbudpar.png","Logo tle.jpeg","Logo ybm.png","logo JJ.jpeg","logo MAI.png","logo Mulia University .png","logo TM.png","logo adaide.jpg","logo bertumbuh .png","logo bpm.png","logo bsk.jpeg","logo dhs.jpg"];
const LOGO_ROW2 = ["logo dyummy.webp","logo funtrip.jpg","logo kmc.jpeg","logo kopi.png","logo lokadesa.png","logo nikahmudah.jpeg","logo qordova.png","logo rn.png","logo rwi.png","logo rz.jpeg","logo sajiwa.jpeg","logo smk it ba.png","logo syamil.jpg","logo telkomsel.webp","logo tokped.png","tokoparts logo.jpeg"];

function getInitials(name: string) {
  return name.split(" ").slice(0,2).map(n=>n[0]).join("").toUpperCase();
}

export default async function HomePage() {
  const [testimonials, partners] = await Promise.all([
    getPublishedTestimonials().catch(() => []),
    getActivePartners().catch(() => []),
  ]);

  const avatarColors = ["bg-red-50 text-red-600","bg-blue-50 text-blue-600","bg-teal-50 text-teal-600","bg-purple-50 text-purple-600","bg-orange-50 text-orange-600"];

  return (
    <>
      {/* HERO */}
      <section className="relative pt-20 pb-24 lg:pt-32 lg:pb-32 px-4 overflow-hidden bg-white">
        <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-red-50/50 to-transparent pointer-events-none rounded-bl-full" />
        <div className="max-w-[1300px] mx-auto grid lg:grid-cols-12 gap-12 lg:gap-8 items-center relative z-10">
          <div className="lg:col-span-7 text-center lg:text-left flex flex-col pt-8 lg:pt-0">
            <div className="inline-flex items-center justify-center lg:justify-start gap-2 text-sm font-bold w-fit mx-auto lg:mx-0 mb-6 uppercase tracking-widest text-slate-500">
              <span className="w-8 h-[2px] bg-red-600 rounded-full" />
              PT Abadi Insan Manfaat
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-black leading-[1.12] text-slate-900 mb-6 tracking-tight gradient-text">
              Kembangkan Potensi Diri, <br />
              Maksimalkan Kinerja <br />
              Organisasi.
            </h1>
            <p className="text-base md:text-lg text-slate-500 leading-relaxed mb-10 max-w-2xl mx-auto lg:mx-0 font-medium">
              Satu ekosistem terintegrasi untuk pertumbuhan diri dan efektivitas organisasi. Dapatkan layanan{" "}
              <span className="text-slate-900 font-bold">pemetaan potensi bakat</span>, bimbingan psikolog & coach profesional, hingga{" "}
              <span className="text-slate-900 font-bold">solusi kesehatan mental korporat</span> di satu tempat.
            </p>
            <div className="flex flex-col sm:flex-row justify-center lg:justify-start gap-4">
              <a href="#layanan-individu" className="btn-primary px-8 py-4 rounded-full text-[15px] shadow-lg shadow-red-200">
                Layanan Individu &amp; B2C
              </a>
              <Link href="/perusahaan" className="btn-corp px-8 py-4 rounded-full text-[15px] gap-2">
                Solusi Perusahaan &amp; B2B <span aria-hidden>→</span>
              </Link>
            </div>
          </div>
          <div className="lg:col-span-5 flex justify-center relative px-4 lg:px-0">
            <div className="relative w-full max-w-[420px] aspect-[4/5] flex items-end justify-center">
              <div className="absolute w-[90%] h-[85%] bottom-0 bg-slate-900 rounded-[3rem] z-10 overflow-hidden shadow-2xl border-4 border-white/10">
                <Image src="/Foto2/RI.jpg" alt="TheAIM Training Session" fill className="object-cover object-center" />
              </div>
              <div className="absolute w-full h-[90%] bottom-4 border-2 border-dashed border-yellow-400 rounded-[3.5rem] opacity-60 animate-spin" style={{animationDuration:"20s"}} />
              <div className="absolute top-[18%] -left-8 lg:-left-12 bg-white/95 backdrop-blur-md px-5 py-3.5 rounded-2xl z-20 flex items-center gap-3.5 shadow-xl border border-slate-100">
                <div className="w-10 h-10 rounded-xl bg-yellow-50 text-yellow-500 flex items-center justify-center text-lg shrink-0">🏆</div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-1">Pengalaman</p>
                  <p className="font-black text-slate-900 text-lg leading-none">10+ Tahun</p>
                </div>
              </div>
              <div className="absolute bottom-[10%] -right-8 lg:-right-12 bg-white/95 backdrop-blur-md px-5 py-3.5 rounded-2xl z-20 flex items-center gap-3.5 shadow-xl border border-slate-100">
                <div className="w-10 h-10 rounded-xl bg-yellow-50 text-yellow-500 flex items-center justify-center text-lg shrink-0">👥</div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-1">Klien Terbantu</p>
                  <p className="font-black text-slate-900 text-lg leading-none">5.000+</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* PARTNER LOGOS MARQUEE */}
      <section className="py-12 bg-white border-y border-slate-100">
        <div className="max-w-[1400px] mx-auto text-center px-4 mb-8">
          <p className="text-xs font-bold uppercase tracking-widest text-slate-400">Dipercaya oleh berbagai institusi &amp; perusahaan inovatif</p>
        </div>
        <div className="marquee-wrapper py-4 flex flex-col gap-4">
          <div className="marquee-track">
            {[...LOGO_ROW1,...LOGO_ROW1].map((logo,i) => (
              <div key={i} className="logo-pill">
                <img src={`/Logo2/${encodeURIComponent(logo)}`} alt={logo.split(".")[0]} loading="lazy" />
              </div>
            ))}
          </div>
          <div className="marquee-track reverse">
            {[...LOGO_ROW2,...LOGO_ROW2].map((logo,i) => (
              <div key={i} className="logo-pill">
                <img src={`/Logo2/${encodeURIComponent(logo)}`} alt={logo.split(".")[0]} loading="lazy" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SERVICE CARDS */}
      <section id="layanan-individu" className="py-24 px-4 bg-[#f8fafc] relative">
        <div className="max-w-[1200px] mx-auto">
          <div className="text-center mb-16">
            <span className="section-label block mb-3">Layanan Pengembangan Diri</span>
            <h2 className="section-title mb-4">Investasikan Waktu Untuk <br />Mengenal &amp; Menemukan Arah Hidup Anda</h2>
            <p className="text-slate-500 font-medium text-sm mt-4 max-w-2xl mx-auto">Petakan potensi bawaan, atasi hambatan mental, dan capai tujuan hidup terarah bersama para psikolog, coach, dan terapis berlisensi kami.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {SERVICES_CARDS.map((s) => (
              <div key={s.title} className="feature-card bg-white rounded-3xl p-6 flex flex-col justify-between">
                <div>
                  <div className={`w-12 h-12 rounded-2xl ${s.color} border flex items-center justify-center text-xl mb-6`}>{s.icon}</div>
                  <h3 className="text-lg font-bold text-slate-900 mb-3">{s.title}</h3>
                  <p className="text-slate-500 text-xs leading-relaxed mb-6">{s.desc}</p>
                </div>
                <Link href={s.href} className="text-red-600 font-bold text-xs inline-flex items-center gap-1 hover:text-red-700 transition-colors mt-4">
                  Pelajari Layanan <span aria-hidden>→</span>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* B2B SECTION */}
      <section className="py-24 px-4 bg-white relative overflow-hidden">
        <div className="max-w-[1200px] mx-auto">
          <div className="bg-slate-900 rounded-[3rem] p-8 md:p-16 text-white border border-slate-800 shadow-2xl relative overflow-hidden">
            <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{backgroundImage:"radial-gradient(circle at 1px 1px,#dc2626 1px,transparent 0)",backgroundSize:"32px 32px"}} />
            <div className="grid lg:grid-cols-[1.2fr_1fr] gap-12 lg:gap-16 items-center relative z-10">
              <div>
                <span className="inline-flex items-center px-4 py-1.5 rounded-full bg-red-600/20 text-red-400 border border-red-500/30 font-bold text-xs tracking-wider uppercase mb-6">Corporate &amp; Business Solutions</span>
                <h2 className="text-3xl md:text-5xl font-black leading-tight tracking-tight mb-6">Tingkatkan ROI Bisnis Melalui SDM yang Sehat &amp; Tepat</h2>
                <p className="text-slate-400 text-sm leading-relaxed mb-8 max-w-xl">Kelola retensi talenta terbaik Anda, tingkatkan performa kepemimpinan, dan cegah tingginya burnout karyawan melalui program B2B terintegrasi kami:</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-10">
                  {["Hiring & Asesmen Rekrutmen","Employee Assistance Program (EAP)","In-House Training & Outbound","HR Consulting & HRIS System"].map(item => (
                    <div key={item} className="flex items-center gap-3">
                      <span className="text-red-500 text-sm">✓</span>
                      <span className="text-xs font-semibold text-slate-200">{item}</span>
                    </div>
                  ))}
                </div>
                <Link href="/perusahaan" className="inline-flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-8 py-4 rounded-xl font-bold text-sm transition-all shadow-md">
                  Lihat Solusi Korporasi B2B <span aria-hidden>→</span>
                </Link>
              </div>
              <div className="flex justify-center relative">
                <div className="w-full max-w-[450px] aspect-[4/3] rounded-3xl overflow-hidden shadow-2xl border border-slate-800/80 relative group">
                  <Image src="/Foto2/greeneration.JPG" alt="Greeneration Team Activity with TheAIM" fill className="object-cover" />
                  <div className="absolute bottom-4 left-4 right-4 bg-slate-950/90 backdrop-blur-md p-4 rounded-2xl border border-slate-800 flex items-center justify-between">
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Corporate Partnership</p>
                      <p className="text-xs font-bold text-white leading-none">Greeneration Indonesia</p>
                    </div>
                    <span className="bg-red-600/20 text-red-400 border border-red-500/30 text-[9px] font-bold px-2 py-1 rounded">Aktif</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="langkah" className="py-24 px-4 bg-[#0f172a] relative text-white">
        <div className="max-w-[1300px] mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-extrabold mb-16 tracking-tight">Langkah Mudah Berproses Bersama TheAIM</h2>
          <div className="flex flex-col lg:flex-row items-stretch justify-center gap-4 lg:gap-2 w-full">
            {STEPS.map((step, i) => (
              <div key={step.num} className="flex lg:contents items-center gap-2">
                <div className="w-full lg:flex-1 bg-slate-800 text-white p-6 lg:p-8 rounded-[2rem] shadow-xl border border-slate-700/50 flex flex-col justify-between hover:-translate-y-2 transition-all">
                  <div>
                    <div className="flex items-start gap-4 mb-4">
                      <div className={`w-10 h-10 rounded-full ${step.color} flex items-center justify-center font-extrabold flex-shrink-0 text-lg shadow-md`}>{step.num}</div>
                      <h3 className="font-extrabold text-lg leading-tight mt-1 text-left">{step.title}</h3>
                    </div>
                    <p className="text-slate-400 text-xs text-left leading-relaxed">{step.desc}</p>
                  </div>
                </div>
                {i < STEPS.length - 1 && (
                  <div className="hidden lg:flex items-center justify-center px-1">
                    <span className="text-slate-600 text-sm">›</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="py-24 px-4 bg-slate-50 border-y border-slate-100 overflow-hidden">
        <div className="max-w-[1400px] mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-4 tracking-tight">Testimoni Mereka Yang Telah Berproses</h2>
          <p className="text-slate-500 mb-16 font-medium text-sm">Cerita transformasi nyata dari para alumni individu &amp; mitra organisasi kami</p>
          <div className="flex overflow-x-auto gap-6 pb-8 snap-x hide-scrollbar px-4 lg:px-12 w-full">
            {(testimonials.length > 0 ? testimonials : [
              {id:1,customer_name:"Aliyah M.",role_label:"Fresh Graduate",content:"Melalui program Talents Mapping dan bimbingan Visual Coaching, saya berhasil memahami kekuatan alami saya dan kini percaya diri meniti karir di bidang marketing strategy.",rating:5},
              {id:2,customer_name:"Budi P.",role_label:"Karyawan Swasta",content:"Stres kerja dan gejala burnout parah yang saya alami selama 2 tahun terakhir benar-benar berkurang signifikan setelah mengikuti beberapa sesi konseling privat dengan Psikolog Klinis TheAIM.",rating:5},
              {id:3,customer_name:"Citra W.",role_label:"Ibu Rumah Tangga",content:"Terapi SEFT yang difasilitasi oleh terapis bersertifikasi membantu saya berdamai dengan ketakutan berlebih dan trauma masa lalu yang mengganggu kecemasan harian saya.",rating:5},
              {id:4,customer_name:"David H.",role_label:"Wirausaha",content:"Rekomendasi yang didapatkan dari sesi konsultasi keuangan sangat taktis dan realistis. Saya kini bisa memisahkan cashflow pribadi dan bisnis dengan baik.",rating:5},
            ] as {id:number,customer_name:string,role_label:string|null,content:string,rating:number|null}[]).map((t,i) => (
              <div key={t.id} className="min-w-[320px] max-w-[350px] bg-white p-8 rounded-[2rem] shadow-md border border-slate-200/50 text-left snap-center flex flex-col hover:-translate-y-2 transition-transform">
                <div className="flex justify-between items-center mb-6 border-b border-slate-100 pb-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-12 h-12 ${avatarColors[i%avatarColors.length]} rounded-full flex items-center justify-center font-bold text-sm`}>
                      {getInitials(t.customer_name)}
                    </div>
                    <div>
                      <div className="font-bold text-slate-900 text-base leading-none mb-1">{t.customer_name}</div>
                      <span className="text-[10px] text-slate-400 font-semibold uppercase">{t.role_label}</span>
                    </div>
                  </div>
                  <div className="text-yellow-400 text-sm">{"★".repeat(t.rating ?? 5)}</div>
                </div>
                <p className="text-slate-500 text-xs leading-relaxed flex-grow">&quot;{t.content}&quot;</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* BOTTOM CTA */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-[800px] mx-auto text-center">
          <span className="section-label block mb-4">Mulai Sekarang</span>
          <h2 className="section-title mb-6">Siap Memulai Perjalanan Transformasi Anda?</h2>
          <p className="text-slate-500 font-medium mb-10 max-w-lg mx-auto text-sm leading-relaxed">Bergabunglah dengan 5.000+ individu dan ratusan perusahaan yang telah mempercayakan pengembangan SDM mereka kepada TheAIM.</p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link href="/rate-card" className="btn-primary px-8 py-4 rounded-full text-sm shadow-lg shadow-red-200">
              Lihat Semua Layanan &amp; Harga
            </Link>
            <a href="https://wa.me/6281999554599" target="_blank" rel="noopener noreferrer" className="btn-corp px-8 py-4 rounded-full text-sm gap-2">
              Konsultasi Gratis via WhatsApp
            </a>
          </div>
        </div>
      </section>
    </>
  );
}
