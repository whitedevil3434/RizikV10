const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();
  
  page.on('console', msg => console.log('BROWSER CONSOLE:', msg.type(), msg.text()));
  page.on('pageerror', error => console.log('BROWSER ERROR:', error.message));

  try {
    await page.goto('https://codex-clink-integration.clink-web-5wx.pages.dev', { waitUntil: 'networkidle' });
    
    await page.fill('input[name="intent"]', 'I need 500kg of premium beef by next Friday');
    await page.click('button[type="submit"]');
    
    await page.waitForTimeout(2000); 
    await page.screenshot({ path: './ui_tests/live_test.png' });
    console.log("Live test complete.");
  } catch (error) {
    console.error("Test failed:", error);
  } finally {
    await browser.close();
  }
})();
