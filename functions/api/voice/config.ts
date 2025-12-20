// Cloudflare Worker: Remote Voice Config
// Serves the current Microsoft Edge TTS configuration.
// This allows us to update the WSS URL or Token instantly without app updates.

export async function onRequestGet(context) {
  // In a real scenario, this would fetch from env.CONFIG_KV
  // For now, we hardcode the known working values.
  
  const config = {
    wss_url: "wss://speech.platform.bing.com/consumer/speech/synthesize/readaloud/edge/v1",
    trusted_client_token: "6A5AA1D4EAFF4E9FB37E23D68491D6F4", // Standard Edge Token
    voice_config: {
      default_voice: "bn-BD-PradeepNeural", // Good Bengali Voice
      fallback_voice: "en-US-ChristopherNeural",
      rate: "+0%",
      pitch: "+0Hz"
    },
    headers: {
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36 Edg/130.0.0.0",
      "Origin": "chrome-extension://jdiccldimpdaibmpdkjnbmckianbfold", // Often needed for handshake
    }
  };

  return new Response(JSON.stringify(config), {
    headers: { 
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*" // Allow Flutter Web if needed
    }
  });
}
