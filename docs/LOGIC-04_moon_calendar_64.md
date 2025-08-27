# 月齢カレンダー64パターン完全仕様書

## 概要
8つの月相タイプ × 8つの裏月相タイプ = 64パターンの月齢カレンダー仕様。
各パターンごとにラッキーデー、注意日、パワーデー、特別メッセージを定義。

---

## 📅 基本月齢カレンダー構造

### 月の周期（29.5日）
```javascript
const baseMoonCycle = {
  1: { phase: '新月', emoji: '🌑', power: 100 },
  2: { phase: '新月', emoji: '🌑', power: 95 },
  3: { phase: '三日月', emoji: '🌒', power: 85 },
  4: { phase: '三日月', emoji: '🌒', power: 90 },
  5: { phase: '三日月', emoji: '🌒', power: 85 },
  6: { phase: '三日月', emoji: '🌒', power: 80 },
  7: { phase: '上弦', emoji: '🌓', power: 90 },
  8: { phase: '上弦', emoji: '🌓', power: 95 },
  9: { phase: '上弦', emoji: '🌓', power: 90 },
  10: { phase: '十三夜', emoji: '🌔', power: 85 },
  11: { phase: '十三夜', emoji: '🌔', power: 90 },
  12: { phase: '十三夜', emoji: '🌔', power: 95 },
  13: { phase: '十三夜', emoji: '🌔', power: 90 },
  14: { phase: '満月前', emoji: '🌔', power: 95 },
  15: { phase: '満月', emoji: '🌕', power: 100 },
  16: { phase: '満月', emoji: '🌕', power: 95 },
  17: { phase: '十六夜', emoji: '🌖', power: 85 },
  18: { phase: '十六夜', emoji: '🌖', power: 80 },
  19: { phase: '十六夜', emoji: '🌖', power: 75 },
  20: { phase: '十六夜', emoji: '🌖', power: 70 },
  21: { phase: '下弦前', emoji: '🌖', power: 75 },
  22: { phase: '下弦', emoji: '🌗', power: 80 },
  23: { phase: '下弦', emoji: '🌗', power: 85 },
  24: { phase: '下弦', emoji: '🌗', power: 80 },
  25: { phase: '暁', emoji: '🌘', power: 70 },
  26: { phase: '暁', emoji: '🌘', power: 65 },
  27: { phase: '暁', emoji: '🌘', power: 60 },
  28: { phase: '暁', emoji: '🌘', power: 65 },
  29: { phase: '新月前', emoji: '🌘', power: 70 },
  30: { phase: '新月', emoji: '🌑', power: 95 },
  31: { phase: '新月', emoji: '🌑', power: 100 }
};
```

---

## 🌟 64パターン詳細定義

### パターン計算式
```javascript
patternId = `${moonPhase}×${hiddenMoonPhase}`
patternNumber = (moonPhaseIndex * 8) + hiddenMoonPhaseIndex + 1
```

---

## パターン1: 新月×新月
```javascript
{
  pattern_id: "新月×新月",
  pattern_number: 1,
  lucky_days: [1, 2, 30, 31], // 新月の日
  power_days: [7, 8, 15], // 上弦と満月
  caution_days: [22, 23, 24], // 下弦
  neutral_days: "その他すべて",
  special_marks: {
    1: { mark: "🌟", message: "最強の始まりの日" },
    15: { mark: "💫", message: "願いが叶う満月" },
    30: { mark: "🌟", message: "新たなサイクル開始" }
  },
  monthly_message: "新月の力が2倍！始まりと創造の月",
  love_advice: "1日と30日の新月に告白すると成功率UP",
  best_action_days: "新規プロジェクトは必ず新月の日に"
}
```

## パターン2: 新月×三日月
```javascript
{
  pattern_id: "新月×三日月",
  pattern_number: 2,
  lucky_days: [1, 3, 4, 5, 30],
  power_days: [8, 15, 16],
  caution_days: [19, 20, 25, 26],
  neutral_days: "その他すべて",
  special_marks: {
    1: { mark: "✨", message: "新しい始まり" },
    3: { mark: "🌙", message: "成長開始の合図" },
    15: { mark: "💝", message: "愛が満ちる日" }
  },
  monthly_message: "始まりと成長が調和する穏やかな月",
  love_advice: "3-5日の三日月期間に距離を縮めて",
  best_action_days: "計画は1日、実行は3日から"
}
```

## パターン3: 新月×上弦
```javascript
{
  pattern_id: "新月×上弦",
  pattern_number: 3,
  lucky_days: [1, 7, 8, 9, 30],
  power_days: [15, 22],
  caution_days: [17, 18, 26, 27],
  neutral_days: "その他すべて",
  special_marks: {
    1: { mark: "🎯", message: "目標設定の日" },
    7: { mark: "⚡", message: "行動開始！" },
    8: { mark: "🔥", message: "エネルギー最高潮" }
  },
  monthly_message: "決断と実行のパワフルな月",
  love_advice: "7-8日は勇気を出してアプローチ",
  best_action_days: "重要な決断は7日の上弦に"
}
```

## パターン4: 新月×十三夜
```javascript
{
  pattern_id: "新月×十三夜",
  pattern_number: 4,
  lucky_days: [1, 10, 11, 12, 13, 30],
  power_days: [15, 16],
  caution_days: [22, 23, 24],
  neutral_days: "その他すべて",
  special_marks: {
    1: { mark: "🌸", message: "優しい始まり" },
    13: { mark: "🌺", message: "美と調和の極み" },
    15: { mark: "💖", message: "愛の完成形" }
  },
  monthly_message: "美しさと創造性が開花する月",
  love_advice: "13日前後は魅力が最高潮に",
  best_action_days: "芸術活動は10-13日が最適"
}
```

## パターン5: 新月×満月
```javascript
{
  pattern_id: "新月×満月",
  pattern_number: 5,
  lucky_days: [1, 14, 15, 16, 30],
  power_days: [7, 8, 22],
  caution_days: [25, 26, 27],
  neutral_days: "その他すべて",
  special_marks: {
    1: { mark: "🌅", message: "陰陽の始まり" },
    15: { mark: "🌕", message: "最強の満月パワー" },
    30: { mark: "🌄", message: "完成と始まり" }
  },
  monthly_message: "始まりと完成が共存する特別な月",
  love_advice: "15日の満月は運命の日になる可能性大",
  best_action_days: "大きな契約は15日に"
}
```

## パターン6: 新月×十六夜
```javascript
{
  pattern_id: "新月×十六夜",
  pattern_number: 6,
  lucky_days: [1, 17, 18, 19, 30],
  power_days: [15, 7],
  caution_days: [22, 23, 24, 25],
  neutral_days: "その他すべて",
  special_marks: {
    1: { mark: "🎭", message: "新たな自分の発見" },
    17: { mark: "🍷", message: "余裕と品格" },
    18: { mark: "🌃", message: "静かな充実" }
  },
  monthly_message: "新しさと成熟が融合する深みある月",
  love_advice: "17-19日は大人の恋愛運が上昇",
  best_action_days: "振り返りと新計画は17日に"
}
```

## パターン7: 新月×下弦
```javascript
{
  pattern_id: "新月×下弦",
  pattern_number: 7,
  lucky_days: [1, 22, 23, 24, 30],
  power_days: [7, 15],
  caution_days: [17, 18, 19, 26],
  neutral_days: "その他すべて",
  special_marks: {
    1: { mark: "🔄", message: "リセットと再生" },
    22: { mark: "🧹", message: "整理整頓の時" },
    23: { mark: "📝", message: "計画見直し" }
  },
  monthly_message: "始まりと整理が交互に訪れる月",
  love_advice: "22-24日は関係の見直しに最適",
  best_action_days: "断捨離は22日の下弦に"
}
```

## パターン8: 新月×暁
```javascript
{
  pattern_id: "新月×暁",
  pattern_number: 8,
  lucky_days: [1, 25, 26, 27, 28, 30],
  power_days: [15, 7],
  caution_days: [17, 18, 19, 20],
  neutral_days: "その他すべて",
  special_marks: {
    1: { mark: "🌌", message: "深い洞察の始まり" },
    25: { mark: "🔮", message: "直感が冴える" },
    28: { mark: "💭", message: "瞑想と内省" }
  },
  monthly_message: "直感と新たな気づきに満ちた月",
  love_advice: "25-28日は本音で語り合える",
  best_action_days: "重要な気づきは暁の時期に"
}
```

---

## パターン9-16: 三日月×各裏月相

### パターン9: 三日月×新月
```javascript
{
  pattern_id: "三日月×新月",
  pattern_number: 9,
  lucky_days: [1, 2, 3, 4, 5, 30],
  power_days: [15, 7, 8],
  caution_days: [22, 23, 24],
  neutral_days: "その他すべて",
  special_marks: {
    3: { mark: "🌱", message: "成長の芽生え" },
    4: { mark: "🍀", message: "幸運の成長期" },
    30: { mark: "🌿", message: "新たな成長へ" }
  },
  monthly_message: "優しい成長と新たな始まりの月",
  love_advice: "3-5日は自然な流れで関係が深まる",
  best_action_days: "新しい習慣は3日から開始"
}
```

### パターン10: 三日月×三日月
```javascript
{
  pattern_id: "三日月×三日月",
  pattern_number: 10,
  lucky_days: [3, 4, 5, 6],
  power_days: [15, 1, 30],
  caution_days: [22, 23, 24, 25],
  neutral_days: "その他すべて",
  special_marks: {
    3: { mark: "🌙", message: "三日月パワー2倍" },
    4: { mark: "✨", message: "最高の成長日" },
    5: { mark: "💫", message: "願いが育つ" }
  },
  monthly_message: "穏やかで着実な成長の月",
  love_advice: "焦らずゆっくり愛を育てる月",
  best_action_days: "コツコツ努力が実を結ぶ"
}
```

### パターン11: 三日月×上弦
```javascript
{
  pattern_id: "三日月×上弦",
  pattern_number: 11,
  lucky_days: [3, 4, 5, 7, 8, 9],
  power_days: [15, 1],
  caution_days: [25, 26, 27],
  neutral_days: "その他すべて",
  special_marks: {
    3: { mark: "🌿", message: "優しい成長" },
    7: { mark: "⚡", message: "成長加速！" },
    8: { mark: "🚀", message: "飛躍の時" }
  },
  monthly_message: "緩急つけた成長が可能な月",
  love_advice: "3-5日で基礎を固め、7-8日で告白",
  best_action_days: "段階的な目標達成に最適"
}
```

### パターン12: 三日月×十三夜
```javascript
{
  pattern_id: "三日月×十三夜",
  pattern_number: 12,
  lucky_days: [3, 4, 5, 10, 11, 12, 13],
  power_days: [15, 1],
  caution_days: [22, 23],
  neutral_days: "その他すべて",
  special_marks: {
    3: { mark: "🌸", message: "優美な成長" },
    13: { mark: "🌺", message: "美の極致" },
    15: { mark: "💝", message: "愛の成就" }
  },
  monthly_message: "美と調和に満ちた優雅な月",
  love_advice: "自然体の魅力で相手を惹きつける",
  best_action_days: "創造的活動は10-13日に集中"
}
```

### パターン13: 三日月×満月
```javascript
{
  pattern_id: "三日月×満月",
  pattern_number: 13,
  lucky_days: [3, 4, 5, 14, 15, 16],
  power_days: [1, 7, 30],
  caution_days: [25, 26],
  neutral_days: "その他すべて",
  special_marks: {
    3: { mark: "🌱", message: "小さな一歩" },
    15: { mark: "🌕", message: "大きな実り" },
    16: { mark: "🎊", message: "成功の余韻" }
  },
  monthly_message: "小さな努力が大きな成果になる月",
  love_advice: "3-5日の種まきが15日に開花",
  best_action_days: "コツコツと大成功のサイクル"
}
```

### パターン14: 三日月×十六夜
```javascript
{
  pattern_id: "三日月×十六夜",
  pattern_number: 14,
  lucky_days: [3, 4, 5, 17, 18, 19],
  power_days: [15, 1],
  caution_days: [25, 26, 27],
  neutral_days: "その他すべて",
  special_marks: {
    3: { mark: "🌿", message: "静かな成長" },
    17: { mark: "🍂", message: "成熟の美" },
    18: { mark: "🌆", message: "余韻を楽しむ" }
  },
  monthly_message: "成長と成熟がバランスよく訪れる月",
  love_advice: "じっくり育てた関係が深まる",
  best_action_days: "長期プロジェクトに最適"
}
```

### パターン15: 三日月×下弦
```javascript
{
  pattern_id: "三日月×下弦",
  pattern_number: 15,
  lucky_days: [3, 4, 5, 22, 23, 24],
  power_days: [15, 1],
  caution_days: [17, 18, 19],
  neutral_days: "その他すべて",
  special_marks: {
    3: { mark: "🌱", message: "新芽の時期" },
    22: { mark: "✂️", message: "剪定の時" },
    23: { mark: "🔄", message: "再成長へ" }
  },
  monthly_message: "成長と整理を繰り返す月",
  love_advice: "関係の見直しで更に深まる",
  best_action_days: "PDCAサイクルが機能する"
}
```

### パターン16: 三日月×暁
```javascript
{
  pattern_id: "三日月×暁",
  pattern_number: 16,
  lucky_days: [3, 4, 5, 25, 26, 27, 28],
  power_days: [15, 1],
  caution_days: [20, 21],
  neutral_days: "その他すべて",
  special_marks: {
    3: { mark: "🌙", message: "静かな成長" },
    25: { mark: "🔮", message: "内なる声" },
    28: { mark: "💫", message: "深い気づき" }
  },
  monthly_message: "内面の成長が促される神秘的な月",
  love_advice: "言葉より心で通じ合える",
  best_action_days: "瞑想と内省で答えが見つかる"
}
```

---

## パターン17-24: 上弦×各裏月相

### パターン17: 上弦×新月
```javascript
{
  pattern_id: "上弦×新月",
  pattern_number: 17,
  lucky_days: [1, 2, 7, 8, 9, 30],
  power_days: [15, 3, 4],
  caution_days: [25, 26, 27],
  neutral_days: "その他すべて",
  special_marks: {
    1: { mark: "🎯", message: "新たな挑戦" },
    7: { mark: "⚡", message: "決断の時！" },
    8: { mark: "🔥", message: "行動あるのみ" }
  },
  monthly_message: "決断と新しい挑戦に満ちた月",
  love_advice: "7-8日は積極的アプローチが吉",
  best_action_days: "勇気ある一歩を踏み出そう"
}
```

### パターン18: 上弦×三日月
```javascript
{
  pattern_id: "上弦×三日月",
  pattern_number: 18,
  lucky_days: [3, 4, 5, 7, 8, 9],
  power_days: [15, 1, 30],
  caution_days: [25, 26, 27],
  neutral_days: "その他すべて",
  special_marks: {
    3: { mark: "🌿", message: "準備期間" },
    7: { mark: "💪", message: "実行開始" },
    8: { mark: "🎯", message: "狙い撃ち！" }
  },
  monthly_message: "準備と実行のメリハリある月",
  love_advice: "3-5日で準備、7-9日で勝負",
  best_action_days: "計画的な行動が成功を呼ぶ"
}
```

### パターン19: 上弦×上弦
```javascript
{
  pattern_id: "上弦×上弦",
  pattern_number: 19,
  lucky_days: [7, 8, 9],
  power_days: [15, 1, 22, 30],
  caution_days: [17, 18, 25, 26],
  neutral_days: "その他すべて",
  special_marks: {
    7: { mark: "⚡", message: "Wパワー発動" },
    8: { mark: "🔥", message: "最強の決断日" },
    9: { mark: "💥", message: "突破力MAX" }
  },
  monthly_message: "決断力と実行力が最高潮の月",
  love_advice: "7-9日は運命を変える3日間",
  best_action_days: "大勝負は8日に賭けろ"
}
```

### パターン20: 上弦×十三夜
```javascript
{
  pattern_id: "上弦×十三夜",
  pattern_number: 20,
  lucky_days: [7, 8, 9, 10, 11, 12, 13],
  power_days: [15, 1],
  caution_days: [25, 26],
  neutral_days: "その他すべて",
  special_marks: {
    7: { mark: "⚡", message: "スタートダッシュ" },
    13: { mark: "🌸", message: "美しい成果" },
    15: { mark: "💖", message: "完璧な結果" }
  },
  monthly_message: "勢いと美しさを兼ね備えた月",
  love_advice: "情熱的かつ優雅なアプローチ",
  best_action_days: "スピードと質の両立が可能"
}
```

### パターン21: 上弦×満月
```javascript
{
  pattern_id: "上弦×満月",
  pattern_number: 21,
  lucky_days: [7, 8, 9, 14, 15, 16],
  power_days: [1, 22, 30],
  caution_days: [25, 26, 27],
  neutral_days: "その他すべて",
  special_marks: {
    7: { mark: "🎯", message: "目標設定" },
    8: { mark: "🚀", message: "全力前進" },
    15: { mark: "🏆", message: "大成功！" }
  },
  monthly_message: "決断から成功まで一直線の月",
  love_advice: "7-9日の行動が15日に実を結ぶ",
  best_action_days: "短期集中で大きな成果"
}
```

### パターン22: 上弦×十六夜
```javascript
{
  pattern_id: "上弦×十六夜",
  pattern_number: 22,
  lucky_days: [7, 8, 9, 17, 18, 19],
  power_days: [15, 1],
  caution_days: [25, 26, 27],
  neutral_days: "その他すべて",
  special_marks: {
    7: { mark: "💨", message: "疾風の如く" },
    17: { mark: "🍷", message: "成功の美酒" },
    18: { mark: "✨", message: "余韻を楽しむ" }
  },
  monthly_message: "勢いと余裕が交互に訪れる月",
  love_advice: "押しと引きの絶妙なバランス",
  best_action_days: "緩急つけた戦略が効果的"
}
```

### パターン23: 上弦×下弦
```javascript
{
  pattern_id: "上弦×下弦",
  pattern_number: 23,
  lucky_days: [7, 8, 9, 22, 23, 24],
  power_days: [15, 1],
  caution_days: [17, 18, 19],
  neutral_days: "その他すべて",
  special_marks: {
    7: { mark: "🔥", message: "燃える闘志" },
    22: { mark: "🧊", message: "冷静な分析" },
    23: { mark: "⚖️", message: "バランス調整" }
  },
  monthly_message: "行動と分析を繰り返す戦略的な月",
  love_advice: "熱い想いと冷静な判断の両立",
  best_action_days: "PDCAが完璧に回る月"
}
```

### パターン24: 上弦×暁
```javascript
{
  pattern_id: "上弦×暁",
  pattern_number: 24,
  lucky_days: [7, 8, 9, 25, 26, 27, 28],
  power_days: [15, 1],
  caution_days: [20, 21],
  neutral_days: "その他すべて",
  special_marks: {
    7: { mark: "⚡", message: "閃きの決断" },
    25: { mark: "🔮", message: "深い洞察" },
    28: { mark: "💡", message: "新たな発見" }
  },
  monthly_message: "行動と洞察が融合する月",
  love_advice: "直感的な行動が良縁を呼ぶ",
  best_action_days: "インスピレーションを即実行"
}
```

---

## パターン25-32: 十三夜×各裏月相

### パターン25: 十三夜×新月
```javascript
{
  pattern_id: "十三夜×新月",
  pattern_number: 25,
  lucky_days: [1, 2, 10, 11, 12, 13, 30],
  power_days: [15, 7],
  caution_days: [25, 26, 27],
  neutral_days: "その他すべて",
  special_marks: {
    1: { mark: "🌸", message: "美しい始まり" },
    13: { mark: "🌺", message: "十三夜の魔法" },
    30: { mark: "🌼", message: "新たな美の探求" }
  },
  monthly_message: "美と新しさが調和する優雅な月",
  love_advice: "13日前後は魅力が最高潮",
  best_action_days: "芸術と創造の活動に最適"
}
```

### パターン26: 十三夜×三日月
```javascript
{
  pattern_id: "十三夜×三日月",
  pattern_number: 26,
  lucky_days: [3, 4, 5, 10, 11, 12, 13],
  power_days: [15, 1],
  caution_days: [25, 26],
  neutral_days: "その他すべて",
  special_marks: {
    3: { mark: "🌿", message: "優しい成長" },
    13: { mark: "🌷", message: "満開の美" },
    15: { mark: "💐", message: "愛の花束" }
  },
  monthly_message: "優しさと美しさに包まれる月",
  love_advice: "自然体の魅力が相手を惹きつける",
  best_action_days: "穏やかで美しい日々"
}
```

### パターン27: 十三夜×上弦
```javascript
{
  pattern_id: "十三夜×上弦",
  pattern_number: 27,
  lucky_days: [7, 8, 9, 10, 11, 12, 13],
  power_days: [15, 1],
  caution_days: [25, 26],
  neutral_days: "その他すべて",
  special_marks: {
    7: { mark: "💪", message: "美と力の融合" },
    13: { mark: "👑", message: "完璧な調和" },
    15: { mark: "💎", message: "輝きの極致" }
  },
  monthly_message: "力強さと優雅さを併せ持つ月",
  love_advice: "自信と優しさで相手を魅了",
  best_action_days: "品格ある行動で成功を掴む"
}
```

### パターン28: 十三夜×十三夜
```javascript
{
  pattern_id: "十三夜×十三夜",
  pattern_number: 28,
  lucky_days: [10, 11, 12, 13],
  power_days: [15, 1, 7, 30],
  caution_days: [25, 26, 27],
  neutral_days: "その他すべて",
  special_marks: {
    11: { mark: "🌸", message: "美の始まり" },
    12: { mark: "🌺", message: "美の開花" },
    13: { mark: "🌹", message: "美の極致×2" }
  },
  monthly_message: "最高の美と調和に満ちた月",
  love_advice: "あなたの魅力が最大限に輝く",
  best_action_days: "すべてが美しく調和する"
}
```

### パターン29: 十三夜×満月
```javascript
{
  pattern_id: "十三夜×満月",
  pattern_number: 29,
  lucky_days: [10, 11, 12, 13, 14, 15, 16],
  power_days: [1, 7],
  caution_days: [25, 26],
  neutral_days: "その他すべて",
  special_marks: {
    13: { mark: "🌺", message: "美の頂点" },
    15: { mark: "🌕", message: "完璧な満月" },
    16: { mark: "✨", message: "幸せの余韻" }
  },
  monthly_message: "美と完成が重なる幸福な月",
  love_advice: "13-15日は恋愛の黄金期",
  best_action_days: "大切なイベントはこの期間に"
}
```

### パターン30: 十三夜×十六夜
```javascript
{
  pattern_id: "十三夜×十六夜",
  pattern_number: 30,
  lucky_days: [10, 11, 12, 13, 17, 18, 19],
  power_days: [15, 1],
  caution_days: [25, 26, 27],
  neutral_days: "その他すべて",
  special_marks: {
    13: { mark: "🌹", message: "優雅な美" },
    17: { mark: "🍷", message: "成熟の美" },
    18: { mark: "🌆", message: "静かな輝き" }
  },
  monthly_message: "若さと成熟が調和する月",
  love_advice: "年齢を超えた魅力を発揮",
  best_action_days: "深みのある活動に最適"
}
```

### パターン31: 十三夜×下弦
```javascript
{
  pattern_id: "十三夜×下弦",
  pattern_number: 31,
  lucky_days: [10, 11, 12, 13, 22, 23, 24],
  power_days: [15, 1],
  caution_days: [17, 18],
  neutral_days: "その他すべて",
  special_marks: {
    13: { mark: "💐", message: "美の完成" },
    22: { mark: "🍂", message: "美の整理" },
    23: { mark: "🔄", message: "美の再生" }
  },
  monthly_message: "美を磨き続ける向上の月",
  love_advice: "関係を見直してより美しく",
  best_action_days: "断捨離で本質的な美を追求"
}
```

### パターン32: 十三夜×暁
```javascript
{
  pattern_id: "十三夜×暁",
  pattern_number: 32,
  lucky_days: [10, 11, 12, 13, 25, 26, 27, 28],
  power_days: [15, 1],
  caution_days: [20, 21],
  neutral_days: "その他すべて",
  special_marks: {
    13: { mark: "🌸", message: "表面の美" },
    25: { mark: "💎", message: "内なる美" },
    28: { mark: "🔮", message: "魂の美" }
  },
  monthly_message: "外見と内面の美が共鳴する月",
  love_advice: "心の美しさで深い愛を育む",
  best_action_days: "精神的な美を追求する"
}
```

---

## パターン33-40: 満月×各裏月相

### パターン33: 満月×新月
```javascript
{
  pattern_id: "満月×新月",
  pattern_number: 33,
  lucky_days: [1, 2, 14, 15, 16, 30, 31],
  power_days: [7, 8],
  caution_days: [25, 26, 27],
  neutral_days: "その他すべて",
  special_marks: {
    1: { mark: "🌅", message: "新月の始まり" },
    15: { mark: "🌕", message: "満月の極み" },
    30: { mark: "🔄", message: "完成と再生" }
  },
  monthly_message: "完成と始まりが交差する特別な月",
  love_advice: "15日の満月で結実、30日で新展開",
  best_action_days: "大きなサイクルを意識した行動"
}
```

### パターン34: 満月×三日月
```javascript
{
  pattern_id: "満月×三日月",
  pattern_number: 34,
  lucky_days: [3, 4, 5, 14, 15, 16],
  power_days: [1, 7, 30],
  caution_days: [25, 26, 27],
  neutral_days: "その他すべて",
  special_marks: {
    3: { mark: "🌱", message: "優しい成長" },
    15: { mark: "🌕", message: "満月の完成" },
    16: { mark: "🌟", message: "新たな成長へ" }
  },
  monthly_message: "大きな成功と新たな成長の月",
  love_advice: "15日の告白成功率は最高",
  best_action_days: "達成と次の目標設定"
}
```

### パターン35: 満月×上弦
```javascript
{
  pattern_id: "満月×上弦",
  pattern_number: 35,
  lucky_days: [7, 8, 9, 14, 15, 16],
  power_days: [1, 22, 30],
  caution_days: [25, 26, 27],
  neutral_days: "その他すべて",
  special_marks: {
    7: { mark: "⚡", message: "決断の時" },
    15: { mark: "🏆", message: "大成功の満月" },
    16: { mark: "🎊", message: "祝福の時" }
  },
  monthly_message: "決断と成功が約束された月",
  love_advice: "7-9日の行動が15日に花開く",
  best_action_days: "勝負どころを逃さない"
}
```

### パターン36: 満月×十三夜
```javascript
{
  pattern_id: "満月×十三夜",
  pattern_number: 36,
  lucky_days: [10, 11, 12, 13, 14, 15, 16],
  power_days: [1, 7],
  caution_days: [25, 26],
  neutral_days: "その他すべて",
  special_marks: {
    13: { mark: "🌸", message: "美の準備" },
    15: { mark: "🌕", message: "美と完成の融合" },
    16: { mark: "💖", message: "愛の成就" }
  },
  monthly_message: "美しさと完璧さが重なる月",
  love_advice: "13-16日は恋愛の絶頂期",
  best_action_days: "最高の結果を求めて行動"
}
```

### パターン37: 満月×満月
```javascript
{
  pattern_id: "満月×満月",
  pattern_number: 37,
  lucky_days: [14, 15, 16],
  power_days: [1, 7, 8, 22, 30],
  caution_days: [25, 26, 27],
  neutral_days: "その他すべて",
  special_marks: {
    14: { mark: "🌔", message: "満月前夜" },
    15: { mark: "🌕", message: "最強満月×2" },
    16: { mark: "✨", message: "奇跡の余韻" }
  },
  monthly_message: "満月パワーが2倍の奇跡の月",
  love_advice: "15日は人生最高の告白日",
  best_action_days: "一生に一度のチャンス"
}
```

### パターン38: 満月×十六夜
```javascript
{
  pattern_id: "満月×十六夜",
  pattern_number: 38,
  lucky_days: [14, 15, 16, 17, 18, 19],
  power_days: [1, 7],
  caution_days: [25, 26, 27],
  neutral_days: "その他すべて",
  special_marks: {
    15: { mark: "🌕", message: "完璧な満月" },
    17: { mark: "🍷", message: "成功の美酒" },
    18: { mark: "🌃", message: "静かな充実" }
  },
  monthly_message: "成功と余韻を楽しむ豊かな月",
  love_advice: "15日の成功を17-19日で深める",
  best_action_days: "達成感を味わいながら前進"
}
```

### パターン39: 満月×下弦
```javascript
{
  pattern_id: "満月×下弦",
  pattern_number: 39,
  lucky_days: [14, 15, 16, 22, 23, 24],
  power_days: [1, 7],
  caution_days: [17, 18, 19],
  neutral_days: "その他すべて",
  special_marks: {
    15: { mark: "🌕", message: "完成の時" },
    22: { mark: "📊", message: "成果の分析" },
    23: { mark: "📝", message: "次への準備" }
  },
  monthly_message: "成功と振り返りが交互に訪れる月",
  love_advice: "15日の成功を22日に分析",
  best_action_days: "成功体験を次に活かす"
}
```

### パターン40: 満月×暁
```javascript
{
  pattern_id: "満月×暁",
  pattern_number: 40,
  lucky_days: [14, 15, 16, 25, 26, 27, 28],
  power_days: [1, 7],
  caution_days: [20, 21],
  neutral_days: "その他すべて",
  special_marks: {
    15: { mark: "🌕", message: "表の成功" },
    25: { mark: "🔮", message: "内なる成功" },
    28: { mark: "💫", message: "魂の充実" }
  },
  monthly_message: "外的成功と内的充実が両立する月",
  love_advice: "15日の成功後、25日から深い愛へ",
  best_action_days: "物質と精神の両方を満たす"
}
```

---

## パターン41-48: 十六夜×各裏月相

### パターン41: 十六夜×新月
```javascript
{
  pattern_id: "十六夜×新月",
  pattern_number: 41,
  lucky_days: [1, 2, 17, 18, 19, 30, 31],
  power_days: [15, 7],
  caution_days: [25, 26, 27],
  neutral_days: "その他すべて",
  special_marks: {
    1: { mark: "🌅", message: "静かな始まり" },
    17: { mark: "🌆", message: "十六夜の美" },
    30: { mark: "🔄", message: "成熟から新生へ" }
  },
  monthly_message: "成熟と新生が優雅に交わる月",
  love_advice: "17-19日は大人の恋愛運上昇",
  best_action_days: "経験を活かした新展開"
}
```

### パターン42: 十六夜×三日月
```javascript
{
  pattern_id: "十六夜×三日月",
  pattern_number: 42,
  lucky_days: [3, 4, 5, 17, 18, 19],
  power_days: [15, 1],
  caution_days: [25, 26, 27],
  neutral_days: "その他すべて",
  special_marks: {
    3: { mark: "🌿", message: "新たな成長" },
    17: { mark: "🍂", message: "成熟の美" },
    18: { mark: "🌃", message: "静寂の中の成長" }
  },
  monthly_message: "ゆったりとした成長と成熟の月",
  love_advice: "焦らずじっくり愛を深める",
  best_action_days: "長期的視点で物事を進める"
}
```

### パターン43: 十六夜×上弦
```javascript
{
  pattern_id: "十六夜×上弦",
  pattern_number: 43,
  lucky_days: [7, 8, 9, 17, 18, 19],
  power_days: [15, 1],
  caution_days: [25, 26, 27],
  neutral_days: "その他すべて",
  special_marks: {
    7: { mark: "⚡", message: "決断の時" },
    17: { mark: "🏛️", message: "威厳と品格" },
    18: { mark: "👑", message: "成熟の決断" }
  },
  monthly_message: "決断力と成熟が融合する月",
  love_advice: "7-9日の決断が17日に実る",
  best_action_days: "経験に基づいた大胆な行動"
}
```

### パターン44: 十六夜×十三夜
```javascript
{
  pattern_id: "十六夜×十三夜",
  pattern_number: 44,
  lucky_days: [10, 11, 12, 13, 17, 18, 19],
  power_days: [15, 1],
  caution_days: [25, 26],
  neutral_days: "その他すべて",
  special_marks: {
    13: { mark: "🌸", message: "若々しい美" },
    17: { mark: "🌹", message: "成熟の美" },
    18: { mark: "💎", message: "永遠の美" }
  },
  monthly_message: "あらゆる美が開花する月",
  love_advice: "年齢を超えた魅力で相手を魅了",
  best_action_days: "美的センスが冴える"
}
```

### パターン45: 十六夜×満月
```javascript
{
  pattern_id: "十六夜×満月",
  pattern_number: 45,
  lucky_days: [14, 15, 16, 17, 18, 19],
  power_days: [1, 7],
  caution_days: [25, 26, 27],
  neutral_days: "その他すべて",
  special_marks: {
    15: { mark: "🌕", message: "完璧な満月" },
    17: { mark: "🍷", message: "十六夜の余韻" },
    18: { mark: "✨", message: "二重の祝福" }
  },
  monthly_message: "完成と余韻が重なる贅沢な月",
  love_advice: "15-19日は恋愛の黄金週間",
  best_action_days: "成功を味わい尽くす"
}
```

### パターン46: 十六夜×十六夜
```javascript
{
  pattern_id: "十六夜×十六夜",
  pattern_number: 46,
  lucky_days: [17, 18, 19, 20],
  power_days: [15, 1, 7, 30],
  caution_days: [25, 26, 27],
  neutral_days: "その他すべて",
  special_marks: {
    17: { mark: "🌆", message: "十六夜×2" },
    18: { mark: "🍷", message: "最高の余韻" },
    19: { mark: "🌃", message: "静寂の美" }
  },
  monthly_message: "成熟と余裕が2倍の優雅な月",
  love_advice: "大人の魅力が最大限に発揮",
  best_action_days: "品格ある振る舞いで成功"
}
```

### パターン47: 十六夜×下弦
```javascript
{
  pattern_id: "十六夜×下弦",
  pattern_number: 47,
  lucky_days: [17, 18, 19, 22, 23, 24],
  power_days: [15, 1],
  caution_days: [25, 26, 27],
  neutral_days: "その他すべて",
  special_marks: {
    17: { mark: "🌇", message: "美しい夕暮れ" },
    22: { mark: "🍂", message: "整理の時" },
    23: { mark: "📚", message: "経験の整理" }
  },
  monthly_message: "成熟と整理が調和する月",
  love_advice: "17-19日の余韻を22日に振り返る",
  best_action_days: "経験を整理して次へ活かす"
}
```

### パターン48: 十六夜×暁
```javascript
{
  pattern_id: "十六夜×暁",
  pattern_number: 48,
  lucky_days: [17, 18, 19, 25, 26, 27, 28],
  power_days: [15, 1],
  caution_days: [20, 21],
  neutral_days: "その他すべて",
  special_marks: {
    17: { mark: "🌆", message: "夕暮れの美" },
    25: { mark: "🌌", message: "暁の静寂" },
    28: { mark: "🔮", message: "深い洞察" }
  },
  monthly_message: "成熟と静寂が深い洞察を生む月",
  love_advice: "言葉を超えた深い理解",
  best_action_days: "瞑想と内省で答えを見つける"
}
```

---

## パターン49-56: 下弦×各裏月相

### パターン49: 下弦×新月
```javascript
{
  pattern_id: "下弦×新月",
  pattern_number: 49,
  lucky_days: [1, 2, 22, 23, 24, 30, 31],
  power_days: [15, 7],
  caution_days: [17, 18, 19],
  neutral_days: "その他すべて",
  special_marks: {
    1: { mark: "🔄", message: "新しいサイクル" },
    22: { mark: "✂️", message: "断捨離の時" },
    30: { mark: "🌱", message: "再スタート" }
  },
  monthly_message: "整理と新生を繰り返す月",
  love_advice: "22-24日に関係を見直し、30日に再出発",
  best_action_days: "リセットと再構築の繰り返し"
}
```

### パターン50: 下弦×三日月
```javascript
{
  pattern_id: "下弦×三日月",
  pattern_number: 50,
  lucky_days: [3, 4, 5, 22, 23, 24],
  power_days: [15, 1],
  caution_days: [17, 18, 19],
  neutral_days: "その他すべて",
  special_marks: {
    3: { mark: "🌿", message: "静かな成長" },
    22: { mark: "🔧", message: "調整の時" },
    23: { mark: "🌱", message: "再成長開始" }
  },
  monthly_message: "調整と成長を繰り返す月",
  love_advice: "小さな修正で大きな成長",
  best_action_days: "PDCAサイクルが効果的"
}
```

### パターン51: 下弦×上弦
```javascript
{
  pattern_id: "下弦×上弦",
  pattern_number: 51,
  lucky_days: [7, 8, 9, 22, 23, 24],
  power_days: [15, 1],
  caution_days: [17, 18, 19],
  neutral_days: "その他すべて",
  special_marks: {
    7: { mark: "💪", message: "前進の力" },
    22: { mark: "🔍", message: "分析の時" },
    23: { mark: "📊", message: "戦略見直し" }
  },
  monthly_message: "行動と分析が交互に訪れる月",
  love_advice: "7-9日に行動、22-24日に振り返り",
  best_action_days: "戦略的な恋愛アプローチ"
}
```

### パターン52: 下弦×十三夜
```javascript
{
  pattern_id: "下弦×十三夜",
  pattern_number: 52,
  lucky_days: [10, 11, 12, 13, 22, 23, 24],
  power_days: [15, 1],
  caution_days: [17, 18],
  neutral_days: "その他すべて",
  special_marks: {
    13: { mark: "🌸", message: "美の開花" },
    22: { mark: "💐", message: "美の整理" },
    23: { mark: "🌺", message: "新たな美へ" }
  },
  monthly_message: "美を磨き続ける向上の月",
  love_advice: "13日に魅力発揮、22日に関係整理",
  best_action_days: "美的センスの向上"
}
```

### パターン53: 下弦×満月
```javascript
{
  pattern_id: "下弦×満月",
  pattern_number: 53,
  lucky_days: [14, 15, 16, 22, 23, 24],
  power_days: [1, 7],
  caution_days: [17, 18, 19],
  neutral_days: "その他すべて",
  special_marks: {
    15: { mark: "🌕", message: "完成の時" },
    22: { mark: "📝", message: "成果の整理" },
    23: { mark: "🎯", message: "次の目標" }
  },
  monthly_message: "完成と整理が調和する月",
  love_advice: "15日の成功を22日に振り返る",
  best_action_days: "達成と次への準備"
}
```

### パターン54: 下弦×十六夜
```javascript
{
  pattern_id: "下弦×十六夜",
  pattern_number: 54,
  lucky_days: [17, 18, 19, 22, 23, 24],
  power_days: [15, 1],
  caution_days: [25, 26, 27],
  neutral_days: "その他すべて",
  special_marks: {
    17: { mark: "🌇", message: "余韻の時" },
    22: { mark: "📚", message: "経験の整理" },
    23: { mark: "🔄", message: "次への準備" }
  },
  monthly_message: "余韻と整理が交互に訪れる月",
  love_advice: "17-19日の余韻を22日に整理",
  best_action_days: "経験を次に活かす"
}
```

### パターン55: 下弦×下弦
```javascript
{
  pattern_id: "下弦×下弦",
  pattern_number: 55,
  lucky_days: [22, 23, 24],
  power_days: [15, 1, 7, 30],
  caution_days: [17, 18, 19, 20],
  neutral_days: "その他すべて",
  special_marks: {
    22: { mark: "🔧", message: "整理×2" },
    23: { mark: "📊", message: "徹底分析" },
    24: { mark: "📝", message: "完璧な計画" }
  },
  monthly_message: "徹底的な整理と分析の月",
  love_advice: "22-24日は関係の大掃除",
  best_action_days: "断捨離で本質を見極める"
}
```

### パターン56: 下弦×暁
```javascript
{
  pattern_id: "下弦×暁",
  pattern_number: 56,
  lucky_days: [22, 23, 24, 25, 26, 27, 28],
  power_days: [15, 1],
  caution_days: [17, 18, 19],
  neutral_days: "その他すべて",
  special_marks: {
    22: { mark: "🔍", message: "分析開始" },
    25: { mark: "🔮", message: "深い洞察" },
    28: { mark: "💡", message: "答えが見つかる" }
  },
  monthly_message: "分析と洞察で真実に辿り着く月",
  love_advice: "22日に整理、25日から本質理解",
  best_action_days: "深い理解と気づきの月"
}
```

---

## パターン57-64: 暁×各裏月相

### パターン57: 暁×新月
```javascript
{
  pattern_id: "暁×新月",
  pattern_number: 57,
  lucky_days: [1, 2, 25, 26, 27, 28, 30, 31],
  power_days: [15, 7],
  caution_days: [17, 18, 19, 20],
  neutral_days: "その他すべて",
  special_marks: {
    1: { mark: "🌌", message: "神秘の始まり" },
    25: { mark: "🔮", message: "直感の日" },
    30: { mark: "💫", message: "新たな気づき" }
  },
  monthly_message: "直感と新しい発見に満ちた月",
  love_advice: "25-28日は心の声を聞く",
  best_action_days: "瞑想と直感で答えを見つける"
}
```

### パターン58: 暁×三日月
```javascript
{
  pattern_id: "暁×三日月",
  pattern_number: 58,
  lucky_days: [3, 4, 5, 25, 26, 27, 28],
  power_days: [15, 1],
  caution_days: [17, 18, 19, 20],
  neutral_days: "その他すべて",
  special_marks: {
    3: { mark: "🌿", message: "静かな成長" },
    25: { mark: "🌌", message: "内なる成長" },
    28: { mark: "💭", message: "深い理解" }
  },
  monthly_message: "内面の成長が促される静かな月",
  love_advice: "言葉より心で通じ合う",
  best_action_days: "精神的な成長を重視"
}
```

### パターン59: 暁×上弦
```javascript
{
  pattern_id: "暁×上弦",
  pattern_number: 59,
  lucky_days: [7, 8, 9, 25, 26, 27, 28],
  power_days: [15, 1],
  caution_days: [17, 18, 19, 20],
  neutral_days: "その他すべて",
  special_marks: {
    7: { mark: "💡", message: "閃きの決断" },
    25: { mark: "🔮", message: "深い洞察" },
    28: { mark: "⚡", message: "直感的行動" }
  },
  monthly_message: "直感と行動が融合する月",
  love_advice: "7-9日の決断を25日に確信",
  best_action_days: "インスピレーションを信じて"
}
```

### パターン60: 暁×十三夜
```javascript
{
  pattern_id: "暁×十三夜",
  pattern_number: 60,
  lucky_days: [10, 11, 12, 13, 25, 26, 27, 28],
  power_days: [15, 1],
  caution_days: [17, 18, 19, 20],
  neutral_days: "その他すべて",
  special_marks: {
    13: { mark: "🌸", message: "表の美" },
    25: { mark: "💎", message: "内なる美" },
    28: { mark: "✨", message: "魂の美" }
  },
  monthly_message: "外見と内面の美が調和する月",
  love_advice: "13日の魅力と25日の深さ",
  best_action_days: "総合的な美を追求"
}
```

### パターン61: 暁×満月
```javascript
{
  pattern_id: "暁×満月",
  pattern_number: 61,
  lucky_days: [14, 15, 16, 25, 26, 27, 28],
  power_days: [1, 7],
  caution_days: [17, 18, 19, 20],
  neutral_days: "その他すべて",
  special_marks: {
    15: { mark: "🌕", message: "外的成功" },
    25: { mark: "🔮", message: "内的成功" },
    28: { mark: "🌟", message: "完全な成功" }
  },
  monthly_message: "物質と精神の成功が両立する月",
  love_advice: "15日の成功と25日の深い愛",
  best_action_days: "全てにおいて成功する"
}
```

### パターン62: 暁×十六夜
```javascript
{
  pattern_id: "暁×十六夜",
  pattern_number: 62,
  lucky_days: [17, 18, 19, 25, 26, 27, 28],
  power_days: [15, 1],
  caution_days: [20, 21, 22],
  neutral_days: "その他すべて",
  special_marks: {
    17: { mark: "🌆", message: "美しい余韻" },
    25: { mark: "🌌", message: "深い静寂" },
    28: { mark: "💫", message: "悟りの時" }
  },
  monthly_message: "成熟と悟りが訪れる深遠な月",
  love_advice: "17-19日の余韻と25-28日の深い理解",
  best_action_days: "人生の深い意味を理解する"
}
```

### パターン63: 暁×下弦
```javascript
{
  pattern_id: "暁×下弦",
  pattern_number: 63,
  lucky_days: [22, 23, 24, 25, 26, 27, 28],
  power_days: [15, 1],
  caution_days: [17, 18, 19, 20],
  neutral_days: "その他すべて",
  special_marks: {
    22: { mark: "📊", message: "冷静な分析" },
    25: { mark: "🔮", message: "深い洞察" },
    28: { mark: "💡", message: "究極の答え" }
  },
  monthly_message: "分析と洞察で真理に到達する月",
  love_advice: "22日に整理、25日から本質理解",
  best_action_days: "深い理解で問題解決"
}
```

### パターン64: 暁×暁
```javascript
{
  pattern_id: "暁×暁",
  pattern_number: 64,
  lucky_days: [25, 26, 27, 28],
  power_days: [15, 1, 7, 30],
  caution_days: [17, 18, 19, 20, 21],
  neutral_days: "その他すべて",
  special_marks: {
    25: { mark: "🌌", message: "暁×2の始まり" },
    26: { mark: "🔮", message: "最強の直感" },
    27: { mark: "💫", message: "宇宙との調和" },
    28: { mark: "✨", message: "悟りの極み" }
  },
  monthly_message: "直感と悟りが最高潮に達する神秘の月",
  love_advice: "25-28日は魂レベルでの繋がり",
  best_action_days: "スピリチュアルな活動に最適"
}
```

---

## 🎨 表示実装仕様

### カレンダー生成コード例
```javascript
function generatePersonalizedCalendar(userMoonPhase, hiddenMoonPhase, currentMonth) {
  const patternId = `${userMoonPhase}×${hiddenMoonPhase}`;
  const patternData = getPatternData(patternId);
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  
  const calendar = [];
  
  for (let day = 1; day <= daysInMonth; day++) {
    const dayData = {
      day: day,
      moonPhase: baseMoonCycle[day] || baseMoonCycle[day % 30],
      isLucky: patternData.lucky_days.includes(day),
      isPower: patternData.power_days.includes(day),
      isCaution: patternData.caution_days.includes(day),
      specialMark: patternData.special_marks[day],
      className: getDayClassName(day, patternData)
    };
    calendar.push(dayData);
  }
  
  return {
    calendar,
    message: patternData.monthly_message,
    loveAdvice: patternData.love_advice
  };
}
```

### CSSクラス定義
```css
.calendar-day.lucky-day {
  background: linear-gradient(135deg, rgba(255, 215, 0, 0.3), rgba(255, 215, 0, 0.1));
  border: 2px solid #ffd700;
  box-shadow: 0 0 15px rgba(255, 215, 0, 0.5);
}

.calendar-day.power-day {
  background: linear-gradient(135deg, rgba(147, 112, 219, 0.3), rgba(147, 112, 219, 0.1));
  border: 2px solid #9370DB;
}

.calendar-day.caution-day {
  background: rgba(255, 100, 100, 0.15);
  border: 1px solid rgba(255, 100, 100, 0.5);
}

.calendar-day.user-moon-day {
  position: relative;
  animation: moonGlow 2s infinite;
}

.calendar-day.user-moon-day::after {
  content: "⭐";
  position: absolute;
  top: -5px;
  right: -5px;
  font-size: 12px;
}

.special-mark {
  position: absolute;
  top: 2px;
  right: 2px;
  font-size: 14px;
}

.day-message {
  position: absolute;
  bottom: -20px;
  left: 50%;
  transform: translateX(-50%);
  font-size: 10px;
  white-space: nowrap;
  color: #ffd700;
  text-shadow: 1px 1px 2px rgba(0,0,0,0.8);
}
```

---

## ✅ 実装チェックリスト

- [ ] 64パターンのデータ定義
- [ ] 月相計算ロジック
- [ ] パターン判定関数
- [ ] カレンダー生成関数
- [ ] ラッキーデー判定
- [ ] 注意日判定
- [ ] 特別マーク表示
- [ ] ツールチップ表示
- [ ] レスポンシブ対応
- [ ] アニメーション実装

---

## 📝 補足事項

1. **月齢の正確性**
   - 簡易版では日付から単純計算
   - 正確版では天文学的計算を使用

2. **パーソナライズの深さ**
   - レベル1: 月相タイプのみ
   - レベル2: 裏月相も考慮
   - レベル3: 4つの性格軸も反映

3. **更新頻度**
   - 月初に自動更新
   - ユーザーが任意で月を選択可能

4. **特別なイベント**
   - スーパームーン
   - 月食・日食
   - ブルームーン

この仕様書に基づいて、各ユーザーに最適化された月齢カレンダーを提供します。