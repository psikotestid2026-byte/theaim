import re

# =====================================================================
# 1. FIX ASSESSMENT PAGE — Update each button with correct params
# =====================================================================
file = "Rooting/mockup_layanan_assessment.html"
with open(file, "r", encoding="utf-8") as f:
    content = f.read()

# Card 1: Assessment Only (350k)
content = content.replace(
    'href="mockup_pendaftaran.html?layanan=talents_mapping" class="w-full block bg-secondary hover:bg-yellow-500 text-dark font-bold py-3.5 rounded-full transition-colors text-center shadow-sm"',
    'href="mockup_pendaftaran.html?layanan=talents_mapping&paket=assessment_only&harga=350000" class="w-full block bg-secondary hover:bg-yellow-500 text-dark font-bold py-3.5 rounded-full transition-colors text-center shadow-sm"'
)

# Card 2: Assessment + Pro Consul (600k)
content = content.replace(
    'href="mockup_pendaftaran.html?layanan=talents_mapping" class="w-full block bg-primary hover:bg-[#b91c1c] text-white font-bold py-4 rounded-full transition-colors text-center shadow-lg shadow-red-200"',
    'href="mockup_pendaftaran.html?layanan=talents_mapping&paket=assessment_pro_consul&harga=600000" class="w-full block bg-primary hover:bg-[#b91c1c] text-white font-bold py-4 rounded-full transition-colors text-center shadow-lg shadow-red-200"'
)

# Card 3: Assessment + Coach Alif (750k) — bg-dark button
# There are multiple bg-dark buttons, so we count which ones are which
# Card 3 (Coach Alif) button + Pro Consul Only button both use bg-dark
# Let's handle them separately
content = content.replace(
    'href="mockup_pendaftaran.html?layanan=talents_mapping" class="w-full block bg-dark hover:bg-black text-white font-bold py-4 rounded-full transition-colors text-center shadow-lg"',
    'href="mockup_pendaftaran.html?layanan=talents_mapping&paket=assessment_coach_alif&harga=750000" class="w-full block bg-dark hover:bg-black text-white font-bold py-4 rounded-full transition-colors text-center shadow-lg"',
    1  # first occurrence = Card 3 (Coach Alif)
)

# Pro Consul Only (300k) — second bg-dark button
content = content.replace(
    'href="mockup_pendaftaran.html?layanan=talents_mapping" class="w-full block bg-dark hover:bg-black text-white font-bold py-4 rounded-full transition-colors text-center shadow-lg"',
    'href="mockup_pendaftaran.html?layanan=talents_mapping&paket=pro_consul_only&harga=300000" class="w-full block bg-dark hover:bg-black text-white font-bold py-4 rounded-full transition-colors text-center shadow-lg"',
    1
)

# With Coach Alif (Pro Consul section - 500k) — bg-secondary button
content = content.replace(
    'href="mockup_pendaftaran.html?layanan=talents_mapping" class="w-full block bg-secondary hover:bg-yellow-500 text-dark font-bold py-4 rounded-full transition-colors text-center shadow-[0_0_15px_rgba(251,191,36,0.3)]"',
    'href="mockup_pendaftaran.html?layanan=talents_mapping&paket=pro_consul_coach_alif&harga=500000" class="w-full block bg-secondary hover:bg-yellow-500 text-dark font-bold py-4 rounded-full transition-colors text-center shadow-[0_0_15px_rgba(251,191,36,0.3)]"'
)

with open(file, "w", encoding="utf-8") as f:
    f.write(content)
print("Assessment page links fixed.")
