import json 
with open('src/i18n/en.json', encoding='utf-8') as f: 
    data = json.load(f)['dream'] 
print(json.dumps(data, ensure_ascii=False, indent=2)) 
