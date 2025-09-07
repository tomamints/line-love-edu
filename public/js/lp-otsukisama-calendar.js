/**
 * カレンダー生成関連の関数
 */

let calendarPatternsData = null;

// カレンダーパターンデータを読み込む
async function loadCalendarPatterns() {
    try {
        const response = await fetch('data/moon-calendar-patterns-complete.json');
        const data = await response.json();
        calendarPatternsData = data.patterns;
        console.log('Calendar patterns loaded:', Object.keys(calendarPatternsData).length, 'patterns');
        return true;
    } catch (error) {
        console.error('Failed to load calendar patterns:', error);
        return false;
    }
}

// パターンIDからカレンダーデータを取得
function getCalendarPattern(patternId) {
    if (!calendarPatternsData) {
        console.error('Calendar patterns not loaded');
        return null;
    }
    
    const pattern = calendarPatternsData[String(patternId)];
    if (!pattern) {
        console.error('Calendar pattern not found for ID:', patternId);
        return null;
    }
    
    return pattern;
}

// カレンダー生成関数（2ヶ月分）
async function generatePersonalizedCalendar(providedPatternId) {
    const container = document.getElementById('personalizedCalendar');
    const messageElement = document.getElementById('calendarMessage');
    const monthYearElement = document.getElementById('calendarMonthYear');
    
    console.log('[Calendar] Starting generation for pattern:', providedPatternId);
    console.log('[Calendar] Container element:', container);
    console.log('[Calendar] Message element:', messageElement);
    console.log('[Calendar] MonthYear element:', monthYearElement);
    
    if (!container) {
        console.error('[Calendar] Container not found: personalizedCalendar');
        return;
    }
    
    // カレンダーパターンデータが読み込まれていない場合は読み込む
    if (!calendarPatternsData) {
        console.log('[Calendar] Loading calendar patterns...');
        const loaded = await loadCalendarPatterns();
        if (!loaded) {
            console.error('[Calendar] Failed to load calendar patterns');
            return;
        }
    }
    
    // パターンIDを決定（引数で渡されていればそれを使用）
    let numericPatternId = providedPatternId;
    if (numericPatternId === undefined || numericPatternId === null) {
        // フォームから生年月日を取得（デモ用にデフォルト値を設定）
        const birthYear = parseInt(document.getElementById('year')?.value) || 1990;
        const birthMonth = parseInt(document.getElementById('month')?.value) || 7;
        const birthDay = parseInt(document.getElementById('day')?.value) || 15;
        
        // ユーザーの月相を計算
        numericPatternId = generatePatternId(birthYear, birthMonth, birthDay);
    }
    
    console.log('[Calendar] Looking for pattern ID:', numericPatternId);
    const patternData = getCalendarPattern(numericPatternId);
    
    if (!patternData) {
        console.error('[Calendar] No calendar pattern found for pattern ID:', numericPatternId);
        console.log('[Calendar] Available patterns:', calendarPatternsData ? Object.keys(calendarPatternsData) : 'none');
        return;
    }
    console.log('[Calendar] Pattern data found:', patternData);
    console.log('[Calendar] Lucky days:', patternData.lucky_days);
    console.log('[Calendar] Power days:', patternData.power_days);
    console.log('[Calendar] Caution days:', patternData.caution_days);
    
    // メッセージを表示
    if (messageElement) {
        messageElement.textContent = patternData.monthly_message;
        console.log('[Calendar] Message set:', patternData.monthly_message);
    }
    
    // 現在の月の情報を取得
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth();
    
    console.log('[Calendar] Current date:', currentYear, currentMonth + 1);
    
    // 2ヶ月分のカレンダーを生成
    const monthNames = ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'];
    
    // 月の範囲を表示
    const nextMonth = (currentMonth + 1) % 12;
    const nextYear = currentMonth === 11 ? currentYear + 1 : currentYear;
    
    if (monthYearElement) {
        monthYearElement.textContent = `${currentYear}年 ${monthNames[currentMonth]} - ${nextYear}年 ${monthNames[nextMonth]}`;
    }
    
    // カレンダーコンテナの内容を完全に再構築
    // 1ヶ月目のグリッド、2ヶ月目のヘッダー、2ヶ月目のグリッドという構造にする
    let monthsHTML = [];
    
    // 2ヶ月分のカレンダーを生成
    for (let monthOffset = 0; monthOffset < 2; monthOffset++) {
        const targetMonth = (currentMonth + monthOffset) % 12;
        const targetYear = currentMonth + monthOffset >= 12 ? currentYear + 1 : currentYear;
        const daysInMonth = new Date(targetYear, targetMonth + 1, 0).getDate();
        const firstDayOfMonth = new Date(targetYear, targetMonth, 1).getDay();
        
        let monthHTML = '';
        
        // 月初めまでの空白
        for (let i = 0; i < firstDayOfMonth; i++) {
            monthHTML += '<div class="calendar-day empty"></div>';
        }
        
        // 各日付
        for (let day = 1; day <= daysInMonth; day++) {
            const date = new Date(targetYear, targetMonth, day);
            const moonAge = calculateMoonAge(date);
            const moonEmoji = getMoonEmoji(moonAge);
            
            let dayClass = 'calendar-day';
            let specialMark = '';
            let specialMessage = '';
            
            // ラッキーデーをチェック
            if (patternData.lucky_days && patternData.lucky_days.includes(day)) {
                dayClass += ' lucky-day';
            }
            
            // パワーデーをチェック
            if (patternData.power_days && patternData.power_days.includes(day)) {
                dayClass += ' power-day';
            }
            
            // 注意日をチェック
            if (patternData.caution_days && patternData.caution_days.includes(day)) {
                dayClass += ' caution-day';
            }
            
            // 特別な日のマークとメッセージ
            if (patternData.special_marks && patternData.special_marks[String(day)]) {
                const special = patternData.special_marks[String(day)];
                specialMark = special.mark;
                specialMessage = `<div class="special-message">${special.message}</div>`;
                dayClass += ' special-day';
            }
            
            // 今日の日付をハイライト
            if (day === currentDate.getDate() && targetMonth === currentDate.getMonth() && targetYear === currentDate.getFullYear()) {
                dayClass += ' today';
            }
            
            monthHTML += `
                <div class="${dayClass}" data-day="${day}" data-month="${targetMonth}" data-year="${targetYear}" style="aspect-ratio: 1; min-height: 60px; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 5px;">
                    <div class="day-content" style="text-align: center;">
                        <span class="day-number" style="display: block; font-size: 14px; margin-bottom: 2px;">${day}</span>
                        <span class="moon-emoji" style="display: block; font-size: 16px;">${moonEmoji}</span>
                        ${specialMark ? `<span class="special-mark" style="display: block; font-size: 12px; margin-top: 2px;">${specialMark}</span>` : ''}
                    </div>
                    ${specialMessage}
                </div>
            `;
        }
        
        // 月末以降の空白を追加（7日で割り切れるように）
        const totalCells = firstDayOfMonth + daysInMonth;
        const remainingCells = 7 - (totalCells % 7);
        if (remainingCells < 7) {
            for (let i = 0; i < remainingCells; i++) {
                monthHTML += '<div class="calendar-day empty" style="aspect-ratio: 1; min-height: 60px;"></div>';
            }
        }
        
        monthsHTML.push({
            year: targetYear,
            month: targetMonth,
            monthName: monthNames[targetMonth],
            html: monthHTML
        });
    }
    
    // 全体のHTMLを構築
    let fullHTML = '';
    
    // 1ヶ月目のラッパー
    fullHTML += '<div class="calendar-wrapper">';
    
    // 1ヶ月目のヘッダー
    fullHTML += `<div class="month-header">${monthsHTML[0].year}年 ${monthsHTML[0].monthName}</div>`;
    
    // 1ヶ月目の曜日行
    fullHTML += `
        <div class="weekday-header">
            <div class="weekday">日</div>
            <div class="weekday">月</div>
            <div class="weekday">火</div>
            <div class="weekday">水</div>
            <div class="weekday">木</div>
            <div class="weekday">金</div>
            <div class="weekday">土</div>
        </div>
    `;
    
    // 1ヶ月目のグリッド
    fullHTML += '<div class="calendar-grid">';
    fullHTML += monthsHTML[0].html;
    fullHTML += '</div>';
    fullHTML += '</div>'; // calendar-wrapper を閉じる
    
    // 2ヶ月目のラッパー
    fullHTML += '<div class="calendar-wrapper" style="margin-top: 30px;">';
    
    // 2ヶ月目のヘッダー
    fullHTML += `<div class="month-header">${monthsHTML[1].year}年 ${monthsHTML[1].monthName}</div>`;
    
    // 2ヶ月目の曜日行
    fullHTML += `
        <div class="weekday-header">
            <div class="weekday">日</div>
            <div class="weekday">月</div>
            <div class="weekday">火</div>
            <div class="weekday">水</div>
            <div class="weekday">木</div>
            <div class="weekday">金</div>
            <div class="weekday">土</div>
        </div>
    `;
    
    // 2ヶ月目のグリッド
    fullHTML += '<div class="calendar-grid">';
    fullHTML += monthsHTML[1].html;
    fullHTML += '</div>';
    fullHTML += '</div>'; // calendar-wrapper を閉じる
    
    // カレンダーのセルのみを更新
    container.innerHTML = fullHTML;
    console.log('[Calendar] Calendar HTML inserted, length:', fullHTML.length);
    console.log('[Calendar] Container now has children:', container.children.length);
}

// 月齢から月の絵文字を取得
function getMoonEmoji(moonAge) {
    if (moonAge <= 1.5) return '🌑'; // 新月
    else if (moonAge <= 5.5) return '🌒'; // 三日月
    else if (moonAge <= 9.5) return '🌓'; // 上弦
    else if (moonAge <= 13.5) return '🌔'; // 十三夜
    else if (moonAge <= 16.5) return '🌕'; // 満月
    else if (moonAge <= 20.5) return '🌖'; // 十六夜
    else if (moonAge <= 24.5) return '🌗'; // 下弦
    else if (moonAge <= 28.5) return '🌘'; // 暁
    else return '🌑'; // 新月に戻る
}

// 月齢を計算する関数（簡易版）
function calculateMoonAge(date) {
    // 基準となる新月の日付（2000年1月6日）
    const baseNewMoon = new Date(2000, 0, 6, 18, 14);
    const lunarCycle = 29.530588853; // 朔望月の日数
    
    const daysSinceBase = (date - baseNewMoon) / (1000 * 60 * 60 * 24);
    const moonAge = daysSinceBase % lunarCycle;
    
    return moonAge >= 0 ? moonAge : moonAge + lunarCycle;
}

// ページ読み込み時にカレンダーパターンデータを読み込む
document.addEventListener('DOMContentLoaded', () => {
    loadCalendarPatterns();
});