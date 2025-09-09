/**
 * 日付ユーティリティクラス
 * 診断日をベースにした月計算ロジックを統一管理
 */
class DateUtils {
    /**
     * 診断日を取得（優先順位: グローバル変数 > URLパラメータ > 現在日時）
     * @returns {Date} 診断日
     */
    static getDiagnosisDate() {
        // グローバル診断日を優先的に使用
        if (window.globalDiagnosisDate) {
            return new Date(window.globalDiagnosisDate);
        }
        
        // URLパラメータから取得
        const urlParams = new URLSearchParams(window.location.search);
        const diagnosisDateParam = urlParams.get('diagnosisDate');
        
        if (diagnosisDateParam) {
            return new Date(diagnosisDateParam);
        }
        
        // フォールバック: 現在日時を使用
        return new Date();
    }
    
    /**
     * 診断日から指定月数後の月を取得
     * @param {number} monthsAfter - 何ヶ月後か
     * @returns {number} 月（1-12）
     */
    static getMonthAfter(monthsAfter) {
        const diagnosisDate = this.getDiagnosisDate();
        const futureDate = new Date(diagnosisDate);
        futureDate.setMonth(futureDate.getMonth() + monthsAfter);
        return futureDate.getMonth() + 1; // 0-indexed to 1-indexed
    }
    
    /**
     * 現在の月を取得（診断日ベース）
     * @returns {number} 月（1-12）
     */
    static getCurrentMonth() {
        return this.getMonthAfter(0);
    }
    
    /**
     * 月プレースホルダーを置換
     * @param {string} text - 置換対象のテキスト
     * @returns {string} 置換後のテキスト
     */
    static replaceMonthPlaceholders(text) {
        if (!text) return text;
        
        const diagnosisDate = this.getDiagnosisDate();
        const currentMonth = diagnosisDate.getMonth() + 1;
        const currentYear = diagnosisDate.getFullYear();
        
        // M（Xヶ月先）月 のパターンを置換
        text = text.replace(/M（(\d+)ヶ月先）月/g, (match, monthsAhead) => {
            const targetDate = new Date(currentYear, diagnosisDate.getMonth() + parseInt(monthsAhead), 1);
            return `${targetDate.getMonth() + 1}月`;
        });
        
        // M（今月）月 のパターンを置換
        text = text.replace(/M（今月）月/g, `${currentMonth}月`);
        
        // {MONTH+X} パターンも対応（将来の拡張用）
        text = text.replace(/\{MONTH\+(\d+)\}/g, (match, monthsAhead) => {
            return `${this.getMonthAfter(parseInt(monthsAhead))}月`;
        });
        
        // {MONTH} パターン（現在月）
        text = text.replace(/\{MONTH\}/g, `${currentMonth}月`);
        
        return text;
    }
    
    /**
     * 日付範囲を取得
     * @param {number} startMonthsAfter - 開始月（診断日から何ヶ月後）
     * @param {number} endMonthsAfter - 終了月（診断日から何ヶ月後）
     * @returns {Object} 開始日と終了日
     */
    static getDateRange(startMonthsAfter, endMonthsAfter) {
        const diagnosisDate = this.getDiagnosisDate();
        
        const startDate = new Date(diagnosisDate);
        startDate.setMonth(startDate.getMonth() + startMonthsAfter);
        
        const endDate = new Date(diagnosisDate);
        endDate.setMonth(endDate.getMonth() + endMonthsAfter);
        
        return {
            start: startDate,
            end: endDate,
            startMonth: startDate.getMonth() + 1,
            endMonth: endDate.getMonth() + 1,
            startYear: startDate.getFullYear(),
            endYear: endDate.getFullYear()
        };
    }
    
    /**
     * 診断日をフォーマット
     * @param {string} format - フォーマット文字列（例: 'YYYY年MM月DD日'）
     * @returns {string} フォーマット済みの日付
     */
    static formatDiagnosisDate(format = 'YYYY年MM月DD日') {
        const date = this.getDiagnosisDate();
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        
        return format
            .replace('YYYY', year)
            .replace('MM', month)
            .replace('DD', day);
    }
}

// グローバルに公開
window.DateUtils = DateUtils;