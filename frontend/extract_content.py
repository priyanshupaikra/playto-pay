import os
import re

out_dir = r"e:\fe-yc\frontend\src\pages"

def extract_main_content(filepath):
    with open(filepath, "r", encoding="utf-8") as f:
        content = f.read()

    main_match = re.search(r'<main[^>]*>(.*?)</main>', content, re.DOTALL | re.IGNORECASE)
    if not main_match:
        print(f"No <main> found in {filepath}")
        return
    
    main_inner = main_match.group(1)

    after_main = content[main_match.end():]
    
    # We want to match until the final </div>\n  );\n}
    after_match = re.search(r'(.*?)(?:</div>\s*\)\s*;\s*\})', after_main, re.DOTALL)
    extra = ""
    if after_match:
        extra = after_match.group(1).strip()
        # Remove mobile Nav
        extra = re.sub(r'<nav className="md:hidden.*?</nav>', '', extra, flags=re.DOTALL)
        extra = re.sub(r'<div className="md:hidden fixed bottom-0.*?</div>', '', extra, flags=re.DOTALL)
        
    comp_name = os.path.basename(filepath).replace('.jsx', '')
    
    new_content = f"""import React from 'react';
import {{ Link }} from 'react-router-dom';

export default function {comp_name}() {{
  return (
    <>
      {main_inner}
      {extra}
    </>
  );
}}
"""
    with open(filepath, "w", encoding="utf-8") as f:
        f.write(new_content)

for filename in os.listdir(out_dir):
    if filename.endswith(".jsx"):
        extract_main_content(os.path.join(out_dir, filename))

print("Extraction done")
