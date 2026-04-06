import { DurableObject } from "cloudflare:workers";

export class VoiceAgent extends DurableObject {
    // Local state to store user memories or session data
    state: DurableObjectState;

    constructor(state: DurableObjectState, env: any) {
        super(state, env);
        this.state = state;
    }

    async fetch(request: Request): Promise<Response> {
        const url = new URL(request.url);
        console.log(`🤖 VoiceAgent DO received: ${request.method} ${url.pathname}`);

        // /memory/save/:userId
        if (url.pathname.includes("/memory/save/")) {
            try {
                const userId = url.pathname.split("/").pop();
                const data = await request.json();

                // Store in persistent storage
                await this.state.storage.put(`memory_${userId}`, data);

                return new Response(JSON.stringify({ success: true, saved: true }), {
                    headers: { "Content-Type": "application/json" }
                });
            } catch (err: any) {
                return new Response(JSON.stringify({ error: err.message }), { status: 500 });
            }
        }

        // /memory/get/:userId
        if (url.pathname.includes("/memory/get/")) {
            const userId = url.pathname.split("/").pop();
            const memory = await this.state.storage.get(`memory_${userId}`);

            return new Response(JSON.stringify({ memory: memory || null }), {
                headers: { "Content-Type": "application/json" }
            });
        }

        return new Response("VoiceAgent Active", { status: 200 });
    }
}
