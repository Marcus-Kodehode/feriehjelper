import { ObjectId } from "mongodb";
import { getDb } from "@/lib/mongodb";

export const runtime = "nodejs";
export const revalidate = 0;

export async function PUT(req, { params }) {
  try {
    const patch = await req.json();
    const db = await getDb();
    await db.collection("emergencies").updateOne(
      { _id: new ObjectId(params.id) },
      { $set: { ...patch, updatedAt: new Date() } }
    );
    return Response.json({ ok: true }, { status: 200 });
  } catch (err) {
    console.error("PUT /api/emergencies/[id] failed:", err);
    return Response.json({ error: "Failed to update emergency" }, { status: 500 });
  }
}

export async function DELETE(_req, { params }) {
  try {
    const db = await getDb();
    await db.collection("emergencies").deleteOne({ _id: new ObjectId(params.id) });
    return Response.json({ ok: true }, { status: 200 });
  } catch (err) {
    console.error("DELETE /api/emergencies/[id] failed:", err);
    return Response.json({ error: "Failed to delete emergency" }, { status: 500 });
  }
}
