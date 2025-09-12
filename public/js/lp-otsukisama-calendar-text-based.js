/**
 * 月齢カレンダー生成 - 診断文章ベース版
 * 診断文章から抽出した日付をカレンダーに反映
 */

// 月齢カレンダーパターンデータ
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

// 月齢を計算する関数
function calculateMoonAge(date) {
    const baseNewMoon = new Date(2000, 0, 6, 18, 14);
    const lunarCycle = 29.530588853;

    const daysSinceBase = (date - baseNewMoon) / (1000 * 60 * 60 * 24);
    const moonAge = daysSinceBase % lunarCycle;

    return moonAge >= 0 ? moonAge : moonAge + lunarCycle;
}

// 診断文章から日付を抽出してカレンダーを生成
async function generateTextBasedCalendar(patternId, fortuneData) {
    console.log('[Calendar] generateTextBasedCalendar called with:', { patternId, fortuneData });

    const container = document.getElementById('moonCalendarSection');

    if (!container) {
        console.error('[Calendar] Container not found: moonCalendarSection');
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
        overall: document.getElementById('fortune-overall-text')?.innerText || '',
        love: document.getElementById('fortune-love-text')?.innerText || '',
        relationship: document.getElementById('fortune-relationship-text')?.innerText || '',
        career: document.getElementById('fortune-career-text')?.innerText || '',
        money: document.getElementById('fortune-money-text')?.innerText || ''
    };

    console.log('[Calendar] Fortune texts:', fortuneTexts);

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
            <div style="text-align: center; margin-bottom: 20px;">
                <img src="/images/banner/next-section.png" alt="あなただけの3ヶ月運勢カレンダー" style="max-width: 100%; height: auto;">
            </div>
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

            calendarHTML += `
                <td class="${cellClass}" role="gridcell" ${tooltipText}>
                    <div class="date-number">${day}</div>
                    <div class="moon-phase">${moonEmoji}</div>
            `;

            // 運勢アイコンを表示
            if (luckyInfo && luckyInfo.categories.length > 0) {
                const icons = luckyInfo.categories.map(cat =>
                    dateExtractor.getCalendarIcon(cat, luckyInfo.importance)
                );
                calendarHTML += `
                    <div class="fortune-icons">
                        ${icons.slice(0, 2).join('')}
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
        margin-top: 40px;
        padding: 30px;
        background: rgba(255, 255, 255, 0.05);
        border-radius: 15px;
        border: 1px solid rgba(255, 215, 0, 0.3);
    ">
        <div style="margin: 20px 0; text-align: center;">
            <img src="/images/banner/calendar-explanation.png" alt="パワーDAY説明" style="max-width: 110%; height: auto; margin-left: -5%; margin-right: -5%;">
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

            <div style="color: rgba(255, 255, 255, 0.9); line-height: 2;">
                <div style="margin-bottom: 10px;">
                    <span style="color: #ff69b4;">恋愛</span> → 好きな人にLINEを送ってみる／気になる人と会う予定を入れる
                </div>
                <div style="margin-bottom: 10px;">
                    <span style="color: #87ceeb;">人間関係</span> → しばらく会ってない友達に連絡する／お世話になっている方に感謝の気持ちを一言伝える
                </div>
                <div style="margin-bottom: 10px;">
                    <span style="color: #98fb98;">仕事</span> → やりたかった企画を上司に相談する／資格や勉強を始める
                </div>
                <div style="margin-bottom: 10px;">
                    <span style="color: #ffd700;">お金</span> → 新しい貯金方法を始める／使っていないサブスクを解約する
                </div>
                <div>
                    <span style="color: #dda0dd;">自分磨き</span> → 美容室やジムを予約する／あなたの好きな時間をとってみる
                </div>
            </div>
        </div>

        <!-- パターンごとの月齢カレンダーメッセージ -->
        <div class="moon-calendar-message" style="
            margin-top: 30px;
            padding: 20px;
            background: linear-gradient(135deg, rgba(147, 112, 219, 0.1) 0%, rgba(255, 215, 0, 0.1) 100%);
            border-radius: 10px;
            border-left: 3px solid #ffd700;
        ">
            <p style="
                color: rgba(255, 255, 255, 0.9);
                line-height: 1.8;
            " id="moon-calendar-pattern-message">
                ${calendarMessage || '月のリズムに合わせて、あなただけの特別な日を活用していきましょう。'}
            </p>
        </div>
    </div>
    `;

    // HTMLを挿入
    container.innerHTML = calendarHTML;

    console.log('[Calendar] Text-based calendar generated successfully');
}

// グローバルに公開
window.generateTextBasedCalendar = generateTextBasedCalendar;
