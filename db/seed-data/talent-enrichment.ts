// Fields present in the Talents Mapping guide (v2.0.0) and not loaded in the first catalog seed.
// Theme ciri utama and suitable roles: section "Detail 34 Tema Bakat".
// Activity clusters: only the 14 activities named with a cluster in section 11.2 (repeated in the API example). The other 100 activities have no cluster in the guide.
// Typology category: only the five codes in the section 12.4 JSON example.
// Personal branding: the five paragraphs in section 9. Section 12.4 has slightly longer variants of the same five; those variants are not stored.
// strengths and watch_out are columns on talent_themes. The guide labels neither field on the 34 theme sections. The single SIG JSON sketch is an API example, not the theme section, and is not copied.
// Tips Manajemen exists for all 34 themes and is not stored: talent_themes has no tips column, and it is not the watch_out field.

export const THEME_DETAIL_SEEDS: Record<string, { ciriUtama: string[]; suitableRoles: string[] }> = {
  "ACH": {
    "ciriUtama": [
      "Stamina tinggi, selalu bekerja keras",
      "Tidak pernah puas dengan hasil saat ini, selalu menetapkan target lebih tinggi",
      "Kepuasan hidup berasal dari kesibukan dan keberhasilan",
      "Semangat membara untuk meraih sukses lebih banyak"
    ],
    "suitableRoles": [
      "Tenaga Penjual/Sales",
      "Teknisi Proyek",
      "Teknisi Lapangan",
      "Pekerja Lapangan",
      "Relawan",
      "Petugas SAR"
    ]
  },
  "ACT": {
    "ciriUtama": [
      "Mengubah pikiran menjadi tindakan",
      "Tidak sabar untuk segera bertindak (\"Kapan saya bisa mulai?\")",
      "Berani bertindak meski informasi tidak memadai",
      "Menganggap kesalahan sebagai proses belajar"
    ],
    "suitableRoles": [
      "Entrepreneur",
      "Sales",
      "Pemimpin perubahan/transformasi",
      "Startup"
    ]
  },
  "ADA": {
    "ciriUtama": [
      "Menyesuaikan diri dengan perubahan tidak terencana",
      "Hidup sesuai situasi saat ini",
      "Perubahan adalah teman, bukan musuh"
    ],
    "suitableRoles": [
      "Wartawan",
      "Perawat Gawat Darurat",
      "Customer Service",
      "Pemadam Kebakaran"
    ]
  },
  "ANA": {
    "ciriUtama": [
      "Mencari alasan dan sebab-musabab",
      "Tidak menerima rumor, hanya fakta yang dapat diterima",
      "Selalu membutuhkan bukti (\"Tunjukkan pada saya bahwa itu benar!\")"
    ],
    "suitableRoles": [
      "Analis",
      "Periset (pemasaran/keuangan/kesehatan)",
      "Database Management",
      "Editor",
      "Manajemen Risiko",
      "Accounting",
      "Programmer"
    ]
  },
  "ARR": {
    "ciriUtama": [
      "Mengorganisir dengan fleksibilitas tinggi",
      "Slogan: \"Pasti ada jalan yang lebih baik!\"",
      "Senang mengatur konfigurasi paling produktif",
      "Seorang koordinator handal dalam situasi kompleks"
    ],
    "suitableRoles": [
      "Supervisor",
      "Manajer",
      "Event Organizer",
      "Programmer"
    ]
  },
  "BEL": {
    "ciriUtama": [
      "Memiliki nilai-nilai luhur yang tidak pernah berubah",
      "Senang melayani orang lain dengan tulus sebagai perbuatan mulia",
      "Komitmen keluarga sangat bernilai",
      "Sukses bukan hanya uang dan prestise, tapi pengorbanan untuk orang lain"
    ],
    "suitableRoles": [
      "Pelayanan Pelanggan",
      "CRM",
      "Maintenance",
      "Perawat",
      "Pekerja Sosial",
      "Relawan"
    ]
  },
  "CMD": {
    "ciriUtama": [
      "Senang menjadi penanggung jawab",
      "Berani mengambil alih situasi",
      "Berani bertatap muka langsung menghadapi masalah",
      "Mengungkapkan fakta dan kebenaran meski tidak menyenangkan"
    ],
    "suitableRoles": [
      "Sales",
      "Negosiator",
      "Wartawan",
      "Pengacara",
      "Komandan",
      "HRD",
      "Pembelian"
    ]
  },
  "COM": {
    "ciriUtama": [
      "Mudah mengungkapkan pikiran melalui kata-kata/tulisan",
      "Membuat topik sederhana menjadi menarik",
      "Senang menjelaskan, bercerita, berbicara di depan umum, dan menulis"
    ],
    "suitableRoles": [
      "Pengajar",
      "Sales",
      "Marketing",
      "Humas",
      "Juru Bicara",
      "Presenter",
      "MC",
      "Pengacara",
      "Layanan Pelanggan",
      "Penulis"
    ]
  },
  "CMP": {
    "ciriUtama": [
      "Menjadikan segalanya kompetisi",
      "Selalu berusaha menjadi nomor satu",
      "Mencapai target tanpa mengalahkan orang lain terasa kemenangan kosong"
    ],
    "suitableRoles": [
      "Sales",
      "Pelatih Olahraga"
    ]
  },
  "CON": {
    "ciriUtama": [
      "Mengaitkan peristiwa satu dengan lainnya",
      "Percaya setiap kejadian ada sebabnya, bukan kebetulan",
      "Penuh pertimbangan, penuh perhatian, mudah menerima"
    ],
    "suitableRoles": [
      "Pendengar & Pemberi Saran/Counselor",
      "Leader membangun tim lintas kelompok"
    ]
  },
  "CST": {
    "ciriUtama": [
      "Memperlakukan semua orang secara sama dan adil",
      "Selalu berusaha mencari keseimbangan",
      "Tidak berat sebelah"
    ],
    "suitableRoles": [
      "Hakim",
      "Quantity Surveyor",
      "Petugas Commissioning",
      "Petugas Kontrol Kepatuhan"
    ]
  },
  "CTX": {
    "ciriUtama": [
      "Memahami masa kini melalui studi masa lalu",
      "Masa lalu adalah cetak biru dari sebab dan akibat",
      "\"Memandang ke belakang untuk memahami masa sekarang\""
    ],
    "suitableRoles": [
      "Guru Sejarah",
      "Arkeolog",
      "Penyusun Budaya Perusahaan",
      "Hakim"
    ]
  },
  "DEL": {
    "ciriUtama": [
      "Berhati-hati, kadang skeptis",
      "Melihat sebelum melompat",
      "Memilih sahabat dengan hati-hati"
    ],
    "suitableRoles": [
      "Pilot",
      "Advisor",
      "Urusan Legal",
      "Kontrak Bisnis",
      "Kepatuhan Peraturan",
      "Keuangan",
      "Keamanan"
    ]
  },
  "DEV": {
    "ciriUtama": [
      "Mengenali dan menggali potensi orang lain",
      "Senang membantu orang mencapai kesuksesan",
      "Mendapat kepuasan dari setiap kemajuan individu"
    ],
    "suitableRoles": [
      "Manajer",
      "Guru",
      "Pelatih",
      "Pembimbing",
      "Petugas Sosial"
    ]
  },
  "DIS": {
    "ciriUtama": [
      "Senang kondisi teratur, terstruktur, terencana",
      "Dunia harus dapat diperkirakan dan terencana",
      "Fokus pada jadwal dan batas waktu"
    ],
    "suitableRoles": [
      "Keuangan",
      "Sekretaris",
      "Administrasi",
      "Petugas ISO",
      "Kearsipan",
      "Accounting",
      "MIS",
      "Programmer"
    ]
  },
  "EMP": {
    "ciriUtama": [
      "Mampu merasakan perasaan orang lain seakan mengalaminya sendiri",
      "Dapat mendengarkan pertanyaan yang tidak terungkap",
      "Mengantisipasi kebutuhan orang lain"
    ],
    "suitableRoles": [
      "Sales",
      "HRD",
      "Guru TK",
      "Perawat",
      "Operator Telepon",
      "Psikiater",
      "Dispatcher",
      "Layanan Pelanggan"
    ]
  },
  "FOC": {
    "ciriUtama": [
      "Membutuhkan tujuan yang jelas sebagai kompas",
      "Membuat goals setiap tahun, bulan, minggu",
      "Menjaga semua tetap pada tujuannya"
    ],
    "suitableRoles": [
      "Project Officer",
      "Team Leader",
      "tugas yang memerlukan fokus tinggi"
    ]
  },
  "FUT": {
    "ciriUtama": [
      "Senang berangan-angan masa depan secara detail",
      "Memberi inspirasi lewat visinya",
      "Seorang pemimpi/visioner dengan banyak skenario masa depan"
    ],
    "suitableRoles": [
      "Entrepreneur",
      "Perencana Jangka Panjang",
      "Visioner",
      "Pengembang Produk Baru"
    ]
  },
  "HAR": {
    "ciriUtama": [
      "Bekerja sama dengan baik, tidak suka konflik",
      "Mencari kesamaan dari perbedaan pendapat",
      "Menganggap konflik tidak produktif"
    ],
    "suitableRoles": [
      "Pembangun Jaringan Lintas Pandang",
      "Juru Damai",
      "Penasihat"
    ]
  },
  "IDE": {
    "ciriUtama": [
      "Menyukai diskusi bebas dan brainstorming",
      "Menemukan benang merah dari dua fenomena yang berbeda",
      "Tergila-gila dengan ide (\"Ide adalah konsep, penjelasan terbaik tentang berbagai kejadian\")"
    ],
    "suitableRoles": [
      "Marketing",
      "Advertising",
      "Wartawan",
      "Perancang/Pengembang Produk Baru"
    ]
  },
  "INC": {
    "ciriUtama": [
      "Menerima semua orang, memastikan semua merasa memiliki dalam kelompok",
      "Filosofi: \"Memperbesar kelompok\"",
      "\"Kita semua sama-sama penting\""
    ],
    "suitableRoles": [
      "Motivator Kelompok",
      "Wakil Suara Minoritas",
      "Pemimpin Multikultural",
      "Mentor untuk Anggota Baru"
    ]
  },
  "IND": {
    "ciriUtama": [
      "Melihat keunikan masing-masing orang",
      "Mengamati gaya, motivasi, cara berpikir, dan cara membina hubungan",
      "Memikirkan cara orang berbeda bekerja sama secara produktif"
    ],
    "suitableRoles": [
      "Manajer",
      "Penasihat",
      "Rekrutmen",
      "Supervisor",
      "Pengajar",
      "Penulis",
      "Sales",
      "Novelis",
      "HRD"
    ]
  },
  "INP": {
    "ciriUtama": [
      "Hasrat mengetahui lebih jauh dan mengumpulkan informasi",
      "Senang mengarsip segala macam informasi/benda",
      "Memiliki pemikiran yang mudah menemukan hal menarik di dunia"
    ],
    "suitableRoles": [
      "Pengajar",
      "Periset",
      "Wartawan",
      "Estimator",
      "Petugas Arsip"
    ]
  },
  "INT": {
    "ciriUtama": [
      "Senang berpikir, mawas diri, dan diskusi intelektual",
      "Pemikir dalam, menikmati waktu menyendiri untuk merenung",
      "Melatih daya pikir ke berbagai arah"
    ],
    "suitableRoles": [
      "Filsuf",
      "Peneliti",
      "Studi Filosofi/Sastra/Psikologi"
    ]
  },
  "LRN": {
    "ciriUtama": [
      "Senang mempelajari sesuatu, tertarik pada proses belajar itu sendiri",
      "Gairah tinggi untuk belajar dan terus berkembang",
      "Materi bisa apa saja, yang penting proses belajarnya"
    ],
    "suitableRoles": [
      "Konsultan (internal/eksternal)",
      "Teknisi IT",
      "Programmer",
      "Guru",
      "Katalisator Perubahan"
    ]
  },
  "MAX": {
    "ciriUtama": [
      "Fokus pada kekuatan yang ada untuk merangsang keunggulan",
      "Mengubah sesuatu yang baik menjadi jauh lebih baik lagi",
      "Mudah terpikat pada kekuatan, baik miliknya maupun milik orang lain"
    ],
    "suitableRoles": [
      "Pelatih",
      "Manajer",
      "Mentor",
      "Guru",
      "Transformational Leader"
    ]
  },
  "POS": {
    "ciriUtama": [
      "Antusiasme tinggi yang menular",
      "Optimisme yang membuat orang bersemangat",
      "Ramah, mudah tersenyum, selalu mencari sisi positif"
    ],
    "suitableRoles": [
      "Pengajar",
      "Entertainer",
      "Motivator",
      "Sales",
      "Manajer",
      "Entrepreneur",
      "Leader"
    ]
  },
  "REL": {
    "ciriUtama": [
      "Menikmati hubungan dekat/erat dengan orang lain",
      "Ingin memahami hal personal tentang orang lain (impian, hasrat, ketakutan)",
      "Merasa nyaman dalam hubungan akrab"
    ],
    "suitableRoles": [
      "Account Sales",
      "Katalisator Kepercayaan"
    ]
  },
  "RES": {
    "ciriUtama": [
      "Rasa tanggung jawab tinggi atas komitmen yang dibuat",
      "Terikat secara emosional/psikologis untuk memenuhi komitmen hingga selesai",
      "Memiliki kejujuran dan kesetiaan tinggi"
    ],
    "suitableRoles": [
      "Account Sales",
      "HSE",
      "Manajer",
      "Keuangan",
      "Quality Control",
      "Keamanan"
    ]
  },
  "RST": {
    "ciriUtama": [
      "Senang memecahkan masalah",
      "Pandai mengetahui sesuatu yang salah dan memperbaikinya",
      "Menikmati tantangan mengidentifikasi masalah dan menemukan solusi"
    ],
    "suitableRoles": [
      "Pengobatan",
      "Konsultan Perusahaan",
      "Customer Service",
      "Teknisi Perbaikan",
      "Terapis",
      "BPR"
    ]
  },
  "SAU": {
    "ciriUtama": [
      "Kepercayaan diri tinggi dalam mengatur hidupnya",
      "Inner compass / intuisi kuat dalam membuat keputusan",
      "Mampu mengambil risiko dan menghadapi tantangan baru"
    ],
    "suitableRoles": [
      "Leader",
      "Sales",
      "Legal",
      "Entrepreneur"
    ]
  },
  "SIG": {
    "ciriUtama": [
      "Senang menjadi pusat perhatian, dikenal, diakui, dihargai",
      "Ingin dikagumi sebagai pribadi berkredibilitas, profesional, sukses",
      "Sangat independen"
    ],
    "suitableRoles": [
      "Marketing",
      "Presenter",
      "MC",
      "Juru Kampanye",
      "Sales"
    ]
  },
  "STR": {
    "ciriUtama": [
      "Mampu memilah masalah dan menemukan jalan terbaik",
      "Dapat melihat pola dari kekacauan",
      "Mampu menciptakan alternatif pilihan dari suatu permasalahan"
    ],
    "suitableRoles": [
      "Perencana Strategi",
      "Manajer",
      "Leader"
    ]
  },
  "WOO": {
    "ciriUtama": [
      "Senang bertemu orang baru dan menjadi akrab",
      "Tidak pernah malu memulai percakapan",
      "Rasa ingin tahu tinggi terhadap orang asing"
    ],
    "suitableRoles": [
      "Duta Organisasi",
      "Sales",
      "SPG",
      "Juru Kampanye",
      "Entertainer",
      "Operator Telepon",
      "Resepsionis"
    ]
  }
};

export const ACTIVITY_CLUSTER_SEEDS: Record<string, string> = {
  "COMMUNICATING": "Elementary",
  "GREETING": "Networking",
  "MOTIVATING": "Headman",
  "SERVING": "Servicing",
  "SPIRITUALIZING": "Elementary",
  "SUPPORTING": "Servicing",
  "TRAINING": "Headman",
  "ENTERTAINING": "Networking",
  "TEACHING": "Headman",
  "INFLUENCING": "Headman",
  "ADVISING": "Elementary",
  "PRESENTING": "Elementary",
  "SELLING": "Networking",
  "VOLUNTEERING": "Servicing"
};

export const TYPOLOGY_DETAIL_SEEDS: Record<string, { category: string; personalBranding: string }> = {
  "COM": {
    "category": "Interpersonal - Relating",
    "personalBranding": "Seorang yang senang menerangkan sesuatu secara jelas dan menarik, baik lisan maupun tulisan"
  },
  "SER": {
    "category": "Interpersonal - Serving",
    "personalBranding": "Memiliki jiwa pelayanan tinggi, selalu siap membantu, bertanggung jawab, senang berinteraksi"
  },
  "SEL": {
    "category": "Interpersonal - Influencing",
    "personalBranding": "Senang menyapa dan memberikan penjelasan meyakinkan tentang keunggulan produk/jasa"
  },
  "MOT": {
    "category": "Interpersonal - Relating",
    "personalBranding": "Suka membuat orang lain maju sesuai potensi uniknya, dengan cara memberi semangat/inspirasi"
  },
  "EDU": {
    "category": "Interpersonal - Relating",
    "personalBranding": "Sabar dan telaten memberikan penjelasan dan bimbingan sesuai karakteristik unik masing-masing"
  }
};

