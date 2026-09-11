// Optional Cloudflare Worker example. Deploy only to an endpoint you control.
// This measures HTTP response-header time from the browser, not origin/region latency.
// An edge Worker may respond at a nearby edge, not at your backend server location.
export default {
  async fetch(request) {
    const headers = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Cache-Control': 'no-store'
    }
    if (request.method === 'OPTIONS' || request.method === 'GET') {
      return new Response(null, {status:204, headers})
    }
    return new Response('Method not allowed', {status:405, headers})
  }
}
