const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

(async () => {
  console.log('Launching browser to test Spatial Recursion UI...');
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    recordVideo: {
      dir: './ui_tests/videos/',
      size: { width: 1280, height: 800 }
    }
  });

  const page = await context.newPage();

  try {
    console.log('Navigating to latest deployment...');
    await page.goto('https://clink-web-5wx.pages.dev', { waitUntil: 'networkidle' });
    
    await page.waitForTimeout(1000);
    await page.waitForSelector('.composer-form input');

    console.log('Typing intent...');
    await page.fill('.composer-form input', 'I want to learn English but have no partner');
    await page.click('.composer-form button');
    
    console.log('Waiting for AI compilation...');
    await page.waitForTimeout(6000); 

    console.log('Tapping Gap to trigger Spatial Recursion...');
    // The Gap card should have class type-gap or state-blocked
    const cards = await page.$$('.territory-card, .geometry-card');
    for (const card of cards) {
       const text = await card.innerText();
       if (text.includes('Gap') || text.includes('Missing')) {
           await card.click();
           break;
       }
    }
    
    console.log('Waiting for Recursion expansion...');
    await page.waitForTimeout(3000);
    
    console.log('Tapping Back to Composition...');
    const backBtn = await page.$('.btn-back');
    if (backBtn) {
        await backBtn.click();
        await page.waitForTimeout(2000);
    }

    console.log('Recursion test complete!');

  } catch (error) {
    console.error('Test failed:', error);
  } finally {
    const videoPath = await page.video().path();
    await context.close();
    await browser.close();
    console.log(`Video saved to: ${videoPath}`);
    
    const newPath = path.join('/Users/sabbir/.gemini/antigravity/brain/23656ace-e191-47bf-a20c-cbf7f98f4497/scratch/ui_recursion_recording.webm');
    fs.copyFileSync(videoPath, newPath);
    console.log(`Copied video to artifacts at: ${newPath}`);
  }
})();
