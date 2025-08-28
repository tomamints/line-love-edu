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

// カレンダー生成関数
async function generatePersonalizedCalendar(providedPatternId) {
    const container = document.getElementById('personalizedCalendar');
    const messageElement = document.getElementById('calendarMessage');
    const monthYearElement = document.getElementById('calendarMonthYear');
    
    if (!container) return;
    
    // カレンダーパターンデータが読み込まれていない場合は読み込む
    if (!calendarPatternsData) {
        await loadCalendarPatterns();
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
    
    const patternData = getCalendarPattern(numericPatternId);
    
    if (!patternData) {
        console.error('No calendar pattern found for user');
        return;
    }
    
    // メッセージを表示
    if (messageElement) {
        messageElement.textContent = patternData.monthly_message;
    }
    
    // 現在の月の情報を取得
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth();
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay(); // 1日の曜日（0=日曜）
    
    // 月と年を表示
    if (monthYearElement) {
        const monthNames = ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'];
        monthYearElement.textContent = `${currentYear}年 ${monthNames[currentMonth]}`;
    }
    
    // カレンダーのHTMLを生成（日付のみ）
    let calendarHTML = '';
    
    // 月初めまでの空白
    for (let i = 0; i < firstDayOfMonth; i++) {
        calendarHTML += '<div class="calendar-day empty"></div>';
    }
    
    // 各日付
    for (let day = 1; day <= daysInMonth; day++) {
        const date = new Date(currentYear, currentMonth, day);
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
        if (day === currentDate.getDate() && currentMonth === currentDate.getMonth()) {
            dayClass += ' today';
        }
        
        calendarHTML += `
            <div class="${dayClass}" data-day="${day}">
                <div class="day-content">
                    <span class="day-number">${day}</span>
                    <span class="moon-emoji">${moonEmoji}</span>
                    ${specialMark ? `<span class="special-mark">${specialMark}</span>` : ''}
                </div>
                ${specialMessage}
            </div>
        `;
    }
    
    // カレンダーのセルのみを更新（既存のHTMLに上書きしない）
    container.innerHTML = calendarHTML;
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