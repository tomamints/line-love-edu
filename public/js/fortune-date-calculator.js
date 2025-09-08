/**
 * 運勢用の日付計算ユーティリティ
 * 診断日から90日以内でランダムに具体的な日付を生成
 */

class FortuneDateCalculator {
    constructor() {
        this.baseDate = new Date();
    }

    /**
     * 診断日をセット
     */
    setBaseDate(date) {
        this.baseDate = new Date(date);
    }

    /**
     * ランダムな日付範囲を生成（開始日と終了日）
     * @param {number} minDays - 最小日数（診断日から何日後以降）
     * @param {number} maxDays - 最大日数（診断日から何日後まで）
     * @param {number} rangeDays - 範囲の日数（例：5日間）
     * @returns {Object} {start: Date, end: Date, startStr: string, endStr: string}
     */
    generateDateRange(minDays, maxDays, rangeDays = 5) {
        const randomStart = minDays + Math.floor(Math.random() * (maxDays - minDays - rangeDays));
        const startDate = new Date(this.baseDate);
        startDate.setDate(startDate.getDate() + randomStart);
        
        const endDate = new Date(startDate);
        endDate.setDate(endDate.getDate() + rangeDays);
        
        return {
            start: startDate,
            end: endDate,
            startStr: this.formatDate(startDate),
            endStr: this.formatDate(endDate),
            rangeStr: `${this.formatDate(startDate)}〜${this.formatDate(endDate)}`
        };
    }

    /**
     * 特定の月の日付範囲を生成
     * @param {number} monthsAhead - 何ヶ月先か（1, 2, 3）
     * @returns {Object} 
     */
    generateMonthlyDateRange(monthsAhead) {
        const targetMonth = new Date(this.baseDate);
        targetMonth.setMonth(targetMonth.getMonth() + monthsAhead);
        
        // その月の中でランダムな5日間を選択
        const maxDay = new Date(targetMonth.getFullYear(), targetMonth.getMonth() + 1, 0).getDate();
        const startDay = 1 + Math.floor(Math.random() * (maxDay - 5));
        
        const startDate = new Date(targetMonth.getFullYear(), targetMonth.getMonth(), startDay);
        const endDate = new Date(targetMonth.getFullYear(), targetMonth.getMonth(), startDay + 4);
        
        return {
            start: startDate,
            end: endDate,
            startStr: this.formatDate(startDate),
            endStr: this.formatDate(endDate),
            rangeStr: `${this.formatDate(startDate)}〜${this.formatDate(endDate)}`
        };
    }

    /**
     * M（Xヶ月先）月形式の文字列を具体的な日付に変換
     * @param {string} text - 変換対象のテキスト
     * @returns {string} 変換後のテキスト
     */
    replaceDatePlaceholders(text) {
        if (!text) return text;
        
        // M（1ヶ月先）月 → 具体的な月
        text = text.replace(/M（(\d+)ヶ月先）月/g, (match, monthsAhead) => {
            const targetDate = new Date(this.baseDate);
            targetDate.setMonth(targetDate.getMonth() + parseInt(monthsAhead));
            return `${targetDate.getMonth() + 1}月`;
        });
        
        // 来月の25日〜28日ごろ のような表現を生成
        text = text.replace(/来月の(\d+)日〜(\d+)日ごろ/g, (match, startDay, endDay) => {
            const nextMonth = new Date(this.baseDate);
            nextMonth.setMonth(nextMonth.getMonth() + 1);
            const monthName = `${nextMonth.getMonth() + 1}月`;
            return `${monthName}${startDay}日〜${endDay}日ごろ`;
        });
        
        return text;
    }

    /**
     * 日付をフォーマット（M月D日形式）
     */
    formatDate(date) {
        return `${date.getMonth() + 1}月${date.getDate()}日`;
    }

    /**
     * 運勢用の日付セットを生成
     * @returns {Object} 各種日付情報
     */
    generateFortuneDates() {
        const dates = {
            // 今月・来月・再来月
            currentMonth: this.baseDate.getMonth() + 1,
            nextMonth: new Date(this.baseDate.getFullYear(), this.baseDate.getMonth() + 1, 1).getMonth() + 1,
            monthAfterNext: new Date(this.baseDate.getFullYear(), this.baseDate.getMonth() + 2, 1).getMonth() + 1,
            monthIn3: new Date(this.baseDate.getFullYear(), this.baseDate.getMonth() + 3, 1).getMonth() + 1,
            
            // ランダムな期間（全体運用）
            overallPeriod1: this.generateDateRange(7, 30, 5),
            overallPeriod2: this.generateDateRange(31, 60, 5),
            overallPeriod3: this.generateDateRange(61, 90, 5),
            
            // 恋愛運用の日付
            loveMeeting: this.generateDateRange(60, 85, 3),
            loveChance: this.generateDateRange(45, 70, 5),
            loveWarning: this.generateDateRange(30, 50, 3),
            
            // 人間関係運用の日付
            relationshipNew: this.generateMonthlyDateRange(2),
            relationshipChallenge: this.generateDateRange(20, 40, 3),
            
            // 仕事運用の日付
            workTalent: this.generateMonthlyDateRange(1),
            workTurning: this.generateDateRange(35, 65, 7),
            
            // 金運用の日付
            moneyPeak: this.generateDateRange(70, 85, 5),
            moneyWarning: this.generateDateRange(10, 25, 3)
        };
        
        return dates;
    }
}

// グローバルに公開
window.FortuneDateCalculator = FortuneDateCalculator;