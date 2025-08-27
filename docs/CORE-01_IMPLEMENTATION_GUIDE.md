# 🛠️ おつきさま診断 実装ガイド

## 📌 このガイドの目的
エンジニアが「おつきさま診断」を実装・修正する際の完全なリファレンスガイド

---

## 🏗️ アーキテクチャ概要

### 技術スタック
- **フロントエンド**: Vanilla JavaScript + HTML + CSS
- **グラフ**: Chart.js
- **アニメーション**: CSS Animation + JavaScript
- **レスポンシブ**: CSS Media Queries

### ファイル構造
```
/public/
  └── lp-otsukisama.html    # メインファイル（HTML/CSS/JS統合）
  
/docs/
  ├── OTSUKISAMA_FINAL_SPEC_2025.md        # 最終仕様書
  ├── OTSUKISAMA_IMPLEMENTATION_GUIDE.md   # 本ガイド
  ├── otsukisama_complete_all_64_patterns.md  # パターン1-8
  ├── otsukisama_patterns_9-20.md          # パターン9-20
  ├── otsukisama_patterns_21-36.md         # パターン21-36
  ├── otsukisama_patterns_37-48.md         # パターン37-48
  ├── otsukisama_patterns_49-64.md         # パターン49-64
  └── moon_calendar_64_patterns.md         # カレンダーデータ
```

### 必要な外部ライブラリ
```html
<!-- Chart.js CDN -->
<script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
```

---

## 🔑 コア実装

### 1. 月相計算ロジック

```javascript
// 生年月日から月相を計算
function calculateMoonPhase(year, month, day) {
    const birthDate = new Date(year, month - 1, day);
    const newMoonBase = new Date(2000, 0, 6); // 基準日
    const lunarCycle = 29.53059; // 朔望月
    
    const daysSince = Math.floor((birthDate - newMoonBase) / (1000 * 60 * 60 * 24));
    const moonAge = ((daysSince % lunarCycle) + lunarCycle) % lunarCycle;
    
    // 8つの月相に分類
    if (moonAge < 1.5) return 0; // 新月
    if (moonAge < 6) return 1;   // 三日月
    if (moonAge < 9) return 2;   // 上弦
    if (moonAge < 12) return 3;  // 十三夜
    if (moonAge < 16.5) return 4; // 満月
    if (moonAge < 20) return 5;  // 十六夜
    if (moonAge < 24) return 6;  // 下弦
    return 7; // 暁
}

// 月相名を取得
function getMoonPhaseName(phase) {
    const names = ['新月', '三日月', '上弦', '十三夜', '満月', '十六夜', '下弦', '暁'];
    return names[phase];
}
```

### 2. 隠れ月相計算

```javascript
// 隠れ月相（裏の顔）を計算
function calculateHiddenMoonPhase(moonPhase, birthMonth, birthDay) {
    // 生日の数字根を計算
    function getDigitRoot(num) {
        while (num >= 10) {
            num = Math.floor(num / 10) + (num % 10);
        }
        return num;
    }
    
    const dayRoot = getDigitRoot(birthDay);
    const hiddenPhase = (moonPhase + birthMonth + dayRoot) % 8;
    
    return hiddenPhase;
}
```

### 3. パターンID生成

```javascript
// 64パターンのIDを生成
function getPatternId(moonPhase, hiddenPhase) {
    return moonPhase * 10 + hiddenPhase;
    // 例: 新月(0) × 三日月(1) = 01
}
```

---

## 📊 運勢グラフ実装

### グラフデータの構造
```javascript
// 64パターンのグラフデータ例
const fortuneGraphData = {
    "00": { // 新月×新月
        "overall": [3, 3, 4, 4, 4, 5, 5, 4, 4, 3, 3, 4], // 12週間のデータ
        "description": "着実に上昇し、中盤でピークを迎える"
    },
    "01": { // 新月×三日月
        "overall": [3, 4, 4, 5, 5, 5, 4, 4, 3, 3, 4, 4],
        "description": "早い段階で好調期に入る"
    },
    // ... 他の62パターン
};
```

### Chart.js設定

```javascript
function createFortuneChart(patternId) {
    // パターンIDを2桁の文字列に変換
    const paddedId = String(patternId).padStart(2, '0');
    
    // データ取得（上記のfortuneGraphDataから）
    const fortuneData = fortuneGraphData[paddedId];
    
    if (!fortuneData) {
        console.error(`パターンID ${paddedId} のデータが見つかりません`);
        return;
    }
    
    const ctx = document.getElementById('fortuneChart').getContext('2d');
    
    new Chart(ctx, {
        type: 'line',
        data: {
            labels: [
                '1週目', '2週目', '3週目', '4週目',
                '5週目', '6週目', '7週目', '8週目',
                '9週目', '10週目', '11週目', '12週目'
            ],
            datasets: [{
                label: '総合運',
                data: fortuneData.overall,
                borderColor: '#ffd700',
                backgroundColor: 'rgba(255, 215, 0, 0.1)',
                tension: 0.4,
                borderWidth: 3,
                pointRadius: 6,
                pointBackgroundColor: '#fff',
                pointBorderColor: '#ffd700',
                pointBorderWidth: 2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    min: 1,
                    max: 5,
                    ticks: {
                        stepSize: 1,
                        callback: function(value) {
                            const labels = {
                                5: '絶好調',
                                4: '好調',
                                3: '安定',
                                2: '注意',
                                1: '低調'
                            };
                            return labels[value];
                        }
                    }
                }
            },
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const fortuneLevel = context.parsed.y;
                            const labels = {
                                5: '絶好調',
                                4: '好調',
                                3: '安定',
                                2: '注意',
                                1: '低調'
                            };
                            return `総合運: ${labels[fortuneLevel]}`;
                        }
                    }
                }
            }
        }
    });
}
```

---

## 🎨 デザイン実装

### バナースタイルの使い分け

```javascript
// バナータイプを判定して適用
function applyBannerStyle(section) {
    const bannerMap = {
        'fortune': 'banner-supreme',     // 最重要
        'love': 'banner-supreme',        // 最重要
        'work': 'banner-secondary',      // 中重要
        'relationship': 'banner-secondary', // 中重要
        'moonphase': 'banner-decorative' // 装飾的
    };
    
    const bannerClass = bannerMap[section] || 'banner-title';
    return bannerClass;
}
```

### スクロール進捗バー

```javascript
// スクロール進捗バーの更新
window.addEventListener('scroll', () => {
    const scrollProgress = document.querySelector('.scroll-progress');
    const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
    const scrolled = (window.scrollY / scrollHeight) * 100;
    scrollProgress.style.width = scrolled + '%';
});
```

---

## 📝 コンテンツ表示ロジック

### 64パターンコンテンツの取得

```javascript
// パターンIDからコンテンツを取得する完全実装
function getPatternContent(patternId) {
    // パターンIDからファイルと範囲を特定
    const getFileRange = (id) => {
        if (id >= 0 && id <= 7) return { file: 'patterns_1-8', range: [0, 7] };
        if (id >= 10 && id <= 17) return { file: 'patterns_9-20', range: [10, 17] };
        if (id >= 20 && id <= 27) return { file: 'patterns_9-20', range: [20, 27] };
        if (id >= 30 && id <= 36) return { file: 'patterns_21-36', range: [30, 36] };
        if (id >= 40 && id <= 47) return { file: 'patterns_37-48', range: [40, 47] };
        if (id >= 50 && id <= 57) return { file: 'patterns_49-64', range: [50, 57] };
        if (id >= 60 && id <= 67) return { file: 'patterns_49-64', range: [60, 67] };
        return null;
    };
    
    const fileInfo = getFileRange(patternId);
    if (!fileInfo) {
        console.error(`無効なパターンID: ${patternId}`);
        return null;
    }
    
    // 実際の実装では、ここでファイルから該当パターンを読み込む
    // 以下は構造の例
    return {
        patternId: patternId,
        moonPhase: Math.floor(patternId / 10),
        hiddenPhase: patternId % 10,
        content: {
            overall: "全体運の内容...",      // 600文字
            love: "恋愛運の内容...",         // 500文字
            relationship: "人間関係運の内容...", // 450文字
            work: "仕事運の内容...",         // 450文字
            money: "金運の内容..."           // 400文字
        }
    };
}

// HTMLに表示する際の実装例
function displayFortuneContent(patternId) {
    const pattern = getPatternContent(patternId);
    
    if (!pattern) return;
    
    // 各セクションに内容を挿入
    document.getElementById('overall-fortune').innerText = pattern.content.overall;
    document.getElementById('love-fortune').innerText = pattern.content.love;
    document.getElementById('relationship-fortune').innerText = pattern.content.relationship;
    document.getElementById('work-fortune').innerText = pattern.content.work;
    document.getElementById('money-fortune').innerText = pattern.content.money;
}
```

### 無料/有料の切り替え

```javascript
// 有料版コンテンツの表示制御
function togglePaidContent(isPaid) {
    const paidSections = document.querySelectorAll('.paid-content');
    const paywall = document.querySelector('.paywall');
    
    if (isPaid) {
        // 有料版を表示
        paidSections.forEach(section => {
            section.style.display = 'block';
            section.classList.add('fade-in');
        });
        paywall.style.display = 'none';
    } else {
        // 無料版のみ表示
        paidSections.forEach(section => {
            section.style.display = 'none';
        });
        paywall.style.display = 'block';
    }
}
```

---

## 🔄 データフロー

```mermaid
graph TD
    A[ユーザー入力] --> B[生年月日]
    B --> C[月相計算]
    B --> D[隠れ月相計算]
    C --> E[パターンID生成]
    D --> E
    E --> F[64パターンから該当コンテンツ取得]
    F --> G[無料版表示]
    G --> H{購入確認}
    H -->|Yes| I[有料版表示]
    H -->|No| J[購入促進]
```

---

## ⚠️ 注意事項

### 1. 文字数の厳守
```javascript
// コンテンツ検証
function validateContent(content) {
    const limits = {
        overall: 600,
        love: 500,
        relationship: 450,
        work: 450,
        money: 400
    };
    
    for (const [key, limit] of Object.entries(limits)) {
        if (content[key].length !== limit) {
            console.warn(`${key}の文字数が不正: ${content[key].length}文字 (期待値: ${limit}文字)`);
        }
    }
}
```

### 2. 時期表現の統一
```javascript
// 時期表現の変換
function formatPeriod(monthOffset) {
    // 固定月名を使わない
    return `診断から${monthOffset}ヶ月目`;
    // NOT: "1月", "2月", etc.
}
```

### 3. レスポンシブ対応
```javascript
// デバイス判定
function isMobile() {
    return window.innerWidth <= 768;
}

// モバイル用調整
if (isMobile()) {
    // フォントサイズ調整
    document.body.style.fontSize = '16px';
    // スクロールヒント表示
    document.querySelector('.scroll-hint').style.display = 'block';
}
```

---

## 🧪 テストポイント

### 必須テストケース

1. **月相計算の正確性**
   - 各月相の境界値テスト
   - うるう年対応

2. **64パターンの網羅性**
   - 全パターンのコンテンツ存在確認
   - 文字数チェック

3. **レスポンシブ表示**
   - iPhone/Android各種サイズ
   - タブレット表示

4. **パフォーマンス**
   - 初期表示3秒以内
   - スクロールの滑らかさ

5. **ブラウザ互換性**
   - Chrome/Safari/Firefox/Edge
   - iOS Safari対応

---

## 🚀 デプロイチェックリスト

- [ ] 全64パターンのコンテンツ確認
- [ ] Chart.jsの正常動作
- [ ] レスポンシブデザインの確認
- [ ] 文字数の検証
- [ ] アニメーションのパフォーマンス
- [ ] 購入フローのテスト
- [ ] エラーハンドリング
- [ ] アクセシビリティチェック

---

## 📚 関連ドキュメント

- **仕様書**: `OTSUKISAMA_FINAL_SPEC_2025.md`
- **64パターン**: `otsukisama_patterns_*.md`
- **月齢カレンダー**: `moon_calendar_64_patterns.md`
- **グラフ仕様**: `fortune_graph_specification_simple.md`

## 🔌 完全な実装例

### メイン処理フロー
```javascript
// 完全な実装例
document.addEventListener('DOMContentLoaded', () => {
    // 1. フォームからユーザー入力を取得
    const form = document.getElementById('fortune-form');
    
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        
        // 2. 入力値を取得
        const name = document.getElementById('name').value;
        const year = parseInt(document.getElementById('year').value);
        const month = parseInt(document.getElementById('month').value);
        const day = parseInt(document.getElementById('day').value);
        
        // 3. 月相を計算
        const moonPhase = calculateMoonPhase(year, month, day);
        const hiddenPhase = calculateHiddenMoonPhase(moonPhase, month, day);
        
        // 4. パターンIDを生成
        const patternId = getPatternId(moonPhase, hiddenPhase);
        
        // 5. 基本情報を表示
        displayBasicInfo(name, year, month, day, moonPhase);
        
        // 6. 無料版コンテンツを表示
        showFreeContent(moonPhase);
        
        // 7. 有料版への誘導を表示
        showPaywall();
        
        // 8. 購入後の処理
        if (isPurchased) {
            showPaidContent(patternId, moonPhase, hiddenPhase);
            createFortuneChart(patternId);
            showMonthlyCalendar(patternId);
        }
    });
});

// 必要な全ての関数がここに含まれている
```

---

## 💡 トラブルシューティング

### よくある問題と解決法

#### 1. 月相計算がずれる
```javascript
// タイムゾーン考慮
const birthDate = new Date(year, month - 1, day, 12, 0, 0); // 正午で計算
```

#### 2. Chart.jsが表示されない
```javascript
// DOMContentLoaded後に初期化
document.addEventListener('DOMContentLoaded', () => {
    createFortuneChart(patternId);
});
```

#### 3. モバイルでアニメーションが重い
```css
@media (max-width: 768px) {
    * {
        animation-duration: 0s !important; /* アニメーション無効化 */
    }
}
```

---

更新日: 2025-01-27