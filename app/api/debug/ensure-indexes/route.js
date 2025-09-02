import { NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";

export async function GET() {
  const db = await getDb();
  await db.collection("trips").createIndex(
    { userId: 1, id: 1 },
    { unique: true, name: "uniq_userId_id" }
  );
  return NextResponse.json({ ok: true });
}
