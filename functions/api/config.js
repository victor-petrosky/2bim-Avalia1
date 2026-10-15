export function onRequestGet({ env }) {
  return Response.json({ clientId: env.GOOGLE_CLIENT_ID || '' }, {
    status: env.GOOGLE_CLIENT_ID ? 200 : 503,
    headers: { 'Cache-Control': 'no-store' },
  });
}
