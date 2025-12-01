import { DurableObject } from "cloudflare:workers";

export class SquadDO extends DurableObject {
    state: DurableObjectState;

    constructor(state: DurableObjectState, env: any) {
        super(state, env);
        this.state = state;
    }

    async fetch(request: Request): Promise<Response> {
        const url = new URL(request.url);
        const path = url.pathname;
        console.log(`SquadDO received: ${path}`);

        // WebSocket Upgrade
        if (request.headers.get("Upgrade") === "websocket") {
            const pair = new WebSocketPair();
            const [client, server] = Object.values(pair);

            this.handleWebSocket(server);

            return new Response(null, {
                status: 101,
                webSocket: client,
            });
        }

        // /squad/:id/join
        if (path.endsWith("/join")) {
            return this.joinSquad(request);
        }

        // /squad/:id/roster
        if (path.endsWith("/roster")) {
            return this.updateRoster(request);
        }

        // /squad/:id/state
        if (path.endsWith("/state")) {
            return this.getState();
        }

        return new Response("SquadDO: Not Found", { status: 404 });
    }

    handleWebSocket(ws: WebSocket) {
        ws.accept();
        // this.sessions.push(ws); // Store session if needed

        ws.addEventListener("message", async (msg) => {
            console.log("SquadDO WebSocket Message:", msg.data);
            // Echo back or broadcast
            ws.send(`Echo: ${msg.data}`);
        });

        ws.addEventListener("close", () => {
            console.log("SquadDO WebSocket Closed");
        });
    }

    async joinSquad(request: Request): Promise<Response> {
        const body: any = await request.json();
        const { userId, name } = body;

        if (!userId || !name) {
            return new Response("Missing userId or name", { status: 400 });
        }

        const members: any[] = (await this.state.storage.get("members")) || [];

        if (!members.find((m) => m.userId === userId)) {
            members.push({ userId, name, joinedAt: new Date().toISOString() });
            await this.state.storage.put("members", members);
        }

        return new Response(JSON.stringify({ success: true, members }), {
            headers: { "Content-Type": "application/json" },
        });
    }

    async updateRoster(request: Request): Promise<Response> {
        if (request.method !== "POST") {
            return new Response("Method not allowed", { status: 405 });
        }
        const body: any = await request.json();
        const { roster } = body; // Expecting { "Monday": "UserA", "Tuesday": "UserB" }

        await this.state.storage.put("roster", roster);

        return new Response(JSON.stringify({ success: true, roster }), {
            headers: { "Content-Type": "application/json" },
        });
    }

    async getState(): Promise<Response> {
        const members = (await this.state.storage.get("members")) || [];
        const roster = (await this.state.storage.get("roster")) || {};

        return new Response(
            JSON.stringify({
                members,
                roster,
                timestamp: new Date().toISOString(),
            }),
            { headers: { "Content-Type": "application/json" } }
        );
    }
}
