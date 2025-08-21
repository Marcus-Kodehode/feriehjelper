import { ObjectId } from "mongodb";
import { getDb } from "@/lib/mongodb";

export const runtime = "nodejs";
export const revalidate = 0;

export async function PUT(req, { params }) {
  try {
    const patch = await req.json();
    const db = await getDb();
    await db.collection("trips").updateOne(
      { _id: new ObjectId(params.id) },
      { $set: patch }
    );
    return Response.json({ ok: true }, { status: 200 });
  } catch (err) {
    return Response.json(
      { ok: false, message: err?.message || "Failed to update trip", stack: err?.stack },
      { status: 500 }
    );
  }
}

export async function DELETE(_req, { params }) {
  try {
    const db = await getDb();
    await db.collection("trips").deleteOne({ _id: new ObjectId(params.id) });
    return Response.json({ ok: true }, { status: 200 });
  } catch (err) {
    return Response.json(
      { ok: false, message: err?.message || "Failed to delete trip", stack: err?.stack },
      { status: 500 }
    );
  }
}
