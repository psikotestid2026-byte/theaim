export interface DiscTypeInfo {
  code: string;
  name: string;
  description: string;
  jobs: string;
}

export const DISC_TYPE_INFO: Record<string, DiscTypeInfo> = {
  'C': {
    code: 'C',
    name: 'LOGICAL THINKER',
    description: 'Seorang yang praktis, cakap dan unik. Ia orang yang mampu menilai diri sendiri dan kritis terhadap dirinya dan orang lain. Ia menyukai hal yang detil dan logis; secara alamiah ia sangat analitis. Karena menyimpan informasi, ia meneliti isu berulang-ulang kali. Ia cenderung hati-hati dalam membuat keputusan yang berdasarkan pada logika, bukan emosi, selalu menggunakan pertanyaan "bagaimana dan mengapa". Ia mengerjakan sesuatu dengan sistematis dan akurat. Sangat teliti dalam segala sesuatu.',
    jobs: 'Planner, Engineer, Statistician, Academic, Government Worker, IT Management, Quality Controller.'
  },
  'D': {
    code: 'D',
    name: 'ESTABLISHER',
    description: 'Memiliki rasa ego yang tinggi dan cenderung individualis dengan standard yang sangat tinggi. Ia lebih suka menganalisa masalah sendirian daripada bersama orang lain. Rasa egoisnya yang kuat membuatnya tidak nyaman di bawah kendali orang lain; ia lebih suka menjadi "boss" dan menetapkan standard tinggi. Ia menghindari sesuatu yang biasa-biasa dan cenderung mencari tantangan baru. Mampu memimpin situasi dan orang lain dalam rangka mencapai sasarannya; ia ingin selalu unggul dalam persaingan.',
    jobs: 'Attorney, Sales Representative, Production Director/Manager, Strategic Planning, Trouble Shooting, Engineering Director/Manager, Self-Employment.'
  },
  'DI': {
    code: 'DI',
    name: 'PENGAMBIL KEPUTUSAN',
    description: 'Tidak basa-basi dan tegas, ia cenderung merupakan seorang individualis yang kuat. Ia berpandangan jauh ke depan, progresif dan mau berkompetisi untuk mencapai sasaran. Ia seorang yang logis, kritis dan tajam dalam memecahkan masalah. Ia mencanangkan standard tinggi pada dirinya dan mengutamakan kesempurnaan. Ia menginginkan otoritas yang jelas dan menyukai tugas-tugas baru.',
    jobs: 'General Management, Public Relations, Business Consultant, Sales, Marketing, Production.'
  },
  'DIS': {
    code: 'DIS',
    name: 'DIRECTOR',
    description: 'Fokus pada penyelesaian pekerjaan dan menunjukkan penghargaan yang tinggi kepada orang lain. Ia memiliki kemampuan untuk menggerakkan orang dan pekerjaan. Enerjik dan sosial, ia mampu memotivasi orang lain sambil menyelesaikan pekerjaannya. Ia menampilkan rasa percaya diri dan mampu meyakinkan orang lain. Sekali ia memutuskan sesuatu, ia akan terus mengerjakannya sampai selesai.',
    jobs: 'Engineering & Production Management, Sales, Service Manager, Customer Service, IT, Lecturer.'
  },
  'DS': {
    code: 'DS',
    name: 'SELF-MOTIVATED',
    description: 'Seorang yang obyektif dan analitis. Ia ingin terlibat dalam situasi, dan ia juga ingin memberikan bantuan dan dukungan kepada orang yang ia hormati. Secara internal termotivasi oleh target pribadi. Karena determinasinya yang kuat, ia sering berhasil dalam berbagai hal; karakternya yang tenang, stabil dan daya tahannya yang tinggi memiliki kontribusi dalam keberhasilannya.',
    jobs: 'Engineering & Production, Project Management, Research, Systems Analyst, Programmer, IT.'
  },
  'DC': {
    code: 'DC',
    name: 'CHALLENGER',
    description: 'Seorang yang sensitif terhadap permasalahan, dan memiliki kreativitas yang baik dalam memecahkan masalah. Ia dapat menyelesaikan tugas-tugas penting dalam waktu singkat karena mempunyai keputusan yang kuat. Seorang yang tekun dan memiliki reaksi yang cepat. Ia banyak memberikan ide-ide dengan berfokus pada pekerjaan. Ia cenderung perfeksionis.',
    jobs: 'Engineering Management, Technical/Scientific, Finance, Production Planning.'
  },
  'DIC': {
    code: 'DIC',
    name: 'CHANCELLOR',
    description: 'Ia menggabungkan antara kesenangan dengan pekerjaan/bisnis ketika melakukan sesuatu. Ia kelihatan menyukai hubungan dengan sesama tetapi juga dapat mengerjakan hal-hal detil. Ia ingin melakukan segala sesuatu dengan tepat. Seorang yang ramah secara alami dan menikmati interaksi dengan sesama, akan tetapi ia akan juga menilai orang dan tugas secara hati-hati.',
    jobs: 'Technical/Scientific Management, Engineering, Finance, Business Consultant, IT.'
  },
  'DSI': {
    code: 'DSI',
    name: 'DIRECTOR',
    description: 'Seorang yang obyektif dan analitis. Ia ingin terlibat dalam situasi, dan ia juga ingin memberikan bantuan dan dukungan. Secara internal termotivasi oleh target pribadi, ia berorientasi terhadap pekerjaannya tapi juga menyukai hubungan dengan sesama. Karena determinasinya yang kuat, ia sering berhasil dalam berbagai hal.',
    jobs: 'Engineering & Production Management, Sales, Service Manager, Customer Service.'
  },
  'I': {
    code: 'I',
    name: 'COMMUNICATOR',
    description: 'Seorang yang berhasil dalam membangkitkan antusiasme orang lain. Ia cenderung optimis dan mudah percaya. Ia banyak bicara dan suka bertemu dengan orang yang baru dikenal. Ia lebih menyukai lingkungan kerja yang bersahabat dan berusaha untuk menciptakan lingkungan yang seperti itu. Orang ini membujuk dan memotivasi orang lain secara efektif untuk mencapai tujuan atau menyelesaikan masalah.',
    jobs: 'Promoting, Marketing Services, Public Relations, Lecturing, Hospitality, Journalist.'
  },
  'IS': {
    code: 'IS',
    name: 'ADVISOR',
    description: 'Seorang yang suka bergaul dengan orang lain serta bersahabat. Ia cenderung untuk berbicara lebih banyak dari pada mendengar; ia benar-benar menikmati percakapan dengan orang lain. Ia terbuka dalam mengungkapkan perasaan dirinya. Menikmati pekerjaan yang berhubungan dengan orang banyak. Mempunyai kemampuan untuk memotivasi orang lain.',
    jobs: 'Personnel, Welfare, Training, Hotelier, Nurse, Human Resources, Social Work.'
  },
  'IC': {
    code: 'IC',
    name: 'ASSESSOR',
    description: 'Seorang yang berhasil dalam membangkitkan antusiasme orang lain tetapi juga memiliki kepedulian terhadap ketepatan dan akurasi. Ia bersahabat namun juga memperhatikan detail. Memadukan kemampuan komunikasi dengan kemampuan analitis yang kuat.',
    jobs: 'Teaching, Training, Inventing, Specialist Selling, Finance, Public Relations.'
  },
  'ISC': {
    code: 'ISC',
    name: 'RESPONSIVE & THOUGHTFUL',
    description: 'Merupakan individu konsisten yang berusaha menjaga lingkungan/suasana yang tidak berubah. Ia bekerja dengan baik bersama orang-orang dengan berbagai kepribadian karena perilakunya yang terkendali dan rendah hati. Sabar, loyal dan suka menolong. Persahabatan dikembangkannya dengan lambat dan selektif.',
    jobs: 'Actors, Personnel, Training, Teaching, Accounting, Customer Services, Public Relations.'
  },
  'S': {
    code: 'S',
    name: 'SPECIALIST',
    description: 'Berpikir sistematis dan cenderung mengikuti prosedur dalam kehidupan pribadi dan pekerjaannya. Teratur dan memiliki perencanaan yang baik, ia teliti dan fokus pada detil. Bertindak dengan penuh kebijaksanaan, diplomatis dan jarang menentang rekan kerjanya. Ia sangat berhati-hati, sungguh-sungguh mengharapkan akurasi dan standard tinggi dalam pekerjaannya.',
    jobs: 'Administrative Work, Engineering, Chef, Telemarketing, Research, Retail, Accounting.'
  },
  'SC': {
    code: 'SC',
    name: 'PEACEMAKER',
    description: 'Seorang yang sensitif terhadap permasalahan, dan memiliki kreativitas yang baik dalam memecahkan masalah. Ia dapat menyelesaikan tugas-tugas penting dalam waktu singkat karena mempunyai keputusan yang kuat. Ia akan meneliti dan mengejar semua kemungkinan yang ada dalam mencari solusi permasalahan. Ia cenderung perfeksionis.',
    jobs: 'Office Manager, Production Supervisor, Accountant, Flight Attendant, Data Entry.'
  },
  'SI': {
    code: 'SI',
    name: 'ADVISOR',
    description: 'Seorang yang suka bergaul dengan orang lain serta bersahabat. Ia cenderung untuk berbicara lebih banyak dari pada mendengar; ia benar-benar menikmati percakapan dengan orang lain. Ia terbuka dalam mengungkapkan perasaan dirinya. Menikmati pekerjaan yang berhubungan dengan orang banyak.',
    jobs: 'Personnel, Welfare, Training, Teaching, Customer Services, Public Relations.'
  },
  'SIC': {
    code: 'SIC',
    name: 'ADVOCATE',
    description: 'Seorang yang suka melakukan pendekatan dengan orang lain secara hati-hati dan analitis. Ia menggabungkan kehangatan sosial dengan perhatian terhadap detail dan prosedur. Loyal dan konsisten, ia dapat diandalkan untuk menyelesaikan tugas dengan penuh tanggung jawab.',
    jobs: 'Engineering & Production Supervision, Customer Service, Programmer, Accounting.'
  },
  'CI': {
    code: 'CI',
    name: 'ASSESSOR',
    description: 'Memadukan kemampuan analitis yang kuat dengan kemampuan komunikasi interpersonal. Ia dapat menggabungkan perhatian terhadap detail dengan kemampuan mempengaruhi orang lain.',
    jobs: 'Sales Technical/Specialist, Public Relations, Lecturer, Training, Hospitality.'
  },
  'CDI': {
    code: 'CDI',
    name: 'CHALLENGER',
    description: 'Seorang yang sensitif terhadap permasalahan dan kreatif dalam memecahkan masalah. Menggabungkan ketepatan analitis dengan kepemimpinan dan kemampuan interpersonal yang kuat.',
    jobs: 'Engineering R&D, Research, Work Study, Sales Technical, Systems Analyst, Lecturer.'
  },
  'CDS': {
    code: 'CDS',
    name: 'CONTEMPLATOR',
    description: 'Seorang yang sangat analitis dan metodis. Ia mengumpulkan fakta secara menyeluruh sebelum mengambil tindakan. Ia memperhitungkan berbagai faktor dengan hati-hati sebelum membuat keputusan. Menggabungkan ketepatan dengan kesabaran dan ketekunan.',
    jobs: 'Engineering, Research, Production, Accountant, Quality Controller, Market Analyst.'
  },
  'CSD': {
    code: 'CSD',
    name: 'PRECISIONIST',
    description: 'Seorang yang analitis dan sabar yang menggabungkan perhatian terhadap detail dengan orientasi pada hasil. Ia dapat memimpin orang lain melalui pendekatan yang sistematis dan terstruktur. Sangat teliti dan berhati-hati dalam setiap aspek pekerjaannya.',
    jobs: 'Engineering, Research, Production, Financial Services Manager, Quality Controller, Planner.'
  }
};

export function findDiscTypeInfo(dominantCode: string): DiscTypeInfo | null {
  const cleanCode = dominantCode.replace(/-/g, '').toUpperCase().trim();
  
  if (DISC_TYPE_INFO[cleanCode]) return DISC_TYPE_INFO[cleanCode];
  
  const twoChars = cleanCode.substring(0, 2);
  if (DISC_TYPE_INFO[twoChars]) return DISC_TYPE_INFO[twoChars];
  
  const oneChar = cleanCode.substring(0, 1);
  if (DISC_TYPE_INFO[oneChar]) return DISC_TYPE_INFO[oneChar];
  
  return null;
}

export interface DiscMainTrait {
  dimension: string;
  potretDiri: string;
  kelebihan: string;
  kekurangan: string;
  kecenderungan: string;
  lingkunganCocok: string;
  saranPerbaikan: string;
}

export const DISC_MAIN_TRAITS: Record<string, DiscMainTrait> = {
  'D': {
    dimension: 'Dominance',
    potretDiri: 'Bersaing · Cepat bertindak · Berani mengambil resiko · Menuntut sesuatu · Memerintah · Rasional · Berorientasi pada tugas · Formal · Mandiri/tertutup · Disiplin',
    kelebihan: 'To the Point · Cepat membuat keputusan · Menyukai perubahan · Menetapkan banyak sasaran · Berani mengambil resiko · Inovatif kompetitif efisien · Menghargai waktu · Memiliki inisiatif',
    kekurangan: 'Tidak sensitif terhadap orang lain · Tidak sabaran · Suka mendominasi · Tidak memperhatikan perasaan orang lain · Tidak peduli terhadap aturan · Kurang hati-hati',
    kecenderungan: 'Memecahkan masalah dengan cepat · Menerima proyek penuh tantangan · Mengambil wewenang · Membuat keputusan · Melakukan banyak pekerjaan sekaligus · Mencapai sasaran/tujuan',
    lingkunganCocok: 'Kekuasaan dan otoritas · Prestise dan tantangan · Hasil yang langsung kelihatan · Kebebasan untuk mengontrol · Variasi dan kegiatan yang berbeda · Kesempatan untuk maju',
    saranPerbaikan: 'Menghargai kebutuhan orang lain · Sabar dengan orang lain · Mengkomunikasikan alasan di balik keputusan · Peduli terhadap perincian · Mengembangkan pendekatan yang lebih sabar'
  },
  'I': {
    dimension: 'Influence',
    potretDiri: 'Ramah · Antusias · Suka bergaul · Optimis · Banyak bicara · Impulsif · Emosional · Berorientasi pada orang · Tidak formal · Terbuka/ekspresif',
    kelebihan: 'Bersemangat · Membangkitkan antusiasme orang lain · Persuasif · Kreatif · Optimis · Suka bersenang-senang · Pandai berkomunikasi · Membuat orang lain merasa nyaman',
    kekurangan: 'Tidak suka dikritik · Terlalu mempercayai orang lain · Cenderung tidak mampu menetapkan prioritas · Kurang sensitif terhadap hal kurang penting · Kurang teliti',
    kecenderungan: 'Melaksanakan tugas secara konsisten · Menunjukan kesabaran · Senang membantu orang lain · Menunjukan loyalitas · Menjadi pendengar yang baik · Menangani orang secara menyenangkan',
    lingkunganCocok: 'Popularitas dan pengakuan sosial · Kebebasan berekspresi · Aktivitas kelompok di luar pekerjaan · Hubungan demokratik · Pembimbingan dan pelatihan · Suasana kerja yang menyenangkan',
    saranPerbaikan: 'Berkonsentrasi pada tugas · Memperhitungkan resiko · Menggunakan prinsip kehati-hatian · Mempelajari fakta-fakta · Berhati-hati sebelum memutuskan'
  },
  'S': {
    dimension: 'Steadiness',
    potretDiri: 'Sabar · Dapat dipercaya · Berhati-hati · Stabil · Kooperatif · Tidak menyukai perubahan · Berorientasi pada orang · Terbuka/ekspresif',
    kelebihan: 'Dapat dipercaya · Bekerja keras · Tidak mudah berubah pikiran · Pengambilan keputusan yang matang · Baik dalam koordinasi · Sabar · Tulus · Dapat diandalkan · Setia',
    kekurangan: 'Terlalu sensitif terhadap kritik · Sulit menghadapi perubahan mendadak · Menghindari konflik · Kurang tegas · Terlalu bergantung pada rutinitas',
    kecenderungan: 'Bekerja secara konsisten · Membantu orang lain · Mendukung orang-orang terdekat · Menciptakan suasana harmonis · Menjadi mediator · Melakukan tugas rutin dengan teliti',
    lingkunganCocok: 'Keamanan dan stabilitas · Prosedur yang jelas · Lingkungan kerja yang ramah · Pengakuan atas kesetiaan · Pekerjaan yang bervariasi namun terstruktur',
    saranPerbaikan: 'Lebih tegas dalam menyampaikan pendapat · Belajar menerima perubahan · Mengambil inisiatif · Tidak terlalu bergantung pada persetujuan orang lain'
  },
  'C': {
    dimension: 'Compliance',
    potretDiri: 'Kooperatif · Lambat bertindak · Menghindari resiko · Menerima · Pendiam · Rasional · Berorientasi pada tugas · Formal · Mandiri/tertutup · Disiplin',
    kelebihan: 'Berpikir objektif · Hati-hati/teliti · Mempertahankan standar tinggi · Menanyakan hal yang benar · Keterampilan diplomatik · Memberikan perhatian sampai detail · Logika dan seksama',
    kekurangan: 'Ragu-ragu dalam bertindak · Cenderung rewel sampai hal detail · Cenderung bersikap defensif bila dikritik · Cenderung hanya memberikan instruksi tanpa menjelaskan',
    kecenderungan: 'Mengikuti standar dan petunjuk · Berkonsentrasi pada hal terperinci · Berpikir analitis · Memeriksa keakuratan dan menganalisis kinerja · Menggunakan pendekatan sistematis',
    lingkunganCocok: 'Ekspresi kinerja yang terdefinisi jelas · Nilai kualitas dan akurasi · Kesempatan menunjukan keahlian · Pengendalian terhadap faktor yang mempengaruhi kinerja',
    saranPerbaikan: 'Mendelegasikan tugas penting · Cepat membuat keputusan · Berkompromi dengan orang lain · Memulai dan memfasilitasi diskusi · Mendukung kerja sama'
  }
};
