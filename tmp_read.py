from pathlib import Path 
lines=Path('src/i18n/en.json').read_text().splitlines() 
for idx,line in enumerate(lines,1): 
