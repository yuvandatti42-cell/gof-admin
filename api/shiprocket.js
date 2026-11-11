/**
 * Serverless Proxy for Shiprocket API
 * Runs on Node.js to bypass browser CORS restrictions
 */

export default async function handler(req, res) {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization, x-shiprocket-endpoint'
  );

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Determine endpoint
  const endpoint = req.query.endpoint || req.headers['x-shiprocket-endpoint'];
  if (!endpoint) {
    return res.status(400).json({ error: 'Shiprocket endpoint is required' });
  }

  const cleanEndpoint = String(endpoint).startsWith('/') ? endpoint : `/${endpoint}`;
  const targetUrl = `https://apiv2.shiprocket.in/v1/external${cleanEndpoint}`;

  try {
    const headers = {
      'Content-Type': 'application/json',
    };
    if (req.headers.authorization) {
      headers['Authorization'] = req.headers.authorization;
    }

    const fetchOptions = {
      method: req.method,
      headers,
    };

    if (req.method !== 'GET' && req.method !== 'HEAD' && req.body) {
      fetchOptions.body = typeof req.body === 'string' ? req.body : JSON.stringify(req.body);
    }

    const upstreamRes = await fetch(targetUrl, fetchOptions);
    const contentType = upstreamRes.headers.get('content-type') || '';

    if (contentType.includes('application/json')) {
      const data = await upstreamRes.json();
      return res.status(upstreamRes.status).json(data);
    } else {
      const text = await upstreamRes.text();
      return res.status(upstreamRes.status).send(text);
    }
  } catch (err) {
    console.error('[Shiprocket Proxy Error]', err);
    return res.status(500).json({ error: err.message || 'Shiprocket proxy execution failed' });
  }
}
