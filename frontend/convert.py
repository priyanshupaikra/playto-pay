import os
import re

html_dir = r"e:\fe-yc\frontend\html"
out_dir = r"e:\fe-yc\frontend\src\pages"
os.makedirs(out_dir, exist_ok=True)

files = [
    ("dashboard.html", "Dashboard.jsx", "Dashboard"),
    ("ledger.html", "Ledger.jsx", "Ledger"),
    ("payoutdetails.html", "PayoutDetails.jsx", "PayoutDetails"),
    ("payouthistory.html", "PayoutHistory.jsx", "PayoutHistory"),
    ("settings.html", "Settings.jsx", "Settings"),
]

for html_file, jsx_file, comp_name in files:
    with open(os.path.join(html_dir, html_file), 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Extract body content
    body_match = re.search(r'<body[^>]*>(.*?)</body>', content, re.DOTALL | re.IGNORECASE)
    if body_match:
        body_content = body_match.group(1)
        body_tag_match = re.search(r'<body([^>]*)>', content, re.IGNORECASE)
        body_attrs = body_tag_match.group(1) if body_tag_match else ""
    else:
        body_content = ""
        body_attrs = ""
    
    # Convert HTML comments to JSX comments
    body_content = re.sub(r'<!--(.*?)-->', r'{/*\1*/}', body_content, flags=re.DOTALL)
    
    # Convert class to className
    body_content = re.sub(r'\bclass=', 'className=', body_content)
    body_attrs = re.sub(r'\bclass=', 'className=', body_attrs)
    
    # Convert for to htmlFor
    body_content = re.sub(r'\bfor=', 'htmlFor=', body_content)
    
    # Fix self closing tags
    body_content = re.sub(r'(<input[^>]*?)(?<!/)>', r'\1 />', body_content)
    body_content = re.sub(r'(<img[^>]*?)(?<!/)>', r'\1 />', body_content)
    body_content = re.sub(r'(<br[^>]*?)(?<!/)>', r'\1 />', body_content)
    body_content = re.sub(r'(<hr[^>]*?)(?<!/)>', r'\1 />', body_content)
    
    # Inline styles
    body_content = body_content.replace(
        "style=\"font-variation-settings: 'FILL' 1;\"",
        "style={{ fontVariationSettings: \"'FILL' 1\" }}"
    )
    body_content = body_content.replace(
        "style=\"font-variation-settings: 'FILL' 0;\"",
        "style={{ fontVariationSettings: \"'FILL' 0\" }}"
    )

    # Convert <a> tags with specific text to <Link to="...">
    # To avoid crossing tags, we match <a ... > ... </a>
    # We will use a function to determine the `to`
    def replacer(m):
        attrs = m.group(1)
        inner = m.group(2)
        
        to_path = '"#"'
        text_upper = inner.upper()
        if "DASH" in text_upper:
            to_path = '"/dashboard"'
        elif "PAY-0041" in text_upper or "PAY-0042" in text_upper:
            to_path = '"/payouts/PAY-0042"'
        elif "PAY" in text_upper or "PAYOUTS" in text_upper:
            to_path = '"/payouts"'
        elif "LEDGER" in text_upper:
            to_path = '"/ledger"'
        elif "SET" in text_upper or "SETTINGS" in text_upper:
            to_path = '"/settings"'
        
        # replace href="#" in attrs
        attrs = re.sub(r'href="[^"]*"', f'to={to_path}', attrs)
        return f'<Link {attrs}>{inner}</Link>'
    
    body_content = re.sub(r'<a([^>]*?)>(.*?)</a>', replacer, body_content, flags=re.DOTALL)

    jsx_content = f"""import React from 'react';
import {{ Link }} from 'react-router-dom';

export default function {comp_name}() {{
  return (
    <div {body_attrs}>
      {body_content}
    </div>
  );
}}
"""
    
    with open(os.path.join(out_dir, jsx_file), 'w', encoding='utf-8') as f:
        f.write(jsx_content)

print("Done")
