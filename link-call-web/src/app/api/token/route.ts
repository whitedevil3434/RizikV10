import { AccessToken, AgentDispatchClient } from 'livekit-server-sdk';
import { NextRequest, NextResponse } from 'next/server';

function normalizeLiveKitHost(url: string): string {
    if (url.startsWith('wss://')) return `https://${url.slice(6)}`;
    if (url.startsWith('ws://')) return `http://${url.slice(5)}`;
    return url;
}

async function tryDispatchAgent(
    room: string,
    participant: string,
): Promise<{ dispatched: boolean; dispatchError?: string }> {
    const autoDispatch =
        (process.env.LIVEKIT_AUTO_DISPATCH ?? 'true').toLowerCase() !== 'false';
    if (!autoDispatch) {
        return { dispatched: false, dispatchError: 'auto dispatch disabled' };
    }

    const apiKey = process.env.LIVEKIT_API_KEY;
    const apiSecret = process.env.LIVEKIT_API_SECRET;
    const livekitUrl =
        process.env.LIVEKIT_URL || process.env.NEXT_PUBLIC_LIVEKIT_URL;
    const agentName = process.env.LIVEKIT_AGENT_NAME || 'rizik-local-final';

    if (!apiKey || !apiSecret || !livekitUrl) {
        return {
            dispatched: false,
            dispatchError:
                'missing LIVEKIT_URL/NEXT_PUBLIC_LIVEKIT_URL or api credentials',
        };
    }

    try {
        const host = normalizeLiveKitHost(livekitUrl);
        const svc = new AgentDispatchClient(host, apiKey, apiSecret);
        await svc.createDispatch(room, agentName, {
            metadata: JSON.stringify({ invitedBy: participant }),
        });
        return { dispatched: true };
    } catch (error) {
        const message =
            error instanceof Error ? error.message : 'dispatch failed';
        return { dispatched: false, dispatchError: message };
    }
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { room, participant } = body;

        if (!room || !participant) {
            return NextResponse.json(
                { error: 'Missing room or participant name' },
                { status: 400 }
            );
        }

        // LiveKit credentials must come from server environment only.
        const apiKey = process.env.LIVEKIT_API_KEY;
        const apiSecret = process.env.LIVEKIT_API_SECRET;
        if (!apiKey || !apiSecret) {
            return NextResponse.json(
                { error: 'Missing LIVEKIT_API_KEY or LIVEKIT_API_SECRET' },
                { status: 500 }
            );
        }

        // Create access token
        const at = new AccessToken(apiKey, apiSecret, {
            identity: participant,
            ttl: '24h',
        });

        at.addGrant({
            roomJoin: true,
            room: room,
            canPublish: true,
            canSubscribe: true,
            canPublishData: true,
        });

        const token = await at.toJwt();
        const dispatchResult = await tryDispatchAgent(room, participant);

        return NextResponse.json({
            token,
            dispatched: dispatchResult.dispatched,
            dispatchError: dispatchResult.dispatchError,
        });
    } catch (error) {
        console.error('Token generation error:', error);
        return NextResponse.json(
            { error: 'Failed to generate token' },
            { status: 500 }
        );
    }
}
