// index.ts - Rizik Voice Agent with Gemini 2.5 Flash Native Audio
// Production-ready voice agent for Rizik Flutter App
import {
    type JobContext,
    ServerOptions,
    cli,
    defineAgent,
    voice,
} from '@livekit/agents';
import * as google from '@livekit/agents-plugin-google';
import dotenv from 'dotenv';
import { fileURLToPath } from 'node:url';

dotenv.config();

// ===========================================================================
// 📋 CONFIGURATION
// ===========================================================================
const CONFIG = {
    model: 'gemini-2.5-flash-native-audio-preview-12-2025',
    fallbackModel: 'gemini-2.0-flash-exp',
};

// ===========================================================================
// 🤖 RIZIK ASSISTANT AGENT
// ===========================================================================
class RizikAssistant extends voice.Agent {
    constructor() {
        super({
            instructions: `You are Rizik, a helpful AI assistant for a Bangladeshi super-app called "Rizik". 
            
Your personality:
- Friendly, witty, and helpful
- Speak in English with occasional Bengali/Banglish phrases for relatability
- Keep responses concise and conversational (under 30 words ideally)
- Be enthusiastic but not overly energetic

Your capabilities:
- Help users navigate the Rizik app (Bazar, Adda, Force, Apu, Koi)
- Answer questions about products, services, and features
- Provide recommendations based on user preferences
- Assist with local Bangladeshi context and culture

When greeting users, be warm: "Hey! Rizik here, ready to help you out! Ki help lagbe?"`,
        });
    }
}

// ===========================================================================
// 🎬 AGENT ENTRY POINT
// ===========================================================================
export default defineAgent({
    entry: async (ctx: JobContext) => {
        console.log('🚀 ═══════════════════════════════════════════════════');
        console.log('   RIZIK VOICE AGENT STARTED');
        console.log(`   Time: ${new Date().toLocaleString()}`);
        console.log('═══════════════════════════════════════════════════════');

        try {
            // 1. Connect to LiveKit room
            console.log('🔌 Connecting to room...');
            await ctx.connect();
            console.log('✅ Connected!');

            // 2. Wait for participant
            console.log('⏳ Waiting for user...');
            const participant = await ctx.waitForParticipant();
            console.log(`👤 User joined: ${participant.identity}`);

            // 3. Create Gemini model
            console.log(`🧠 Creating Gemini model: ${CONFIG.model}`);
            let model;
            try {
                model = new google.beta.realtime.RealtimeModel({
                    model: CONFIG.model,
                    apiKey: process.env.GOOGLE_API_KEY,
                });
            } catch (modelError) {
                console.warn(`⚠️ Failed to create ${CONFIG.model}, trying fallback...`);
                model = new google.beta.realtime.RealtimeModel({
                    model: CONFIG.fallbackModel,
                    apiKey: process.env.GOOGLE_API_KEY,
                });
            }
            console.log('✅ Gemini model ready');

            // 4. Create AgentSession
            const session = new voice.AgentSession({ llm: model });

            // 5. Event Handlers
            session.on(voice.AgentSessionEventTypes.Error, (ev) => {
                console.error('❌ ERROR:', JSON.stringify(ev));
            });

            session.on(voice.AgentSessionEventTypes.AgentStateChanged, (ev) => {
                const emoji = ev.newState === 'listening' ? '👂' :
                    ev.newState === 'speaking' ? '🔊' : '🤖';
                console.log(`${emoji} State: ${ev.newState}`);
            });

            session.on(voice.AgentSessionEventTypes.UserInputTranscribed, (ev) => {
                console.log(`📝 User: "${ev.transcript}"`);
            });

            session.on(voice.AgentSessionEventTypes.SpeechCreated, () => {
                console.log('🗣️ Gemini responding...');
            });

            // 6. Start session
            console.log('▶️ Starting AgentSession...');
            await session.start({
                agent: new RizikAssistant(),
                room: ctx.room,
                inputOptions: { participant },
            });

            console.log('✅ ═══════════════════════════════════════════════════');
            console.log('   🎤 LISTENING - Ready for voice input!');
            console.log('═══════════════════════════════════════════════════════');

        } catch (e: any) {
            console.error('═══════════════════════════════════════════════════════');
            console.error('❌ FATAL ERROR');
            console.error(`   Message: ${e?.message || e}`);
            console.error('═══════════════════════════════════════════════════════');
            throw e;
        }
    },
});

// ===========================================================================
// 🏃 RUN AGENT
// ===========================================================================
cli.runApp(new ServerOptions({ agent: fileURLToPath(import.meta.url) }));
