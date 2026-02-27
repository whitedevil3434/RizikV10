const https = require('https');
const fs = require('fs');

const originalRequest = https.request;
https.request = function(options, callback) {
    const hostname = options.hostname || (options.uri && options.uri.hostname);
    if (hostname && hostname.includes('googleapis.com')) {
        console.error("-----------------------------------------");
        console.error("🎯 GEMINI CLI HOLE DETECTED:", hostname);
        console.error("📂 PATH:", options.path);
        console.error("-----------------------------------------");
    }
    return originalRequest.apply(this, arguments);
};

// Also hook fetch if it's used
if (globalThis.fetch) {
    const originalFetch = globalThis.fetch;
    globalThis.fetch = async (...args) => {
        const url = args[0];
        if (url && url.includes('googleapis.com')) {
            console.error("-----------------------------------------");
            console.error("🎯 GEMINI CLI FETCH HOLE DETECTED:", url);
            console.error("-----------------------------------------");
        }
        return originalFetch(...args);
    };
}
