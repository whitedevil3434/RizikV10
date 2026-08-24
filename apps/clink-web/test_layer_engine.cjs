const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

(async () => {
  console.log('Launching browser to test 3-Layer Engine...');
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    recordVideo: {
      dir: './ui_tests/videos/',
      size: { width: 1280, height: 800 }
    }
  });

  const page = await context.newPage();

  try {
    console.log('Navigating to deployment...');
    await page.goto('https://clink-web-5wx.pages.dev', { waitUntil: 'networkidle' });
    
    await page.waitForTimeout(2000);
    await page.waitForSelector('.composer-form input');

    console.log('Typing intent...');
    await page.fill('.composer-form input', 'I want to learn English but have no partner');
    await page.click('.composer-form button');
    
    console.log('Waiting for AI compilation and Layer reallocation...');
    await page.waitForTimeout(6000); 

    console.log('Test complete!');

  } catch (error) {
    console.error('Test failed:', error);
  } finally {
    const videoPath = await page.video().path();
    await context.close();
    await browser.close();
    
    const newPath = path.join('/Users/sabbir/.gemini/antigravity/brain/23656ace-e191-47bf-a20c-cbf7f98f4497/scratch/ui_layer_engine_recording.webm');
    fs.copyFileSync(videoPath, newPath);
    console.log(`Copied video to artifacts`);
  }
})();
