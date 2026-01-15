// diagnose_gemini.ts - Comprehensive Gemini Voice AI Diagnostic
// Tests: API Key, LiveKit Connection, Agent Job, Audio Subscription, Gemini Response

import { AccessToken } from 'livekit-server-sdk';
import { Room, RoomEvent, RemoteParticipant, Track, RemoteTrackPublication, LocalAudioTrack, AudioSource } from '@livekit/rtc-node';

const LIVEKIT_URL = "wss://rizik-ai-femz194x.livekit.cloud";
const API_KEY = "APImSG78KpGRGdm";
const API_SECRET = "MdKvfAwLfivlzlQmgRfJ268XvW79vSyqidour2e1kQnC";
const GOOGLE_API_KEY = "AIzaSyBr14RYyA5boc3Iyc6pDt98u7yVzCIXxVI";

async function testGeminiAPI(): Promise<boolean> {
    console.log("\n📡 Step 1: Testing Google Gemini API Key...");
    try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1/models?key=${GOOGLE_API_KEY}`);
        const data = await response.json() as any;
        if (data.error) {
            console.log(`   ❌ API Key Error: ${data.error.message}`);
            return false;
        }
        console.log(`   ✅ API Key Valid! Models available: ${(data.models as any[])?.length || 0}`);
        // Check for realtime models
        const realtimeModels = (data.models as any[])?.filter((m: any) => m.name.includes('flash') || m.name.includes('realtime'));
        console.log(`   📋 Flash/Realtime models: ${realtimeModels?.map((m: any) => m.name).join(', ') || 'none found'}`);
        return true;
    } catch (e) {
        console.log(`   ❌ API Key Test Failed: ${e}`);
        return false;
    }
}

async function testLiveKitConnection(): Promise<{ room: Room, token: string, roomName: string } | null> {
    console.log("\n🔌 Step 2: Testing LiveKit Connection...");
    const roomName = `diag-${Date.now()}`;
    const participantName = `diag-user-${Date.now()}`;

    try {
        const token = new AccessToken(API_KEY, API_SECRET, {
            identity: participantName,
            name: participantName,
        });
        token.addGrant({
            roomJoin: true,
            room: roomName,
            canPublish: true,
            canSubscribe: true,
            canPublishData: true,
        });
        const jwt = await token.toJwt();
        console.log(`   🔑 Token generated for room: ${roomName}`);

        const room = new Room();
        await room.connect(LIVEKIT_URL, jwt);
        console.log(`   ✅ Connected to LiveKit Cloud!`);
        console.log(`   📋 Room SID: ${room.sid}`);
        return { room, token: jwt, roomName };
    } catch (e) {
        console.log(`   ❌ LiveKit Connection Failed: ${e}`);
        return null;
    }
}

async function waitForAgent(room: Room, timeoutMs: number = 30000): Promise<{ joined: boolean, identity?: string, hasAudio: boolean, subscribed: boolean }> {
    console.log("\n⏳ Step 3: Waiting for Agent to join...");

    return new Promise((resolve) => {
        let agentJoined = false;
        let agentIdentity: string | undefined;
        let hasAudioTrack = false;
        let subscribed = false;

        const checkExisting = () => {
            for (const [_, participant] of room.remoteParticipants) {
                if (participant.identity.startsWith('agent-')) {
                    agentJoined = true;
                    agentIdentity = participant.identity;
                    console.log(`   👤 Agent found: ${participant.identity}`);
                    for (const [__, pub] of participant.trackPublications) {
                        console.log(`   📡 Track: kind=${pub.kind}, name=${pub.name}`);
                        if (pub.kind === 1) { // Audio
                            hasAudioTrack = true;
                        }
                    }
                }
            }
        };

        room.on(RoomEvent.ParticipantConnected, (participant: RemoteParticipant) => {
            console.log(`   📥 Participant connected: ${participant.identity}`);
            if (participant.identity.startsWith('agent-')) {
                agentJoined = true;
                agentIdentity = participant.identity;
                console.log(`   ✅ AGENT JOINED: ${participant.identity}`);
            }
        });

        room.on(RoomEvent.TrackSubscribed, (track: Track, pub: RemoteTrackPublication, participant: RemoteParticipant) => {
            console.log(`   🎵 Track subscribed: kind=${track.kind} from ${participant.identity}`);
            if (participant.identity.startsWith('agent-') && track.kind === 1) {
                hasAudioTrack = true;
                subscribed = true;
                console.log(`   ✅ AGENT AUDIO SUBSCRIBED!`);
            }
        });

        room.on(RoomEvent.TrackPublished, (pub: RemoteTrackPublication, participant: RemoteParticipant) => {
            console.log(`   📡 Track published: ${pub.name} (kind: ${pub.kind}) from ${participant.identity}`);
            if (participant.identity.startsWith('agent-') && pub.kind === 1) {
                hasAudioTrack = true;
            }
        });

        room.on(RoomEvent.DataReceived, (payload: Uint8Array, participant?: RemoteParticipant, topic?: string) => {
            const msg = new TextDecoder().decode(payload);
            console.log(`   📨 Data [${topic}]: ${msg.substring(0, 100)}...`);
        });

        checkExisting();

        setTimeout(() => {
            resolve({ joined: agentJoined, identity: agentIdentity, hasAudio: hasAudioTrack, subscribed });
        }, timeoutMs);
    });
}

async function main() {
    console.log("═══════════════════════════════════════════════════════════");
    console.log("     GEMINI VOICE AI PIPELINE DIAGNOSTIC");
    console.log("═══════════════════════════════════════════════════════════");
    console.log(`Time: ${new Date().toLocaleString()}`);

    const results: { step: string, status: string }[] = [];

    // Step 1: Test Gemini API
    const apiOk = await testGeminiAPI();
    results.push({ step: "Gemini API Key", status: apiOk ? "✅ PASS" : "❌ FAIL" });

    if (!apiOk) {
        console.log("\n❌ DIAGNOSIS: Google API Key is invalid. Get a new key from https://aistudio.google.com/apikey");
        return;
    }

    // Step 2: Test LiveKit Connection
    const livekit = await testLiveKitConnection();
    results.push({ step: "LiveKit Connection", status: livekit ? "✅ PASS" : "❌ FAIL" });

    if (!livekit) {
        console.log("\n❌ DIAGNOSIS: Cannot connect to LiveKit. Check LIVEKIT_URL and credentials.");
        return;
    }

    // Step 3: Wait for Agent
    console.log("\n   (Waiting 30 seconds for agent to dispatch...)");
    const agentResult = await waitForAgent(livekit.room, 30000);
    results.push({ step: "Agent Joined", status: agentResult.joined ? "✅ PASS" : "❌ FAIL" });
    results.push({ step: "Agent Audio Track", status: agentResult.hasAudio ? "✅ PASS" : "❌ FAIL" });

    // Summary
    console.log("\n═══════════════════════════════════════════════════════════");
    console.log("                    DIAGNOSTIC RESULTS");
    console.log("═══════════════════════════════════════════════════════════");
    for (const r of results) {
        console.log(`   ${r.step}: ${r.status}`);
    }

    if (!agentResult.joined) {
        console.log("\n🔴 DIAGNOSIS: Agent did NOT join the room.");
        console.log("   Possible causes:");
        console.log("   1. Agent process not running (check 'npm run dev -- dev')");
        console.log("   2. Agent crashed with error (check Agent terminal)");
        console.log("   3. LiveKit dispatch not configured correctly");
    } else if (!agentResult.hasAudio) {
        console.log("\n🟡 DIAGNOSIS: Agent joined but NOT publishing audio.");
        console.log("   Possible causes:");
        console.log("   1. Gemini RealtimeModel failed to connect");
        console.log("   2. AgentSession.start() crashed");
        console.log("   3. Check Agent logs for errors");
    } else {
        console.log("\n🟢 PIPELINE WORKING: Agent joined and publishing audio!");
        console.log("   If you still can't hear audio:");
        console.log("   1. Check browser/macOS volume");
        console.log("   2. Click on browser page to enable audio");
        console.log("   3. Agent may be waiting for USER to speak first");
    }

    console.log("\n═══════════════════════════════════════════════════════════\n");

    await livekit.room.disconnect();
    console.log("🔌 Disconnected.");
}

main().catch(console.error);
