// おつきさま診断 - レンダリングロジック
// プレビューと完全版の表示制御を管理

class DiagnosisRenderer {
    constructor(mode = 'preview') {
        this.mode = mode; // 'preview' or 'full'
        this.diagnosisData = null;
    }

    // 診断データの読み込み
    async loadDiagnosisData(diagnosisId) {
        try {
            // URLパラメータから診断IDとuserIdを取得
            const urlParams = new URLSearchParams(window.location.search);
            if (!diagnosisId) {
                diagnosisId = urlParams.get('id');
            }
            const userId = urlParams.get('userId');

            // userIdがある場合はAPIからデータを取得
            if (userId) {
                try {
                    const response = await fetch(`/api/get-love-profile?userId=${userId}`);
                    const data = await response.json();
                    
                    if (data.profile) {
                        const profile = data.profile;
                        const birthdateValue = profile.birthDate || profile.birthdate;
                        const nameValue = profile.userName || profile.user_name || profile.name || 'あなた';
                        // プロファイルデータから必要な情報を取得
                        const birthDate = birthdateValue ? new Date(birthdateValue) : null;
                        const rawPatternId = profile.moonPatternId || (birthDate ? this.calculatePatternFromDate(birthDate) : 0);
                        const patternIdNumber = Number(rawPatternId);
                        const patternId = Number.isFinite(patternIdNumber) ? patternIdNumber : 0;
                        
                        // パターンデータの読み込み
                        await this.loadPatternData(patternId);
                        
                        // 4軸データも取得
                        this.diagnosisData = {
                            name: nameValue,
                            userName: nameValue,
                            birthDate: birthdateValue,
                            birthdate: birthdateValue,
                            patternId: patternId,
                            emotionalType: profile.emotionalExpression || profile.emotional_expression,
                            distanceType: profile.distanceStyle || profile.distance_style,
                            valuesType: profile.loveValues || profile.love_values,
                            energyType: profile.loveEnergy || profile.love_energy,
                            ...this.patternData
                        };
                        
                        return this.diagnosisData;
                    }
                } catch (apiError) {
                    console.error('APIからのデータ取得エラー:', apiError);
                }
            }

            // フォールバック：ローカルストレージから読み込み
            const storedData = localStorage.getItem('otsukisama_diagnosis');
            if (storedData) {
                const parsedData = JSON.parse(storedData);
                
                // パターンデータの読み込み
                await this.loadPatternData(parsedData.patternId);
                
                this.diagnosisData = {
                    ...parsedData,
                    ...this.patternData
                };
                
                return this.diagnosisData;
            }
            
            throw new Error('診断データが見つかりません');
        } catch (error) {
            console.error('診断データの読み込みに失敗しました:', error);
            throw error;
        }
    }
    
    // 生年月日からパターンIDを計算
    calculatePatternFromDate(birthDate) {
        const date = new Date(birthDate);
        const dayOfMonth = date.getDate();
        const month = date.getMonth() + 1;
        const year = date.getFullYear();
        
        // 表の月相（1-31日を8段階に分類）
        let moonPhaseIndex;
        if (dayOfMonth <= 4) moonPhaseIndex = 0;
        else if (dayOfMonth <= 8) moonPhaseIndex = 1;
        else if (dayOfMonth <= 12) moonPhaseIndex = 2;
        else if (dayOfMonth <= 16) moonPhaseIndex = 3;
        else if (dayOfMonth <= 20) moonPhaseIndex = 4;
        else if (dayOfMonth <= 24) moonPhaseIndex = 5;
        else if (dayOfMonth <= 28) moonPhaseIndex = 6;
        else moonPhaseIndex = 7;
        
        // 裏の月相
        const hiddenPhaseIndex = ((month - 1) + (year % 8)) % 8;
        
        return moonPhaseIndex * 8 + hiddenPhaseIndex;
    }

    // パターンデータの読み込み
    async loadPatternData(patternId) {
        try {
            // 新システムFortuneDisplayから生成された基本パターンを使用
            const moonPhases = ['新月', '三日月', '上弦の月', '満月寄りの月', '満月', '欠けていく月', '下弦の月', '鎮静の月'];
            const moonPhaseIndex = Math.floor(patternId / 8);
            const hiddenPhaseIndex = patternId % 8;
            
            this.patternData = {
                moonPhase: moonPhases[moonPhaseIndex],
                hiddenPhase: moonPhases[hiddenPhaseIndex],
                moonPhaseIndex: moonPhaseIndex,
                hiddenPhaseIndex: hiddenPhaseIndex,
                // FortuneDisplayが動的に生成する内容のプレースホルダー
                // 実際のコンテンツはlp-otsukisama-display.jsのupdateDynamicContentFromPatternで設定
                phaseDescriptionTitle: '',
                phaseDescriptionText: '',
                hiddenPhaseTitle: '',
                hiddenPhaseMainText1: '',
                hiddenPhaseBulletPoints: [],
                hiddenPhaseMainText2: '',
                overallTitle: '',
                overallIntro: '',
                overallMainText: '',
                month1: '',
                month2: '',
                month3: '',
                loveMainText: '',
                loveDestinyMeeting: '',
                loveAdmirerType: '',
                workTitle: '',
                workMainText: '',
                workNewTalent: '',
                relationshipMainText: '',
                relationshipNewConnections: '',
                moneyMainText: '',
                moneyPeakTiming: ''
            };
        } catch (error) {
            console.error('パターンデータの読み込みに失敗しました:', error);
        }
    }

    // メインのレンダリング処理
    async render(containerId = 'content') {
        const container = document.getElementById(containerId);
        if (!container) {
            console.error(`Container with id '${containerId}' not found`);
            return;
        }

        // コンテナをクリア
        container.innerHTML = '';

        // セクションを順番に表示
        const sections = DIAGNOSIS_CONTENT.getSortedSections();
        
        for (const section of sections) {
            const shouldRender = this.shouldRenderSection(section);
            
            if (shouldRender) {
                const sectionElement = this.renderSection(section);
                if (sectionElement) {
                    container.appendChild(sectionElement);
                }
            }
        }

        // プレビューモードの場合、CTAを追加
        if (this.mode === 'preview') {
            container.appendChild(this.createCTA());
        }
    }

    // セクションを表示すべきか判定
    shouldRenderSection(section) {
        if (this.mode === 'full') {
            return true; // フルモードでは全て表示
        }
        
        // プレビューモードでは無料コンテンツのみ、または有料コンテンツをぼかし表示
        return true; // ぼかし表示も含めて全セクション表示
    }

    // セクションのレンダリング
    renderSection(section) {
        const wrapper = document.createElement('div');
        wrapper.className = `content-section section-${section.id}`;
        wrapper.setAttribute('data-section-id', section.id);
        
        // プレビューモードで有料コンテンツの場合
        if (this.mode === 'preview' && !section.freePreview) {
            wrapper.classList.add('content-locked');
            wrapper.innerHTML = this.createLockedContent(section);
        } else if (this.mode === 'preview' && section.previewMode === 'partial') {
            // 部分表示の場合
            wrapper.innerHTML = section.html(this.diagnosisData || {});
            wrapper.classList.add('content-partial');
            this.addPartialOverlay(wrapper);
        } else {
            // 通常表示
            wrapper.innerHTML = section.html(this.diagnosisData || {});
        }
        
        return wrapper;
    }

    // ロックされたコンテンツの作成
    createLockedContent(section) {
        // プレースホルダーコンテンツを生成
        const placeholderHTML = section.html({
            name: this.diagnosisData?.name || 'あなた',
            moonPhase: this.diagnosisData?.moonPhase || '???',
            hiddenPhase: this.diagnosisData?.hiddenPhase || '???',
            overallMainText: 'この部分には、あなたの運勢に関する詳細な情報が表示されます...',
            loveMainText: 'あなたの恋愛運について、詳しい内容がここに表示されます...',
            workMainText: '仕事運の詳細がここに表示されます...',
            relationshipMainText: '人間関係運の詳細がここに表示されます...',
            moneyMainText: '金運の詳細がここに表示されます...'
        });
        
        return `
            <div class="locked-content-wrapper">
                <div class="blurred-background">
                    ${placeholderHTML}
                </div>
                <div class="lock-overlay">
                    <div class="lock-message">
                        <span class="lock-icon">🔒</span>
                        <h3>${section.title}</h3>
                        <p>このコンテンツを見るには<br>診断結果を購入してください</p>
                        <button class="unlock-button" onclick="scrollToCTA()">
                            完全版を見る
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    // 部分表示のオーバーレイ追加
    addPartialOverlay(wrapper) {
        const descriptions = wrapper.querySelectorAll('.detail-card p, .type-description');
        descriptions.forEach(desc => {
            desc.style.filter = 'blur(5px)';
            desc.style.userSelect = 'none';
        });
        
        const overlay = document.createElement('div');
        overlay.className = 'partial-overlay';
        overlay.innerHTML = `
            <p class="partial-message">
                詳細な解説は完全版でご覧いただけます
            </p>
        `;
        wrapper.appendChild(overlay);
    }

    // CTAセクションの作成
    createCTA() {
        const ctaSection = document.createElement('div');
        ctaSection.className = 'cta-section';
        ctaSection.id = 'cta-section';
        ctaSection.innerHTML = `
            <div class="cta-wrapper">
                <h2 class="cta-title">
                    🌙 完全版で全ての運勢を解放しましょう
                </h2>
                
                <div class="cta-benefits">
                    <div class="benefit-item">
                        <span class="benefit-icon">✨</span>
                        <p>全ての運勢詳細</p>
                    </div>
                    <div class="benefit-item">
                        <span class="benefit-icon">💝</span>
                        <p>恋愛運の完全解析</p>
                    </div>
                    <div class="benefit-item">
                        <span class="benefit-icon">💰</span>
                        <p>金運アップの秘訣</p>
                    </div>
                    <div class="benefit-item">
                        <span class="benefit-icon">📅</span>
                        <p>3ヶ月の詳細予測</p>
                    </div>
                </div>
                
                <div class="price-section" style="background: rgba(255, 255, 255, 0.96); padding: 18px 20px; border-radius: 14px; border: 1px solid rgba(118, 75, 162, 0.2); text-align: center; color: #4a0e6b; box-shadow: 0 10px 22px rgba(0, 0, 0, 0.08);">
                    <div class="campaign-price" style="display: flex; flex-direction: column; align-items: center; gap: 6px;">
                    <div class="campaign-title" style="font-size: 15px; color: #d67b00; letter-spacing: 0.08em; font-weight: 600;">スーパームーン企画 第一弾</div>
                        <div style="display: flex; flex-direction: column; align-items: center; gap: 4px;">
                            <div class="original-price" style="font-size: 14px; color: rgba(74, 14, 107, 0.65); text-decoration: line-through;">通常価格 ¥9,980</div>
                            <div style="font-size: 13px; color: #d67b00; font-weight: 600;">↓（7割引）</div>
                        </div>
                        <div class="special-price" style="display: flex; align-items: baseline; gap: 6px;">
                            <span class="price-label" style="font-size: 16px; color: #4a0e6b; font-weight: 600;">今だけ</span>
                            <span class="price-amount" style="font-size: 32px; font-weight: 700; color: #d67b00;">¥2,980</span>
                            <span class="price-tax" style="font-size: 13px; color: rgba(74, 14, 107, 0.65);">（税込）</span>
                        </div>
                        <div style="font-size: 13px; color: rgba(74, 14, 107, 0.75);">70%OFF + お電話恋愛鑑定つき</div>
                        </div>
                    </div>
                </div>
                
                <button class="cta-button" onclick="proceedToPayment()">
                    今すぐ完全版を購入する
                    <span class="button-subtitle">安全な決済で即座に閲覧可能</span>
                </button>
                
                <div class="payment-methods">
                    <p>利用可能な決済方法</p>
                    <div class="payment-icons">
                        <span>💳 クレジットカード</span>
                        <span>📱 Apple Pay</span>
                        <span>💠 Google Pay</span>
                    </div>
                </div>
                
                <div class="guarantee">
                    <p>🔒 SSL暗号化通信で安全にお支払い</p>
                    <p>📧 購入後すぐにメールで結果をお届け</p>
                </div>
            </div>
        `;
        
        return ctaSection;
    }
}

// グローバル関数（HTMLから呼び出し可能）
function scrollToCTA() {
    const ctaSection = document.getElementById('cta-section');
    if (ctaSection) {
        ctaSection.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
}

async function proceedToPayment() {
    // 決済処理（TODO: 実装）
    alert('決済機能は準備中です。');
    
    // 将来的にはStripeなどの決済処理を実装
    // const diagnosisId = getDiagnosisId();
    // window.location.href = `/api/payment/checkout?diagnosis_id=${diagnosisId}`;
}

// ページ読み込み時の自動初期化（必要に応じて）
if (typeof window !== 'undefined') {
    window.DiagnosisRenderer = DiagnosisRenderer;
}
