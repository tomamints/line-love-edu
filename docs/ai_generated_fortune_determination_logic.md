# 運勢決定ロジック設計書

## 概要
おつきさま診断における運勢（全体運・恋愛運・仕事運・金運）の決定メカニズムを定義。誕生時の月相と裏月相の組み合わせによる64パターンを基軸とした、年間を通じた長期的な運勢傾向を生成する。

---

## 1. 基本アーキテクチャ

### 1.1 運勢決定の基本要素
```
年間運勢パターン = 月相タイプ × 裏月相タイプ × 季節的流れ × 個性調整
```

#### 要素詳細
1. **月相タイプ**: 誕生時の月相による基本性格（8種類）
2. **裏月相タイプ**: 内面の月相による隠れた特性（8種類）
3. **季節的流れ**: 年間を通じた自然なエネルギーの変化
4. **個性調整**: 恋愛運における個人の特性（エネルギー、価値観、距離感、感情表現）

### 1.2 システム構成
```javascript
class FortuneEngine {
    constructor() {
        this.moonPatternEngine = new MoonPatternEngine();     // 64パターン管理
        this.annualFlowEngine = new AnnualFlowEngine();       // 年間運勢流れ
        this.personalityEngine = new PersonalityEngine();     // 個性要素（恋愛運用）
        this.contentGenerator = new ContentGenerator();       // コンテンツ生成
    }
}
```

---

## 2. 64パターン月相システム

### 2.1 月相×裏月相の基本傾向
各組み合わせによる性格・運勢の基本パターン（数値化は廃止し、質的な傾向で表現）

```javascript
const MOON_PATTERN_MATRIX = {
    '新月×新月': {
        overall: '純粋な創造エネルギー。一年を通じて新しいことに挑戦し続ける',
        love: '一目惚れしやすく、情熱的な恋愛。相手を変化させる力を持つ',
        career: '起業・独立に最適。革新的なアイデアで業界を変える可能性',
        money: '投資や新規事業で成功。リスクを恐れない姿勢が幸運を呼ぶ'
    },
    '新月×三日月': {
        overall: '外向的エネルギーと内向的慎重さのバランス。計画的な挑戦者',
        love: '積極的だが相手を思いやる恋愛。長期的な関係を築くのが得意',
        career: '新しいことを始めつつ、リスク管理もできる理想的なタイプ',
        money: '冒険と安定のバランス。堅実な投資で着実に資産を増やす'
    },
    // ... 残り62パターンの定義
};
```

### 2.2 裏月相の影響パターン
裏月相は表の月相に深みと複雑さを与える隠れた要素として作用

```javascript
const HIDDEN_MOON_INFLUENCES = {
    '新月': {
        trait: '純粋性と直感',
        influence: '表面的な行動の背後にある純粋な動機と強い直感力',
        effect: '決断が早く、後悔しない。本能的に正しい選択をする'
    },
    '三日月': {
        trait: '慎重さと配慮',
        influence: '行動する前の丁寧な準備と他者への深い配慮',
        effect: '失敗が少なく、周りからの信頼を得やすい'
    },
    // ... 他の月相パターン
};
```

---

## 3. 年間エネルギーフローシステム

### 3.1 季節による運勢の自然な変化
一年を通じた運勢の大きな流れ（日単位の変動は除外）

```javascript
const ANNUAL_FLOW_PATTERNS = {
    spring: {  // 3-5月：芽吹きと新たな始まり
        theme: '種まきと成長の季節',
        energy: '新月系タイプにとって最高のエネルギー期間',
        focus: '新しいことを始める、人との出会い、計画の実行'
    },
    summer: {  // 6-8月：活動と実現
        theme: '情熱と行動の季節', 
        energy: '全ての月相タイプが活発になる時期',
        focus: '恋愛成就、仕事の成果、積極的な行動'
    },
    autumn: {  // 9-11月：収穫と安定
        theme: '成果と調和の季節',
        energy: '満月・下弦系タイプが力を発揮する時期',
        focus: '関係の深化、成果の確認、将来への準備'
    },
    winter: {  // 12-2月：内省と準備
        theme: '静寂と準備の季節',
        energy: '暁・三日月系タイプが内面を充実させる時期', 
        focus: '自己理解、スキルアップ、来年への構想'
    }
};
```

### 3.2 月相タイプ別の年間エネルギーカーブ
各月相タイプが一年を通じてどのような波を描くかの傾向

```javascript
const MOON_TYPE_ANNUAL_CURVES = {
    '新月': {
        peak_seasons: ['spring', 'early_summer'],
        characteristics: '春の芽吹きと共に最高潮。夏前半まで勢い継続',
        caution_period: 'late_autumn',
        advice: '春の計画が秋に実を結ぶ。冬は次の準備期間'
    },
    '満月': {
        peak_seasons: ['summer', 'early_autumn'], 
        characteristics: '夏の情熱と初秋の豊穣期に最も輝く',
        caution_period: 'late_winter',
        advice: '夏の関係が秋に深まる。冬は感情の整理期間'
    },
    // ... 他の月相タイプの年間パターン
};
```

### 3.3 2025年の重要な転換点
年間を通じて訪れる大きなエネルギーシフトのタイミング

```javascript
const ANNUAL_TURNING_POINTS_2025 = [
    { 
        period: '春分〜4月末', 
        theme: '新生と決断の時', 
        effect: '新月系タイプに大きなチャンス。人生の方向性が決まる'
    },
    {
        period: '夏至前後（6月）',
        theme: '情熱と成就の頂点',
        effect: '恋愛・仕事共に最高潮。満月系タイプに特に有利'
    },
    {
        period: '秋分〜10月',
        theme: '収穫と安定の確立', 
        effect: '春に始めたことが実を結ぶ。関係性の深化'
    },
    {
        period: '冬至〜年末',
        theme: '統合と来年への準備',
        effect: '一年の成果を統合し、新たなステージへの準備期間'
    }
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