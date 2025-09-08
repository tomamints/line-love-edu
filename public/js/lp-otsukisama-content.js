// おつきさま診断 - コンテンツ定義モジュール
// このファイルを編集することで、プレビューと完全版の両方に反映されます

const DIAGNOSIS_CONTENT = {
    // コンテンツセクション定義
    sections: {
        // 月詠の挨拶
        tsukuyomiGreeting: {
            id: 'tsukuyomi-greeting',
            title: '月詠の挨拶',
            freePreview: true,
            order: 1,
            html: (data) => `
                <div class="tsukuyomi-section">
                    <div class="tsukuyomi-character">
                        <img src="/images/tsukuyomi/2.png" alt="月詠">
                    </div>
                    <div class="tsukuyomi-bubble">
                        <div class="tsukuyomi-name">月詠</div>
                        <p>
                            こんにちは、${data.name || 'あなた'}さん。私は月詠（つくよみ）と申します。
                            今夜の月が、あなたの運命を照らし出します。
                            あなたが生まれた日の月は、特別な形をしていました。
                            その月が持つメッセージを、今からお伝えしていきますね。
                        </p>
                    </div>
                </div>
            `
        },

        // あなたのタイプバナー
        typeBanner: {
            id: 'type-banner',
            title: 'あなたのタイプ',
            freePreview: true,
            order: 2,
            html: () => `
                <img src="/images/banner/2-anata.png" alt="おつきさま診断で読み解くあなた" class="full-width-banner">
            `
        },

        // 月相診断結果
        moonPhaseResult: {
            id: 'moon-phase-result',
            title: '月相診断結果',
            freePreview: true,
            order: 3,
            html: (data) => `
                <div class="diagnosis-type">
                    <div class="type-subtitle">
                        <span>生まれた時の月相 × 隠された月相</span>
                    </div>
                    
                    <div class="moon-phases">
                        <!-- 表の月相 -->
                        <div class="moon-phase-card new-moon">
                            <div class="moon-phase-visual">
                                <img src="/images/moon/omote-${data.moonPhaseIndex !== undefined ? data.moonPhaseIndex : 0}.png" alt="${data.moonPhase || '新月'}">
                            </div>
                            <div class="moon-phase-info">
                                <div class="phase-label">表の月相</div>
                                <h2>${data.moonPhase || '新月'}</h2>
                                ${data.phaseDescriptionTitle ? `<h3>${data.phaseDescriptionTitle}</h3>` : ''}
                                <p>${data.phaseDescriptionText || data.moonPhaseDescription || '始まりと創造のエネルギー'}</p>
                            </div>
                        </div>
                        
                        <div class="cross-symbol">×</div>
                        
                        <!-- 裏の月相 -->
                        <div class="moon-phase-card full-moon">
                            <div class="moon-phase-visual">
                                <img src="/images/moon/ura-${data.hiddenPhaseIndex !== undefined ? data.hiddenPhaseIndex : 4}.png" alt="${data.hiddenPhase || '満月'}">
                            </div>
                            <div class="moon-phase-info">
                                <div class="phase-label">隠された月相</div>
                                <h2>${data.hiddenPhase || '満月'}</h2>
                                ${data.hiddenPhaseTitle ? `<h3>${data.hiddenPhaseTitle}</h3>` : ''}
                                ${data.hiddenPhaseMainText1 ? `<p>${data.hiddenPhaseMainText1.replace(/『『『(.*?)』』』/g, '<strong>$1</strong>')}</p>` : ''}
                                ${data.hiddenPhaseBulletPoints ? `
                                    <div class="hidden-phase-moment">
                                        <p class="moment-title"><strong>こんな瞬間、ありませんか？</strong></p>
                                        <ul>
                                            ${data.hiddenPhaseBulletPoints.map(point => `<li>${point}</li>`).join('')}
                                        </ul>
                                    </div>
                                ` : ''}
                                ${data.hiddenPhaseMainText2 ? `<p>${data.hiddenPhaseMainText2}</p>` : ''}
                                ${!data.hiddenPhaseMainText1 ? `<p>${data.hiddenPhaseDescription || '完成と実現のエネルギー'}</p>` : ''}
                            </div>
                        </div>
                    </div>
                </div>
            `
        },

        // 4つの性格軸（プレビューでは一部表示）
        personalityAxes: {
            id: 'personality-axes',
            title: '4つの性格軸',
            freePreview: true,
            previewMode: 'partial', // プレビューでは見出しのみ
            order: 4,
            html: (data) => `
                <div class="four-axes-diagnosis">
                    <img src="/images/banner/5-2-tikara.png" alt="4つの軸からあなたを紐解く" class="section-banner">
                    
                    <div class="type-wheel-container">
                        
                        <div class="type-item top" data-type="emotional">
                            <img src="/images/love-types/emotional/${data.emotionalImage || 'straight'}.png" alt="${data.emotionalType || '感情表現'}">
                            <div class="type-label">
                                <span>感情表現</span>
                                <span>${data.emotionalType || 'ストレート告白型'}</span>
                            </div>
                        </div>
                        
                        <div class="type-item right" data-type="distance">
                            <img src="/images/love-types/distance/${data.distanceImage || 'moderate'}.png" alt="${data.distanceType || '距離感'}">
                            <div class="type-label">
                                <span>距離感</span>
                                <span>${data.distanceType || '安心セーフ型'}</span>
                            </div>
                        </div>
                        
                        <div class="type-item bottom" data-type="values">
                            <img src="/images/love-types/values/${data.valuesImage || 'romantic'}.png" alt="${data.valuesType || '価値観'}">
                            <div class="type-label">
                                <span>価値観</span>
                                <span>${data.valuesType || 'ロマンチスト型'}</span>
                            </div>
                        </div>
                        
                        <div class="type-item left" data-type="energy">
                            <img src="/images/love-types/energy/${data.energyImage || 'intense'}.png" alt="${data.energyType || 'エネルギー'}">
                            <div class="type-label">
                                <span>エネルギー</span>
                                <span>${data.energyType || '燃え上がり型'}</span>
                            </div>
                        </div>
                    </div>
                </div>
            `
        },

        // 性格軸の詳細説明（有料コンテンツ）
        personalityDetails: {
            id: 'personality-details',
            title: '性格タイプの詳細解説',
            freePreview: false,
            order: 5,
            html: (data) => `
                <div class="personality-details">
                    <div class="detail-card">
                        <h3>感情表現：${data.emotionalType || 'ストレート告白型'}</h3>
                        <p>${data.emotionalDescription || '詳細な説明がここに入ります'}</p>
                    </div>
                    <div class="detail-card">
                        <h3>距離感：${data.distanceType || '安心セーフ型'}</h3>
                        <p>${data.distanceDescription || '詳細な説明がここに入ります'}</p>
                    </div>
                    <div class="detail-card">
                        <h3>価値観：${data.valuesType || 'ロマンチスト型'}</h3>
                        <p>${data.valuesDescription || '詳細な説明がここに入ります'}</p>
                    </div>
                    <div class="detail-card">
                        <h3>エネルギー：${data.energyType || '燃え上がり型'}</h3>
                        <p>${data.energyDescription || '詳細な説明がここに入ります'}</p>
                    </div>
                </div>
            `
        },

        // 全体運（有料コンテンツ）
        overallFortune: {
            id: 'overall-fortune',
            title: '直近3ヶ月の全体運',
            freePreview: false,
            order: 6,
            html: (data) => `
                <div class="overall-fortune">
                    <img src="/images/banner/7-unmei.png" alt="直近3ヶ月の運命" class="section-banner">
                    
                    <div class="fortune-content">
                        <h2>${data.overallTitle || '運命の転換期'}</h2>
                        <p class="intro">${data.overallIntro || ''}</p>
                        <div class="fortune-highlight">
                            <p>${data.overallMainText || '全体運の詳細がここに表示されます'}</p>
                        </div>
                        
                        ${data.month1 ? `
                        <div class="month-fortune">
                            <h3>1ヶ月目：${data.month1.title}</h3>
                            <p>${data.month1.text}</p>
                        </div>
                        ` : ''}
                        
                        ${data.month2 ? `
                        <div class="month-fortune">
                            <h3>2ヶ月目：${data.month2.title}</h3>
                            <p>${data.month2.text}</p>
                        </div>
                        ` : ''}
                        
                        ${data.month3 ? `
                        <div class="month-fortune">
                            <h3>3ヶ月目：${data.month3.title}</h3>
                            <p>${data.month3.text}</p>
                        </div>
                        ` : ''}
                    </div>
                </div>
            `
        },

        // 恋愛運（有料コンテンツ）
        loveFortune: {
            id: 'love-fortune',
            title: 'あなたの恋愛運',
            freePreview: false,
            order: 7,
            html: (data) => `
                <div class="fortune-banner-wrapper">
                    <img src="/images/banner/8-rennai.png" alt="あなたの恋愛運" class="fortune-main-banner">
                    
                    <div class="fortune-section love">
                        <div class="fortune-content">
                            <div class="fortune-highlight">
                                <p>${data.loveMainText || '恋愛運の詳細がここに表示されます'}</p>
                            </div>
                            
                            ${data.loveDestinyMeeting ? `
                            <img src="/images/banner/love-1.png" alt="運命的な出会い" class="section-banner">
                            <div class="hanging-text">
                                <p>${data.loveDestinyMeeting}</p>
                            </div>
                            ` : ''}
                            
                            ${data.loveAdmirerType ? `
                            <img src="/images/banner/love-2.png" alt="あなたに惹かれる人" class="section-banner">
                            <div class="hanging-text">
                                <p>${data.loveAdmirerType}</p>
                            </div>
                            ` : ''}
                        </div>
                    </div>
                </div>
            `
        },

        // 人間関係運（有料コンテンツ）
        relationshipFortune: {
            id: 'relationship-fortune',
            title: '人間関係運',
            freePreview: false,
            order: 8,
            html: (data) => `
                <div class="fortune-banner-wrapper">
                    <img src="/images/banner/9-ningenn.png" alt="人間関係運" class="fortune-main-banner">
                    
                    <div class="fortune-section relationship">
                        <div class="fortune-content">
                            <div class="fortune-highlight">
                                <p>${data.relationshipMainText || '人間関係運の詳細がここに表示されます'}</p>
                            </div>
                            
                            ${data.relationshipNewConnections ? `
                            <img src="/images/banner/relation-1.png" alt="新しい人間関係" class="section-banner">
                            <div class="hanging-text">
                                <p>${data.relationshipNewConnections}</p>
                            </div>
                            ` : ''}
                        </div>
                    </div>
                </div>
            `
        },

        // 仕事運（有料コンテンツ）
        workFortune: {
            id: 'work-fortune',
            title: '仕事運',
            freePreview: false,
            order: 9,
            html: (data) => `
                <div class="fortune-banner-wrapper">
                    <img src="/images/banner/10-shigoto.png" alt="仕事運" class="fortune-main-banner">
                    
                    <div class="fortune-section career">
                        <div class="fortune-content">
                            <div class="fortune-highlight">
                                <h2>${data.workTitle || '仕事運のタイトル'}</h2>
                                <p>${data.workMainText || '仕事運の詳細がここに表示されます'}</p>
                            </div>
                            
                            ${data.workNewTalent ? `
                            <img src="/images/banner/work-1.png" alt="新たな才能" class="section-banner">
                            <div class="hanging-text">
                                <p>${data.workNewTalent}</p>
                            </div>
                            ` : ''}
                        </div>
                    </div>
                </div>
            `
        },

        // 金運（有料コンテンツ）
        moneyFortune: {
            id: 'money-fortune',
            title: '金運',
            freePreview: false,
            order: 10,
            html: (data) => `
                <div class="fortune-banner-wrapper">
                    <img src="/images/banner/11-kin.png" alt="金運" class="fortune-main-banner">
                    
                    <div class="fortune-section money">
                        <div class="fortune-content">
                            <div class="fortune-highlight">
                                <p>${data.moneyMainText || '金運の詳細がここに表示されます'}</p>
                            </div>
                            
                            ${data.moneyLuckyAction ? `
                            <img src="/images/banner/money-1.png" alt="ラッキーアクション" class="section-banner">
                            <div class="hanging-text">
                                <p>${data.moneyLuckyAction}</p>
                            </div>
                            ` : ''}
                        </div>
                    </div>
                </div>
            `
        },

        // 最終メッセージ（有料コンテンツ）
        finalMessage: {
            id: 'final-message',
            title: '月からの最終メッセージ',
            freePreview: false,
            order: 11,
            html: (data) => `
                <div class="final-message">
                    <img src="/images/banner/12-saigo.png" alt="月が教えてくれる5つの教え" class="full-width-banner">
                    <p>${data.finalMessage || '最終メッセージがここに表示されます'}</p>
                    
                    <img src="/images/banner/last.png" alt="月が教えてくれる最も重要なメッセージ" class="full-width-banner">
                    <p>${data.importantMessage || '重要なメッセージがここに表示されます'}</p>
                </div>
            `
        }
    },

    // セクションの取得（順序付き）
    getSortedSections() {
        return Object.values(this.sections).sort((a, b) => a.order - b.order);
    },

    // 特定のセクションを取得
    getSection(id) {
        return Object.values(this.sections).find(section => section.id === id);
    },

    // プレビュー可能なセクションのみ取得
    getPreviewSections() {
        return this.getSortedSections().filter(section => section.freePreview);
    },

    // 有料セクションのみ取得
    getPaidSections() {
        return this.getSortedSections().filter(section => !section.freePreview);
    }
};

// エクスポート（他のJSファイルから使用可能）
if (typeof module !== 'undefined' && module.exports) {
    module.exports = DIAGNOSIS_CONTENT;
}