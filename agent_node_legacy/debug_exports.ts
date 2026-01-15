
import * as google from '@livekit/agents-plugin-google';
console.log("Google Plugin Exports:", Object.keys(google));
try {
    console.log("google.beta:", google.beta);
    console.log("google.beta keys:", Object.keys(google.beta || {}));
} catch (e) {
    console.log("Error checking beta:", e);
}
