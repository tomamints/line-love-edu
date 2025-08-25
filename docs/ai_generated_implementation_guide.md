# おつきさま診断LP実装ガイド

## 概要
おつきさま診断LPバージョンの実装に必要な技術仕様、データ構造、API設計、フロントエンド実装の詳細ガイド。既存のMoonFortuneEngineV2を拡張し、新機能（裏月相、運勢カテゴリー）を追加する実装方針。

---

## 1. システム全体構成

### 1.1 アーキテクチャ概要
```
Frontend (LP) → API Gateway → Fortune Engine → Content Database
                              ↓
                         Cache Layer ← Moon Calculator
                              ↓
                         Analytics & Logging
```

### 1.2 主要コンポーネント
- **MoonFortuneEngineV3**: 裏月相とLP機能を追加した拡張版
- **HiddenMoonCalculator**: 裏月相計算専用モジュール  
- **FortuneContentManager**: 運勢コンテンツ管理システム
- **LPPaymentGateway**: 有料コンテンツ決済処理
- **UserSessionManager**: ユーザーセッション管理

---

## 2. データ構造設計

### 2.1 ユーザープロファイル拡張
```javascript
// 既存のユーザープロファイルを拡張
class OtsukisamaUserProfile extends UserProfile {
    constructor(birthDate, name = null) {
        super(birthDate, name);
        
        // LP専用フィールド
        this.hiddenMoonType = this.calculateHiddenMoonType();
        this.personalityInsights = this.generatePersonalityInsights();
        this.fortunePreferences = new FortunePreferences();
        this.lpSessionData = new LPSessionData();
    }
    
    calculateHiddenMoonType() {
        return HiddenMoonCalculator.calculate(this.birthDate);
    }
    
    generatePersonalityInsights() {
        return PersonalityAnalyzer.analyze(
            this.birthMoonType, 
            this.hiddenMoonType
        );
    }
}
```

### 2.2 運勢データ構造
```javascript
class CompleteFortune {
    constructor() {
        this.overall = new FortuneCategory('overall');
        this.love = new FortuneCategory('love');
        this.career = new FortuneCategory('career');
        this.money = new FortuneCategory('money');
        this.metadata = new FortuneMetadata();
    }
}

class FortuneCategory {
    constructor(type) {
        this.type = type;
        this.score = 0;          // 50-100のスコア
        this.level = '';         // '絶好調', '好調', '普通', '注意', '充電期'
        this.content = new FortuneContent();
        this.advice = [];        // 具体的なアドバイス
        this.luckyItems = [];    // ラッキーアイテム
        this.warningPoints = []; // 注意点
    }
}

class FortuneContent {
    constructor() {
        this.title = '';         // セクションタイトル
        this.freePreview = '';   // 無料部分
        this.paidContent = '';   // 有料部分
        this.callToAction = '';  // 有料誘導文
        this.visualElements = []; // アイコン、色情報など
    }
}
```

### 2.3 LPセッションデータ
```javascript
class LPSessionData {
    constructor() {
        this.sessionId = generateUUID();
        this.entryTime = new Date();
        this.currentStep = 'input';  // 'input', 'preview', 'payment', 'result'
        this.viewedSections = new Set();
        this.interactionEvents = [];
        this.paymentIntention = null;
        this.conversionTracking = new ConversionTracking();
    }
}
```

---

## 3. 裏月相システム実装

### 3.1 HiddenMoonCalculator クラス
```javascript
class HiddenMoonCalculator {
    static calculate(birthDate) {
        const moonEngine = new MoonFortuneEngineV2();
        
        // 通常の月相インデックス（0-7）を取得
        const normalMoonType = moonEngine.getMoonTypeFromBirthdate(birthDate);
        const normalIndex = MOON_TYPES.indexOf(normalMoonType.type);
        
        // 生年月日から追加パラメータを抽出
        const month = birthDate.getMonth() + 1;  // 1-12
        const day = birthDate.getDate();         // 1-31
        const dayRoot = this.getDigitalRoot(day);
        
        // 裏月相インデックス計算
        const hiddenIndex = (normalIndex + month + dayRoot) % 8;
        
        return {
            type: MOON_TYPES[hiddenIndex],
            emoji: MOON_EMOJIS[hiddenIndex],
            relationship: this.analyzeRelationship(normalIndex, hiddenIndex)
        };
    }
    
    static getDigitalRoot(num) {
        while (num >= 10) {
            num = Math.floor(num / 10) + (num % 10);
        }
        return num;
    }
    
    static analyzeRelationship(normalIndex, hiddenIndex) {
        const difference = Math.abs(normalIndex - hiddenIndex);
        
        if (difference === 0) return 'identical';      // 同一（稀）
        if (difference === 4) return 'opposite';       // 正反対
        if (difference <= 2) return 'similar';         // 類似
        if (difference >= 6) return 'similar';         // 円環上で近い
        return 'complementary';                        // 補完的
    }
}
```

### 3.2 PersonalityAnalyzer クラス
```javascript
class PersonalityAnalyzer {
    static analyze(birthMoonType, hiddenMoonType) {
        const relationship = HiddenMoonCalculator.analyzeRelationship(
            MOON_TYPES.indexOf(birthMoonType),
            MOON_TYPES.indexOf(hiddenMoonType.type)
        );
        
        return {
            surfacePersonality: this.getSurfaceTraits(birthMoonType),
            hiddenPersonality: this.getHiddenTraits(hiddenMoonType.type),
            relationship,
            conflictAreas: this.identifyConflicts(birthMoonType, hiddenMoonType.type),
            harmonicAreas: this.identifyHarmonies(birthMoonType, hiddenMoonType.type),
            stressResponse: this.predictStressResponse(hiddenMoonType.type),
            growthPotential: this.assessGrowthPotential(relationship)
        };
    }
    
    static identifyConflicts(surface, hidden) {
        // 表と裏の性格の矛盾点を特定
        const conflicts = PERSONALITY_CONFLICTS[`${surface}-${hidden}`] || [];
        return conflicts.map(conflict => ({
            area: conflict.area,
            description: conflict.description,
            advice: conflict.advice
        }));
    }
    
    static identifyHarmonies(surface, hidden) {
        // 表と裏の性格の調和点を特定
        const harmonies = PERSONALITY_HARMONIES[`${surface}-${hidden}`] || [];
        return harmonies.map(harmony => ({
            area: harmony.area,
            description: harmony.description,
            utilization: harmony.utilization
        }));
    }
}
```

---

## 4. 運勢エンジン拡張 (V3)

### 4.1 MoonFortuneEngineV3 実装
```javascript
class MoonFortuneEngineV3 extends MoonFortuneEngineV2 {
    constructor() {
        super();
        this.hiddenMoonCalculator = new HiddenMoonCalculator();
        this.fortuneContentManager = new FortuneContentManager();
        this.lpPaymentGateway = new LPPaymentGateway();
    }
    
    async generateLPFortune(userProfile, includeHidden = true) {
        // 基本月相診断（V2の機能）
        const basicReading = this.generateCompleteReading(
            userProfile.birthDate,
            null // パートナー情報は不要
        );
        
        // 裏月相診断（新機能）
        let hiddenReading = null;
        if (includeHidden) {
            hiddenReading = this.generateHiddenMoonReading(userProfile);
        }
        
        // 4カテゴリ運勢（新機能）
        const categorizedFortune = await this.generateCategorizedFortune(userProfile);
        
        // LP用構造で結合
        return this.combineLPResults(basicReading, hiddenReading, categorizedFortune);
    }
    
    generateHiddenMoonReading(userProfile) {
        const hiddenMoon = userProfile.hiddenMoonType;
        const personality = userProfile.personalityInsights;
        
        return {
            hiddenMoonType: hiddenMoon,
            personality: {
                traits: personality.hiddenPersonality,
                conflicts: personality.conflictAreas,
                harmonies: personality.harmonicAreas,
                stressResponse: personality.stressResponse
            },
            relationship: {
                type: personality.relationship,
                description: this.getRelationshipDescription(personality.relationship)
            },
            content: this.fortuneContentManager.getHiddenMoonContent(hiddenMoon.type)
        };
    }
    
    async generateCategorizedFortune(userProfile, targetDate = new Date()) {
        const fortuneEngine = new OtsukisamaFortuneEngine();
        
        // 4つのカテゴリーの運勢を並行計算
        const [overall, love, career, money] = await Promise.all([
            this.calculateCategoryFortune('overall', userProfile, targetDate),
            this.calculateCategoryFortune('love', userProfile, targetDate),
            this.calculateCategoryFortune('career', userProfile, targetDate),
            this.calculateCategoryFortune('money', userProfile, targetDate)
        ]);
        
        return { overall, love, career, money };
    }
    
    async calculateCategoryFortune(category, userProfile, targetDate) {
        // ai_generated_fortune_determination_logic.mdに基づいた実装
        const fortuneEngine = new OtsukisamaFortuneEngine();
        const score = await fortuneEngine.calculateFortune(userProfile, targetDate);
        const content = await this.fortuneContentManager.getContent(
            category, 
            userProfile.birthMoonType, 
            score[category]
        );
        
        return new FortuneCategory(category).populate(score[category], content);
    }
    
    combineLPResults(basic, hidden, categorized) {
        return {
            user: basic.user,
            hidden: hidden,
            fortune2025: {
                overall: categorized.overall,
                love: categorized.love,
                career: categorized.career,
                money: categorized.money
            },
            monthlyFortune: basic.monthlyFortune,
            metadata: {
                generatedAt: new Date(),
                version: 'v3-lp',
                features: ['hidden_moon', 'categorized_fortune', 'lp_optimized']
            }
        };
    }
}
```

---

## 5. コンテンツ管理システム

### 5.1 FortuneContentManager 実装
```javascript
class FortuneContentManager {
    constructor() {
        this.contentDatabase = new ContentDatabase();
        this.templateEngine = new TemplateEngine();
        this.variationSelector = new ContentVariationSelector();
    }
    
    async getContent(category, moonType, fortuneScore, options = {}) {
        const level = this.getFortuneLevel(fortuneScore);
        const season = this.getCurrentSeason();
        
        // コンテンツ候補を取得
        const candidates = await this.contentDatabase.query({
            category,
            moonType,
            level,
            season,
            isPaid: options.isPaid || false
        });
        
        // バリエーション選択
        const selected = this.variationSelector.select(
            candidates,
            options.userHistory,
            options.preferences
        );
        
        // テンプレート処理（個人化）
        return this.templateEngine.render(selected, options.personalData);
    }
    
    getHiddenMoonContent(hiddenMoonType) {
        // ai_generated_hidden_moon_phase_content.mdから読み込み
        return HIDDEN_MOON_CONTENT[hiddenMoonType];
    }
    
    getFreePreviewContent(fullContent) {
        // 無料部分のみを抽出（最初の3分の1程度）
        const freeLength = Math.floor(fullContent.length * 0.35);
        const preview = fullContent.substring(0, freeLength);
        
        // 文の途中で切れないよう調整
        const lastPeriod = preview.lastIndexOf('。');
        if (lastPeriod > freeLength * 0.8) {
            return preview.substring(0, lastPeriod + 1) + '\n\n続きを見る（有料）→';
        }
        
        return preview + '...\n\n続きを見る（有料）→';
    }
}
```

### 5.2 ContentVariationSelector 実装
```javascript
class ContentVariationSelector {
    constructor() {
        this.selectionHistory = new Map();
    }
    
    select(candidates, userHistory = [], preferences = {}) {
        if (candidates.length === 0) return null;
        if (candidates.length === 1) return candidates[0];
        
        // 既読コンテンツを除外
        const unread = candidates.filter(content => 
            !userHistory.includes(content.id)
        );
        
        if (unread.length === 0) {
            // 全て既読の場合は最も古い既読を選択
            return this.selectOldestRead(candidates, userHistory);
        }
        
        // 優先度による選択
        return this.selectByPriority(unread, preferences);
    }
    
    selectByPriority(candidates, preferences) {
        // ユーザー設定に基づく優先度計算
        const scored = candidates.map(content => ({
            content,
            score: this.calculatePriorityScore(content, preferences)
        }));
        
        scored.sort((a, b) => b.score - a.score);
        
        // 上位候補からランダム選択（多様性確保）
        const topCandidates = scored.slice(0, Math.min(3, scored.length));
        const randomIndex = Math.floor(Math.random() * topCandidates.length);
        
        return topCandidates[randomIndex].content;
    }
    
    calculatePriorityScore(content, preferences) {
        let score = content.baseScore || 50;
        
        // ユーザー属性による補正
        if (preferences.detailLevel === 'high' && content.isDetailed) score += 20;
        if (preferences.style === 'positive' && content.isPositive) score += 15;
        if (preferences.includeAdvice && content.hasAdvice) score += 10;
        
        // 季節適合性
        const currentSeason = this.getCurrentSeason();
        if (content.season === currentSeason) score += 10;
        
        // 新着コンテンツボーナス
        const daysSinceCreated = (Date.now() - content.createdAt) / (1000 * 60 * 60 * 24);
        if (daysSinceCreated < 7) score += 5;
        
        return score;
    }
}
```

---

## 6. LP専用API設計

### 6.1 APIエンドポイント
```javascript
// 基本診断（無料部分）
POST /api/v3/otsukisama/basic
{
    "name": "山田太郎",
    "birthDate": "1990-01-15",
    "preferences": {
        "includeHidden": true,
        "detailLevel": "standard"
    }
}

// 有料コンテンツ取得
POST /api/v3/otsukisama/premium
{
    "sessionId": "uuid-string",
    "paymentToken": "payment-token",
    "requestedSections": ["overall", "love", "career", "money"]
}

// セッション状態管理
GET /api/v3/otsukisama/session/:sessionId
PUT /api/v3/otsukisama/session/:sessionId
DELETE /api/v3/otsukisama/session/:sessionId
```

### 6.2 API実装例
```javascript
// Express.js + TypeScriptでの実装例
import express from 'express';
import { MoonFortuneEngineV3 } from './fortune-engine-v3';
import { LPPaymentGateway } from './payment-gateway';

const router = express.Router();

router.post('/basic', async (req, res) => {
    try {
        const { name, birthDate, preferences = {} } = req.body;
        
        // バリデーション
        if (!birthDate || !isValidDate(birthDate)) {
            return res.status(400).json({ error: 'Invalid birth date' });
        }
        
        // ユーザープロファイル作成
        const userProfile = new OtsukisamaUserProfile(
            new Date(birthDate),
            name
        );
        
        // 基本診断実行
        const fortuneEngine = new MoonFortuneEngineV3();
        const result = await fortuneEngine.generateLPFortune(
            userProfile,
            preferences.includeHidden !== false
        );
        
        // 無料部分のみを抽出
        const freeResult = extractFreeContent(result);
        
        // セッション作成
        const sessionId = await createUserSession(userProfile, result);
        
        res.json({
            sessionId,
            result: freeResult,
            paymentRequired: true,
            paymentAmount: 1980
        });
        
    } catch (error) {
        console.error('Basic fortune generation error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

router.post('/premium', async (req, res) => {
    try {
        const { sessionId, paymentToken, requestedSections } = req.body;
        
        // セッション検証
        const session = await validateSession(sessionId);
        if (!session) {
            return res.status(404).json({ error: 'Session not found' });
        }
        
        // 支払い検証
        const paymentGateway = new LPPaymentGateway();
        const paymentResult = await paymentGateway.verifyPayment(paymentToken);
        if (!paymentResult.success) {
            return res.status(402).json({ error: 'Payment verification failed' });
        }
        
        // フルコンテンツ取得
        const fullResult = session.fullResult;
        const premiumContent = extractPremiumContent(fullResult, requestedSections);
        
        // アクセス履歴記録
        await recordPremiumAccess(sessionId, requestedSections);
        
        res.json({
            success: true,
            content: premiumContent,
            accessExpiry: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7日間
        });
        
    } catch (error) {
        console.error('Premium content access error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

function extractFreeContent(fullResult) {
    return {
        user: fullResult.user,
        hidden: {
            hiddenMoonType: fullResult.hidden.hiddenMoonType,
            content: truncateContent(fullResult.hidden.content, 0.4)
        },
        fortune2025: {
            overall: { 
                ...fullResult.fortune2025.overall,
                content: truncateContent(fullResult.fortune2025.overall.content, 0.35)
            },
            love: { 
                ...fullResult.fortune2025.love,
                content: truncateContent(fullResult.fortune2025.love.content, 0.35)
            },
            career: { 
                ...fullResult.fortune2025.career,
                content: truncateContent(fullResult.fortune2025.career.content, 0.35)
            },
            money: { 
                ...fullResult.fortune2025.money,
                content: truncateContent(fullResult.fortune2025.money.content, 0.35)
            }
        }
    };
}
```

---

## 7. フロントエンド実装

### 7.1 LP構成
```html
<!DOCTYPE html>
<html lang="ja">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>おつきさま診断 2025年運勢鑑定</title>
    <link rel="stylesheet" href="otsukisama-lp.css">
</head>
<body>
    <!-- ヘーダー -->
    <header class="moon-header">
        <h1>おつきさま診断</h1>
        <p class="subtitle">月の満ち欠けが導く、あなたの2025年運勢</p>
    </header>
    
    <!-- 入力フォーム -->
    <section id="input-section" class="section">
        <div class="moon-form-container">
            <h2>あなたの月相を調べてみましょう</h2>
            <form id="birth-form">
                <div class="form-group">
                    <label for="name">お名前（任意）</label>
                    <input type="text" id="name" maxlength="8">
                </div>
                <div class="form-group">
                    <label for="birth-date">生年月日 *</label>
                    <input type="date" id="birth-date" required>
                </div>
                <button type="submit" class="moon-button">
                    🌙 診断開始 🌙
                </button>
            </form>
        </div>
    </section>
    
    <!-- 結果表示エリア -->
    <section id="result-section" class="section hidden">
        <!-- 基本月相結果 -->
        <div id="basic-result" class="moon-result">
            <!-- JavaScript で動的生成 -->
        </div>
        
        <!-- 裏月相結果 -->
        <div id="hidden-result" class="moon-result">
            <!-- JavaScript で動的生成 -->
        </div>
        
        <!-- 運勢カテゴリー結果 -->
        <div id="fortune-categories" class="fortune-grid">
            <div class="fortune-card" data-category="overall">
                <h3>🌟 全体運</h3>
                <div class="fortune-content">
                    <!-- 無料部分とPaywall -->
                </div>
            </div>
            <div class="fortune-card" data-category="love">
                <h3>💕 恋愛運</h3>
                <div class="fortune-content">
                    <!-- 無料部分とPaywall -->
                </div>
            </div>
            <div class="fortune-card" data-category="career">
                <h3>💼 仕事運</h3>
                <div class="fortune-content">
                    <!-- 無料部分とPaywall -->
                </div>
            </div>
            <div class="fortune-card" data-category="money">
                <h3>💰 金運</h3>
                <div class="fortune-content">
                    <!-- 無料部分とPaywall -->
                </div>
            </div>
        </div>
    </section>
    
    <!-- 支払いモーダル -->
    <div id="payment-modal" class="modal hidden">
        <div class="modal-content">
            <h2>続きを見る（有料）</h2>
            <p>詳細な運勢鑑定をご覧いただけます</p>
            <div class="payment-options">
                <div class="price-display">
                    <span class="amount">1,980円</span>
                    <span class="tax">（税込）</span>
                </div>
                <button id="payment-button" class="payment-btn">
                    決済して続きを見る
                </button>
            </div>
        </div>
    </div>
    
    <script src="otsukisama-lp.js"></script>
</body>
</html>
```

### 7.2 JavaScript実装
```javascript
class OtsukisamaLP {
    constructor() {
        this.sessionId = null;
        this.currentResult = null;
        this.paymentGateway = new PaymentGateway();
        this.init();
    }
    
    init() {
        this.bindEvents();
        this.setupPaymentModal();
    }
    
    bindEvents() {
        document.getElementById('birth-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleDiagnosis();
        });
        
        // 有料コンテンツボタン
        document.querySelectorAll('.continue-paid').forEach(button => {
            button.addEventListener('click', () => {
                this.showPaymentModal();
            });
        });
    }
    
    async handleDiagnosis() {
        const formData = new FormData(document.getElementById('birth-form'));
        const name = formData.get('name');
        const birthDate = formData.get('birth-date');
        
        if (!birthDate) {
            alert('生年月日を入力してください');
            return;
        }
        
        // ローディング表示
        this.showLoading();
        
        try {
            const response = await fetch('/api/v3/otsukisama/basic', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    name,
                    birthDate,
                    preferences: {
                        includeHidden: true,
                        detailLevel: 'standard'
                    }
                })
            });
            
            if (!response.ok) {
                throw new Error('診断に失敗しました');
            }
            
            const data = await response.json();
            this.sessionId = data.sessionId;
            this.currentResult = data.result;
            
            this.displayResult(data.result);
            this.hideLoading();
            
        } catch (error) {
            console.error('診断エラー:', error);
            alert('診断中にエラーが発生しました。もう一度お試しください。');
            this.hideLoading();
        }
    }
    
    displayResult(result) {
        // 基本月相表示
        this.displayBasicMoonResult(result.user);
        
        // 裏月相表示
        this.displayHiddenMoonResult(result.hidden);
        
        // 運勢カテゴリー表示
        this.displayFortuneCategories(result.fortune2025);
        
        // セクションを表示
        document.getElementById('input-section').classList.add('hidden');
        document.getElementById('result-section').classList.remove('hidden');
        
        // スムーズスクロール
        document.getElementById('result-section').scrollIntoView({
            behavior: 'smooth'
        });
    }
    
    displayBasicMoonResult(userData) {
        const container = document.getElementById('basic-result');
        
        container.innerHTML = `
            <div class="moon-type-card">
                <div class="moon-emoji">${userData.moonType.emoji || '🌙'}</div>
                <h2>${userData.story.title}</h2>
                <p class="moon-subtitle">${userData.story.introduction}</p>
                <div class="moon-traits">
                    <h3>あなたの特徴</h3>
                    <ul>
                        ${userData.story.traits.map(trait => `<li>${trait}</li>`).join('')}
                    </ul>
                </div>
                <div class="moon-description">
                    <p>${userData.story.symbolism}</p>
                </div>
            </div>
        `;
    }
    
    displayHiddenMoonResult(hiddenData) {
        const container = document.getElementById('hidden-result');
        
        container.innerHTML = `
            <div class="hidden-moon-card">
                <div class="hidden-moon-header">
                    <div class="moon-emoji">${hiddenData.hiddenMoonType.emoji}</div>
                    <h2>あなたの裏月相：${hiddenData.hiddenMoonType.type}</h2>
                    <p class="relationship-type">表の月相との関係：${this.getRelationshipText(hiddenData.relationship.type)}</p>
                </div>
                <div class="hidden-content">
                    ${this.formatHiddenContent(hiddenData.content)}
                    <button class="continue-paid">続きを見る（有料）</button>
                </div>
            </div>
        `;
    }
    
    displayFortuneCategories(fortune2025) {
        const categories = ['overall', 'love', 'career', 'money'];
        const icons = {
            overall: '🌟',
            love: '💕', 
            career: '💼',
            money: '💰'
        };
        const titles = {
            overall: '全体運',
            love: '恋愛運',
            career: '仕事運', 
            money: '金運'
        };
        
        categories.forEach(category => {
            const card = document.querySelector(`[data-category="${category}"]`);
            const data = fortune2025[category];
            
            card.innerHTML = `
                <div class="category-header">
                    <h3>${icons[category]} ${titles[category]}</h3>
                    <div class="fortune-score">
                        <span class="score">${data.score}</span>
                        <span class="level">${data.level}</span>
                    </div>
                </div>
                <div class="category-content">
                    <div class="free-preview">
                        ${this.formatFreePreview(data.content)}
                    </div>
                    <button class="continue-paid" data-category="${category}">
                        続きを見る（有料）
                    </button>
                </div>
            `;
        });
        
        // イベントリスナーを再バインド
        this.bindPaymentButtons();
    }
    
    formatFreePreview(content) {
        // 無料プレビュー部分のフォーマット
        return `
            <h4>${content.title}</h4>
            <p>${content.freePreview}</p>
        `;
    }
    
    bindPaymentButtons() {
        document.querySelectorAll('.continue-paid').forEach(button => {
            button.addEventListener('click', (e) => {
                const category = e.target.dataset.category;
                this.showPaymentModal(category);
            });
        });
    }
    
    showPaymentModal(category = null) {
        const modal = document.getElementById('payment-modal');
        modal.classList.remove('hidden');
        
        // 特定カテゴリーの場合は価格調整（必要に応じて）
        if (category) {
            // カテゴリー別価格設定があれば実装
        }
        
        // 支払いボタンイベント
        document.getElementById('payment-button').onclick = () => {
            this.handlePayment(category);
        };
    }
    
    async handlePayment(category = null) {
        try {
            // 決済処理（実装は決済プロバイダーに依存）
            const paymentResult = await this.paymentGateway.process({
                amount: 1980,
                currency: 'JPY',
                description: 'おつきさま診断 2025年運勢鑑定'
            });
            
            if (paymentResult.success) {
                await this.fetchPremiumContent(paymentResult.token, category);
                this.hidePaymentModal();
            } else {
                alert('決済に失敗しました。もう一度お試しください。');
            }
        } catch (error) {
            console.error('決済エラー:', error);
            alert('決済中にエラーが発生しました。');
        }
    }
    
    async fetchPremiumContent(paymentToken, category = null) {
        const requestedSections = category ? [category] : ['overall', 'love', 'career', 'money'];
        
        try {
            const response = await fetch('/api/v3/otsukisama/premium', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    sessionId: this.sessionId,
                    paymentToken,
                    requestedSections
                })
            });
            
            if (!response.ok) {
                throw new Error('プレミアムコンテンツの取得に失敗しました');
            }
            
            const data = await response.json();
            this.displayPremiumContent(data.content, requestedSections);
            
        } catch (error) {
            console.error('プレミアムコンテンツ取得エラー:', error);
            alert('コンテンツの取得に失敗しました。');
        }
    }
    
    displayPremiumContent(content, sections) {
        sections.forEach(section => {
            const card = document.querySelector(`[data-category="${section}"]`);
            const premiumData = content[section];
            
            // 有料コンテンツで置き換え
            const contentArea = card.querySelector('.category-content');
            contentArea.innerHTML = `
                <div class="premium-content">
                    <h4>${premiumData.content.title}</h4>
                    <div class="full-content">
                        ${this.formatPremiumContent(premiumData.content)}
                    </div>
                    <div class="advice-section">
                        <h5>アドバイス</h5>
                        <ul>
                            ${premiumData.advice.map(advice => `<li>${advice}</li>`).join('')}
                        </ul>
                    </div>
                </div>
            `;
        });
    }
    
    formatPremiumContent(content) {
        return `
            <p>${content.freePreview}</p>
            <div class="paid-content">
                <p>${content.paidContent}</p>
            </div>
        `;
    }
    
    showLoading() {
        // ローディング表示実装
        document.body.classList.add('loading');
    }
    
    hideLoading() {
        // ローディング非表示実装
        document.body.classList.remove('loading');
    }
    
    hidePaymentModal() {
        document.getElementById('payment-modal').classList.add('hidden');
    }
}

// 初期化
document.addEventListener('DOMContentLoaded', () => {
    new OtsukisamaLP();
});
```

---

## 8. 決済統合

### 8.1 決済プロバイダー統合例（Stripe）
```javascript
class PaymentGateway {
    constructor() {
        this.stripe = Stripe(process.env.STRIPE_PUBLIC_KEY);
    }
    
    async process(paymentData) {
        try {
            const { error, paymentIntent } = await this.stripe.confirmPayment({
                elements,
                confirmParams: {
                    return_url: `${window.location.origin}/payment-success`,
                },
            });
            
            if (error) {
                throw error;
            }
            
            return {
                success: true,
                token: paymentIntent.id,
                status: paymentIntent.status
            };
        } catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    }
}
```

---

## 9. パフォーマンス最適化

### 9.1 キャッシング戦略
- **セッションキャッシュ**: Redis使用、30分TTL
- **コンテンツキャッシュ**: Memcached使用、24時間TTL  
- **運勢計算キャッシュ**: データベース＋メモリ、同日同条件は再利用

### 9.2 非同期処理
- 重い計算は Web Worker に移行
- API呼び出しは Promise.all で並行処理
- UI更新は requestAnimationFrame を使用

---

## 10. デプロイメント

### 10.1 環境設定
```yaml
# docker-compose.yml
version: '3.8'
services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - STRIPE_SECRET_KEY=${STRIPE_SECRET_KEY}
      - REDIS_URL=${REDIS_URL}
    depends_on:
      - redis
      - db
  
  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
  
  db:
    image: postgres:15-alpine
    environment:
      - POSTGRES_DB=otsukisama
      - POSTGRES_USER=${DB_USER}
      - POSTGRES_PASSWORD=${DB_PASSWORD}
```

この実装ガイドに従うことで、高品質で拡張性のあるおつきさま診断LPが構築できます。既存のV2エンジンを活用しながら、新機能を効率的に追加できる設計となっています。