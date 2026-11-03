with open('c:/Users/malik/Documents/Malou/age-de-pierre/src/data/cards.ts', 'r', encoding='utf-8') as f:
    text = f.read()

import re
matches = re.findall(r"id:\s*'([^']+)'", text)
print(f"Total id matches: {len(matches)}")
print("Matches:", matches)
