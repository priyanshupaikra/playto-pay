import os
import re

out_dir = r"e:\fe-yc\frontend\src\pages"

def replace_links(content):
    # First convert all <a to <Link and </a> to </Link>
    content = content.replace("<a ", "<Link ")
    content = content.replace("</a>", "</Link>")
    
    # We have to map href="#" to proper routes.
    # It's easier if we replace `href="#"` with `to="..."` based on the inner text.
    # We will use a regex to look at the <Link ... href="#">...TEXT...</Link>
    
    # Actually, let's just do a generic replacement for the ones we know
    
    # Replace `href` with `to`
    content = content.replace('href="#"', 'to="#"')
    
    # Then we can replace `to="#"` with specific paths based on the text near it or inside it
    # We can do this safely using regex
    
    # 1. Dashboard
    content = re.sub(r'to="#"([^>]*>.*?DASH(?:BOARD)?\s*</Link>)', r'to="/dashboard"\1', content, flags=re.IGNORECASE | re.DOTALL)
    # 2. Payouts (PAY, PAYOUTS, <- BACK TO PAYOUTS)
    content = re.sub(r'to="#"([^>]*>.*?(?:PAYOUTS|PAY)\s*</Link>)', r'to="/payouts"\1', content, flags=re.IGNORECASE | re.DOTALL)
    # 3. Ledger (LEDGER)
    content = re.sub(r'to="#"([^>]*>.*?LEDGER\s*</Link>)', r'to="/ledger"\1', content, flags=re.IGNORECASE | re.DOTALL)
    # 4. Settings (SETTINGS, SET)
    content = re.sub(r'to="#"([^>]*>.*?(?:SETTINGS|SET)\s*</Link>)', r'to="/settings"\1', content, flags=re.IGNORECASE | re.DOTALL)
    
    # 5. Payout Details (PAY-0042 ->, PAY-0041 ->)
    content = re.sub(r'to="#"([^>]*>.*?PAY-\d+\s*->\s*</Link>)', r'to="/payouts/PAY-0042"\1', content, flags=re.IGNORECASE | re.DOTALL)
    
    # Any other to="#" can stay as to="#" for now, React Router handles it.
    
    return content

for filename in os.listdir(out_dir):
    if filename.endswith(".jsx"):
        path = os.path.join(out_dir, filename)
        with open(path, "r", encoding="utf-8") as f:
            content = f.read()
        
        new_content = replace_links(content)
        
        with open(path, "w", encoding="utf-8") as f:
            f.write(new_content)

print("Links updated")
