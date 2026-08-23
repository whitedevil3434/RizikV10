const { chromium } = require('playwright');
const path = require('path');

(async () => {
  console.log("Launching browser to test live Cloudflare deployment...");
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    recordVideo: {
      dir: './ui_tests/videos/',
      size: { width: 1280, height: 720 }
    },
    viewport: { width: 1280, height: 720 }
  });
  
  const page = await context.newPage();
  
  page.on('console', msg => console.log('BROWSER CONSOLE:', msg.type(), msg.text()));

  try {
    const targetUrl = 'https://e7fa229f.clink-web-5wx.pages.dev';
    console.log(`Navigating to ${targetUrl}`);
    await page.goto(targetUrl, { waitUntil: 'networkidle' });
    
    console.log("Waiting for mosaic grid to appear...");
    await page.waitForSelector('.mosaic-canvas', { state: 'visible' });
    await page.waitForTimeout(1000);
    
    console.log("Capturing initial state...");
    await page.screenshot({ path: './ui_tests/initial_state.png' });
    
    console.log("Typing intent...");
    await page.fill('input[name="intent"]', 'I need 200kg of premium apples');
    
    console.log("Submitting intent...");
    await page.click('button[type="submit"]');
    
    // Wait for the animation to settle
    await page.waitForTimeout(1500);
    console.log("Capturing post-submit state...");
    await page.screenshot({ path: './ui_tests/post_submit.png' });
    
    console.log("Testing in-place expansion...");
    // Click the newly created card (it should be the first one in the grid)
    const cards = await page.$$('.mosaic-card');
    if (cards.length > 0) {
      await cards[0].click();
      console.log("Clicked first card to expand. Waiting for framer-motion animation...");
      await page.waitForTimeout(1500); // Wait for spring physics
      await page.screenshot({ path: './ui_tests/expanded_state.png' });
      
      // Click minimize button
      const minimizeBtn = await page.$('.icon-button');
      if (minimizeBtn) {
        await minimizeBtn.click();
        console.log("Clicked minimize button. Waiting for animation...");
        await page.waitForTimeout(1500);
        await page.screenshot({ path: './ui_tests/minimized_state.png' });
      }
    }

    console.log("UI/UX test complete!");
  } catch (error) {
    console.error("Test failed:", error);
  } finally {
    const videoPath = await page.video().path();
    console.log(`Video saved to: ${videoPath}`);
    await context.close();
    await browser.close();
  }
})();
