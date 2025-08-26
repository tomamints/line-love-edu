# あなただけの月齢カレンダー仕様書

## 概要
ユーザーの月相タイプに基づいてパーソナライズされた月齢カレンダーを表示するシステム。恋愛運のセクションに配置。

---

## 📅 カレンダー基本仕様

### 配置場所
- **位置**: 恋愛運セクションの最後
- **導入文**: 月詠キャラクターが「特別なプレゼント」として紹介

### 表示期間の選択肢

#### オプション1: 固定3ヶ月表示
```
診断月 → 診断月+1 → 診断月+2
例：8月に診断 → 8月、9月、10月のカレンダー
```

#### オプション2: 診断日から3ヶ月
```
診断日から90日間の月齢を表示
例：8月15日診断 → 8月15日〜11月13日
```

#### オプション3: 当月のみ（推奨）
```
診断した月の1日〜末日までの月齢を表示
動的に月末日を判定（28日/29日/30日/31日）
```

---

## 🌙 月齢表示ルール

### 基本の月齢サイクル（29.5日周期）
```javascript
const moonPhases = [
  { day: 0, emoji: '🌑', name: '新月', power: '始まりの日' },
  { day: 2, emoji: '🌒', name: '三日月', power: '成長の日' },
  { day: 7, emoji: '🌓', name: '上弦の月', power: '決断の日' },
  { day: 10, emoji: '🌔', name: '十三夜', power: '充実の日' },
  { day: 15, emoji: '🌕', name: '満月', power: '完成の日' },
  { day: 17, emoji: '🌖', name: '十六夜', power: '余韻の日' },
  { day: 22, emoji: '🌗', name: '下弦の月', power: '整理の日' },
  { day: 25, emoji: '🌘', name: '暁月', power: '静寂の日' }
];
```

### パーソナライズ要素

#### 1. ユーザーの月相タイプによる強調
```javascript
// ユーザーが新月タイプの場合
if (userMoonType === '新月') {
  // 新月の日を特別に強調
  highlightDays = getAllNewMoonDays();
  specialMessage = 'あなたの力が最大になる日';
}
```

#### 2. ラッキーデーの算出
```javascript
// 月相の相性による吉日判定
const luckyDays = calculateLuckyDays(userMoonType, userHiddenMoonType);

// 例：新月×満月タイプの場合
// → 新月と満月の両日がラッキーデー
```

#### 3. 注意日の算出
```javascript
// 相性の悪い月相の日を注意日として表示
const cautionDays = calculateCautionDays(userMoonType, userHiddenMoonType);
```

---

## 🎨 ビジュアルデザイン

### カレンダーレイアウト
```html
<div class="moon-calendar">
  <h4>あなただけの月齢カレンダー（8月）</h4>
  <div class="calendar-grid">
    <div class="calendar-day lucky-day">
      <span class="day-number">15</span>
      <span class="moon-emoji">🌕</span>
      <span class="special-mark">✨</span>
      <span class="day-message">あなたの日</span>
    </div>
    <!-- 他の日付 -->
  </div>
  <div class="calendar-legend">
    <span>✨ ラッキーデー</span>
    <span>⚠️ 注意日</span>
  </div>
</div>
```

### スタイリング
```css
.calendar-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 10px;
  padding: 20px;
  background: rgba(30, 50, 70, 0.95);
  border-radius: 15px;
}

.calendar-day {
  text-align: center;
  padding: 15px 10px;
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.05);
  transition: all 0.3s;
}

.calendar-day.lucky-day {
  background: linear-gradient(135deg, rgba(255, 215, 0, 0.2), rgba(255, 215, 0, 0.1));
  border: 1px solid #ffd700;
}

.calendar-day.caution-day {
  background: rgba(255, 100, 100, 0.1);
  border: 1px solid rgba(255, 100, 100, 0.3);
}

.moon-emoji {
  font-size: 24px;
  display: block;
  margin: 5px 0;
}
```

---

## 📊 パーソナライズロジック

### 月相タイプ別の特別日

| ユーザー月相 | 強調される日 | メッセージ |
|------------|------------|-----------|
| 新月 | 毎月の新月（1日、30日前後） | 始まりのパワー最大 |
| 三日月 | 毎月の三日月（3日前後） | 成長のエネルギー充実 |
| 上弦 | 毎月の上弦（7日前後） | 決断力が高まる |
| 十三夜 | 毎月の十三夜（13日前後） | 完成度を高める |
| 満月 | 毎月の満月（15日前後） | 魅力が最高潮 |
| 十六夜 | 毎月の十六夜（17日前後） | 余裕と品格 |
| 下弦 | 毎月の下弦（22日前後） | 整理と効率化 |
| 暁 | 毎月の暁月（25日前後） | 直感が冴える |

### 相性による追加要素

```javascript
// 相性マトリックス（例）
const compatibility = {
  '新月': {
    good: ['上弦', '満月'], // ラッキー
    bad: ['下弦']           // 注意
  },
  '満月': {
    good: ['新月', '十三夜'],
    bad: ['暁']
  }
  // ... 他の組み合わせ
};
```

---

## 💡 実装方法の提案

### オプション1: リアルタイム月齢計算
```javascript
// 実際の月齢を天文学的に計算
function calculateMoonPhase(date) {
  // 基準日からの経過日数を計算
  const synodicMonth = 29.530588853;
  const referenceNewMoon = new Date('2000-01-06');
  const daysSince = (date - referenceNewMoon) / (1000 * 60 * 60 * 24);
  const moonAge = daysSince % synodicMonth;
  return getMoonPhaseFromAge(moonAge);
}
```

### オプション2: 簡易パターン（推奨）
```javascript
// 月の日付から簡易的に月相を割り当て
function getSimpleMoonPhase(dayOfMonth) {
  const patterns = [
    { range: [1, 2], phase: '新月', emoji: '🌑' },
    { range: [3, 6], phase: '三日月', emoji: '🌒' },
    { range: [7, 9], phase: '上弦', emoji: '🌓' },
    { range: [10, 14], phase: '十三夜', emoji: '🌔' },
    { range: [15, 16], phase: '満月', emoji: '🌕' },
    { range: [17, 21], phase: '十六夜', emoji: '🌖' },
    { range: [22, 24], phase: '下弦', emoji: '🌗' },
    { range: [25, 31], phase: '暁', emoji: '🌘' }
  ];
  
  return patterns.find(p => 
    dayOfMonth >= p.range[0] && dayOfMonth <= p.range[1]
  );
}
```

---

## 🎯 活用例

### 恋愛運での使い方
```
「15日の満月は、あなたにとって最高の告白日！」
「22日の下弦の月は、関係を見直す良い機会」
「新月の1日は、新しい出会いのチャンス」
```

### その他の運勢での応用
- **仕事運**: 重要な会議や交渉の日程選び
- **金運**: 投資や大きな買い物のタイミング
- **人間関係**: イベントや集まりの日程決め

---

## ✅ 実装チェックリスト

- [ ] 月齢計算ロジックの実装
- [ ] ユーザー月相タイプの取得
- [ ] パーソナライズルールの適用
- [ ] カレンダーUI の実装
- [ ] ラッキーデー/注意日の強調表示
- [ ] レスポンシブデザイン対応
- [ ] ツールチップでの詳細情報表示
- [ ] 月ごとの更新機能（必要な場合）

---

## 📝 注意事項

1. **表示期間の決定**
   - 固定期間か診断日基準かを明確に
   - カレンダーの更新頻度を決定

2. **パーソナライズの深さ**
   - 月相タイプのみか、裏月相も考慮するか
   - 64パターンすべてに対応するか

3. **実装の簡潔性**
   - 複雑すぎると実装コストが高い
   - シンプルでも効果的な方法を選択