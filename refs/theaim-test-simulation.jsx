import { useState, useEffect } from "react";
import {
  Loader2, CheckCircle2, Clock, Shield, ChevronRight, ChevronLeft,
  Star, Briefcase, AlertCircle, Copy, Check, Printer, MessageCircle,
  QrCode, Database, RefreshCw, Brain, Zap, User, ArrowRight,
  ExternalLink, BarChart2, Lock, PhoneCall, AlertTriangle, XCircle,
} from "lucide-react";

/* ═══════════════════════════════════════════════════
   SEED DATA — mirrors ERD test_sessions / customers
═══════════════════════════════════════════════════ */
const SESSION = {
  id: 9, registration_code: "REG-20260628-0010",
  customer_name: "Budi Prasetyo", whatsapp: "081234567802",
  test_code: "MBTI", test_label: "Myers-Briggs Type Indicator",
  access_token: "acc_7f3b2e1a4d7c8f9e2b5a1c3d6e9f",
  result_token: "res_9a2d4f8e1b3c5d7f2a4e6b8c0d2f",
  registration_code_short: "REG-20260628-0010",
  issued_at: "28 Jun 2026", expires_at: "28 Jul 2026",
  confirm_attempts: 0,   /* ERD: test_sessions.confirm_attempts */
};
const MAX_CONFIRM_ATTEMPTS = 3;   /* matches TRD §15 */

/* ═════════════════════════════ QUESTIONS ═════════ */
const QUESTIONS = [
  { id:1, section:"EI", q:"Setelah menghabiskan waktu lama sendirian, Anda biasanya merasa...", options:[
    {value:"A",label:"Gelisah dan ingin segera bertemu orang lain",sk:"E"},
    {value:"B",label:"Segar dan berenergi kembali",sk:"I"}]},
  { id:2, section:"EI", q:"Di pesta yang orang-orangnya belum Anda kenal, Anda cenderung...", options:[
    {value:"A",label:"Aktif berkenalan dan memulai percakapan dengan banyak orang",sk:"E"},
    {value:"B",label:"Mencari satu atau dua orang untuk ngobrol lebih dalam",sk:"I"}]},
  { id:3, section:"EI", q:"Cara Anda memproses ide baru lebih sering dengan...", options:[
    {value:"A",label:"Mendiskusikannya langsung dengan orang lain",sk:"E"},
    {value:"B",label:"Memikirkannya sendiri terlebih dahulu",sk:"I"}]},
  { id:4, section:"SN", q:"Saat mengerjakan tugas baru, Anda lebih suka...", options:[
    {value:"A",label:"Petunjuk langkah demi langkah yang jelas dan spesifik",sk:"S"},
    {value:"B",label:"Gambaran besar tujuannya, lalu eksplorasi sendiri caranya",sk:"N"}]},
  { id:5, section:"SN", q:"Anda lebih percaya pada...", options:[
    {value:"A",label:"Pengalaman nyata dan fakta yang sudah terbukti",sk:"S"},
    {value:"B",label:"Intuisi dan pola tersembunyi yang Anda rasakan",sk:"N"}]},
  { id:6, section:"SN", q:"Ketika membayangkan masa depan, Anda...", options:[
    {value:"A",label:"Fokus pada apa yang realistis dan bisa dicapai sekarang",sk:"S"},
    {value:"B",label:"Membayangkan berbagai kemungkinan menarik yang bisa terjadi",sk:"N"}]},
  { id:7, section:"TF", q:"Saat membuat keputusan sulit, Anda lebih mempertimbangkan...", options:[
    {value:"A",label:"Logika dan konsekuensi yang paling masuk akal secara objektif",sk:"T"},
    {value:"B",label:"Dampak keputusan terhadap perasaan orang-orang yang terlibat",sk:"F"}]},
  { id:8, section:"TF", q:"Ketika teman meminta pendapat tentang keputusan yang menurut Anda salah...", options:[
    {value:"A",label:"Anda langsung mengatakan pendapat jujur meski mungkin menyakitkan",sk:"T"},
    {value:"B",label:"Anda mempertimbangkan cara penyampaian agar tidak menyakiti perasaannya",sk:"F"}]},
  { id:9, section:"TF", q:"Dalam lingkungan kerja, Anda lebih menghargai...", options:[
    {value:"A",label:"Kompetisi sehat yang mendorong performa terbaik",sk:"T"},
    {value:"B",label:"Kolaborasi erat dan hubungan kerja yang harmonis",sk:"F"}]},
  { id:10, section:"JP", q:"Deskripsi yang paling mencerminkan gaya hidup Anda...", options:[
    {value:"A",label:"Terorganisir, jadwal jelas, dan segala sesuatu di tempatnya",sk:"J"},
    {value:"B",label:"Fleksibel, spontan, dan adaptif terhadap perubahan",sk:"P"}]},
  { id:11, section:"JP", q:"Saat memulai proyek baru, Anda biasanya...", options:[
    {value:"A",label:"Membuat rencana detail terlebih dahulu sebelum mulai",sk:"J"},
    {value:"B",label:"Langsung mulai dan biarkan strukturnya berkembang alami",sk:"P"}]},
  { id:12, section:"JP", q:"Anda merasa paling nyaman ketika...", options:[
    {value:"A",label:"Semua keputusan sudah dibuat dan rencana sudah terkunci",sk:"J"},
    {value:"B",label:"Pilihan masih terbuka dan bisa disesuaikan sesuai keadaan",sk:"P"}]},
];

/* ══════════════════════════════ MBTI DATA ════════ */
const MBTI = {
  INTJ:{label:"The Architect",id:"Sang Arsitek",tag:"Imajinatif dan strategis. Selalu punya rencana.",col:"#0f766e",
    desc:"INTJ adalah pemikir strategis yang visioner, selalu punya rencana cadangan untuk rencana cadangan mereka. Mereka memandang dunia penuh pola dan potensi yang bisa dioptimalkan. Independen dan determinatif, INTJ tidak segan menantang konvensi jika logika menunjukkan jalan yang lebih baik.",
    strengths:["Strategis dan visioner","Determinasi dan tekad tinggi","Analitis dan sangat efisien","Berpikiran terbuka berdasarkan bukti"],
    challenges:["Bisa terkesan arogan atau hiperkritis","Kesulitan mengekspresikan emosi","Perfeksionis yang terkadang menghambat"],
    careers:["Konsultan Strategi","Software Engineer","Ilmuwan / Peneliti","Arsitek","Business Analyst"]},
  INTP:{label:"The Logician",id:"Sang Pemikir",tag:"Inovatif dengan haus tak terpuaskan akan pengetahuan.",col:"#2563eb",
    desc:"INTP terkenal dengan teori orisinal dan kecerdasan yang mengagumkan. Mereka lebih suka bekerja dengan konsep abstrak dan selalu mencari pola serta prinsip di balik segala sesuatu.",
    strengths:["Analitis dan sangat objektif","Imajinatif dan orisinal","Pikiran terbuka terhadap paradigma baru","Antusias mengeksplorasi pengetahuan"],
    challenges:["Tidak suka aturan dan struktur ketat","Sulit mengekspresikan perasaan","Menunda karena terlalu banyak menganalisis"],
    careers:["Akademisi / Filosof","Software Developer","Matematikawan","Peneliti","Arsitek Sistem"]},
  ENTJ:{label:"The Commander",id:"Sang Komandan",tag:"Pemimpin yang berani, imajinatif, dan berkemauan keras.",col:"#7c3aed",
    desc:"ENTJ adalah pemimpin bawaan yang percaya diri dan tegas. Mereka sangat menikmati tantangan dan selalu mencari cara membuat segala sesuatu berjalan lebih efisien.",
    strengths:["Efisien dan energetis","Kepercayaan diri tinggi","Kepemimpinan natural","Tekad yang kuat"],
    challenges:["Tidak sabaran dengan ketidakefisienan","Bisa dominan dan intimidating","Kurang peka terhadap emosi"],
    careers:["CEO / Direktur","Konsultan Manajemen","Pengacara","Politisi","Investment Banker"]},
  ENTP:{label:"The Debater",id:"Sang Penemu",tag:"Pemikir cerdas dan penuh rasa ingin tahu.",col:"#d97706",
    desc:"ENTP adalah individu yang sangat cerdas dan suka mendebat ide — bukan karena suka konflik, tapi karena yakin perdebatan menghasilkan ide terbaik.",
    strengths:["Cepat berpikir dan berargumentasi","Karismatik dan inovatif","Pengetahuan luas","Sangat orisinal"],
    challenges:["Tidak suka rutinitas","Sangat argumentatif","Banyak mulai proyek tanpa menyelesaikan"],
    careers:["Wirausahawan","Pengacara","Konsultan Bisnis","Diplomat","Produser Kreatif"]},
  INFJ:{label:"The Advocate",id:"Sang Advokat",tag:"Pendiam dan mistis, namun menginspirasi.",col:"#0891b2",
    desc:"INFJ adalah tipe paling langka, memiliki intuisi luar biasa tentang orang lain. Mereka punya visi kuat tentang bagaimana dunia seharusnya dan mendedikasikan diri untuk mewujudkannya.",
    strengths:["Kreatif dan visioner","Penuh prinsip dan nilai","Empati yang mendalam","Pendengar yang luar biasa"],
    challenges:["Terlalu idealis","Sulit membuka diri","Mudah lelah secara emosional"],
    careers:["Psikolog / Konselor","Penulis","Aktivis Sosial","Terapis","HRD"]},
  INFP:{label:"The Mediator",id:"Sang Mediator",tag:"Idealis dengan tujuan, selalu mencari kebaikan.",col:"#db2777",
    desc:"INFP adalah individu yang tenang dan sangat idealis. Mereka setia pada nilai-nilai dan orang-orang yang mereka cintai, selalu mencari cara membantu dunia menjadi tempat yang lebih baik.",
    strengths:["Empatik dan penuh kepedulian","Kreatif dan imajinatif","Setia dan berdedikasi","Fleksibel dan terbuka"],
    challenges:["Terlalu idealis dan mudah kecewa","Sulit membuat keputusan tegas","Kehilangan fokus pada detail praktis"],
    careers:["Penulis / Seniman","Konselor / Terapis","Psikolog Klinis","Guru","Aktivis LSM"]},
  ENFJ:{label:"The Protagonist",id:"Sang Protagonis",tag:"Karismatik dan menginspirasi, pemimpin yang peduli.",col:"#16a34a",
    desc:"ENFJ adalah pemimpin karismatik dengan kemampuan natural memahami dan memotivasi orang lain. Mereka sangat peduli dengan pertumbuhan orang-orang di sekitar mereka.",
    strengths:["Keterampilan komunikasi luar biasa","Empati yang sangat tinggi","Natural sebagai pemimpin","Jiwa pengabdian kuat"],
    challenges:["Terlalu idealis","Sulit membuat keputusan tidak populer","Sangat sensitif terhadap kritik"],
    careers:["Pendidik / Guru","Konselor","Manajer SDM","Politisi","Pelatih Profesional"]},
  ENFP:{label:"The Campaigner",id:"Sang Aktivis",tag:"Semangat, kreatif, dan sosial — bebas seperti angin.",col:"#0ea5e9",
    desc:"ENFP adalah jiwa ceria dan bebas dengan kemampuan menemukan kreativitas dan kegembiraan di segala hal. Mereka sangat sosial dan suka membuat koneksi bermakna dengan orang lain.",
    strengths:["Antusias dan energetis","Kreativitas dan imajinasi tinggi","Sangat sosial dan empatik","Adaptif dan fleksibel"],
    challenges:["Sulit fokus pada hal rutin","Mudah bosan dengan monotonitas","Terkadang terlalu emosional"],
    careers:["Marketing / Brand Strategist","Jurnalis","Konsultan Kreatif","Wirausahawan","Guru / Fasilitator"]},
  ISTJ:{label:"The Logistician",id:"Sang Logistikus",tag:"Praktis dan bertanggung jawab, paling dapat diandalkan.",col:"#374151",
    desc:"ISTJ adalah individu yang sangat bertanggung jawab dan dapat diandalkan. Jika diberi tugas, mereka akan menyelesaikannya dengan cermat dan teliti tanpa peduli hambatan apapun.",
    strengths:["Sangat bertanggung jawab","Metodis dan teliti","Jujur dan berintegritas tinggi","Komitmen kuat"],
    challenges:["Kaku dan lambat beradaptasi","Keras kepala","Kesulitan mengekspresikan emosi"],
    careers:["Akuntan / Auditor","Manajer Operasional","Dokter","Administrator","Hakim / Notaris"]},
  ISTP:{label:"The Virtuoso",id:"Sang Virtuoso",tag:"Pemberani dan praktis, ahli menggunakan berbagai alat.",col:"#b45309",
    desc:"ISTP adalah pengamat diam yang tiba-tiba muncul untuk memecahkan masalah dengan elegan. Mereka menikmati ketidakpastian dan selalu ingin memahami cara kerja sesuatu.",
    strengths:["Optimis dan energetis","Kreatif dan sangat praktis","Spontan dan rasional","Andal dalam situasi krisis"],
    challenges:["Mudah bosan","Terkadang mengambil risiko terlalu tinggi","Sulit berkomitmen jangka panjang"],
    careers:["Insinyur Mesin","Pilot","Developer","Atlet Profesional","Fotografer"]},
  ISFJ:{label:"The Defender",id:"Sang Pembela",tag:"Sangat berdedikasi dan hangat, siap membela orang.",col:"#065f46",
    desc:"ISFJ adalah pelindung yang tulus. Mereka adalah perpaduan unik antara introvert dan empati tinggi — diam-diam bekerja keras di belakang layar untuk memastikan semua orang baik-baik saja.",
    strengths:["Sangat mendukung orang lain","Dapat diandalkan dan sabar","Pengamat yang tajam","Pekerja keras"],
    challenges:["Rendah diri berlebihan","Sulit mengatakan tidak","Mengabaikan kebutuhan diri sendiri"],
    careers:["Perawat / Dokter","Guru SD","Konselor Sekolah","Administrator","Pekerja Sosial"]},
  ISFP:{label:"The Adventurer",id:"Sang Petualang",tag:"Fleksibel dan menawan, selalu siap menjelajah.",col:"#9333ea",
    desc:"ISFP adalah seniman dan petualang yang hidup di momen saat ini. Mereka sangat ekspresif dan menjalani hidup sesuai nilai-nilai mereka sendiri.",
    strengths:["Penuh pesona dan rasa ingin tahu","Sangat artistik dan kreatif","Passionate terhadap yang dicintai","Empati tinggi"],
    challenges:["Tidak suka konflik","Sulit fokus jangka panjang","Sangat tidak terstruktur"],
    careers:["Seniman / Ilustrator","Musisi","Chef","Fotografer","Desainer Mode"]},
  ESTJ:{label:"The Executive",id:"Sang Eksekutif",tag:"Sangat terorganisir, pemimpin yang suka membuat teratur.",col:"#1e3a5f",
    desc:"ESTJ adalah representasi tradisi dan tatanan. Mereka sangat tegas dan percaya pada kekuatan sistem yang terstruktur dengan baik.",
    strengths:["Sangat terorganisir dan disiplin","Dedikasi dan tekad kuat","Percaya diri dan tegas","Sangat bertanggung jawab"],
    challenges:["Tidak fleksibel","Keras kepala","Kurang peka terhadap dimensi emosional"],
    careers:["Manajer / Direktur Operasional","Hakim","Akuntan","Pengacara","Perwira Militer"]},
  ESTP:{label:"The Entrepreneur",id:"Sang Pengusaha",tag:"Cerdas, energetis, dan sangat jeli membaca situasi.",col:"#c2410c",
    desc:"ESTP adalah pribadi penuh aksi, lebih suka tindakan langsung daripada teori panjang. Mereka sangat pandai membaca situasi dan orang.",
    strengths:["Berani, langsung, dan percaya diri","Sangat pandai bersosialisasi","Pengamat yang tajam","Optimis dan energetis"],
    challenges:["Tidak sabaran dan impulsif","Tidak suka komitmen jangka panjang","Suka risiko terlalu tinggi"],
    careers:["Wirausahawan","Sales Director","Manajer Krisis","Negosiator","Aktor / Public Figure"]},
  ESFJ:{label:"The Consul",id:"Sang Konsul",tag:"Sangat peduli, sosial, dan populer — pemimpin komunitas.",col:"#be185d",
    desc:"ESFJ adalah individu yang sangat peduli dan sosial. Mereka suka membantu orang lain dan memastikan semua orang bahagia, menjadi perekat sosial yang menyatukan kelompok.",
    strengths:["Kuat dan dapat diandalkan","Sangat peduli terhadap orang lain","Loyal dan setia","Sensitif dan hangat"],
    challenges:["Sangat butuh validasi orang lain","Kurang terbuka terhadap ide baru","Sangat tidak suka konflik"],
    careers:["Guru / Pendidik","Konselor / Perawat","Dokter Umum","Event Organizer","Manajer Komunitas"]},
  ESFP:{label:"The Entertainer",id:"Sang Penghibur",tag:"Spontan, energetis, antusias — hidup tak pernah membosankan.",col:"#b91c1c",
    desc:"ESFP adalah jiwa pesta yang hidup di momen saat ini. Mereka sangat baik merasakan kebutuhan orang lain dan memberikan semangat kepada lingkungan sekitar.",
    strengths:["Berani dan orisinal","Kepekaan estetika yang kuat","Sangat praktis dan tindakan langsung","Pengamat yang baik"],
    challenges:["Sangat sensitif terhadap kritik","Mudah bosan","Sulit fokus jangka panjang"],
    careers:["Aktor / Entertainer","Event Planner","Desainer Interior","Tour Guide","Chef Profesional"]},
};

/* ═════════════════════════ SCORING ═══════════════ */
function computeMBTI(answers) {
  const s = {E:0,I:0,S:0,N:0,T:0,F:0,J:0,P:0};
  QUESTIONS.forEach((q) => {
    const a = answers[q.id];
    if (a) { const o = q.options.find(x=>x.value===a); if(o) s[o.sk]++; }
  });
  const type = [s.E>=s.I?"E":"I",s.S>=s.N?"S":"N",s.T>=s.F?"T":"F",s.J>=s.P?"J":"P"].join("");
  return { type, scores:s };
}

function buildWA(type, scores, name) {
  const m=MBTI[type];
  const pct=(a,b)=>Math.round((a/(a+b))*100);
  return `Selamat! Hasil Tes MBTI ${name}:\n\n*${type} — ${m.label}*\n(${m.id})\n\n${m.tag}\n\nDimensi kepribadian:\n• ${scores.E>=scores.I?"Ekstravert":"Introvert"} ${pct(Math.max(scores.E,scores.I),Math.min(scores.E,scores.I))}%\n• ${scores.S>=scores.N?"Sensing":"Intuisi"} ${pct(Math.max(scores.S,scores.N),Math.min(scores.S,scores.N))}%\n• ${scores.T>=scores.F?"Pemikir":"Perasa"} ${pct(Math.max(scores.T,scores.F),Math.min(scores.T,scores.F))}%\n• ${scores.J>=scores.P?"Penilai":"Pengamat"} ${pct(Math.max(scores.J,scores.P),Math.min(scores.J,scores.P))}%\n\nLihat hasil lengkap (selamanya):\ntheaim.id/hasil/res_9a2d4f8e...\n\nSimpan link ini agar tidak lupa!\n— Tim TheAIM`;
}

/* ═══════════════════════ PRIMITIVES ══════════════ */
const STATUS_CFG = {
  issued:      {bg:"#fef3c7",col:"#92400e",dot:"#d97706"},
  confirming:  {bg:"#eff6ff",col:"#1e3a8a",dot:"#3b82f6"},
  in_progress: {bg:"#dbeafe",col:"#1e3a8a",dot:"#2563eb"},
  completed:   {bg:"#d1fae5",col:"#064e3b",dot:"#10b981"},
  locked:      {bg:"#fee2e2",col:"#7f1d1d",dot:"#ef4444"},
  expired:     {bg:"#f1f5f9",col:"#475569",dot:"#94a3b8"},
  revoked:     {bg:"#fce7f3",col:"#831843",dot:"#ec4899"},
};
function TokenBadge({status}) {
  const c=STATUS_CFG[status]||STATUS_CFG.issued;
  return <span style={{display:"inline-flex",alignItems:"center",gap:5,padding:"3px 10px",borderRadius:20,background:c.bg,fontSize:11,fontWeight:600,color:c.col,fontFamily:"monospace"}}>
    <span style={{width:6,height:6,borderRadius:"50%",background:c.dot,flexShrink:0}}/>
    {status}
  </span>;
}
function DBBadge({table,op=""}) {
  return <span style={{display:"inline-flex",alignItems:"center",gap:4,padding:"2px 8px",borderRadius:4,background:"#0f172a",color:"#94a3b8",fontSize:10,fontFamily:"monospace"}}>
    <Database size={10}/>{op?`${op}: `:""}{table}
  </span>;
}
function TheAIMLogo({size=14}) {
  return <div style={{display:"inline-flex",alignItems:"center",gap:7}}>
    <div style={{width:size+8,height:size+8,background:"#0f766e",borderRadius:8,display:"flex",alignItems:"center",justifyContent:"center"}}>
      <span style={{color:"#fff",fontWeight:800,fontSize:size-1,fontFamily:"'Space Grotesk',sans-serif"}}>A</span>
    </div>
    <span style={{fontWeight:700,fontSize:size,color:"#0f766e",fontFamily:"'Space Grotesk',sans-serif",letterSpacing:-0.5}}>TheAIM</span>
  </div>;
}
function ProgressBar({current,total}) {
  const pct=Math.round((current/total)*100);
  return <div>
    <div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}>
      <span style={{fontSize:11,color:"#64748b"}}>Pertanyaan {current} dari {total}</span>
      <span style={{fontSize:11,color:"#0f766e",fontWeight:600}}>{pct}%</span>
    </div>
    <div style={{height:5,background:"#e2e8f0",borderRadius:3}}>
      <div style={{height:"100%",width:`${pct}%`,background:"#0f766e",borderRadius:3,transition:"width 0.4s ease"}}/>
    </div>
  </div>;
}
function DimensionBar({left,right,scoreL,scoreR}) {
  const total=scoreL+scoreR,pctL=Math.round((scoreL/total)*100);
  const LABELS={E:"Ekstravert",I:"Introvert",S:"Sensing",N:"Intuisi",T:"Pemikir",F:"Perasa",J:"Penilai",P:"Pengamat"};
  const dom=pctL>=100-pctL?{l:left,pct:pctL}:{l:right,pct:100-pctL};
  return <div style={{marginBottom:16}}>
    <div style={{display:"flex",justifyContent:"space-between",marginBottom:5,alignItems:"center"}}>
      <span style={{fontSize:13,fontWeight:600,color:pctL>=50?"#0f766e":"#94a3b8",minWidth:26}}>{left}</span>
      <div style={{flex:1,margin:"0 10px",height:10,background:"#e2e8f0",borderRadius:5,overflow:"hidden"}}>
        <div style={{height:"100%",width:`${pctL}%`,background:pctL>=50?"#0f766e":"#cbd5e1",borderRadius:"5px 0 0 5px",transition:"width 0.6s"}}/>
      </div>
      <span style={{fontSize:13,fontWeight:600,color:pctL<50?"#0f766e":"#94a3b8",minWidth:26,textAlign:"right"}}>{right}</span>
    </div>
    <div style={{textAlign:"center",fontSize:12,color:"#0f766e",fontWeight:500}}>{LABELS[dom.l]} ({dom.pct}%)</div>
  </div>;
}

/* ═══════════════════════ SCREEN 1: VALIDATING ════ */
function ValidatingScreen() {
  const [step,setStep]=useState(0);
  const steps=["Memverifikasi token...","Memuat sesi tes...","Menyiapkan verifikasi identitas..."];
  useEffect(()=>{const t=setInterval(()=>setStep(s=>Math.min(s+1,steps.length-1)),600);return()=>clearInterval(t);},[]);
  return <div style={{display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",minHeight:300,gap:18}}>
    <div style={{width:56,height:56,borderRadius:"50%",background:"#f0fdfa",border:"2px solid #99f6e4",display:"flex",alignItems:"center",justifyContent:"center"}}>
      <Loader2 size={28} color="#0f766e" style={{animation:"spin 1s linear infinite"}}/>
    </div>
    <div style={{textAlign:"center"}}>
      <p style={{fontWeight:600,color:"#0f172a",marginBottom:4}}>{steps[step]}</p>
      <DBBadge table="test_sessions" op="SELECT"/>
    </div>
  </div>;
}

/* ═══════════════════════ SCREEN 2: CONFIRMATION ══ */
function ConfirmationScreen({onSuccess}) {
  const [input,setInput]=useState("");
  const [attempts,setAttempts]=useState(0);
  const [error,setError]=useState("");
  const [locked,setLocked]=useState(false);
  const CORRECT=SESSION.whatsapp.slice(-4);  /* "7802" from customers.whatsapp_number */
  const masked=SESSION.whatsapp.slice(0,-4)+"••••"; /* hide last 4 — that's the answer */

  function verify() {
    if (input.trim()===CORRECT) {
      onSuccess();
    } else {
      const a=attempts+1;
      setAttempts(a);
      if (a>=MAX_CONFIRM_ATTEMPTS) { setLocked(true); return; }
      setError(`Nomor tidak cocok. Sisa percobaan: ${MAX_CONFIRM_ATTEMPTS-a}`);
      setInput("");
    }
  }

  if (locked) return (
    <div style={{display:"flex",flexDirection:"column",alignItems:"center",padding:"32px 0",textAlign:"center",gap:16}}>
      <div style={{width:60,height:60,borderRadius:"50%",background:"#fee2e2",border:"2px solid #fca5a5",display:"flex",alignItems:"center",justifyContent:"center"}}>
        <Lock size={28} color="#ef4444"/>
      </div>
      <div>
        <h3 style={{fontWeight:700,color:"#0f172a",marginBottom:6}}>Akses Terkunci</h3>
        <p style={{fontSize:13,color:"#64748b",margin:"0 0 4px"}}>Terlalu banyak percobaan yang gagal ({MAX_CONFIRM_ATTEMPTS}×).</p>
        <p style={{fontSize:13,color:"#64748b",margin:0}}>Token ini telah dikunci secara otomatis.</p>
      </div>
      <div style={{background:"#fef2f2",border:"1px solid #fecaca",borderRadius:10,padding:"14px 18px",width:"100%"}}>
        <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:8}}>
          <PhoneCall size={16} color="#ef4444"/>
          <span style={{fontSize:13,fontWeight:600,color:"#7f1d1d"}}>Hubungi Admin TheAIM</span>
        </div>
        <p style={{fontSize:12,color:"#991b1b",margin:"0 0 8px"}}>Admin akan memverifikasi identitas Anda dan menerbitkan token baru jika diperlukan.</p>
        <a style={{fontSize:12,color:"#0f766e",fontWeight:600}}>wa.me/6281xxxxxxxxx</a>
      </div>
      <div style={{display:"flex",gap:6,flexWrap:"wrap",justifyContent:"center"}}>
        <DBBadge table="test_sessions" op="UPDATE status='locked'"/>
        <DBBadge table="test_sessions" op="SET locked_at=now()"/>
      </div>
      <p style={{fontSize:11,color:"#94a3b8"}}>ERD: test_sessions.confirm_attempts = {MAX_CONFIRM_ATTEMPTS} → status = 'locked'</p>
    </div>
  );

  return (
    <div style={{padding:"20px 0"}}>
      <div style={{textAlign:"center",marginBottom:24}}>
        <div style={{width:54,height:54,borderRadius:"50%",background:"#eff6ff",border:"2px solid #bfdbfe",display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 12px"}}>
          <Shield size={26} color="#2563eb"/>
        </div>
        <h3 style={{fontWeight:700,color:"#0f172a",marginBottom:4,fontSize:16}}>Verifikasi Identitas</h3>
        <p style={{fontSize:13,color:"#64748b",margin:0}}>Demi kerahasiaan hasil tes Anda (PRD §5.14)</p>
      </div>

      <div style={{background:"#eff6ff",border:"1px solid #bfdbfe",borderRadius:10,padding:"16px",marginBottom:20,textAlign:"center"}}>
        <p style={{fontSize:12,color:"#1e40af",marginBottom:8,fontWeight:500}}>Konfirmasikan nomor WhatsApp yang terdaftar</p>
        <div style={{fontSize:22,fontWeight:800,color:"#1e3a8a",fontFamily:"monospace",letterSpacing:3,marginBottom:6}}>{masked}</div>
        <p style={{fontSize:11,color:"#3730a3",margin:0}}>Terdaftar pada: {SESSION.registration_code_short}</p>
      </div>

      <div style={{marginBottom:6}}>
        <label style={{fontSize:13,fontWeight:600,color:"#0f172a",display:"block",marginBottom:8}}>
          Masukkan 4 digit terakhir nomor WhatsApp Anda
        </label>
        <input
          type="tel" maxLength={4} value={input}
          onChange={e=>{setInput(e.target.value.replace(/\D/g,""));setError("");}}
          onKeyDown={e=>e.key==="Enter"&&input.length===4&&verify()}
          placeholder="····"
          style={{width:"100%",padding:"14px",border:`2px solid ${error?"#ef4444":input.length===4?"#0f766e":"#e2e8f0"}`,borderRadius:10,fontSize:28,fontFamily:"monospace",textAlign:"center",letterSpacing:12,color:"#0f172a",outline:"none",transition:"border-color 0.2s"}}
        />
        {error && <p style={{fontSize:12,color:"#ef4444",marginTop:6,display:"flex",alignItems:"center",gap:4}}>
          <AlertTriangle size={13}/>{error}
        </p>}
      </div>

      <div style={{background:"#f8fafc",border:"1px solid #e2e8f0",borderRadius:8,padding:"10px 12px",marginBottom:16}}>
        <p style={{fontSize:11,color:"#64748b",margin:"0 0 2px"}}>
          Contoh: jika nomor WA Anda terlihat sebagai <strong>0821-3400-••••</strong>, masukkan 4 digit terakhir yang hanya Anda tahu.
        </p>
        <p style={{fontSize:11,color:"#94a3b8",margin:0}}>[Demo] Jawaban untuk nomor di atas: <strong style={{fontFamily:"monospace",color:"#0f766e"}}>{CORRECT}</strong></p>
      </div>

      <button onClick={verify} disabled={input.length<4}
        style={{width:"100%",padding:"14px",background:input.length===4?"#1d4ed8":"#e2e8f0",color:input.length===4?"#fff":"#94a3b8",border:"none",borderRadius:10,fontWeight:700,fontSize:15,cursor:input.length===4?"pointer":"not-allowed",display:"flex",alignItems:"center",justifyContent:"center",gap:8,transition:"background 0.2s"}}>
        <Shield size={18}/> Verifikasi dan Lanjutkan <ArrowRight size={16}/>
      </button>

      <div style={{textAlign:"center",marginTop:14,fontSize:12,color:"#94a3b8"}}>
        Bukan Anda? <span style={{color:"#0f766e",fontWeight:600,cursor:"pointer"}}>Hubungi Admin TheAIM</span>
        <span style={{margin:"0 6px"}}>·</span>
        <span>{MAX_CONFIRM_ATTEMPTS - attempts} percobaan tersisa</span>
      </div>

      <div style={{display:"flex",gap:6,flexWrap:"wrap",justifyContent:"center",marginTop:12}}>
        <DBBadge table="customers" op="SELECT wa_number"/>
        <DBBadge table="test_sessions" op="UPDATE confirm_attempts"/>
      </div>
    </div>
  );
}

/* ════════════════════════ SCREEN 3: WELCOME ══════ */
function WelcomeScreen({onStart}) {
  return <div style={{padding:"20px 0"}}>
    <div style={{background:"#f0fdfa",border:"1px solid #99f6e4",borderRadius:12,padding:"18px",marginBottom:20}}>
      <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:12}}>
        <div style={{width:40,height:40,borderRadius:"50%",background:"#0f766e",display:"flex",alignItems:"center",justifyContent:"center"}}>
          <CheckCircle2 size={20} color="#fff"/>
        </div>
        <div>
          <p style={{fontWeight:700,color:"#0f172a",fontSize:14,margin:0}}>Identitas terverifikasi</p>
          <p style={{fontSize:12,color:"#0f766e",margin:0}}>{SESSION.customer_name} · {SESSION.registration_code}</p>
        </div>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,borderTop:"1px solid #99f6e4",paddingTop:12}}>
        <div><p style={{fontSize:11,color:"#64748b",margin:"0 0 2px"}}>Tes</p><p style={{fontSize:13,fontWeight:600,color:"#0f172a",margin:0}}>{SESSION.test_code}</p></div>
        <div><p style={{fontSize:11,color:"#64748b",margin:"0 0 2px"}}>Berlaku hingga</p><p style={{fontSize:12,color:"#0f172a",margin:0}}>{SESSION.expires_at}</p></div>
        <div><p style={{fontSize:11,color:"#64748b",margin:"0 0 2px"}}>Status token</p><TokenBadge status="confirming"/></div>
        <div><p style={{fontSize:11,color:"#64748b",margin:"0 0 2px"}}>Total pertanyaan</p><p style={{fontSize:12,color:"#0f172a",margin:0}}>{QUESTIONS.length} pertanyaan</p></div>
      </div>
    </div>
    {["Pilih jawaban yang paling mencerminkan diri Anda, bukan yang seharusnya.","Tidak ada jawaban benar atau salah dalam tes kepribadian ini.","Jawab dengan jujur dan spontan, jangan terlalu lama memikirkan.","Jawaban tersimpan otomatis di setiap pertanyaan (ERD: test_responses).","Estimasi waktu: 5–8 menit."].map((t,i)=>(
      <div key={i} style={{display:"flex",gap:10,marginBottom:8}}>
        <CheckCircle2 size={15} color="#0f766e" style={{flexShrink:0,marginTop:2}}/>
        <span style={{fontSize:13,color:"#334155",lineHeight:1.5}}>{t}</span>
      </div>
    ))}
    <div style={{background:"#fffbeb",border:"1px solid #fde68a",borderRadius:8,padding:"10px 14px",margin:"16px 0",display:"flex",gap:10}}>
      <AlertCircle size={15} color="#d97706" style={{flexShrink:0,marginTop:1}}/>
      <p style={{fontSize:12,color:"#78350f",margin:0}}>Link ini hanya bisa digunakan <strong>satu kali</strong>. Setelah selesai, token hangus dan Anda akan diarahkan ke halaman hasil permanen.</p>
    </div>
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
      <DBBadge table="test_sessions" op="UPDATE status='in_progress'"/>
      <DBBadge table="test_items" op="SELECT"/>
    </div>
    <button onClick={onStart} style={{width:"100%",padding:"14px 0",background:"#0f766e",color:"#fff",border:"none",borderRadius:10,fontWeight:700,fontSize:15,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:8}}>
      <Brain size={18}/> Mulai Tes {SESSION.test_code} <ArrowRight size={16}/>
    </button>
  </div>;
}

/* ════════════════════════ SCREEN 4: TESTING ══════ */
function TestingScreen({onComplete}) {
  const [cur,setCur]=useState(0);
  const [answers,setAnswers]=useState({});
  const [saved,setSaved]=useState(false);
  const q=QUESTIONS[cur];
  const sel=answers[q.id];
  const total=Object.keys(answers).length;
  const SECLAB={EI:"Energi",SN:"Informasi",TF:"Keputusan",JP:"Gaya Hidup"};

  function pick(val) {
    setAnswers({...answers,[q.id]:val});
    setSaved(false);
    setTimeout(()=>setSaved(true),300);
  }
  function next(){if(cur<QUESTIONS.length-1){setCur(cur+1);setSaved(false);}}
  function prev(){if(cur>0){setCur(cur-1);setSaved(false);}}

  return <div>
    <div style={{marginBottom:18}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
        <span style={{fontSize:11,color:"#64748b",background:"#f1f5f9",padding:"2px 8px",borderRadius:4,fontWeight:500}}>
          Dimensi {SECLAB[q.section]} ({q.section})
        </span>
        <TokenBadge status="in_progress"/>
      </div>
      <ProgressBar current={cur+1} total={QUESTIONS.length}/>
    </div>
    <div style={{background:"#f8fafc",border:"1px solid #e2e8f0",borderRadius:12,padding:"20px 16px",marginBottom:18,minHeight:80}}>
      <p style={{fontSize:15,fontWeight:600,color:"#0f172a",lineHeight:1.6,margin:0}}>{q.q}</p>
    </div>
    <div style={{display:"flex",flexDirection:"column",gap:10,marginBottom:18}}>
      {q.options.map((o)=>{
        const isS=sel===o.value;
        return <button key={o.value} onClick={()=>pick(o.value)}
          style={{display:"flex",alignItems:"flex-start",gap:12,padding:"14px 16px",border:isS?"2px solid #0f766e":"1.5px solid #e2e8f0",borderRadius:10,background:isS?"#f0fdfa":"#fff",cursor:"pointer",textAlign:"left",transition:"all 0.18s"}}>
          <div style={{width:22,height:22,borderRadius:"50%",border:isS?"2px solid #0f766e":"2px solid #cbd5e1",background:isS?"#0f766e":"#fff",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,marginTop:1}}>
            {isS&&<div style={{width:8,height:8,borderRadius:"50%",background:"#fff"}}/>}
          </div>
          <div>
            <span style={{fontSize:12,fontWeight:700,color:isS?"#0f766e":"#94a3b8",display:"block",marginBottom:2}}>Pilihan {o.value}</span>
            <span style={{fontSize:13,color:isS?"#0f172a":"#334155",lineHeight:1.5}}>{o.label}</span>
          </div>
        </button>;
      })}
    </div>
    {saved&&sel&&<div style={{display:"flex",alignItems:"center",gap:6,marginBottom:10,fontSize:12,color:"#0f766e"}}>
      <CheckCircle2 size={13}/> Jawaban tersimpan <DBBadge table="test_responses" op="UPSERT"/>
    </div>}
    <div style={{display:"flex",gap:10}}>
      <button onClick={prev} disabled={cur===0}
        style={{padding:"12px 16px",border:"1.5px solid #e2e8f0",borderRadius:8,background:"#fff",cursor:cur===0?"not-allowed":"pointer",opacity:cur===0?0.4:1,display:"flex",alignItems:"center",gap:6,fontSize:13,color:"#334155"}}>
        <ChevronLeft size={16}/> Sebelumnya
      </button>
      {cur<QUESTIONS.length-1?(
        <button onClick={next} disabled={!sel}
          style={{flex:1,padding:"12px",border:"none",borderRadius:8,background:sel?"#0f766e":"#e2e8f0",color:sel?"#fff":"#94a3b8",cursor:sel?"pointer":"not-allowed",display:"flex",alignItems:"center",justifyContent:"center",gap:6,fontSize:13,fontWeight:600}}>
          Lanjut <ChevronRight size={16}/>
        </button>
      ):(
        <button onClick={()=>onComplete(answers)} disabled={total<QUESTIONS.length}
          style={{flex:1,padding:"12px",border:"none",borderRadius:8,background:total>=QUESTIONS.length?"#0f766e":"#e2e8f0",color:total>=QUESTIONS.length?"#fff":"#94a3b8",cursor:total>=QUESTIONS.length?"pointer":"not-allowed",display:"flex",alignItems:"center",justifyContent:"center",gap:6,fontSize:13,fontWeight:700}}>
          Submit Tes ({total}/{QUESTIONS.length}) <ArrowRight size={16}/>
        </button>
      )}
    </div>
  </div>;
}

/* ════════════════════════ SCREEN 5: SUBMITTING ═══ */
function SubmittingScreen({onDone}) {
  const [step,setStep]=useState(0);
  const steps=[
    {label:"Memuat jawaban dari database",ref:"test_responses"},
    {label:"Menjalankan algoritma scoring MBTI",ref:"lib/scoring/mbti.ts"},
    {label:"Menyimpan hasil ke database",ref:"test_results"},
    {label:"Mengirim ringkasan via WhatsApp",ref:"notification_logs"},
  ];
  useEffect(()=>{
    const ts=[800,1400,1000,900];let s=0;
    const run=()=>{if(s<steps.length){setStep(s+1);s++;setTimeout(run,ts[s]||800);}else{setTimeout(onDone,400);}};
    setTimeout(run,500);
  },[]);
  return <div style={{display:"flex",flexDirection:"column",alignItems:"center",padding:"28px 0",gap:20}}>
    <div style={{width:60,height:60,borderRadius:"50%",background:"#f0fdfa",border:"2px solid #0f766e",display:"flex",alignItems:"center",justifyContent:"center"}}>
      {step<steps.length?<Loader2 size={28} color="#0f766e" style={{animation:"spin 1s linear infinite"}}/>:<CheckCircle2 size={28} color="#0f766e"/>}
    </div>
    <div style={{textAlign:"center"}}>
      <p style={{fontWeight:700,fontSize:15,color:"#0f172a",margin:"0 0 4px"}}>Menghitung hasil Anda...</p>
      <p style={{fontSize:12,color:"#64748b",margin:0}}>Upstash Workflow — 4 langkah (TRD §8 step 4)</p>
    </div>
    <div style={{width:"100%",display:"flex",flexDirection:"column",gap:10}}>
      {steps.map((s,i)=>{
        const done=step>i,active=step===i;
        return <div key={i} style={{display:"flex",alignItems:"center",gap:12,padding:"12px 14px",borderRadius:8,background:done?"#f0fdfa":active?"#fffbeb":"#f8fafc",border:`1px solid ${done?"#99f6e4":active?"#fde68a":"#e2e8f0"}`}}>
          <div style={{width:22,height:22,borderRadius:"50%",background:done?"#0f766e":active?"#f59e0b":"#e2e8f0",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
            {done?<CheckCircle2 size={13} color="#fff"/>:active?<Loader2 size={12} color="#fff" style={{animation:"spin 1s linear infinite"}}/>:<span style={{fontSize:11,color:"#94a3b8",fontWeight:700}}>{i+1}</span>}
          </div>
          <div style={{flex:1}}>
            <p style={{fontSize:12,fontWeight:500,color:done?"#0f766e":active?"#78350f":"#94a3b8",margin:"0 0 2px"}}>{s.label}</p>
            <span style={{fontSize:10,fontFamily:"monospace",color:done?"#0f766e":"#94a3b8"}}>{s.ref}</span>
          </div>
        </div>;
      })}
    </div>
  </div>;
}

/* ═════════════════════════ SCREEN 6: RESULT ══════ */
function ResultScreen({type,scores}) {
  const m=MBTI[type]||MBTI.INTJ;
  const [tab,setTab]=useState("deskripsi");
  const [copied,setCopied]=useState(false);
  const [showWA,setShowWA]=useState(false);
  const waMsg=buildWA(type,scores,SESSION.customer_name);
  function copy(){setCopied(true);setTimeout(()=>setCopied(false),2000);}

  return <div>
    <div style={{background:`${m.col}15`,border:`1.5px solid ${m.col}40`,borderRadius:14,padding:"20px 18px",marginBottom:20,textAlign:"center"}}>
      <div style={{fontSize:11,color:"#64748b",marginBottom:6}}>Hasil Tes MBTI · {SESSION.customer_name}</div>
      <div style={{fontSize:54,fontWeight:800,color:m.col,fontFamily:"'Space Grotesk',sans-serif",letterSpacing:-2,lineHeight:1,marginBottom:4}}>{type}</div>
      <div style={{fontSize:16,fontWeight:700,color:"#0f172a",marginBottom:2}}>{m.label}</div>
      <div style={{fontSize:13,color:"#64748b",marginBottom:10}}>{m.id}</div>
      <div style={{background:"#fff",borderRadius:8,padding:"8px 14px",display:"inline-block",fontSize:13,color:"#334155",fontStyle:"italic",lineHeight:1.5}}>"{m.tag}"</div>
    </div>

    <div style={{marginBottom:20}}>
      <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:10}}>
        <BarChart2 size={15} color="#0f766e"/>
        <span style={{fontSize:13,fontWeight:600,color:"#0f172a"}}>Dimensi Kepribadian</span>
        <DBBadge table="test_results" op="READ"/>
      </div>
      <div style={{background:"#f8fafc",border:"1px solid #e2e8f0",borderRadius:10,padding:"16px 14px"}}>
        <DimensionBar left="E" right="I" scoreL={scores.E} scoreR={scores.I}/>
        <DimensionBar left="S" right="N" scoreL={scores.S} scoreR={scores.N}/>
        <DimensionBar left="T" right="F" scoreL={scores.T} scoreR={scores.F}/>
        <DimensionBar left="J" right="P" scoreL={scores.J} scoreR={scores.P}/>
      </div>
    </div>

    <div style={{marginBottom:20}}>
      <div style={{display:"flex",borderBottom:"2px solid #e2e8f0",marginBottom:14}}>
        {["deskripsi","kekuatan","karier"].map((t)=>(
          <button key={t} onClick={()=>setTab(t)}
            style={{flex:1,padding:"10px 0",border:"none",background:"none",fontWeight:tab===t?700:400,color:tab===t?"#0f766e":"#64748b",borderBottom:tab===t?"2px solid #0f766e":"2px solid transparent",marginBottom:-2,cursor:"pointer",fontSize:13,textTransform:"capitalize"}}>
            {t.charAt(0).toUpperCase()+t.slice(1)}
          </button>
        ))}
      </div>
      {tab==="deskripsi"&&<p style={{fontSize:13,color:"#334155",lineHeight:1.8,margin:0}}>{m.desc}</p>}
      {tab==="kekuatan"&&<div>
        <div style={{marginBottom:14}}>
          {m.strengths.map((s,i)=><div key={i} style={{display:"flex",gap:8,marginBottom:8}}>
            <Star size={14} color="#0f766e" style={{flexShrink:0,marginTop:2}}/><span style={{fontSize:13,color:"#334155"}}>{s}</span>
          </div>)}
        </div>
        <div style={{borderTop:"1px dashed #e2e8f0",paddingTop:12}}>
          <p style={{fontSize:12,fontWeight:600,color:"#f59e0b",marginBottom:8,display:"flex",alignItems:"center",gap:6}}><Zap size={13}/>Area Pengembangan</p>
          {m.challenges.map((c,i)=><div key={i} style={{display:"flex",gap:8,marginBottom:8}}>
            <AlertCircle size={14} color="#f59e0b" style={{flexShrink:0,marginTop:2}}/><span style={{fontSize:13,color:"#334155"}}>{c}</span>
          </div>)}
        </div>
      </div>}
      {tab==="karier"&&<div style={{display:"flex",flexWrap:"wrap",gap:8}}>
        {m.careers.map((c,i)=><span key={i} style={{padding:"6px 12px",background:"#f0fdfa",border:"1px solid #99f6e4",borderRadius:20,fontSize:12,color:"#0f766e",fontWeight:500}}><Briefcase size={11} style={{marginRight:4}}/>{c}</span>)}
      </div>}
    </div>

    <div style={{background:"#f0fdfa",border:"1.5px solid #99f6e4",borderRadius:12,padding:"14px 16px",marginBottom:14}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
        <div style={{display:"flex",alignItems:"center",gap:6}}>
          <ExternalLink size={13} color="#0f766e"/>
          <span style={{fontSize:12,fontWeight:600,color:"#0f172a"}}>Link Hasil Permanen</span>
        </div>
        <TokenBadge status="completed"/>
      </div>
      <div style={{display:"flex",gap:8,alignItems:"center"}}>
        <code style={{flex:1,fontSize:11,color:"#064e3b",background:"#fff",padding:"6px 10px",borderRadius:6,border:"1px solid #99f6e4",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>theaim.id/hasil/{SESSION.result_token.slice(0,18)}...</code>
        <button onClick={copy} style={{padding:"6px 10px",border:"1px solid #99f6e4",borderRadius:6,background:"#fff",cursor:"pointer",display:"flex",alignItems:"center",gap:4,fontSize:11,color:"#0f766e",fontWeight:600}}>
          {copied?<><Check size={12}/>Disalin</>:<><Copy size={12}/>Salin</>}
        </button>
      </div>
      <p style={{fontSize:11,color:"#064e3b",margin:"6px 0 0",opacity:0.8}}>result_token tidak pernah kadaluarsa. Bisa dibuka kapan saja dari perangkat apapun.</p>
    </div>

    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:14}}>
      <button onClick={()=>setShowWA(!showWA)} style={{padding:"11px 0",border:"1.5px solid #22c55e",borderRadius:8,background:showWA?"#f0fdf4":"#fff",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:6,fontSize:12,fontWeight:600,color:"#16a34a"}}>
        <MessageCircle size={14}/>Preview WA
      </button>
      <button onClick={()=>alert("Gunakan Ctrl+P atau menu browser.\n\nHalaman hasil memiliki @media print CSS untuk layout A4 (TRD §11).")}
        style={{padding:"11px 0",border:"1.5px solid #e2e8f0",borderRadius:8,background:"#fff",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:6,fontSize:12,fontWeight:600,color:"#334155"}}>
        <Printer size={14}/>Simpan PDF
      </button>
    </div>

    {showWA&&<div style={{marginBottom:14}}>
      <div style={{background:"#075e54",padding:"10px 14px",borderRadius:"10px 10px 0 0",display:"flex",alignItems:"center",gap:8}}>
        <MessageCircle size={15} color="#fff"/>
        <span style={{color:"#fff",fontSize:12,fontWeight:600}}>WhatsApp — Tim TheAIM</span>
        <span style={{fontSize:10,color:"#8ed8d0",marginLeft:"auto"}}>notification_logs</span>
      </div>
      <div style={{background:"#ece5dd",padding:14,borderRadius:"0 0 10px 10px"}}>
        <div style={{maxWidth:"85%",background:"#dcf8c6",borderRadius:"0 8px 8px 8px",padding:"10px 12px"}}>
          <pre style={{fontSize:11,color:"#111b21",margin:0,whiteSpace:"pre-wrap",lineHeight:1.6,fontFamily:"'Segoe UI',sans-serif"}}>{waMsg}</pre>
          <div style={{textAlign:"right",fontSize:10,color:"#667781",marginTop:6}}>
            08:42 <CheckCircle2 size={10} color="#53bdeb" style={{display:"inline",marginLeft:2}}/>
          </div>
        </div>
      </div>
    </div>}

    <div style={{background:"#0f766e",borderRadius:12,padding:"16px 18px",textAlign:"center"}}>
      <p style={{color:"#fff",fontWeight:700,fontSize:14,margin:"0 0 4px"}}>Ingin memahami hasil tes lebih dalam?</p>
      <p style={{color:"#ccfbf1",fontSize:12,margin:"0 0 12px"}}>Konsultasi 1-on-1 dengan Psikolog Klinis TheAIM</p>
      <button style={{padding:"9px 22px",background:"#fff",color:"#0f766e",border:"none",borderRadius:8,fontWeight:700,fontSize:13,cursor:"pointer"}}>Daftar Konsultasi</button>
    </div>
  </div>;
}

/* ══════════════════════ EDGE CASE SCREENS ════════ */
function TokenExpiredScreen(){
  return <div style={{display:"flex",flexDirection:"column",alignItems:"center",padding:"32px 0",textAlign:"center",gap:14}}>
    <Clock size={40} color="#94a3b8"/>
    <h3 style={{fontWeight:700,color:"#0f172a",marginBottom:4}}>Token Kadaluarsa</h3>
    <p style={{fontSize:13,color:"#64748b",margin:0}}>Link ini sudah melewati masa berlaku 30 hari.</p>
    <p style={{fontSize:13,color:"#64748b",margin:0}}>Hubungi Admin TheAIM untuk memperbarui token.</p>
    <DBBadge table="test_sessions" op="UPDATE status='expired'"/>
    <div style={{background:"#f1f5f9",borderRadius:8,padding:"10px 14px",width:"100%"}}>
      <p style={{fontSize:11,fontFamily:"monospace",color:"#64748b",margin:0}}>expires_at &lt; NOW() → status = 'expired'</p>
    </div>
  </div>;
}
function TokenRevokedScreen(){
  return <div style={{display:"flex",flexDirection:"column",alignItems:"center",padding:"32px 0",textAlign:"center",gap:14}}>
    <XCircle size={40} color="#ec4899"/>
    <h3 style={{fontWeight:700,color:"#0f172a",marginBottom:4}}>Token Tidak Valid</h3>
    <p style={{fontSize:13,color:"#64748b",margin:0}}>Link ini telah dibatalkan oleh admin.</p>
    <p style={{fontSize:13,color:"#64748b",margin:0}}>Kemungkinan: tes dipesan ulang atau ada masalah teknis.</p>
    <DBBadge table="test_sessions" op="status='revoked' → 404"/>
    <div style={{background:"#fdf2f8",borderRadius:8,padding:"10px 14px",width:"100%"}}>
      <p style={{fontSize:11,fontFamily:"monospace",color:"#9d174d",margin:0}}>TRD §15: status='revoked' → notFound() // jangan expose</p>
    </div>
  </div>;
}
function TokenCompletedScreen({onGoToResult}){
  return <div style={{display:"flex",flexDirection:"column",alignItems:"center",padding:"32px 0",textAlign:"center",gap:14}}>
    <CheckCircle2 size={40} color="#10b981"/>
    <h3 style={{fontWeight:700,color:"#0f172a",marginBottom:4}}>Tes Sudah Selesai</h3>
    <p style={{fontSize:13,color:"#64748b",margin:0}}>Tes ini sudah pernah diselesaikan sebelumnya.</p>
    <p style={{fontSize:13,color:"#64748b",margin:0}}>Token hangus setelah satu kali penggunaan.</p>
    <DBBadge table="test_sessions" op="status='completed' → redirect"/>
    <button onClick={onGoToResult} style={{padding:"12px 24px",background:"#0f766e",color:"#fff",border:"none",borderRadius:10,fontWeight:700,fontSize:14,cursor:"pointer",display:"flex",alignItems:"center",gap:8}}>
      <ExternalLink size={16}/>Lihat Hasil di /hasil/[result_token]
    </button>
    <p style={{fontSize:11,fontFamily:"monospace",color:"#64748b"}}>TRD §15: redirect(`/hasil/${"{session.result_token}"}`)</p>
  </div>;
}

/* ═══════════════════════════ MAIN APP ════════════ */
export default function TheAIMTestSimulator() {
  const [view,setView]=useState("full");
  const [screen,setScreen]=useState("validating");
  const [edgeCase,setEdgeCase]=useState(null);
  const [resultData,setResultData]=useState(null);
  const [previewType,setPreviewType]=useState("INTJ");
  const defaultScores={E:4,I:8,S:3,N:9,T:7,F:5,J:8,P:4};

  useEffect(()=>{
    if(view==="full"&&screen==="validating"&&!edgeCase){
      const t=setTimeout(()=>setScreen("confirming"),2200);
      return()=>clearTimeout(t);
    }
  },[view,screen,edgeCase]);

  function handleConfirmSuccess(){setScreen("welcome");}
  function handleTestComplete(answers){
    setScreen("submitting");
    setTimeout(()=>{setResultData(computeMBTI(answers));},4200);
  }
  function handleSubmitDone(){if(resultData)setScreen("result");}
  function reset(){setResultData(null);setEdgeCase(null);setScreen("validating");}

  const SCREEN_LABEL={validating:"Verifikasi Token",confirming:"Verifikasi Identitas",welcome:"Selamat Datang",testing:"Mengerjakan Tes",submitting:"Memproses Hasil",result:"Halaman Hasil"};
  const TOKEN_STATUS={validating:"issued",confirming:"issued",welcome:"confirming",testing:"in_progress",submitting:"in_progress",result:"completed"};

  return (
    <div style={{fontFamily:"'Inter',system-ui,sans-serif",maxWidth:560,margin:"0 auto",paddingBottom:40}}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@700;800&family=Inter:wght@400;500;600;700&display=swap');
        *{box-sizing:border-box;} button,input{font-family:inherit;}
        @keyframes spin{from{transform:rotate(0deg);}to{transform:rotate(360deg);}}
      `}</style>

      {/* ── Top bar ── */}
      <div style={{background:"#0f766e",padding:"11px 16px",borderRadius:"12px 12px 0 0",display:"flex",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap",gap:8}}>
        <TheAIMLogo size={14}/>
        <div style={{display:"flex",gap:5}}>
          {[["full","Simulasi"],["test","Tes Saja"],["result","Hasil Saja"]].map(([v,l])=>(
            <button key={v} onClick={()=>{setView(v);if(v==="full")reset();}} style={{padding:"5px 11px",border:"none",borderRadius:6,background:view===v?"#fff":"transparent",color:view===v?"#0f766e":"#ccfbf1",fontWeight:view===v?700:400,fontSize:11,cursor:"pointer"}}>
              {l}
            </button>
          ))}
        </div>
      </div>

      {/* ── Edge case demo bar (full sim only) ── */}
      {view==="full"&&(
        <div style={{background:"#1e293b",padding:"8px 14px",display:"flex",alignItems:"center",gap:8,flexWrap:"wrap"}}>
          <span style={{fontSize:10,color:"#94a3b8",fontWeight:600,fontFamily:"monospace"}}>Demo edge case:</span>
          {[
            {key:"expired",label:"Token Expired",col:"#94a3b8"},
            {key:"revoked",label:"Token Revoked",col:"#ec4899"},
            {key:"completed",label:"Token Completed",col:"#10b981"},
          ].map(ec=>(
            <button key={ec.key} onClick={()=>setEdgeCase(edgeCase===ec.key?null:ec.key)}
              style={{padding:"3px 9px",border:`1px solid ${edgeCase===ec.key?ec.col:"#334155"}`,borderRadius:4,background:edgeCase===ec.key?"#0f172a":"transparent",color:edgeCase===ec.key?ec.col:"#64748b",fontSize:10,cursor:"pointer",fontFamily:"monospace"}}>
              {ec.label}
            </button>
          ))}
          {edgeCase&&<button onClick={()=>setEdgeCase(null)} style={{fontSize:10,color:"#64748b",background:"transparent",border:"none",cursor:"pointer",marginLeft:"auto"}}>× Clear</button>}
        </div>
      )}

      {/* ── Main content ── */}
      <div style={{background:"#fff",border:"1px solid #e2e8f0",borderTop:"none",borderRadius:edgeCase||view!=="full"?"0 0 12px 12px":"0",padding:"16px 16px 20px",boxShadow:"0 2px 12px rgba(0,0,0,0.06)"}}>

        {/* Status bar (full sim, no edge case) */}
        {view==="full"&&!edgeCase&&(
          <div style={{display:"flex",alignItems:"center",gap:8,padding:"7px 10px",background:"#f8fafc",borderRadius:8,marginBottom:16}}>
            <span style={{fontSize:11,color:"#64748b"}}>Layar:</span>
            <span style={{fontSize:11,fontWeight:600,color:"#0f766e"}}>{SCREEN_LABEL[screen]}</span>
            <div style={{marginLeft:"auto",display:"flex",gap:8,alignItems:"center"}}>
              <TokenBadge status={TOKEN_STATUS[screen]}/>
              {screen!=="validating"&&(
                <button onClick={reset} style={{padding:"3px 8px",border:"1px solid #e2e8f0",borderRadius:4,background:"#fff",cursor:"pointer",fontSize:10,color:"#64748b",display:"flex",alignItems:"center",gap:3}}>
                  <RefreshCw size={10}/>Reset
                </button>
              )}
            </div>
          </div>
        )}

        {/* ── Full simulation ── */}
        {view==="full"&&(
          edgeCase==="expired" ? <TokenExpiredScreen/> :
          edgeCase==="revoked" ? <TokenRevokedScreen/> :
          edgeCase==="completed" ? <TokenCompletedScreen onGoToResult={()=>{setEdgeCase(null);setScreen("result");setResultData({type:"INTJ",scores:defaultScores});}} /> :
          screen==="validating" ? <ValidatingScreen/> :
          screen==="confirming" ? <ConfirmationScreen onSuccess={handleConfirmSuccess}/> :
          screen==="welcome"    ? <WelcomeScreen onStart={()=>setScreen("testing")}/> :
          screen==="testing"    ? <TestingScreen onComplete={handleTestComplete}/> :
          screen==="submitting" ? <SubmittingScreen onDone={handleSubmitDone}/> :
          screen==="result"&&resultData ? <ResultScreen type={resultData.type} scores={resultData.scores}/> : null
        )}

        {/* ── Test only ── */}
        {view==="test"&&(
          <div>
            <div style={{padding:"7px 10px",background:"#f8fafc",borderRadius:8,marginBottom:14,fontSize:11,color:"#64748b"}}>
              Preview langsung ke halaman tes (melewati validasi token & konfirmasi identitas)
            </div>
            <TestingScreen onComplete={(ans)=>{const r=computeMBTI(ans);setResultData(r);setView("result");}}/>
          </div>
        )}

        {/* ── Result only ── */}
        {view==="result"&&(
          <div>
            <div style={{display:"flex",gap:8,alignItems:"center",marginBottom:14,flexWrap:"wrap"}}>
              <span style={{fontSize:11,color:"#64748b"}}>Preview tipe:</span>
              <select value={resultData?resultData.type:previewType} onChange={e=>{setPreviewType(e.target.value);setResultData(null);}}
                style={{fontSize:12,padding:"4px 8px",borderRadius:6,border:"1px solid #e2e8f0",fontFamily:"'Space Grotesk',sans-serif",fontWeight:700,color:"#0f766e"}}>
                {Object.keys(MBTI).map(t=><option key={t} value={t}>{t} — {MBTI[t].label}</option>)}
              </select>
              {resultData&&<span style={{fontSize:11,color:"#0f766e",background:"#f0fdfa",padding:"2px 8px",borderRadius:4}}>Hasil simulasi Anda: {resultData.type}</span>}
            </div>
            <ResultScreen type={resultData?resultData.type:previewType} scores={resultData?resultData.scores:defaultScores}/>
          </div>
        )}
      </div>

      {/* ── ERD reference footer ── */}
      <div style={{marginTop:8,padding:"7px 12px",background:"#f8fafc",borderRadius:8,border:"1px solid #e2e8f0"}}>
        <div style={{display:"flex",flexWrap:"wrap",gap:5,alignItems:"center"}}>
          <span style={{fontSize:10,color:"#94a3b8",fontWeight:600}}>ERD §10:</span>
          {["test_sessions (confirm_attempts, locked)","test_items","test_responses","test_results","notification_logs"].map(t=>(
            <DBBadge key={t} table={t}/>
          ))}
        </div>
      </div>
    </div>
  );
}
