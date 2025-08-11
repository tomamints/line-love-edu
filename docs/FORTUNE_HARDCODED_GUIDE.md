# 占い・診断関連のハードコード箇所と変更方法

## 1. おつきさま診断（生年月日ベース）

### 1.1 月相タイプの定義
**ファイル**: `/core/moon-fortune.js`

#### 現在の表示内容
```javascript
newMoon: {
  name: '新月タイプ',
  symbol: '🌑',
  traits: '新しい始まりを求める冒険家',
  description: '直感力が鋭く、常に新しいことにチャレンジする情熱的なタイプ。恋愛においても積極的で、運命的な出会いを信じています。',
  keywords: ['情熱', '直感', '冒険', '始まり', 'チャレンジ']
}
```

#### 変更方法
```javascript
// 例：新月タイプを変更したい場合
newMoon: {
  name: '新月タイプ',  // ← "神秘の新月タイプ"に変更可能
  symbol: '🌑',  // ← 他の絵文字に変更可能（例: '🆕'）
  traits: '新しい始まりを求める冒険家',  // ← "未知への挑戦者"など
  description: '直感力が鋭く...',  // ← 説明文を自由に変更
  keywords: ['情熱', '直感', ...]  // ← キーワードを変更・追加
}
```

### 1.2 相性スコアマトリックス
**ファイル**: `/core/moon-fortune.js` (75-120行目)

#### 現在の表示内容
```javascript
this.compatibilityMatrix = {
  'newMoon-newMoon': 75,         // 新月×新月 = 75点
  'newMoon-fullMoon': 95,        // 新月×満月 = 95点（最高相性）
  'firstQuarter-lastQuarter': 95, // 上弦×下弦 = 95点（最高相性）
  // ...
}
```

#### 変更方法
```javascript
// スコアを変更（0-100の範囲）
'newMoon-newMoon': 85,  // 75→85に変更
'newMoon-fullMoon': 100, // 95→100（満点）に変更

// 新しい判定ロジックを追加したい場合
calculateCompatibilityScore(user, partner) {
  // 年齢差による補正を追加
  let ageDiffBonus = 0;
  const ageDiff = Math.abs(user.age - partner.age);
  if (ageDiff <= 3) ageDiffBonus = 5;  // 3歳以内なら+5点
  
  return baseScore + ageDiffBonus;
}
```

### 1.3 診断結果メッセージ
**ファイル**: `/index.js` (1100-1400行目)

#### 現在の表示内容
```javascript
// 相性診断結果カード
{
  type: 'text',
  text: `相性スコア: ${compatibilityScore}点`,
  size: 'xxl',
  weight: 'bold'
},
{
  type: 'text',
  text: `${userType.name} × ${partnerType.name}`,
  size: 'lg'
},
{
  type: 'text',
  text: result.advice || 'お互いの個性を認め合うことで、素晴らしい関係が築けるでしょう。',
  wrap: true,
  size: 'sm'
}
```

#### 変更方法
```javascript
// スコアによって異なるメッセージを表示
const getScoreMessage = (score) => {
  if (score >= 90) return '🎉 運命の相性！最高のパートナーです';
  if (score >= 80) return '💕 とても良い相性です';
  if (score >= 70) return '😊 良い相性です';
  if (score >= 60) return '🤔 努力次第で良い関係に';
  return '💪 お互いの違いを楽しみましょう';
};

// アドバイスをカスタマイズ
const getAdvice = (userType, partnerType, score) => {
  // 特定の組み合わせに特別なアドバイス
  if (userType === 'fullMoon' && partnerType === 'newMoon') {
    return '光と闇の完璧なバランス。お互いを補完し合える理想的な関係です。';
  }
  // デフォルトアドバイス
  return 'お互いの個性を認め合うことで、素晴らしい関係が築けるでしょう。';
};
```

---

## 2. 恋愛診断（メッセージ分析）

### 2.1 基本分析の判定基準
**ファイル**: `/core/fortune-engine.js`

#### 現在の表示内容
```javascript
// 返信速度スコアの計算
calculateResponseSpeed(messages) {
  const avgResponseTime = this.getAverageResponseTime(messages);
  if (avgResponseTime < 300000) return 90;      // 5分以内 = 90点
  if (avgResponseTime < 600000) return 75;      // 10分以内 = 75点
  if (avgResponseTime < 1800000) return 60;     // 30分以内 = 60点
  if (avgResponseTime < 3600000) return 45;     // 1時間以内 = 45点
  return 30;  // それ以上 = 30点
}
```

#### 変更方法
```javascript
// 判定基準を変更
calculateResponseSpeed(messages) {
  const avgResponseTime = this.getAverageResponseTime(messages);
  if (avgResponseTime < 180000) return 95;      // 3分以内 = 95点（より厳しく）
  if (avgResponseTime < 300000) return 85;      // 5分以内 = 85点
  if (avgResponseTime < 900000) return 70;      // 15分以内 = 70点
  if (avgResponseTime < 3600000) return 50;     // 1時間以内 = 50点
  return 25;  // それ以上 = 25点（より厳しく）
}
```

### 2.2 波動分析（オーラカラー）
**ファイル**: `/core/wave-fortune.js`

#### 現在の表示内容
```javascript
// オーラカラーの判定キーワード
detectAuraColor(messages) {
  const colors = {
    red: { name: '情熱の赤', meaning: '強い愛情と欲求', score: 0 },
    pink: { name: 'ローズピンク', meaning: '無条件の愛と優しさ', score: 0 },
    // ...
  };
  
  messages.forEach(msg => {
    const text = msg.text.toLowerCase();
    // キーワードマッチング
    if (text.includes('愛') || text.includes('好き')) colors.pink.score += 2;
    if (text.includes('楽しい') || text.includes('嬉しい')) colors.yellow.score += 2;
    if (text.includes('ありがとう')) colors.green.score += 2;
    // ...
  });
}
```

#### 変更方法
```javascript
// オーラカラーの定義を変更
const colors = {
  red: { 
    name: '炎の赤',  // ← '情熱の赤'から変更
    meaning: '燃えるような恋心',  // ← 意味を変更
    score: 0 
  },
  pink: { 
    name: '桜ピンク',  // ← 'ローズピンク'から変更
    meaning: '初恋のような純粋さ',  // ← 意味を変更
    score: 0 
  },
  // 新しい色を追加
  violet: {
    name: '神秘の紫',
    meaning: 'スピリチュアルな繋がり',
    score: 0
  }
};

// キーワードと重み付けを変更
const keywordWeights = {
  '愛': { color: 'pink', weight: 3 },     // 重み2→3に増加
  '好き': { color: 'pink', weight: 2 },
  'love': { color: 'pink', weight: 3 },   // 英語も追加
  '楽しい': { color: 'yellow', weight: 2 },
  'ありがとう': { color: 'green', weight: 1 },  // 重み2→1に減少
  '会いたい': { color: 'red', weight: 3 },      // 新規追加
  '寂しい': { color: 'blue', weight: 2 }        // 新規追加
};
```

### 2.3 診断結果の表示テキスト
**ファイル**: `/index.js` (fortune result section)

#### 現在の表示内容
```javascript
// 総合スコアの表示
`💕 総合相性スコア: ${score}点`

// オーラカラーの表示
`🌈 オーラカラー: ${auraColor.name}`
`${auraColor.meaning}`

// 各項目の評価
`✨ コミュニケーション: ${'★'.repeat(stars)}${'☆'.repeat(5-stars)}`
```

#### 変更方法
```javascript
// スコア表示をカスタマイズ
const getScoreEmoji = (score) => {
  if (score >= 90) return '💖';  // ハート変更
  if (score >= 80) return '💕';
  if (score >= 70) return '💗';
  if (score >= 60) return '💓';
  return '💔';  // 低スコアは割れたハート
};

`${getScoreEmoji(score)} 相性度: ${score}%`  // 点→%表示に変更

// オーラの説明を詳細化
const getAuraDescription = (auraColor) => {
  const descriptions = {
    'ローズピンク': '愛に満ちたオーラ。相手を思いやる優しさが伝わっています。',
    '情熱の赤': '強い感情のオーラ。情熱的な恋愛を求めています。',
    '太陽の黄': '明るく楽しいオーラ。一緒にいて楽しい関係です。'
  };
  return descriptions[auraColor.name] || auraColor.meaning;
};
```

---

## 3. プレミアムレポート（AI分析）

### 3.1 AIプロンプト
**ファイル**: `/core/premium/report-generator.js` (913行目〜)

#### 現在の表示内容
```javascript
const prompt = `以下のLINEトーク履歴を分析し、恋愛アドバイザーとして非常に詳細なレポートを作成してください。

会話サンプル：
${recentMessages}

基本分析結果：
- 総合スコア: ${fortune.overall?.score || 70}点
- 合計メッセージ数: ${messages.length}

以下のJSON形式で詳細な分析を提供してください：
{
  "relationshipStage": "関係性の現在の段階（初期/友達/好意/両思い/恋人など）の詳細説明",
  // ...
}`;
```

#### 変更方法
```javascript
// プロンプトを変更して分析の観点を変える
const prompt = `
あなたは経験豊富な恋愛カウンセラーです。
以下のLINEトーク履歴から、二人の関係性を心理学的観点から分析してください。

【重要な分析ポイント】
1. 愛着スタイルの分析（安定型/不安型/回避型）
2. コミュニケーションパターン（建設的/破壊的）
3. 感情的な親密度の進展
4. 将来の関係性予測

【会話データ】
${recentMessages}

【追加で分析してほしい項目】
- 相手の本音度（0-100%）
- 脈ありサイン（具体的な言動）
- 注意すべき危険信号
- 今後3ヶ月の展開予測

JSON形式で回答してください。
`;
```

### 3.2 分析項目のカスタマイズ
**ファイル**: `/core/premium/report-generator.js`

#### 現在の表示内容（相性22項目）
```javascript
const compatibilityItems = [
  { category: 'コミュニケーション', item: '返信速度の相性', score: 72 },
  { category: 'コミュニケーション', item: 'メッセージ長度の相性', score: 68 },
  // ...
];
```

#### 変更方法
```javascript
// 項目を追加・変更
const compatibilityItems = [
  // 既存項目の名称変更
  { category: 'コミュニケーション', item: 'レスポンスの相性', score: 72 },
  
  // 新しい項目を追加
  { category: 'コミュニケーション', item: 'スタンプ使用の相性', score: 85 },
  { category: 'コミュニケーション', item: '話題の広がり度', score: 78 },
  
  // 新しいカテゴリを追加
  { category: '恋愛成熟度', item: '感情表現の成熟度', score: 82 },
  { category: '恋愛成熟度', item: '依存度バランス', score: 75 },
  { category: '恋愛成熟度', item: '自己開示レベル', score: 88 }
];

// スコア計算ロジックを変更
calculateItemScore(category, item, messages) {
  if (item === 'スタンプ使用の相性') {
    // スタンプ使用頻度から相性を計算
    const userStamps = messages.filter(m => m.isUser && m.type === 'sticker').length;
    const partnerStamps = messages.filter(m => !m.isUser && m.type === 'sticker').length;
    const diff = Math.abs(userStamps - partnerStamps);
    return Math.max(100 - diff * 5, 0);  // 差が大きいほどスコア減少
  }
  // ...
}
```

### 3.3 PDFレポートの文言
**ファイル**: `/core/premium/pdf-generator.js`

#### 現在の表示内容
```html
<h1>プレミアム恋愛レポート</h1>
<div class="score-card">
  <div class="score-number">${overallScore}</div>
  <div class="score-label">総合相性スコア</div>
</div>
```

#### 変更方法
```javascript
// タイトルや見出しを変更
const reportTitle = settings.customTitle || 'あなただけの恋愛診断書';
const scoreLabel = settings.customScoreLabel || '運命の相性度';

// セクションタイトルをカスタマイズ
const sectionTitles = {
  summary: '診断サマリー',  // ← 'エグゼクティブサマリー'から変更
  communication: '会話分析',  // ← 'コミュニケーション分析'から変更
  compatibility: '相性診断',  // ← '詳細相性分析'から変更
  action: '恋愛戦略',  // ← 'アクションプラン'から変更
  prediction: '未来予測'  // ← '将来予測'から変更
};

// スコアに応じたメッセージ
const getScoreMessage = (score) => {
  const messages = {
    95: '奇跡の相性！運命の赤い糸で結ばれています',
    90: '理想的な相性！このご縁を大切に',
    85: 'とても良い相性です。明るい未来が待っています',
    80: '良い相性です。お互いを尊重すれば素敵な関係に',
    75: '相性は良好。コミュニケーションを大切に',
    70: '平均以上の相性。努力次第で素晴らしい関係に',
    65: '可能性は十分。相手を理解する努力を',
    60: '違いを楽しめれば良い関係に発展',
    default: '個性的な組み合わせ。新しい発見がある関係'
  };
  
  const key = Object.keys(messages)
    .map(Number)
    .sort((a, b) => b - a)
    .find(threshold => score >= threshold);
    
  return messages[key] || messages.default;
};
```

---

## 4. 変更時の注意事項

### 4.1 スコア・数値の変更
- **範囲**: 0-100の範囲を守る
- **バランス**: 極端な値（0や100）は避ける
- **一貫性**: 関連する箇所も同時に調整

### 4.2 テキスト・文言の変更
- **文字数**: LINEの表示制限を考慮（FlexMessageは2000文字まで）
- **絵文字**: 環境依存文字は避ける
- **改行**: `\n`で改行、長文は`wrap: true`

### 4.3 ロジックの変更
- **テスト**: 変更後は必ずテストメッセージで動作確認
- **エラー処理**: undefined/nullチェックを忘れずに
- **互換性**: 既存データとの互換性を保つ

### 4.4 AI関連の変更
- **トークン数**: GPT-4oの制限（入力+出力で最大128,000トークン）
- **コスト**: プロンプトが長いほどコスト増加
- **応答形式**: JSON形式を要求する場合は例を明示

---

## 5. よくある変更要望と対応例

### Q1: 相性スコアを甘めにしたい
```javascript
// Before: 平均70点
// After: 平均85点になるよう調整
const adjustScore = (originalScore) => {
  return Math.min(100, originalScore * 1.2 + 10);
};
```

### Q2: 特定の組み合わせに特別メッセージ
```javascript
// 満月×新月の組み合わせ専用
if (userType === 'fullMoon' && partnerType === 'newMoon') {
  return {
    score: 100,  // 満点
    message: '陰と陽の完璧なバランス！最高の相性です',
    advice: '運命の出会いです。このご縁を大切にしてください'
  };
}
```

### Q3: 否定的な表現を避けたい
```javascript
// Before
if (score < 50) return '相性が悪いです';

// After  
if (score < 50) return '個性的な組み合わせ。お互いの違いから学べることが多いでしょう';
```

### Q4: 季節限定メッセージ
```javascript
const getSeasonalMessage = () => {
  const month = new Date().getMonth() + 1;
  if (month === 12) return '🎄 クリスマスまでに進展の可能性大！';
  if (month === 2) return '💝 バレンタインに向けて関係が深まりそう';
  if (month === 3) return '🌸 春の訪れとともに新しい展開が';
  return '';
};
```