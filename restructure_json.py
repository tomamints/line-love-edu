import json

def restructure_pattern(pattern):
    """パターンデータを新しい構造に再編成"""
    
    dc = pattern.get('dynamicContent', {})
    fortune = pattern.get('fortune', {})
    newSections = pattern.get('newSections', {})
    
    # 新しい構造を作成
    new_pattern = {
        'moonPhase': pattern['moonPhase'],
        'hiddenPhase': pattern['hiddenPhase'],
        
        'overall': {
            'mainText': fortune.get('overall', ''),
            'title': dc.get('overallTitle', ''),
            'intro': dc.get('overallIntro', ''),
            'caution': dc.get('overallCaution', ''),
            'transitionAdvice': dc.get('transitionAdvice', ''),
            'month1': {
                'title': dc.get('month1Title', ''),
                'text': dc.get('month1Text', '')
            },
            'month2': {
                'title': dc.get('month2Title', ''),
                'text': dc.get('month2Text', '')
            },
            'month3': {
                'title': dc.get('month3Title', ''),
                'text': dc.get('month3Text', '')
            },
            'criticalTimings': [
                dc.get('criticalTiming1', ''),
                dc.get('criticalTiming2', ''),
                dc.get('criticalTiming3', '')
            ]
        },
        
        'love': {
            'mainText': fortune.get('love', ''),
            'intro': dc.get('loveIntro', ''),
            'caution': dc.get('loveCaution', ''),
            'month1': {
                'title': dc.get('loveMonth1Title', ''),
                'text': dc.get('loveMonth1Text', '')
            },
            'month2': {
                'title': dc.get('loveMonth2Title', ''),
                'text': dc.get('loveMonth2Text', '')
            },
            'month3': {
                'title': dc.get('loveMonth3Title', ''),
                'text': dc.get('loveMonth3Text', '')
            },
            # 新規セクションも統合
            'destinyMeeting': newSections.get('love', {}).get('destinyMeeting', ''),
            'admirerType': newSections.get('love', {}).get('admirerType', ''),
            'dangerousType': newSections.get('love', {}).get('dangerousType', '')
        },
        
        'work': {
            'mainText': fortune.get('work', ''),
            'title': dc.get('workTitle', '')
        },
        
        'relationship': {
            'mainText': fortune.get('relationship', ''),
            'transition': dc.get('relationshipTransition', ''),
            'caution': dc.get('relationshipCaution', ''),
            # 新規セクションも統合
            'newConnections': newSections.get('relationship', {}).get('newConnections', ''),
            'challengesAndSolutions': newSections.get('relationship', {}).get('challengesAndSolutions', '')
        },
        
        'money': {
            'mainText': fortune.get('money', ''),
            'peakTiming': dc.get('moneyPeakTiming', ''),
            # 新規セクションも統合
            'moneyTrouble': newSections.get('money', {}).get('moneyTrouble', '')
        }
    }
    
    return new_pattern

# データを読み込み
with open('public/data/otsukisama-patterns-v2.json', 'r') as f:
    data = json.load(f)

# 新しい構造のデータを作成
new_data = {}
for pattern_id, pattern in data.items():
    new_data[pattern_id] = restructure_pattern(pattern)

# 新しいファイルに保存
with open('public/data/otsukisama-patterns-v3.json', 'w', encoding='utf-8') as f:
    json.dump(new_data, f, ensure_ascii=False, indent=2)

print("✅ 新しい構造でv3.jsonを作成しました")

# パターン0の新構造を表示
print("\nパターン0の新構造:")
print("=" * 50)
for key in new_data['0'].keys():
    if key in ['moonPhase', 'hiddenPhase']:
        print(f"{key}: {new_data['0'][key]}")
    else:
        print(f"{key}:")
        if isinstance(new_data['0'][key], dict):
            for subkey in new_data['0'][key].keys():
                if isinstance(new_data['0'][key][subkey], str):
                    preview = new_data['0'][key][subkey][:30] + "..." if len(new_data['0'][key][subkey]) > 30 else new_data['0'][key][subkey]
                    print(f"  - {subkey}: {preview}")
                elif isinstance(new_data['0'][key][subkey], dict):
                    print(f"  - {subkey}: (dict)")
                elif isinstance(new_data['0'][key][subkey], list):
                    print(f"  - {subkey}: (list with {len(new_data['0'][key][subkey])} items)")
