import type { RequestHandler } from './$types';

const HOP_BY_HOP_HEADERS = new Set([
  'connection',
  'content-encoding',
  'content-length',
  'keep-alive',
  'proxy-authenticate',
  'proxy-authorization',
  'te',
  'trailer',
  'transfer-encoding',
  'upgrade'
]);

function getApiBaseUrl() {
  return (process.env.PRIVATE_SERVER_URL || process.env.PUBLIC_SERVER_URL || '').replace(/\/$/, '');
}

function copyRequestHeaders(request: Request, url: URL) {
  const headers = new Headers(request.headers);

  headers.delete('host');
  headers.delete('connection');
  headers.delete('content-length');
  headers.set('x-forwarded-host', url.host);
  headers.set('x-forwarded-proto', url.protocol.replace(':', ''));

  return headers;
}

function copyResponseHeaders(response: Response) {
  const headers = new Headers();

  response.headers.forEach((value, key) => {
    if (!HOP_BY_HOP_HEADERS.has(key.toLowerCase()) && key.toLowerCase() !== 'set-cookie') {
      headers.set(key, value);
    }
  });

  const getSetCookie = (response.headers as unknown as { getSetCookie?: () => string[] }).getSetCookie;
  const cookies = getSetCookie?.call(response.headers) ?? [];
  if (cookies.length) {
    for (const cookie of cookies) headers.append('set-cookie', cookie);
  } else {
    const cookie = response.headers.get('set-cookie');
    if (cookie) headers.append('set-cookie', cookie);
  }

  return headers;
}

const handler: RequestHandler = async ({ params, request, url }) => {
  const apiBaseUrl = getApiBaseUrl();
  if (!apiBaseUrl) {
    return new Response('API proxy is not configured', { status: 500 });
  }

  const target = new URL(`${apiBaseUrl}/${params.path ?? ''}`);
  target.search = url.search;

  const method = request.method.toUpperCase();
  const body = method === 'GET' || method === 'HEAD' ? undefined : await request.arrayBuffer();

  const upstream = await fetch(target, {
    method,
    headers: copyRequestHeaders(request, url),
    body,
    redirect: 'manual'
  });

  return new Response(upstream.body, {
    status: upstream.status,
    statusText: upstream.statusText,
    headers: copyResponseHeaders(upstream)
  });
};

export const GET = handler;
export const POST = handler;
export const PUT = handler;
export const PATCH = handler;
export const DELETE = handler;
export const OPTIONS = handler;
