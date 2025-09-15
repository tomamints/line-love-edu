/**
 * 運勢表示システム
 * 新しいJSON構造に対応した運勢コンテンツの表示
 */

class FortuneDisplay {
    constructor() {
        this.dateCalculator = new FortuneDateCalculator();
        this.fortuneData = {};
        this.isLoaded = false;
        this.patternId = 1; // デフォルトパターン
    }

    /**
     * 運勢データを読み込む
     */
    async loadFortuneData() {
        try {
            const [
                overallData,
                loveData,
                relationshipsData,
                workData,
                moneyData,
                moonMessagesData
            ] = await Promise.all([
                fetch('/assets/data/fortune-overall.json').then(r => r.json()),
                fetch('/assets/data/fortune-love.json').then(r => r.json()),
                fetch('/assets/data/fortune-relationships.json').then(r => r.json()),
                fetch('/assets/data/fortune-work.json').then(r => r.json()),
                fetch('/assets/data/fortune-money.json').then(r => r.json()),
                fetch('/assets/data/moon-messages.json').then(r => r.json())
            ]);

            this.fortuneData = {
                overall: overallData,
                love: loveData,
                relationships: relationshipsData,
                work: workData,
                money: moneyData,
                moonMessages: moonMessagesData
            };

            this.isLoaded = true;
            console.log('Fortune data loaded successfully');
            return true;
        } catch (error) {
            console.error('Failed to load fortune data:', error);
            return false;
        }
    }

    /**
     * パターンIDを設定（0-63）
     */
    setPatternId(id) {
        this.patternId = id;
        console.log('Pattern ID set to:', id);
    }

    /**
     * 全体運を表示
     */
    displayOverallFortune(userName = '〇〇') {
        if (!this.fortuneData.overall) {
            console.error('Overall fortune data not loaded');
            return;
        }

        // パターンIDから対応する運勢パターンを取得
        const distribution = this.fortuneData.overall.distribution;
        const patternIndex = distribution[this.patternId % distribution.length];
        const pattern = this.fortuneData.overall.patterns[patternIndex];

        if (!pattern) {
            console.error('Pattern not found:', patternIndex);
            return;
        }

        // タイトルを更新
        const titleElement = document.getElementById('fortune-overall-title');
        if (titleElement) {
            titleElement.textContent = pattern.title.replace('〇〇', userName);
        }

        // 説明文を更新（日付を置換）
        const introElement = document.getElementById('fortune-overall-intro');
        if (introElement) {
            const processedDescription = this.dateCalculator.replaceDatePlaceholders(
                pattern.description.replace(/〇〇/g, userName)
            );
            introElement.innerHTML = processedDescription;
        }

        // メインテキストを更新
        const textElement = document.getElementById('fortune-overall-text');
        if (textElement) {
            textElement.innerHTML = this.dateCalculator.replaceDatePlaceholders(
                pattern.description.replace(/〇〇/g, userName)
            );
        }

        // グラフタイプを設定（グラフ表示用）
        console.log('Overall fortune displayed with pattern:', patternIndex, pattern.title);
        return pattern.graphType;
    }

    /**
     * 恋愛運を表示
     */
    displayLoveFortune(userName = '〇〇') {
        console.log('displayLoveFortune called with userName:', userName);

        if (!this.fortuneData.love) {
            console.error('Love fortune data not loaded');
            return;
        }

        const data = this.fortuneData.love;
        console.log('Love fortune data:', data);

        // メインテキストを構築
        const mainText = data.mainText;
        let htmlContent = '';

        // 結果を表示
        htmlContent += `<p>${this.processText(mainText.result, userName)}</p>`;

        // 感情の承認
        htmlContent += `<p>${this.processText(mainText.feelingAcknowledgment, userName)}</p>`;

        // 安心感を与える
        htmlContent += `<p>${this.processText(mainText.reassurance, userName)}</p>`;

        // 理由
        htmlContent += `<p>${this.processText(mainText.reason, userName)}</p>`;

        // 証拠セクション
        htmlContent += '<div class="recent-events-section">';
        htmlContent += '<img src="/assets/images/banner/inqur/yellow-recently-experienced-this.webp" alt="最近こんなこと、ありませんでしたか？" class="inquiry-banner" />';
        htmlContent += '<div class="feelings-section pattern1">';
        htmlContent += '<ul>';
        if (mainText.evidence1) htmlContent += `<li>${this.processText(mainText.evidence1, userName)}</li>`;
        if (mainText.evidence2) htmlContent += `<li>${this.processText(mainText.evidence2, userName)}</li>`;
        if (mainText.evidence3) htmlContent += `<li>${this.processText(mainText.evidence3, userName)}</li>`;
        htmlContent += '</ul>';
        htmlContent += '</div>';
        if (mainText.evidence4) htmlContent += `<p class="conclusion-text">${this.processText(mainText.evidence4, userName)}</p>`;
        htmlContent += '</div>';

        // アドバイスセクション
        htmlContent += '<div class="action-list">';
        if (mainText.advice1) htmlContent += `<p>${this.processText(mainText.advice1, userName)}</p>`;
        const displayName = userName || 'あなた';
        htmlContent += `<p class="action-list-title">そのためにできることを、今の${displayName}さんに合わせて、3つご紹介しますね。</p>`;
        htmlContent += '<div class="feelings-section pattern1">';
        htmlContent += '<ul>';
        if (mainText.advice2) htmlContent += `<li>${this.processText(mainText.advice2, userName)}</li>`;
        if (mainText.advice3) htmlContent += `<li>${this.processText(mainText.advice3, userName)}</li>`;
        if (mainText.advice4) htmlContent += `<li>${this.processText(mainText.advice4, userName)}</li>`;
        htmlContent += '</ul>';
        htmlContent += '</div>';
        if (mainText.advice5) htmlContent += `<div class="conclusion-box"><p>${this.processText(mainText.advice5, userName)}</p></div>`;
        htmlContent += '</div>';

        // メインテキストを更新
        const textElement = document.getElementById('fortune-love-text');
        if (textElement) {
            textElement.innerHTML = htmlContent;
        }

        // 運命の出会いセクション
        this.displayDestinyMeeting(data.destinyMeeting, userName);

        // 恋の矢を向けている人セクション
        this.displayAdmirerType(data.admirerType, userName);

        // 危険な異性タイプセクション
        this.displayDangerousType(data.dangerousType, userName);
    }

    /**
     * 運命の出会いセクションを表示
     */
    displayDestinyMeeting(data, userName) {
        if (!data) return;

        let htmlContent = '';
        // h3タグは画像バナーで表示されるため削除
        htmlContent += `<p>${this.processText(data.declaration, userName)}</p>`;
        htmlContent += `<p>${this.processText(data.details, userName)}</p>`;
        htmlContent += `<p>${this.processText(data.condition, userName)}</p>`;
        htmlContent += `<p>${this.processText(data.action, userName)}</p>`;

        const element = document.getElementById('fortune-love-destiny-meeting');
        if (element) {
            element.innerHTML = htmlContent;
        }
    }

    /**
     * 恋の矢を向けている人セクションを表示
     */
    displayAdmirerType(data, userName) {
        if (!data) return;

        let htmlContent = '';
        // h3タグは画像バナーで表示されるため削除
        htmlContent += `<p>${this.processText(data.declaration, userName)}</p>`;
        htmlContent += `<p>${this.processText(data.characteristics, userName)}</p>`;

        // サインリスト
        htmlContent += '<div class="signs-section">';
        if (data.sign1_title) {
            htmlContent += '<div>';
            htmlContent += `<h4>${data.sign1_title}</h4>`;
            htmlContent += `<p>${this.processText(data.sign1_desc, userName)}</p>`;
            htmlContent += '</div>';
        }
        if (data.sign2_title) {
            htmlContent += '<div>';
            htmlContent += `<h4>${data.sign2_title}</h4>`;
            htmlContent += `<p>${this.processText(data.sign2_desc, userName)}</p>`;
            htmlContent += '</div>';
        }
        if (data.sign3_title) {
            htmlContent += '<div>';
            htmlContent += `<h4>${data.sign3_title}</h4>`;
            htmlContent += `<p>${this.processText(data.sign3_desc, userName)}</p>`;
            htmlContent += '</div>';
        }
        htmlContent += '</div>';

        if (data.realization) {
            htmlContent += `<p>${this.processText(data.realization, userName)}</p>`;
        }
        if (data.condition) {
            htmlContent += `<p>${this.processText(data.condition, userName)}</p>`;
        }

        const element = document.getElementById('fortune-love-admirer-type');
        if (element) {
            element.innerHTML = htmlContent;
        }
    }

    /**
     * 危険な異性タイプセクションを表示
     */
    displayDangerousType(data, userName) {
        if (!data) return;

        let htmlContent = '';
        // h3タグは画像バナーで表示されるため削除
        htmlContent += `<p>${this.processText(data.warning, userName)}</p>`;

        if (data.introduction) {
            htmlContent += `<p>${this.processText(data.introduction, userName)}</p>`;
        }

        // 特徴リスト
        htmlContent += '<div class="characteristics-section">';
        if (data.characteristic1_title) {
            htmlContent += '<div>';
            htmlContent += `<h4>${data.characteristic1_title}</h4>`;
            htmlContent += `<p>${this.processText(data.characteristic1_desc, userName)}</p>`;
            htmlContent += '</div>';
        }
        if (data.characteristic2_title) {
            htmlContent += '<div>';
            htmlContent += `<h4>${data.characteristic2_title}</h4>`;
            htmlContent += `<p>${this.processText(data.characteristic2_desc, userName)}</p>`;
            htmlContent += '</div>';
        }
        if (data.characteristic3_title) {
            htmlContent += '<div>';
            htmlContent += `<h4>${data.characteristic3_title}</h4>`;
            htmlContent += `<p>${this.processText(data.characteristic3_desc, userName)}</p>`;
            htmlContent += '</div>';
        }
        htmlContent += '</div>';

        if (data.condition) {
            htmlContent += `<p>${this.processText(data.condition, userName)}</p>`;
        }

        const element = document.getElementById('fortune-love-dangerous-type');
        if (element) {
            element.innerHTML = htmlContent;
        }
    }

    /**
     * 人間関係運を表示
     */
    displayRelationshipFortune(userName = '〇〇') {
        if (!this.fortuneData.relationships) {
            console.error('Relationship fortune data not loaded');
            return;
        }

        const data = this.fortuneData.relationships;
        const mainText = data.mainText;

        let htmlContent = '';

        // 宣言
        htmlContent += `<p>${this.processText(mainText.declaration, userName)}</p>`;

        // 感情セクション
        htmlContent += '<div class="feelings-section">';
        htmlContent += '<div class="recent-events-section">';
        htmlContent += '<img src="/assets/images/banner/inqur/white-evidence-these-things-happened.webp" alt="その証拠に、こんなことがあったはず" class="inquiry-banner" />';
        htmlContent += '<ul class="recent-events-list">';
        if (mainText.feeling1) htmlContent += `<li>${this.processText(mainText.feeling1, userName)}</li>`;
        if (mainText.feeling2) htmlContent += `<li>${this.processText(mainText.feeling2, userName)}</li>`;
        if (mainText.feeling3) htmlContent += `<li>${this.processText(mainText.feeling3, userName)}</li>`;
        if (mainText.feeling4) htmlContent += `<li>${this.processText(mainText.feeling4, userName)}</li>`;
        if (mainText.feeling5) htmlContent += `<li>${this.processText(mainText.feeling5, userName)}</li>`;
        htmlContent += '</ul>';
        if (mainText.feelingConclusion) {
            htmlContent += `<p class="conclusion-text">${this.processText(mainText.feelingConclusion, userName)}</p>`;
        }
        htmlContent += '</div>';
        htmlContent += '</div>';

        // 安心感と理由
        htmlContent += `<p>${this.processText(mainText.reassurance, userName)}</p>`;
        htmlContent += `<p>${this.processText(mainText.reason, userName)}</p>`;

        // 証拠セクション - バナー画像を表示
        htmlContent += '<div class="evidence-section">';
        htmlContent += '<div class="recent-events-section">';

        // バナー画像を表示（テキストの代わりに）
        htmlContent += `<img src="/assets/images/banner/inqur/yellow-recently-experienced-this.webp" alt="最近、こんなことはありませんでしたか？" class="inquiry-banner">`;

        htmlContent += '<ul class="recent-events-list">';
        if (mainText.evidence1) htmlContent += `<li>${this.processText(mainText.evidence1, userName)}</li>`;
        if (mainText.evidence2) htmlContent += `<li>${this.processText(mainText.evidence2, userName)}</li>`;
        if (mainText.evidence3) htmlContent += `<li>${this.processText(mainText.evidence3, userName)}</li>`;
        htmlContent += '</ul>';
        if (mainText.evidenceConclusion) {
            htmlContent += `<p class="conclusion-text">${this.processText(mainText.evidenceConclusion, userName)}</p>`;
        }
        htmlContent += '</div>';
        htmlContent += '</div>';

        // アドバイスセクション
        htmlContent += '<div class="advice-section">';
        if (mainText.adviceIntro) {
            htmlContent += `<p>${this.processText(mainText.adviceIntro, userName)}</p>`;
        }
        htmlContent += '<ol>';
        if (mainText.advice1) htmlContent += `<li>${this.processText(mainText.advice1, userName)}</li>`;
        if (mainText.advice2) htmlContent += `<li>${this.processText(mainText.advice2, userName)}</li>`;
        if (mainText.advice3) htmlContent += `<li>${this.processText(mainText.advice3, userName)}</li>`;
        htmlContent += '</ol>';
        if (mainText.adviceConclusion) {
            htmlContent += `<p>${this.processText(mainText.adviceConclusion, userName)}</p>`;
        }
        htmlContent += '</div>';

        const textElement = document.getElementById('fortune-relationship-text');
        if (textElement) {
            textElement.innerHTML = htmlContent;
        }

        // 新しい人間関係セクション
        this.displayNewConnections(data.newConnections, userName);

        // 課題セクション
        this.displayRelationshipChallenges(data.challenges, userName);
    }

    /**
     * 新しい人間関係セクションを表示
     */
    displayNewConnections(data, userName) {
        if (!data) return;

        const distribution = data.distribution;
        const patternIndex = distribution[this.patternId % distribution.length];
        const pattern = data.patterns[patternIndex];

        if (!pattern) return;

        // h3タグは画像バナーで表示されるため削除
        let htmlContent = '';
        htmlContent += `<p>${this.processText(pattern, userName)}</p>`;

        const element = document.getElementById('fortune-relationship-new-connections');
        if (element) {
            element.innerHTML = htmlContent;
        }
    }

    /**
     * 人間関係の課題セクションを表示
     */
    displayRelationshipChallenges(data, userName) {
        if (!data) return;

        const distribution = data.distribution;
        const patternIndex = distribution[this.patternId % distribution.length];
        const pattern = data.patterns[patternIndex];

        if (!pattern) return;

        // h3タグは画像バナーで表示されるため削除
        let htmlContent = '';
        htmlContent += `<p>${this.processText(pattern, userName)}</p>`;

        const element = document.getElementById('fortune-relationship-challenges');
        if (element) {
            element.innerHTML = htmlContent;
        }
    }

    /**
     * 仕事運を表示
     */
    displayWorkFortune(userName = '〇〇') {
        if (!this.fortuneData.work) {
            console.error('Work fortune data not loaded');
            return;
        }

        const data = this.fortuneData.work;
        const mainText = data.mainText;

        let htmlContent = '';

        // 宣言
        htmlContent += `<p>${this.processText(mainText.declaration, userName)}</p>`;

        // 感情セクション
        htmlContent += '<div class="feelings-section">';
        htmlContent += '<img src="/assets/images/banner/inqur/yellow-recently-experienced-this.webp" alt="最近こんなことはありませんか？" class="inquiry-banner" />',
        htmlContent += '<ul>';
        if (mainText.feeling1) htmlContent += `<li>${this.processText(mainText.feeling1, userName)}</li>`;
        if (mainText.feeling2) htmlContent += `<li>${this.processText(mainText.feeling2, userName)}</li>`;
        if (mainText.feeling3) htmlContent += `<li>${this.processText(mainText.feeling3, userName)}</li>`;
        htmlContent += '</ul>';
        if (mainText.feelingConclusion) {
            htmlContent += `<p>${this.processText(mainText.feelingConclusion, userName)}</p>`;
        }
        htmlContent += '</div>';

        // 安心感と理由
        htmlContent += `<p>${this.processText(mainText.reassurance, userName)}</p>`;
        htmlContent += `<p>${this.processText(mainText.reason, userName)}</p>`;

        // 証拠セクション
        htmlContent += '<div class="evidence-section">';
        htmlContent += '<img src="/assets/images/banner/inqur/white-experiences-fate-signal.webp" alt="こんな経験は、あなたが動き出す合図です" class="inquiry-banner" />';
        htmlContent += '<ul>';
        if (mainText.evidence1) htmlContent += `<li>${this.processText(mainText.evidence1, userName)}</li>`;
        if (mainText.evidence2) htmlContent += `<li>${this.processText(mainText.evidence2, userName)}</li>`;
        if (mainText.evidence3) htmlContent += `<li>${this.processText(mainText.evidence3, userName)}</li>`;
        htmlContent += '</ul>';
        if (mainText.evidenceConclusion) {
            htmlContent += `<p>${this.processText(mainText.evidenceConclusion, userName)}</p>`;
        }
        htmlContent += '</div>';

        // アドバイスセクション
        htmlContent += '<div class="advice-section">';
        if (mainText.adviceIntro) {
            htmlContent += `<p>${this.processText(mainText.adviceIntro, userName)}</p>`;
        }
        htmlContent += '<ol>';
        if (mainText.advice1) htmlContent += `<li>${this.processText(mainText.advice1, userName)}</li>`;
        if (mainText.advice2) htmlContent += `<li>${this.processText(mainText.advice2, userName)}</li>`;
        if (mainText.advice3) htmlContent += `<li>${this.processText(mainText.advice3, userName)}</li>`;
        htmlContent += '</ol>';
        if (mainText.adviceConclusion) {
            htmlContent += `<p>${this.processText(mainText.adviceConclusion, userName)}</p>`;
        }
        htmlContent += '</div>';

        const textElement = document.getElementById('fortune-work-text');
        if (textElement) {
            textElement.innerHTML = htmlContent;
        }

        // 新しい才能セクション
        this.displayNewTalents(data.newTalents, userName);

        // 転機セクション
        this.displayTurningPoints(data.turningPoints, userName);
    }

    /**
     * 新しい才能セクションを表示
     */
    displayNewTalents(data, userName) {
        if (!data) return;

        const distribution = data.distribution;
        const patternIndex = distribution[this.patternId % distribution.length];
        const pattern = data.patterns[patternIndex];

        if (!pattern) return;

        // h3タグは画像バナーで表示されるため削除
        let htmlContent = '';
        htmlContent += `<p>${this.processText(pattern, userName)}</p>`;

        const element = document.getElementById('fortune-work-new-talent');
        if (element) {
            element.innerHTML = htmlContent;
        }
    }

    /**
     * 転機セクションを表示
     */
    displayTurningPoints(data, userName) {
        if (!data) return;

        const distribution = data.distribution;
        const patternIndex = distribution[this.patternId % distribution.length];
        const pattern = data.patterns[patternIndex];

        if (!pattern) return;

        // h3タグは画像バナーで表示されるため削除
        let htmlContent = '';
        htmlContent += `<p>${this.processText(pattern, userName)}</p>`;

        const element = document.getElementById('fortune-work-turning-point');
        if (element) {
            element.innerHTML = htmlContent;
        }
    }

    /**
     * 金運を表示
     */
    displayMoneyFortune(userName = '〇〇') {
        if (!this.fortuneData.money) {
            console.error('Money fortune data not loaded');
            return;
        }

        const data = this.fortuneData.money;
        const mainText = data.mainText;

        let htmlContent = '';

        // 宣言
        htmlContent += `<p>${this.processText(mainText.declaration, userName)}</p>`;

        // 感情セクション
        htmlContent += '<div class="feelings-section">';
        htmlContent += '<img src="/assets/images/banner/inqur/yellow-do-you-recognize-these.webp" alt="これらに思い当たることはありませんか？" class="inquiry-banner" />';
        htmlContent += '<ul>';
        if (mainText.feeling1) htmlContent += `<li>${this.processText(mainText.feeling1, userName)}</li>`;
        if (mainText.feeling2) htmlContent += `<li>${this.processText(mainText.feeling2, userName)}</li>`;
        if (mainText.feeling3) htmlContent += `<li>${this.processText(mainText.feeling3, userName)}</li>`;
        htmlContent += '</ul>';
        if (mainText.feelingConclusion) {
            htmlContent += `<p>${this.processText(mainText.feelingConclusion, userName)}</p>`;
        }
        htmlContent += '</div>';

        // 安心感と理由
        htmlContent += `<p>${this.processText(mainText.reassurance, userName)}</p>`;
        htmlContent += `<p>${this.processText(mainText.reason, userName)}</p>`;

        // 証拠セクション - バナー画像を表示
        htmlContent += '<div class="evidence-section">';
        htmlContent += '<div class="recent-events-section">';

        // バナー画像を表示（テキストの代わりに）
        htmlContent += `<img src="/assets/images/banner/inqur/white-experiences-fate-signal.webp" alt="最近、こんなことはありませんでしたか？" class="inquiry-banner">`;

        htmlContent += '<ul class="recent-events-list">';
        if (mainText.evidence1) htmlContent += `<li>${this.processText(mainText.evidence1, userName)}</li>`;
        if (mainText.evidence2) htmlContent += `<li>${this.processText(mainText.evidence2, userName)}</li>`;
        if (mainText.evidence3) htmlContent += `<li>${this.processText(mainText.evidence3, userName)}</li>`;
        htmlContent += '</ul>';
        if (mainText.evidenceConclusion) {
            htmlContent += `<p class="conclusion-text">${this.processText(mainText.evidenceConclusion, userName)}</p>`;
        }
        htmlContent += '</div>';
        htmlContent += '</div>';

        const textElement = document.getElementById('fortune-money-text');
        if (textElement) {
            textElement.innerHTML = htmlContent;
        }

        // ラッキーアクションセクション
        this.displayLuckyActions(data.luckyActions, userName);

        // お金のトラブル警告セクション
        this.displayMoneyTrouble(data.moneyTroubleWarning, userName);
    }

    /**
     * ラッキーアクションを表示
     */
    displayLuckyActions(actions, userName) {
        if (!actions || actions.length === 0) return;

        // ランダムに5つ選択
        const selectedActions = [];
        const actionsCopy = [...actions];
        for (let i = 0; i < 5 && actionsCopy.length > 0; i++) {
            const index = Math.floor(Math.random() * actionsCopy.length);
            selectedActions.push(actionsCopy[index]);
            actionsCopy.splice(index, 1);
        }

        let htmlContent = '<ul class="lucky-actions">';
        selectedActions.forEach(action => {
            htmlContent += `<li>${this.processText(action, userName)}</li>`;
        });
        htmlContent += '</ul>';

        const element = document.getElementById('fortune-money-lucky');
        if (element) {
            element.innerHTML = htmlContent;
        } else {
            console.log('Lucky actions element not found');
        }
        console.log('Lucky actions prepared:', selectedActions);
    }

    /**
     * お金のトラブル警告を表示
     */
    displayMoneyTrouble(data, userName) {
        if (!data) return;

        // dataは文字列として直接渡される
        const warningText = this.processText(data, userName);

        // 改行をHTMLブレークタグに変換
        const formattedText = warningText.replace(/\n/g, '<br>');

        const element = document.getElementById('fortune-money-trouble');
        if (element) {
            element.innerHTML = `<p>${formattedText}</p>`;
        }
    }

    /**
     * テキストを処理（ユーザー名置換、日付置換）
     */
    processText(text, userName) {
        if (!text) return '';

        // ユーザー名を置換
        let processed = text.replace(/〇〇/g, userName);

        // 日付プレースホルダーを置換
        processed = this.dateCalculator.replaceDatePlaceholders(processed);

        return processed;
    }

    /**
     * すべての運勢を表示
     */
    async displayAllFortunes(patternId, userName = '〇〇') {
        this.setPatternId(patternId);

        if (!this.isLoaded) {
            await this.loadFortuneData();
        }

        // 各運勢を表示
        const graphType = this.displayOverallFortune(userName);
        this.displayLoveFortune(userName);
        this.displayRelationshipFortune(userName);
        this.displayWorkFortune(userName);
        this.displayMoneyFortune(userName);

        // 月が教えてくれる最も重要なメッセージを表示
        await this.displayImportantMessage(userName);

        console.log('All fortunes displayed for pattern:', patternId);
        return graphType;
    }

    /**
     * 月が教えてくれる最も重要なメッセージを表示
     */
    async displayImportantMessage(userName) {
        try {
            // メッセージデータを読み込み
            const response = await fetch('/assets/data/moon-important-messages.json');
            const data = await response.json();

            if (!data || !data.themes) {
                console.error('Important messages data not found');
                return;
            }

            // パターンIDに基づいてテーマを選択（30パターン）
            const themeIndex = this.patternId % 30;
            const theme = data.themes[themeIndex];

            if (!theme) {
                console.error('Theme not found for index:', themeIndex);
                return;
            }

            // メッセージ全体のHTMLを構築
            let htmlContent = `
                <p style="margin-bottom: 20px;">
                    ${userName}さん、この3ヶ月においておつきさまが伝えているテーマは<br>
                    <strong style="color: #ffd700; font-size: 1.2em;">「${theme.theme}」</strong><br>
                    です。
                </p>
                <p style="margin-bottom: 20px;">
                    恋愛でも仕事でも人間関係でも、「もっと頑張らなきゃ」と焦る気持ちが強くなるかもしれません。<br>
                    でもその気持ちは、決して弱さではなく、未来を真剣に考えている証拠です。
                </p>
                <p style="margin-bottom: 20px;">
                    おつきさまはこう語りかけています──<br>
                    <span style="color: #ffd700; font-style: italic;">「${theme.message}」</span>
                </p>
                <p style="margin-bottom: 20px;">
                    行動の指針はとてもシンプル。
                </p>
                <div class="important-actions-list">
                    <ul>
            `;

            // アクションを追加（自動でチェックアニメーション）
            theme.actions.forEach((action, index) => {
                htmlContent += `<li class="action-item-${index}">${action}</li>`;
            });

            htmlContent += `
                    </ul>
                </div>
                <p style="margin-bottom: 20px;">
                    こうした小さな積み重ねが、やがて大きな自信となり、<span class='moon-characteristic'>${this.getMonthAfter(3)}月</span>ごろには「私らしい幸せ」をつかむ力へと変わっていきます。
                </p>
                <p>
                    迷ったときや不安なときは、夜空を見上げてください。<br>
                    おつきさまはいつも、${userName}さんの歩む道を優しく照らしています。
                </p>
            `;

            // HTMLに挿入
            const element = document.getElementById('fortune-important-message');
            if (element) {
                element.innerHTML = htmlContent;
                console.log('Important message displayed for theme:', theme.theme);
            } else {
                console.error('Element not found: fortune-important-message');
            }

        } catch (error) {
            console.error('Error loading important messages:', error);
        }
    }

    /**
     * 現在から指定月数後の月を取得
     */
    getMonthAfter(months) {
        const currentDate = new Date();
        const futureDate = new Date(currentDate.setMonth(currentDate.getMonth() + months));
        return futureDate.getMonth() + 1;
    }
}

// グローバルに公開
window.FortuneDisplay = FortuneDisplay;
