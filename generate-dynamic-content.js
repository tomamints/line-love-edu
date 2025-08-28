// 動的コンテンツ生成スクリプト
const fs = require('fs');

// 月相と裏月相の組み合わせに応じた動的コンテンツを生成
function generateDynamicContent(moonPhase, hiddenPhase, patternId) {
    // 月相ごとのベースメッセージ
    const moonPhaseThemes = {
        "新月": {
            title: "新しい始まり",
            intro: "創造と開拓のエネルギーが",
            theme: "革新",
            timing: "始まりの時期",
            color: "紫"
        },
        "三日月": {
            title: "成長と発展",
            intro: "育む力と忍耐力が",
            theme: "成長",
            timing: "発展の時期",
            color: "緑"
        },
        "上弦の月": {
            title: "決断と実行",
            intro: "行動力と決断力が",
            theme: "実行",
            timing: "実行の時期",
            color: "赤"
        },
        "十三夜": {
            title: "成熟と深化",
            intro: "知恵と洞察力が",
            theme: "成熟",
            timing: "深化の時期",
            color: "青"
        },
        "満月": {
            title: "完成と情熱",
            intro: "情熱と魅力が",
            theme: "完成",
            timing: "達成の時期",
            color: "金"
        },
        "十六夜": {
            title: "品格と洗練",
            intro: "優雅さと品格が",
            theme: "洗練",
            timing: "安定の時期",
            color: "銀"
        },
        "下弦の月": {
            title: "整理と効率",
            intro: "効率性と整理力が",
            theme: "効率",
            timing: "整理の時期",
            color: "黒"
        },
        "暁": {
            title: "神秘と直感",
            intro: "神秘性と洞察力が",
            theme: "直感",
            timing: "神秘の時期",
            color: "白"
        }
    };

    const mainTheme = moonPhaseThemes[moonPhase];
    const hiddenTheme = moonPhaseThemes[hiddenPhase];
    
    // パターンIDに基づくバリエーション
    const variation = patternId % 8;
    const monthOffset = Math.floor(patternId / 8);
    
    return {
        // 全体運のタイトルと導入文
        overallTitle: `${mainTheme.title}×${hiddenTheme.title}の${getVariationText(variation)}`,
        overallIntro: `${mainTheme.intro}${hiddenTheme.intro}融合し、${getTimingText(monthOffset)}に最高潮を迎える特別な3ヶ月が始まります。`,
        
        // 月別のタイトルと説明
        month1Title: getMonthTitle(1, mainTheme, variation),
        month1Text: getMonthText(1, mainTheme, hiddenTheme, variation),
        month2Title: getMonthTitle(2, hiddenTheme, variation),
        month2Text: getMonthText(2, hiddenTheme, mainTheme, variation),
        month3Title: getMonthTitle(3, mainTheme, variation),
        month3Text: getMonthText(3, mainTheme, hiddenTheme, variation),
        
        // 注意ポイント
        overallCaution: getCautionText(mainTheme, hiddenTheme, variation),
        loveCaution: getLoveCautionText(mainTheme, hiddenTheme, variation),
        
        // 転機のタイミング
        transitionAdvice: getTransitionAdvice(mainTheme, hiddenTheme, monthOffset),
        criticalTiming1: getCriticalTiming(1, variation, monthOffset),
        criticalTiming2: getCriticalTiming(2, variation, monthOffset),
        criticalTiming3: getCriticalTiming(3, variation, monthOffset),
        
        // 恋愛運の導入文
        loveIntro: `${mainTheme.theme}と${hiddenTheme.theme}の力が恋愛面でも発揮され、${getLoveTheme(variation)}な恋愛体験が待っています。`,
        
        // 恋愛月別タイトル
        loveMonth1Title: getLoveMonthTitle(1, mainTheme, variation),
        loveMonth1Text: getLoveMonthText(1, mainTheme, variation),
        loveMonth2Title: getLoveMonthTitle(2, hiddenTheme, variation),
        loveMonth2Text: getLoveMonthText(2, hiddenTheme, variation),
        loveMonth3Title: getLoveMonthTitle(3, mainTheme, variation),
        loveMonth3Text: getLoveMonthText(3, hiddenTheme, variation),
        
        // 仕事運のタイトル
        workTitle: `${mainTheme.theme}力が生み出す仕事運`,
        
        // 人間関係の転機
        relationshipTransition: getRelationshipTransition(mainTheme, hiddenTheme, variation),
        relationshipCaution: getRelationshipCaution(mainTheme, hiddenTheme, variation),
        
        // 金運のピークタイミング
        moneyPeakTiming: getMoneyPeakTiming(mainTheme, monthOffset, variation),
        
        // ラッキーカラーとアイテム
        luckyColor: `${mainTheme.color}と${hiddenTheme.color}`,
        luckyItem: getLuckyItem(mainTheme, hiddenTheme)
    };
}

// バリエーションテキスト生成関数群
function getVariationText(variation) {
    const texts = ["運命期", "飛躍期", "成長期", "安定期", "変革期", "発展期", "充実期", "達成期"];
    return texts[variation];
}

function getTimingText(offset) {
    const texts = ["1ヶ月目前半", "1ヶ月目後半", "2ヶ月目前半", "2ヶ月目中旬", 
                   "2ヶ月目後半", "3ヶ月目前半", "3ヶ月目中旬", "3ヶ月目"];
    return texts[offset];
}

function getMonthTitle(month, theme, variation) {
    const prefixes = ["準備", "始動", "開花", "発展", "成熟", "収穫", "完成", "継続"];
    const suffixes = ["期", "の時", "のタイミング", "の瞬間", "の季節", "の流れ", "の波", "のリズム"];
    return `${theme.theme}の${prefixes[variation]}${suffixes[month % 8]}`;
}

function getMonthText(month, mainTheme, subTheme, variation) {
    const templates = [
        `${mainTheme.theme}のエネルギーが高まり、${subTheme.theme}の力がそれを支える時期。`,
        `${mainTheme.timing}に入り、${subTheme.theme}の要素が加わることで大きな変化が訪れます。`,
        `${mainTheme.intro}最高潮に達し、${subTheme.theme}との相乗効果で成果が現れ始めます。`,
        `${mainTheme.theme}力を発揮しながら、${subTheme.theme}の恩恵を受ける恵まれた時期です。`
    ];
    return templates[variation % 4] + `特に${month}ヶ月目の${getWeekText(variation)}週目が重要なタイミングとなるでしょう。`;
}

function getWeekText(variation) {
    return ((variation % 4) + 1).toString();
}

function getCautionText(mainTheme, hiddenTheme, variation) {
    const cautions = [
        `${mainTheme.theme}に夢中になりすぎて、${hiddenTheme.theme}の側面を忘れないよう注意が必要です。`,
        `${mainTheme.timing}だからこそ、慎重さと${hiddenTheme.theme}のバランスを保つことが大切です。`,
        `${mainTheme.theme}と${hiddenTheme.theme}の両立が課題となる時期。どちらも大切にしましょう。`,
        `急激な変化に対応するため、${hiddenTheme.theme}の力を活用して安定を保つことが重要です。`
    ];
    return cautions[variation % 4];
}

function getLoveCautionText(mainTheme, hiddenTheme, variation) {
    const cautions = [
        `感情の${mainTheme.theme}に流されず、${hiddenTheme.theme}の視点も大切にしてください。`,
        `相手のペースも尊重しながら、${mainTheme.theme}と${hiddenTheme.theme}のバランスを保ちましょう。`,
        `${mainTheme.timing}ですが、相手の気持ちも考慮することが長続きの秘訣です。`,
        `情熱的になりすぎず、${hiddenTheme.theme}の要素も取り入れることで安定した関係を築けます。`
    ];
    return cautions[variation % 4];
}

function getTransitionAdvice(mainTheme, hiddenTheme, offset) {
    return `${mainTheme.timing}から${hiddenTheme.timing}への移行期には、特に慎重な判断が必要です。` +
           `月の満ち欠けに合わせて、${getTimingText(offset)}に重要な決断をすることをお勧めします。`;
}

function getCriticalTiming(number, variation, offset) {
    const week = ((variation + number) % 4) + 1;
    const month = ((offset + number - 1) % 3) + 1;
    return `${month}ヶ月目の第${week}週が${number}番目の重要な転機となります。この時期の決断が今後を左右するでしょう。`;
}

function getLoveTheme(variation) {
    const themes = ["情熱的", "ロマンチック", "穏やか", "劇的", "安定的", "刺激的", "深遠", "純粋"];
    return themes[variation];
}

function getLoveMonthTitle(month, theme, variation) {
    const titles = [
        `${theme.theme}の恋の始まり`,
        `${theme.theme}による愛の深化`,
        `${theme.theme}がもたらす関係の発展`,
        `${theme.theme}で築く信頼関係`
    ];
    return titles[(month + variation) % 4];
}

function getLoveMonthText(month, theme, variation) {
    const texts = [
        `${theme.theme}のエネルギーで新しい出会いが期待できます。`,
        `${theme.timing}に入り、既存の関係が深まるでしょう。`,
        `${theme.theme}の力で相手との絆が強くなります。`,
        `${theme.intro}恋愛面でも良い影響を与えます。`
    ];
    return texts[(month + variation) % 4];
}

function getRelationshipTransition(mainTheme, hiddenTheme, variation) {
    return `${mainTheme.theme}の人脈から${hiddenTheme.theme}の人脈へと、` +
           `人間関係の質が変化する転機が訪れます。${getWeekText(variation)}週目頃が特に重要な時期となるでしょう。`;
}

function getRelationshipCaution(mainTheme, hiddenTheme, variation) {
    return `${mainTheme.theme}に偏りすぎると人間関係のバランスが崩れる可能性があります。` +
           `${hiddenTheme.theme}の要素も意識して、調和を保つよう心がけましょう。`;
}

function getMoneyPeakTiming(theme, offset, variation) {
    const month = ((offset + variation) % 3) + 1;
    const week = ((variation * 2) % 4) + 1;
    return `${month}ヶ月目の第${week}週に金運のピークが訪れます。${theme.timing}の恩恵を最大限に受けられるでしょう。`;
}

function getLuckyItem(mainTheme, hiddenTheme) {
    const items = {
        "紫": "アメジスト",
        "緑": "翡翠",
        "赤": "ルビー",
        "青": "サファイア",
        "金": "ゴールド",
        "銀": "シルバー",
        "黒": "オニキス",
        "白": "水晶"
    };
    return `${items[mainTheme.color]}と${items[hiddenTheme.color]}の組み合わせ`;
}

// メイン処理
function main() {
    // 既存のデータを読み込み
    const data = JSON.parse(fs.readFileSync('public/data/otsukisama-patterns-complete.json', 'utf8'));
    
    // 各パターンに動的コンテンツを追加
    for (let i = 0; i < 64; i++) {
        const pattern = data[i.toString()];
        if (pattern) {
            pattern.dynamicContent = generateDynamicContent(
                pattern.moonPhase,
                pattern.hiddenPhase,
                i
            );
        }
    }
    
    // 更新されたデータを保存
    fs.writeFileSync('public/data/otsukisama-patterns-complete.json', 
                     JSON.stringify(data, null, 2), 'utf8');
    
    console.log('Dynamic content generation completed for 64 patterns');
}

// 実行
main();