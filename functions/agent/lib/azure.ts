import { Env } from "../../agent/voice_agent";

// --- HEADER GENERATION ---

/**
 * Creates a standard WAV header for raw PCM data.
 * @param dataLength Length of the PCM data in bytes
 * @param sampleRate e.g. 44100
 * @param numChannels e.g. 1 (Mono)
 * @param bitsPerSample e.g. 16
 */
export function createWavHeader(dataLength: number, sampleRate: number, numChannels: number, bitsPerSample: number): Uint8Array {
    const buffer = new ArrayBuffer(44);
    const view = new DataView(buffer);

    writeString(view, 0, 'RIFF');
    view.setUint32(4, 36 + dataLength, true);
    writeString(view, 8, 'WAVE');
    writeString(view, 12, 'fmt ');
    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true);
    view.setUint16(22, numChannels, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, sampleRate * numChannels * (bitsPerSample / 8), true);
    view.setUint16(32, numChannels * (bitsPerSample / 8), true);
    view.setUint16(34, bitsPerSample, true);
    writeString(view, 36, 'data');
    view.setUint32(40, dataLength, true);

    return new Uint8Array(buffer);
}

function writeString(view: DataView, offset: number, string: string) {
    for (let i = 0; i < string.length; i++) {
        view.setUint8(offset + i, string.charCodeAt(i));
    }
}

// --- AZURE SERVICES ---

/**
 * Generates Speech from Text using Azure Cognitive Services.
 * Returns MP3 Audio Buffer (16kHz).
 */
export async function fetchAzureTTS(text: string, apiKey: string, region: string): Promise<ArrayBuffer> {
    const url = `https://${region}.tts.speech.microsoft.com/cognitiveservices/v1`;

    // SSML for Bengali Voice (Tanishaa Neural)
    const ssml = `<speak version='1.0' xml:lang='bn-IN'><voice xml:lang='bn-IN' xml:gender='Female' name='bn-IN-TanishaaNeural'>${text}</voice></speak>`;

    console.error(`📡 Azure TTS Req: ${url}`);
    // console.log(`📝 SSML: ${ssml}`); 

    const response = await fetch(url, {
        method: 'POST',
        headers: {
            'Ocp-Apim-Subscription-Key': apiKey,
            'Content-Type': 'application/ssml+xml',
            'X-Microsoft-OutputFormat': 'audio-16khz-128kbitrate-mono-mp3',
            'User-Agent': 'RizikVoiceAgent'
        },
        body: ssml
    });

    console.error(`📡 Azure TTS Res: ${response.status} ${response.statusText}`);
    console.error(`Type: ${response.headers.get('content-type')} | Len: ${response.headers.get('content-length')}`);

    if (!response.ok) {
        throw new Error(`Azure TTS Failed: ${response.status} ${response.statusText}`);
    }

    const ab = await response.arrayBuffer();
    if (ab.byteLength === 0) {
        throw new Error("Azure TTS returned 0 bytes (Empty Audio)");
    }
    return ab;
}

/**
 * Transcribes Audio to Text using Azure Cognitive Services.
 * Supports Bengali (bn-IN).
 */
export async function fetchAzureSTT(env: Env, audioWav: Uint8Array, language: string = 'en-US'): Promise<string> {
    const region = env.AZURE_REGION || 'centralindia';
    // REST API Endpoint for Short Audio (<60s)
    const url = `https://${region}.stt.speech.microsoft.com/speech/recognition/conversation/cognitiveservices/v1?language=${language}`;

    const response = await fetch(url, {
        method: 'POST',
        headers: {
            'Ocp-Apim-Subscription-Key': env.AZURE_SPEECH_KEY || '',
            'Content-Type': 'audio/wav',
            'Accept': 'application/json;to=simple'
        },
        body: audioWav
    });

    if (!response.ok) {
        const errText = await response.text();
        throw new Error(`Azure STT Error (${response.status}): ${errText}`);
    }

    const data = await response.json() as any;

    // Azure Simple Response: { "DisplayText": "Hello world...", "RecognitionStatus": "Success" }
    if (data.RecognitionStatus === 'Success') {
        return data.DisplayText;
    } else {
        console.warn(`⚠️ Azure STT No Match: ${data.RecognitionStatus}`);
        return "";
    }
}
