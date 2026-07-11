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

  // --- NEW SEED DATA ---

  // 1. Customers
  const custs = await db.insert(schema.customers).values([
    { full_name: "Budi Santoso", whatsapp_number: "081234567890", email: "budi@example.com", city: "Bandung" },
    { full_name: "Siti Aminah", whatsapp_number: "089876543210", email: "siti@example.com", city: "Jakarta" },
    { full_name: "Andi Permana", whatsapp_number: "081122334455", email: "andi@example.com", city: "Surabaya" },
  ]).onConflictDoNothing().returning();

  let custId = custs[0]?.id;
  if (!custId) {
    const existing = await db.select().from(schema.customers).limit(1);
    custId = existing[0]?.id;
  }

  // 2. Consultants
  const cons = await db.insert(schema.consultants).values([
    { full_name: "Dr. Aisyah", role_title: "Psikolog Klinis", specialization: "Keluarga & Anak" },
    { full_name: "Bapak Reza", role_title: "Career Coach", specialization: "Pengembangan Karir" },
  ]).onConflictDoNothing().returning();

  let consId = cons[0]?.id;
  if (!consId) {
    const existing = await db.select().from(schema.consultants).limit(1);
    consId = existing[0]?.id;
  }

  // 3. Service Consultants Map
  if (categoryId && consId) {
    const existingSvc = await db.select().from(schema.services).limit(1);
    if (existingSvc.length > 0) {
      await db.insert(schema.serviceConsultants).values({
        service_id: existingSvc[0].id,
        consultant_id: consId,
      }).onConflictDoNothing();
    }
  }

  // 4. Registrations
  let regId;
  if (custId) {
    const existingSvc = await db.select().from(schema.services).limit(1);
    const existingPkg = await db.select().from(schema.servicePackages).limit(1);
    
    if (existingSvc.length > 0) {
      const reg = await db.insert(schema.registrations).values({
        registration_code: "REG-2026-0001",
        customer_id: custId,
        service_id: existingSvc[0].id,
        package_id: existingPkg.length > 0 ? existingPkg[0].id : null,
        full_name: "Budi Santoso",
        whatsapp_number: "081234567890",
        price_quoted: "250000",
        status: "pending_confirmation",
      }).onConflictDoNothing().returning();
      
      regId = reg[0]?.id;
      if (!regId) {
        const existing = await db.select().from(schema.registrations).limit(1);
        regId = existing[0]?.id;
      }
    }
  }

  // 5. Admin Users
  const admin = await db.insert(schema.adminUsers).values({
    full_name: "Super Admin",
    email: "admin@theaim.id",
    password_hash: "$2a$10$xyz", // mock
    role: "super_admin",
  }).onConflictDoNothing().returning();
  
  let adminId = admin[0]?.id;
  if (!adminId) {
    const existing = await db.select().from(schema.adminUsers).limit(1);
    adminId = existing[0]?.id;
  }

  // 6. Payments
  let payId;
  if (regId && adminId) {
    const pm = await db.select().from(schema.paymentMethods).limit(1);
    if (pm.length > 0) {
      const pay = await db.insert(schema.payments).values({
        registration_id: regId,
        payment_method_id: pm[0].id,
        payment_code: "PAY-2026-0001",
        amount: "250000",
        status: "awaiting_confirmation",
      }).onConflictDoNothing().returning();

      payId = pay[0]?.id;
      if (!payId) {
        const existing = await db.select().from(schema.payments).limit(1);
        payId = existing[0]?.id;
      }
    }
  }

  // 7. Payment Logs
  if (payId) {
    await db.insert(schema.paymentLogs).values({
      payment_id: payId,
      provider_reference: "XND-999-000",
      endpoint: "/api/webhooks/xendit",
      log_type: "webhook",
      http_status: 200,
    }).onConflictDoNothing();
  }

  // 8. Notification Templates & Logs
  const tpl = await db.insert(schema.notificationTemplates).values({
    event_trigger: "registration_created",
    channel: "whatsapp",
    message_content: "Halo {nama}, terima kasih telah mendaftar layanan di TheAIM.",
  }).onConflictDoNothing().returning();

  let tplId = tpl[0]?.id;
  if (!tplId) {
    const existing = await db.select().from(schema.notificationTemplates).limit(1);
    tplId = existing[0]?.id;
  }

  if (tplId && regId) {
    await db.insert(schema.notificationLogs).values({
      template_id: tplId,
      registration_id: regId,
      recipient: "081234567890",
      channel: "whatsapp",
      status: "sent",
    }).onConflictDoNothing();
  }

  // 9. Test Sessions, Responses, Results
  if (custId && regId) {
    const pkg = await db.select().from(schema.servicePackages).where(eq(schema.servicePackages.test_code, 'MBTI')).limit(1);
    if (pkg.length > 0) {
      const session = await db.insert(schema.testSessions).values({
        registration_id: regId,
        customer_id: custId,
        package_id: pkg[0].id,
        test_code: "MBTI",
        access_token: "mock-access-token-123",
        result_token: "mock-result-token-123",
        status: "completed",
        expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      }).onConflictDoNothing().returning();

      let sessionId = session[0]?.id;
      if (!sessionId) {
        const existing = await db.select().from(schema.testSessions).limit(1);
        sessionId = existing[0]?.id;
      }

      if (sessionId) {
        const item = await db.select().from(schema.testItems).limit(1);
        if (item.length > 0) {
          await db.insert(schema.testResponses).values({
            session_id: sessionId,
            item_id: item[0].id,
            answer_value: "A",
          }).onConflictDoNothing();
        }

        await db.insert(schema.testResults).values({
          session_id: sessionId,
          test_code: "MBTI",
          raw_scores: { E: 10, I: 5 },
          result_type: "ENTJ",
          result_label: "The Commander",
          interpretation: { description: "Pemimpin alami" },
          wa_summary_text: "Hasil tes Anda: ENTJ",
        }).onConflictDoNothing();
      }
    }
  }

  // 10. Corporate Inquiries & Partners
  await db.insert(schema.corporateInquiries).values({
    full_name: "Bapak CEO",
    company_name: "PT Maju Terus",
    whatsapp_number: "085566778899",
    interested_service: "In-House Training",
    status: "new",
  }).onConflictDoNothing();

  await db.insert(schema.corporatePartners).values({
    name: "Universitas Indonesia",
    logo_url: "https://example.com/logo.png",
    partnership_type: "active_partnership",
  }).onConflictDoNothing();

  // 11. Partnership Submissions & Proposal Leads
  await db.insert(schema.partnershipSubmissions).values({
    pic_full_name: "Ibu Kemitraan",
    pic_whatsapp_number: "087788990011",
    organization_name: "Yayasan Peduli",
    collaboration_title: "Seminar Mental Health",
    idea_description: "Seminar gratis untuk siswa",
    status: "submitted",
  }).onConflictDoNothing();

  await db.insert(schema.proposalDownloadLeads).values({
    full_name: "Manager HR",
    whatsapp_number: "082233445566",
    company_name: "PT Sejahtera",
    proposal_type: "corporate_b2b",
  }).onConflictDoNothing();

  // 12. Job Applications
  const job = await db.select().from(schema.jobPostings).limit(1);
  if (job.length > 0) {
    await db.insert(schema.jobApplications).values({
      job_posting_id: job[0].id,
      full_name: "Kandidat A",
      email: "kandidat@example.com",
      cv_file_url: "https://example.com/cv.pdf",
      status: "received",
    }).onConflictDoNothing();
  }

  // 13. Testimonials
  const svc = await db.select().from(schema.services).limit(1);
  await db.insert(schema.testimonials).values({
    customer_name: "Klien Puas",
    content: "Sangat membantu karir saya!",
    related_service_id: svc.length > 0 ? svc[0].id : null,
    rating: 5,
  }).onConflictDoNothing();

  // 14. Ecourse Modules & Enrollments
  if (svc.length > 0) {
    await db.insert(schema.ecourseModules).values({
      service_id: svc[0].id,
      day_number: 1,
      title: "Pengenalan Diri",
      video_url: "https://youtube.com/watch?v=123",
    }).onConflictDoNothing();

    if (custId) {
      await db.insert(schema.ecourseEnrollments).values({
        customer_id: custId,
        service_id: svc[0].id,
        progress_day: 1,
        status: "active",
      }).onConflictDoNothing();
    }
  }

  console.log("Seeding complete!");
}

main().catch((e) => {
  console.error("Seeding failed:");
  console.error(e);
  process.exit(1);
});
