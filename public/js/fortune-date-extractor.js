/**
 * 診断文章から日付を抽出してカレンダー用データを生成
 */

class FortuneDateExtractor {
    constructor() {
        this.extractedDates = {
            love: [],
            relationship: [],
            career: [],
            money: [],
            overall: []
        };
    }

    /**
     * テキストから日付範囲を抽出
     * @param {string} text - 診断テキスト
     * @param {string} category - カテゴリ（love, career等）
     * @returns {Array} 抽出された日付情報
     */
    extractDatesFromText(text, category) {
        if (!text) return [];
        
        const dates = [];
        const currentYear = new Date().getFullYear();
        
        // 日付パターンのマッチング
        // パターン1: "1月15日〜1月22日"
        const rangePattern = /(\d{1,2})月(\d{1,2})日[〜～~ー－](\d{1,2})月(\d{1,2})日/g;
        // パターン2: "1月15日頃" または "1月15日ごろ"
        const singlePattern = /(\d{1,2})月(\d{1,2})日[頃ごろ]/g;
        // パターン3: "1月中旬"
        const periodPattern = /(\d{1,2})月(上旬|中旬|下旬)/g;
        // パターン4: "今月末" "来月初め"
        const relativePattern = /(今月|来月|再来月)(初め|中頃|末)/g;
        
        let match;
        
        // 範囲の日付を抽出
        while ((match = rangePattern.exec(text)) !== null) {
            const startMonth = parseInt(match[1]);
            const startDay = parseInt(match[2]);
            const endMonth = parseInt(match[3]);
            const endDay = parseInt(match[4]);
            
            dates.push({
                type: 'range',
                start: this.createDate(startMonth, startDay),
                end: this.createDate(endMonth, endDay),
                category: category,
                text: match[0],
                importance: this.detectImportance(text, match.index)
            });
        }
        
        // 単一の日付を抽出（頃）
        while ((match = singlePattern.exec(text)) !== null) {
            const month = parseInt(match[1]);
            const day = parseInt(match[2]);
            
            // "頃"の場合は前後3日の範囲とする
            const centerDate = this.createDate(month, day);
            const startDate = new Date(centerDate);
            startDate.setDate(startDate.getDate() - 3);
            const endDate = new Date(centerDate);
            endDate.setDate(endDate.getDate() + 3);
            
            dates.push({
                type: 'around',
                center: centerDate,
                start: startDate,
                end: endDate,
                category: category,
                text: match[0],
                importance: this.detectImportance(text, match.index)
            });
        }
        
        // 期間の日付を抽出（上旬・中旬・下旬）
        while ((match = periodPattern.exec(text)) !== null) {
            const month = parseInt(match[1]);
            const period = match[2];
            
            let startDay, endDay;
            switch(period) {
                case '上旬':
                    startDay = 1;
                    endDay = 10;
                    break;
                case '中旬':
                    startDay = 11;
                    endDay = 20;
                    break;
                case '下旬':
                    startDay = 21;
                    endDay = this.getLastDayOfMonth(month);
                    break;
            }
            
            dates.push({
                type: 'period',
                start: this.createDate(month, startDay),
                end: this.createDate(month, endDay),
                category: category,
                text: match[0],
                importance: this.detectImportance(text, match.index)
            });
        }
        
        // 相対的な日付を抽出
        while ((match = relativePattern.exec(text)) !== null) {
            const currentDate = new Date();
            const currentMonth = currentDate.getMonth() + 1;
            let targetMonth = currentMonth;
            
            switch(match[1]) {
                case '今月':
                    targetMonth = currentMonth;
                    break;
                case '来月':
                    targetMonth = currentMonth + 1;
                    break;
                case '再来月':
                    targetMonth = currentMonth + 2;
                    break;
            }
            
            // 12月を超えた場合の処理
            if (targetMonth > 12) {
                targetMonth = targetMonth - 12;
            }
            
            let startDay, endDay;
            switch(match[2]) {
                case '初め':
                    startDay = 1;
                    endDay = 10;
                    break;
                case '中頃':
                    startDay = 11;
                    endDay = 20;
                    break;
                case '末':
                    startDay = 21;
                    endDay = this.getLastDayOfMonth(targetMonth);
                    break;
            }
            
            dates.push({
                type: 'relative',
                start: this.createDate(targetMonth, startDay),
                end: this.createDate(targetMonth, endDay),
                category: category,
                text: match[0],
                importance: this.detectImportance(text, match.index)
            });
        }
        
        return dates;
    }
    
    /**
     * 重要度を検出
     */
    detectImportance(text, position) {
        // 前後50文字を取得
        const context = text.substring(Math.max(0, position - 50), Math.min(text.length, position + 50));
        
        // 重要度の高いキーワード
        const highImportanceKeywords = [
            '絶好調', '最高', 'ベスト', '大チャンス', '運命', '特別',
            '最適', '理想的', 'パワー', '絶好の'
        ];
        
        const mediumImportanceKeywords = [
            '良い', '好調', 'チャンス', '吉', '幸運', '順調',
            '期待', '可能性', '向上'
        ];
        
        for (const keyword of highImportanceKeywords) {
            if (context.includes(keyword)) {
                return 'high';
            }
        }
        
        for (const keyword of mediumImportanceKeywords) {
            if (context.includes(keyword)) {
                return 'medium';
            }
        }
        
        return 'normal';
    }
    
    /**
     * 月と日から日付オブジェクトを作成
     */
    createDate(month, day) {
        const currentDate = new Date();
        const currentMonth = currentDate.getMonth() + 1;
        let year = currentDate.getFullYear();
        
        // 現在月より前の月の場合は来年とする
        if (month < currentMonth) {
            year++;
        }
        
        return new Date(year, month - 1, day);
    }
    
    /**
     * 指定月の最終日を取得
     */
    getLastDayOfMonth(month) {
        const year = new Date().getFullYear();
        return new Date(year, month, 0).getDate();
    }
    
    /**
     * すべての診断テキストから日付を抽出
     */
    extractAllDates(fortuneData) {
        this.extractedDates = {
            love: [],
            relationship: [],
            career: [],
            money: [],
            overall: []
        };
        
        // 各カテゴリのテキストから日付を抽出
        if (fortuneData.love?.text) {
            this.extractedDates.love = this.extractDatesFromText(fortuneData.love.text, 'love');
        }
        
        if (fortuneData.relationship?.text) {
            this.extractedDates.relationship = this.extractDatesFromText(fortuneData.relationship.text, 'relationship');
        }
        
        if (fortuneData.career?.text) {
            this.extractedDates.career = this.extractDatesFromText(fortuneData.career.text, 'career');
        }
        
        if (fortuneData.money?.text) {
            this.extractedDates.money = this.extractDatesFromText(fortuneData.money.text, 'money');
        }
        
        if (fortuneData.overall?.text) {
            this.extractedDates.overall = this.extractDatesFromText(fortuneData.overall.text, 'overall');
        }
        
        return this.extractedDates;
    }
    
    /**
     * 特定の日付がラッキーデーかどうかを判定
     */
    isLuckyDay(date) {
        const dateStr = date.toDateString();
        const luckyInfo = {
            categories: [],
            importance: 'normal',
            descriptions: []
        };
        
        // 各カテゴリの日付をチェック
        for (const [category, dates] of Object.entries(this.extractedDates)) {
            for (const dateInfo of dates) {
                const startStr = dateInfo.start.toDateString();
                const endStr = dateInfo.end.toDateString();
                
                // 日付範囲内かチェック
                if (date >= dateInfo.start && date <= dateInfo.end) {
                    luckyInfo.categories.push(category);
                    luckyInfo.descriptions.push(dateInfo.text);
                    
                    // 重要度を更新（より高い重要度を採用）
                    if (dateInfo.importance === 'high' || 
                        (dateInfo.importance === 'medium' && luckyInfo.importance === 'normal')) {
                        luckyInfo.importance = dateInfo.importance;
                    }
                }
            }
        }
        
        return luckyInfo.categories.length > 0 ? luckyInfo : null;
    }
    
    /**
     * カレンダー用のアイコンを取得
     */
    getCalendarIcon(category, importance) {
        const icons = {
            love: '💕',
            relationship: '👥', 
            career: '💼',
            money: '💰',
            overall: '✨'
        };
        
        // 重要度が高い場合は特別なアイコン
        if (importance === 'high') {
            return '💫';
        }
        
        return icons[category] || '🌟';
    }
}

// グローバルに公開
window.FortuneDateExtractor = FortuneDateExtractor;