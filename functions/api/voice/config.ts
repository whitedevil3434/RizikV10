// Cloudflare Worker: Remote Voice Config with Sec-MS-GEC Token
// Implements Microsoft's anti-abuse token generation to bypass 403 errors.

export async function onRequestGet(context: any) {
  // Generate Sec-MS-GEC Token
  const secMsGec = await generateSecMsGec();

  const config = {
    wss_url: "wss://speech.platform.bing.com/consumer/speech/synthesize/readaloud/edge/v1",
    trusted_client_token: "6A5AA1D4EAFF4E9FB37E23D68491D6F4", // Standard Edge Token
    sec_ms_gec: secMsGec, // NEW: Required Anti-Abuse Token
    voice_config: {
      default_voice: "bn-BD-PradeepNeural", // Good Bengali Voice
      fallback_voice: "en-US-ChristopherNeural",
      rate: "+0%",
      pitch: "+0Hz"
    },
    headers: {
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36 Edg/130.0.0.0",
      "Origin": "chrome-extension://jdiccldimpdaibmpdkjnbmckianbfold",
      "Sec-MS-GEC": secMsGec, // Anti-Abuse Header
      "Sec-MS-GEC-Version": "1-130.0.2849.68"
    }
  };

  return new Response(JSON.stringify(config), {
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*"
    }
  });
}

/**
 * Generates the Sec-MS-GEC token required by Microsoft Edge TTS.
 * Algorithm:
 * 1. Get Windows FileTime (100ns units since 1601-01-01)
 * 2. Round down to nearest 5-minute interval (3,000,000,000 units)
 * 3. Concatenate with fixed salt and SHA-256 hash
 */
async function generateSecMsGec(): Promise<string> {
  // Windows FileTime epoch: 1601-01-01, Unix epoch: 1970-01-01
  // Difference in 100ns units = 116444736000000000
  const EPOCH_DIFF = 116444736000000000n;

  // Get current time as Windows FileTime (100ns units)
  const unixMs = BigInt(Date.now());
  const fileTime = unixMs * 10000n + EPOCH_DIFF;

  // Round down to nearest 5-minute interval (3,000,000,000 = 5 min in 100ns)
  const FIVE_MIN_INTERVAL = 3000000000n;
  const roundedTime = (fileTime / FIVE_MIN_INTERVAL) * FIVE_MIN_INTERVAL;

  // Concatenate with fixed salt
  const salt = "6A5AA1D4EAFF4E9FB37E23D68491D6F4";
  const data = `${roundedTime}${salt}`;

  // SHA-256 hash
  const encoder = new TextEncoder();
  const hashBuffer = await crypto.subtle.digest("SHA-256", encoder.encode(data));

  // Convert to uppercase hex string
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0').toUpperCase()).join('');

  return hashHex;
}

