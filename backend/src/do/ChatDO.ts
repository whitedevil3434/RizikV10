import { DurableObject } from "cloudflare:workers";

export class ChatDO extends DurableObject {
    async fetch(request: Request): Promise<Response> {
        // WebRTC / WebSocket logic will go here
        return new Response("ChatDO Ready");
    }
}
