
import { DurableObject } from "cloudflare:workers";

export class MeetingRoom extends DurableObject {
  async fetch(request: Request) {
    return new Response("This class is deprecated and will be deleted.", { status: 410 });
  }
}
