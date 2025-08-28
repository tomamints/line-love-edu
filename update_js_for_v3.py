#!/usr/bin/env python3
"""
JavaScriptファイルを新しいJSON構造に対応させるための変更マッピング
"""

# 変更マッピング
REPLACEMENTS = [
    # データローダーの変更
    ('otsukisama-patterns-v2.json', 'otsukisama-patterns-v3.json'),
    
    # overall関連
    ('pattern.fortune.overall', 'pattern.overall.mainText'),
    ('dc.overallTitle', 'pattern.overall.title'),
    ('dc.overallIntro', 'pattern.overall.intro'),
    ('dc.overallCaution', 'pattern.overall.caution'),
    ('dc.transitionAdvice', 'pattern.overall.transitionAdvice'),
    ('dc.month1Title', 'pattern.overall.month1.title'),
    ('dc.month1Text', 'pattern.overall.month1.text'),
    ('dc.month2Title', 'pattern.overall.month2.title'),
    ('dc.month2Text', 'pattern.overall.month2.text'),
    ('dc.month3Title', 'pattern.overall.month3.title'),
    ('dc.month3Text', 'pattern.overall.month3.text'),
    ('dc.criticalTiming1', 'pattern.overall.criticalTimings[0]'),
    ('dc.criticalTiming2', 'pattern.overall.criticalTimings[1]'),
    ('dc.criticalTiming3', 'pattern.overall.criticalTimings[2]'),
    
    # love関連
    ('pattern.fortune.love', 'pattern.love.mainText'),
    ('dc.loveIntro', 'pattern.love.intro'),
    ('dc.loveCaution', 'pattern.love.caution'),
    ('dc.loveMonth1Title', 'pattern.love.month1.title'),
    ('dc.loveMonth1Text', 'pattern.love.month1.text'),
    ('dc.loveMonth2Title', 'pattern.love.month2.title'),
    ('dc.loveMonth2Text', 'pattern.love.month2.text'),
    ('dc.loveMonth3Title', 'pattern.love.month3.title'),
    ('dc.loveMonth3Text', 'pattern.love.month3.text'),
    ('pattern.newSections.love.destinyMeeting', 'pattern.love.destinyMeeting'),
    ('pattern.newSections.love.admirerType', 'pattern.love.admirerType'),
    ('pattern.newSections.love.dangerousType', 'pattern.love.dangerousType'),
    
    # work関連
    ('pattern.fortune.work', 'pattern.work.mainText'),
    ('dc.workTitle', 'pattern.work.title'),
    
    # relationship関連
    ('pattern.fortune.relationship', 'pattern.relationship.mainText'),
    ('dc.relationshipTransition', 'pattern.relationship.transition'),
    ('dc.relationshipCaution', 'pattern.relationship.caution'),
    ('pattern.newSections.relationship.newConnections', 'pattern.relationship.newConnections'),
    ('pattern.newSections.relationship.challengesAndSolutions', 'pattern.relationship.challengesAndSolutions'),
    
    # money関連
    ('pattern.fortune.money', 'pattern.money.mainText'),
    ('dc.moneyPeakTiming', 'pattern.money.peakTiming'),
    ('pattern.newSections.money.moneyTrouble', 'pattern.money.moneyTrouble'),
    
    # 構造チェックの変更
    ('pattern.dynamicContent', 'pattern.overall'),
    ('pattern.newSections && pattern.newSections.love', 'pattern.love'),
    ('pattern.newSections && pattern.newSections.relationship', 'pattern.relationship'),
    ('pattern.newSections && pattern.newSections.money', 'pattern.money'),
]

print("変更マッピングを作成しました")
print(f"合計 {len(REPLACEMENTS)} 個の置換パターン")

# CSVとして出力（確認用）
with open('js_replacements.csv', 'w', encoding='utf-8') as f:
    f.write('old_pattern,new_pattern\n')
    for old, new in REPLACEMENTS:
        f.write(f'"{old}","{new}"\n')

print("置換パターンをjs_replacements.csvに保存しました")