const KEY = 'c4e8b1a07d935f26e1a8c0b47d6f3921';
const HOST = 'athreya.codes';
const URLS = [`https://${HOST}/`];

const response = await fetch('https://api.indexnow.org/indexnow', {
  method: 'POST',
  headers: { 'content-type': 'application/json; charset=utf-8' },
  body: JSON.stringify({
    host: HOST,
    key: KEY,
    keyLocation: `https://${HOST}/${KEY}.txt`,
    urlList: URLS
  })
});

if (!response.ok) {
  const body = await response.text();
  throw new Error(`IndexNow ${response.status}: ${body}`);
}

console.log(`indexnow: submitted ${URLS.join(', ')}`);
