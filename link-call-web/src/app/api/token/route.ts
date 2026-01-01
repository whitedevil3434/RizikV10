import { AccessToken } from 'livekit-server-sdk';
import { NextRequest, NextResponse } from 'next/server';

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

        // LiveKit credentials (from environment or hardcoded for now)
        const apiKey = process.env.LIVEKIT_API_KEY || 'APImSG78KpGRGdm';
        const apiSecret = process.env.LIVEKIT_API_SECRET || 'MdKvfAwLfivlzlQmgRfJ268XvW79vSyqidour2e1kQnC';

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

        return NextResponse.json({ token });
    } catch (error) {
        console.error('Token generation error:', error);
        return NextResponse.json(
            { error: 'Failed to generate token' },
            { status: 500 }
        );
    }
}
