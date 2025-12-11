import { type JobContext, WorkerOptions, cli, defineAgent, multimodal } from '@livekit/agents';
import * as google from '@livekit/agents-plugin-google';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config();

export default defineAgent({
    entry: async (ctx: JobContext) => {
        await ctx.connect();
        console.log('waiting for participant');
        const participant = await ctx.waitForParticipant();
        console.log(`starting assistant for ${participant.identity}`);

        const model = new google.realtime.RealtimeModel({
            model: 'gemini-2.0-flash-exp',
            apiKey: process.env.GOOGLE_API_KEY,
            instructions: `You are Rizik, a helpful AI assistant for a Bangladeshi super-app. 
                     You speak English and Bengali (Banglish). 
                     Keep answers short, witty, and helpful.`,
        });

        const agent = new multimodal.MultimodalAgent({
            model,
            chatCtx: ctx,
        });

        const session = await agent.start(ctx.room, participant);

        session.response.create();
        session.response.say("Hello! I am Rizik. Kemon acho?");
    },
});

cli.runApp(new WorkerOptions({
    agent: fileURLToPath(import.meta.url),
}));
