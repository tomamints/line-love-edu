// おつきさま診断 データローダー
// JSONファイルからデータを読み込むモジュール

class OtsukisamaDataLoader {
    constructor() {
        this.patternsData = null;
        this.threePowersData = null;
        this.personalityAxesData = null;
        this.moonPhaseData = null;
        this.hiddenPhaseData = null;
        this.uiTexts = null;
        this.loaded = false;
    }

    // すべてのデータを読み込む
    async loadAllData() {
        try {
            const [personalityAxes, moonPhases, hiddenPhases, uiTexts] = await Promise.all([
                fetch('../data/personality-axes-descriptions.json').then(r => r.json()),
                fetch('../data/moon-phase-descriptions.json').then(r => r.json()),
                fetch('../data/hidden-phase-descriptions.json').then(r => r.json()),
                fetch('../data/ui-texts.json').then(r => r.json())
            ]);

            // 基本的なパターンデータを生成（月相の組み合わせのみ）
            this.patternsData = this.generateBasicPatterns();
            this.threePowersData = {}; // 空のオブジェクトに設定（three-powersは使用しない）
            this.personalityAxesData = personalityAxes;
            this.moonPhaseData = moonPhases;
            this.hiddenPhaseData = hiddenPhases;
            this.uiTexts = uiTexts;
            this.loaded = true;

            console.log('All data loaded successfully');
            return true;
        } catch (error) {
            console.error('Failed to load data:', error);
            return false;
        }
    }
    
    // 基本的なパターンデータを生成
    generateBasicPatterns() {
        const moonPhases = ['新月', '三日月', '上弦の月', '満月寄りの月', '満月', '欠けていく月', '下弦の月', '鎮静の月'];
        const patterns = {};
        
        // 64パターンを生成（8x8の組み合わせ）
        for (let i = 0; i < 64; i++) {
            const mainPhaseIndex = Math.floor(i / 8);
            const hiddenPhaseIndex = i % 8;
            
            patterns[i] = {
                moonPhase: moonPhases[mainPhaseIndex],
                hiddenPhase: moonPhases[hiddenPhaseIndex]
            };
        }
        
        return patterns;
    }

    // パターンIDから運勢データを取得
    async getPatternFortune(patternId) {
        if (!this.loaded || !this.patternsData) {
            console.error('Data not loaded yet');
            return null;
        }

        // 統一されたパターンデータから取得
        const pattern = this.patternsData[String(patternId)];
        if (!pattern) {
            console.error(`Pattern ${patternId} not found`);
            return null;
        }

        return pattern;
    }

    // 月相から3つの力を取得
    getThreePowers(moonPhase) {
        if (!this.loaded || !this.threePowersData) {
            console.error('Data not loaded yet');
            return [];
        }

        return this.threePowersData[moonPhase] || [];
    }

    // パターンIDから3つの力を取得（組み合わせバージョン）
    getPatternThreePowers(patternId) {
        const pattern = this.getPatternFortune(patternId);
        if (!pattern) return [];

        const mainPowers = this.getThreePowers(pattern.moonPhase);
        const hiddenPowers = this.getThreePowers(pattern.hiddenPhase);

        // パターンに応じて力を組み合わせる
        // デフォルト: メイン月相から1つ目、裏月相から1つ目と2つ目
        return [
            mainPowers[0],
            hiddenPowers[0],
            hiddenPowers[1] || mainPowers[1]
        ].filter(Boolean);
    }

    // 性格軸の説明を取得
    getPersonalityAxisDescription(axisType, value) {
        if (!this.loaded || !this.personalityAxesData) {
            console.error('Data not loaded yet');
            return null;
        }

        const axis = this.personalityAxesData[axisType];
        if (!axis) {
            console.error(`Axis ${axisType} not found`);
            return null;
        }

        return axis[value] || null;
    }

    // 月相の説明を取得
    getMoonPhaseDescription(phase) {
        if (!this.loaded || !this.moonPhaseData) {
            console.error('Data not loaded yet');
            return null;
        }

        return this.moonPhaseData[phase] || null;
    }

    // 裏月相の説明を取得
    getHiddenPhaseDescription(phase) {
        if (!this.loaded || !this.hiddenPhaseData) {
            console.error('Data not loaded yet');
            return null;
        }

        return this.hiddenPhaseData[phase] || null;
    }

    // UIテキストを取得
    getUIText(key) {
        if (!this.loaded || !this.uiTexts) {
            console.error('Data not loaded yet');
            return key; // フォールバック
        }

        // ネストされたキーに対応（例: "buttons.submit"）
        const keys = key.split('.');
        let value = this.uiTexts;
        
        for (const k of keys) {
            value = value[k];
            if (!value) return key; // フォールバック
        }

        return value;
    }

    // データがロード済みか確認
    isLoaded() {
        return this.loaded;
    }
}

// シングルトンインスタンスを作成
const dataLoader = new OtsukisamaDataLoader();

// グローバルに公開
window.OtsukisamaDataLoader = dataLoader;

// 旧APIとの互換性のために関数を公開
window.getPatternContent = function(patternId) {
    return dataLoader.getPatternFortune(patternId);
};

window.getMoonPowers = function(moonPhase) {
    return dataLoader.getThreePowers(moonPhase);
};

// ページ読み込み時に自動でデータをロード
document.addEventListener('DOMContentLoaded', async () => {
    await dataLoader.loadAllData();
    
    // データロード完了イベントを発火
    window.dispatchEvent(new CustomEvent('otsukisama-data-loaded', {
        detail: { loader: dataLoader }
    }));
});