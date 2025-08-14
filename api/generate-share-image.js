// 動的OGP画像生成API
// Vercelの@vercel/ogパッケージを使用した実装

export const config = {
  runtime: 'edge',
};

export default async function handler(req) {
  try {
    const { searchParams } = new URL(req.url);
    const moonType = searchParams.get('type') || '';
    
    // 月タイプごとの絵文字
    const moonEmojis = {
      '新月': '🌑',
      '三日月': '🌒', 
      '上弦の月': '🌓',
      '十三夜': '🌔',
      '満月': '🌕',
      '十六夜': '🌖',
      '下弦の月': '🌗',
      '暁': '🌘'
    };
    
    // SVGで画像を生成
    const svg = `
      <svg width="1200" height="630" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:#667eea;stop-opacity:1" />
            <stop offset="100%" style="stop-color:#764ba2;stop-opacity:1" />
          </linearGradient>
        </defs>
        
        <!-- 背景 -->
        <rect width="1200" height="630" fill="url(#bg)"/>
        
        <!-- 装飾の円 -->
        <circle cx="200" cy="200" r="150" fill="rgba(255,255,255,0.1)"/>
        <circle cx="1000" cy="450" r="200" fill="rgba(255,255,255,0.1)"/>
        
        <!-- タイトル -->
        <text x="600" y="150" font-family="sans-serif" font-size="72" font-weight="bold" fill="white" text-anchor="middle">
          おつきさま診断
        </text>
        
        <!-- 月の絵文字 -->
        <text x="600" y="330" font-size="180" text-anchor="middle">
          ${moonEmojis[moonType] || '🌙'}
        </text>
        
        <!-- 月タイプ名 -->
        ${moonType ? `
          <text x="600" y="430" font-family="sans-serif" font-size="56" font-weight="bold" fill="#ffd700" text-anchor="middle">
            ${moonType}タイプ
          </text>
        ` : ''}
        
        <!-- サブテキスト -->
        <text x="600" y="500" font-family="sans-serif" font-size="32" fill="white" text-anchor="middle">
          生まれた日の月があなたの
        </text>
        <text x="600" y="545" font-family="sans-serif" font-size="32" fill="white" text-anchor="middle">
          本当の性格と恋愛スタイルを教えます
        </text>
        
        <!-- URL -->
        <text x="600" y="590" font-family="sans-serif" font-size="24" fill="rgba(255,255,255,0.8)" text-anchor="middle">
          love-tsukuyomi.com/moon
        </text>
      </svg>
    `;
    
    // SVGをPNGに変換して返す
    return new Response(svg, {
      headers: {
        'Content-Type': 'image/svg+xml',
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    });
  } catch (error) {
    return new Response('Error generating image', { status: 500 });
  }
}