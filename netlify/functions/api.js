const RAILWAY_API_URL = process.env.RAILWAY_API_URL || 'https://patterson-production.up.railway.app';

function shouldBase64Encode(contentType) {
  if (!contentType) return true;
  const lower = contentType.toLowerCase();
  return !(lower.includes('application/json') || lower.startsWith('text/'));
}

exports.handler = async function (event) {
  const path = event.path.replace('/.netlify/functions/api', '') || '/';
  const query = event.rawQuery ? `?${event.rawQuery}` : '';
  const url = `${RAILWAY_API_URL}${path}${query}`;

  const headers = { ...event.headers };
  delete headers.host;

  const options = {
    method: event.httpMethod,
    headers,
    body: event.body ? (event.isBase64Encoded ? Buffer.from(event.body, 'base64') : event.body) : undefined
  };

  const response = await fetch(url, options);
  const contentType = response.headers.get('content-type') || '';
  const buffer = Buffer.from(await response.arrayBuffer());
  const isBase64Encoded = shouldBase64Encode(contentType);

  return {
    statusCode: response.status,
    headers: {
      'content-type': contentType,
      'access-control-allow-origin': '*'
    },
    body: isBase64Encoded ? buffer.toString('base64') : buffer.toString(),
    isBase64Encoded
  };
};
