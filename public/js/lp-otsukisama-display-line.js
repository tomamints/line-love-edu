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
                    💫 4つの恋愛タイプ診断結果を表示するには
                </h3>
                <p style="color: #fff; line-height: 1.8; margin-bottom: 20px;">
                    LINE公式アカウントで診断を受けてください
                </p>
                <div style="background: rgba(0,0,0,0.3); padding: 20px; border-radius: 10px; margin: 20px 0;">
                    <p style="color: #87ceeb; font-size: 14px; margin-bottom: 10px;">
                        📱 診断の受け方：
                    </p>
                    <ol style="text-align: left; color: #ccc; line-height: 1.8; margin: 0 auto; max-width: 400px;">
                        <li>下のボタンからLINE公式アカウントを友だち追加</li>
                        <li>「恋愛タイプ診断」メニューを選択</li>
                        <li>7つの質問に回答</li>
                        <li>診断完了後、専用URLからこのページで結果が見られます</li>
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
                    📱 LINEで診断を始める
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