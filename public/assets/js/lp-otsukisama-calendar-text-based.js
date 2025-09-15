/**
 * 月齢カレンダー生成 - 診断文章ベース版
 * 診断文章から抽出した日付をカレンダーに反映
 */

// 月齢カレンダーパターンデータ
let calendarPatternsData = null;

// カレンダーパターンデータを読み込む
async function loadCalendarPatterns() {
    try {
        const response = await fetch('../data/moon-calendar-patterns-complete.json');
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

// 月齢を計算する関数
function calculateMoonAge(date) {
    const baseNewMoon = new Date(2000, 0, 6, 18, 14);
    const lunarCycle = 29.530588853;

    const daysSinceBase = (date - baseNewMoon) / (1000 * 60 * 60 * 24);
    const moonAge = daysSinceBase % lunarCycle;

    return moonAge >= 0 ? moonAge : moonAge + lunarCycle;
}

// 診断文章から日付を抽出してカレンダーを生成
async function generateTextBasedCalendar(patternId, fortuneData, fortuneType = 'all') {
    console.log('[Calendar] generateTextBasedCalendar called with:', { patternId, fortuneData, fortuneType });

    // Try both possible container IDs
    let container = document.getElementById('moonCalendarSection');
    if (!container) {
        container = document.getElementById('personalizedCalendar');
    }
    
    if (!container) {
        console.error('[Calendar] Container not found: moonCalendarSection or personalizedCalendar');
        return;
    }

    console.log('[Calendar] Container found:', container);

    // カレンダーパターンデータが読み込まれていない場合は読み込む
    if (!calendarPatternsData) {
        console.log('[Calendar] Loading calendar patterns...');
        const loaded = await loadCalendarPatterns();
        if (!loaded) {
            console.error('[Calendar] Failed to load calendar patterns');
            return;
        }
    }

    // パターンデータを取得
    const patternData = getCalendarPattern(patternId);
    if (!patternData) {
        console.error('[Calendar] No pattern data found for:', patternId);
        return;
    }

    // カレンダーメッセージを取得
    const calendarMessage = patternData.calendarMessage || '月のリズムに合わせて、あなただけの特別な日を活用していきましょう。';

    // 日付抽出器を初期化
    const dateExtractor = new window.FortuneDateExtractor();

    // fortuneDataが渡された場合はそれを使用、なければDOMから取得
    const fortuneTexts = fortuneData ? {
        overall: fortuneData.overall?.text || '',
        love: fortuneData.love?.text || '',
        relationship: fortuneData.relationship?.text || '',
        career: fortuneData.career?.text || '',
        money: fortuneData.money?.text || ''
    } : {
        overall: document.getElementById('fortune-overall-text')?.textContent || document.getElementById('fortune-overall-text')?.innerText || '',
        love: document.getElementById('fortune-love-text')?.textContent || document.getElementById('fortune-love-text')?.innerText || '',
        relationship: document.getElementById('fortune-relationship-text')?.textContent || document.getElementById('fortune-relationship-text')?.innerText || '',
        career: document.getElementById('fortune-career-text')?.textContent || document.getElementById('fortune-career-text')?.innerText || '',
        money: document.getElementById('fortune-money-text')?.textContent || document.getElementById('fortune-money-text')?.innerText || ''
    };

    console.log('[Calendar] Fortune texts:', fortuneTexts);
    
    // テキストが空の場合はデバッグ用のサンプルデータを使用
    if (!fortuneTexts.overall && !fortuneTexts.love && !fortuneTexts.relationship && !fortuneTexts.career && !fortuneTexts.money) {
        console.log('[Calendar] No fortune texts found, using debug data');
        // デバッグ用サンプルデータ
        fortuneTexts.overall = '12月25日〜28日ごろは運気が絶好調です。';
        fortuneTexts.love = '1月の15日〜20日は恋愛運が最高潮に達します。';
        fortuneTexts.career = '今月中旬に仕事で大チャンスが訪れます。';
    }

    // 各カテゴリから日付を抽出
    const extractedDates = {
        overall: dateExtractor.extractDatesFromText(fortuneTexts.overall, 'overall'),
        love: dateExtractor.extractDatesFromText(fortuneTexts.love, 'love'),
        relationship: dateExtractor.extractDatesFromText(fortuneTexts.relationship, 'relationship'),
        career: dateExtractor.extractDatesFromText(fortuneTexts.career, 'career'),
        money: dateExtractor.extractDatesFromText(fortuneTexts.money, 'money')
    };

    console.log('[Calendar] Extracted dates:', extractedDates);

    // 抽出した日付を保存
    dateExtractor.extractedDates = extractedDates;

    // 現在の日付
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth();

    // 月の名前
    const monthNames = ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'];
    const weekdays = ['日', '月', '火', '水', '木', '金', '土'];

    // カレンダーHTMLを構築
    let calendarHTML = `
        <!-- バナーを最外側に配置 -->
        <img src="/assets/images/banner/next-section.png" alt="あなただけの3ヶ月運勢カレンダー" style="width: 100%; height: auto; display: block; margin-bottom: -10px; border-radius: 12px 12px 0 0;">
        
        <style>
            .moon-calendar-container {
                padding: 10px;
                background: rgba(30, 25, 60, 0.95);
                border-radius: 0 0 12px 12px;
                margin: 0 auto;
                max-width: 100%;
                overflow-x: auto;
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

            .pattern-message {
                background: rgba(138, 97, 250, 0.2);
                border: 1px solid rgba(138, 97, 250, 0.5);
                border-radius: 10px;
                padding: 15px;
                margin: 20px 0;
            }

            .pattern-message h4 {
                color: #ffd700;
                font-size: 16px;
                margin-bottom: 10px;
                text-align: center;
            }

            .pattern-message p {
                color: #fff;
                font-size: 14px;
                line-height: 1.6;
                margin-bottom: 8px;
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
                max-width: 100%;
                border-collapse: collapse;
                border: 2px solid rgba(138, 97, 250, 0.8);
                background: rgba(138, 97, 250, 0.05);
                table-layout: fixed;
            }
            
            /* 運勢カテゴリーごとの色分け */
            .fortune-love .calendar-table {
                border-color: rgba(255, 182, 193, 0.8);
                background: rgba(255, 182, 193, 0.05);
            }
            
            .fortune-love .calendar-table thead th {
                background: rgba(255, 182, 193, 0.3);
                border-color: rgba(255, 182, 193, 0.8);
            }
            
            .fortune-love .calendar-cell {
                border-color: rgba(255, 182, 193, 0.8);
            }
            
            .fortune-relationship .calendar-table {
                border-color: rgba(100, 200, 255, 0.8);
                background: rgba(100, 200, 255, 0.05);
            }
            
            .fortune-relationship .calendar-table thead th {
                background: rgba(100, 200, 255, 0.3);
                border-color: rgba(100, 200, 255, 0.8);
            }
            
            .fortune-relationship .calendar-cell {
                border-color: rgba(100, 200, 255, 0.8);
            }
            
            .fortune-career .calendar-table {
                border-color: rgba(144, 238, 144, 0.8);
                background: rgba(144, 238, 144, 0.05);
            }
            
            .fortune-career .calendar-table thead th {
                background: rgba(144, 238, 144, 0.3);
                border-color: rgba(144, 238, 144, 0.8);
            }
            
            .fortune-career .calendar-cell {
                border-color: rgba(144, 238, 144, 0.8);
            }
            
            .fortune-money .calendar-table {
                border-color: rgba(255, 215, 0, 0.8);
                background: rgba(255, 215, 0, 0.05);
            }
            
            .fortune-money .calendar-table thead th {
                background: rgba(255, 215, 0, 0.3);
                border-color: rgba(255, 215, 0, 0.8);
            }
            
            .fortune-money .calendar-cell {
                border-color: rgba(255, 215, 0, 0.8);
            }

            .calendar-table thead tr {
                display: table-row;
            }

            .calendar-table thead th {
                color: #ffd700;
                font-size: 10px;
                font-weight: bold;
                text-align: center;
                padding: 6px 0;
                background: rgba(138, 97, 250, 0.3);
                border-right: 1px solid rgba(138, 97, 250, 0.8);
                border-bottom: 2px solid rgba(138, 97, 250, 0.8);
                width: 14.285%;
            }

            .calendar-table thead th:last-child {
                border-right: none;
            }

            .calendar-table thead th.sunday {
                color: #ff9999;
            }

            .calendar-table thead th.saturday {
                color: #9999ff;
            }

            .calendar-body tr {
                display: table-row;
            }

            .calendar-cell {
                display: table-cell;
                text-align: center;
                vertical-align: middle;
                height: 52px !important; /* 完全固定、アイコンが見える高さに */
                padding: 2px;
                background: rgba(30, 25, 60, 0.5);
                border-right: 1px solid rgba(138, 97, 250, 0.8);
                border-bottom: 1px solid rgba(138, 97, 250, 0.8);
                border-left: 2px solid transparent;
                position: relative;
                cursor: pointer;
                transition: all 0.3s;
                width: 14.285%;
                overflow: visible; /* アイコンが切れないように */
            }

            /* 運勢タイプ別の左ボーダー色 */
            .calendar-cell.has-love {
                border-left-color: #ff69b4;
            }

            .calendar-cell.has-career {
                border-left-color: #4169e1;
            }

            .calendar-cell.has-money {
                border-left-color: #ffd700;
            }

            .calendar-cell.has-relationship {
                border-left-color: #32cd32;
            }

            .calendar-cell.has-overall {
                border-left-color: #9370db;
            }

            /* 重要な日（複数の運勢タイプ） */
            .calendar-cell.important-day {
                background: linear-gradient(135deg, rgba(255, 105, 180, 0.15), rgba(147, 112, 219, 0.15));
                border-left-width: 3px;
                box-shadow: inset 0 0 15px rgba(255, 215, 0, 0.2);
                animation: pulse-glow 3s infinite;
            }

            @keyframes pulse-glow {
                0%, 100% {
                    box-shadow: inset 0 0 15px rgba(255, 215, 0, 0.2);
                }
                50% {
                    box-shadow: inset 0 0 25px rgba(255, 215, 0, 0.3);
                }
            }

            .calendar-cell:last-child {
                border-right: none;
            }

            .calendar-cell:hover {
                background: rgba(255, 215, 0, 0.2);
                z-index: 1;
            }

            .calendar-cell.empty {
                background: transparent;
                cursor: default;
            }

            .calendar-cell.today {
                background: rgba(138, 97, 250, 0.4);
                box-shadow: inset 0 0 0 2px #8a61fa;
                z-index: 1;
            }

            .calendar-cell.lucky {
                background: linear-gradient(135deg, rgba(255, 215, 0, 0.2), rgba(138, 97, 250, 0.2));
            }

            .calendar-cell.power-day {
                background: linear-gradient(135deg, rgba(255, 215, 0, 0.4), rgba(255, 105, 180, 0.3));
                box-shadow: inset 0 0 0 2px #ffd700;
                animation: pulse 2s infinite;
                z-index: 1;
            }

            @keyframes pulse {
                0%, 100% { transform: scale(1); }
                50% { transform: scale(1.02); }
            }

            .date-number {
                font-size: 10px;
                color: #ffffff;
                font-weight: bold;
                line-height: 1;
                margin-bottom: 1px;
            }

            .moon-phase {
                font-size: 12px;
                margin: 1px 0;
                line-height: 1;
            }

            .fortune-icons {
                display: flex;
                gap: 1px;
                font-size: 10px;
                margin-top: 1px;
                height: 14px; /* アイコン用の固定高さ */
                justify-content: center;
                align-items: center;
            }
            
            .fortune-icons svg {
                width: 12px !important;
                height: 12px !important;
                display: block;
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

            .action-guide {
                background: rgba(255, 215, 0, 0.1);
                border: 1px solid rgba(255, 215, 0, 0.3);
                border-radius: 10px;
                padding: 15px;
                margin-top: 20px;
                font-size: 13px;
                line-height: 1.8;
                color: #fff;
            }

            .action-guide strong {
                color: #ffd700;
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
    `;

    // パターン固有のメッセージを追加
    if (patternData.monthly_message) {
        calendarHTML += `
            <div class="pattern-message">
                <h4>🌙 今月のメッセージ</h4>
                <p><strong>${patternData.monthly_message}</strong></p>
                ${patternData.love_advice ? `<p>💕 恋愛アドバイス: ${patternData.love_advice}</p>` : ''}
                ${patternData.best_action_days ? `<p>✨ ベストアクション: ${patternData.best_action_days}</p>` : ''}
            </div>
        `;
    }

    // 説明文を追加
    calendarHTML += `
        <div class="calendar-message">
            <strong>診断結果に記載された日付がカレンダーに反映されています</strong><br>
            アイコンが表示されている日に、その分野での行動を起こすと良い結果が期待できます。
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

            // この日の運勢情報を取得（抽出した日付から）
            const luckyInfo = dateExtractor.isLuckyDay(currentCellDate);

            // セルのクラスを決定
            let cellClass = 'calendar-cell';
            if (isToday) cellClass += ' today';
            if (luckyInfo) {
                if (luckyInfo.importance === 'high') {
                    cellClass += ' power-day';
                } else {
                    cellClass += ' lucky';
                }
            }

            // ツールチップテキスト
            const tooltipText = luckyInfo && luckyInfo.descriptions.length > 0 ?
                `title="${luckyInfo.descriptions.join(' / ')}"` : '';

            // 運勢タイプに基づいてクラスを追加
            let fortuneClasses = '';
            if (luckyInfo && luckyInfo.categories.length > 0) {
                // 運勢タイプごとのクラスを追加
                luckyInfo.categories.forEach(cat => {
                    fortuneClasses += ` has-${cat}`;
                });
                // 複数の運勢がある場合は重要な日
                if (luckyInfo.categories.length >= 2) {
                    fortuneClasses += ' important-day';
                }
            }

            calendarHTML += `
                <td class="${cellClass}${fortuneClasses}" role="gridcell" ${tooltipText}>
                    <div class="date-number">${day}</div>
                    <div class="moon-phase">${moonEmoji}</div>
            `;

            // 運勢アイコンを表示（重要な日は1つのアイコンのみ）
            if (luckyInfo && luckyInfo.categories.length > 0) {
                const primaryCategory = luckyInfo.categories[0]; // 最初のカテゴリを代表として使用
                const icon = dateExtractor.getCalendarIcon(primaryCategory, luckyInfo.importance);
                calendarHTML += `
                    <div class="fortune-icons">
                        ${icon}
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

    calendarHTML += `
    </div>

    <!-- 月齢カレンダーの説明文 -->
    <div class="moon-calendar-description" style="
        margin-top: 20px;
        padding: 30px;
        background: rgba(255, 255, 255, 0.05);
        border-radius: 15px;
        border: 1px solid rgba(255, 215, 0, 0.3);
    ">
        <div style="margin: 20px 0; text-align: center;">
            <img src="/assets/images/banner/calendar-explanation.png" alt="パワーDAY説明" style="max-width: 110%; height: auto; margin-left: -5%; margin-right: -5%;">
        </div>

        <div style="
            background: rgba(255, 255, 255, 0.03);
            padding: 20px;
            border-radius: 10px;
            margin-top: 20px;
        ">
            <p style="
                color: #ffd700;
                font-weight: bold;
                margin-bottom: 15px;
            ">例えば</p>

            <div class="text-white/90 leading-loose">
                <div class="mb-2">
                    <span class="bg-pink-400 text-white px-1.5 py-0.5 rounded font-bold">恋愛</span> → 好きな人にLINEを送ってみる／気になる人と会う予定を入れる
                </div>
                <div class="mb-2">
                    <span class="bg-blue-500 text-white px-1.5 py-0.5 rounded font-bold">人間関係</span> → しばらく会ってない友達に連絡する／お世話になっている方に感謝の気持ちを一言伝える
                </div>
                <div class="mb-2">
                    <span class="bg-orange-500 text-white px-1.5 py-0.5 rounded font-bold">仕事</span> → やりたかった企画を上司に相談する／資格や勉強を始める
                </div>
                <div class="mb-2">
                    <span class="bg-yellow-400 text-gray-900 px-1.5 py-0.5 rounded font-bold">お金</span> → 新しい貯金方法を始める／使っていないサブスクを解約する
                </div>
                <div>
                    <span class="bg-purple-500 text-white px-1.5 py-0.5 rounded font-bold">総合運</span> → 新しいことにチャレンジする／大切な決断をする
                </div>
            </div>
        </div>

        <!-- カレンダーメモリマインダーバナー -->
        <div style="margin-top: 30px; text-align: center;">
            <img src="/assets/images/banner/calendar-memo-reminder.png" alt="カレンダーメモリマインダー" style="max-width: 100%; height: auto;">
        </div>
    </div>
    `;

    // HTMLを挿入
    container.innerHTML = calendarHTML;

    console.log('[Calendar] Text-based calendar generated successfully');
}

// TextBasedMoonCalendarGeneratorクラス
class TextBasedMoonCalendarGenerator {
    constructor() {
        this.extractedDates = null;
        this.extractor = null;
    }

    initializeCalendar(elementId, extractedDates, extractor) {
        const container = document.getElementById(elementId);
        if (!container) {
            console.error('Calendar container not found:', elementId);
            return;
        }

        this.extractedDates = extractedDates;
        this.extractor = extractor;

        // カレンダーを生成
        this.generateCalendar(container);
    }

    generateCalendar(container) {
        const currentDate = new Date();
        const currentMonth = currentDate.getMonth();
        const currentYear = currentDate.getFullYear();

        // 今月から3ヶ月分のカレンダーを生成
        let calendarHTML = '<div class="moon-calendar-container">';
        
        // カレンダーメッセージ
        calendarHTML += `
            <div class="calendar-message">
                あなたの運勢から抽出した特別な日をマークしています
            </div>
        `;

        for (let monthOffset = 0; monthOffset < 3; monthOffset++) {
            const targetMonth = currentMonth + monthOffset;
            const targetYear = targetMonth > 11 ? currentYear + 1 : currentYear;
            const displayMonth = targetMonth % 12;
            
            calendarHTML += this.generateMonthCalendar(targetYear, displayMonth);
        }

        // 凡例
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

        calendarHTML += '</div>';
        container.innerHTML = calendarHTML;
    }

    generateMonthCalendar(year, month) {
        const monthNames = ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'];
        const dayNames = ['日', '月', '火', '水', '木', '金', '土'];
        
        const firstDay = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        const today = new Date();
        
        let html = '<div class="month-calendar">';
        html += `<div class="month-header">${year}年${monthNames[month]}</div>`;
        
        // 曜日ヘッダー
        html += '<div class="weekdays">';
        for (let day of dayNames) {
            const dayClass = day === '日' ? 'weekday sunday' : day === '土' ? 'weekday saturday' : 'weekday';
            html += `<div class="${dayClass}">${day}</div>`;
        }
        html += '</div>';
        
        // 日付グリッド
        html += '<div class="days-grid">';
        
        // 空のセル
        for (let i = 0; i < firstDay; i++) {
            html += '<div class="day-cell empty"></div>';
        }
        
        // 各日付
        for (let day = 1; day <= daysInMonth; day++) {
            const date = new Date(year, month, day);
            const isToday = date.toDateString() === today.toDateString();
            const moonAge = this.calculateMoonAge(date);
            const moonEmoji = getMoonEmoji(moonAge);
            
            // この日付の運勢情報を取得
            const luckyInfo = this.extractor ? this.extractor.isLuckyDay(date) : null;
            
            let dayClass = 'day-cell';
            if (isToday) dayClass += ' today';
            
            let fortuneIcons = '';
            let tooltip = '';
            
            if (luckyInfo) {
                // カテゴリーに基づいてクラスを設定
                if (luckyInfo.importance === 'high') {
                    dayClass += ' lucky';
                } else if (luckyInfo.importance === 'medium') {
                    dayClass += ' power';
                }
                
                // アイコンを追加
                fortuneIcons = '<div class="fortune-icons">';
                const uniqueCategories = [...new Set(luckyInfo.categories)];
                uniqueCategories.forEach(category => {
                    fortuneIcons += this.extractor.getCalendarIcon(category, luckyInfo.importance);
                });
                fortuneIcons += '</div>';
                
                // ツールチップ
                if (luckyInfo.descriptions.length > 0) {
                    tooltip = `<div class="special-tooltip">${luckyInfo.descriptions[0].substring(0, 30)}...</div>`;
                }
            }
            
            html += `
                <div class="${dayClass}">
                    <div class="day-number">${day}</div>
                    <div class="moon-phase">${moonEmoji}</div>
                    ${fortuneIcons}
                    ${tooltip}
                </div>
            `;
        }
        
        html += '</div>';
        html += '</div>';
        
        return html;
    }

    calculateMoonAge(date) {
        // 簡易的な月齢計算
        const baseNewMoon = new Date(2024, 0, 11); // 2024年1月11日の新月
        const daysSince = Math.floor((date - baseNewMoon) / (1000 * 60 * 60 * 24));
        const moonAge = daysSince % 29.53;
        return Math.floor(moonAge);
    }
}

// グローバルに公開
window.generateTextBasedCalendar = generateTextBasedCalendar;
window.TextBasedMoonCalendarGenerator = TextBasedMoonCalendarGenerator;

// 各運勢タイプのカレンダーを生成する便利な関数
window.generateLoveCalendar = function(patternId, fortuneData) {
    return generateTextBasedCalendar(patternId, fortuneData, 'love');
};

window.generateRelationshipCalendar = function(patternId, fortuneData) {
    return generateTextBasedCalendar(patternId, fortuneData, 'relationship');
};

window.generateCareerCalendar = function(patternId, fortuneData) {
    return generateTextBasedCalendar(patternId, fortuneData, 'career');
};

window.generateMoneyCalendar = function(patternId, fortuneData) {
    return generateTextBasedCalendar(patternId, fortuneData, 'money');
};
