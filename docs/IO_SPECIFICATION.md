# LINE Love Edu インプット/アウトプット仕様書

## 1. おつきさま診断（生年月日ベース・無料）

### 1.1 インプット

#### ユーザープロフィール
```javascript
{
  userId: "U69bf66f589f5303a9615e94d7a7dc693",
  userName: "田中太郎",
  userProfile: {
    birthDate: "1998-04-30",  // YYYY-MM-DD形式
    gender: "male"  // male/female
  },
  partnerProfile: {
    birthDate: "1998-11-26",
    gender: "female"
  }
}
```

### 1.2 処理内容

生年月日から月相（月の満ち欠け）タイプを計算：
- 新月タイプ（0-45度）
- 三日月タイプ（45-90度）
- 上弦の月タイプ（90-135度）
- 満ちゆく月タイプ（135-180度）
- 満月タイプ（180-225度）
- 欠けゆく月タイプ（225-270度）
- 下弦の月タイプ（270-315度）
- 逆三日月タイプ（315-360度）

### 1.3 アウトプット

#### 診断結果（FlexMessageカルーセル形式）
```javascript
{
  type: "flex",
  altText: "おつきさま診断結果",
  contents: {
    type: "carousel",
    contents: [
      // カード1: あなたのタイプ
      {
        type: "bubble",
        header: {
          type: "box",
          contents: [
            {
              type: "text",
              text: "🌙 あなたのタイプ",
              color: "#ffd700"
            },
            {
              type: "text",
              text: "満月タイプ",
              size: "xl",
              weight: "bold"
            }
          ]
        },
        body: {
          contents: [
            {
              type: "text",
              text: "カリスマ性のある表現者",
              weight: "bold"
            },
            {
              type: "text",
              text: "明るく華やかで、人を惹きつける魅力があります。感情表現が豊かで、愛情を惜しみなく相手に注ぎます。",
              wrap: true,
              size: "sm"
            },
            {
              type: "text",
              text: "🌟 特徴: カリスマ・魅力・華やか・表現・愛情",
              size: "xs"
            }
          ]
        }
      },
      
      // カード2: お相手のタイプ
      {
        // 同様の構造
      },
      
      // カード3: 相性診断結果
      {
        type: "bubble",
        header: {
          type: "text",
          text: "💕 相性診断結果"
        },
        body: {
          contents: [
            {
              type: "text",
              text: "相性スコア: 85点",
              size: "xxl",
              weight: "bold",
              color: "#ff1493"
            },
            {
              type: "text",
              text: "満月×上弦の月",
              size: "md"
            },
            {
              type: "text",
              text: "リーダーシップを持つ二人の組み合わせ。お互いを尊重し合えば、素晴らしいパートナーシップが築けます。",
              wrap: true,
              size: "sm"
            },
            {
              type: "text",
              text: "💡 アドバイス: お互いの個性を認め合い、時には相手に主導権を譲ることで、より深い関係が築けるでしょう。",
              wrap: true,
              size: "xs",
              color: "#666666"
            }
          ]
        }
      },
      
      // カード4: より詳しい診断へ
      {
        type: "bubble",
        body: {
          contents: [
            {
              type: "text",
              text: "💎 さらに詳しい分析を",
              size: "lg",
              weight: "bold"
            },
            {
              type: "text",
              text: "トーク履歴を分析して、より詳細な恋愛レポートを作成できます",
              wrap: true,
              size: "sm"
            },
            {
              type: "button",
              action: {
                type: "message",
                label: "プレミアムレポート（¥1,980）",
                text: "プレミアムレポート"
              },
              style: "primary",
              color: "#FF1493"
            }
          ]
        }
      }
    ]
  }
}
```

---

## 2. 恋愛診断（メッセージ分析・無料）

### 2.1 インプット

#### メッセージ履歴
```javascript
[
  {
    id: "msg_001",
    text: "今日も一日お疲れ様！",
    timestamp: "2025-08-10T20:30:00Z",
    isUser: true,  // true=ユーザー, false=相手
    type: "text"
  },
  {
    id: "msg_002",
    text: "お疲れ様〜！今日は何してたの？",
    timestamp: "2025-08-10T20:31:00Z",
    isUser: false,
    type: "text"
  }
  // ... 全メッセージ履歴
]
```

### 2.2 処理内容

#### 基本分析（FortuneEngine）
- メッセージ数カウント
- 返信速度の計算
- 絵文字使用頻度
- メッセージ長の比較
- 会話の主導権分析
- 簡易的な感情分析

#### 波動分析（WaveFortuneEngine）
- オーラカラー検出
- チャクラバランス分析
- エネルギーフロー測定
- 魂の振動数計算
- 愛の周波数測定

### 2.3 アウトプット

#### 診断結果（FlexMessage形式）
```javascript
{
  type: "flex",
  altText: "恋愛診断結果",
  contents: {
    type: "bubble",
    body: {
      contents: [
        // 総合スコア（0-100点）
        {
          type: "text",
          text: "💕 総合相性スコア: 78点",
          size: "xl",
          weight: "bold",
          color: "#FF1493"
        },
        
        // 波動分析結果
        {
          type: "text",
          text: "🌈 オーラカラー: ローズピンク",
          size: "lg"
        },
        {
          type: "text",
          text: "無条件の愛と優しさに満ちています",
          size: "sm",
          wrap: true
        },
        
        // 基本分析結果（3-5項目）
        {
          type: "box",
          contents: [
            {
              type: "text",
              text: "✨ コミュニケーション: ★★★★☆",
              wrap: true
            },
            {
              type: "text",
              text: "💝 感情の一致度: ★★★☆☆",
              wrap: true
            },
            {
              type: "text",
              text: "🎯 将来性: ★★★★★",
              wrap: true
            },
            {
              type: "text",
              text: "⚡ エネルギー相性: ★★★★☆",
              wrap: true
            }
          ]
        },
        
        // 簡単なアドバイス（1-2文）
        {
          type: "text",
          text: "💡 アドバイス: もう少し積極的にアプローチしてみましょう！相手も好意を持っている可能性が高いです。",
          wrap: true,
          size: "sm",
          color: "#666666"
        },
        
        // プレミアムレポートへの誘導
        {
          type: "button",
          action: {
            type: "message",
            label: "詳細レポートを見る（¥1,980）",
            text: "プレミアムレポート"
          },
          style: "primary",
          color: "#FF1493"
        }
      ]
    }
  }
}
```

---

## 3. プレミアムレポート（有料版 ¥1,980）

### 3.1 インプット

#### メッセージ履歴（全履歴）
```javascript
{
  messages: [
    {
      id: "msg_001",
      text: "メッセージ全文（文字数制限なし）",
      timestamp: "2025-08-10T20:30:00Z",
      isUser: true,
      type: "text",
      // 追加メタデータ
      replyTo: "msg_000",  // 返信先メッセージID
      reactions: ["❤️", "👍"],  // リアクション
      edited: false  // 編集済みフラグ
    }
    // ... 全メッセージ（制限なし）
  ],
  totalCount: 1948,  // 総メッセージ数
  dateRange: {
    start: "2024-01-01T00:00:00Z",
    end: "2025-08-10T23:59:59Z"
  }
}
```

#### ユーザープロフィール（オプション）
```javascript
{
  userId: "U69bf66f589f5303a9615e94d7a7dc693",
  userName: "田中太郎",
  profile: {
    age: 27,
    birthdate: "1998-04-30",
    occupation: "会社員",
    relationshipGoal: "結婚を前提とした真剣交際"
  },
  partnerProfile: {
    name: "佐藤花子",
    age: 26,
    birthdate: "1998-11-26"
  }
}
```

#### 支払い情報
```javascript
{
  orderId: "ORDER_U69bf66f_1754839838781_v15cj4",
  amount: 1980,
  paidAt: "2025-08-10T15:30:51.438Z",
  stripeSessionId: "cs_test_xxxxx"
}
```

### 3.2 アウトプット（HTMLレポート → PDF）

#### レポート構造
```javascript
{
  // メタデータ
  metadata: {
    reportId: "RPT_2025081_U69bf66f_001",
    generatedAt: "2025-08-10T15:33:00Z",
    version: "1.0",
    totalPages: 15
  },
  
  // エグゼクティブサマリー（1ページ）
  summary: {
    overallScore: 85,  // 総合スコア
    relationshipStage: "両思い段階",
    keyFindings: [
      "相手はあなたに好意を持っています",
      "コミュニケーションスタイルは相性抜群",
      "告白のベストタイミングは今月中"
    ],
    criticalAdvice: "今すぐ行動すべき3つのこと"
  },
  
  // 詳細分析（5-7ページ）
  detailedAnalysis: {
    // 1. コミュニケーション分析
    communication: {
      userStyle: "積極的・感情表現豊か・長文傾向",
      partnerStyle: "慎重・理論的・簡潔",
      compatibility: 78,
      patterns: {
        responseTime: {
          user: "平均5分",
          partner: "平均15分",
          analysis: "相手は返信を慎重に考えるタイプ"
        },
        messageLength: {
          user: "平均50文字",
          partner: "平均30文字",
          trend: "最近長くなってきている（好意の表れ）"
        },
        initiation: {
          user: "65%",
          partner: "35%",
          advice: "もう少し相手からの連絡を待つのも効果的"
        }
      }
    },
    
    // 2. 感情分析（AIによる詳細分析）
    emotional: {
      currentState: "相手は明らかに好意を持っているが、慎重になっている段階",
      timeline: [
        {
          period: "初期（1-2ヶ月）",
          state: "探り合い",
          score: 45
        },
        {
          period: "中期（3-4ヶ月）",
          state: "興味・好意の芽生え",
          score: 65
        },
        {
          period: "現在",
          state: "相思相愛の可能性大",
          score: 85
        }
      ],
      keyMoments: [
        {
          date: "2025-07-15",
          event: "相手から初めてプライベートな相談",
          significance: "信頼関係の確立"
        }
      ]
    },
    
    // 3. 相性分析（22項目）
    compatibility: {
      overall: 82,
      categories: {
        communication: {
          score: 78,
          items: [
            { name: "返信速度の相性", score: 72 },
            { name: "メッセージ長の相性", score: 68 },
            { name: "絵文字使用の相性", score: 85 },
            { name: "会話のテンポ", score: 81 },
            { name: "質問頻度バランス", score: 84 }
          ]
        },
        emotional: {
          score: 85,
          items: [
            { name: "感情表現の相性", score: 88 },
            { name: "ユーモアセンス", score: 92 },
            { name: "共感力レベル", score: 79 },
            { name: "ポジティブ度合い", score: 83 },
            { name: "サポート姿勢", score: 85 }
          ]
        },
        values: {
          score: 79,
          items: [
            { name: "共通の趣味・関心", score: 71 },
            { name: "価値観の一致度", score: 82 },
            { name: "将来観の相性", score: 78 },
            { name: "ライフスタイル", score: 85 }
          ]
        },
        timing: {
          score: 86,
          items: [
            { name: "活動時間帯の相性", score: 90 },
            { name: "連絡頻度の相性", score: 82 },
            { name: "デートプラン相性", score: 84 },
            { name: "決断スピード", score: 88 }
          ]
        },
        relationship: {
          score: 84,
          items: [
            { name: "信頼構築スピード", score: 81 },
            { name: "関係性の安定度", score: 86 },
            { name: "成長ポテンシャル", score: 88 },
            { name: "長期的継続性", score: 82 }
          ]
        }
      }
    },
    
    // 4. 占い要素
    fortune: {
      zodiac: {
        user: "牡牛座",
        partner: "射手座",
        compatibility: "挑戦的だが成長できる組み合わせ"
      },
      bloodType: {
        user: "A型",
        partner: "O型",
        compatibility: "補完し合える理想的な組み合わせ"
      },
      numerology: {
        lifePathNumber: 6,
        meaning: "愛と調和を重視する関係"
      },
      monthlyFortune: "今月は告白に最適な時期"
    }
  },
  
  // アクションプラン（3-5ページ）
  actionPlan: {
    immediate: [
      {
        action: "今週中に電話で話す機会を作る",
        reason: "テキストだけでなく声のコミュニケーションで距離を縮める",
        howTo: "「最近忙しそうだけど、久しぶりに声聞きたいな」と自然に誘う",
        expectedResult: "親密度が大幅にアップ"
      }
    ],
    shortTerm: [  // 1ヶ月以内
      {
        action: "デートに誘う",
        timing: "今月の第3週末",
        suggestion: "カジュアルなランチから始める"
      }
    ],
    longTerm: [  // 3ヶ月以内
      {
        action: "告白の準備",
        timing: "2-3回のデート後",
        strategy: "相手の反応を見ながら段階的に"
      }
    ],
    avoid: [
      {
        behavior: "返信の催促",
        reason: "相手は慎重に返信を考えるタイプ",
        alternative: "既読後24時間は待つ"
      }
    ]
  },
  
  // 詳細な会話例とテンプレート（2-3ページ）
  conversationGuide: {
    templates: [
      {
        situation: "デートに誘う時",
        good: "最近○○の話してたよね？今度一緒に行ってみない？",
        bad: "暇な時デートしよう",
        point: "相手の興味に寄り添った提案"
      }
    ],
    examples: {
      successful: [
        {
          context: "相手が仕事で疲れている時",
          message: "お疲れ様！無理しないでね。何か手伝えることあったら言って",
          response: "ありがとう😊 優しいね",
          analysis: "適切な距離感での気遣い"
        }
      ]
    }
  },
  
  // 成功予測（1ページ）
  prediction: {
    successRate: {
      current: 72,
      withActionPlan: 89,
      timeline: "3ヶ月以内"
    },
    riskFactors: [
      {
        risk: "相手の仕事が忙しい時期",
        mitigation: "理解を示しつつ適度な距離を保つ"
      }
    ],
    opportunities: [
      {
        opportunity: "共通の趣味（映画）",
        action: "新作映画をきっかけにデートに誘う"
      }
    ]
  }
}
```

### 3.3 PDF出力仕様

#### デザイン要素
- **サイズ**: A4
- **ページ数**: 12-15ページ
- **カラー**: フルカラー
- **フォント**: 日本語対応（ヒラギノ角ゴ等）

#### ビジュアル要素
- グラフ（Chart.js）
  - 相性レーダーチャート
  - 感情推移グラフ
  - コミュニケーションパターン図
- スコアバー（プログレスバー）
- アイコン・絵文字
- カラーコーディング（良好=ピンク、注意=黄、危険=グレー）

#### セクション構成
1. **表紙**（1ページ）
   - タイトル
   - 生成日時
   - ユーザー名

2. **エグゼクティブサマリー**（1ページ）
   - 総合スコア（大きく表示）
   - 3つの重要ポイント
   - 今すぐやるべきこと

3. **関係性の現状分析**（3-4ページ）
   - タイムライン
   - 現在のステージ
   - 相手の心理状態

4. **詳細相性分析**（3-4ページ）
   - 22項目の詳細スコア
   - レーダーチャート
   - 強み・弱み

5. **アクションプラン**（2-3ページ）
   - 具体的な行動指針
   - NGリスト
   - 会話例

6. **将来予測**（1-2ページ）
   - 成功確率
   - タイムライン
   - リスクと機会

### 3.4 AI (OpenAI GPT-4o) への入力

#### プロンプト構造
```javascript
{
  model: "gpt-4o",
  messages: [
    {
      role: "system",
      content: "あなたは恋愛カウンセラーです。提供されたLINEメッセージ履歴を分析し、詳細な恋愛アドバイスレポートを作成してください。"
    },
    {
      role: "user",
      content: `
        【分析対象】
        総メッセージ数: ${messages.length}
        期間: ${dateRange}
        
        【全メッセージ履歴】
        ${messages.map(m => `${m.isUser ? 'ユーザー' : '相手'}: ${m.text}`).join('\n')}
        
        【分析項目】
        1. 関係性の現在のステージ（詳細に）
        2. コミュニケーションスタイルの分析
        3. 感情の変化と現在の心理状態
        4. 今後のアクションプラン（具体的に）
        5. 成功確率と予測
        
        JSON形式で回答してください。
      `
    }
  ],
  max_tokens: 16384,  // GPT-4oの最大値
  temperature: 0.7
}
```

#### Batch API利用
```javascript
{
  custom_id: `report-${orderId}`,
  method: "POST",
  url: "/v1/chat/completions",
  body: {
    model: "gpt-4o",
    messages: [...],
    max_tokens: 16384
  }
}
```

### 3.5 処理フロー

1. **Step 1**: メッセージ履歴とプロフィール取得
2. **Step 2**: 基本統計分析（メッセージ数、頻度、長さ等）
3. **Step 3**: OpenAI Batch APIでAI分析（全メッセージ送信）
4. **Step 4**: レポート生成（HTML→PDF）
5. **Step 5**: PDFをBase64でDB保存、完了通知

### 3.6 エラーケース

- メッセージが10件未満: "分析には最低10件のメッセージが必要です"
- AI分析失敗: 基本分析のみでレポート生成
- PDF生成失敗: HTML版を提供
- 60秒タイムアウト: GitHub Actions経由で継続処理

---

## 4. 主な違い

| 項目 | おつきさま診断（生年月日） | 恋愛診断（メッセージ分析） | プレミアムレポート（有料） |
|------|---------------------|---------------------|------------------------|
| 分析対象 | 生年月日のみ | メッセージ履歴 | **全メッセージ** |
| AI利用 | なし | なし | GPT-4o（16,384トークン） |
| 分析深度 | 月相タイプ診断 | 統計分析+波動分析 | 心理分析・感情分析含む |
| アウトプット | FlexMessageカルーセル | FlexMessage | PDF（12-15ページ） |
| 処理時間 | 即時（<1秒） | 即時（1-2秒） | 1-2分（Batch API利用） |
| アクションプラン | 簡単なアドバイス | 簡単なアドバイス1文 | 具体的な行動計画 |
| 会話テンプレート | なし | なし | 状況別の例文提供 |
| 将来予測 | なし | なし | 成功確率と時期予測 |
| 必要情報 | 生年月日・性別 | トーク履歴 | トーク履歴+プロフィール |