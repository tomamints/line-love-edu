// LIFF設定を動的に取得
window.LIFF_CONFIG = {
    liffId: '', // サーバーから動的に取得
    apiUrl: '' // サーバーから動的に取得
};

// 設定を取得
async function fetchLiffConfig() {
    try {
        const response = await fetch('/api/liff-config');
        const config = await response.json();
        window.LIFF_CONFIG = config;
        return config;
    } catch (error) {
        console.error('LIFF設定の取得に失敗:', error);
        // フォールバック
        return {
            liffId: '2006754848-5GVVkzzV',
            apiUrl: window.location.origin + '/api/save-profile'
        };
    }
}