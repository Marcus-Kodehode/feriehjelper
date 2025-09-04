// app/api/debug/whoami/route.ts
import { auth } from "@clerk/nextjs/server";
export async function GET() {
  const { userId, sessionId, session } = auth();
  return Response.json({
    ok: true,
    userId: userId ?? null,
    sessionId: sessionId ?? null,
    sessionStatus: session?.status ?? null,
  });
}
