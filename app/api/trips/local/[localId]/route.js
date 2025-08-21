// app/api/trips/local/[localId]/route.js
import { getDb } from "@/lib/mongodb";

export const runtime = "nodejs";
export const revalidate = 0;

export async function DELETE(_req, { params }) {
  try {
    const localId = Number(params.localId);
    const db = await getDb();
    await db.collection("trips").deleteOne({ id: localId });
    return Response.json({ ok: true }, { status: 200 });
  } catch (err) {
    console.error("DELETE /api/trips/local/[localId] failed:", err);
    return Response.json({ error: "Failed to delete by local id" }, { status: 500 });
  }
}
