import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { eq, sql as drizzleSql } from "drizzle-orm";
import * as schema from "./schema";
import * as dotenv from "dotenv";
import {
  MASTER_TEST_SEEDS,
  STRENGTH_ACTIVITY_SEEDS,
  STRENGTH_TYPOLOGY_SEEDS,
  TALENT_THEME_SEEDS,
} from "./seed-data/talent-catalog";
import {
  ACTIVITY_CLUSTER_SEEDS,
  THEME_DETAIL_SEEDS,
  TYPOLOGY_DETAIL_SEEDS,
} from "./seed-data/talent-enrichment";
import { SCORING_CONFIG_BY_CODE } from "./seed-data/scoring-configs";
import { seedOverlapBanks } from "./seed-overlap";

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

  await seedTalentCatalog();

  console.log("Seeding complete!");
}

async function seedTalentCatalog() {
  for (const row of MASTER_TEST_SEEDS) {
    await db.insert(schema.masterTests).values({
      code: row.code,
      name: row.name,
      category: row.category,
      description: row.description,
      instructions: row.instructions,
      duration_sec: row.duration_sec,
      total_questions: row.total_questions,
      is_active: true,
    }).onConflictDoUpdate({
      target: schema.masterTests.code,
      set: {
        name: row.name,
        category: row.category,
        description: row.description,
        instructions: row.instructions,
        duration_sec: row.duration_sec,
        total_questions: row.total_questions,
        updated_at: new Date(),
      },
    });
  }

  const tests = await db.select({
    id: schema.masterTests.id,
    code: schema.masterTests.code,
  }).from(schema.masterTests);
  const idByCode = new Map(tests.map((t) => [t.code, t.id]));

  for (const row of MASTER_TEST_SEEDS) {
    if (!row.formula_type) continue;
    const testId = idByCode.get(row.code);
    if (!testId) continue;
    const published = SCORING_CONFIG_BY_CODE[row.code];
    if (published && published.formula_type !== row.formula_type) {
      throw new Error(`Scoring formula mismatch for ${row.code}`);
    }
    const configData = published
      ? published.config_data
      : {
          status: "draft",
          reason: "Named in the product document. The seed SQL has no config_data for this formula.",
        };
    await db.insert(schema.scoringConfigs).values({
      test_id: testId,
      formula_type: row.formula_type,
      config_data: configData,
    }).onConflictDoUpdate({
      target: schema.scoringConfigs.test_id,
      set: {
        formula_type: row.formula_type,
        config_data: configData,
      },
    });
  }

  const themeRows = TALENT_THEME_SEEDS.map((theme) => {
    const detail = THEME_DETAIL_SEEDS[theme.code];
    if (!detail) throw new Error(`Missing theme detail for ${theme.code}`);
    return {
      code: theme.code,
      name: theme.name,
      domain: theme.domain,
      description: `${theme.description}. Ciri utama: ${detail.ciriUtama.join("; ")}.`,
      suitable_roles: detail.suitableRoles,
      strengths: null,
      watch_out: null,
    };
  });
  await db.insert(schema.talentThemes).values(themeRows).onConflictDoUpdate({
    target: schema.talentThemes.code,
    set: {
      name: drizzleSql`excluded.name`,
      domain: drizzleSql`excluded.domain`,
      description: drizzleSql`excluded.description`,
      suitable_roles: drizzleSql`excluded.suitable_roles`,
      strengths: drizzleSql`excluded.strengths`,
      watch_out: drizzleSql`excluded.watch_out`,
    },
  });

  await db.insert(schema.strengthActivities).values(
    STRENGTH_ACTIVITY_SEEDS.map((activity) => ({
      code: activity.code,
      name: activity.name,
      definition: activity.definition,
      cluster: ACTIVITY_CLUSTER_SEEDS[activity.code] ?? null,
    })),
  ).onConflictDoUpdate({
    target: schema.strengthActivities.code,
    set: {
      name: drizzleSql`excluded.name`,
      definition: drizzleSql`excluded.definition`,
      cluster: drizzleSql`excluded.cluster`,
    },
  });

  await db.insert(schema.strengthTypologies).values(
    STRENGTH_TYPOLOGY_SEEDS.map((typology) => {
      const detail = TYPOLOGY_DETAIL_SEEDS[typology.code];
      return {
        code: typology.code,
        name: typology.name,
        description: typology.description,
        category: detail?.category ?? null,
        personal_branding: detail?.personalBranding ?? null,
      };
    }),
  ).onConflictDoUpdate({
    target: schema.strengthTypologies.code,
    set: {
      name: drizzleSql`excluded.name`,
      description: drizzleSql`excluded.description`,
      category: drizzleSql`excluded.category`,
      personal_branding: drizzleSql`excluded.personal_branding`,
    },
  });

  const packages = await sql`
    UPDATE service_packages AS sp
    SET test_code = 'talents_mapping', updated_at = now()
    FROM services AS s
    WHERE s.id = sp.service_id
      AND s.slug = 'talents-mapping'
      AND sp.test_code IS DISTINCT FROM 'talents_mapping'
    RETURNING sp.id
  `;

  const items = await sql`
    UPDATE test_items AS ti
    SET test_id = mt.id, updated_at = now()
    FROM master_tests AS mt
    WHERE ti.test_id IS NULL
      AND (
        lower(ti.test_code) = mt.code
        OR (upper(ti.test_code) = 'PAPIKOSTIK' AND mt.code = 'papi')
      )
    RETURNING ti.id, ti.test_code
  `;

  const sessions = await sql`
    UPDATE test_sessions AS ts
    SET test_id = mt.id, updated_at = now()
    FROM master_tests AS mt
    WHERE ts.test_id IS NULL
      AND (
        lower(ts.test_code) = mt.code
        OR (upper(ts.test_code) = 'PAPIKOSTIK' AND mt.code = 'papi')
      )
    RETURNING ts.id, ts.test_code
  `;

  const unmatchedItems = await sql`
    SELECT test_code, count(*)::int AS n
    FROM test_items
    WHERE test_id IS NULL
    GROUP BY test_code
    ORDER BY test_code
  `;
  const unmatchedSessions = await sql`
    SELECT test_code, count(*)::int AS n
    FROM test_sessions
    WHERE test_id IS NULL
    GROUP BY test_code
    ORDER BY test_code
  `;
  const counts = await sql`
    SELECT
      (SELECT count(*)::int FROM master_tests) AS master_tests,
      (SELECT count(*)::int FROM scoring_configs) AS scoring_configs,
      (SELECT count(*)::int FROM scoring_configs WHERE config_data->>'status' = 'draft') AS scoring_draft,
      (SELECT count(*)::int FROM scoring_configs WHERE formula_type = 'tm_rank_scale' AND (config_data->>'total_statements')::int = 170) AS tm_rank_configs,
      (SELECT count(*)::int FROM talent_themes) AS talent_themes,
      (SELECT count(*)::int FROM talent_themes WHERE jsonb_array_length(suitable_roles) > 0) AS themes_with_roles,
      (SELECT count(*)::int FROM talent_themes WHERE strengths IS NOT NULL) AS themes_with_strengths,
      (SELECT count(*)::int FROM talent_themes WHERE watch_out IS NOT NULL) AS themes_with_watch_out,
      (SELECT count(*)::int FROM strength_activities) AS strength_activities,
      (SELECT count(*)::int FROM strength_activities WHERE cluster IS NOT NULL) AS activities_with_cluster,
      (SELECT count(*)::int FROM strength_typologies) AS strength_typologies,
      (SELECT count(*)::int FROM strength_typologies WHERE category IS NOT NULL) AS typologies_with_category,
      (SELECT count(*)::int FROM strength_typologies WHERE personal_branding IS NOT NULL) AS typologies_with_branding,
      (SELECT count(*)::int FROM tm_results) AS tm_results,
      (SELECT count(*)::int FROM test_items WHERE lower(test_code) = 'talents_mapping' OR test_id IN (SELECT id FROM master_tests WHERE code = 'talents_mapping')) AS tm_items
  `;

  console.log("Talent catalog seed:");
  console.log(JSON.stringify({
    counts: counts[0],
    packages_pointed_at_talents_mapping: packages.length,
    items_backfilled: items.length,
    sessions_backfilled: sessions.length,
    unmatched_item_codes: unmatchedItems,
    unmatched_session_codes: unmatchedSessions,
  }, null, 2));

  await seedOverlapBanks();
}

const run = process.env.SEED_OVERLAP_ONLY === "1"
  ? seedOverlapBanks
  : process.env.SEED_CATALOG_ONLY === "1"
    ? seedTalentCatalog
    : main;

run().catch((e) => {
  console.error("Seeding failed:");
  console.error(e);
  process.exit(1);
});
