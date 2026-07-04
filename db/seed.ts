import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { eq } from "drizzle-orm";
import * as schema from "./schema";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const sql = neon(process.env.DATABASE_URL_UNPOOLED!);
const db = drizzle(sql, { schema });

async function main() {
  console.log("Seeding database...");

  // Seed Categories
  const cat = await db.insert(schema.serviceCategories).values({
    name: "Psikotes Online",
    slug: "psikotes-online",
    description: "Tes psikologi online untuk individu dan perusahaan",
    display_order: 1,
  }).onConflictDoNothing().returning();

  let categoryId = cat[0]?.id;
  if (!categoryId) {
    const existing = await db.select().from(schema.serviceCategories).limit(1);
    categoryId = existing[0].id;
  }

  // Seed Services
  const servicesData = [
    { name: "Tes MBTI Lengkap", slug: "mbti" },
    { name: "Talents Mapping", slug: "talents-mapping" },
    { name: "Tes Psikologi", slug: "tes-psikologi" },
    { name: "Mental Health Checkup", slug: "mental-health-checkup" },
    { name: "Konseling Psikolog", slug: "konseling-psikolog" },
    { name: "Therapy SEFT", slug: "therapy-seft" },
    { name: "Visual Coaching", slug: "visual-coaching" },
    { name: "Konsultasi Keuangan", slug: "konsultasi-keuangan" },
    { name: "Ecourse Life Reset", slug: "ecourse-life-reset" },
    { name: "Webinar & Workshop", slug: "webinar-workshop" },
    { name: "Terapi Relaksasi", slug: "relaksasi" }
  ];

  for (const s of servicesData) {
    const svc = await db.insert(schema.services).values({
      category_id: categoryId,
      name: s.name,
      slug: s.slug,
      short_description: `Layanan ${s.name} profesional.`,
      description: `Layanan ${s.name} dirancang khusus untuk memenuhi kebutuhan pengembangan diri.`,
      delivery_mode: "online",
      audience_type: "both",
      is_featured: true,
      status: "published",
    }).onConflictDoUpdate({
      target: schema.services.slug,
      set: { name: s.name }
    }).returning();

    const existingPkg = await db.select().from(schema.servicePackages)
      .where(eq(schema.servicePackages.service_id, svc[0].id))
      .limit(1);

    if (existingPkg.length === 0) {
      await db.insert(schema.servicePackages).values({
        service_id: svc[0].id,
        test_code: s.slug === "mbti" ? "MBTI" : null,
        name: `Paket ${s.name} Premium`,
        price_type: "fixed",
        price_amount: "250000",
        price_unit: "per_access",
        features: ["Sesi 1-on-1", "Laporan Komprehensif", "Sertifikat"],
        is_popular: true,
      });
    }
  }

  // Seed Payment Methods
  await db.insert(schema.paymentMethods).values([
    {
      code: "QRIS",
      name: "QRIS",
      channel_type: "qris",
      provider: "xendit",
      is_active: true,
      sort_order: 1,
    },
    {
      code: "BCA",
      name: "BCA Virtual Account",
      channel_type: "virtual_account",
      provider: "xendit",
      is_active: true,
      sort_order: 2,
    }
  ]).onConflictDoNothing();

  // Seed Test Items (MBTI Mock)
  await db.insert(schema.testItems).values([
    {
      test_code: "MBTI",
      section: "Bagian 1",
      item_order: 1,
      question_text: "Di sebuah pesta, Anda biasanya:",
      options: [
        { value: "A", label: "Berinteraksi dengan banyak orang, termasuk orang tak dikenal", score_key: "E", score_val: 1 },
        { value: "B", label: "Berinteraksi dengan sedikit orang, yang sudah Anda kenal", score_key: "I", score_val: 1 }
      ]
    },
    {
      test_code: "MBTI",
      section: "Bagian 1",
      item_order: 2,
      question_text: "Apakah Anda lebih sering menjadi orang yang:",
      options: [
        { value: "A", label: "Realistis daripada spekulatif", score_key: "S", score_val: 1 },
        { value: "B", label: "Spekulatif daripada realistis", score_key: "N", score_val: 1 }
      ]
    }
  ]).onConflictDoNothing();

  // Seed Articles
  const articlesData = [
    {
      title: "Mengenal Burnout dan Cara Mengatasinya",
      slug: "mengenal-burnout-dan-cara-mengatasinya",
      category: "Kesehatan Mental",
      excerpt: "Burnout sering terjadi pada pekerja kantoran. Ketahui ciri dan cara pencegahannya.",
      content: "<p>Burnout adalah kondisi kelelahan fisik dan mental...</p>",
      cover_image_url: "https://images.pexels.com/photos/3807755/pexels-photo-3807755.jpeg?auto=compress&cs=tinysrgb&w=800",
      author_name: "Tim Psikolog TheAIM",
      status: "published",
    },
    {
      title: "Pentingnya Komunikasi Efektif di Tempat Kerja",
      slug: "pentingnya-komunikasi-efektif-di-tempat-kerja",
      category: "Dunia Kerja",
      excerpt: "Cara membangun lingkungan kerja yang sehat dengan komunikasi asertif.",
      content: "<p>Komunikasi yang baik adalah kunci kesuksesan...</p>",
      cover_image_url: "https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg?auto=compress&cs=tinysrgb&w=800",
      author_name: "Tim Konselor TheAIM",
      status: "published",
    }
  ];

  for (const a of articlesData) {
    await db.insert(schema.articles).values(a).onConflictDoUpdate({
      target: schema.articles.slug,
      set: { cover_image_url: a.cover_image_url, content: a.content }
    });
  }

  // Seed Job Postings
  await db.insert(schema.jobPostings).values([
    {
      title: "Digital Marketing Specialist",
      slug: "digital-marketing-specialist",
      department: "Marketing",
      employment_type: "full_time",
      location: "Jakarta (Hybrid)",
      description: "Kami mencari Digital Marketing Specialist yang kreatif...",
      requirements: "<ul><li>Minimal 2 tahun pengalaman</li><li>Menguasai FB/IG Ads</li></ul>",
      status: "open",
    },
    {
      title: "Psikolog Klinis Part-Time",
      slug: "psikolog-klinis-part-time",
      department: "Layanan Psikologi",
      employment_type: "part_time",
      location: "Remote",
      description: "Bergabung sebagai mitra konselor TheAIM...",
      requirements: "<ul><li>SIPP Aktif</li><li>Pengalaman min. 1 tahun</li></ul>",
      status: "open",
    }
  ]).onConflictDoNothing();

  console.log("Seeding complete!");
}

main().catch((e) => {
  console.error("Seeding failed:");
  console.error(e);
  process.exit(1);
});
