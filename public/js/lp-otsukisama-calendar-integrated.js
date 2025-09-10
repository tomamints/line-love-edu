/**
 * 月齢カレンダー生成 - 運勢データ統合版
 * 運勢グラフと連動して、実際のラッキーデーを表示
 */

// 運勢グラフデータから高運勢の日を取得
function getHighFortuneDays(fortuneData, startDate) {
    const highFortuneDays = {
        love: [],       // 恋愛運が高い日
        relationship: [], // 人間関係運が高い日
        career: [],     // 仕事運が高い日
        money: [],      // 金運が高い日
        overall: []     // 全体運が高い日
    };
    
    // 3ヶ月分（約90日）のデータを解析
    for (let i = 0; i < 90; i++) {
        const currentDate = new Date(startDate);
        currentDate.setDate(startDate.getDate() + i);
        
        // 週単位のインデックス（12週間分のデータから）
        const weekIndex = Math.floor(i / 7) % 12;
        
        // 各運勢の値を取得（1-5のスケール）
        const overallValue = fortuneData.overall?.[weekIndex] || 3;
        const loveValue = fortuneData.love?.[weekIndex] || overallValue;
        const careerValue = fortuneData.career?.[weekIndex] || overallValue;
        const relationshipValue = fortuneData.relationship?.[weekIndex] || overallValue;
        const moneyValue = fortuneData.money?.[weekIndex] || overallValue;
        
        // 高運勢（4以上）の日を記録
        if (overallValue >= 4) {
            highFortuneDays.overall.push({
                date: new Date(currentDate),
                level: overallValue,
                levelName: overallValue === 5 ? '絶好調' : '好調期'
            });
        }
        
        if (loveValue >= 4) {
            highFortuneDays.love.push({
                date: new Date(currentDate),
                level: loveValue,
                levelName: loveValue === 5 ? '恋愛絶好調' : '恋愛好調'
            });
        }
        
        if (careerValue >= 4) {
            highFortuneDays.career.push({
                date: new Date(currentDate),
                level: careerValue,
                levelName: careerValue === 5 ? '仕事絶好調' : '仕事好調'
            });
        }
        
        if (relationshipValue >= 4) {
            highFortuneDays.relationship.push({
                date: new Date(currentDate),
                level: relationshipValue,
                levelName: relationshipValue === 5 ? '人間関係絶好調' : '人間関係好調'
            });
        }
        
        if (moneyValue >= 4) {
            highFortuneDays.money.push({
                date: new Date(currentDate),
                level: moneyValue,
                levelName: moneyValue === 5 ? '金運絶好調' : '金運好調'
            });
        }
    }
    
    return highFortuneDays;
}

// 特定の日の運勢情報を取得
function getDayFortuneInfo(date, highFortuneDays) {
    const dateStr = date.toDateString();
    const fortuneInfo = {
        icons: [],
        tooltip: [],
        isLucky: false,
        isPowerDay: false
    };
    
    // 各運勢をチェック
    highFortuneDays.love.forEach(item => {
        if (item.date.toDateString() === dateStr) {
            fortuneInfo.icons.push('💕');
            fortuneInfo.tooltip.push(`恋愛運: ${item.levelName}`);
            fortuneInfo.isLucky = true;
            if (item.level === 5) fortuneInfo.isPowerDay = true;
        }
    });
    
    highFortuneDays.relationship.forEach(item => {
        if (item.date.toDateString() === dateStr) {
            fortuneInfo.icons.push('👥');
            fortuneInfo.tooltip.push(`人間関係: ${item.levelName}`);
            fortuneInfo.isLucky = true;
            if (item.level === 5) fortuneInfo.isPowerDay = true;
        }
    });
    
    highFortuneDays.career.forEach(item => {
        if (item.date.toDateString() === dateStr) {
            fortuneInfo.icons.push('💼');
            fortuneInfo.tooltip.push(`仕事運: ${item.levelName}`);
            fortuneInfo.isLucky = true;
            if (item.level === 5) fortuneInfo.isPowerDay = true;
        }
    });
    
    highFortuneDays.money.forEach(item => {
        if (item.date.toDateString() === dateStr) {
            fortuneInfo.icons.push('💰');
            fortuneInfo.tooltip.push(`金運: ${item.levelName}`);
            fortuneInfo.isLucky = true;
            if (item.level === 5) fortuneInfo.isPowerDay = true;
        }
    });
    
    // 全体運が絶好調の日は特別なマーク
    highFortuneDays.overall.forEach(item => {
        if (item.date.toDateString() === dateStr && item.level === 5) {
            fortuneInfo.icons.push('💫');
            fortuneInfo.tooltip.push('パワーDAY！');
            fortuneInfo.isPowerDay = true;
        }
    });
    
    return fortuneInfo;
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

// 月齢を計算する関数
function calculateMoonAge(date) {
    const baseNewMoon = new Date(2000, 0, 6, 18, 14);
    const lunarCycle = 29.530588853;
    
    const daysSinceBase = (date - baseNewMoon) / (1000 * 60 * 60 * 24);
    const moonAge = daysSinceBase % lunarCycle;
    
    return moonAge >= 0 ? moonAge : moonAge + lunarCycle;
}

// 統合版カレンダー生成関数
async function generateIntegratedCalendar(patternId, fortuneData) {
    const container = document.getElementById('moonCalendarSection');
    
    if (!container) {
        console.error('[Calendar] Container not found: moonCalendarSection');
        return;
    }
    
    // 現在の日付
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth();
    
    // 運勢データから高運勢の日を取得
    const highFortuneDays = getHighFortuneDays(fortuneData, currentDate);
    
    // 月の名前
    const monthNames = ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'];
    const weekdays = ['日', '月', '火', '水', '木', '金', '土'];
    
    // カレンダーHTMLを構築
    let calendarHTML = `
        <style>
            .moon-calendar-container {
                padding: 16px;
                background: rgba(30, 25, 60, 0.95);
                border-radius: 12px;
                margin: 0 auto;
                max-width: 100%;
            }
            
            .calendar-header {
                color: #ffd700;
                font-size: 20px;
                font-weight: bold;
                text-align: center;
                margin-bottom: 20px;
                text-shadow: 1px 1px 3px rgba(0,0,0,0.5);
            }
            
            .calendar-message {
                color: #ffd700;
                text-align: center;
                margin-bottom: 20px;
                font-size: 14px;
                line-height: 1.6;
                padding: 0 10px;
            }
            
            .calendar-month {
                margin-bottom: 30px;
            }
            
            .month-title {
                color: #ffd700;
                font-size: 18px;
                font-weight: bold;
                text-align: center;
                margin-bottom: 12px;
                text-shadow: 1px 1px 2px rgba(0,0,0,0.5);
            }
            
            .calendar-table {
                width: 100%;
                border-collapse: separate;
                border-spacing: 0;
            }
            
            .calendar-table thead tr {
                display: grid;
                grid-template-columns: repeat(7, 1fr);
                gap: 2px;
                margin-bottom: 2px;
            }
            
            .calendar-table thead th {
                color: #ffd700;
                font-size: 12px;
                font-weight: bold;
                text-align: center;
                padding: 8px 0;
                background: rgba(138, 97, 250, 0.1);
                display: flex;
                align-items: center;
                justify-content: center;
            }
            
            .calendar-table thead th.sunday {
                color: #ff9999;
            }
            
            .calendar-table thead th.saturday {
                color: #9999ff;
            }
            
            .calendar-body tr {
                display: grid;
                grid-template-columns: repeat(7, 1fr);
                gap: 2px;
                margin-bottom: 2px;
            }
            
            .calendar-cell {
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                min-height: 48px;
                padding: 4px;
                background: rgba(138, 97, 250, 0.1);
                border: 1px solid rgba(138, 97, 250, 0.3);
                border-radius: 6px;
                position: relative;
                cursor: pointer;
                transition: all 0.3s;
            }
            
            .calendar-cell:hover {
                background: rgba(255, 215, 0, 0.2);
                transform: scale(1.05);
            }
            
            .calendar-cell.empty {
                background: transparent;
                border: none;
                cursor: default;
            }
            
            .calendar-cell.today {
                background: rgba(138, 97, 250, 0.4);
                border: 2px solid #8a61fa;
                box-shadow: 0 0 8px rgba(138, 97, 250, 0.5);
            }
            
            .calendar-cell.lucky {
                background: linear-gradient(135deg, rgba(255, 215, 0, 0.2), rgba(138, 97, 250, 0.2));
                border: 1px solid rgba(255, 215, 0, 0.5);
            }
            
            .calendar-cell.power-day {
                background: linear-gradient(135deg, rgba(255, 215, 0, 0.4), rgba(255, 105, 180, 0.3));
                border: 2px solid #ffd700;
                box-shadow: 0 0 10px rgba(255, 215, 0, 0.4);
                animation: pulse 2s infinite;
            }
            
            @keyframes pulse {
                0%, 100% { transform: scale(1); }
                50% { transform: scale(1.02); }
            }
            
            .date-number {
                font-size: 14px;
                color: #ffffff;
                font-weight: bold;
            }
            
            .moon-phase {
                font-size: 16px;
                margin: 2px 0;
            }
            
            .fortune-icons {
                display: flex;
                gap: 2px;
                font-size: 12px;
                margin-top: 2px;
            }
            
            .legend-container {
                margin-top: 20px;
                padding: 12px;
                background: rgba(138, 97, 250, 0.1);
                border-radius: 8px;
            }
            
            .legend-title {
                color: #ffd700;
                font-size: 14px;
                font-weight: bold;
                margin-bottom: 10px;
                text-align: center;
            }
            
            .legend-items {
                display: grid;
                grid-template-columns: repeat(2, 1fr);
                gap: 8px;
            }
            
            .legend-item {
                display: flex;
                align-items: center;
                gap: 6px;
                font-size: 12px;
                color: #ffffff;
            }
            
            @media (min-width: 768px) {
                .calendar-cell {
                    min-height: 60px;
                    padding: 6px;
                }
                
                .date-number {
                    font-size: 16px;
                }
                
                .moon-phase {
                    font-size: 20px;
                }
                
                .fortune-icons {
                    font-size: 14px;
                }
                
                .legend-items {
                    grid-template-columns: repeat(3, 1fr);
                }
            }
        </style>
        
        <div class="moon-calendar-container">
            <h4 class="calendar-header">
                あなただけの3ヶ月運勢カレンダー
            </h4>
            
            <div class="calendar-message">
                <strong>実際の運勢データと連動したラッキーデー</strong><br>
                アイコンが表示されている日は、その運勢が高まる日です！
            </div>
    `;
    
    // 3ヶ月分のカレンダーを生成
    for (let monthOffset = 0; monthOffset < 3; monthOffset++) {
        const targetMonth = (currentMonth + monthOffset) % 12;
        const targetYear = currentMonth + monthOffset >= 12 ? currentYear + 1 : currentYear;
        const daysInMonth = new Date(targetYear, targetMonth + 1, 0).getDate();
        const firstDayOfMonth = new Date(targetYear, targetMonth, 1).getDay();
        
        calendarHTML += `
            <div class="calendar-month">
                <h5 class="month-title">${targetYear}年 ${monthNames[targetMonth]}</h5>
                <table class="calendar-table" role="table" aria-label="${targetYear}年${monthNames[targetMonth]}のカレンダー">
                    <thead>
                        <tr role="row">
        `;
        
        // 曜日ヘッダー
        weekdays.forEach((day, index) => {
            const dayClass = index === 0 ? 'sunday' : index === 6 ? 'saturday' : '';
            calendarHTML += `<th role="columnheader" class="${dayClass}">${day}</th>`;
        });
        
        calendarHTML += `
                        </tr>
                    </thead>
                    <tbody class="calendar-body">
                        <tr role="row">
        `;
        
        // 空のセル（月の開始日まで）
        for (let i = 0; i < firstDayOfMonth; i++) {
            calendarHTML += `<td class="calendar-cell empty" role="gridcell"></td>`;
        }
        
        // 日付セル
        for (let day = 1; day <= daysInMonth; day++) {
            const currentCellDate = new Date(targetYear, targetMonth, day);
            const moonAge = calculateMoonAge(currentCellDate);
            const moonEmoji = getMoonEmoji(moonAge);
            const isToday = currentCellDate.toDateString() === currentDate.toDateString();
            
            // この日の運勢情報を取得
            const fortuneInfo = getDayFortuneInfo(currentCellDate, highFortuneDays);
            
            // セルのクラスを決定
            let cellClass = 'calendar-cell';
            if (isToday) cellClass += ' today';
            if (fortuneInfo.isPowerDay) cellClass += ' power-day';
            else if (fortuneInfo.isLucky) cellClass += ' lucky';
            
            // ツールチップテキスト
            const tooltipText = fortuneInfo.tooltip.length > 0 ? 
                `title="${fortuneInfo.tooltip.join(' / ')}"` : '';
            
            calendarHTML += `
                <td class="${cellClass}" role="gridcell" ${tooltipText}>
                    <div class="date-number">${day}</div>
                    <div class="moon-phase">${moonEmoji}</div>
            `;
            
            // 運勢アイコンを表示
            if (fortuneInfo.icons.length > 0) {
                calendarHTML += `
                    <div class="fortune-icons">
                        ${fortuneInfo.icons.slice(0, 2).join('')}
                    </div>
                `;
            }
            
            calendarHTML += `</td>`;
            
            // 週の終わりで改行
            if ((firstDayOfMonth + day) % 7 === 0 && day < daysInMonth) {
                calendarHTML += `</tr><tr role="row">`;
            }
        }
        
        // 残りの空セル
        const totalCells = firstDayOfMonth + daysInMonth;
        const remainingCells = 7 - (totalCells % 7);
        if (remainingCells < 7) {
            for (let i = 0; i < remainingCells; i++) {
                calendarHTML += `<td class="calendar-cell empty" role="gridcell"></td>`;
            }
        }
        
        calendarHTML += `
                        </tr>
                    </tbody>
                </table>
            </div>
        `;
    }
    
    // 凡例を追加
    calendarHTML += `
        <div class="legend-container">
            <div class="legend-title">アイコンの意味</div>
            <div class="legend-items">
                <div class="legend-item">
                    <span>💫</span>
                    <span>パワーDAY（絶好調）</span>
                </div>
                <div class="legend-item">
                    <span>💕</span>
                    <span>恋愛運アップ</span>
                </div>
                <div class="legend-item">
                    <span>👥</span>
                    <span>人間関係運アップ</span>
                </div>
                <div class="legend-item">
                    <span>💼</span>
                    <span>仕事運アップ</span>
                </div>
                <div class="legend-item">
                    <span>💰</span>
                    <span>金運アップ</span>
                </div>
                <div class="legend-item">
                    <span>🌕</span>
                    <span>満月（月齢表示）</span>
                </div>
            </div>
        </div>
        
        <div class="calendar-message" style="margin-top: 20px;">
            <strong>カレンダーを保存して、ラッキーデーに行動を起こしましょう！</strong><br>
            スクリーンショットを撮って、スマホの壁紙にするのもおすすめです。
        </div>
    </div>
    `;
    
    // HTMLを挿入
    container.innerHTML = calendarHTML;
    
    console.log('[Calendar] Integrated calendar generated successfully');
}

// グローバルに公開
window.generateIntegratedCalendar = generateIntegratedCalendar;