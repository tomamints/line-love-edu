/**
 * カレンダー生成関連の関数
 */

// 月相カレンダーのパターンデータ（仕様書から抜粋）
const moonCalendarPatterns = {
    '新月×新月': {
        goodDays: [1, 8, 15, 22, 29],
        specialDays: [{ day: 15, description: '特に新しいことを始めるのに最適' }]
    },
    '新月×三日月': {
        goodDays: [2, 9, 16, 23, 30],
        specialDays: [{ day: 23, description: '計画を立てるのに良い日' }]
    },
    // 他のパターンも同様に定義...
};

// カレンダー生成関数
function generatePersonalizedCalendar() {
    const container = document.getElementById('personalizedCalendar');
    const messageElement = document.getElementById('calendarMessage');
    const monthYearElement = document.getElementById('calendarMonthYear');
    
    if (!container) return;
    
    // フォームから生年月日を取得（デモ用にデフォルト値を設定）
    const birthYear = parseInt(document.getElementById('year')?.value) || 1990;
    const birthMonth = parseInt(document.getElementById('month')?.value) || 7;
    const birthDay = parseInt(document.getElementById('day')?.value) || 15;
    
    // ユーザーの月相を計算
    const userMoonPhase = calculateMoonPhaseType(birthYear, birthMonth, birthDay);
    const hiddenMoonPhase = getHiddenMoonPhaseName(birthYear, birthMonth, birthDay);
    const patternId = `${userMoonPhase}×${hiddenMoonPhase}`;
    const numericPatternId = generatePatternId(birthYear, birthMonth, birthDay);
    
    // パターンデータを取得（デモ用にデフォルトパターンを使用）
    const patternData = moonCalendarPatterns[patternId] || moonCalendarPatterns['新月×新月'];
    
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
    
    // カレンダーのHTMLを生成
    let calendarHTML = '<div class="calendar-grid">';
    
    // 曜日ヘッダー
    const dayHeaders = ['日', '月', '火', '水', '木', '金', '土'];
    calendarHTML += '<div class="calendar-header">';
    dayHeaders.forEach(day => {
        calendarHTML += `<div class="calendar-day-header">${day}</div>`;
    });
    calendarHTML += '</div>';
    
    // カレンダー本体
    calendarHTML += '<div class="calendar-body">';
    
    // 月初めまでの空白
    for (let i = 0; i < firstDayOfMonth; i++) {
        calendarHTML += '<div class="calendar-day empty"></div>';
    }
    
    // 各日付
    for (let day = 1; day <= daysInMonth; day++) {
        const date = new Date(currentYear, currentMonth, day);
        const moonAge = calculateMoonAge(date);
        const moonPhaseIndex = getMoonPhaseFromAge(moonAge);
        const dayMoonPhase = getMoonPhaseName(moonPhaseIndex);
        
        let dayClass = 'calendar-day';
        let specialMessage = '';
        
        // 良い日をチェック
        if (patternData.goodDays && patternData.goodDays.includes(day)) {
            dayClass += ' good-day';
        }
        
        // 特別な日をチェック
        const specialDay = patternData.specialDays?.find(s => s.day === day);
        if (specialDay) {
            dayClass += ' special-day';
            specialMessage = `<div class="special-message">${specialDay.description}</div>`;
        }
        
        // 今日の日付をハイライト
        if (day === currentDate.getDate() && currentMonth === currentDate.getMonth()) {
            dayClass += ' today';
        }
        
        // ユーザーと同じ月相の日
        if (dayMoonPhase === userMoonPhase) {
            dayClass += ' same-phase';
        }
        
        calendarHTML += `
            <div class="${dayClass}" data-day="${day}" data-moon-phase="${dayMoonPhase}">
                <div class="day-number">${day}</div>
                <div class="day-moon-icon">${getMoonIcon(moonPhaseIndex)}</div>
                ${specialMessage}
            </div>
        `;
    }
    
    calendarHTML += '</div></div>';
    
    container.innerHTML = calendarHTML;
    
    // メッセージを更新
    if (messageElement) {
        messageElement.innerHTML = `
            <p>あなたの月相「${userMoonPhase}」と相性の良い日をハイライトしています。</p>
            <p class="calendar-legend">
                <span class="legend-item"><span class="legend-dot good-day"></span>相性の良い日</span>
                <span class="legend-item"><span class="legend-dot special-day"></span>特別な日</span>
                <span class="legend-item"><span class="legend-dot same-phase"></span>同じ月相の日</span>
            </p>
        `;
    }
}

// 月相に応じたアイコンを返す
function getMoonIcon(phase) {
    const icons = ['🌑', '🌒', '🌓', '🌔', '🌕', '🌖', '🌗', '🌘'];
    return icons[phase] || '🌙';
}