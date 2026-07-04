import re

file = "Rooting/mockup_layanan_assessment.html"
with open(file, "r", encoding="utf-8") as f:
    content = f.read()

# 1. Update Assessment Only price to 350k
content = content.replace('<span class="text-5xl font-black text-dark tracking-tighter">300<span class="text-2xl">K</span></span>', '<span class="text-5xl font-black text-dark tracking-tighter">350<span class="text-2xl">K</span></span>', 1)

# 2. Update Assessment + Pro Consul price to 600k
content = content.replace('<span class="text-5xl font-black text-dark tracking-tighter">500<span class="text-2xl">K</span></span>', '<span class="text-5xl font-black text-dark tracking-tighter">600<span class="text-2xl">K</span></span>', 1)

# 3. Add the third card "Assessment + Pro Consul with Coach Alif (750k)" to the Layer 1 grid.
# Find the grid div
grid_match = re.search(r'<div class="grid md:grid-cols-2 gap-6 lg:gap-8 max-w-4xl mx-auto items-stretch">', content)
if grid_match:
    content = content.replace(grid_match.group(0), '<div class="grid md:grid-cols-3 gap-6 lg:gap-8 max-w-[1100px] mx-auto items-stretch">')

# Extract card 2 as template for card 3
card2_pattern = re.compile(r'(<!-- 2\. Assessment \+ Pro Consultation \(Best Value\) -->.*?</div>\s*</div>\s*</div>)', re.DOTALL)
c2_match = card2_pattern.search(content)

if c2_match:
    card2_html = c2_match.group(1)
    
    # Create card 3
    card3_html = card2_html.replace('<!-- 2. Assessment + Pro Consultation (Best Value) -->', '<!-- 3. Assessment + Coach Alif -->')
    card3_html = card3_html.replace('border-2 border-primary', 'border-2 border-secondary')
    # Change ribbon
    card3_html = card3_html.replace('<div class="ribbon-wrapper"><div class="ribbon">Best Value</div></div>', '<div class="ribbon-wrapper"><div class="ribbon" style="background-color: #18181b; color: white;">Premium</div></div>')
    card3_html = card3_html.replace('<div class="bg-primary py-7 text-center text-white border-b border-red-700">', '<div class="bg-gradient-to-br from-gray-900 to-black py-7 text-center text-white border-b border-gray-800">')
    card3_html = card3_html.replace('<p class="text-[11px] font-bold text-white/60 uppercase tracking-widest mb-1">Paket Lengkap</p>', '<p class="text-[11px] font-bold text-secondary uppercase tracking-widest mb-1">Paket Eksklusif</p>')
    card3_html = card3_html.replace('<h3 class="text-2xl font-black">Assessment + Pro Consul</h3>', '<h3 class="text-2xl font-black text-secondary leading-tight">Assessment +<br>Coach Alif</h3>')
    
    card3_html = card3_html.replace('<span class="text-5xl font-black text-dark tracking-tighter">600<span class="text-2xl">K</span></span>', '<span class="text-5xl font-black text-dark tracking-tighter">750<span class="text-2xl">K</span></span>')
    
    # Update button
    card3_html = card3_html.replace('<a href="#" class="w-full block bg-primary hover:bg-[#b91c1c] text-white font-bold py-4 rounded-full transition-colors text-center shadow-lg shadow-red-200">', '<a href="#" class="w-full block bg-dark hover:bg-black text-white font-bold py-4 rounded-full transition-colors text-center shadow-lg">')
    
    # Text changes
    card3_html = card3_html.replace('Sesi Pro Consultation 60 Menit (Online / Offline Bandung)', 'Sesi Pro Consultation 60 Menit bersama Coach Alif (Online / Offline Bandung)')
    
    # Inject card 3 right after card 2.
    # We replace the whole card2 with card2 + card3
    content = content.replace(card2_html, card2_html + "\n\n" + card3_html)


# 4. Clarify "Sesi Pro Consultation 60 Menit (Online / Offline Bandung)"
# Replace "Sesi Pro Consultation 60 Menit (Associate Coach)"
content = content.replace('Sesi Pro Consultation 60 Menit (Associate Coach)', 'Sesi Pro Consultation 60 Menit (Online / Offline Bandung)')

# Ensure all CTAs point to mockup_pendaftaran if not already
content = content.replace('href="#"', 'href="mockup_pendaftaran.html?layanan=talents_mapping"')

with open(file, "w", encoding="utf-8") as f:
    f.write(content)
print("Updated successfully")
