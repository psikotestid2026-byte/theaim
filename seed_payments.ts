import { neon } from "@neondatabase/serverless";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const sql = neon(process.env.DATABASE_URL_UNPOOLED!);

async function main() {
  console.log("Seeding payment methods and instructions...");
  
  // Clean up existing
  await sql`TRUNCATE payment_methods, payment_instructions CASCADE`;

  // Insert payment methods
  await sql`
    INSERT INTO "public"."payment_methods" ("id", "code", "name", "logo_url", "channel_type", "provider", "admin_fee_flat", "admin_fee_pct", "is_active", "is_redirect", "sort_order") VALUES
    (1, 'GOPAY', 'GoPay', 'https://upload.wikimedia.org/wikipedia/commons/8/86/Gopay_logo.svg', 'e_wallet', 'Midtrans', 0, 0.00, 't', 'f', 3),
    (2, 'BCA', 'BCA Virtual Account', 'https://4jgsaomzelkwriht.public.blob.vercel-storage.com/bca9-IbKNyHu93Cn6SG23ej52n4WGSr9Q8i.jpg', 'virtual_account', 'Xendit', 4500, 0.00, 't', 'f', 4),
    (3, 'MANDIRI', 'Mandiri Virtual Account', 'https://4jgsaomzelkwriht.public.blob.vercel-storage.com/mandiri-OiJcNXAXphLUz93kRkHBT0cDlelKq4.png', 'virtual_account', 'Xendit', 4500, 0.00, 't', 'f', 5),
    (4, 'BSI', 'BSI Virtual Account', 'https://upload.wikimedia.org/wikipedia/commons/a/a0/Bank_Syariah_Indonesia.svg', 'virtual_account', 'Xendit', 4500, 0.00, 't', 'f', 2),
    (5, 'QR_CODE', 'QRIS Dynamic', 'https://upload.wikimedia.org/wikipedia/commons/a/a2/Logo_QRIS.svg', 'qris', 'Xendit', 2500, 0.00, 't', 'f', 1),
    (6, 'SHOPEEPAY', 'ShopeePay', 'https://upload.wikimedia.org/wikipedia/commons/f/fe/Shopee.svg', 'e_wallet', 'Xendit', 0, 0.00, 't', 'f', 6),
    (7, 'DANA', 'DANA', 'https://upload.wikimedia.org/wikipedia/commons/7/72/Logo_dana_blue.svg', 'e_wallet', 'Xendit', 0, 0.00, 't', 'f', 7),
    (8, 'LINKAJA', 'LinkAja', 'https://4jgsaomzelkwriht.public.blob.vercel-storage.com/linkaja-logo-MQ0RdHT13BwF96O54LxltoM7rNK6JY.png', 'e_wallet', 'Xendit', 0, 0.00, 't', 'f', 8),
    (9, 'BRI', 'BRI Virtual Account', 'https://4jgsaomzelkwriht.public.blob.vercel-storage.com/bri-PAGx45zIqEWTHhyJvBkbAXZouRYTfG.png', 'virtual_account', 'Xendit', 4500, 0.00, 't', 'f', 9),
    (10, 'BNI', 'BNI Virtual Account', 'https://4jgsaomzelkwriht.public.blob.vercel-storage.com/bni-YU2aAc67bEdD0QHeYCWqhRRmpAErd0.png', 'virtual_account', 'Xendit', 4500, 0.00, 't', 'f', 10),
    (18, 'BCA_MANUAL', 'BCA (Transfer Manual)', 'https://4jgsaomzelkwriht.public.blob.vercel-storage.com/bca9-Zi5EfD9vPgoDPwdsjIORMaXIj7mSoB.jpg', 'bank_transfer', 'Manual', 0, 0.00, 't', 'f', 18)
  `;

  // Insert instructions
  await sql`
    INSERT INTO "public"."payment_instructions" ("id", "payment_method_id", "title", "content", "sort_order") VALUES
    (1, 2, 'Pembayaran via Mbanking', '1. Buka aplikasi BCA Mobile\n2. Pilih m-BCA, lalu pilih m-Transfer\n3. Masukkan nomor Virtual Account Anda\n4. Klik tombol Kirim di pojok kanan atas untuk melanjutkan\n5. Masukkan PIN m-BCA Anda untuk otorisasi transaksi', 1),
    (2, 2, 'Pembayaran via ATM', '1. Masukkan kartu ATM BCA dan PIN Anda\n2. Pilih menu Transaksi Lainnya > Transfer > Ke Rekening BCA Virtual Account\n3. Masukkan nomor Virtual Account\n4. Verifikasi detail Virtual Account dan pilih Benar untuk konfirmasi', 3),
    (4, 3, 'Pembayaran via Livin', '1. Login ke aplikasi Livin’ by Mandiri\n2. Pilih Transfer IDR > Transfer ke penerima baru\n3. Masukkan nomor virtual account\n4. Masukkan atau konfirmasi jumlah pembayaran\n5. Masukkan PIN MPIN Anda', 4),
    (16, 4, 'Pembayaran via Byond', '1. Login ke BYOND BSI\n2. Pilih menu Bayar & Beli\n3. Cari Xendit, Pilih Prefix VA: 9347 atau 9655\n4. Masukkan kode (tanpa prefix)\n5. Masukkan PIN', 16),
    (30, 1, 'Pembayaran via Gojek / GoPay', '1. Buka aplikasi Gojek / GoPay Anda.\n2. Pilih menu Bayar / Scan.\n3. Scan QR Code yang tampil di layar atau upload dari galeri.', 30),
    (31, 6, 'Pembayaran via Shopee', '1. Buka aplikasi Shopee Anda.\n2. Pilih menu Bayar / Scan.\n3. Scan QR Code yang tampil di layar atau upload dari galeri.', 31),
    (34, 5, 'Pembayaran via QRIS', '1. Buka aplikasi pembayaran pilihan Anda (GoPay, OVO, DANA, LinkAja, BCA Mobile, dll).\n2. Pilih menu Scan / Bayar.\n3. Scan QR Code yang tampil di layar.\n4. Konfirmasi pembayaran dan masukkan PIN Anda.', 34),
    (35, 18, 'Instruksi Transfer Manual BCA', '1. Transfer sesuai nominal (hingga 3 digit terakhir) ke rekening berikut:\n2. Bank BCA: 1234567890\n3. Atas Nama: TheAIM\n4. Simpan bukti transfer Anda.\n5. Konfirmasi pembayaran melalui WhatsApp atau unggah bukti di halaman status.', 35)
  `;

  // Fix sequence
  await sql`SELECT setval('payment_methods_id_seq', (SELECT MAX(id) FROM payment_methods))`;
  await sql`SELECT setval('payment_instructions_id_seq', (SELECT MAX(id) FROM payment_instructions))`;

  console.log("Done!");
}

main().catch(console.error);
