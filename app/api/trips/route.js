import { getDb } from "@/lib/mongodb";

export const runtime = "nodejs";
export const revalidate = 0;

export async function GET() {
  try {
    const db = await getDb();
    const trips = await db.collection("trips")
      .find({})
      .sort({ from: 1 })
      .toArray();

    // keep your own numeric id; expose Mongo's _id as mongoId
    const data = trips.map(({ _id, ...t }) => ({ ...t, mongoId: _id.toString() }));
    return Response.json(data, { status: 200 });
  } catch (err) {
    // If this still returns HTML, the error happens before we get here (env / import time)
    return Response.json(
      { ok: false, message: err?.message || "Failed to fetch trips", stack: err?.stack },
      { status: 500 }
    );
  }
}

export async function POST(req) {
  try {
    const body = await req.json();
    const db = await getDb();

    const doc = { ...body, createdAt: new Date() };
    const res = await db.collection("trips").insertOne(doc);

    return Response.json(
      { ...doc, mongoId: res.insertedId.toString() },
      { status: 201 }
    );
  } catch (err) {
    return Response.json(
      { ok: false, message: err?.message || "Failed to create trip", stack: err?.stack },
      { status: 500 }
    );
  }
}
