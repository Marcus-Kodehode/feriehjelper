import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";

export function GET() {
  const a = auth();
  return NextResponse.json({
    userId: a.userId ?? null,
    sessionId: a.sessionId ?? null,
    sessionStatus: a.sessionStatus ?? null,
  });
}
