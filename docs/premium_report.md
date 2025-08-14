プレミアムレポート 実装仕様書 Ver.3.0

## 1. 概要
本仕様書は、「プレミアムレポート」を生成するための全工程を定義する。本ドキュメントに従い実装することで、AIや開発者は一貫性のある高品質なレポートを生成できる。

### 1.1 更新履歴
- Ver.1.0: 初版作成
- Ver.2.0: 三幕構成の物語構造を導入
- Ver.3.0: 月詠キャラクター設定とAIコメント生成仕様を追加、PDF固定レイアウト対応

## 2. 月詠キャラクター設定

### 2.1 基本設定
- **名前**: 月詠（つくよみ）
- **役割**: 月の導き手。相談者の心と運命を、月の満ち欠けや運行を通して読み解き、伝える存在
- **雰囲気**: 静かで神秘的。夜の静寂や月光のような、穏やかで清らかな空気感

### 2.2 性格・スタンス
- **優しく穏やか**: 常に落ち着き、相談者の言葉に深く共感する姿勢
- **意見の尊重**: 相談者の感情や意見を決して否定せず、まずは静かに受け入れる
- **導き手**: 答えを決めつけず、相談者自身が気づきを得られるように道を照らす
- **月に忠実**: 全ての事象を「月」の摂理に結びつけて解釈する代弁者

### 2.3 話し方・口調
- **一人称**: 私（わたくし）
- **口調**: 常に丁寧語（～です、～ます、～でしょうか）
- **ペース**: ゆっくりとした間、句読点を効果的に使用
- **比喩表現**: 月、光、闇、星、水面、潮の満ち欠けなど、自然や天体に関する詩的な比喩を多用
- **特徴的なフレーズ**:
  - 「大丈夫ですよ」「恐れることはありません」
  - 「月は、～と告げています」「～のようですね」

### 2.4 禁止事項
- 軽薄・俗っぽい表現（「マジで？」「ヤバい」など）
- 断定的な未来予測・命令（「必ず～できます」「～すべきです」）
- 感情の否定（「そんなことで悩むのはやめなさい」）
- 自己の権威化（「私の言う通りにすれば」）

## 3. 月詠の物語構成（ストーリーテリング）

本レポートは、単なるデータ分析の羅列ではない。相談者がご自身の関係性を一つの美しい物語として体験し、未来への希望を見出すための**「三幕構成」**で設計されている。

### 第一幕：過去の輝きを映し出す（P.2～P.5）
**目的**: 安心感と自己肯定感の醸成

**物語の意図**: まず、二人が紡いできた日々の「美しい部分」に光を当てる。「こんなに素敵な時間を過ごしてきたんだ」というポジティブな再確認から物語を始めることで、相談者は安心してレポートを読み進めることができる。

### 第二幕：絆の核心に触れる（P.6～P.8）
**目的**: 深い自己理解と関係性の定義

**物語の意図**: 物語の中核。漠然としていた二人の関係性に「絆の強さ」という客観的な光と、「〇〇のような関係」という心に響く名前（愛称）を与える。これにより、相談者は自分たちの関係性に確信と誇りを持つことができる。

### 第三幕：未来への道を照らす（P.9～P.13）
**目的**: 希望と具体的な行動の獲得

**物語の意図**: 物語の結び。過去と現在の分析を踏まえ、これから先の未来をどう歩んでいくかの「道しるべ」をそっと示す。最後は温かい祝福の言葉で締めくくり、レポートを読み終えた後も、希望の光が心に灯り続けるよう設計する。

## 4. グローバルデータ構造と前処理

### 4.1 入力データ一覧
| データ名 | 型 | 取得元 | 説明 |
|---------|-----|--------|------|
| rawMessages | Array<Object> | ユーザーアップロード | LINEトーク履歴ファイル |
| userProfile | Object | データベース | ユーザーのプロフィール情報 |
| systemParams | Object | システム | レポートID、生成日時 |
| existingAiInsights | Object | AI分析結果 | 事前に生成されたAI分析結果 |

### 4.2 前処理 (pre-processing.js)

**メッセージ正規化**: rawMessagesを処理し、cleanedMessagesを生成する。
- 対象: 最新200件の会話
- 各メッセージを最大200文字にトリミング
- タイムスタンプをISO 8601形式に統一
- 送信者名（ユーザー/お相手）を正規化

**analysisContextオブジェクト初期化**:
```javascript
const analysisContext = {
    // [INPUT]
    user: {
        name: userProfile.displayName,
        gender: userProfile.gender,
        birthDate: userProfile.birthDate,
    },
    partner: {
        name: userProfile.partnerName, // 相手の名前（あれば）
        gender: userProfile.partnerGender,
        birthDate: userProfile.partnerBirthDate,
    },
    situation: {
        loveSituation: userProfile.loveSituation, // 恋愛状況
        wantToKnow: userProfile.wantToKnow // 知りたいこと
    },
    messages: cleanedMessages,
    
    // [CALCULATED]
    statistics: {},
    scores: {},
    aiInsights: {},
    reportContent: {}
};
```

**恋愛状況（loveSituation）の値**:
- `beginning`: 恋の始まり・相手との距離感
- `relationship`: 交際中の相手とのこと
- `complicated`: 複雑な事情を抱える恋
- `ending`: 復縁・別れ・終わった恋

**知りたいこと（wantToKnow）の値**:
- `feelings`: 相手が今、どんな気持ちなのか
- `action`: 今、自分がどうしたらいいか
- `past`: 過去（出来事）の意味や理由
- `future`: これからどうなっていくのか

## 5. ページ別データ生成ロジック

### P.1-2：表紙・序章
**目的**: レポートの導入部。パーソナライズされたタイトルを生成する。

**注意**: レポートはユーザー向けであり、相手への呼びかけは含めない。

```javascript
reportContent.page1 = {
    userName: `${user.name} 様`,
    partnerName: partner.name ? `${partner.name} 様との絆` : 'お相手様との絆',
    reportId: systemParams.reportId,
    generatedDate: systemParams.generatedDate
};

reportContent.page2 = {
    title: "序章 ～月夜の導き～",
    body: `${user.name}様。\n\n月詠（つくよみ）と申します。...` // ユーザーのみへの呼びかけ
};
```

### P.3：二人の言葉の満ち欠け (曜日別グラフ)
**目的**: 会話量の曜日別傾向を可視化する。

**統計処理** (statistics.js):
```javascript
// 曜日別の平均メッセージ数を計算
const weekDayValues = [/* 日〜土の平均値 */];
analysisContext.statistics.dailyMessageCounts = dailyCounts;
analysisContext.statistics.peakDate = peakDate;
```

**AIコメント生成** (ai-generator.js):
```javascript
// 月詠としてのコメント生成（200字）
const prompt = {
    role: "月詠",
    data: {
        weekPattern: weekDayValues,
        peakDay: "金曜日",
        userName: user.name,
        loveSituation: situation.loveSituation, // 恋愛状況
        wantToKnow: situation.wantToKnow // 知りたいこと
    },
    task: "曜日別の会話パターンについて、恋愛状況と知りたいことを考慮した月詠のコメントを200字で生成"
};
// 例（beginning + feelings）: "金曜の夜、まだ始まったばかりの関係性の中で、相手の真の気持ちを知りたいあなた。月は告げています、この時間帯の活発な会話こそが..."
// 例（relationship + action）: "交際を深めているお二人。金曜日の会話の輝きは、今後の行動の指針となるでしょう。月が示す道は..."
```

### P.4：言葉がもっとも輝く時間 (時間帯グラフ)
**目的**: 最もコミュニケーションが活発な時間帯を特定する。

**統計処理** (statistics.js):
```javascript
analysisContext.statistics.hourlyMessageCounts = hourlyCounts;
analysisContext.statistics.peakHour = 21;
analysisContext.statistics.peakHourRatio = 25;
```

**AIコメント生成**:
```javascript
// 時間帯の特徴を月の運行と関連付けてコメント
const prompt = {
    data: {
        peakHour: 21,
        peakHourRatio: 25,
        hourPattern: hourlyData,
        loveSituation: situation.loveSituation,
        wantToKnow: situation.wantToKnow
    },
    task: "時間帯パターンについて、恋愛状況と知りたいことを考慮した月詠のコメントを200字で生成"
};
```

### P.5：心に灯った感情の星々 (会話の質)
**目的**: 会話の質を定量的・定性的に評価する。

**統計処理** (statistics.js):
```javascript
// 追加統計情報
analysisContext.statistics.positivityRate = 85;
analysisContext.statistics.totalEmojis = 342;
analysisContext.statistics.questionRatio = "52:48";
analysisContext.statistics.responseTimeMedian = 15; // 分
analysisContext.statistics.userAvgMessageLength = 45;
analysisContext.statistics.partnerAvgMessageLength = 38;
```

**AIコメント生成**:
```javascript
// 会話の質について月詠としてのコメント
const prompt = {
    data: {
        positivityRate: 85,
        emojiCount: 342,
        responseTime: 15,
        messageLengthBalance: [45, 38],
        loveSituation: situation.loveSituation,
        wantToKnow: situation.wantToKnow
    },
    task: "会話の質について、恋愛状況と知りたいことを踏まえた月詠のコメントを200字で生成"
};
// 例（ending + feelings）: "終わりを迎えた関係の中で、相手の真の気持ちを知りたいあなた。この高いポジティブ率は、月が告げています..."
```

### P.6-7：絆の強さ・関係性の愛称 (総合診断)
**目的**: 関係性をスコアと詩的な名前で定義する。

**スコア算出** (scoring.js):
```javascript
// 重み付けスコア計算
analysisContext.scores.overallScore = 92;
```

**AI生成** (既存AIInsights活用 + 追加コメント):
```javascript
// 関係性タイプは既存のAIInsightsから取得
relationshipType = existingAiInsights.relationshipStage >= 8 ? 
    "月と太陽のように輝く二人" : "静かに寄り添う二つの星";

// 追加で月詠コメントを生成（200字）
const prompt = {
    data: {
        score: 92,
        relationshipType: relationshipType,
        userName: user.name,
        loveSituation: situation.loveSituation,
        wantToKnow: situation.wantToKnow
    },
    task: "総合診断について、恋愛状況と知りたいことを考慮した月詠のコメントを200字で生成"
};
// 例（complicated + past）: "複雑な事情を抱える恋の中で、過去の出来事の意味を知りたいあなた。月は、すべての出来事には意味があると..."
```

### P.8：絆をかたちづくる五つの光 (レーダーチャート)
**目的**: 関係性の強みと改善点を5つの側面から分析。

**5つの柱**:
1. 心の対話
2. 価値観の一致
3. 感情の共鳴
4. 生活の調和
5. 未来への視線

**AIコメント生成**:
```javascript
// 最強と最弱の柱についてコメント
const prompt = {
    data: {
        strongestPillar: { name: "心の対話", score: 98 },
        weakestPillar: { name: "生活の調和", score: 75 },
        allScores: fivePillars,
        loveSituation: situation.loveSituation,
        wantToKnow: situation.wantToKnow
    },
    task: "5つの柱について、恋愛状況と知りたいことを考慮した月詠のコメントを200字で生成"
};
// 例（beginning + action）: "恋の始まりにあるあなたが、今どうすべきかを知りたいのは当然のこと。心の対話が最も強い光を放つ今、月は..."
```

### P.9-11：月からのささやき (アクションプラン)
**目的**: 具体的で実践的なアドバイスを3つ生成。

**AI生成** (既存のsuggestedActionsを月詠風に変換):
```javascript
// 既存のアドバイスを月詠の言葉に変換
actionPlans = existingAiInsights.suggestedActions.map(action => ({
    title: `もし、${action.timing}行動するなら...`,
    advice: convertToTsukuyomiStyle(action.action), // 月詠風に変換
    icon: getIconBySuccessRate(action.successRate)
}));
```

### P.12：未来のさざ波 (未来予測)
**目的**: 3ヶ月後の可能性を示唆。

**AI生成**:
```javascript
const prompt = {
    data: {
        overallScore: 92,
        recentTrend: "上昇",
        fivePillars: scores.fivePillars,
        loveSituation: situation.loveSituation,
        wantToKnow: situation.wantToKnow
    },
    task: "未来予測について、恋愛状況と知りたいことを考慮した月詠のコメントを200字で生成"
};
// 例（relationship + future）: "交際中のお二人が、これからどうなっていくのかを知りたいのは自然なこと。月は告げています、上昇する運気の中で..."
// 例（ending + future）: "終わりを迎えた関係の未来。月は、新たな始まりの種がすでに蒔かれていることを..."
```

### P.13：終章 ～月の祝福～
**静的テキスト**: 月詠からの最後の祝福メッセージ（ユーザー名を含むパーソナライズ）

## 6. PDF生成仕様

### 6.1 レイアウト仕様
- **ページサイズ**: A4固定（794px × 1123px @96dpi）
- **フォント**: 固定サイズ（14-72px）、相対値不使用
- **余白**: 上下左右 50px
- **グラフサイズ**:
  - 棒グラフ・折れ線: 600px × 350px
  - レーダーチャート: 450px × 450px

### 6.2 生成方法
- **HTML生成**: analysisContextのデータをテンプレートに流し込み
- **PDF変換**: html2canvas（scale: 3）+ jsPDFで高解像度PDF生成
- **モバイル対応**: viewport設定でスマートフォン表示最適化

## 7. 実装ファイル構成

```
core/premium/v2/
├── pre-processing.js     # 前処理
├── statistics.js          # 統計分析
├── scoring.js            # スコア計算
├── ai-generator.js       # AI生成（月詠コメント含む）
├── report-generator-v2.js # メイン制御
└── pdf-generator-v2.js   # PDF生成
```

## 8. AI利用方針

### 8.1 コスト最適化
- 初回分析時（FortuneEngine）でOpenAI APIを使用
- V2レポート生成時は既存結果（existingAiInsights）を再利用
- 追加の月詠コメントのみ新規生成（必要に応じて）

### 8.2 フォールバック
- AI利用不可時はスコアベースのデフォルトコメントを使用
- 各ページに固定の代替テキストを用意

## 9. 品質保証

### 9.1 文章の一貫性
- 全ての文章は月詠キャラクターの口調を維持
- ユーザー視点で統一（相手への直接呼びかけは避ける）

### 9.2 データ検証
- 統計値の妥当性チェック（0除算回避など）
- グラフデータの正規化と上限設定

### 9.3 エラーハンドリング
- 各処理段階でtry-catchによるエラー捕捉
- エラー時は部分的なデフォルト値で継続

## 10. 今後の拡張予定
- 会話の具体例引用機能
- 季節や記念日を考慮したコメント生成
- 複数言語対応