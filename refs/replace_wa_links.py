import re

def update_wa_link(filepath, old_pattern, new_link):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # We replace any href="https://wa.me/..." with the new_link
    # but only on the matched block or we do a regex based on the class pattern
    
    # Actually, simpler: search for the whole anchor tag if we know it.
    # Let's replace the href directly in those files where it's the main CTA.
    pass

import os

# 1. Konseling
file = "Rooting/mockup_layanan_konseling.html"
with open(file, 'r', encoding='utf-8') as f: content = f.read()
content = content.replace('href="https://wa.me/62895110099595" class="block w-full text-center border-2 border-dark text-dark font-bold py-3 rounded-xl hover:bg-dark hover:text-white transition-colors"', 'href="mockup_pendaftaran.html?layanan=konseling_individu&paket=basic" class="block w-full text-center border-2 border-dark text-dark font-bold py-3 rounded-xl hover:bg-dark hover:text-white transition-colors"')
content = content.replace('href="https://wa.me/62895110099595" class="block w-full text-center bg-primary text-white font-bold py-3.5 rounded-xl hover:bg-red-700 shadow-lg shadow-red-200 transition-colors"', 'href="mockup_pendaftaran.html?layanan=konseling_individu&paket=bundling_3" class="block w-full text-center bg-primary text-white font-bold py-3.5 rounded-xl hover:bg-red-700 shadow-lg shadow-red-200 transition-colors"')
# wait, there are two border-2 ones, let's fix them manually or via regex
content = re.sub(r'href="https://wa.me/62895110099595" class="block w-full text-center border-2 border-dark text-dark font-bold py-3 rounded-xl hover:bg-dark hover:text-white transition-colors"', r'href="mockup_pendaftaran.html?layanan=konseling_individu&paket=basic" class="block w-full text-center border-2 border-dark text-dark font-bold py-3 rounded-xl hover:bg-dark hover:text-white transition-colors"', content, count=1)
# 3rd block (Bundling 6)
content = re.sub(r'href="https://wa.me/62895110099595" class="block w-full text-center border-2 border-dark text-dark font-bold py-3 rounded-xl hover:bg-dark hover:text-white transition-colors"', r'href="mockup_pendaftaran.html?layanan=konseling_individu&paket=bundling_6" class="block w-full text-center border-2 border-dark text-dark font-bold py-3 rounded-xl hover:bg-dark hover:text-white transition-colors"', content, count=1)
with open(file, 'w', encoding='utf-8') as f: f.write(content)


# 2. Mental Health Check Up
file = "Rooting/mockup_layanan_mental_health.html"
with open(file, 'r', encoding='utf-8') as f: content = f.read()
content = re.sub(r'href="https://wa.me/62895110099595\?text=[^"]+" target="_blank" class="inline-block bg-mhDarkBlue hover:bg-black text-white font-bold py-3.5 px-8 rounded-lg transition-all', r'href="mockup_pendaftaran.html?layanan=mental_health_checkup&paket=premium" class="inline-block bg-mhDarkBlue hover:bg-black text-white font-bold py-3.5 px-8 rounded-lg transition-all', content)
with open(file, 'w', encoding='utf-8') as f: f.write(content)


# 3. Visual Coaching
file = "Rooting/mockup_layanan_visual_coaching.html"
with open(file, 'r', encoding='utf-8') as f: content = f.read()
content = content.replace('href="https://wa.me/#"', 'href="mockup_pendaftaran.html?layanan=visual_coaching&paket=standar"')
with open(file, 'w', encoding='utf-8') as f: f.write(content)

print("Updated WA links to pointing to Pendaftaran.")
