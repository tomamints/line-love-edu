# おつきさま診断 3ヶ月運勢グラフ仕様書（シンプル版）

## 概要
直近3ヶ月の**総合運のみ**を美しくシンプルに表示するグラフシステムの仕様書。

---

## 📊 グラフ基本仕様

### グラフ配置
- **位置**: 「直近3ヶ月 あなたの運命」バナーの直下
- **HTML構造**: 
```html
<h2 class="banner-title">直近3ヶ月 あなたの運命</h2>
<div class="fortune-graph-container">
  <canvas id="fortuneGraph"></canvas>
</div>
```

### 表示内容
- **グラフ**: 総合運のみ（1本の美しいライン）
- **その他の運勢**: グラフ下部にテキストで要約表示

### 表示期間
- **X軸**: 診断日から3ヶ月間（12週間）
- **ラベル**: 1ヶ月目、2ヶ月目、3ヶ月目

### 運勢レベル（Y軸）
```
レベル5: 絶好調 ⭐⭐⭐⭐⭐
レベル4: 好調 ⭐⭐⭐⭐
レベル3: 普通 ⭐⭐⭐
レベル2: やや低調 ⭐⭐
レベル1: 低調 ⭐
```

---

## 🎨 ビジュアルデザイン

### グラフスタイル
```javascript
const chartConfig = {
  type: 'line',
  data: {
    labels: ['第1週', '第2週', '第3週', '第4週', '第5週', '第6週', 
             '第7週', '第8週', '第9週', '第10週', '第11週', '第12週'],
    datasets: [{
      label: '総合運',
      data: [4, 5, 5, 4, 3, 4, 5, 5, 5, 4, 3, 4], // 例：新月×新月
      borderColor: '#ffd700',
      backgroundColor: 'rgba(255, 215, 0, 0.1)',
      borderWidth: 4,
      tension: 0.4, // 滑らかな曲線
      pointRadius: 6,
      pointBackgroundColor: '#fff',
      pointBorderColor: '#ffd700',
      pointBorderWidth: 3,
      pointHoverRadius: 8
    }]
  },
  options: {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false // 凡例非表示（1本だけなので不要）
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: '#ffd700',
        bodyColor: '#fff',
        padding: 12,
        displayColors: false,
        callbacks: {
          label: function(context) {
            const levels = ['低調', 'やや低調', '普通', '好調', '絶好調'];
            const stars = ['⭐', '⭐⭐', '⭐⭐⭐', '⭐⭐⭐⭐', '⭐⭐⭐⭐⭐'];
            const value = context.parsed.y;
            return `${levels[value-1]} ${stars[value-1]}`;
          }
        }
      }
    },
    scales: {
      y: {
        min: 0,
        max: 6,
        ticks: {
          stepSize: 1,
          callback: function(value) {
            const levels = ['', '低調', 'やや低調', '普通', '好調', '絶好調', ''];
            return levels[value];
          }
        },
        grid: {
          color: 'rgba(255, 255, 255, 0.1)'
        }
      },
      x: {
        grid: {
          color: 'rgba(255, 255, 255, 0.05)'
        }
      }
    }
  }
};
```

### カラースキーム
- **背景**: ダークグラデーション (#1a1a2e → #0f1123)
- **グラフライン**: ゴールドグラデーション (#ffd700)
- **グリッド**: 半透明ホワイト (rgba(255,255,255,0.1))
- **ポイント**: 白背景＋ゴールド枠

### アニメーション
- **描画**: 左から右へ2秒で描画
- **ホバー**: ポイントが拡大、ツールチップ表示

---

## 📝 その他の運勢表示

### グラフ下部のテキスト要約
```html
<div class="fortune-summary">
  <div class="summary-grid">
    <div class="summary-item">
      <span class="category">恋愛運</span>
      <span class="trend">⬆️ 上昇傾向</span>
      <span class="peak">ピーク: 2ヶ月目</span>
    </div>
    <div class="summary-item">
      <span class="category">人間関係運</span>
      <span class="trend">➡️ 安定</span>
      <span class="peak">好調維持</span>
    </div>
    <div class="summary-item">
      <span class="category">仕事運</span>
      <span class="trend">⬆️ 急上昇</span>
      <span class="peak">ピーク: 3ヶ月目</span>
    </div>
    <div class="summary-item">
      <span class="category">金運</span>
      <span class="trend">〰️ 波あり</span>
      <span class="peak">注意: 2ヶ月目</span>
    </div>
  </div>
</div>
```

### スタイル
```css
.fortune-summary {
  margin-top: 30px;
  padding: 20px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 10px;
}

.summary-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 15px;
}

.summary-item {
  padding: 15px;
  background: rgba(255, 215, 0, 0.1);
  border-left: 3px solid #ffd700;
  border-radius: 5px;
}

.category {
  display: block;
  font-size: 14px;
  color: #ffd700;
  margin-bottom: 5px;
}

.trend {
  display: block;
  font-size: 16px;
  font-weight: bold;
  color: #fff;
  margin-bottom: 3px;
}

.peak {
  display: block;
  font-size: 12px;
  color: rgba(255, 255, 255, 0.7);
}
```

---

## 🎯 ポイント表示

### ピークポイント
- グラフ上の最高点に⭐マーク
- 「絶好調！」のラベル表示

### 注意ポイント  
- 低調な時期に⚠️マーク
- 対策アドバイスをツールチップで表示

---

## 📱 レスポンシブ対応

### PC版
- 横幅: 100%（最大800px）
- 高さ: 400px
- 完全なインタラクティブ機能

### スマホ版
- 横幅: 100%
- 高さ: 250px
- タッチ操作対応
- 要約テキストは縦並び

---

## 💾 データ構造（総合運のみ）

```javascript
{
  "pattern_id": "新月×新月",
  "overall_fortune": {
    "data": [4, 5, 5, 4, 3, 4, 5, 5, 5, 4, 3, 4], // 12週分
    "peak_weeks": [2, 7, 9],
    "caution_weeks": [5, 11],
    "trend": "波動型",
    "message": "変化の多い3ヶ月。ピークを活かして行動を。"
  },
  "other_fortunes": {
    "love": { "trend": "上昇", "peak_month": 2 },
    "relationship": { "trend": "安定", "peak_month": null },
    "career": { "trend": "急上昇", "peak_month": 3 },
    "money": { "trend": "波あり", "caution_month": 2 }
  }
}
```

---

## ✅ 実装チェックリスト

- [ ] Chart.jsの設定（総合運のみ）
- [ ] グラデーション背景の実装
- [ ] アニメーション実装
- [ ] ツールチップカスタマイズ
- [ ] テキスト要約セクション
- [ ] レスポンシブデザイン
- [ ] 64パターンのデータ準備（総合運のみ）