// app/api/activities/route.js
import { getDb } from "@/lib/mongodb";

export const runtime = "nodejs";
export const revalidate = 0;

export async function GET() {
  try {
    const db = await getDb();
    const docs = await db
      .collection("activities")
      .find({})
      .sort({ date: 1 }) // enkel sortering; tid kan mangle
      .toArray();

    const data = docs.map(({ _id, ...a }) => ({ ...a, mongoId: _id.toString() }));
    return Response.json(data, { status: 200 });
  } catch (err) {
    console.error("GET /api/activities failed:", err);
    return Response.json({ error: "Failed to fetch activities" }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const body = await req.json();
    const db = await getDb();
    const doc = { ...body, createdAt: new Date() };
    const res = await db.collection("activities").insertOne(doc);
    return Response.json(
      { ...doc, mongoId: res.insertedId.toString() },
      { status: 201 }
    );
  } catch (err) {
    console.error("POST /api/activities failed:", err);
    return Response.json({ error: "Failed to create activity" }, { status: 500 });
  }
}
