import { AccessToken, RoomServiceClient } from "npm:livekit-server-sdk@1.2.7";

Deno.serve(async (req) => {
    const corsHeaders = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    };

    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders });
    }

    try {
        const { roomName, participantName } = await req.json();

        const apiKey = Deno.env.get('LIVEKIT_API_KEY');
        const apiSecret = Deno.env.get('LIVEKIT_API_SECRET');
        const wsUrl = Deno.env.get('LIVEKIT_URL');

        if (!apiKey || !apiSecret || !wsUrl) {
            throw new Error("Missing LIVEKIT_API_KEY, LIVEKIT_API_SECRET, or LIVEKIT_URL");
        }

        // 1. Generate Token for User
        const at = new AccessToken(
            apiKey,
            apiSecret,
            { identity: participantName, ttl: '1h' }
        );

        at.addGrant({ roomJoin: true, room: roomName });
        const token = await at.toJwt();

        // 2. (Optional) Auto-Dispatch Agent
        // This wakes up the agent and tells it to join the room
        try {
            const svc = new RoomServiceClient(wsUrl, apiKey, apiSecret);
            // Dispatch to LOCAL agent with new unique name
            await svc.createDispatch(roomName, 'rizik-local-final', {
                metadata: JSON.stringify({ invitedBy: participantName })
            });
            console.log(`Agent dispatched to ${roomName}`);
        } catch (dispatchError) {
            console.error("Dispatch Error (Non-fatal):", dispatchError);
            // We don't fail the token generation if dispatch fails (e.g. already in room)
        }

        return new Response(JSON.stringify({ token, dispatched: true }), {
            headers: { "Content-Type": "application/json", ...corsHeaders },
        });
    } catch (error) {
        return new Response(JSON.stringify({ error: error.message || String(error) }), {
            status: 400,
            headers: { "Content-Type": "application/json", ...corsHeaders },
        });
    }
});
