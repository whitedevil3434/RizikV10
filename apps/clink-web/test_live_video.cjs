const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

(async () => {
  console.log('Launching browser to test Allocator Engine...');
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
    // I need to extract the actual deployed URL from the wrangler output
    // But since the pages.dev alias doesn't change, I can just use clink-web-5wx.pages.dev
    await page.goto('https://clink-web-5wx.pages.dev', { waitUntil: 'networkidle' });
    
    await page.waitForSelector('.composer-form input');
    await page.waitForTimeout(1000); 

    console.log('Typing intent...');
    await page.fill('.composer-form input', 'I need 1000 KG of fresh chicken');
    await page.waitForTimeout(1000);
    
    console.log('Submitting intent...');
    await page.click('.composer-form button');
    await page.waitForTimeout(1500); 

    console.log('Expanding actor (Supplier)...');
    const nodes = await page.$$('.territory-card');
    if (nodes.length > 1) {
      await nodes[1].click();
      await page.waitForTimeout(2000); 
    }

    console.log('UI/UX test complete!');

  } catch (error) {
    console.error('Test failed:', error);
  } finally {
    const videoPath = await page.video().path();
    await context.close();
    await browser.close();
    console.log(`Video saved to: ${videoPath}`);
    
    const newPath = path.join('/Users/sabbir/.gemini/antigravity/brain/23656ace-e191-47bf-a20c-cbf7f98f4497/scratch/ui_allocator_engine_recording.webm');
    fs.copyFileSync(videoPath, newPath);
    console.log(`Copied video to artifacts at: ${newPath}`);
  }
})();
