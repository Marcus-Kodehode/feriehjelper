import { NextResponse } from "next/server";
export async function GET() {
  return NextResponse.json({
    hasSecret: !!process.env.CLERK_SECRET_KEY,
    secretLen: process.env.CLERK_SECRET_KEY?.length || 0,
    nodeEnv: process.env.NODE_ENV,
  });
}
