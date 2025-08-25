# 裏月相（Hidden Moon Phase）システム設計書

## 概要
おつきさま診断において、生年月日から算出される通常の月相に加えて「裏月相」を算出するシステム。裏月相は、その人の隠れた側面、潜在的な性格、無意識の行動パターンを表現する。

## 裏月相算出ロジック

### 基本アルゴリズム
```
裏月相 = (通常の月相 + 生月 + 生日の数字根) % 8
```

### 詳細計算手順

#### 1. 通常の月相を8段階に変換
```javascript
const moonPhaseIndex = getMoonPhaseIndex(birthDate); // 0-7の値
```

#### 2. 生月の数値（1-12）
```javascript
const birthMonth = birthDate.getMonth() + 1; // 1-12
```

#### 3. 生日の数字根計算
```javascript
function getDigitalRoot(day) {
    while (day >= 10) {
        day = Math.floor(day / 10) + (day % 10);
    }
    return day;
}
```

#### 4. 裏月相の決定
```javascript
function calculateHiddenMoonPhase(birthDate) {
    const normalPhaseIndex = getMoonPhaseIndex(birthDate);
    const birthMonth = birthDate.getMonth() + 1;
    const birthDay = birthDate.getDate();
    const dayRoot = getDigitalRoot(birthDay);
    
    // 裏月相インデックス計算
    const hiddenIndex = (normalPhaseIndex + birthMonth + dayRoot) % 8;
    
    return MOON_TYPES[hiddenIndex];
}
```

## 8つの月相タイプ
1. **新月** (0) - 始まりのエネルギー
2. **三日月** (1) - 成長の兆し
3. **上弦の月** (2) - 行動と決断
4. **十三夜** (3) - 調和と安定
5. **満月** (4) - 完全なる力
6. **十六夜** (5) - 成熟と余裕
7. **下弦の月** (6) - 整理と内省
8. **暁** (7) - 変化の前兆

## 裏月相の意味と機能

### 表の月相との関係性
- **表の月相**: 意識的な行動パターン、外向きの性格
- **裏の月相**: 無意識の行動パターン、内向きの性格、ストレス時の反応

### 心理学的根拠
- ユング心理学の「ペルソナ」と「影」の概念
- 表面的な性格と深層心理の二重性
- ストレス状況下での本能的反応パターン

## 活用シーン

### 1. 自己理解の深化
「普段は積極的なあなたですが、本当は慎重に考えてから行動したい気持ちも」

### 2. 恋愛関係での洞察
「相手が疲れている時には、あなたの裏の月相『十三夜』の包容力が現れます」

### 3. ストレス対処法
「プレッシャーを感じた時は、裏の月相『下弦の月』のように一度立ち止まって整理しましょう」

## データ構造設計

### HiddenMoonPhase クラス
```javascript
class HiddenMoonPhase {
    constructor(birthDate) {
        this.normalPhase = this.calculateNormalPhase(birthDate);
        this.hiddenPhase = this.calculateHiddenPhase(birthDate);
        this.relationship = this.analyzeRelationship();
    }
    
    calculateHiddenPhase(birthDate) {
        // 上記アルゴリズムの実装
    }
    
    analyzeRelationship() {
        // 表と裏の月相の関係性分析
    }
    
    getPersonalityInsight() {
        // 性格的洞察を生成
    }
    
    getStressResponse() {
        // ストレス反応パターンを生成
    }
}
```

## 実装上の考慮事項

### 1. 一意性の確保
- 同じ生年月日でも表と裏で異なる月相になるよう調整
- 特定の組み合わせに偏りが生じないよう分散化

### 2. 心理的納得性
- 占い結果として受け入れられる論理性
- 「当たってる」と感じられる具体性

### 3. プライバシー配慮
- 裏月相は深層心理を扱うため、デリケートな表現に注意
- ネガティブな側面も建設的なアドバイスとして提示

## テストケース

### 検証項目
1. **分布の均等性**: 各裏月相が適切に分散しているか
2. **表裏の関係性**: 表と裏が同じになる確率が適切か（理想は10-15%）
3. **月日の影響**: 同じ月相でも生月・生日によって裏月相が変わるか
4. **心理的妥当性**: ユーザーテストでの受容性

### サンプルデータ
```
生年月日: 1990/1/1 → 表: 新月, 裏: 十三夜
生年月日: 1990/1/15 → 表: 新月, 裏: 下弦の月  
生年月日: 1990/6/1 → 表: 新月, 裏: 三日月
```

## 今後の拡張可能性

### 1. 季節要素の追加
- 春夏秋冬の季節性を裏月相に反映
- 二十四節気との組み合わせ

### 2. 時刻要素の追加
- 生まれた時間帯による微調整
- 昼夜の区別による性格変化

### 3. 相性判定への応用
- 表同士、裏同士、表と裏のクロス相性
- より複雑で深い関係性分析

## 参考文献・根拠
- 月の満ち欠けと人間心理の関係性研究
- 占星術における月相の象徴的意味
- 心理学における無意識パターンの理論
- 日本の月待ち信仰と月相文化