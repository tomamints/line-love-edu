// LINE誘導メッセージを表示
function displayLineRedirectMessage() {
    // 4軸セクションに案内メッセージを表示
    const loveTypeCards = document.querySelectorAll('.love-type-card');
    if (loveTypeCards.length > 0) {
        // 最初のカードに案内メッセージを挿入
        const messageCard = document.createElement('div');
        messageCard.className = 'no-profile-message';
        messageCard.innerHTML = `
            <div style="background: linear-gradient(135deg, rgba(255,215,0,0.1), rgba(255,100,100,0.1)); 
                        border: 2px dashed #ffd700; 
                        border-radius: 15px; 
                        padding: 30px; 
                        margin-bottom: 30px;
                        text-align: center;">
                <h3 style="color: #ffd700; margin-bottom: 15px;">
                    🌙 より詳しい診断結果を見るには
                </h3>
                <p style="color: #fff; line-height: 1.8; margin-bottom: 20px;">
                    月詠のLINE公式アカウントで、あなただけの詳細な運勢をお届けします
                </p>
                <div style="background: rgba(0,0,0,0.3); padding: 20px; border-radius: 10px; margin: 20px 0;">
                    <p style="color: #87ceeb; font-size: 14px; margin-bottom: 10px;">
                        月詠のLINEで受けられること：
                    </p>
                    <ol style="text-align: left; color: #ccc; line-height: 1.8; margin: 0 auto; max-width: 400px;">
                        <li>今日の月齢に合わせた運勢メッセージ</li>
                        <li>毎週の運勢グラフ更新</li>
                        <li>月相別の開運アドバイス</li>
                        <li>あなただけの特別な月のメッセージ</li>
                    </ol>
                </div>
                <a href="https://line.me/R/ti/p/%40644vtivc" 
                   class="line-cta-button" 
                   style="display: inline-block; 
                          background: linear-gradient(135deg, #00B900, #00D700); 
                          color: white; 
                          padding: 15px 40px; 
                          border-radius: 30px; 
                          text-decoration: none;
                          font-weight: bold;
                          font-size: 16px;
                          box-shadow: 0 4px 15px rgba(0,185,0,0.3);
                          transition: all 0.3s ease;">
                    🌙 LINE友だち追加
                </a>
            </div>
        `;
        
        // 既存のメッセージカードがあれば削除
        const existingMessage = document.querySelector('.no-profile-message');
        if (existingMessage) {
            existingMessage.remove();
        }
        
        // 親要素の先頭に挿入
        const parentContainer = loveTypeCards[0].parentElement;
        parentContainer.insertBefore(messageCard, parentContainer.firstChild);
    }
    
    // 6つの回転要素も非表示にする
    const sixElements = document.querySelector('.six-elements-container');
    if (sixElements) {
        sixElements.style.display = 'none';
    }
}