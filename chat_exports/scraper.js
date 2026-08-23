const { chromium } = require('@playwright/test');
const fs = require('fs/promises');
const path = require('path');

const links = [
  'https://chatgpt.com/share/6a8b5307-8384-83ee-9329-fe9d234d77cf',
  'https://chatgpt.com/share/6a8b531f-b290-83ee-b470-2a8f9466c2b6',
  'https://chatgpt.com/share/6a806b15-21dc-83ee-a500-e3ae5629e1fd',
  'https://chatgpt.com/share/6a8b535e-724c-83ee-bc07-b978a81287dd'
];

async function run() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();
  
  let fullContent = '';
  
  for (const link of links) {
    console.log(`Processing ${link}...`);
    try {
      await page.goto(link, { waitUntil: 'networkidle' });
      // Wait a bit extra to ensure content renders
      await page.waitForTimeout(3000);
      
      // Try to get all text within the main content area.
      // ChatGPT shared links typically have conversation turns.
      const conversationText = await page.evaluate(() => {
        // Try multiple strategies to find the content
        const elements = document.querySelectorAll('div[data-message-author-role]');
        if (elements.length > 0) {
           let text = '';
           elements.forEach(el => {
               const role = el.getAttribute('data-message-author-role');
               text += `\n\n--- [${role}] ---\n`;
               text += el.innerText;
           });
           return text;
        }
        return document.body.innerText;
      });
      
      fullContent += `\n\n======================================================\n`;
      fullContent += `SOURCE: ${link}\n`;
      fullContent += `======================================================\n`;
      fullContent += conversationText;
      console.log(`Successfully extracted content from ${link}. Length: ${conversationText.length}`);
    } catch (e) {
      console.error(`Error processing ${link}:`, e);
      fullContent += `\n\nError extracting ${link}: ${e.message}\n`;
    }
  }
  
  await browser.close();
  
  const outputPath = path.join(__dirname, 'all_conversations.txt');
  await fs.writeFile(outputPath, fullContent, 'utf-8');
  console.log(`Saved all content to ${outputPath}`);
}

run().catch(console.error);
