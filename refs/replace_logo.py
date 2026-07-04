import os
import re

def replace_logo_in_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    if "Rooting/" in filepath or "Rooting\\" in filepath:
        logo_path = "../Logo2/logo_theaim.png"
    else:
        logo_path = "./Logo2/logo_theaim.png"

    # More permissive regex
    pattern = r'<div class="[^"]*w-\d+ h-\d+ bg-primary[^"]*">\s*<i class="fa-solid fa-puzzle-piece[^"]*"></i>\s*</div>\s*<span[^>]*>The<span class="text-primary font-black">AIM</span></span>'
    
    new_content = re.sub(pattern, f'<img src="{logo_path}" alt="TheAIM Logo" class="h-10 w-auto">', content)
    
    # Also, some might have no div container? Let's check for any remaining The<span class="text-primary font-black">AIM</span></span>
    
    if new_content != content:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(new_content)
        print(f"Updated {filepath}")

for root, dirs, files in os.walk("."):
    for filename in files:
        if filename.endswith(".html"):
            replace_logo_in_file(os.path.join(root, filename))

