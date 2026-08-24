const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

(async () => {
  console.log('Launching browser to test Kilo AI Compiler...');
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
    
    await page.waitForSelector('.composer-form input');
    await page.waitForTimeout(1000); 

    console.log('Typing intent...');
    await page.fill('.composer-form input', 'I need 1000 KG of fresh chicken for the restaurant by tomorrow morning');
    await page.waitForTimeout(1000);
    
    console.log('Submitting intent...');
    await page.click('.composer-form button');
    
    console.log('Waiting for AI compilation...');
    await page.waitForTimeout(6000); // Wait 6s for the API to respond and UI to update

    console.log('Expanding actor ghost space...');
    const nodes = await page.$$('.territory-card');
    if (nodes.length > 1) {
      await nodes[1].click();
      await page.waitForTimeout(2000); 
    }

    console.log('AI test complete!');

  } catch (error) {
    console.error('Test failed:', error);
  } finally {
    const videoPath = await page.video().path();
    await context.close();
    await browser.close();
    console.log(`Video saved to: ${videoPath}`);
    
    const newPath = path.join('/Users/sabbir/.gemini/antigravity/brain/23656ace-e191-47bf-a20c-cbf7f98f4497/scratch/ui_kilo_compiler_recording.webm');
    fs.copyFileSync(videoPath, newPath);
    console.log(`Copied video to artifacts at: ${newPath}`);
  }
})();
