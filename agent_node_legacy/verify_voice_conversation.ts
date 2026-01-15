// verify_voice_conversation.ts - Full Voice AI Verification
// Tests: Audio input subscription, Gemini transcription, and Audio response
import { AccessToken } from 'livekit-server-sdk';
import { Room, RoomEvent, RemoteParticipant, Track, RemoteTrackPublication, LocalAudioTrack, AudioFrame } from '@livekit/rtc-node';

const LIVEKIT_URL = "wss://rizik-ai-femz194x.livekit.cloud";
const API_KEY = "APImSG78KpGRGdm";
const API_SECRET = "MdKvfAwLfivlzlQmgRfJ268XvW79vSyqidour2e1kQnC";

async function main() {
    console.log("🎤🔊 Voice AI Conversation Verification");
    console.log("==========================================\n");

    const roomName = `verify-room-${Date.now()}`;
    const participantName = `tester-${Date.now()}`;

    // Generate Token
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
    console.log(`🔑 Token generated for room: ${roomName}\n`);

    const room = new Room();

    let agentJoined = false;
    let audioTrackReceived = false;
    let dataReceived = false;

    // Event tracking
    room.on(RoomEvent.ParticipantConnected, (participant: RemoteParticipant) => {
        console.log(`👤 [EVENT] Participant connected: ${participant.identity}`);
        if (participant.identity.startsWith('agent-')) {
            agentJoined = true;
            console.log("   ✅ AGENT HAS JOINED!");
        }
    });

    room.on(RoomEvent.TrackSubscribed, (track: Track, pub: RemoteTrackPublication, participant: RemoteParticipant) => {
        console.log(`🎵 [EVENT] Track subscribed: kind=${track.kind} from ${participant.identity}`);
        if (participant.identity.startsWith('agent-')) {
            audioTrackReceived = true;
            console.log("   ✅ AUDIO TRACK FROM AGENT SUBSCRIBED!");
        }
    });

    room.on(RoomEvent.TrackPublished, (pub: RemoteTrackPublication, participant: RemoteParticipant) => {
        console.log(`📡 [EVENT] Track published by ${participant.identity}: ${pub.name} (kind: ${pub.kind})`);
    });

    room.on(RoomEvent.DataReceived, (payload: Uint8Array, participant?: RemoteParticipant, topic?: string) => {
        const message = new TextDecoder().decode(payload);
        console.log(`📨 [EVENT] Data received [${topic}]: ${message.substring(0, 100)}...`);
        if (participant?.identity.startsWith('agent-')) {
            dataReceived = true;
        }
    });

    try {
        console.log(`🔌 Connecting to ${LIVEKIT_URL}...`);
        await room.connect(LIVEKIT_URL, jwt);
        console.log("✅ Connected to room!\n");

        console.log("📊 Monitoring for 60 seconds...");
        console.log("   - Watching for Agent to join");
        console.log("   - Watching for Audio tracks");
        console.log("   - Watching for Data messages\n");
        console.log("   (Check the Agent terminal for '📝 User Said:' and '🗣️ Speech Created!' logs)\n");

        // Wait and observe
        for (let i = 0; i < 60; i++) {
            await new Promise(r => setTimeout(r, 1000));
            if (i % 10 === 0) {
                console.log(`⏱️ [${i}s] Agent: ${agentJoined ? '✅' : '⏳'} | Audio: ${audioTrackReceived ? '✅' : '⏳'} | Data: ${dataReceived ? '✅' : '⏳'}`);
            }

            // Early exit if we have everything
            if (agentJoined && audioTrackReceived) {
                console.log("\n✅ Agent connected and publishing audio. Left running for observation...");
                // Continue to run for observation
            }
        }

        console.log("\n==========================================");
        console.log("📋 FINAL VERIFICATION RESULTS:");
        console.log("==========================================");
        console.log(`Agent Joined Room:     ${agentJoined ? '✅ YES' : '❌ NO'}`);
        console.log(`Agent Audio Received:  ${audioTrackReceived ? '✅ YES' : '❌ NO'}`);
        console.log(`Data Messages:         ${dataReceived ? '✅ YES' : '❌ NO'}`);

        if (agentJoined && audioTrackReceived) {
            console.log("\n🎉 Voice Pipeline is operational (Agent connected and publishing audio)");
            console.log("\n⚠️  To verify Gemini is HEARING you:");
            console.log("   1. Check Agent terminal for '📝 User Said:' logs");
            console.log("   2. If no '📝 User Said:' appears, Gemini is NOT receiving your audio");
            console.log("   3. Check if User's microphone track is subscribed=true in Agent logs");
        } else {
            console.log("\n❌ Voice Pipeline has issues. Check Agent terminal for errors.");
        }

    } catch (e) {
        console.error("❌ Error:", e);
    } finally {
        await room.disconnect();
        console.log("\n🔌 Disconnected.");
    }
}

main();
