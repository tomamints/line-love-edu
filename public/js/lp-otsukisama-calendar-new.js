/**
 * 月齢カレンダー生成 - ベストプラクティス版
 * セマンティックHTMLテーブル + CSS Grid レイアウト
 * モバイルファースト設計
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
    const baseNewMoon = new Date(2000, 0, 6, 18, 14);
    const lunarCycle = 29.530588853;
    
    const daysSinceBase = (date - baseNewMoon) / (1000 * 60 * 60 * 24);
    const moonAge = daysSinceBase % lunarCycle;
    
    return moonAge >= 0 ? moonAge : moonAge + lunarCycle;
}

// カレンダー生成関数（改良版）
async function generatePersonalizedCalendar(providedPatternId) {
    const container = document.getElementById('moonCalendarSection');
    
    console.log('[Calendar] Starting generation for pattern:', providedPatternId);
    
    if (!container) {
        console.error('[Calendar] Container not found: moonCalendarSection');
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
    
    // パターンIDを決定
    let numericPatternId = providedPatternId;
    if (numericPatternId === undefined || numericPatternId === null) {
        const birthYear = parseInt(document.getElementById('year')?.value) || 1990;
        const birthMonth = parseInt(document.getElementById('month')?.value) || 7;
        const birthDay = parseInt(document.getElementById('day')?.value) || 15;
        
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
    const weekdays = ['日', '月', '火', '水', '木', '金', '土'];
    
    // カレンダーHTMLを構築（セマンティックHTML + アクセシビリティ）
    let calendarHTML = `
        <style>
            /* モバイルファースト設計 */
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
            
            /* セマンティックテーブル */
            .calendar-table {
                width: 100%;
                border-collapse: separate;
                border-spacing: 0;
            }
            
            .calendar-table thead {
                display: table-header-group;
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
            
            /* カレンダー本体のグリッドレイアウト */
            .calendar-body {
                display: block;
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
            
            /* タッチフレンドリーなホバー効果 */
            @media (hover: hover) {
                .calendar-cell:hover {
                    background: rgba(255, 215, 0, 0.2);
                    transform: scale(1.05);
                }
            }
            
            .calendar-cell:active {
                transform: scale(0.98);
            }
            
            .calendar-cell.empty {
                background: transparent;
                border: none;
                cursor: default;
            }
            
            .calendar-cell.empty:hover {
                transform: none;
                background: transparent;
            }
            
            .calendar-cell.today {
                background: rgba(138, 97, 250, 0.4);
                border: 2px solid #8a61fa;
                box-shadow: 0 0 8px rgba(138, 97, 250, 0.5);
            }
            
            .calendar-cell.lucky {
                background: linear-gradient(135deg, rgba(255, 215, 0, 0.3), rgba(255, 215, 0, 0.2));
                border: 2px solid #ffd700;
            }
            
            .calendar-cell.power {
                background: linear-gradient(135deg, rgba(147, 112, 219, 0.3), rgba(147, 112, 219, 0.2));
                border: 2px solid #9370DB;
            }
            
            .calendar-cell.caution {
                background: rgba(255, 100, 100, 0.2);
                border: 2px solid rgba(255, 100, 100, 0.5);
            }
            
            .date-number {
                color: #ffffff;
                font-size: 14px;
                font-weight: bold;
                margin-bottom: 2px;
            }
            
            .moon-phase {
                font-size: 16px;
                line-height: 1;
            }
            
            .special-mark {
                position: absolute;
                top: 2px;
                right: 2px;
                font-size: 10px;
            }
            
            /* 凡例 */
            .calendar-legend {
                display: flex;
                justify-content: center;
                gap: 16px;
                margin-top: 20px;
                flex-wrap: wrap;
            }
            
            .legend-item {
                display: flex;
                align-items: center;
                gap: 6px;
                color: #ffffff;
                font-size: 12px;
            }
            
            .legend-dot {
                width: 12px;
                height: 12px;
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
            
            /* タブレット対応 */
            @media (min-width: 768px) {
                .moon-calendar-container {
                    padding: 20px;
                }
                
                .calendar-header {
                    font-size: 22px;
                    margin-bottom: 24px;
                }
                
                .calendar-message {
                    font-size: 16px;
                    margin-bottom: 24px;
                }
                
                .month-title {
                    font-size: 20px;
                    margin-bottom: 16px;
                }
                
                .calendar-table thead th {
                    font-size: 14px;
                    padding: 10px 0;
                }
                
                .calendar-cell {
                    min-height: 60px;
                    padding: 6px;
                    border-radius: 8px;
                }
                
                .date-number {
                    font-size: 16px;
                }
                
                .moon-phase {
                    font-size: 20px;
                }
                
                .special-mark {
                    font-size: 12px;
                }
                
                .legend-item {
                    font-size: 14px;
                }
                
                .legend-dot {
                    width: 14px;
                    height: 14px;
                }
            }
            
            /* デスクトップ対応 */
            @media (min-width: 1024px) {
                .calendar-cell {
                    min-height: 70px;
                    padding: 8px;
                }
                
                .date-number {
                    font-size: 18px;
                }
                
                .moon-phase {
                    font-size: 24px;
                }
            }
            
            /* アクセシビリティ: フォーカス表示 */
            .calendar-cell:focus {
                outline: 2px solid #ffd700;
                outline-offset: 2px;
            }
            
            /* ハイコントラストモード対応 */
            @media (prefers-contrast: high) {
                .calendar-cell {
                    border: 2px solid;
                }
            }
            
            /* ダークモード対応 */
            @media (prefers-color-scheme: dark) {
                .calendar-cell {
                    background: rgba(138, 97, 250, 0.15);
                }
            }
        </style>
        
        <div class="moon-calendar-container">
            <h4 class="calendar-header">
                あなただけの月齢カレンダー
            </h4>
    `;
    
    // メッセージを追加
    if (patternData.monthly_message) {
        calendarHTML += `<div class="calendar-message">${patternData.monthly_message}</div>`;
    }
    
    // main.mdに記載されている説明文を追加
    calendarHTML += `
        <div class="calendar-message">
            <strong>あなたの運気が高まる日は、カレンダーに書いてある『パワーDAY（💫）』です。</strong><br>
            その日には新しい挑戦をしたり、大切な一歩を踏み出すのがおすすめです。
        </div>
        
        <div class="calendar-message" style="text-align: left; font-size: 13px; line-height: 1.8;">
            <div style="margin-bottom: 8px;"><strong>例えば</strong></div>
            <div style="margin-bottom: 6px;">💕 <strong>恋愛</strong> → 好きな人にLINEを送ってみる／気になる人と会う予定を入れる</div>
            <div style="margin-bottom: 6px;">👥 <strong>人間関係</strong> → しばらく会ってない友達に連絡する／お世話になっている方に感謝の気持ちを一言伝える</div>
            <div style="margin-bottom: 6px;">💼 <strong>仕事</strong> → やりたかった企画を上司に相談する／資格や勉強を始める</div>
            <div style="margin-bottom: 6px;">💰 <strong>お金</strong> → 新しい貯金方法を始める／使っていないサブスクを解約する</div>
            <div style="margin-bottom: 6px;">✨ <strong>自分磨き</strong> → 美容室やジムを予約する／あなたの好きな時間をとってみる</div>
        </div>
        
        <div class="calendar-message" style="margin-top: 16px;">
            <strong>必ず『お部屋のカレンダーやスマホの予定表にメモ』しておいてください。</strong><br>
            日付を目にするだけで、行動のエネルギーが高まりますよ。
        </div>
    `;
    
    // 2ヶ月分のカレンダーを生成
    for (let monthOffset = 0; monthOffset < 2; monthOffset++) {
        const targetMonth = (currentMonth + monthOffset) % 12;
        const targetYear = currentMonth + monthOffset >= 12 ? currentYear + 1 : currentYear;
        const daysInMonth = new Date(targetYear, targetMonth + 1, 0).getDate();
        const firstDayOfMonth = new Date(targetYear, targetMonth, 1).getDay();
        
        calendarHTML += `
            <div class="calendar-month">
                <div class="month-title">${targetYear}年 ${monthNames[targetMonth]}</div>
                <table class="calendar-table" role="grid" aria-label="${targetYear}年${monthNames[targetMonth]}のカレンダー">
                    <thead>
                        <tr role="row">
        `;
        
        // 曜日ヘッダー
        for (let i = 0; i < 7; i++) {
            let headerClass = '';
            if (i === 0) headerClass = 'sunday';
            if (i === 6) headerClass = 'saturday';
            calendarHTML += `<th role="columnheader" class="${headerClass}" aria-label="${weekdays[i]}曜日">${weekdays[i]}</th>`;
        }
        
        calendarHTML += `
                        </tr>
                    </thead>
                    <tbody class="calendar-body">
                        <tr role="row">
        `;
        
        // 月初めまでの空白
        for (let i = 0; i < firstDayOfMonth; i++) {
            calendarHTML += '<td class="calendar-cell empty" aria-hidden="true"></td>';
        }
        
        // 各日付
        for (let day = 1; day <= daysInMonth; day++) {
            const date = new Date(targetYear, targetMonth, day);
            const moonAge = calculateMoonAge(date);
            const moonEmoji = getMoonEmoji(moonAge);
            const dayOfWeek = date.getDay();
            
            // 新しい週の開始
            if (dayOfWeek === 0 && day > 1) {
                calendarHTML += '</tr><tr role="row">';
            }
            
            let cellClass = 'calendar-cell';
            let specialMark = '';
            let ariaLabel = `${targetYear}年${targetMonth + 1}月${day}日`;
            
            // ラッキーデーをチェック
            if (patternData.lucky_days && patternData.lucky_days.includes(day)) {
                cellClass += ' lucky';
                specialMark = '✨';
                ariaLabel += ', ラッキーデー';
            }
            
            // パワーデーをチェック
            if (patternData.power_days && patternData.power_days.includes(day)) {
                cellClass += ' power';
                specialMark = '💫';
                ariaLabel += ', パワーデー';
            }
            
            // 注意日をチェック
            if (patternData.caution_days && patternData.caution_days.includes(day)) {
                cellClass += ' caution';
                specialMark = '⚠️';
                ariaLabel += ', 注意日';
            }
            
            // 今日の日付をハイライト
            if (day === currentDate.getDate() && targetMonth === currentDate.getMonth() && targetYear === currentDate.getFullYear()) {
                cellClass += ' today';
                ariaLabel += ', 今日';
            }
            
            // 月相の名前を取得
            let moonPhaseName = '新月';
            if (moonAge <= 1.5) moonPhaseName = '新月';
            else if (moonAge <= 5.5) moonPhaseName = '三日月';
            else if (moonAge <= 9.5) moonPhaseName = '上弦';
            else if (moonAge <= 13.5) moonPhaseName = '十三夜';
            else if (moonAge <= 16.5) moonPhaseName = '満月';
            else if (moonAge <= 20.5) moonPhaseName = '十六夜';
            else if (moonAge <= 24.5) moonPhaseName = '下弦';
            else if (moonAge <= 28.5) moonPhaseName = '暁';
            
            ariaLabel += `, ${moonPhaseName}`;
            
            calendarHTML += `
                <td role="gridcell" 
                    class="${cellClass}" 
                    tabindex="0"
                    aria-label="${ariaLabel}"
                    data-date="${targetYear}-${String(targetMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}">
                    <div class="date-number">${day}</div>
                    <div class="moon-phase" title="${moonPhaseName}">${moonEmoji}</div>
                    ${specialMark ? `<div class="special-mark" aria-hidden="true">${specialMark}</div>` : ''}
                </td>
            `;
        }
        
        // 月末以降の空白を追加
        const totalCells = firstDayOfMonth + daysInMonth;
        const remainingCells = 7 - (totalCells % 7);
        if (remainingCells < 7) {
            for (let i = 0; i < remainingCells; i++) {
                calendarHTML += '<td class="calendar-cell empty" aria-hidden="true"></td>';
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
        <div class="calendar-legend" role="group" aria-label="カレンダーの凡例">
            <div class="legend-item">
                <span class="legend-dot lucky" aria-hidden="true"></span>
                <span>ラッキーデー</span>
            </div>
            <div class="legend-item">
                <span class="legend-dot power" aria-hidden="true"></span>
                <span>パワーデー</span>
            </div>
            <div class="legend-item">
                <span class="legend-dot caution" aria-hidden="true"></span>
                <span>注意日</span>
            </div>
        </div>
    `;
    
    calendarHTML += '</div>'; // moon-calendar-container
    
    // カレンダーを挿入
    container.innerHTML = calendarHTML;
    
    // キーボードナビゲーションを追加
    setupKeyboardNavigation();
    
    console.log('[Calendar] Calendar generated successfully');
}

// キーボードナビゲーション設定
function setupKeyboardNavigation() {
    const cells = document.querySelectorAll('.calendar-cell:not(.empty)');
    let currentIndex = 0;
    
    cells.forEach((cell, index) => {
        cell.addEventListener('keydown', (event) => {
            let newIndex = index;
            
            switch (event.key) {
                case 'ArrowLeft':
                    newIndex = Math.max(0, index - 1);
                    break;
                case 'ArrowRight':
                    newIndex = Math.min(cells.length - 1, index + 1);
                    break;
                case 'ArrowUp':
                    newIndex = Math.max(0, index - 7);
                    break;
                case 'ArrowDown':
                    newIndex = Math.min(cells.length - 1, index + 7);
                    break;
                case 'Home':
                    newIndex = 0;
                    break;
                case 'End':
                    newIndex = cells.length - 1;
                    break;
                default:
                    return;
            }
            
            event.preventDefault();
            cells[newIndex].focus();
        });
    });
}

// ページ読み込み時にカレンダーパターンデータを読み込む
document.addEventListener('DOMContentLoaded', () => {
    loadCalendarPatterns();
});