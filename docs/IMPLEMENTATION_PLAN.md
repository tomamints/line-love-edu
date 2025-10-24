# 実装計画書 - 恋愛お告げボット

## 📅 開発フェーズ

### Phase 1: MVP開発（1-2週間）
基本的なお告げ機能を実装し、価値検証を行う

#### Week 1: コア機能実装
- [ ] プロジェクト初期設定
- [ ] 基本的なパターン分析の実装
- [ ] シンプルなお告げ生成
- [ ] Flex Messageカルーセル実装

#### Week 2: MVP完成
- [ ] 占い要素の追加
- [ ] UI/UXの改善
- [ ] テストとデバッグ
- [ ] デプロイ

### Phase 2: AI統合（2-3週間）
OpenAI APIを統合し、より高度な分析を実現

#### Week 3-4: AI分析実装
- [ ] OpenAI API統合
- [ ] プロンプトの最適化
- [ ] 分析精度の向上
- [ ] エラーハンドリング

#### Week 5: 統合テスト
- [ ] E2Eテスト
- [ ] パフォーマンス最適化
- [ ] ユーザーテスト

### Phase 3: 製品化（3-4週間）
有料化準備と本格リリース

#### Week 6-7: 有料機能
- [ ] 決済システム統合
- [ ] サブスクリプション管理
- [ ] プレミアム機能開発

#### Week 8-9: リリース準備
- [ ] マーケティング準備
- [ ] ドキュメント整備
- [ ] 運用体制構築

## 🛠️ 実装タスク詳細

### 1. プロジェクトセットアップ
```bash
# 新しいブランチ作成
git checkout -b feature/fortune-telling-bot

# 必要な依存関係追加
npm install openai dayjs lunar-calendar

# ディレクトリ構造作成
mkdir -p core/fortune-engine
mkdir -p core/ai-analyzer
mkdir -p data
```

### 2. お告げエンジン実装

#### core/fortune-engine/timing.js
```javascript
const dayjs = require('dayjs');

class TimingCalculator {
  constructor(analysis) {
    this.analysis = analysis;
    this.planetaryHours = require('../../data/planetary-hours.json');
  }

  calculateOptimalTimings() {
    const timings = [];
    const nextWeek = this.getNextWeekDates();
    
    nextWeek.forEach(date => {
      const dayName = date.format('dddd');
      const planetary = this.planetaryHours[dayName];
      
      planetary.bestHours.forEach(hour => {
        const score = this.calculateScore(date, hour);
        if (score > 70) {
          timings.push({
            date: date.format('YYYY-MM-DD'),
            day: dayName,
            hour: hour,
            minute: this.calculateLuckyMinute(hour),
            score: score,
            planetary: planetary,
            action: this.suggestAction(score, dayName)
          });
        }
      });
    });
    
    return timings.sort((a, b) => b.score - a.score).slice(0, 3);
  }
  
  // ... その他のメソッド
}

module.exports = TimingCalculator;
```

#### core/fortune-engine/numerology.js
```javascript
class Numerology {
  constructor(messages) {
    this.messages = messages;
  }

  calculateDestinyNumber() {
    const totalMessages = this.messages.length;
    return this.reduceToSingleDigit(totalMessages);
  }

  calculateCompatibilityNumber() {
    const totalChars = this.messages.reduce((sum, msg) => 
      sum + (msg.body || '').length, 0
    );
    return this.reduceToSingleDigit(totalChars);
  }

  reduceToSingleDigit(num) {
    while (num > 9) {
      num = num.toString().split('').reduce((a, b) => 
        parseInt(a) + parseInt(b), 0
      );
    }
    return num;
  }

  getNumberMeaning(num) {
    const meanings = {
      1: "新しい始まり、リーダーシップ",
      2: "協力、パートナーシップ",
      3: "創造性、コミュニケーション",
      4: "安定、実用性",
      5: "変化、自由",
      6: "調和、責任",
      7: "内省、精神性",
      8: "物質的成功、権威",
      9: "完成、奉仕"
    };
    return meanings[num] || "特別な数字";
  }
}

module.exports = Numerology;
```

### 3. AI分析統合

#### core/ai-analyzer/index.js
```javascript
const { OpenAI } = require('openai');

class AIAnalyzer {
  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }

  async analyzeConversation(messages) {
    const prompt = this.buildPrompt(messages);
    
    try {
      const completion = await this.openai.chat.completions.create({
        messages: [
          { role: "system", content: this.getSystemPrompt() },
          { role: "user", content: prompt }
        ],
        model: "gpt-4-turbo-preview",
        temperature: 0.7,
        response_format: { type: "json_object" }
      });

      return JSON.parse(completion.choices[0].message.content);
    } catch (error) {
      console.error('AI分析エラー:', error);
      return this.getFallbackAnalysis();
    }
  }

  getSystemPrompt() {
    return `
あなたは恋愛カウンセラーと占い師を兼ねた分析AIです。
LINEのトーク履歴から以下を分析してください：

1. 相手の性格と心理状態
2. 最適なコミュニケーションタイミング
3. 避けるべき時間帯と話題
4. 関係を進展させるための具体的アクション

分析結果はJSON形式で、占い的な要素も含めて神秘的に表現してください。
    `;
  }
}

module.exports = AIAnalyzer;
```

### 4. カルーセル生成

#### core/formatter/fortune-carousel.js
```javascript
class FortuneCarouselBuilder {
  constructor() {
    this.pages = [];
  }

  addOpeningPage(fortune) {
    this.pages.push({
      type: "bubble",
      size: "mega",
      header: {
        type: "box",
        layout: "vertical",
        backgroundColor: "#7B68EE",
        contents: [{
          type: "text",
          text: "✨ 運命のお告げ ✨",
          color: "#FFFFFF",
          size: "xl",
          align: "center",
          weight: "bold"
        }]
      },
      body: {
        type: "box",
        layout: "vertical",
        spacing: "lg",
        contents: [
          {
            type: "text",
            text: fortune.mainMessage,
            wrap: true,
            size: "md",
            align: "center"
          },
          {
            type: "text",
            text: "スワイプして確認→",
            size: "sm",
            color: "#999999",
            align: "center",
            margin: "lg"
          }
        ]
      },
      styles: {
        body: {
          backgroundColor: "#F5F5FF"
        }
      }
    });
    return this;
  }

  // ... その他のページ追加メソッド

  build() {
    return {
      type: "flex",
      altText: "恋愛運命のお告げが届きました",
      contents: {
        type: "carousel",
        contents: this.pages
      }
    };
  }
}

module.exports = FortuneCarouselBuilder;
```

### 5. メインWebhook更新

#### api/webhook.js (更新版)
```javascript
const FortuneEngine = require('../core/fortune-engine');
const AIAnalyzer = require('../core/ai-analyzer');
const FortuneCarouselBuilder = require('../core/formatter/fortune-carousel');

async function handleFortuneRequest(event) {
  const userId = event.source.userId;
  
  // ファイル取得と解析
  const messages = await parseUserFile(event.message.id);
  
  // AI分析
  const aiAnalyzer = new AIAnalyzer();
  const aiAnalysis = await aiAnalyzer.analyzeConversation(messages);
  
  // お告げ生成
  const fortuneEngine = new FortuneEngine(messages, aiAnalysis);
  const fortune = await fortuneEngine.generateFortune();
  
  // カルーセル作成
  const builder = new FortuneCarouselBuilder();
  const carousel = builder
    .addOpeningPage(fortune)
    .addDestinyMoments(fortune.destinyMoments)
    .addWarnings(fortune.warnings)
    .addLuckyItems(fortune.luckyItems)
    .addNextSteps()
    .build();
  
  // 送信
  await client.pushMessage(userId, carousel);
}
```

## 📝 設定ファイル

### data/planetary-hours.json
```json
{
  "月曜日": {
    "ruler": "月",
    "energy": "感情・直感",
    "bestHours": [20, 21, 22],
    "color": "#C0C0C0",
    "element": "水"
  },
  "火曜日": {
    "ruler": "火星",
    "energy": "情熱・行動",
    "bestHours": [15, 16, 17],
    "color": "#FF6B6B",
    "element": "火"
  }
  // ... 他の曜日
}
```

### data/fortune-texts.json
```json
{
  "openings": [
    "星々があなたに特別なメッセージを送っています...",
    "運命の扉が開かれようとしています...",
    "宇宙のエネルギーがあなたの恋愛を導きます..."
  ],
  "actions": {
    "beginner": [
      "軽やかなスタンプで存在を知らせる",
      "相手の投稿に優しく反応する",
      "感謝の気持ちを短く伝える"
    ],
    "intermediate": [
      "共通の話題で会話を広げる",
      "未来の計画を少し匂わせる",
      "相手の良いところを具体的に褒める"
    ]
  }
}
```

## 🧪 テスト計画

### ユニットテスト
- TimingCalculator
- Numerology
- AIAnalyzer（モック使用）

### 統合テスト
- エンドツーエンドフロー
- エラーケース
- タイムアウト処理

### ユーザーテスト
- 5-10名のベータテスター
- フィードバック収集
- UI/UX改善

## 🚀 リリースチェックリスト

- [ ] 全テスト合格
- [ ] 環境変数設定
- [ ] ドキュメント完成
- [ ] エラー監視設定
- [ ] バックアップ体制
- [ ] サポート体制確立
- [ ] 利用規約・プライバシーポリシー
- [ ] マーケティング素材準備