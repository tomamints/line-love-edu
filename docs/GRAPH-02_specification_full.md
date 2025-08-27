# おつきさま診断 3ヶ月運勢グラフ仕様書

## 概要
直近3ヶ月の運勢を視覚的に表示するグラフシステムの仕様書。64パターンすべてに対応。

---

## 📊 グラフ基本仕様

### グラフ配置
- **位置**: 「直近3ヶ月 あなたの運命」バナーの直下に配置
- **HTML構造**: 
```html
<h2 class="banner-title">直近3ヶ月 あなたの運命</h2>
<!-- グラフコンテナをここに配置 -->
<div class="fortune-graph-container">
  <canvas id="fortuneGraph"></canvas>
  <div class="graph-legend"></div>
</div>
```

### 表示期間
- **X軸**: 診断日から3ヶ月間（90日間）
- **単位**: 週単位（12週間）
- **ラベル**: 1ヶ月目、2ヶ月目、3ヶ月目（または週番号: 第1週〜第12週）
- **開始点**: 診断日（0日目）

### 運勢レベル（Y軸）
```
レベル5: 絶好調 (100%)
レベル4: 好調 (80%)
レベル3: 普通 (60%)
レベル2: やや低調 (40%)
レベル1: 低調 (20%)
```

### グラフタイプ
- **単一オーバーレイグラフ**: 5つの運勢カテゴリーを1つのグラフに重ねて表示
  - 全体運
  - 恋愛運
  - 人間関係運
  - 仕事運
  - 金運
- **表示形式**: マルチライン（複数線）チャート
- **各線**: 異なる色と太さで区別

---

## 🌙 64パターン運勢データ構造

### データフォーマット
```json
{
  "pattern_id": "新月×新月",
  "pattern_number": 1,
  "fortune_graph": {
    "overall": {
      "month1": {
        "week1": 4, // 好調
        "week2": 5, // 絶好調
        "week3": 5, // 絶好調
        "week4": 4  // 好調
      },
      "month2": {
        "week1": 3, // 普通
        "week2": 4, // 好調
        "week3": 5, // 絶好調
        "week4": 5  // 絶好調
      },
      "month3": {
        "week1": 5, // 絶好調
        "week2": 4, // 好調
        "week3": 3, // 普通
        "week4": 4  // 好調
      }
    },
    "love": { /* 同様の構造 */ },
    "relationship": { /* 同様の構造 */ },
    "career": { /* 同様の構造 */ },
    "money": { /* 同様の構造 */ }
  },
  "key_dates": {
    "peak_dates": ["診断から2週目", "診断から6週目", "診断から9週目"],
    "caution_dates": ["診断から5週目", "診断から11週目"]
  }
}
```

---

## 📈 パターン別グラフ特性

### パターン1：新月×新月
```javascript
{
  "特徴": "急上昇型・変動大",
  "全体運": [4,5,5,4, 3,4,5,5, 5,4,3,4], // 週ごとのレベル
  "恋愛運": [5,5,4,3, 4,5,5,4, 3,4,5,5],
  "人間関係": [4,4,5,5, 4,3,4,5, 5,4,4,3],
  "仕事運": [5,5,5,4, 3,3,4,5, 5,5,4,4],
  "金運": [3,4,5,5, 4,3,3,4, 5,5,4,3]
}
```

### パターン2：新月×三日月
```javascript
{
  "特徴": "安定上昇型",
  "全体運": [3,4,4,5, 5,5,4,4, 4,5,5,4],
  "恋愛運": [3,3,4,4, 5,5,5,4, 4,4,5,5],
  "人間関係": [4,4,4,5, 5,5,5,4, 4,5,5,5],
  "仕事運": [3,4,4,4, 5,5,5,5, 4,4,5,5],
  "金運": [3,3,4,4, 4,5,5,4, 4,4,5,4]
}
```

### パターン3：新月×上弦
```javascript
{
  "特徴": "即効型・前半ピーク",
  "全体運": [5,5,5,4, 4,4,5,5, 4,3,3,4],
  "恋愛運": [5,5,4,4, 3,4,5,4, 4,3,4,4],
  "人間関係": [4,5,5,5, 4,4,4,5, 4,4,3,3],
  "仕事運": [5,5,5,5, 4,4,5,5, 5,4,4,3],
  "金運": [4,5,5,4, 4,3,4,5, 4,4,3,3]
}
```

### パターン4：新月×十三夜
```javascript
{
  "特徴": "成熟型・後半上昇",
  "全体運": [3,3,4,4, 4,5,5,5, 5,5,5,4],
  "恋愛運": [3,4,4,4, 5,5,5,5, 5,5,4,4],
  "人間関係": [3,3,4,5, 5,5,5,5, 5,5,5,4],
  "仕事運": [3,3,3,4, 4,5,5,5, 5,5,5,5],
  "金運": [3,3,4,4, 4,4,5,5, 5,5,4,4]
}
```

### パターン5：新月×満月
```javascript
{
  "特徴": "波動型・高低差大",
  "全体運": [5,4,3,5, 4,5,3,5, 4,5,3,4],
  "恋愛運": [5,5,3,4, 5,5,3,4, 5,5,3,3],
  "人間関係": [4,5,4,3, 5,4,5,3, 5,4,5,3],
  "仕事運": [5,4,4,5, 3,5,4,5, 3,5,4,4],
  "金運": [4,3,5,4, 3,5,3,5, 4,3,5,4]
}
```

### パターン6：新月×十六夜
```javascript
{
  "特徴": "安定型・中盤ピーク",
  "全体運": [3,4,4,4, 5,5,5,4, 4,4,4,3],
  "恋愛運": [3,3,4,5, 5,5,5,4, 4,3,3,3],
  "人間関係": [4,4,4,4, 5,5,5,5, 4,4,4,4],
  "仕事運": [3,4,4,5, 5,5,5,5, 4,4,3,3],
  "金運": [3,3,4,4, 5,5,4,4, 4,3,3,3]
}
```

### パターン7：新月×下弦
```javascript
{
  "特徴": "効率型・選択的上昇",
  "全体運": [4,3,5,3, 4,3,5,4, 3,5,4,4],
  "恋愛運": [3,3,4,3, 3,4,5,4, 4,5,4,3],
  "人間関係": [4,3,4,4, 3,4,5,5, 4,4,4,3],
  "仕事運": [5,3,5,3, 5,3,5,4, 4,5,5,4],
  "金運": [3,4,3,4, 3,5,3,5, 4,4,5,3]
}
```

### パターン8：新月×暁
```javascript
{
  "特徴": "神秘型・突発的上昇",
  "全体運": [3,3,5,3, 3,5,3,3, 5,3,3,5],
  "恋愛運": [3,4,5,3, 4,5,3,4, 5,3,4,5],
  "人間関係": [3,3,4,4, 3,5,4,3, 5,4,3,4],
  "仕事運": [3,3,5,3, 3,5,3,3, 5,3,3,5],
  "金運": [3,3,4,3, 4,5,3,4, 5,3,4,4]
}
```

---

## 🌈 三日月シリーズ（パターン9-16）

### パターン9：三日月×新月
```javascript
{
  "特徴": "優しい始動型",
  "全体運": [3,4,4,5, 4,4,5,5, 4,5,5,4],
  "恋愛運": [4,4,5,5, 5,4,4,5, 5,5,4,4],
  "人間関係": [4,5,5,5, 5,5,4,4, 5,5,5,4],
  "仕事運": [3,3,4,4, 4,5,5,5, 4,4,5,4],
  "金運": [3,4,4,4, 4,4,5,4, 4,5,4,4]
}
```

### パターン10：三日月×三日月
```javascript
{
  "特徴": "超安定型",
  "全体運": [4,4,4,4, 4,5,5,5, 5,5,4,4],
  "恋愛運": [4,4,5,5, 5,5,5,5, 4,4,4,4],
  "人間関係": [5,5,5,5, 5,5,5,5, 5,5,5,4],
  "仕事運": [4,4,4,4, 5,5,5,4, 4,4,4,4],
  "金運": [4,4,4,4, 4,5,5,4, 4,4,4,4]
}
```

### パターン11-16も同様のフォーマットで定義...

---

## 📊 視覚表現仕様

### オーバーレイグラフの色とスタイル
```css
/* 運勢カテゴリー別ライン色 */
.fortune-line-colors {
  --全体運: #ffd700;     /* 金色 - メインとなる線 */
  --恋愛運: #ff69b4;     /* ホットピンク - 情熱的な愛 */
  --人間関係運: #32cd32; /* ライムグリーン - 成長と調和 */
  --仕事運: #4169e1;     /* ロイヤルブルー - 信頼と専門性 */
  --金運: #ff8c00;       /* ダークオレンジ - 富と豊かさ */
}

/* ライン仕様 */
.fortune-lines {
  --line-width-main: 4px;    /* 全体運（太線） */
  --line-width-sub: 3px;     /* その他の運勢 */
  --line-style: solid;       /* すべて実線 */
  --point-radius: 6px;       /* データポイントの円サイズ */
  --point-hover-radius: 8px; /* ホバー時のサイズ */
}

/* グラフエリア背景 */
.graph-background {
  --grid-color: rgba(255, 255, 255, 0.1);
  --background: linear-gradient(180deg, #1a1a2e 0%, #16213e 100%);
}

/* レベル別背景色（Y軸目盛り用） */
.level-backgrounds {
  --絶好調: rgba(255, 215, 0, 0.1);   /* 薄い金色 */
  --好調: rgba(135, 206, 235, 0.1);   /* 薄い空色 */
  --普通: rgba(152, 251, 152, 0.1);   /* 薄い緑 */
  --やや低調: rgba(221, 160, 221, 0.1); /* 薄い紫 */
  --低調: rgba(119, 136, 153, 0.1);   /* 薄いグレー */
}
```

### 凡例（レジェンド）仕様
```html
<div class="graph-legend">
  <div class="legend-title">運勢の種類</div>
  <div class="legend-items">
    <div class="legend-item" data-category="overall">
      <span class="legend-color" style="background: #ffd700;"></span>
      <span class="legend-label">全体運</span>
    </div>
    <div class="legend-item" data-category="love">
      <span class="legend-color" style="background: #ff69b4;"></span>
      <span class="legend-label">恋愛運</span>
    </div>
    <div class="legend-item" data-category="relationship">
      <span class="legend-color" style="background: #32cd32;"></span>
      <span class="legend-label">人間関係運</span>
    </div>
    <div class="legend-item" data-category="career">
      <span class="legend-color" style="background: #4169e1;"></span>
      <span class="legend-label">仕事運</span>
    </div>
    <div class="legend-item" data-category="money">
      <span class="legend-color" style="background: #ff8c00;"></span>
      <span class="legend-label">金運</span>
    </div>
  </div>
</div>
```

### インタラクティブ機能
- **ライン強調**: 凡例項目にホバーで該当ラインを太く表示、他を薄く
- **ライン表示/非表示**: 凡例項目クリックで該当ラインの表示切り替え
- **ポイントホバー**: データポイントにマウスオーバーでツールチップ表示
  ```
  ツールチップ例：
  「第3週目
  全体運: 好調 (レベル4)
  診断から21日目」
  ```

### アニメーション仕様
- **描画アニメーション**: 左から右へ順次描画（2秒）
- **ライン強調アニメーション**: 0.3秒のフェードイン/アウト
- **ポイントホバー**: 詳細情報をツールチップ表示
- **トランジション**: 0.3秒のイージング

---

## 🎯 重要ポイント表示

### ピークポイント（絶好調）
- 星マーク（⭐）で表示
- 具体的なアドバイステキスト表示
- 例：「2週目は恋愛運最高潮！告白のチャンス」

### 注意ポイント（低調）
- 注意マーク（⚠️）で表示
- 対策アドバイステキスト表示
- 例：「5週目は金運注意。大きな買い物は避けて」

---

## 📱 レスポンシブ対応

### PC版（768px以上）
- **グラフエリア**: 横幅800px、高さ400px
- **凡例**: グラフ下に横並び配置
- **表示**: 5つのカテゴリーを同時にオーバーレイ表示
- **インタラクション**: ホバーで各ライン強調

### タブレット版（481px〜767px）
- **グラフエリア**: 横幅100%（最大700px）、高さ350px
- **凡例**: グラフ下に2行で配置
- **表示**: 5つのカテゴリーを同時表示（線幅を若干細く）

### スマホ版（480px以下）
- **グラフエリア**: 横幅100%、高さ250px
- **凡例**: グラフ下に縦並び配置
- **表示**: デフォルトは全体運のみ、凡例タップで他の運勢を表示/非表示
- **タッチ操作**: タップでポイント詳細表示

---

## 🔄 実装用データ生成ルール

### 月相組み合わせによる基本パターン

#### 上昇傾向の組み合わせ
- 新月×上弦：即効型
- 三日月×十三夜：安定上昇型
- 上弦×満月：爆発型

#### 下降傾向の組み合わせ
- 満月×下弦：徐々に下降型
- 十六夜×暁：緩やか下降型

#### 波動型の組み合わせ
- 新月×満月：激しい波動
- 上弦×下弦：規則的波動
- 三日月×暁：不規則波動

---

## 💾 全64パターンデータ

残りのパターン（17-64）も上記と同じフォーマットで定義。
各パターンは月相の特性を反映した独自の波形を持つ。

### データ生成アルゴリズム
```javascript
function generateFortuneGraph(moonPhase, hiddenMoonPhase) {
  const basePattern = getBasePattern(moonPhase);
  const modifier = getModifier(hiddenMoonPhase);
  const combined = combinePatterns(basePattern, modifier);
  return normalizeValues(combined, 1, 5);
}
```

## 🔧 オーバーレイグラフ実装仕様

### Chart.js設定例
```javascript
const chartConfig = {
  type: 'line',
  data: {
    labels: ['第1週', '第2週', '第3週', '第4週', '第5週', '第6週', '第7週', '第8週', '第9週', '第10週', '第11週', '第12週'],
    datasets: [
      {
        label: '全体運',
        data: fortuneData.overall,
        borderColor: '#ffd700',
        backgroundColor: 'rgba(255, 215, 0, 0.1)',
        borderWidth: 4,
        pointRadius: 6,
        pointBackgroundColor: '#ffd700',
        tension: 0.4
      },
      {
        label: '恋愛運',
        data: fortuneData.love,
        borderColor: '#ff69b4',
        backgroundColor: 'rgba(255, 105, 180, 0.1)',
        borderWidth: 3,
        pointRadius: 6,
        pointBackgroundColor: '#ff69b4',
        tension: 0.4
      },
      {
        label: '人間関係運',
        data: fortuneData.relationship,
        borderColor: '#32cd32',
        backgroundColor: 'rgba(50, 205, 50, 0.1)',
        borderWidth: 3,
        pointRadius: 6,
        pointBackgroundColor: '#32cd32',
        tension: 0.4
      },
      {
        label: '仕事運',
        data: fortuneData.career,
        borderColor: '#4169e1',
        backgroundColor: 'rgba(65, 105, 225, 0.1)',
        borderWidth: 3,
        pointRadius: 6,
        pointBackgroundColor: '#4169e1',
        tension: 0.4
      },
      {
        label: '金運',
        data: fortuneData.money,
        borderColor: '#ff8c00',
        backgroundColor: 'rgba(255, 140, 0, 0.1)',
        borderWidth: 3,
        pointRadius: 6,
        pointBackgroundColor: '#ff8c00',
        tension: 0.4
      }
    ]
  },
  options: {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false // カスタム凡例を使用
      },
      tooltip: {
        mode: 'nearest',
        intersect: false,
        callbacks: {
          title: function(context) {
            return `第${context[0].dataIndex + 1}週目`;
          },
          label: function(context) {
            const levels = ['低調', 'やや低調', '普通', '好調', '絶好調'];
            return `${context.dataset.label}: ${levels[context.raw - 1]} (レベル${context.raw})`;
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: false,
        min: 1,
        max: 5,
        ticks: {
          stepSize: 1,
          callback: function(value) {
            const levels = ['', '低調', 'やや低調', '普通', '好調', '絶好調'];
            return levels[value];
          },
          color: '#ffffff'
        },
        grid: {
          color: 'rgba(255, 255, 255, 0.1)'
        }
      },
      x: {
        ticks: {
          color: '#ffffff'
        },
        grid: {
          color: 'rgba(255, 255, 255, 0.1)'
        }
      }
    },
    onHover: (event, activeElements) => {
      // ライン強調機能の実装
      if (activeElements.length > 0) {
        const datasetIndex = activeElements[0].datasetIndex;
        highlightLine(datasetIndex);
      }
    }
  }
};
```

### カスタム凡例のJavaScript
```javascript
function createCustomLegend() {
  const legendContainer = document.querySelector('.graph-legend');
  const legendItems = legendContainer.querySelectorAll('.legend-item');
  
  legendItems.forEach((item, index) => {
    // ホバーでライン強調
    item.addEventListener('mouseenter', () => {
      highlightLine(index);
    });
    
    item.addEventListener('mouseleave', () => {
      resetHighlight();
    });
    
    // クリックで表示/非表示切り替え
    item.addEventListener('click', () => {
      toggleLine(index);
      item.classList.toggle('legend-disabled');
    });
  });
}

function highlightLine(datasetIndex) {
  const chart = Chart.getChart('fortuneGraph');
  chart.data.datasets.forEach((dataset, index) => {
    if (index === datasetIndex) {
      dataset.borderWidth = dataset.label === '全体運' ? 6 : 5;
      dataset.pointRadius = 8;
    } else {
      dataset.borderWidth = 1;
      dataset.pointRadius = 3;
      dataset.borderColor = dataset.borderColor.replace('1)', '0.3)');
    }
  });
  chart.update('none');
}

function resetHighlight() {
  const chart = Chart.getChart('fortuneGraph');
  chart.data.datasets.forEach((dataset, index) => {
    dataset.borderWidth = dataset.label === '全体運' ? 4 : 3;
    dataset.pointRadius = 6;
    // 元の色に戻す
    const colors = ['#ffd700', '#ff69b4', '#32cd32', '#4169e1', '#ff8c00'];
    dataset.borderColor = colors[index];
  });
  chart.update('none');
}
```

---

## 📋 実装チェックリスト

### データ準備
- [ ] 64パターン全てのデータ定義
- [ ] 5つの運勢カテゴリーのデータ構造統一
- [ ] データ検証テスト

### グラフ表示
- [ ] グラフ描画ライブラリの選定（Chart.js推奨）
- [ ] オーバーレイ（複数線）グラフの実装
- [ ] 「直近3ヶ月 あなたの運命」バナー直下への配置
- [ ] 5つの運勢別色分け実装（金・ピンク・緑・青・オレンジ）

### インタラクティブ機能
- [ ] カスタム凡例の実装
- [ ] 凡例ホバーでのライン強調機能
- [ ] 凡例クリックでの表示/非表示切り替え
- [ ] ツールチップ実装（週・レベル・日数表示）
- [ ] ライン強調アニメーション（0.3秒）

### デザイン・スタイル
- [ ] Y軸ラベル（絶好調〜低調）の実装
- [ ] X軸ラベル（週単位・月単位）の実装
- [ ] レスポンシブデザインの実装（PC・タブレット・スマホ）
- [ ] グラフ背景グラデーションの実装
- [ ] 描画アニメーション実装（2秒）

### 品質保証
- [ ] 全64パターンでのグラフ表示テスト
- [ ] 各デバイスでの表示確認
- [ ] インタラクティブ機能の動作確認
- [ ] パフォーマンステスト