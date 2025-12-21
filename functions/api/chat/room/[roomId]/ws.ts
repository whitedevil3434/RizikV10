
// Pages Function: /api/chat/room/[roomId]/ws
// Routes WebSocket requests to the ChatRoom Durable Object

interface Env {
  CHAT_ROOM: DurableObjectNamespace;
}

export const onRequest: PagesFunction<Env> = async (context) => {
  const { request, env, params } = context;
  const roomId = params.roomId as string;

  if (request.headers.get("Upgrade") !== "websocket") {
    return new Response("Expected WebSocket", { status: 426 });
  }

  // Get Durable Object ID (create if not exists)
  const id = env.CHAT_ROOM.idFromName(roomId);
  const stub = env.CHAT_ROOM.get(id);

  return stub.fetch(request);
};
