import os, sys, re

peps_dir = 'c:/Users/malik/Documents/Malou/age-de-pierre/public/cards/peps'
existing_peps = set(os.listdir(peps_dir))
cards_dir = 'c:/Users/malik/Documents/Malou/age-de-pierre/public/cards'
existing_cards = set(os.listdir(cards_dir))

with open('c:/Users/malik/Documents/Malou/age-de-pierre/src/data/cards.ts', 'r', encoding='utf-8') as f:
    text = f.read()

count = 0
for m in re.finditer(r"id:\s*'(c_\d+)'(.*?)(?=\bid:\s*'c_\d+'|\Z)", text, re.DOTALL):
    count += 1
    cid = m.group(1)
    chunk = m.group(2)
    
    is_green = "type: 'green'" in chunk
    sym = None
    if is_green:
        sm = re.search(r"greenSymbol:\s*'([^']+)'", chunk)
        sym = sm.group(1) if sm else 'unknown'
        target = f'culture_{sym}.jpg'
    else:
        st_m = re.search(r"sandType:\s*'([^']+)'", chunk)
        st = st_m.group(1) if st_m else 'unknown'
        mult_m = re.search(r"sandMultiplier:\s*(\d+)", chunk)
        mult = int(mult_m.group(1)) if mult_m else 1
        if mult >= 2:
            target = f'sand_{st}_{mult}.jpg'
        else:
            target = f'sand_{st}.jpg'
            
    if target not in existing_peps:
        print(f'ERROR: {cid} => {target} NOT FOUND in /cards/peps/!')
    else:
        full = os.path.join(peps_dir, target)
        if os.path.getsize(full) == 0:
            print(f'ERROR: {cid} => {target} is ZERO BYTES!')
            
    img_m = re.search(r"imageUrl:\s*'([^']+)'", chunk)
    img_val = img_m.group(1) if img_m else 'NO_IMAGE'
    if img_val.startswith('/cards/') and not img_val.startswith('/cards/peps/'):
        fname = img_val.replace('/cards/', '')
        if fname not in existing_cards:
            print(f'ERROR: {cid} => {fname} NOT FOUND in /cards/!')

print(f'Finished checking all {count} cards!')
