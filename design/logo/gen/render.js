const { chromium } = require('playwright'); const fs = require('fs');
(async () => {
  const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1024, height: 1024 } });
  for (const n of ['icon', 'logo', 'android-fg', 'android-mono']) {
    await p.setContent(`<html><body style="margin:0;background:transparent">${fs.readFileSync('gen/' + n + '.svg', 'utf8')}</body></html>`);
    await p.waitForTimeout(300);
    await p.locator('svg').screenshot({ path: `gen/${n}.png`, omitBackground: true });
  }
  await b.close();
})();
