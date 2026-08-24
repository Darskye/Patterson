// Capture a page at several scroll positions: node scroll-shots.js <file> <outPrefix> [w] [h] [n]
const { chromium } = require('/opt/node22/lib/node_modules/playwright');
(async () => {
  const [,, target, prefix, w='1440', h='900', n='6'] = process.argv;
  const browser = await chromium.launch({ args:['--no-sandbox'] });
  const page = await browser.newPage({ viewport:{width:+w,height:+h}, deviceScaleFactor:1.5 });
  const errors = [];
  page.on('pageerror', e => errors.push('PAGEERROR: ' + e.message));
  page.on('console', m => { if (m.type()==='error') errors.push('CONSOLE: ' + m.text()); });
  await page.goto('file://' + require('path').resolve(target), { waitUntil:'networkidle', timeout:60000 });
  await page.waitForTimeout(2500);
  const total = await page.evaluate(() => document.documentElement.scrollHeight);
  console.log('scrollHeight', total);
  const steps = +n;
  for (let i=0;i<steps;i++){
    const y = Math.round((total - +h) * (i/(steps-1||1)));
    await page.evaluate(yy => window.scrollTo({top:yy, behavior:'instant'}), y);
    await page.waitForTimeout(1500);
    await page.screenshot({ path: `${prefix}-${String(i).padStart(2,'0')}.png` });
  }
  if (errors.length) console.log('--- ERRORS ---\n' + errors.slice(0,20).join('\n'));
  else console.log('no js errors');
  await browser.close();
})();
