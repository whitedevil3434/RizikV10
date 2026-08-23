const { chromium } = require('playwright');

(async () => {
  console.log("Launching browser for UI/UX testing...");
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    recordVideo: {
      dir: './ui_tests/videos/',
      size: { width: 1280, height: 720 }
    },
    viewport: { width: 1280, height: 720 }
  });
  
  const page = await context.newPage();
  
  try {
    console.log("Navigating to local dev server...");
    await page.goto('http://localhost:5173', { waitUntil: 'networkidle' });
    
    await page.screenshot({ path: './ui_tests/step1_initial.png' });
    console.log("Initial state captured.");

    console.log("Typing intent...");
    await page.fill('input[name="intent"]', 'I need 500kg of premium beef by next Friday');
    await page.waitForTimeout(500); 
    await page.screenshot({ path: './ui_tests/step2_typed.png' });

    console.log("Submitting intent...");
    await page.click('button[type="submit"]');
    
    await page.waitForTimeout(1000); 
    await page.screenshot({ path: './ui_tests/step3_submitted.png' });

    console.log("Clicking card to trigger in-place expansion...");
    await page.click('.mosaic-card');
    
    await page.waitForTimeout(150);
    await page.screenshot({ path: './ui_tests/step4_expanding.png' });
    
    await page.waitForTimeout(800);
    await page.screenshot({ path: './ui_tests/step5_expanded.png' });

    console.log("Clicking minimize...");
    const minimizeBtn = await page.$('button:has(svg)');
    if (minimizeBtn) {
      await minimizeBtn.click();
      await page.waitForTimeout(1000);
      await page.screenshot({ path: './ui_tests/step6_minimized.png' });
    }

    console.log("Test completed successfully.");
  } catch (error) {
    console.error("Test failed:", error);
  } finally {
    await context.close();
    await browser.close();
    console.log("Browser closed.");
  }
})();
