プレミアムレポート 実装仕様書 Ver.2.0
1. 概要
本仕様書は、「プレミアムレポート」を生成するための全工程を定義する。本ドキュメントに従い実装することで、AIや開発者は一貫性のある高品質なレポートを生成できる。

2. 月詠の物語構成（ストーリーテリング）
本レポートは、単なるデータ分析の羅列ではない。相談者がご自身の関係性を一つの美しい物語として体験し、未来への希望を見出すための**「三幕構成」**で設計されている。月詠としての文章は、すべてこの構成意図に基づいて生成される。

第一幕：過去の輝きを映し出す（P.2～P.5）
目的: 安心感と自己肯定感の醸成

物語の意図: まず、お二人が紡いできた日々の「美しい部分」に光を当てる。「こんなに素敵な時間を過ごしてきたんだ」というポジティブな再確認から物語を始めることで、相談者は安心してレポートを読み進めることができる。分析結果を一方的に提示するのではなく、共に過去の輝かしい記憶を辿るような体験を提供する。

第二幕：絆の核心に触れる（P.6～P.8）
目的: 深い自己理解と関係性の定義

物語の意図: 物語の中核。ここでは、漠然としていた二人の関係性に「絆の強さ」という客観的な光と、「〇〇のような関係」という心に響く名前（愛称）を与える。「なぜ私たちは惹かれ合うのか」という問いに対する、月詠からの答えが示される、物語のクライマックスである。これにより、相談者は自分たちの関係性に確信と誇りを持つことができる。

第三幕：未来への道を照らす（P.9～P.13）
目的: 希望と具体的な行動の獲得

物語の意図: 物語の結び。過去と現在の分析を踏まえ、これから先の未来をどう歩んでいくかの「道しるべ」をそっと示す。弱点を指摘するのではなく、「この輝きをさらに増すために」という視点で、具体的で優しいアクションを提案。最後は温かい祝福の言葉で締めくくり、レポートを読み終えた後も、希望の光が心に灯り続けるよう設計する。

3. グローバルデータ構造と前処理
レポート生成前に、以下の前処理を行い、analysisContextオブジェクトを構築する。このオブジェクトは、後続の全プロセスで参照・更新される。

3.1. 入力データ一覧
データ名

型

取得元

説明

rawMessages

Array<Object>

ユーザーアップロード

LINEトーク履歴ファイル

userProfile

Object

データベース

ユーザーのプロフィール情報

systemParams

Object

システム

レポートID、生成日時

3.2. 前処理 (pre-processing.js)
メッセージ正規化: rawMessagesを処理し、cleanedMessagesを生成する。

対象: 最新200件の会話。

処理内容:

各メッセージを最大200文字にトリミング。

タイムスタンプをISO 8601形式に統一。

送信者名（ユーザー/お相手）を正規化。

スタンプ、画像、動画等のテキスト以外のメッセージをフィルタリング。

analysisContextオブジェクト初期化:

const analysisContext = {
    // [INPUT]
    user: {
        name: userProfile.displayName, // "田中 圭一"
        gender: userProfile.gender, // "male"
        birthDate: userProfile.birthDate, // "1998-04-30"
    },
    partner: {
        gender: userProfile.partnerGender, // "female"
        birthDate: userProfile.partnerBirthDate, // "1995-08-15"
    },
    messages: cleanedMessages, // 正規化済みメッセージ配列

    // [CALCULATED] - 後続プロセスで随時格納
    statistics: {},
    scores: {},
    aiInsights: {},
    reportContent: {}
};

4. ページ別データ生成ロジック
P.1-2：表紙・序章
目的: レポートの導入部。パーソナライズされたタイトルを生成する。

ロジック:

analysisContext.user.name を取得する。

固定テンプレートにユーザー名を挿入する。相手の名前は「お相手様」で固定。

// P.1
reportContent.page1 = {
    userName: analysisContext.user.name, // "田中 圭一 様"
    partnerName: "お相手様との絆へ", // 固定
    reportId: systemParams.reportId,
    generatedDate: systemParams.generatedDate
};
// P.2
reportContent.page2 = { // 静的テキスト
    title: "序章 ～月夜の導き～",
    body: "田中様、そしてお相手様。..."
};

P.3：二人の言葉の満ち欠け (時系列グラフ)
目的: 会話量の時間的推移を可視化する。

ロジック (statistics.js):

analysisContext.messages を日毎に集計。

dailyCounts 配列を生成: [{ date: '2025-07-15', count: 58 }, ...]

dailyCounts から count が最大の日付 (peakDate) を特定。

analysisContext.statistics.dailyMessageCounts = dailyCounts;

analysisContext.statistics.peakDate = peakDate;

AIプロンプト (ai-generator.js):

役割: 月詠

タスク: analysisContext.statistics.peakDate の日付に基づき、その日の会話の活発さを詩的に表現するコメントを1文生成する。

入力: { "peakDate": "2025-07-15" }

出力: analysisContext.aiInsights.peakDateComment に格納。

P.4：言葉がもっとも輝く時間 (時間帯グラフ)
目的: 最もコミュニケーションが活発な時間帯を特定する。

ロジック (statistics.js):

analysisContext.messages を時間帯別 (0-23時) に集計。

hourlyCounts 配列を生成: [{ hour: 21, count: 150 }, ...]

hourlyCounts から最も count が多い時間帯 (peakHour) とその割合 (peakHourRatio) を計算。

analysisContext.statistics.peakHour = 21;

analysisContext.statistics.peakHourRatio = 25;

P.5：心に灯った感情の星々 (会話の質)
目的: 会話の質を定量的に評価する。

ロジック (statistics.js):

ポジティブ率: 全メッセージを外部の感情分析API (e.g., Google Cloud Natural Language API) に送信。score > 0.2 をポジティブと判定し、その割合を計算。

絵文字数: emoji-regex等のライブラリを使用し、全メッセージの絵文字総数をカウント。

質問比率: 「?」または「？」で終わるメッセージを質問と定義。ユーザー別 (user/partner) にカウントし、比率を計算。

上記結果を analysisContext.statistics に格納。

P.6-7：絆の強さ・関係性の和音 (総合診断)
目的: 関係性をスコアとタイプ名で定義する。

ロジック (scoring.js):

スコア算出: 以下の指標を正規化 (0-100) し、重み付けして総合スコアを計算。

返信速度の中央値 (短いほど高得点): weight: 0.3

ポジティブ率: weight: 0.3

会話の双方向性 (質問比率が1:1に近いほど高得点): weight: 0.2

メッセージ長の平均値: weight: 0.1

月相の相性スコア (独自ロジックで算出): weight: 0.1

analysisContext.scores.overallScore = 92;

AIプロンプト (ai-generator.js):

役割: 月詠

タスク: 以下の分析データを元に、二人の関係性を表す詩的な「愛称」と、その理由を生成する。

入力 (JSON):

{
  "overallScore": 92,
  "positivityRate": 91,
  "avgResponseTimeMinutes": 15,
  "userMoonPhase": "満月",
  "partnerMoonPhase": "三日月",
  "communicationBalance": "52:48"
}

期待する出力 (JSON):

{
  "relationshipTitle": "互いを静かに照らす、月と湖",
  "relationshipReason": "月が湖を照らす時、湖もまた、月の光を映して輝きを返します。片方が主役になるのではなく、互いの存在によって..."
}

格納先: analysisContext.aiInsights.relationshipType

P.8：絆をかたちづくる五つの光 (レーダーチャート)
目的: 関係性の強みを5つの側面から詳細に分析・スコア化する。

ロジック & AIプロンプト:

心の対話 (スコア): [LOGIC] メッセージ長の平均値と質問比率のバランスを正規化・合算して算出。

価値観の一致 (スコア): [AI-PROMPT]

タスク: 会話全体から、共通の興味関心・価値観を示すキーワード（例：旅行, 映画, 食事, 将来, 仕事）を抽出し、その会話の深さと頻度から一致度を0-100点で評価せよ。

入力: { "messages": analysisContext.messages }

出力: { "score": 85, "topics": ["旅行", "食事", "猫"] }

感情の共鳴 (スコア): [LOGIC] ポジティブ率と絵文字使用頻度を正規化・合算して算出。

生活の調和 (スコア): [LOGIC] P.4の時間帯別アクティビティデータを使用し、二人の活動時間の相関性を計算（ピアソンの相関係数など）。

未来への視線 (スコア): [AI-PROMPT]

タスク: 会話全体から、未来に関するキーワード（例：来年, 計画, 夢, 住む, 結婚）の出現頻度と文脈の具体性に基づき、未来の共有度を0-100点で評価せよ。

出力: { "score": 78, "keywords": ["来年の夏休み", "一緒に住んだら"] }

上記5つのスコアを analysisContext.scores.fivePillars に格納。

P.9-11：月からのささやき (アクションプラン)
目的: 分析結果に基づき、具体的で実践的なアドバイスを生成する。

AIプロンプト (ai-generator.js):

役割: 月詠

タスク: 以下の分析結果に基づき、関係性をより良くするための具体的なアクションを3つ提案せよ。提案は「もし、〇〇なら…」というタイトルと、「月のささやき」という具体的なアドバイス（セリフ例を含む）の形式で出力すること。

入力 (JSON):

{
  "strongestPillar": { "name": "心の対話", "score": 98 },
  "weakestPillar": { "name": "生活の調和", "score": 75 },
  "relationshipType": "互いを静かに照らす、月と湖"
}

期待する出力 (JSON Array):

[
  {
    "title": "もし、言葉が雲に隠れてしまったなら…",
    "advice": "昔、二人で笑い合った時の話を思い出してみてください。...",
    "icon": "cloudy_moon"
  },
  ...
]

格納先: analysisContext.aiInsights.actionPlans

P.12：未来のさざ波 (未来予測)
目的: 未来の可能性を示唆し、関係維持への意識を高める。

AIプロンプト (ai-generator.js):

役割: 月詠

タスク: 以下のデータを元に、今後3ヶ月の「より深い対話」「新しい体験」「小さな試練」の3つの事象が起こる兆し（可能性）を【高・中・低】で評価せよ。

入力 (JSON):

{
  "overallScore": 92,
  "fivePillars": { ... }, // P.8のスコア
  "recentTrend": "上昇" // P.3のグラフの直近1ヶ月の傾きから算出
}

期待する出力 (JSON):

{
  "deepTalk": "高",
  "newExperience": "中",
  "challenge": "低"
}

格納先: analysisContext.aiInsights.futureSigns

5. レポート生成 (pdf-generator.js)
最終的に、analysisContextオブジェクトに格納された全データ (reportContent, statistics, scores, aiInsights) をHTMLテンプレートに流し込み、Puppeteer等を用いてPDFを生成する。
