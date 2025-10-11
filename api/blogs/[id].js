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

  const { id } = req.query;

  if (!id) {
    return res.status(400).json({ error: 'Article ID is required' });
  }

  const microcmsConfig = {
    serviceDomain: process.env.MICROCMS_SERVICE_DOMAIN,
    apiKey: process.env.MICROCMS_API_KEY
  };

  if (!microcmsConfig.serviceDomain || !microcmsConfig.apiKey) {
    return res.status(503).json({ error: 'microCMS is not configured.' });
  }

  try {
    const endpoint = `https://${microcmsConfig.serviceDomain}.microcms.io/api/v1/blogs/${id}`;

    const response = await fetch(endpoint, {
      headers: {
        'X-MICROCMS-API-KEY': microcmsConfig.apiKey
      }
    });

    if (!response.ok) {
      if (response.status === 404) {
        return res.status(404).json({ error: 'Article not found' });
      }
      throw new Error(`microCMS API error: ${response.status}`);
    }

    const article = await response.json();

    // レスポンス形式を整形
    const formattedArticle = {
      id: article.id,
      title: article.title,
      content: article.content,
      eyecatchUrl: article.eyecatch?.url || null,
      category: article.category?.name || '',
      publishedAt: article.publishedAt || article.createdAt,
      createdAt: article.createdAt,
      updatedAt: article.updatedAt
    };

    res.status(200).json(formattedArticle);
  } catch (error) {
    console.error('microCMS fetch error:', error.message);
    res.status(500).json({ error: 'Failed to fetch article.' });
  }
}