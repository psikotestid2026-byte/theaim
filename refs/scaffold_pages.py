import re

def create_page(template_path, new_path, page_title, main_content, script_content=""):
    with open(template_path, 'r', encoding='utf-8') as f:
        content = f.read()

    # Extract head & nav (everything before <main class="flex-grow">)
    head_nav_match = re.search(r'(.*?<main class="flex-grow">)', content, re.DOTALL)
    head_nav = head_nav_match.group(1) if head_nav_match else ""

    # Replace title
    head_nav = re.sub(r'<title>.*?</title>', f'<title>{page_title}</title>', head_nav)

    # Make sure none of the nav items are active (remove specific active classes if needed)
    
    # Extract footer (everything after </main>)
    footer_match = re.search(r'(</main>.*)', content, re.DOTALL)
    footer = footer_match.group(1) if footer_match else ""

    # Insert script before </body> if provided
    if script_content:
        footer = footer.replace("</body>", f"{script_content}\n</body>")

    new_full_content = head_nav + "\n" + main_content + "\n" + footer

    with open(new_path, 'w', encoding='utf-8') as f:
        f.write(new_full_content)
    print(f"Created {new_path}")

pendaftaran_content = """
        <section class="py-20 px-4 bg-slate-50 min-h-[80vh] flex items-center justify-center">
            <div class="max-w-[600px] w-full bg-white rounded-3xl p-8 md:p-12 shadow-xl border border-gray-100">
                <div class="text-center mb-10">
                    <h1 class="text-3xl font-extrabold text-dark mb-3 tracking-tight">Formulir Pendaftaran</h1>
                    <p class="text-gray-500 font-medium text-sm">Silakan lengkapi data diri Anda untuk melanjutkan proses pendaftaran layanan TheAIM.</p>
                </div>

                <form action="mockup_pembayaran.html" method="GET" class="space-y-6">
                    <!-- Pilihan Layanan -->
                    <div>
                        <label for="layanan" class="block text-sm font-bold text-dark mb-2">Layanan yang Dipilih <span class="text-primary">*</span></label>
                        <div class="relative">
                            <select id="layanan" name="layanan" required class="w-full appearance-none bg-slate-50 border border-slate-200 text-dark font-medium rounded-xl px-5 py-3.5 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all cursor-pointer">
                                <option value="" disabled selected>-- Pilih Layanan --</option>
                                <option value="konseling_individu">Konseling Individu</option>
                                <option value="konseling_pasangan">Konseling Pasangan</option>
                                <option value="mental_health_checkup">Mental Health Check Up (Enneagram)</option>
                                <option value="visual_coaching">Visual Coaching</option>
                                <option value="therapy_seft">Therapy (SEFT)</option>
                                <option value="konsultasi_keuangan">Konsultasi Keuangan</option>
                                <option value="talents_mapping">Talents Mapping</option>
                                <option value="tes_psikologi">Tes Psikologi (Psikotes)</option>
                                <option value="ecourse">E-Course Life Reset</option>
                            </select>
                            <i class="fa-solid fa-chevron-down absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none text-sm"></i>
                        </div>
                    </div>

                    <!-- Pilihan Paket -->
                    <div>
                        <label for="paket" class="block text-sm font-bold text-dark mb-2">Paket/Sesi <span class="text-primary">*</span></label>
                        <div class="relative">
                            <select id="paket" name="paket" required class="w-full appearance-none bg-slate-50 border border-slate-200 text-dark font-medium rounded-xl px-5 py-3.5 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all cursor-pointer">
                                <option value="" disabled selected>-- Pilih Paket --</option>
                                <option value="basic">Paket Basic (1 Sesi)</option>
                                <option value="bundling_3">Paket Bundling (3 Sesi)</option>
                                <option value="bundling_6">Paket Perubahan (6 Sesi)</option>
                                <option value="premium">Paket Premium / Eksklusif</option>
                                <option value="standar">Standar</option>
                            </select>
                            <i class="fa-solid fa-chevron-down absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none text-sm"></i>
                        </div>
                    </div>

                    <div class="h-px w-full bg-slate-100 my-2"></div>

                    <!-- Nama Lengkap -->
                    <div>
                        <label for="nama" class="block text-sm font-bold text-dark mb-2">Nama Lengkap <span class="text-primary">*</span></label>
                        <input type="text" id="nama" name="nama" required placeholder="Masukkan nama lengkap Anda" class="w-full bg-slate-50 border border-slate-200 text-dark font-medium rounded-xl px-5 py-3.5 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all placeholder:text-slate-400">
                    </div>

                    <!-- Nomor HP -->
                    <div>
                        <label for="nohp" class="block text-sm font-bold text-dark mb-2">Nomor WhatsApp <span class="text-primary">*</span></label>
                        <div class="relative">
                            <span class="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500 font-bold border-r border-slate-200 pr-3">+62</span>
                            <input type="tel" id="nohp" name="nohp" required placeholder="81234567890" class="w-full bg-slate-50 border border-slate-200 text-dark font-medium rounded-xl pl-[4.5rem] pr-5 py-3.5 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all placeholder:text-slate-400">
                        </div>
                        <p class="text-[11px] text-slate-500 mt-2"><i class="fa-solid fa-circle-info mr-1"></i> Pastikan nomor aktif. Informasi lanjutan akan dikirimkan ke nomor ini.</p>
                    </div>

                    <div class="pt-4">
                        <button type="submit" class="w-full bg-primary text-white font-bold py-4 rounded-xl hover:bg-red-700 shadow-lg shadow-red-200 transition-all transform hover:-translate-y-1 flex justify-center items-center gap-2">
                            Lanjut ke Pembayaran <i class="fa-solid fa-arrow-right text-sm"></i>
                        </button>
                    </div>
                </form>
            </div>
        </section>
"""

pendaftaran_script = """
    <script>
        document.addEventListener('DOMContentLoaded', function() {
            // Parse URL parameters
            const urlParams = new URLSearchParams(window.location.search);
            const layanan = urlParams.get('layanan');
            const paket = urlParams.get('paket');

            if (layanan) {
                const layananSelect = document.getElementById('layanan');
                // Check if option exists, if not maybe create it or just try setting it
                for (let i = 0; i < layananSelect.options.length; i++) {
                    if (layananSelect.options[i].value === layanan) {
                        layananSelect.selectedIndex = i;
                        break;
                    }
                }
            }

            if (paket) {
                const paketSelect = document.getElementById('paket');
                for (let i = 0; i < paketSelect.options.length; i++) {
                    if (paketSelect.options[i].value === paket) {
                        paketSelect.selectedIndex = i;
                        break;
                    }
                }
            }
        });
    </script>
"""

pembayaran_content = """
        <section class="py-20 px-4 bg-slate-50 min-h-[80vh] flex items-center justify-center">
            <div class="max-w-[500px] w-full bg-white rounded-3xl p-8 md:p-12 shadow-xl border border-gray-100">
                <div class="text-center mb-8">
                    <div class="w-16 h-16 bg-red-50 text-primary rounded-2xl flex items-center justify-center text-2xl mx-auto mb-4">
                        <i class="fa-solid fa-wallet"></i>
                    </div>
                    <h1 class="text-2xl font-extrabold text-dark mb-2 tracking-tight">Pilih Pembayaran</h1>
                    <p class="text-gray-500 font-medium text-sm">Selesaikan pembayaran untuk mengamankan jadwal Anda.</p>
                </div>

                <div class="bg-slate-50 rounded-2xl p-5 mb-8 border border-slate-100">
                    <h3 class="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Ringkasan Pendaftaran</h3>
                    <div class="flex justify-between items-center mb-2">
                        <span class="text-sm font-medium text-slate-600" id="summary-layanan">Layanan Pilihan</span>
                    </div>
                    <div class="flex justify-between items-center pb-3 border-b border-slate-200">
                        <span class="text-sm font-medium text-slate-600" id="summary-paket">Paket Pilihan</span>
                    </div>
                    <div class="flex justify-between items-center pt-3">
                        <span class="text-sm font-bold text-dark">Total Tagihan</span>
                        <span class="text-lg font-black text-primary">Akan Dikonfirmasi</span>
                    </div>
                    <p class="text-[11px] text-slate-500 mt-3 italic">* Harga akan dikonfirmasi oleh admin setelah verifikasi jadwal.</p>
                </div>

                <div class="space-y-4 mb-8">
                    <label class="block relative border-2 border-slate-200 rounded-xl p-4 cursor-pointer hover:border-primary transition-colors has-[:checked]:border-primary has-[:checked]:bg-red-50">
                        <input type="radio" name="payment" value="qris" class="peer sr-only" checked>
                        <div class="flex items-center gap-4">
                            <div class="w-6 h-6 rounded-full border-2 border-slate-300 peer-checked:border-primary flex justify-center items-center relative">
                                <div class="w-3 h-3 bg-primary rounded-full opacity-0 scale-50 transition-all peer-checked:opacity-100 peer-checked:scale-100 absolute"></div>
                            </div>
                            <div class="flex-1">
                                <div class="font-bold text-dark text-sm">QRIS (Semua E-Wallet)</div>
                                <div class="text-xs text-slate-500 font-medium mt-0.5">OVO, GoPay, Dana, LinkAja, dll</div>
                            </div>
                            <i class="fa-solid fa-qrcode text-slate-400 text-xl"></i>
                        </div>
                    </label>

                    <label class="block relative border-2 border-slate-200 rounded-xl p-4 cursor-pointer hover:border-primary transition-colors has-[:checked]:border-primary has-[:checked]:bg-red-50">
                        <input type="radio" name="payment" value="transfer" class="peer sr-only">
                        <div class="flex items-center gap-4">
                            <div class="w-6 h-6 rounded-full border-2 border-slate-300 peer-checked:border-primary flex justify-center items-center relative">
                                <div class="w-3 h-3 bg-primary rounded-full opacity-0 scale-50 transition-all peer-checked:opacity-100 peer-checked:scale-100 absolute"></div>
                            </div>
                            <div class="flex-1">
                                <div class="font-bold text-dark text-sm">Transfer Bank</div>
                                <div class="text-xs text-slate-500 font-medium mt-0.5">BCA, Mandiri, BNI, BRI</div>
                            </div>
                            <i class="fa-solid fa-building-columns text-slate-400 text-xl"></i>
                        </div>
                    </label>
                </div>

                <a href="../index.html" class="block w-full bg-dark text-white text-center font-bold py-4 rounded-xl hover:bg-black shadow-lg shadow-slate-200 transition-all transform hover:-translate-y-1">
                    Konfirmasi & Ajukan Pendaftaran
                </a>
            </div>
        </section>
"""

pembayaran_script = """
    <script>
        document.addEventListener('DOMContentLoaded', function() {
            const urlParams = new URLSearchParams(window.location.search);
            const layanan = urlParams.get('layanan');
            const paket = urlParams.get('paket');

            if (layanan) {
                const text = layanan.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
                document.getElementById('summary-layanan').textContent = text;
            }
            if (paket) {
                const text = paket.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
                document.getElementById('summary-paket').textContent = text;
            }
        });
    </script>
"""

create_page('Rooting/mockup_tentang_theaim.html', 'Rooting/mockup_pendaftaran.html', 'Pendaftaran Layanan - TheAIM', pendaftaran_content, pendaftaran_script)
create_page('Rooting/mockup_tentang_theaim.html', 'Rooting/mockup_pembayaran.html', 'Pembayaran - TheAIM', pembayaran_content, pembayaran_script)
