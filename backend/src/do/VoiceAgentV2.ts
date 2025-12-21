
import { DurableObject } from "cloudflare:workers";

export class VoiceAgentV2 extends DurableObject {
  async fetch(request: Request) {
    return new Response("This class is deprecated and will be deleted.", { status: 410 });
  }
}
