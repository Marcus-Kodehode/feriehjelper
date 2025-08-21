// app/api/activities/[id]/route.js
import { ObjectId } from "mongodb";
import { getDb } from "@/lib/mongodb";

export const runtime = "nodejs";
export const revalidate = 0;

export async function PUT(req, { params }) {
  try {
    const patch = await req.json();
    const db = await getDb();
    await db
      .collection("activities")
      .updateOne({ _id: new ObjectId(params.id) }, { $set: patch });
    return Response.json({ ok: true }, { status: 200 });
  } catch (err) {
    console.error("PUT /api/activities/[id] failed:", err);
    return Response.json({ error: "Failed to update activity" }, { status: 500 });
  }
}

export async function DELETE(_req, { params }) {
  try {
    const db = await getDb();
    await db.collection("activities").deleteOne({ _id: new ObjectId(params.id) });
    return Response.json({ ok: true }, { status: 200 });
  } catch (err) {
    console.error("DELETE /api/activities/[id] failed:", err);
    return Response.json({ error: "Failed to delete activity" }, { status: 500 });
  }
}
