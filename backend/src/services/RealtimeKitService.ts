/**
 * RealtimeKit Service
 * Manages meetings and participants for Cloudflare RealtimeKit
 * 
 * Docs: https://docs.realtime.cloudflare.com/api
 */

export async function create_meeting(
    apiKey: string,
    meetingName: string = 'Rizik Video Call'
) {
    const url = 'https://api.realtime.cloudflare.com/v2/meetings';

    console.log(`[RealtimeKit] Creating meeting: ${meetingName}`);

    const response = await fetch(url, {
        method: 'POST',
        headers: {
            'Authorization': `Basic ${apiKey}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            name: meetingName,
            // Optional: Add other meeting configuration here
        })
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to create meeting: ${response.status} ${errorText}`);
    }

    const result: any = await response.json();
    const data = result.data; // RealtimeKit wraps response in {success: true, data: {...}}
    console.log(`[RealtimeKit] Meeting created: ${data.id}`);

    return {
        meetingId: data.id,
        name: data.name,
    };
}

export async function add_participant(
    apiKey: string,
    meetingId: string,
    participantName: string,
    participantId: string
) {
    const url = `https://api.realtime.cloudflare.com/v2/meetings/${meetingId}/participants`;

    console.log(`[RealtimeKit] Adding participant: ${participantName} to meeting ${meetingId}`);

    const response = await fetch(url, {
        method: 'POST',
        headers: {
            'Authorization': `Basic ${apiKey}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            name: participantName,
            custom_participant_id: participantId,
            preset_name: 'participant', // User's preset from RealtimeKit dashboard
        })
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to add participant: ${response.status} ${errorText}`);
    }

    const result: any = await response.json();
    console.log('[RealtimeKit] Raw Add Participant Response:', JSON.stringify(result, null, 2));
    const data = result.data;
    console.log(`[RealtimeKit] Participant added. Data keys: ${Object.keys(data)}`);

    return {
        authToken: data.token || data.auth_token || data.access_token, // Try multiple keys
        participantId: data.id,
        customParticipantId: data.custom_participant_id,
        raw: data // Return raw data for debugging in Flutter
    };
}

export async function get_meeting(
    apiKey: string,
    meetingId: string
) {
    const url = `https://api.realtime.cloudflare.com/v2/meetings/${meetingId}`;

    const response = await fetch(url, {
        method: 'GET',
        headers: {
            'Authorization': `Basic ${apiKey}`,
        }
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to get meeting: ${response.status} ${errorText}`);
    }

    return await response.json();
}
