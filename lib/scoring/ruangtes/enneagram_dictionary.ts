export interface EnneagramCoreInfo {
  name: string;
  description: string;
  traits: string[];
}

export interface EnneagramWingInfo {
  label: string;
  description: string;
  traits: string[];
}

export const ENNEAGRAM_CORE_TYPES: Record<number, EnneagramCoreInfo> = {
  "1": {
    "name": "Perfeksionis (The Reformer)",
    "description": "Tipe kepribadian ini adalah tipe orang yang sulit menerima dirinya ketika ia melakukan sebuah kesalahan. Tipe perfeksionis ini memiliki standar yang tinggi terhadap sesuatu, kepribadian perfeksionis dimotivasi oleh kebutuhan untuk menjalani hidup dengan benar, sesuai dengan standar yang ia miliki. Ia merasa harus memperbaiki diri serta lingkungan di sekitarnya. Tipe ini adalah orang yang sangat memegang etika serta bisa diandalkan. Mereka merasa akan gagal jika ia tidak bisa mengontrol situasi dimana ia memikul tanggungjawab disitu. Mereka seringkali mendapat kepercayaan untuk menjadi pucuk pimpinan pada sebuah organisasi, sangat produktif dan amat bijaksana. Orang perfeksionis biasanya juga amat idealis ketika memilih sesuatu.",
    "traits": [
      "Memiliki standar tinggi",
      "Idealis",
      "Bijaksana",
      "Produktif",
      "Minim membuat kesalahan",
      "Obsesif kompulsif (kelainan yang ditandai dengan pikiran dan ketakutan tidak masuk akal/obsesi yang dapat menyebabkan perilaku repetitif/kompulsi)."
    ]
  },
  "2": {
    "name": "Penolong (The Helper)",
    "description": "Tipe penolong adalah tipe manusia yang sangat murah hati dan senang memberikan pertolongan kepada orang lain. Namun belum tentu apa yang ia lakukan itu benar-benar tulus ingin menolong — bisa jadi karena merasa tidak enak untuk menolak. Tergerak oleh motivasi terhadap kebutuhan untuk dicintai, dihargai, juga untuk mengekspresikan perasaan positif mereka kepada orang lain. Seorang tipe penolong memiliki sifat mengasihi, perhatian, berwawasan luas, murah hati, antusias, dan amat peka terhadap apa yang orang lain rasakan. Orang dengan tipe ini adalah orang yang amat menyenangkan dan mudah bergaul, pandai membina relasi pertemanan, serta tahu apa yang orang lain butuhkan.",
    "traits": [
      "Murah hati",
      "Suka menolong orang lain",
      "Peka terhadap perasaan orang lain",
      "Sosial",
      "Sedikit Manipulatif (kemampuan memanipulasi berkaitan dengan kecerdasan seseorang; ciri khasnya enggan menerima kenyataan dan mengalihkan kesalahan pada pihak lain)."
    ]
  },
  "3": {
    "name": "Pengejar Prestasi (The Achiever / Motivator / Performer)",
    "description": "Tipe pemburu prestasi adalah tipe kepribadian yang digerakkan oleh kebutuhan untuk menjadi terus produktif. Tipe ini memiliki ambisi besar meraih kesuksesan, sebisa mungkin menghindari kegagalan (terutama terkait pekerjaan), dan secara natural sangat optimis. Ia sangat yakin tidak ada rintangan yang tidak bisa dihancurkan; semua rintangan adalah batu ujian. Terkadang akan melakukan segala cara untuk meraih kesuksesan — kompetitif dan bisa menjadi sangat manipulatif, memperdaya orang lain agar memuluskan jalannya menuju tujuan yang ia rancang.",
    "traits": [
      "Produktif",
      "Ambisius",
      "Optimis",
      "Kompetitif",
      "Senang berbagi",
      "Manipulatif."
    ]
  },
  "4": {
    "name": "Romantis / Artist / Individualist (The Melancholy)",
    "description": "Sering disebut *the individualist* — orang yang tenggelam dalam perasaannya sendiri, mengamini serta memaklumi berbagai hal yang ia alami dalam hidup dengan amat dalam. Melankolis ini seringkali merasa tidak ada yang bisa memahami apa yang ia rasakan; seperti berjalan sendirian. Gemar mencari makna hidup, menghindari citra diri yang datar, dan ingin menjadi seseorang yang tidak biasa/eksentrik — tidak mainstream di lingkungannya. Memiliki hati yang amat halus, sehingga sulit melihat hal-hal yang mengerikan atau tindakan yang amat keji.",
    "traits": [
      "Perasaannya halus",
      "Moody",
      "Dalam",
      "Menyukai seni",
      "Ekspresif",
      "Depresif."
    ]
  },
  "5": {
    "name": "Pengamat / Observer / Thinker (The Investigator)",
    "description": "Seorang yang memiliki rasa ingin tahu yang tinggi, ingin memahami dunia di sekitarnya — ibarat peneliti atau detektif, mencari data dan mengumpulkan cerita untuk menjawab pertanyaan dalam dirinya. Memiliki kepekaan tinggi terhadap lingkungan dan sesamanya; lewat pengamatan yang tajam, bisa menyimpulkan jawaban dari sebuah fenomena tanpa harus banyak bertanya. Sangat analitis dan memiliki tingkat intelektualitas yang tinggi — tepat untuk memetakan permasalahan dan mencari alternatif jawaban yang masuk akal.",
    "traits": [
      "Rasa ingin tahu tinggi",
      "Analitis",
      "Objektif",
      "Problem solver",
      "Keras kepala",
      "Argumentatif",
      "Tidak mau mendengar pendapat orang."
    ]
  },
  "6": {
    "name": "Pencemas (The Sceptic) / Loyalist / Pessimist",
    "description": "Orang yang selalu menginginkan rasa aman dalam hidupnya; sering merasa cemas karena tidak bisa mengontrol segala hal yang mungkin terjadi. Sulit memasrahkan hidup pada alam semesta atau orang lain, cenderung tidak mudah percaya. Namun ia adalah orang yang setia, amat perhatian dan hangat, serta senang membantu orang lain. Mudah khawatir dan tidak nyaman jika suatu masalah belum benar-benar selesai — perlu menjadi saksi sendiri atas penyelesaiannya, cenderung terus mengontrol dan mengecek ulang. Umumnya memiliki komitmen kuat terhadap sesuatu yang sudah ia pegang.",
    "traits": [
      "Insecure (perasaan tidak aman)",
      "Terlalu khawatir",
      "Tidak mudah percaya",
      "Komitmen kuat",
      "Setia",
      "Bertanggung jawab."
    ]
  },
  "7": {
    "name": "Petualang (The Enthusiast) / Generalist / Optimist / Adventure",
    "description": "Tipe orang yang tidak bisa diam, energinya begitu menggebu. Motivasinya adalah mencapai kehidupan yang gembira dan setiap hari bisa melakukan kegiatan yang menyenangkan — membuatnya cepat bosan dan tidak tahan berada pada satu tempat/kegiatan yang sama terus-menerus. Menyenangkan, spontan, tidak pernah membosankan sebagai teman — selalu ada hal menyenangkan yang bisa dilakukan bersamanya. Amat imajinatif dan antusias jika melakukan kegiatan yang sesuai kata hatinya.",
    "traits": [
      "Cepat bosan",
      "Spontan",
      "Menyenangkan",
      "Imajinatif",
      "Tidak konsisten",
      "Tidak disiplin",
      "Tidak fokus."
    ]
  },
  "8": {
    "name": "Pejuang (The Challenger) / Leader / Boss / Protector / Intimidator",
    "description": "Tipe manusia yang tidak mudah menyerah, memiliki semangat baja dan pengendalian diri yang luar biasa. Tidak ingin orang lain melihat kelemahannya; amat mandiri, tidak ingin bergantung pada orang lain, dan amat percaya diri dengan kemampuannya — yakin segala sesuatu bisa ia kerjakan sendiri. Namun cenderung otoriter dan ingin menguasai orang lain; tidak bisa diperintah atau dikendalikan orang lain. Bertipe pemberontak, tidak suka berada dalam sistem yang represif, dan kurang sensitif terhadap orang-orang di sekitarnya serta hal-hal yang bersifat artifisial/\"jaga image\".",
    "traits": [
      "Tidak mudah menyerah",
      "Semangat baja",
      "Mandiri",
      "Percaya diri",
      "Otoriter",
      "Tidak sensitif",
      "Kurang memiliki sifat empati."
    ]
  },
  "9": {
    "name": "Pendamai (The Mediator) / Peacemaker / Mediator / Accomodator",
    "description": "Tipe manusia yang tidak suka konflik; amat menjaga kedamaian dirinya serta orang-orang di sekitarnya. Jika harus memilih antara dua pihak yang berselisih, akan berusaha mengambil jalan tengah agar tidak ada yang tersinggung. Sebagai teman, ia amat menyenangkan, sabar, dan diplomatis — selalu mencari kata-kata yang tidak menyakiti lawan bicara. Namun cenderung pasif, pemalu, dan tidak lantang berbicara atau memulai gerakan — didorong oleh sikap apatis, lebih suka tidak mau tahu atau berada dalam posisi berbahaya, cenderung cari aman.",
    "traits": [
      "Tidak suka konflik",
      "Diplomatis",
      "Sabar",
      "Apresiatif",
      "Pendengar yang baik",
      "Pasif",
      "Cari aman",
      "Pelupa."
    ]
  }
};

export const ENNEAGRAM_WINGS: Record<string, EnneagramWingInfo> = {
  "1w9": {
    "label": "Perfeksionis yang Tenang",
    "description": "Memadukan standar tinggi Tipe 1 dengan ketenangan dan penerimaan Tipe 9. Lebih sabar dan tidak reaktif dibanding 1w2, idealis namun mampu menerima ketidaksempurnaan dengan lapang. Bijak, filosofis, jarang mengungkapkan kemarahan langsung.",
    "traits": [
      "Bijaksana",
      "Sabar",
      "Idealis namun fleksibel",
      "Tenang dalam konflik",
      "Menghindari konfrontasi",
      "Perfeksionis yang tidak kaku"
    ]
  },
  "1w2": {
    "label": "Perfeksionis yang Peduli",
    "description": "Memadukan standar tinggi Tipe 1 dengan kehangatan Tipe 2. Lebih ekspresif secara emosional dibanding 1w9, terdorong memperbaiki dunia dengan fokus pada orang lain — sering jadi mentor/guru/aktivis yang berprinsip sekaligus hangat.",
    "traits": [
      "Berprinsip kuat",
      "Hangat dan peduli",
      "Suka membimbing",
      "Kritis namun suportif",
      "Aktif di bidang sosial/pendidikan",
      "Emosional namun terstruktur"
    ]
  },
  "2w1": {
    "label": "Penolong yang Berprinsip",
    "description": "Memadukan kebutuhan membantu Tipe 2 dengan idealisme Tipe 1. Bantuan lebih terstruktur dan berbasis nilai, terdorong rasa \"benar untuk membantu\". Lebih kritis dan perfeksionis dibanding 2w3.",
    "traits": [
      "Murah hati",
      "Berprinsip",
      "Suka membimbing",
      "Perfeksionis dalam membantu",
      "Aktif di bidang kemanusiaan",
      "Kadang kritis"
    ]
  },
  "2w3": {
    "label": "Penolong yang Ambisius",
    "description": "Memadukan kehangatan Tipe 2 dengan ambisi dan kesadaran citra Tipe 3. Lebih energik, karismatik, berorientasi hasil dibanding 2w1 — senang membantu sambil membangun jaringan sosial luas.",
    "traits": [
      "Karismatik",
      "Energik",
      "Suka jaringan sosial",
      "Ambisius dalam membantu",
      "Sadar citra",
      "Pandai membaca kebutuhan orang"
    ]
  },
  "3w2": {
    "label": "Pencapai yang Berjiwa Sosial",
    "description": "Memadukan dorongan berprestasi Tipe 3 dengan kepedulian Tipe 2. Lebih ramah, empatik, berorientasi tim dibanding 3w4 — pemimpin karismatik yang disukai banyak orang.",
    "traits": [
      "Karismatik",
      "Ramah",
      "Berorientasi tim",
      "Ambisius namun empatik",
      "Sadar citra",
      "Termotivasi pengakuan publik"
    ]
  },
  "3w4": {
    "label": "Pencapai yang Kreatif",
    "description": "Memadukan ambisi Tipe 3 dengan kedalaman emosional Tipe 4. Lebih introspektif dan artistik dibanding 3w2 — ingin sukses secara autentik dan bermakna, menonjol di seni/desain/hiburan.",
    "traits": [
      "Ambisius",
      "Kreatif",
      "Introspektif",
      "Ingin sukses autentik",
      "Sensitif estetika",
      "Terjebak antara ambisi dan idealisme"
    ]
  },
  "4w3": {
    "label": "Individualis yang Ambisius",
    "description": "Memadukan kedalaman emosional Tipe 4 dengan dorongan Tipe 3. Lebih ekstrover dan berorientasi pengakuan dibanding 4w5 — ingin ekspresi keunikan sekaligus apresiasi dunia luar.",
    "traits": [
      "Ekspresif",
      "Kreatif",
      "Ambisius",
      "Butuh pengakuan",
      "Sensitif",
      "Ekstrover dibanding Tipe 4 umumnya"
    ]
  },
  "4w5": {
    "label": "Individualis yang Kontemplatif",
    "description": "Memadukan kedalaman emosional Tipe 4 dengan ketenangan analitis Tipe 5. Lebih introspektif, tertutup, mandiri dibanding 4w3 — kreatif namun suka berkarya dalam kesendirian.",
    "traits": [
      "Introspektif",
      "Mandiri",
      "Sangat kreatif",
      "Suka kesendirian",
      "Visi artistik mendalam",
      "Sulit membuka diri emosional"
    ]
  },
  "5w4": {
    "label": "Pengamat yang Kreatif",
    "description": "Memadukan pikiran analitis Tipe 5 dengan sensitivitas emosional Tipe 4. Lebih ekspresif, imajinatif, terhubung seni dibanding 5w6 — pemikir mendalam sekaligus kreatif.",
    "traits": [
      "Analitis",
      "Kreatif",
      "Imajinatif",
      "Sangat mandiri",
      "Orisinal",
      "Suka seni dan ilmu sekaligus"
    ]
  },
  "5w6": {
    "label": "Pengamat yang Loyal",
    "description": "Memadukan pikiran analitis Tipe 5 dengan kewaspadaan Tipe 6. Lebih praktis, terstruktur, berorientasi sistem dibanding 5w4 — ahli teknis/ilmiah/sistemik.",
    "traits": [
      "Analitis",
      "Sistematis",
      "Loyal",
      "Praktis",
      "Dapat diandalkan",
      "Ahli bidang teknis/ilmiah"
    ]
  },
  "6w5": {
    "label": "Pencemas yang Analitis",
    "description": "Memadukan kewaspadaan Tipe 6 dengan kemandirian analitis Tipe 5. Lebih tertutup, mandiri, bergantung fakta dibanding 6w7 — mencari rasa aman lewat pengetahuan, kurang butuh validasi sosial.",
    "traits": [
      "Kritis",
      "Analitis",
      "Mandiri",
      "Mencari aman via pengetahuan",
      "Waspada",
      "Kurang butuh validasi sosial"
    ]
  },
  "6w7": {
    "label": "Pencemas yang Ramah",
    "description": "Memadukan kewaspadaan Tipe 6 dengan keceriaan Tipe 7. Lebih ekstrover, hangat, humoris dibanding 6w5 — mencari rasa aman lewat hubungan sosial/komunitas.",
    "traits": [
      "Setia",
      "Hangat",
      "Humoris",
      "Mencari aman via komunitas",
      "Ekstrover",
      "Mudah cemas namun menyenangkan"
    ]
  },
  "7w6": {
    "label": "Petualang yang Bertanggung Jawab",
    "description": "Memadukan semangat Tipe 7 dengan loyalitas Tipe 6. Lebih setia, kooperatif, dapat diandalkan dibanding 7w8 — masih cinta petualangan namun mempertimbangkan dampak pada orang lain.",
    "traits": [
      "Antusias",
      "Setia",
      "Kooperatif",
      "Dapat diandalkan",
      "Suka hal baru",
      "Mempertimbangkan dampak sosial"
    ]
  },
  "7w8": {
    "label": "Petualang yang Asertif",
    "description": "Memadukan semangat Tipe 7 dengan ketegasan Tipe 8. Lebih asertif, berani, berorientasi kekuasaan dibanding 7w6 — ingin mengontrol pengalaman hidupnya, berani ambil risiko besar.",
    "traits": [
      "Asertif",
      "Berani",
      "Energik",
      "Suka risiko besar",
      "Karismatik",
      "Berorientasi kontrol atas pengalaman hidup"
    ]
  },
  "8w7": {
    "label": "Pejuang yang Ekspansif",
    "description": "Memadukan kekuatan Tipe 8 dengan antusiasme dan visi Tipe 7. Lebih ekspansif, optimis, visioner dibanding 8w9 — berenergi tinggi, pengusaha/pemimpin penuh semangat.",
    "traits": [
      "Kuat",
      "Visioner",
      "Ekspansif",
      "Optimis",
      "Gemar risiko",
      "Pemimpin penuh semangat"
    ]
  },
  "8w9": {
    "label": "Pejuang yang Tenang",
    "description": "Memadukan kekuatan Tipe 8 dengan ketenangan Tipe 9. Lebih tenang, stabil, protektif dibanding 8w7 — kekuatan tidak ditampilkan terang-terangan tapi terasa dalam kehadirannya yang berwibawa.",
    "traits": [
      "Kuat",
      "Tenang",
      "Stabil",
      "Protektif",
      "Berwibawa",
      "Pelindung diam yang diandalkan"
    ]
  },
  "9w8": {
    "label": "Pendamai yang Tegas",
    "description": "Memadukan kedamaian Tipe 9 dengan kekuatan Tipe 8. Lebih percaya diri, asertif, kadang keras kepala dibanding 9w1 — menghindari konflik namun bisa tegas bila diprovokasi.",
    "traits": [
      "Tenang",
      "Tegas bila perlu",
      "Percaya diri",
      "Keras kepala",
      "Pelindung sabar",
      "Menghindari konflik namun tidak lemah"
    ]
  },
  "9w1": {
    "label": "Pendamai yang Berprinsip",
    "description": "Memadukan kedamaian Tipe 9 dengan idealisme Tipe 1. Lebih idealis, terorganisir, berorientasi nilai dibanding 9w8 — bijak, sabar, penuh empati, mendambakan harmoni berdasar keadilan.",
    "traits": [
      "Bijaksana",
      "Idealis",
      "Sabar",
      "Berprinsip",
      "Empatik",
      "Mendambakan harmoni yang adil dan bermakna"
    ]
  }
};

export function getEnneagramCoreInfo(type: number): EnneagramCoreInfo | undefined {
  return ENNEAGRAM_CORE_TYPES[type];
}

export function getEnneagramWingInfo(wingCode: string): EnneagramWingInfo | undefined {
  return ENNEAGRAM_WINGS[wingCode];
}
