import { DurableObject } from "cloudflare:workers";

export class GigDO extends DurableObject {
    state: DurableObjectState;

    constructor(state: DurableObjectState, env: any) {
        super(state, env);
        this.state = state;
    }

    async fetch(request: Request): Promise<Response> {
        const url = new URL(request.url);
        const path = url.pathname;

        // /gig/:id/apply
        if (path.endsWith("/apply")) {
            return this.applyForGig(request);
        }

        // /gig/:id/status
        if (path.endsWith("/status")) {
            return this.getStatus();
        }

        return new Response("GigDO: Not Found", { status: 404 });
    }

    async applyForGig(request: Request): Promise<Response> {
        const body: any = await request.json();
        const { userId } = body;

        const applicants: string[] = (await this.state.storage.get("applicants")) || [];

        if (!applicants.includes(userId)) {
            applicants.push(userId);
            await this.state.storage.put("applicants", applicants);
        }

        return new Response(JSON.stringify({ success: true, applicantCount: applicants.length }), {
            headers: { "Content-Type": "application/json" },
        });
    }

    async getStatus(): Promise<Response> {
        const applicants: string[] = (await this.state.storage.get("applicants")) || [];
        const isOpen = (await this.state.storage.get("isOpen")) ?? true;

        return new Response(
            JSON.stringify({
                applicantCount: applicants.length,
                isOpen,
            }),
            { headers: { "Content-Type": "application/json" } }
        );
    }
}
