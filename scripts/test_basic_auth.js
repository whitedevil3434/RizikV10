
const fs = require('fs');

async function testBasicAuth() {
  const appId = "8841f81b0447329c269ce0d120c9865a";
  const appSecret = "cb7563bd7d634cb65d8b9ec77f9a169d4b4c43d1201506cf43a0da9b1d853ea4"; // Captured earlier

  const authString = Buffer.from(`${appId}:${appSecret}`).toString('base64');
  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Basic ${authString}`
  };

  const url = `https://rtc.live.cloudflare.com/v1/apps/${appId}/sessions/new`;

  try {
    console.error(`🧪 Testing Basic Auth on RTC.LIVE...`);
    const res = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify({})
    });
    const text = await res.text();
    console.log("Response:", text);
  } catch (error) {
    console.error("💥 Failed:", error);
  }
}

testBasicAuth();
