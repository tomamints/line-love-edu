# 波動恋愛診断（8枚カルーセル）仕様書 v2.0

## 概要
「運命の扉が開かれます」というメッセージから始まる8枚のカルーセル形式の診断結果。
各カードは異なる観点から恋愛の波動を分析し、具体的なアドバイスを提供します。

**v2.0更新内容：**
- AIを使わないロジックベース分析への完全移行
- より精密な行動パターン分析
- パーソナライズ機能の強化
- ネガティブパターン検出の追加
- 関係性段階分析の実装

---

## カード構成と詳細ロジック

### カード1: 運命の扉（オープニング）

**表示内容：**
```
🌙 月の導きが始まります…

おふたりの心に映る月を
視させていただきました

運命度: 85%

「月は告げています…
 ふたつの月が重なる時、
 運命の物語が始まるのです」
```

**スコア計算ロジック（v2.0改良版）：**
```javascript
// 基本スコア
const baseScores = {
  返信速度相性: calculateResponseTimeScore(),
  メッセージ長相性: calculateMessageLengthScore(),
  感情表現相性: calculateEmotionScore(),
  時間帯相性: calculateTimeZoneScore(),
  絵文字使用相性: calculateEmojiScore(),
  会話深度相性: calculateConversationDepthScore(),
  未来志向性: calculateFutureOrientedScore(),
  ポジティブ度相性: calculatePositivityScore(),
  共感度: calculateEmpathyScore(),
  話題の多様性: calculateTopicDiversityScore()
}

// v2.0新規追加：関係性段階による重み付け
const relationshipStage = detectRelationshipStage()
const weightedScore = applyRelationshipWeights(baseScores, relationshipStage)

// 最終スコア = 加重平均
総合スコア = calculateWeightedAverage(weightedScore)
```

**動的/静的：** 動的（メッセージ履歴に基づく）

---

### カード2: 総合運勢（全体評価）

**表示内容：**
```
✨ 月が映す総合運勢

おふたりの運命の輝き: ★★★★☆
月の満ち欠け度: 85%

月詠からの導き：
「今宵の月は、勇気ある一歩を
 照らしてくれることでしょう…」
```

**v2.0改良版メッセージ選択ロジック：**
```javascript
// 関係性段階別メッセージ
const messages = {
  '知り合ったばかり': {
    high: "新しい扉が開く時期です",
    mid: "じっくりお互いを知る時",
    low: "焦らず自然体で"
  },
  '仲良し': {
    high: "関係が深まる絶好のチャンス",
    mid: "信頼を積み重ねていく時期",
    low: "相手の気持ちに耳を傾けて"
  },
  '安定期': {
    high: "新しい刺激が関係を活性化",
    mid: "日々の感謝を忘れずに",
    low: "初心に戻ってみましょう"
  }
}

const stage = detectRelationshipStage()
const scoreLevel = score > 80 ? 'high' : score > 60 ? 'mid' : 'low'
const message = messages[stage][scoreLevel]
```

---

### カード3: おつきさま診断の検証（v2.0深化版）

**表示内容：**
```
🌙 月が映す真実

現在の月相：上弦の月
月の導き：「決断の時が近づいています…」

月が告げる変化の兆し：
✨ 新たな話題への勇気（前週より増加）
✨ 想いの深まり（文字数28%増加）
✨ 心の距離が縮まる（返信速度向上）
🌟 じっくり考える時間は変わらず

お相手の心に映る月：
「月は告げています…
 相手の心も、あなたへと向かい始めています」
→ 温かな感情の表れ（絵文字増加） ✨
```

**v2.0深化ロジック：**
```javascript
const moonPhaseValidation = {
  '新月': {
    // 基本キーワード
    keywords: ['新しい', '始め', 'チャレンジ', '挑戦', '初めて'],
    
    // v2.0新規：行動パターン変化の検出
    behaviorPatterns: {
      newTopicsRate: compareWithPreviousWeek('newTopics'), // 新しい話題の出現率
      initiationRate: calculateConversationInitiation(), // 会話開始率
      futurePlanning: countFutureTenseMessages() // 未来の計画に関する発言
    },
    
    // v2.0新規：数値指標
    metrics: {
      avgMessageLength: calculateAverageLength(), // 平均文字数
      responseTime: calculateAverageResponseTime(), // 平均返信時間
      questionRate: calculateQuestionRate() // 質問率
    }
  },
  
  '満月': {
    keywords: ['感情', '気持ち', '好き', '愛', '嬉しい', '楽しい'],
    
    behaviorPatterns: {
      emotionalIntensity: calculateEmotionalIntensity(), // 感情の強度
      messageLengthVariance: calculateVariance(), // メッセージ長の分散
      peakActivityTime: findPeakActivityTime() // 活動ピーク時間
    },
    
    metrics: {
      avgMessageLength: calculateAverageLength(),
      emojiDensity: calculateEmojiDensity(), // 絵文字密度
      exclamationRate: countExclamations() // 感嘆符の使用率
    }
  },
  
  '下弦の月': {
    keywords: ['考え', '思う', 'かも', 'どうしよう'],
    
    behaviorPatterns: {
      reflectionRate: countReflectiveMessages(), // 内省的メッセージ率
      responseDelay: calculateThinkingTime(), // 熟考時間
      questionDepth: analyzeQuestionComplexity() // 質問の深さ
    },
    
    metrics: {
      avgResponseTime: calculateAverageResponseTime(),
      questionRate: calculateQuestionRate(),
      conditionalStatements: countConditionals() // 条件文の使用率
    }
  }
}

// 直近1週間のメッセージで検証（20件→1週間に変更）
const validationPeriod = 'past_7_days'
```

---

### カード4-5: 運命の瞬間（v2.0精度向上版）

**表示内容：**
```
🌙 月が照らす運命の刻

金曜日 21:00頃
「月が最も美しく輝く時間…」

月光が映し出すもの：
• 心が通い合う瞬間: 8度の応答
• 温かな感情の満ち具合: 92%
• この時間の月の祝福: 87%

月詠からの導き：
「週末の夢を語り合う時…
 月がふたりの道を照らすでしょう」
```

**v2.0精度向上ロジック：**
```javascript
const findDestinyMoments = () => {
  // 基本分析
  const timeAnalysis = analyzeTimePatterns()
  
  // v2.0新規：会話のラリー回数分析
  const rallyAnalysis = {
    definition: '5分以内に3往復以上のメッセージ交換',
    scoring: (messages) => {
      const rallies = detectMessageRallies(messages, 5 * 60) // 5分
      return rallies.map(rally => ({
        time: rally.startTime,
        count: rally.messageCount,
        duration: rally.duration,
        positivity: calculatePositivity(rally.messages),
        topics: extractTopics(rally.messages)
      }))
    }
  }
  
  // v2.0新規：日常ピークと特別ピークの区別
  const peakTypes = {
    daily: {
      name: '日常のピーク',
      criteria: '毎日の定型的なやり取り',
      example: 'おはよう/おやすみの挨拶',
      score: timeAnalysis.regularityScore
    },
    special: {
      name: '特別なピーク',
      criteria: '感情的に盛り上がる瞬間',
      example: '週末の計画、デートの相談',
      score: rallyAnalysis.emotionalIntensity
    }
  }
  
  return {
    moment1: {
      type: 'special',
      time: findBestSpecialTime(),
      reason: generateReason('special'),
      suggestion: generateTimedSuggestion('special'),
      successRate: calculateSuccessRate('special')
    },
    moment2: {
      type: 'daily',
      time: findBestDailyTime(),
      reason: generateReason('daily'),
      suggestion: generateTimedSuggestion('daily'),
      successRate: calculateSuccessRate('daily')
    }
  }
}
```

---

### カード6: ラッキーアイテム（v2.0パーソナライズ強化版）

**表示内容：**
```
🎁 二人だけのラッキーアイテム

色：ローズピンク
理由：「楽しかった❤️」が最多使用

アイテム：ポップコーン 🍿
理由：映画の話題で盛り上がり度No.1

数字：7
理由：最高の盛り上がりが7日の出来事

アクション：新しいカフェを探す ☕
理由：カフェの話題で返信速度2倍
```

**v2.0パーソナライズロジック：**
```javascript
const generatePersonalizedLuckyItems = () => {
  // v2.0新規：会話データから抽出
  const luckyColor = () => {
    const colorEmojis = {
      '❤️': 'ローズピンク',
      '💙': 'スカイブルー',
      '💚': 'フォレストグリーン',
      '💛': 'サンシャインイエロー',
      '💜': 'ミスティックパープル',
      '🧡': 'サンセットオレンジ',
      '✨': 'ゴールド',
      '🌟': 'シルバー'
    }
    
    // 最もポジティブな文脈で使われた色絵文字を検出
    const positiveColorUsage = analyzeEmojiContext(colorEmojis)
    return positiveColorUsage.top.color
  }
  
  const luckyItem = () => {
    // 最も盛り上がった話題と連動
    const topTopic = findMostExcitingTopic()
    const itemMap = {
      '映画': { item: 'ポップコーン', emoji: '🍿' },
      'カフェ': { item: 'コーヒー', emoji: '☕' },
      '音楽': { item: 'イヤホン', emoji: '🎧' },
      '旅行': { item: '地図', emoji: '🗺️' },
      '料理': { item: 'エプロン', emoji: '👨‍🍳' },
      'スポーツ': { item: 'スニーカー', emoji: '👟' },
      '読書': { item: 'しおり', emoji: '📖' },
      'ゲーム': { item: 'コントローラー', emoji: '🎮' }
    }
    return itemMap[topTopic] || { item: 'お守り', emoji: '🔮' }
  }
  
  const luckyNumber = () => {
    // 最も盛り上がった日付や時間から抽出
    const peakMoment = findPeakExcitement()
    return {
      number: peakMoment.date || peakMoment.hour,
      reason: peakMoment.description
    }
  }
  
  const luckyAction = () => {
    // 成功率の高い行動パターンから提案
    const successfulPatterns = analyzeSuccessfulInteractions()
    return {
      action: successfulPatterns.top.action,
      reason: successfulPatterns.top.reason,
      timing: successfulPatterns.top.bestTime
    }
  }
  
  return {
    color: luckyColor(),
    item: luckyItem(),
    number: luckyNumber(),
    action: luckyAction()
  }
}
```

---

### カード7: アクションプラン（v2.0深掘り提案版）

**表示内容：**
```
📋 今週のアクションプラン

優先度1：深掘り提案 🎯
「先週の映画の話、その後どうなった？」
→ 未完の話題を再開（成功率92%）

優先度2：相手の興味に寄り添う 💝
「〇〇さんの好きな音楽、もっと教えて」
→ 相手が3回以上言及した話題

優先度3：避けるべき話題 ⚠️
仕事の話題は返信が遅くなる傾向
→ 今週は趣味の話を中心に

実行確率: 87%
関係性段階: 仲良し期
```

**v2.0深掘り提案ロジック：**
```javascript
const generateAdvancedActionPlan = () => {
  // v2.0新規：深掘り提案機能
  const deepDivesuggestions = () => {
    const unfinishedTopics = findUnfinishedConversations()
    return unfinishedTopics.map(topic => ({
      message: `${topic.subject}の話、その後どうなった？`,
      reason: '未完の話題を再開',
      lastMentioned: topic.daysAgo,
      excitement: topic.originalExcitement,
      successRate: calculateTopicSuccessRate(topic)
    }))
  }
  
  // v2.0新規：相手の興味関心分析
  const partnerInterests = () => {
    const theirWords = analyzePartnerVocabulary()
    const myWords = analyzeMyVocabulary()
    
    // 相手が多用するが自分があまり使わない単語
    const interestGap = findVocabularyGap(theirWords, myWords)
    
    return {
      suggestion: `${interestGap.top}について、もっと教えて`,
      reason: `相手が${interestGap.frequency}回言及`,
      category: interestGap.category
    }
  }
  
  // v2.0新規：ネガティブパターン検出
  const avoidancePatterns = () => {
    const negativeTopics = detectNegativePatterns()
    return negativeTopics.map(topic => ({
      topic: topic.name,
      indicator: topic.negativeIndicator, // 返信遅延、会話終了など
      alternative: findAlternativeTopic(topic),
      severity: topic.impactScore
    }))
  }
  
  // v2.0新規：関係性段階別アドバイス
  const stageSpecificAdvice = () => {
    const stage = detectRelationshipStage()
    const advice = {
      '知り合ったばかり': {
        focus: '質問を増やして相手を知る',
        avoid: '重い話題や将来の話',
        recommend: '共通の趣味探し'
      },
      '仲良し': {
        focus: '感情の共有を深める',
        avoid: 'マンネリ化',
        recommend: '新しい体験の提案'
      },
      '安定期': {
        focus: '新鮮さを保つ工夫',
        avoid: '当たり前になること',
        recommend: 'サプライズや特別な演出'
      }
    }
    return advice[stage]
  }
  
  return {
    priority1: deepDivesuggestions()[0],
    priority2: partnerInterests(),
    priority3: avoidancePatterns()[0],
    stageAdvice: stageSpecificAdvice(),
    executionProbability: calculateOverallSuccessRate()
  }
}
```

---

### カード8: プレミアム誘導

**表示内容：**
```
💎 もっと詳しく知りたい方へ

プレミアム恋愛診断で
• 22項目の詳細分析
• 12-15ページの完全レポート
• 具体的な成功戦略
• 3ヶ月先の未来予測

特別価格: ¥1,980
[詳しく見る]
```

**動的/静的：** 静的（固定コンテンツ）

---

## v2.0新機能：関係性段階分析

### 関係性の自動判定ロジック

```javascript
const detectRelationshipStage = () => {
  const indicators = {
    // 知り合ったばかり（0-3ヶ月）
    acquaintance: {
      messageFrequency: 'low', // 1日10通未満
      topicDiversity: 'exploring', // 話題が定まっていない
      emotionalDepth: 'surface', // 表面的な会話
      questionRate: 'high', // 質問が多い（30%以上）
      formalityLevel: 'polite', // 敬語や丁寧な表現
      emojiUsage: 'moderate' // 絵文字は控えめ
    },
    
    // 仲良し（3-12ヶ月）
    friend: {
      messageFrequency: 'medium', // 1日10-50通
      topicDiversity: 'balanced', // 定番話題と新規話題
      emotionalDepth: 'sharing', // 感情の共有
      questionRate: 'medium', // 質問は適度（15-30%）
      formalityLevel: 'casual', // カジュアルな会話
      emojiUsage: 'frequent', // 絵文字多用
      insideJokes: 'present' // 内輪ネタあり
    },
    
    // 安定期（12ヶ月以上）
    stable: {
      messageFrequency: 'consistent', // 安定した頻度
      topicDiversity: 'routine', // ルーティン化
      emotionalDepth: 'implicit', // 言わなくても分かる
      questionRate: 'low', // 質問は少ない（15%未満）
      formalityLevel: 'intimate', // 親密な表現
      emojiUsage: 'selective', // 絵文字は選択的
      silenceComfort: 'high' // 沈黙も心地よい
    }
  }
  
  // 各指標をスコア化して最も近い段階を判定
  const scores = calculateStageScores(indicators)
  return scores.highest.stage
}
```

---

## v2.0新機能：ネガティブパターン検出

### お助け機能の実装

```javascript
const detectNegativePatterns = () => {
  const patterns = {
    // 返信遅延パターン
    responseDelay: {
      detect: (topic) => {
        const avgResponse = calculateAverageResponseTime()
        const topicResponse = calculateTopicResponseTime(topic)
        return topicResponse > avgResponse * 2
      },
      advice: '今はこの話題より、別の話の方が盛り上がりそう'
    },
    
    // 会話終了パターン
    conversationKiller: {
      detect: (topic) => {
        const endings = countConversationEndings()
        return endings[topic] > averageEndings * 1.5
      },
      advice: 'この話題の後は会話が続きにくいみたい'
    },
    
    // 短文返答パターン
    shortResponse: {
      detect: (topic) => {
        const avgLength = calculateAverageMessageLength()
        const topicLength = calculateTopicMessageLength(topic)
        return topicLength < avgLength * 0.5
      },
      advice: '相手の関心が薄いかも。別の角度から話してみて'
    },
    
    // 絵文字減少パターン
    emojiDecrease: {
      detect: (topic) => {
        const avgEmoji = calculateAverageEmojiUsage()
        const topicEmoji = calculateTopicEmojiUsage(topic)
        return topicEmoji < avgEmoji * 0.3
      },
      advice: 'テンションが下がる話題かも'
    }
  }
  
  return analyzeAllTopics(patterns)
}
```

---

## 実装ファイル構成

### コアロジック
- `/core/analysis/scoring-logic.js` - スコア計算ロジック
- `/core/analysis/pattern-detector.js` - パターン検出エンジン
- `/core/analysis/relationship-stage.js` - 関係性段階分析
- `/core/analysis/negative-patterns.js` - ネガティブパターン検出

### フォーマッター
- `/core/formatter/fortune-carousel.js` - カルーセル生成
- `/core/formatter/personalization.js` - パーソナライズ処理

### データ構造
- `/core/premium/wave-fortune.js` - データモデル定義

---

## パフォーマンス最適化

### 処理速度目標
- 全体処理: 500ms以内
- 各分析: 50ms以内
- レンダリング: 100ms以内

### キャッシュ戦略
```javascript
const cache = {
  messageAnalysis: 5分,
  relationshipStage: 1日,
  luckyItems: 1時間,
  negativePatterns: 30分
}
```

---

## 今後の展開ロードマップ

### Phase 1（即実装可能 - 1週間）
✅ 時間帯別メッセージ頻度分析
✅ 話題別の返信速度計算
✅ 基本的な盛り上がり検出
✅ 会話のラリー回数分析

### Phase 2（追加開発 - 2週間）
🔄 絵文字使用パターンの詳細分析
🔄 関係性段階の自動判定
🔄 ネガティブパターン検出
🔄 深掘り提案機能

### Phase 3（高度な分析 - 1ヶ月）
📅 月相と行動の相関検証
📅 季節性パターン分析
📅 長期トレンド予測
📅 個別学習システム

---

## 成功指標（KPI）

### エンゲージメント指標
- カルーセル完読率: 目標80%以上
- アクション実行率: 目標60%以上
- リピート利用率: 目標40%以上

### 満足度指標
- 「当たってる」評価: 目標70%以上
- 「役に立った」評価: 目標85%以上
- プレミアム転換率: 目標15%以上

---

## まとめ

v2.0では、AIに依存しない統計的分析手法により、以下を実現します：

1. **コスト削減**: AI API費用ゼロ
2. **高速処理**: 同期処理で即座に結果表示
3. **安定性**: 予測可能で一貫した結果
4. **透明性**: ロジックが明確でデバッグ容易
5. **拡張性**: 新機能を簡単に追加可能

特に「なぜその結果なのか」という理由と「二人の実際のやり取り」との連動性を強化し、ユーザーにとって「ただの占い」ではなく「私たちのための、意味のあるアドバイス」として価値を提供します。