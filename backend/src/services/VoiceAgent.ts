import { Buffer } from 'node:buffer';
import { orchestrateAI, ChatMessage, UserContext, SquadContext } from '../ai/AIOrchestrator';
import { createClient } from '@supabase/supabase-js';

export async function process_voice_command(
    ai: any, // Cloudflare AI Binding
    env: any, // Full Env
    supabaseUrl: string,
    supabaseKey: string,
    squadId: string,
    userId: string,
    input: ArrayBuffer | string // Audio Blob OR Text String
) {
    console.log("[VoiceAgent] Processing Input...");

    let userText = "";

    if (typeof input === 'string') {
        // Direct Text Input (Tap-to-Edit)
        userText = input;
        console.log(`[VoiceAgent] Received Text Input: "${userText}"`);
    } else {
        // Audio Input -> Whisper
        console.log("[VoiceAgent] Processing Audio Input...");
        try {
            const sttResponse = await ai.run('@cf/openai/whisper', {
                audio: [...new Uint8Array(input)]
            });
            userText = sttResponse.text;
            console.log('Whisper Output:', userText);
        } catch (e: any) {
            console.error("[VoiceAgent] Whisper Failed:", e);
            throw new Error(`Whisper STT Failed: ${e.message}`);
        }
    }

    if (!userText || userText.trim().length === 0) {
        console.log("[VoiceAgent] Empty transcription. Aborting Llama call.");
        return {
            transcript: "",
            response: "I could not hear you. Please speak closer.",
            audio: ""
        };
    }

    // --- CONTEXT FETCHING ---
    const supabase = createClient(supabaseUrl, supabaseKey);

    // 1. Fetch User Profile
    const { data: userProfile } = await supabase
        .from('user_profiles')
        .select('full_name, role, department')
        .eq('id', userId)
        .maybeSingle();

    const userContext: UserContext = {
        name: userProfile?.full_name || "Squad Member",
        role: (userProfile?.role as 'admin' | 'member') || 'member',
        department: userProfile?.department || "General"
    };

    // 2. Fetch Squad Profile
    const { data: squadProfile } = await supabase
        .from('squads')
        .select('name, member_count') // Assuming member_count is a column or we mock it
        .eq('id', squadId)
        .maybeSingle();

    const squadContext: SquadContext = {
        name: squadProfile?.name || "My Squad",
        memberCount: squadProfile?.member_count || 4
    };

    // 3. Fetch History
    const { data: historyData } = await supabase
        .from('chat_messages')
        .select('role, content')
        .eq('squad_id', squadId)
        .order('created_at', { ascending: false })
        .limit(6);

    // Reverse to chronological order
    const history: ChatMessage[] = (historyData || []).reverse().map((msg: any) => ({
        role: (['system', 'user', 'assistant'].includes(msg.role) ? msg.role : 'user') as 'system' | 'user' | 'assistant',
        content: msg.content || ""
    }));

    // 2. AI Orchestration (Llama 3 + Tools)
    const orchestrationResult = await orchestrateAI(
        ai,
        env,
        supabaseUrl,
        supabaseKey,
        userText,
        history,
        squadId,
        userId,
        userContext,
        squadContext
    );

    let aiResponseText = "";
    if (orchestrationResult.type === 'chat_response') {
        aiResponseText = orchestrationResult.message;
    } else if (orchestrationResult.type === 'action_result') {
        const res = orchestrationResult.result as any;
        aiResponseText = orchestrationResult.ai_response || (res && res.message) || "Action executed.";
    } else {
        aiResponseText = "I processed that, but I'm not sure what to say.";
    }

    console.log(`[VoiceAgent] AI Response: "${aiResponseText}"`);

    // Safely extract UI payload
    let uiPayload = null;
    if (orchestrationResult.type === 'action_result' && orchestrationResult.result) {
        uiPayload = (orchestrationResult.result as any).ui_update_payload;
    }

    // 5. TTS (Text-to-Speech) - Google Translate Hack (Enhanced)
    // Cloudflare Native MMS-TTS is not yet available for Bengali.
    // We use this fallback until native support arrives.
    let audioBase64 = "";
    try {
        console.log(`[VoiceAgent] Starting TTS (Google Hack) for text length: ${aiResponseText.length}`);

        // 1. Chunking Logic (Google TTS has 200 char limit)
        // Split by sentences or chunks of 150 chars
        const chunks = aiResponseText.match(/[^.!?]+[.!?]+|[^\s]+(?=\s|$)/g) || [aiResponseText];
        const safeChunks = [];
        let currentChunk = "";

        for (const part of chunks) {
            if (currentChunk.length + part.length < 150) {
                currentChunk += part + " ";
            } else {
                safeChunks.push(currentChunk.trim());
                currentChunk = part + " ";
            }
        }
        if (currentChunk.trim().length > 0) safeChunks.push(currentChunk.trim());

        // Limit to first 2 chunks to keep it fast (MVP)
        // In full production, we would stitch all chunks.
        const textToSpeak = safeChunks.slice(0, 2).join(" ");
        console.log(`[VoiceAgent] TTS Text (Truncated): "${textToSpeak}"`);

        // Use 'gtx' client which is often more reliable than 'tw-ob'
        const ttsUrl = `https://translate.googleapis.com/translate_tts?client=gtx&ie=UTF-8&tl=bn&dt=t&q=${encodeURIComponent(textToSpeak)}`;

        const ttsResponse = await fetch(ttsUrl, {
            headers: {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
            }
        });

        if (ttsResponse.ok) {
            const audioBuffer = await ttsResponse.arrayBuffer();
            console.log(`[VoiceAgent] TTS Buffer size: ${audioBuffer.byteLength}`);
            audioBase64 = Buffer.from(audioBuffer).toString('base64');
        } else {
            console.error(`[VoiceAgent] TTS Failed: ${ttsResponse.status} ${ttsResponse.statusText}`);
            throw new Error(`Google TTS returned ${ttsResponse.status}`);
        }

    } catch (e: any) {
        console.error('[VoiceAgent] TTS Error:', e);
        // Fallback: Return empty audio, frontend will just show text
        return {
            transcript: userText,
            response: aiResponseText,
            audio: "",
            ui_payload: uiPayload,
            debug_error: `TTS Error: ${e.message || e}`
        };
    }

    // 4. SAVE INTERACTION TO DB (Memory)
    // We must save the User's message and the AI's response so history works next time.
    try {
        await supabase.from('chat_messages').insert([
            { squad_id: squadId, user_id: userId, role: 'user', content: userText },
            { squad_id: squadId, user_id: null, role: 'assistant', content: aiResponseText } // AI msg has no user_id usually
        ]);
    } catch (e) {
        console.error("[VoiceAgent] Failed to save chat history:", e);
    }

    return {
        transcript: userText,
        response: aiResponseText,
        audio: audioBase64,
        ui_payload: uiPayload,
        debug_error: null
    };
}
