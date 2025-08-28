import re

# JavaScriptファイルから使用されているフィールドを抽出
js_files = [
    'public/js/lp-otsukisama-display.js',
    'public/js/lp-otsukisama-display-line.js',
    'public/js/lp-otsukisama-api.js'
]

used_fields = set()

for js_file in js_files:
    try:
        with open(js_file, 'r') as f:
            content = f.read()
            
            # dc.fieldName パターンを探す
            dc_matches = re.findall(r'dc\.(\w+)', content)
            for match in dc_matches:
                used_fields.add(f'dynamicContent.{match}')
            
            # pattern.fieldName パターンを探す
            pattern_matches = re.findall(r'pattern\.(\w+)', content)
            for match in pattern_matches:
                used_fields.add(match)
            
            # pattern['fieldName'] パターンを探す
            bracket_matches = re.findall(r"pattern\['(\w+)'\]", content)
            for match in bracket_matches:
                used_fields.add(match)
    except:
        pass

# dynamicContentのサブフィールドをチェック
dc_fields = {
    'criticalTiming1', 'criticalTiming2', 'criticalTiming3',
    'loveCaution', 'loveIntro', 
    'loveMonth1Text', 'loveMonth1Title', 'loveMonth2Text', 'loveMonth2Title', 'loveMonth3Text', 'loveMonth3Title',
    'luckyColor', 'luckyItem', 'moneyPeakTiming',
    'month1Text', 'month1Title', 'month2Text', 'month2Title', 'month3Text', 'month3Title',
    'overallCaution', 'overallIntro', 'overallTitle',
    'relationshipCaution', 'relationshipTransition', 
    'transitionAdvice', 'workTitle'
}

# 実際に使われているdynamicContentフィールドを確認
used_dc_fields = set()
for field in used_fields:
    if field.startswith('dynamicContent.'):
        used_dc_fields.add(field.replace('dynamicContent.', ''))

print("使われていないdynamicContentフィールド:")
unused = dc_fields - used_dc_fields
if unused:
    for field in sorted(unused):
        print(f"  - {field}")
else:
    print("  なし（すべて使用されている）")

print("\n実際に使われているフィールド:")
for field in sorted(used_fields):
    if not field.startswith('dynamicContent.'):
        print(f"  - {field}")
