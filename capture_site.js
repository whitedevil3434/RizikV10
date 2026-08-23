const { chromium } = require('playwright');
const path = require('path');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  console.log("Navigating to the site...");
  await page.goto('https://rizikecosystem.com/clink/actor', { waitUntil: 'networkidle' });
  
  // Wait a bit for any dynamic content/animations to load
  await page.waitForTimeout(3000);
  
  const screenshotPath = '/Users/sabbir/.gemini/antigravity/brain/23656ace-e191-47bf-a20c-cbf7f98f4497/scratch/site_preview.png';
  await page.screenshot({ path: screenshotPath, fullPage: true });
  
  console.log(`Screenshot saved to: ${screenshotPath}`);
  await browser.close();
})();
