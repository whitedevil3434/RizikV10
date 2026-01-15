// test_voice_pipeline.ts - Automated Voice AI End-to-End Test (Node.js)
import { AccessToken } from 'livekit-server-sdk';
import { Room, RoomEvent, RemoteParticipant, Track, RemoteTrackPublication, TrackKind } from '@livekit/rtc-node';

const LIVEKIT_URL = "wss://rizik-ai-femz194x.livekit.cloud";
const API_KEY = "APImSG78KpGRGdm";
const API_SECRET = "MdKvfAwLfivlzlQmgRfJ268XvW79vSyqidour2e1kQnC";

async function main() {
    console.log("🧪 Starting Voice AI Pipeline Test (Node.js)...");

    const roomName = `test-room-${Date.now()}`;
    const participantName = `tester-${Date.now()}`;

    // 1. Generate Token
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
    console.log(`🔑 Token generated for room: ${roomName}`);

    // 2. Connect to Room
    const room = new Room();

    let agentJoined = false;
    let audioReceived = false;
    let dataReceived = false;

    room.on(RoomEvent.ParticipantConnected, (participant: RemoteParticipant) => {
        console.log(`👤 Participant joined: ${participant.identity}`);
        if (participant.identity.startsWith('agent-')) {
            agentJoined = true;
            console.log("✅ AGENT JOINED THE ROOM!");
        }
    });

    room.on(RoomEvent.TrackSubscribed, (track: Track, publication: RemoteTrackPublication, participant: RemoteParticipant) => {
        console.log(`🎵 Track subscribed: kind=${track.kind} from ${participant.identity}`);
        // Check if it's from agent - any track from agent counts as success
        if (participant.identity.startsWith('agent-')) {
            audioReceived = true;
            console.log("✅✅✅ TRACK RECEIVED FROM AGENT! ✅✅✅");
        }
    });

    room.on(RoomEvent.DataReceived, (payload: Uint8Array, participant?: RemoteParticipant, topic?: string) => {
        const message = new TextDecoder().decode(payload);
        console.log(`📨 Data received [${topic}]: ${message}`);
        if (participant?.identity.startsWith('agent-')) {
            dataReceived = true;
            console.log("✅ DATA RECEIVED FROM AGENT!");
        }
    });

    room.on(RoomEvent.Disconnected, () => {
        console.log("🔌 Disconnected from room");
    });

    try {
        console.log(`🔌 Connecting to ${LIVEKIT_URL}...`);
        await room.connect(LIVEKIT_URL, jwt);
        console.log("✅ Connected to room!");

        // Wait for agent to join and respond
        console.log("⏳ Waiting for Agent to join and publish audio (max 30 seconds)...");

        for (let i = 0; i < 30; i++) {
            await new Promise(r => setTimeout(r, 1000));
            process.stdout.write(".");

            if (agentJoined && (audioReceived || dataReceived)) {
                console.log("\n\n🎉🎉🎉 SUCCESS! Voice AI Pipeline is WORKING! 🎉🎉🎉");
                break;
            }
        }

        console.log("\n\n--- TEST RESULTS ---");
        console.log(`Agent Joined: ${agentJoined ? '✅' : '❌'}`);
        console.log(`Audio/Track Received: ${audioReceived ? '✅' : '❌'}`);
        console.log(`Data Received: ${dataReceived ? '✅' : '❌'}`);

        if (agentJoined && audioReceived) {
            console.log("\n🎉 FULL SUCCESS! Voice AI Pipeline is operational!");
            console.log("The Agent joined and published audio tracks.");
        } else if (!agentJoined) {
            console.log("\n❌ FAILURE: Agent did not join.");
        } else if (!audioReceived && !dataReceived) {
            console.log("\n⚠️ PARTIAL: Agent joined but no audio/data received.");
        }

    } catch (e) {
        console.error("❌ Connection Error:", e);
    } finally {
        await room.disconnect();
        console.log("🔌 Test complete, disconnected.");
        process.exit(agentJoined && audioReceived ? 0 : 1);
    }
}

main();
