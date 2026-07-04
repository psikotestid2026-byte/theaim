import os

for root, dirs, files in os.walk("."):
    for filename in files:
        if filename.endswith(".html"):
            filepath = os.path.join(root, filename)
            with open(filepath, 'r', encoding='utf-8') as f:
                content = f.read()

            new_content = content.replace('class="h-10 w-auto"', 'class="h-14 md:h-16 w-auto"')
            
            if new_content != content:
                with open(filepath, 'w', encoding='utf-8') as f:
                    f.write(new_content)
                print(f"Resized in {filepath}")

