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
        // パターン1: "1月15日〜1月22日" または "10月の25日〜28日"
        const rangePattern = /(\d{1,2})月(?:の)?(\d{1,2})日[〜～~ー－](?:(\d{1,2})月(?:の)?)?(\d{1,2})日/g;
        // パターン2: "1月15日頃" または "1月15日ごろ" または "10月の25日〜28日ごろ"  
        const singlePattern = /(\d{1,2})月(?:の)?(\d{1,2})日(?:[〜～~ー－](\d{1,2})日)?[頃ごろ]/g;
        // パターン3: "1月中旬"
        const periodPattern = /(\d{1,2})月(上旬|中旬|下旬)/g;
        // パターン4: "今月末" "来月初め"
        const relativePattern = /(今月|来月|再来月)(初め|中頃|末)/g;
        // パターン5: "12月末まで" "12月までに"
        const monthEndPattern = /(\d{1,2})月(末)?まで(?:に)?/g;
        
        // パターン6: 単純な日付範囲 "14日〜16日" (月が省略されている場合)
        const simpleDayRangePattern = /(\d{1,2})日[〜～~ー－](\d{1,2})日/g;
        
        // パターン7: 単一の日付 "1月10日と1月25日"
        const singleDatePattern = /(\d{1,2})月(\d{1,2})日/g;
        
        let match;
        
        // 範囲の日付を抽出
        while ((match = rangePattern.exec(text)) !== null) {
            const startMonth = parseInt(match[1]);
            const startDay = parseInt(match[2]);
            // 終了月が省略されている場合は開始月と同じ
            const endMonth = match[3] ? parseInt(match[3]) : startMonth;
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
            const startDay = parseInt(match[2]);
            const endDay = match[3] ? parseInt(match[3]) : null;
            
            if (endDay) {
                // "25日〜28日ごろ"のパターン
                dates.push({
                    type: 'range',
                    start: this.createDate(month, startDay),
                    end: this.createDate(month, endDay),
                    category: category,
                    text: match[0],
                    importance: this.detectImportance(text, match.index)
                });
            } else {
                // "15日頃"のパターン
                const centerDate = this.createDate(month, startDay);
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
        
        // 月末パターンを抽出
        while ((match = monthEndPattern.exec(text)) !== null) {
            const month = parseInt(match[1]);
            const isMonthEnd = match[2] === '末';
            
            if (isMonthEnd) {
                const lastDay = this.getLastDayOfMonth(month);
                dates.push({
                    type: 'deadline',
                    start: this.createDate(month, lastDay - 5),
                    end: this.createDate(month, lastDay),
                    category: category,
                    text: match[0],
                    importance: this.detectImportance(text, match.index)
                });
            } else {
                // "○月までに"の場合は月全体
                dates.push({
                    type: 'deadline',
                    start: this.createDate(month, 1),
                    end: this.createDate(month, this.getLastDayOfMonth(month)),
                    category: category,
                    text: match[0],
                    importance: this.detectImportance(text, match.index)
                });
            }
        }
        
        // 単一の日付を抽出（"と"で区切られた複数の日付も含む）
        const processedSingleDates = new Set(); // 既に処理した日付を記録
        while ((match = singleDatePattern.exec(text)) !== null) {
            const month = parseInt(match[1]);
            const day = parseInt(match[2]);
            const dateKey = `${month}-${day}`;
            
            // 既に範囲で処理済みの日付はスキップ
            let alreadyInRange = false;
            for (const existingDate of dates) {
                if (existingDate.type === 'range' && 
                    existingDate.start.getMonth() + 1 === month &&
                    existingDate.start.getDate() <= day && 
                    existingDate.end.getDate() >= day) {
                    alreadyInRange = true;
                    break;
                }
            }
            
            if (!alreadyInRange && !processedSingleDates.has(dateKey)) {
                processedSingleDates.add(dateKey);
                const date = this.createDate(month, day);
                dates.push({
                    type: 'single',
                    start: date,
                    end: date,
                    category: category,
                    text: match[0],
                    importance: this.detectImportance(text, match.index)
                });
            }
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
        // SVGアイコンを使用（TailwindCSSクラス - 視覚的サイズを統一）
        const icons = {
            love: `<svg class="w-4 h-4 inline-block align-middle text-pink-500" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
            </svg>`,
            relationship: `<svg class="w-4 h-4 inline-block align-middle text-blue-600" fill="currentColor" viewBox="0 0 24 24">
                <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z"/>
            </svg>`,
            career: `<svg class="w-4 h-4 inline-block align-middle text-orange-600" fill="currentColor" viewBox="0 0 24 24">
                <path d="M20 6h-4V4c0-1.11-.89-2-2-2h-4c-1.11 0-2 .89-2 2v2H4c-1.11 0-1.99.89-1.99 2L2 19c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V8c0-1.11-.89-2-2-2zm-6 0h-4V4h4v2z"/>
            </svg>`,
            money: `<svg class="w-4 h-4 inline-block align-middle text-yellow-500" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1.41 16.09V20h-2.67v-1.93c-1.71-.36-3.16-1.46-3.27-3.4h1.96c.1 1.05.82 1.87 2.65 1.87 1.96 0 2.4-.98 2.4-1.59 0-.83-.44-1.61-2.67-2.14-2.48-.6-4.18-1.62-4.18-3.67 0-1.72 1.39-2.84 3.11-3.21V4h2.67v1.95c1.86.45 2.79 1.86 2.85 3.39H14.3c-.05-1.11-.64-1.87-2.22-1.87-1.5 0-2.4.68-2.4 1.64 0 .84.65 1.39 2.67 1.91s4.18 1.39 4.18 3.91c-.01 1.83-1.38 2.83-3.12 3.16z"/>
            </svg>`,
            overall: `<svg class="w-4 h-4 inline-block align-middle text-purple-600" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
            </svg>`
        };
        
        return icons[category] || '<span class="w-4 h-4 inline-block align-middle text-center text-xs font-bold text-pink-500">●</span>';
    }
}

// グローバルに公開
window.FortuneDateExtractor = FortuneDateExtractor;