
const puppeteer = require('puppeteer');
const fs = require('fs');

(async () => {
  const browser = await puppeteer.launch({headless: true});
  const page = await browser.newPage();
  await page.goto('https://www.facebook.com/profile.php?id=61587182983198', { waitUntil: 'networkidle2' });

  const scrapedData = await page.evaluate(() => {
    const name = document.querySelector('h1')?.innerText;
    // This is a placeholder selector, actual selectors will need to be found by inspecting the page
    const bio = document.querySelector('div[data-pagelet="ProfileTilesFeed_0"]')?.innerText;
    const posts = Array.from(document.querySelectorAll('div[data-pagelet*="ProfileTimeline"] [data-ad-preview="message"]'));
    const latestPost = posts.length > 0 ? posts[0].innerText : 'No posts found';

    // Birthday is not always public, so it might not be available.
    // This is a placeholder for where the logic to find it would go.
    const birthDate = 'Not found';

    return { name, bio, latestPost, birthDate };
  });

  const output = `
# Omega Zeus Profile Scrape

## Public Information
- **Name:** ${scrapedData.name}
- **Birth Date:** ${scrapedData.birthDate}
- **Bio:** ${scrapedData.bio}

## Latest Post
${scrapedData.latestPost}
  `;

  fs.writeFileSync('SOCIAL_SCRAPE.md', output);

  console.log('Scraping complete. Data saved to SOCIAL_SCRAPE.md');

  await browser.close();
})();
