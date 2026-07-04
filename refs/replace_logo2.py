import os
import re

def replace_logo_in_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    if "Rooting/" in filepath or "Rooting\\" in filepath:
        logo_path = "../Logo2/logo_theaim.png"
    else:
        logo_path = "./Logo2/logo_theaim.png"

    # Replace the remaining text logos that might not have a puzzle piece right before them, or missed by the previous regex.
    # We will just replace `<span>The<span class="text-primary font-black">AIM</span></span>`
    # or `<span class="text-white">The<span class="text-primary font-black">AIM</span></span>`
    # and also remove any preceding puzzle piece div if it's within 150 chars.
    
    pattern_text = r'(<div[^>]*>\s*<i class="fa-solid fa-puzzle-piece[^>]*></i>\s*</div>\s*)?<span[^>]*>The<span class="text-primary font-black">AIM</span></span>'
    
    new_content = re.sub(pattern_text, f'<img src="{logo_path}" alt="TheAIM Logo" class="h-10 w-auto">', content)
    
    if new_content != content:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(new_content)
        print(f"Updated {filepath}")

for root, dirs, files in os.walk("."):
    for filename in files:
        if filename.endswith(".html"):
            replace_logo_in_file(os.path.join(root, filename))

