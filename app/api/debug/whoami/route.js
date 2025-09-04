import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";

export function GET() {
  const { userId, sessionId, sessionClaims } = auth();
  return NextResponse.json({
    ok: true,
    userId: userId ?? null,
    sessionId: sessionId ?? null,
    sessionStatus: sessionClaims?.sts ?? null,
  });
}
