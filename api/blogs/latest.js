export default async function handler(req, res) {
  // CORS設定
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const microcmsConfig = {
    serviceDomain: process.env.MICROCMS_SERVICE_DOMAIN,
    apiKey: process.env.MICROCMS_API_KEY
  };

  if (!microcmsConfig.serviceDomain || !microcmsConfig.apiKey) {
    return res.status(503).json({ error: 'microCMS is not configured.' });
  }

  const limitParam = parseInt(req.query.limit, 10);
  const limit = Number.isNaN(limitParam) ? 6 : Math.min(Math.max(limitParam, 1), 12);

  function getBlogExcerpt(content = '', length = 110) {
    if (typeof content !== 'string') return '';
    const textOnly = content.replace(/<[^>]*>/g, '').trim();
    return textOnly.length > length ? textOnly.substring(0, length) + '…' : textOnly;
  }

  try {
    const endpoint = `https://${microcmsConfig.serviceDomain}.microcms.io/api/v1/blogs`;

    const response = await fetch(endpoint, {
      headers: {
        'X-MICROCMS-API-KEY': microcmsConfig.apiKey
      }
    });

    if (!response.ok) {
      throw new Error(`microCMS API error: ${response.status}`);
    }

    const data = await response.json();
    const contents = (data?.contents || []).map(item => ({
      id: item.id,
      title: item.title,
      excerpt: getBlogExcerpt(item.content),
      eyecatchUrl: item.eyecatch?.url || null,
      category: item.category?.name || '',
      publishedAt: item.publishedAt || item.createdAt,
      link: `/blog/${item.id}`
    }));

    // limitを適用
    const limitedContents = contents.slice(0, limit);

    res.status(200).json({ contents: limitedContents });
  } catch (error) {
    console.error('microCMS fetch error:', error.message);
    res.status(500).json({ error: 'Failed to fetch blog posts.' });
  }
}