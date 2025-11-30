
import { DurableObject } from "cloudflare:workers";

export class SquadCore extends DurableObject {
    state: DurableObjectState;
    sql: any; // SQLite connection

    constructor(state: DurableObjectState, env: any) {
        super(state, env);
        this.state = state;
        this.sql = state.storage.sql; // New SQLite storage!
    }

    async fetch(request: Request) {
        const url = new URL(request.url);

        // 1. Handle WebSocket Upgrade (Real-time connection)
        if (url.pathname === "/websocket") {
            const upgradeHeader = request.headers.get('Upgrade');
            if (!upgradeHeader || upgradeHeader !== 'websocket') {
                return new Response('Expected Upgrade: websocket', { status: 426 });
            }

            const webSocketPair = new WebSocketPair();
            const [client, server] = Object.values(webSocketPair);

            this.state.acceptWebSocket(server);
            return new Response(null, { status: 101, webSocket: client });
        }

        // 2. Handle "User Joined" Signal from your Invite API
        if (url.pathname === "/user-joined" && request.method === "POST") {
            const { user_id, name } = await request.json() as any;

            // Broadcast to everyone in the squad instantly
            this.broadcast(JSON.stringify({
                type: 'MEMBER_JOINED',
                data: { name, joined_at: Date.now() }
            }));

            return new Response("Signal Broadcasted", { status: 200 });
        }

        // 3. Handle "UI Update" Signal from AI
        if (url.pathname === "/ui-update" && request.method === "POST") {
            const uiPayload = await request.json() as any;

            this.broadcast(JSON.stringify({
                type: 'UI_UPDATE',
                data: uiPayload
            }));

            return new Response("UI Update Broadcasted", { status: 200 });
        }

        return new Response("SquadCore DO Active", { status: 200 });
    }

    broadcast(message: string) {
        // Send message to all connected mobile phones in this squad
        for (const ws of this.state.getWebSockets()) {
            ws.send(message);
        }
    }
}
