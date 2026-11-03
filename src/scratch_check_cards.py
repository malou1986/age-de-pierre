import os, re

peps_dir = 'c:/Users/malik/Documents/Malou/age-de-pierre/public/cards/peps'
existing = set(os.listdir(peps_dir))

with open('c:/Users/malik/Documents/Malou/age-de-pierre/src/data/cards.ts', 'r', encoding='utf-8') as f:
    text = f.read()

# Let's see what imageUrl values are in cards.ts
image_urls = re.findall(r"imageUrl:\s*'([^']+)'", text)
print(f"Total imageUrl references: {len(image_urls)}")
unique_urls = set(image_urls)
print(f"Unique imageUrls: {len(unique_urls)}")

missing_urls = []
for u in unique_urls:
    rel_path = u.lstrip('/')
    full_path = os.path.join('c:/Users/malik/Documents/Malou/age-de-pierre/public', rel_path)
    if not os.path.exists(full_path):
        missing_urls.append((u, full_path))

print(f"Missing imageUrl paths: {len(missing_urls)}")
for m in missing_urls:
    print("  MISSING ON DISK:", m[0])

# Also check getPepsArtwork logic against all cards
print("\nChecking getPepsArtwork fallback on all cards:")
# Let's extract each card object
card_blocks = re.findall(r"\{[^{}]*id:\s*'c_[^}]+bottomBonus:[^}]+\}[^}]*\}", text, re.DOTALL)
print(f"Card blocks found: {len(card_blocks)}")

for b in card_blocks:
    id_m = re.search(r"id:\s*'([^']+)'", b)
    cid = id_m.group(1) if id_m else 'unknown'
    
    img_m = re.search(r"imageUrl:\s*'([^']+)'", b)
    cimg = img_m.group(1) if img_m else None
    
    is_green = "'green'" in b or '"green"' in b
    sym_m = re.search(r"greenSymbol:\s*'([^']+)'", b)
    sym = sym_m.group(1) if sym_m else 'pottery'
    
    sand_m = re.search(r"sandType:\s*'([^']+)'", b)
    sand = sand_m.group(1) if sand_m else 'shaman'
    
    mult_m = re.search(r"sandMultiplier:\s*(\d+)", b)
    mult = int(mult_m.group(1)) if mult_m else 1
    
    target_img = None
    if cimg and cimg.startswith('/cards/peps/'):
        target_img = cimg
    elif is_green:
        target_img = f"/cards/peps/culture_{sym}.jpg"
    else:
        if mult >= 2:
            target_img = f"/cards/peps/sand_{sand}_{mult}.jpg"
        else:
            target_img = f"/cards/peps/sand_{sand}.jpg"
            
    full = os.path.join('c:/Users/malik/Documents/Malou/age-de-pierre/public', target_img.lstrip('/'))
    if not os.path.exists(full):
        print(f"  CARD {cid} => {target_img} DOES NOT EXIST!")
