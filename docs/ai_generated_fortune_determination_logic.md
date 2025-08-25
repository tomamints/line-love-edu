# 運勢決定ロジック設計書

## 概要
おつきさま診断における運勢（全体運・恋愛運・仕事運・金運）の決定メカニズムを定義。月相、日付、個人情報、天文学的要素を組み合わせた多層的なアルゴリズムにより、パーソナライズされた運勢を生成する。

---

## 1. 基本アーキテクチャ

### 1.1 運勢決定の4つの要素
```
最終運勢 = 基本月相運勢 × 現在月相補正 × 季節調整 × 個人化係数
```

#### 要素詳細
1. **基本月相運勢**: 誕生時の月相による基本的な性格・運勢傾向
2. **現在月相補正**: 現在の月相との相性による運勢の変動
3. **季節調整**: 季節や月による運勢の自然な変化
4. **個人化係数**: 生年月日の詳細情報による微調整

### 1.2 システム構成
```javascript
class FortuneEngine {
    constructor() {
        this.moonEngine = new MoonFortuneEngineV2();
        this.timeCalculator = new TimeBasedCalculator();
        this.personalizer = new PersonalizedCalculator();
        this.contentGenerator = new ContentGenerator();
    }
}
```

---

## 2. 月相ベースの基本運勢システム

### 2.1 基本運勢マトリックス
各月相タイプの基本的な運勢傾向を数値化

```javascript
const BASE_FORTUNE_MATRIX = {
    '新月': {
        overall: 85,    // 全体運：新しい始まり、創造力
        love: 80,       // 恋愛運：積極的、魅力的
        career: 90,     // 仕事運：革新的、リーダーシップ
        money: 75       // 金運：投資、新規事業
    },
    '三日月': {
        overall: 75,    // 全体運：成長、慎重
        love: 85,       // 恋愛運：優しさ、思いやり
        career: 70,     // 仕事運：サポート、協調性
        money: 80       // 金運：貯蓄、安定
    },
    '上弦の月': {
        overall: 85,    // 全体運：決断力、行動力
        love: 75,       // 恋愛運：計画的、現実的
        career: 90,     // 仕事運：マネジメント、戦略
        money: 85       // 金運：投資、資産運用
    },
    '十三夜': {
        overall: 90,    // 全体運：安定、成熟
        love: 85,       // 恋愛運：深い関係、信頼
        career: 80,     // 仕事運：継続、品質
        money: 85       // 金運：長期投資、資産形成
    },
    '満月': {
        overall: 95,    // 全体運：完成、達成
        love: 90,       // 恋愛運：情熱、魅力
        career: 85,     // 仕事運：成果、評価
        money: 80       // 金運：収穫、ボーナス
    },
    '十六夜': {
        overall: 85,    // 全体運：余裕、成熟
        love: 85,       // 恋愛運：落ち着いた関係
        career: 80,     // 仕事運：指導、メンター
        money: 85       // 金運：安定収入、運用
    },
    '下弦の月': {
        overall: 75,    // 全体運：整理、内省
        love: 70,       // 恋愛運：慎重、質重視  
        career: 75,     // 仕事運：効率化、改善
        money: 90       // 金運：節約、管理
    },
    '暁': {
        overall: 80,    // 全体運：変化、準備
        love: 75,       // 恋愛運：深い繋がり
        career: 75,     // 仕事運：創作、独立
        money: 75       // 金運：新しい収入源
    }
};
```

### 2.2 裏月相による補正
裏月相は基本運勢に対して ±5-15% の補正を加える

```javascript
function applyHiddenMoonCorrection(baseFortune, hiddenMoonType) {
    const corrections = {
        '新月': { overall: 1.1, love: 0.95, career: 1.05, money: 1.0 },
        '三日月': { overall: 1.0, love: 1.1, career: 0.95, money: 1.05 },
        // ... 他の月相
    };
    
    const correction = corrections[hiddenMoonType];
    return {
        overall: Math.round(baseFortune.overall * correction.overall),
        love: Math.round(baseFortune.love * correction.love),
        career: Math.round(baseFortune.career * correction.career),
        money: Math.round(baseFortune.money * correction.money)
    };
}
```

---

## 3. 時間要素による動的補正

### 3.1 現在月相との相性補正
現在の月相と誕生時月相の相性により、日々の運勢が変動

```javascript
function calculateCurrentMoonInfluence(birthMoonType, currentDate) {
    const currentMoonAge = calculateMoonAge(currentDate);
    const currentMoonType = getMoonTypeFromAge(currentMoonAge);
    const compatibility = getCompatibilityScore(birthMoonType, currentMoonType.type);
    
    // 相性スコアを補正係数に変換
    const influenceMultiplier = {
        95: 1.2,  // 最高相性：+20%
        75: 1.1,  // 良い相性：+10%
        55: 1.0   // 普通：変化なし
    };
    
    return influenceMultiplier[compatibility] || 1.0;
}
```

### 3.2 季節・月による調整
自然のサイクルに合わせた運勢の変動

```javascript
const SEASONAL_ADJUSTMENTS = {
    spring: {  // 3-5月：成長と新規開始
        overall: 1.1, love: 1.15, career: 1.2, money: 1.05
    },
    summer: {  // 6-8月：活動と成果
        overall: 1.2, love: 1.1, career: 1.15, money: 1.1
    },
    autumn: {  // 9-11月：収穫と安定
        overall: 1.15, love: 1.05, career: 1.1, money: 1.2
    },
    winter: {  // 12-2月：内省と準備
        overall: 1.0, love: 1.0, career: 1.05, money: 1.15
    }
};
```

### 3.3 特別な日付による大幅補正
天文学的に重要な日付での運勢ブースト

```javascript
const SPECIAL_DATES_2025 = [
    { date: '2025-04-19', type: 'new_moon', boost: 1.5 },      // 新月
    { date: '2025-05-04', type: 'full_moon', boost: 1.3 },     // 満月
    { date: '2025-06-21', type: 'summer_solstice', boost: 1.4 }, // 夏至
    { date: '2025-08-09', type: 'full_moon', boost: 1.3 },     // 満月
    { date: '2025-09-12', type: 'new_moon', boost: 1.5 },      // 新月
    { date: '2025-10-29', type: 'new_moon', boost: 1.5 },      // 新月
    { date: '2025-12-08', type: 'full_moon', boost: 1.3 }      // 満月
];
```

---

## 4. 個人化要素

### 4.1 生年月日による微調整
西暦、月、日の数値を使った個人差の演出

```javascript
function calculatePersonalModifier(birthDate) {
    const year = birthDate.getFullYear();
    const month = birthDate.getMonth() + 1;
    const day = birthDate.getDate();
    
    // 数字根計算による個人係数
    const yearRoot = getDigitalRoot(year);
    const monthRoot = getDigitalRoot(month);  
    const dayRoot = getDigitalRoot(day);
    
    const personalSeed = (yearRoot + monthRoot + dayRoot) % 9 + 1; // 1-9
    
    return {
        overall: 0.95 + (personalSeed * 0.01),  // 0.95 - 1.04
        love: 0.95 + ((personalSeed * 2) % 9 * 0.01),
        career: 0.95 + ((personalSeed * 3) % 9 * 0.01),
        money: 0.95 + ((personalSeed * 5) % 9 * 0.01)
    };
}
```

### 4.2 名前による微調整（オプション）
名前が入力された場合の文字数による調整

```javascript
function calculateNameInfluence(name) {
    if (!name || name.length === 0) return 1.0;
    
    const nameLength = name.length;
    const nameValue = nameLength % 8; // 0-7に正規化
    
    // 名前の文字数による運勢への影響（微細な調整）
    return 0.98 + (nameValue * 0.005); // 0.98 - 1.015
}
```

---

## 5. 運勢レベルの判定

### 5.1 運勢スコアの分類
最終的な運勢スコアを分かりやすいレベルに変換

```javascript
function getFortuneLevel(score) {
    if (score >= 95) return { level: '絶好調', emoji: '🌟', color: '#FFD700' };
    if (score >= 85) return { level: '好調', emoji: '😊', color: '#90EE90' };
    if (score >= 75) return { level: '普通', emoji: '😌', color: '#87CEEB' };
    if (score >= 65) return { level: '注意', emoji: '😐', color: '#DDA0DD' };
    return { level: '充電期', emoji: '😴', color: '#F0E68C' };
}
```

### 5.2 バランス評価
4つの運勢カテゴリーの総合バランスを評価

```javascript
function evaluateBalance(fortunes) {
    const scores = [fortunes.overall, fortunes.love, fortunes.career, fortunes.money];
    const max = Math.max(...scores);
    const min = Math.min(...scores);
    const variance = max - min;
    
    if (variance <= 10) return 'バランス型';
    if (variance <= 20) return '安定型';
    return '波乱型';
}
```

---

## 6. コンテンツ選択ロジック

### 6.1 運勢レベルによるコンテンツ分岐
運勢スコアに応じて適切なメッセージを選択

```javascript
function selectFortuneContent(category, moonType, fortuneLevel, currentDate) {
    const contentPool = FORTUNE_CONTENT[category][moonType];
    
    // 運勢レベルによるフィルタリング
    const levelContent = contentPool.filter(content => 
        content.targetLevel === fortuneLevel || content.targetLevel === 'all'
    );
    
    // 季節による追加フィルタリング
    const season = getSeason(currentDate);
    const seasonalContent = levelContent.filter(content =>
        content.season === season || content.season === 'all'
    );
    
    // 日付ベースの選択
    const dayOfYear = getDayOfYear(currentDate);
    const selectedIndex = dayOfYear % seasonalContent.length;
    
    return seasonalContent[selectedIndex];
}
```

### 6.2 重複回避システム
同じユーザーに対して重複したコンテンツを避ける

```javascript
class ContentHistory {
    constructor() {
        this.userHistory = new Map();
    }
    
    getUniqueContent(userId, category, moonType, availableContent) {
        const history = this.userHistory.get(userId) || new Set();
        const unused = availableContent.filter(content => 
            !history.has(content.id)
        );
        
        if (unused.length === 0) {
            // 全て使用済みの場合はリセット
            history.clear();
            return availableContent[0];
        }
        
        const selected = unused[Math.floor(Math.random() * unused.length)];
        history.add(selected.id);
        this.userHistory.set(userId, history);
        
        return selected;
    }
}
```

---

## 7. パフォーマンス最適化

### 7.1 計算結果のキャッシュ
同じ日の同じユーザーの運勢はキャッシュして高速化

```javascript
class FortuneCache {
    constructor() {
        this.cache = new Map();
        this.cacheExpiry = 24 * 60 * 60 * 1000; // 24時間
    }
    
    getCachedFortune(userId, date) {
        const key = `${userId}_${date.toDateString()}`;
        const cached = this.cache.get(key);
        
        if (cached && (Date.now() - cached.timestamp) < this.cacheExpiry) {
            return cached.fortune;
        }
        
        return null;
    }
    
    setCachedFortune(userId, date, fortune) {
        const key = `${userId}_${date.toDateString()}`;
        this.cache.set(key, {
            fortune,
            timestamp: Date.now()
        });
    }
}
```

### 7.2 非同期処理による高速化
重い計算は非同期で処理し、ユーザー体験を向上

```javascript
async function generateFortuneAsync(userProfile, targetDate = new Date()) {
    // 基本計算（同期）
    const basicFortune = calculateBasicFortune(userProfile.birthDate);
    
    // 複雑な計算（非同期）
    const [
        currentMoonInfluence,
        seasonalAdjustment,
        personalModifier,
        specialDateBoost
    ] = await Promise.all([
        calculateCurrentMoonInfluenceAsync(userProfile.birthMoonType, targetDate),
        getSeasonalAdjustmentAsync(targetDate),
        calculatePersonalModifierAsync(userProfile.birthDate),
        checkSpecialDateBoostAsync(targetDate)
    ]);
    
    // 最終合成
    return composeFinalFortune(
        basicFortune,
        currentMoonInfluence,
        seasonalAdjustment,
        personalModifier,
        specialDateBoost
    );
}
```

---

## 8. 品質保証とテスト

### 8.1 運勢分布の確認
極端な偏りがないかをチェック

```javascript
function validateFortuneDistribution(sampleSize = 10000) {
    const distribution = { overall: [], love: [], career: [], money: [] };
    
    for (let i = 0; i < sampleSize; i++) {
        const randomBirth = generateRandomBirthDate();
        const fortune = calculateFortune(randomBirth);
        
        distribution.overall.push(fortune.overall);
        distribution.love.push(fortune.love);
        distribution.career.push(fortune.career);
        distribution.money.push(fortune.money);
    }
    
    // 統計分析
    return {
        overall: analyzeDistribution(distribution.overall),
        love: analyzeDistribution(distribution.love),
        career: analyzeDistribution(distribution.career),
        money: analyzeDistribution(distribution.money)
    };
}
```

### 8.2 一貫性チェック
同じユーザーの運勢が大きく変動しないかを確認

```javascript
function testConsistency(userProfile, days = 30) {
    const fortunes = [];
    const baseDate = new Date();
    
    for (let i = 0; i < days; i++) {
        const testDate = new Date(baseDate);
        testDate.setDate(baseDate.getDate() + i);
        
        fortunes.push(calculateFortune(userProfile, testDate));
    }
    
    // 変動幅の分析
    return analyzeVariance(fortunes);
}
```

---

## 9. 実装例

### 9.1 メインクラス
```javascript
class OtsukisamaFortuneEngine {
    constructor() {
        this.moonEngine = new MoonFortuneEngineV2();
        this.cache = new FortuneCache();
        this.contentHistory = new ContentHistory();
        this.timeCalculator = new TimeBasedCalculator();
    }
    
    async generateCompleteFortune(userProfile, targetDate = new Date()) {
        // キャッシュチェック
        const cached = this.cache.getCachedFortune(userProfile.id, targetDate);
        if (cached) return cached;
        
        // 運勢計算
        const fortune = await this.calculateFortune(userProfile, targetDate);
        
        // コンテンツ生成
        const content = await this.generateContent(userProfile, fortune, targetDate);
        
        // 最終結果
        const result = {
            fortune,
            content,
            metadata: {
                calculatedAt: new Date(),
                targetDate,
                userProfile: userProfile.id
            }
        };
        
        // キャッシュ保存
        this.cache.setCachedFortune(userProfile.id, targetDate, result);
        
        return result;
    }
    
    async calculateFortune(userProfile, targetDate) {
        // 基本運勢
        const baseFortune = BASE_FORTUNE_MATRIX[userProfile.birthMoonType];
        
        // 裏月相補正
        const hiddenCorrection = applyHiddenMoonCorrection(
            baseFortune, 
            userProfile.hiddenMoonType
        );
        
        // 時間要素補正
        const currentMoonInfluence = calculateCurrentMoonInfluence(
            userProfile.birthMoonType, 
            targetDate
        );
        
        const seasonalAdjustment = SEASONAL_ADJUSTMENTS[getSeason(targetDate)];
        const specialBoost = getSpecialDateBoost(targetDate);
        
        // 個人化要素
        const personalModifier = calculatePersonalModifier(userProfile.birthDate);
        const nameInfluence = calculateNameInfluence(userProfile.name);
        
        // 最終計算
        const finalFortune = {
            overall: Math.round(
                hiddenCorrection.overall * 
                currentMoonInfluence * 
                seasonalAdjustment.overall * 
                specialBoost * 
                personalModifier.overall * 
                nameInfluence
            ),
            love: Math.round(
                hiddenCorrection.love * 
                currentMoonInfluence * 
                seasonalAdjustment.love * 
                specialBoost * 
                personalModifier.love * 
                nameInfluence
            ),
            career: Math.round(
                hiddenCorrection.career * 
                currentMoonInfluence * 
                seasonalAdjustment.career * 
                specialBoost * 
                personalModifier.career * 
                nameInfluence
            ),
            money: Math.round(
                hiddenCorrection.money * 
                currentMoonInfluence * 
                seasonalAdjustment.money * 
                specialBoost * 
                personalModifier.money * 
                nameInfluence
            )
        };
        
        // スコアの範囲制限（50-100）
        return {
            overall: Math.max(50, Math.min(100, finalFortune.overall)),
            love: Math.max(50, Math.min(100, finalFortune.love)),
            career: Math.max(50, Math.min(100, finalFortune.career)),
            money: Math.max(50, Math.min(100, finalFortune.money))
        };
    }
    
    async generateContent(userProfile, fortune, targetDate) {
        const content = {};
        
        for (const category of ['overall', 'love', 'career', 'money']) {
            const fortuneLevel = getFortuneLevel(fortune[category]);
            const availableContent = getAvailableContent(
                category, 
                userProfile.birthMoonType, 
                fortuneLevel.level, 
                targetDate
            );
            
            content[category] = this.contentHistory.getUniqueContent(
                userProfile.id, 
                category, 
                userProfile.birthMoonType, 
                availableContent
            );
        }
        
        return content;
    }
}
```

---

## 10. モニタリングと改善

### 10.1 ユーザー満足度の追跡
```javascript
class FortuneFeedbackTracker {
    trackUserSatisfaction(userId, fortuneId, rating, feedback) {
        // 満足度データの蓄積
        // A/Bテストのための分析
        // アルゴリズムの改善点の発見
    }
}
```

### 10.2 パフォーマンスメトリクス
- 運勢計算の平均処理時間
- キャッシュヒット率
- ユーザーの再訪問率
- 有料転換率（LP用途）

この運勢決定ロジックにより、科学的根拠と占いの神秘性を両立させた、魅力的で個人化されたおつきさま診断が実現されます。