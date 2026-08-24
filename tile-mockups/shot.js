// Screenshot helper: node shot.js <file-or-url> <out.png> [width] [height] [fullPage] [waitMs]
const { chromium } = require('/opt/node22/lib/node_modules/playwright');
(async () => {
  const [,, target, out, w='1440', h='900', full='false', wait='1400'] = process.argv;
  const browser = await chromium.launch({ args:['--no-sandbox','--force-color-profile=srgb'] });
  const page = await browser.newPage({
    viewport:{ width:+w, height:+h }, deviceScaleFactor: 2,
  });
  const url = target.startsWith('http') ? target : 'file://' + require('path').resolve(target);
  await page.goto(url, { waitUntil:'networkidle', timeout: 60000 }).catch(e=>console.error('nav:',e.message));
  await page.waitForTimeout(+wait);
  await page.screenshot({ path: out, fullPage: full === 'true' });
  const errs = [];
  page.on('pageerror', e => errs.push(e.message));
  await browser.close();
  console.log('shot ->', out);
})();
