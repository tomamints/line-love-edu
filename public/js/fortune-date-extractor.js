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
        // SVGアイコンを使用（TailwindCSSクラス - サイズを大きく調整）
        const icons = {
            love: `<svg class="w-4 h-4 inline-block align-middle text-pink-500" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clip-rule="evenodd"/>
            </svg>`,
            relationship: `<svg class="w-4 h-4 inline-block align-middle text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z"/>
            </svg>`,
            career: `<svg class="w-4 h-4 inline-block align-middle text-orange-600" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M6 6V5a3 3 0 013-3h2a3 3 0 013 3v1h2a2 2 0 012 2v3.57A22.952 22.952 0 0110 13a22.95 22.95 0 01-8-1.43V8a2 2 0 012-2h2zm2-1a1 1 0 011-1h2a1 1 0 011 1v1H8V5zm1 5a1 1 0 011-1h.01a1 1 0 110 2H10a1 1 0 01-1-1z" clip-rule="evenodd"/>
                <path d="M2 13.692V16a2 2 0 002 2h12a2 2 0 002-2v-2.308A24.974 24.974 0 0110 15c-2.796 0-5.487-.46-8-1.308z"/>
            </svg>`,
            money: `<svg class="w-4 h-4 inline-block align-middle text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z"/>
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clip-rule="evenodd"/>
            </svg>`,
            overall: `<svg class="w-4 h-4 inline-block align-middle text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
            </svg>`
        };
        
        return icons[category] || '<span class="w-4 h-4 inline-block align-middle text-center text-xs font-bold text-pink-500">●</span>';
    }
}

// グローバルに公開
window.FortuneDateExtractor = FortuneDateExtractor;