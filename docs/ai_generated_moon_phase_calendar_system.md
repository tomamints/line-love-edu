# 月齢カレンダー・今日の月相システム Documentation

## Overview
This documentation covers the static/non-personalized content for the Moon Phase Calendar system, including logic to calculate current moon phases and display today's moon status for all users.

## 1. Today's Moon Phase (今日の月齢/月相) System

### 1.1 Moon Phase Calculation Logic

```javascript
/**
 * 今日の月齢を計算する関数
 * @param {Date} date - 対象の日付
 * @returns {Object} 月齢情報
 */
function calculateCurrentMoonPhase(date = new Date()) {
  // 基準となる新月の日付 (2025年1月29日)
  const baseNewMoon = new Date(2025, 0, 29); // 2025/01/29
  const millisecondsPerDay = 24 * 60 * 60 * 1000;
  const lunarCycle = 29.53058868; // 朔望周期（日）
  
  // 基準日からの経過日数を計算
  const daysDifference = (date.getTime() - baseNewMoon.getTime()) / millisecondsPerDay;
  
  // 月齢を計算
  const moonAge = ((daysDifference % lunarCycle) + lunarCycle) % lunarCycle;
  
  return {
    moonAge: Math.round(moonAge * 10) / 10, // 小数点第1位まで
    phaseName: getMoonPhaseName(moonAge),
    phaseEmoji: getMoonPhaseEmoji(moonAge),
    illumination: calculateIllumination(moonAge),
    nextPhase: getNextPhaseInfo(moonAge)
  };
}

/**
 * 月齢から月相名を取得
 */
function getMoonPhaseName(moonAge) {
  if (moonAge >= 0 && moonAge < 1.8) return '新月';
  if (moonAge >= 1.8 && moonAge < 5.4) return '三日月';
  if (moonAge >= 5.4 && moonAge < 9) return '上弦の月';
  if (moonAge >= 9 && moonAge < 12.6) return '十三夜';
  if (moonAge >= 12.6 && moonAge < 16.2) return '満月';
  if (moonAge >= 16.2 && moonAge < 19.8) return '十六夜';
  if (moonAge >= 19.8 && moonAge < 23.4) return '下弦の月';
  if (moonAge >= 23.4 && moonAge < 27) return '暁';
  return '新月';
}

/**
 * 月相に対応する絵文字を取得
 */
function getMoonPhaseEmoji(moonAge) {
  const phaseEmojis = {
    '新月': '🌑',
    '三日月': '🌒',
    '上弦の月': '🌓',
    '十三夜': '🌔',
    '満月': '🌕',
    '十六夜': '🌖',
    '下弦の月': '🌗',
    '暁': '🌘'
  };
  return phaseEmojis[getMoonPhaseName(moonAge)] || '🌑';
}
```

### 1.2 Static Display Content

#### 今日の月相表示テンプレート
```
🌙 今日の月は{月相名}

月齢: {月齢}日
明度: {照度}%
{次の月相}まであと{日数}日

今日の月からのメッセージ:
{月相別メッセージ}
```

#### 月相別メッセージ（全8種類）

**新月のメッセージ:**
```
新しい始まりの時。今日あなたが抱く想いや願いを大切に育てましょう。
小さな種を蒔く気持ちで、何か新しいことにチャレンジしてみて。
```

**三日月のメッセージ:**
```
やさしさと思いやりの時。周りの人への感謝の気持ちを大切に。
今日は無理をせず、自分のペースで穏やかに過ごしましょう。
```

**上弦の月のメッセージ:**
```
行動力が高まる時。計画していたことを実行に移すチャンス。
一歩ずつ着実に前進することで、大きな成果につながります。
```

**十三夜のメッセージ:**
```
安定と調和の時。心を落ち着けて、今あるものに感謝を。
人間関係も円滑になりやすく、大切な人との時間を楽しみましょう。
```

**満月のメッセージ:**
```
エネルギーが最高潮の時。感情も豊かになり、創造力が発揮されます。
ただし感情的になりすぎないよう、深呼吸を忘れずに。
```

**十六夜のメッセージ:**
```
余裕と成熟の時。全体を見渡す冷静さが生まれます。
今日は大きな決断よりも、じっくりと考える時間を大切に。
```

**下弦の月のメッセージ:**
```
整理整頓の時。不要なものを手放し、本当に大切なものを見極めて。
心も軽やかになり、新しいスペースが生まれるでしょう。
```

**暁のメッセージ:**
```
内省と準備の時。静かに自分と向き合い、心の声に耳を傾けて。
新しいサイクルに向けて、ゆっくりと充電していきましょう。
```

## 2. 月齢カレンダー生成システム

### 2.1 2週間カレンダー生成ロジック

```javascript
/**
 * 今日から2週間の月齢カレンダーを生成
 */
function generateMoonCalendar(startDate = new Date(), days = 14) {
  const calendar = [];
  
  for (let i = 0; i < days; i++) {
    const currentDate = new Date(startDate);
    currentDate.setDate(startDate.getDate() + i);
    
    const moonInfo = calculateCurrentMoonPhase(currentDate);
    const dayOfWeek = ['日', '月', '火', '水', '木', '金', '土'][currentDate.getDay()];
    
    calendar.push({
      date: currentDate,
      dateString: `${currentDate.getMonth() + 1}/${currentDate.getDate()}（${dayOfWeek}）`,
      moonAge: moonInfo.moonAge,
      phaseName: moonInfo.phaseName,
      phaseEmoji: moonInfo.phaseEmoji,
      dailyAction: getDailyActionByPhase(moonInfo.phaseName),
      luckyTime: getLuckyTimeByPhase(moonInfo.phaseName),
      energyLevel: getEnergyLevelByPhase(moonInfo.phaseName)
    });
  }
  
  return calendar;
}

/**
 * 月相別の開運アクション
 */
function getDailyActionByPhase(phaseName) {
  const actions = {
    '新月': '新しい目標を立てる。企画書や計画を作成する。',
    '三日月': 'ゆっくりと過ごし、感謝の気持ちを伝える。',
    '上弦の月': '積極的に行動を起こす。営業活動や面接に最適。',
    '十三夜': 'チームワークを大切に。人との協力を心がける。',
    '満月': '成果を確認し、感情を表現する。お祝いをする。',
    '十六夜': '全体を振り返り、バランスを整える。',
    '下弦の月': '断捨離をする。不要なものを手放す。',
    '暁': '瞑想や内省の時間を作る。次の計画を静かに考える。'
  };
  return actions[phaseName] || '月の導きを感じて行動しましょう。';
}

/**
 * 月相別のラッキータイム
 */
function getLuckyTimeByPhase(phaseName) {
  const luckyTimes = {
    '新月': '朝6-8時',
    '三日月': '朝9-11時', 
    '上弦の月': '昼12-14時',
    '十三夜': '昼15-17時',
    '満月': '夜19-21時',
    '十六夜': '夜18-20時',
    '下弦の月': '昼13-15時',
    '暁': '夜22-24時'
  };
  return luckyTimes[phaseName] || '一日中';
}
```

### 2.2 特別な月の日付（2025年）

#### 重要な月相の日付
```javascript
const important2025MoonDates = {
  newMoons: [
    { date: '2025-01-29', specialNote: '水瓶座新月 - 革新と変化の始まり' },
    { date: '2025-02-28', specialNote: '魚座新月 - 直感と創造性が高まる' },
    { date: '2025-03-29', specialNote: '牡羊座新月 - 行動力と勇気の月' },
    { date: '2025-04-27', specialNote: '牡牛座新月 - 安定と物質的な豊かさ' },
    { date: '2025-05-27', specialNote: '双子座新月 - コミュニケーション運上昇' },
    { date: '2025-06-25', specialNote: '蟹座新月 - 家族愛と感情が深まる' },
    { date: '2025-07-24', specialNote: '獅子座新月 - 自己表現と創造の力' },
    { date: '2025-08-23', specialNote: '乙女座新月 - 整理整頓と健康管理' },
    { date: '2025-09-21', specialNote: '乙女座新月 - 実務能力が光る' },
    { date: '2025-10-21', specialNote: '天秤座新月 - 調和と美的感性' },
    { date: '2025-11-20', specialNote: '蠍座新月 - 深い絆と変容の力' },
    { date: '2025-12-19', specialNote: '射手座新月 - 冒険心と向上心' }
  ],
  
  fullMoons: [
    { date: '2025-01-13', specialNote: '蟹座満月 - 感情の解放と家族運' },
    { date: '2025-02-12', specialNote: '獅子座満月 - 自信と表現力アップ' },
    { date: '2025-03-14', specialNote: '乙女座満月 - 実務成果の確認' },
    { date: '2025-04-13', specialNote: '天秤座満月 - 人間関係の調和' },
    { date: '2025-05-12', specialNote: '蠍座満月 - 深い絆の確認' },
    { date: '2025-06-11', specialNote: '射手座満月 - 目標達成の時' },
    { date: '2025-07-10', specialNote: '山羊座満月 - キャリア運が頂点' },
    { date: '2025-08-09', specialNote: '水瓶座満月 - 友情と革新の成果' },
    { date: '2025-09-07', specialNote: '魚座満月 - 直感力と霊感が冴える' },
    { date: '2025-10-07', specialNote: '牡羊座満月 - 行動の成果が現れる' },
    { date: '2025-11-05', specialNote: '牡牛座満月 - 物質的豊かさの実感' },
    { date: '2025-12-04', specialNote: '双子座満月 - コミュニケーション成果' }
  ],
  
  specialEvents: [
    { date: '2025-03-20', event: '春分の日', note: '新しいサイクルの始まり' },
    { date: '2025-06-21', event: '夏至', note: '陽のエネルギー最大' },
    { date: '2025-09-23', event: '秋分の日', note: 'バランスと調和の時' },
    { date: '2025-12-22', event: '冬至', note: '内なる光を見つめる時' }
  ]
};
```

## 3. 月のリズムと行動指針

### 3.1 月相サイクル別の推奨行動

#### 新月期（月齢0-3.7日）
- **テーマ**: 始まり、種まき、新しいスタート
- **推奨行動**: 
  - 新プロジェクトの立ち上げ
  - 目標設定と計画作成
  - 新しい習慣の開始
  - 願い事や決意表明
- **避けるべき行動**:
  - 重要な終了や手放し
  - 過去への執着

#### 上弦期（月齢3.7-11.1日） 
- **テーマ**: 成長、行動、努力
- **推奨行動**:
  - 積極的な営業活動
  - スキルアップ学習
  - 人脈作りとネットワーキング
  - 体力づくり
- **避けるべき行動**:
  - 怠惰や先延ばし
  - 諦めることを考える

#### 満月期（月齢11.1-18.5日）
- **テーマ**: 完成、収穫、感情の解放
- **推奨行動**:
  - 成果の確認と祝福
  - 感謝の表現
  - 創造的活動
  - 重要な発表や告白
- **避けるべき行動**:
  - 感情的な判断
  - 衝動的な行動

#### 下弦期（月齢18.5-26日）
- **テーマ**: 整理、手放し、内省
- **推奨行動**:
  - 断捨離と整理整頓  
  - 振り返りと反省
  - 不要な関係の整理
  - 健康管理とデトックス
- **避けるべき行動**:
  - 新しいことの開始
  - 大きな投資や買い物

### 3.2 月の満ち欠けカレンダー表示フォーマット

```
🌙 {日付}（{曜日}） 月齢{月齢}日 {月相絵文字}
　今日の月：{月相名}
　開運アクション：{推奨行動}
　ラッキータイム：{時間帯}
　エネルギーレベル：{★の数}

　月からのひとこと：{日別メッセージ}
```

## 4. 実装における技術的考慮事項

### 4.1 データ更新頻度
- 月齢計算：リアルタイム計算
- カレンダー表示：日次更新（00:00に更新）
- メッセージ：月相変化時に更新

### 4.2 パフォーマンス最適化
- 月齢計算結果のキャッシュ（1日単位）
- 静的コンテンツの事前生成
- 画像リソースの最適化

### 4.3 ユーザビリティ
- 直感的な月相アイコン表示
- 色彩での視覚的区別（新月：黒、満月：黄色等）
- シンプルで分かりやすい説明文

---

このシステムにより、ユーザーは毎日変化する月の状態を把握し、月のリズムに合わせた生活を送ることができます。個人の生年月日に依存せず、すべてのユーザーが共通して利用できる情報として提供されます。