
export async function create_call_session(
    appId: string,
    apiKey: string,
    sessionDescription?: any
) {
    // Cloudflare Calls (Realtime Kit) API Endpoint
    // Docs: https://developers.cloudflare.com/calls/
    const url = `https://rtc.live.cloudflare.com/v1/apps/${appId}/sessions/new`;

    console.log(`[CallOrchestrator] Creating Session: ${url}`);

    const response = await fetch(url, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            sessionDescription: sessionDescription || {
                type: 'offer',
                sdp: '' // Send empty SDP if not provided, to satisfy validation
            }
        })
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to create call session: ${response.status} ${errorText}`);
    }

    const data: any = await response.json();
    console.log(`[CallOrchestrator] Session Created: ${data.sessionId}`);

    return {
        sessionId: data.sessionId,
        appId: appId,
        sessionDescription: data.sessionDescription // Return answer if available
    };
}

export async function handle_whip(
    appId: string,
    apiKey: string,
    sessionId: string,
    sdpOffer: string,
    trackType: 'video' | 'audio' = 'video'
) {
    // WHIP Endpoint: https://rtc.live.cloudflare.com/v1/apps/{appId}/sessions/{sessionId}/whip/tracks/{trackName}
    // We use 'video' or 'audio' as the track name for simplicity in this MVP
    const url = `https://rtc.live.cloudflare.com/v1/apps/${appId}/sessions/${sessionId}/whip/tracks/${trackType}`;

    console.log(`[CallOrchestrator] WHIP Publish to: ${url}`);

    const response = await fetch(url, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/sdp'
        },
        body: sdpOffer
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`WHIP failed: ${response.status} ${errorText}`);
    }

    return await response.text();
}

export async function handle_whep(
    appId: string,
    apiKey: string,
    sessionId: string,
    sdpOffer: string | null,
    trackType: 'video' | 'audio' = 'video'
) {
    // WHEP Endpoint: https://rtc.live.cloudflare.com/v1/apps/{appId}/sessions/{sessionId}/whep/tracks/{trackName}
    const url = `https://rtc.live.cloudflare.com/v1/apps/${appId}/sessions/${sessionId}/whep/tracks/${trackType}`;

    console.log(`[CallOrchestrator] WHEP Subscribe to: ${url}`);

    const response = await fetch(url, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/sdp'
        },
        body: sdpOffer || '' // WHEP can be initiated without offer (server sends offer), but typically client sends offer
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`WHEP failed: ${response.status} ${errorText}`);
    }

    return await response.text();
}
