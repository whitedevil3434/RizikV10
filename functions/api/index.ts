import { Hono } from 'hono';
import { cors } from 'hono/cors';

// Define the environment bindings
type Bindings = {
  MEETING_ROOM: DurableObjectNamespace;
  ENVIRONMENT: string;
};

const app = new Hono<{ Bindings: Bindings }>();

// Enable CORS for Flutter app
app.use('/*', cors());

// Health check
app.get('/', (c) => c.text('Rizik Backend Active'));

// Realtime/Meeting Routes
app.post('/api/realtime/meeting/create', async (c) => {
  try {
    const body = await c.req.json();
    const meetingName = body.meetingName || 'Untitled Meeting';

    // Generate a unique meeting ID (in a real app, use a shorter UUID or NanoID)
    const meetingId = crypto.randomUUID();

    // In a full implementation, we might store this ID in Supabase here,
    // or just rely on the Durable Object to hold state.
    // For now, we return the ID so the client can join.

    return c.json({
      success: true,
      meetingId: meetingId,
      name: meetingName
    });
  } catch (e) {
    return c.json({ success: false, error: 'Invalid request' }, 400);
  }
});

app.post('/api/realtime/meeting/:id/participants', async (c) => {
  const meetingId = c.req.param('id');

  try {
    const body = await c.req.json();
    const participantName = body.participantName || 'Guest';
    const participantId = body.participantId || `user_${Date.now()}`;

    // Interact with Durable Object to add participant or validate
    // const id = c.env.MEETING_ROOM.idFromName(meetingId);
    // const stub = c.env.MEETING_ROOM.get(id);
    // const result = await stub.fetch(c.req);

    // For Cloudflare Calls / RealtimeKit, we usually need to generate a session token.
    // Since we don't have the actual RealtimeKit secret keys in this env,
    // we will mock a "valid-looking" token response for the Flutter app to consume.
    // NOTE: In production, this MUST sign a JWT using the Cloudflare Calls App ID/Secret.

    // MOCK TOKEN GENERATION for now to unblock the UI work
    const mockToken = `mock_token_${meetingId}_${participantId}`;

    return c.json({
      success: true,
      meetingId: meetingId,
      participantId: participantId,
      authToken: mockToken, // The Flutter app expects this
      token: mockToken      // Fallback
    });
  } catch (e) {
    return c.json({ success: false, error: 'Invalid request' }, 400);
  }
});

export default app;

// Durable Object Class Definition (Stub for now)
export class MeetingRoom {
  state: DurableObjectState;

  constructor(state: DurableObjectState, env: Bindings) {
    this.state = state;
  }

  async fetch(request: Request) {
    return new Response("Meeting Room Active");
  }
}
