const puppeteer = require('puppeteer');
const http = require('http');
const url = require('url');

http.createServer(async (req, res) => {
  const query = url.parse(req.url, true).query;
  const id = query.id;
  if (!id) {
    res.end("Iltimos, id parameter bilan kiriting: ?id=6039141");
    return;
  }

  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.goto('https://mandat.uzbmb.uz/', { waitUntil: 'networkidle0' });

  // 1‑page: ID kiritish va qidirish
  await page.type('input[name="ID"]', id);
  await Promise.all([
    page.click('button[type="submit"]'),
    page.waitForNavigation({ waitUntil: 'networkidle0' })
  ]);

  // 2‑page: Batafsil tugmasini bosish
  await Promise.all([
    page.click('a', { text: 'Batafsil' }),
    page.waitForNavigation({ waitUntil: 'networkidle0' })
  ]);

  // 3‑4 page: Ma’lumotlarni yig‘ish
  const data = await page.evaluate(() => {
    const result = {};
    document.querySelectorAll('tr').forEach(tr => {
      const td = tr.querySelectorAll('td');
      if (td.length === 2) {
        const label = td[0].innerText.trim();
        const value = td[1].innerText.trim();
        result[label] = value;
      }
    });
    return result;
  });

  await browser.close();

  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify(data, null, 2));
}).listen(3000, () => console.log('Server port 3000'));