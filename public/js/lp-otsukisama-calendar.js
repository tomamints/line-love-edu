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
    const monthYearElement = document.getElementById('calendarMonthYear');
    
    console.log('[Calendar] Starting generation for pattern:', providedPatternId);
    
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
        return;
    }
    console.log('[Calendar] Pattern data found:', patternData);
    
    // 現在の月の情報を取得
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth();
    
    // 月の名前
    const monthNames = ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'];
    
    // 月の範囲を表示
    const nextMonth = (currentMonth + 1) % 12;
    const nextYear = currentMonth === 11 ? currentYear + 1 : currentYear;
    
    if (monthYearElement) {
        monthYearElement.textContent = `${currentYear}年 ${monthNames[currentMonth]} - ${nextYear}年 ${monthNames[nextMonth]}`;
    }
    
    // カレンダーHTMLを構築
    let calendarHTML = `
        <style>
            .calendar-container {
                padding: 20px;
                background: rgba(30, 25, 60, 0.95);
                border-radius: 15px;
                margin: 0 auto;
                max-width: 100%;
            }
            
            .calendar-message {
                color: #ffd700;
                text-align: center;
                margin-bottom: 30px;
                font-size: 18px;
                font-weight: bold;
                text-shadow: 1px 1px 3px rgba(0,0,0,0.5);
            }
            
            .month-calendar {
                margin-bottom: 40px;
            }
            
            .month-header {
                color: #ffd700;
                font-size: 20px;
                font-weight: bold;
                text-align: center;
                margin-bottom: 15px;
                text-shadow: 1px 1px 3px rgba(0,0,0,0.5);
            }
            
            .calendar-grid {
                display: grid;
                grid-template-columns: repeat(7, 1fr);
                gap: 5px;
                margin-bottom: 20px;
            }
            
            .weekday {
                text-align: center;
                color: #ffd700;
                font-size: 14px;
                font-weight: bold;
                padding: 10px 0;
            }
            
            .weekday.sunday {
                color: #ff9999;
            }
            
            .weekday.saturday {
                color: #9999ff;
            }
            
            .calendar-day {
                aspect-ratio: 1;
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                background: rgba(138, 97, 250, 0.1);
                border: 1px solid rgba(138, 97, 250, 0.3);
                border-radius: 10px;
                padding: 5px;
                position: relative;
                transition: all 0.3s;
                min-height: 60px;
            }
            
            .calendar-day:hover {
                background: rgba(255, 215, 0, 0.2);
                transform: scale(1.05);
            }
            
            .calendar-day.empty {
                background: transparent;
                border: none;
            }
            
            .calendar-day.empty:hover {
                transform: none;
                background: transparent;
            }
            
            .calendar-day.lucky {
                background: linear-gradient(135deg, rgba(255, 215, 0, 0.3), rgba(255, 215, 0, 0.2));
                border: 2px solid #ffd700;
            }
            
            .calendar-day.power {
                background: linear-gradient(135deg, rgba(147, 112, 219, 0.3), rgba(147, 112, 219, 0.2));
                border: 2px solid #9370DB;
            }
            
            .calendar-day.caution {
                background: rgba(255, 100, 100, 0.2);
                border: 2px solid rgba(255, 100, 100, 0.5);
            }
            
            .calendar-day.today {
                background: rgba(138, 97, 250, 0.4);
                border: 3px solid #8a61fa;
                box-shadow: 0 0 10px rgba(138, 97, 250, 0.5);
            }
            
            .day-number {
                color: #ffffff;
                font-size: 16px;
                font-weight: bold;
                margin-bottom: 2px;
            }
            
            .moon-phase {
                font-size: 20px;
            }
            
            .special-mark {
                position: absolute;
                top: 2px;
                right: 2px;
                font-size: 12px;
            }
            
            .special-tooltip {
                position: absolute;
                bottom: -25px;
                left: 50%;
                transform: translateX(-50%);
                background: rgba(0, 0, 0, 0.9);
                color: #ffd700;
                padding: 5px 10px;
                border-radius: 5px;
                font-size: 11px;
                white-space: nowrap;
                z-index: 10;
                display: none;
            }
            
            .calendar-day:hover .special-tooltip {
                display: block;
            }
            
            .calendar-legend {
                display: flex;
                justify-content: center;
                gap: 30px;
                margin-top: 20px;
                flex-wrap: wrap;
            }
            
            .legend-item {
                display: flex;
                align-items: center;
                gap: 8px;
                color: #ffffff;
                font-size: 14px;
            }
            
            .legend-dot {
                width: 16px;
                height: 16px;
                border-radius: 50%;
                display: inline-block;
            }
            
            .legend-dot.lucky {
                background: #ffd700;
            }
            
            .legend-dot.power {
                background: #9370DB;
            }
            
            .legend-dot.caution {
                background: rgba(255, 100, 100, 0.8);
            }
            
            @media (max-width: 768px) {
                .calendar-grid {
                    gap: 2px;
                }
                
                .calendar-day {
                    min-height: 50px;
                }
                
                .day-number {
                    font-size: 14px;
                }
                
                .moon-phase {
                    font-size: 16px;
                }
                
                .weekday {
                    font-size: 12px;
                    padding: 5px 0;
                }
            }
        </style>
        <div class="calendar-container">
    `;
    
    // メッセージを追加
    if (patternData.monthly_message) {
        calendarHTML += `<div class="calendar-message">${patternData.monthly_message}</div>`;
    }
    
    // 2ヶ月分のカレンダーを生成
    for (let monthOffset = 0; monthOffset < 2; monthOffset++) {
        const targetMonth = (currentMonth + monthOffset) % 12;
        const targetYear = currentMonth + monthOffset >= 12 ? currentYear + 1 : currentYear;
        const daysInMonth = new Date(targetYear, targetMonth + 1, 0).getDate();
        const firstDayOfMonth = new Date(targetYear, targetMonth, 1).getDay();
        
        calendarHTML += `<div class="month-calendar">`;
        calendarHTML += `<div class="month-header">${targetYear}年 ${monthNames[targetMonth]}</div>`;
        calendarHTML += `<div class="calendar-grid">`;
        
        // 曜日ヘッダー
        const weekdays = ['日', '月', '火', '水', '木', '金', '土'];
        for (let i = 0; i < 7; i++) {
            let weekdayClass = 'weekday';
            if (i === 0) weekdayClass += ' sunday';
            if (i === 6) weekdayClass += ' saturday';
            calendarHTML += `<div class="${weekdayClass}">${weekdays[i]}</div>`;
        }
        
        // 月初めまでの空白
        for (let i = 0; i < firstDayOfMonth; i++) {
            calendarHTML += '<div class="calendar-day empty"></div>';
        }
        
        // 各日付
        for (let day = 1; day <= daysInMonth; day++) {
            const date = new Date(targetYear, targetMonth, day);
            const moonAge = calculateMoonAge(date);
            const moonEmoji = getMoonEmoji(moonAge);
            
            let dayClass = 'calendar-day';
            let specialMark = '';
            let specialTooltip = '';
            
            // ラッキーデーをチェック
            if (patternData.lucky_days && patternData.lucky_days.includes(day)) {
                dayClass += ' lucky';
                specialMark = '✨';
            }
            
            // パワーデーをチェック
            if (patternData.power_days && patternData.power_days.includes(day)) {
                dayClass += ' power';
                specialMark = '💫';
            }
            
            // 注意日をチェック
            if (patternData.caution_days && patternData.caution_days.includes(day)) {
                dayClass += ' caution';
                specialMark = '⚠️';
            }
            
            // 特別な日のマークとメッセージ
            if (patternData.special_marks && patternData.special_marks[String(day)]) {
                const special = patternData.special_marks[String(day)];
                specialTooltip = `<div class="special-tooltip">${special.message}</div>`;
            }
            
            // 今日の日付をハイライト
            if (day === currentDate.getDate() && targetMonth === currentDate.getMonth() && targetYear === currentDate.getFullYear()) {
                dayClass += ' today';
            }
            
            calendarHTML += `
                <div class="${dayClass}">
                    <div class="day-number">${day}</div>
                    <div class="moon-phase">${moonEmoji}</div>
                    ${specialMark ? `<div class="special-mark">${specialMark}</div>` : ''}
                    ${specialTooltip}
                </div>
            `;
        }
        
        // 月末以降の空白を追加（7日で割り切れるように）
        const totalCells = firstDayOfMonth + daysInMonth;
        const remainingCells = 7 - (totalCells % 7);
        if (remainingCells < 7) {
            for (let i = 0; i < remainingCells; i++) {
                calendarHTML += '<div class="calendar-day empty"></div>';
            }
        }
        
        calendarHTML += '</div>'; // calendar-grid
        calendarHTML += '</div>'; // month-calendar
    }
    
    // 凡例を追加
    calendarHTML += `
        <div class="calendar-legend">
            <div class="legend-item">
                <span class="legend-dot lucky"></span>
                <span>ラッキーデー</span>
            </div>
            <div class="legend-item">
                <span class="legend-dot power"></span>
                <span>パワーデー</span>
            </div>
            <div class="legend-item">
                <span class="legend-dot caution"></span>
                <span>注意日</span>
            </div>
        </div>
    `;
    
    calendarHTML += '</div>'; // calendar-container
    
    // カレンダーを挿入
    container.innerHTML = calendarHTML;
    console.log('[Calendar] Calendar generated successfully');
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