const fs = require('fs');
const https = require('https');

const SUPABASE_URL = "https://zqqpknqexsnskowhiwfj.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpxcXBrbnFleHNuc2tvd2hpd2ZqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODExMzE2MjQsImV4cCI6MjA5NjcwNzYyNH0.hcD0__qb6FNhpgAyyU0F7RFZyewJrkt2WR4E79UJP9E";
const BASE_URL = "https://sharkawey.netlify.app"; // غير الرابط دا لرابط موقعك بعد النشر

function fetch(path, opts = {}) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, SUPABASE_URL);
    const req = https.request({
      hostname: url.hostname,
      path: url.pathname + url.search,
      method: opts.method || 'GET',
      headers: {
        'apikey': SUPABASE_KEY,
        'Authorization': 'Bearer ' + SUPABASE_KEY,
        'Content-Type': 'application/json',
        ...(opts.headers || {})
      }
    }, (res) => {
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => resolve({ status: res.statusCode, body: data }));
    });
    req.on('error', reject);
    if (opts.body) req.write(typeof opts.body === 'string' ? opts.body : JSON.stringify(opts.body));
    req.end();
  });
}

(async () => {
  const r = await fetch('/rest/v1/products?select=id,images&order=id');
  if (r.status !== 200) { console.log('Error fetching products:', r.status); return; }
  const products = JSON.parse(r.body);
  console.log('Products: ' + products.length);

  let updated = 0;
  for (const p of products) {
    if (!p.images) continue;
    const parts = p.images.split(',').map(s => s.trim()).filter(Boolean);
    const newParts = parts.map(img => {
      if (img.startsWith('http://') || img.startsWith('https://')) return img;
      if (img.startsWith(BASE_URL)) return img;
      return BASE_URL + '/' + encodeURIComponent(img);
    });
    const newImages = newParts.join(',');
    if (newImages !== p.images) {
      await fetch('/rest/v1/products?id=eq.' + p.id, { method: 'PATCH', body: { images: newImages } });
      console.log('  ✅ ID ' + p.id + ': ' + p.images + ' → ' + newImages);
      updated++;
    }
  }
  console.log('\n✅ Updated ' + updated + ' products');
})();
