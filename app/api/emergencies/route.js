import { getDb } from "@/lib/mongodb";

export const runtime = "nodejs";
export const revalidate = 0;

export async function GET() {
  try {
    const db = await getDb();
    const docs = await db.collection("emergencies").find({}).toArray();
    const data = docs.map(({ _id, ...e }) => ({ ...e, mongoId: _id.toString() }));
    return Response.json(data, { status: 200 });
  } catch (err) {
    console.error("GET /api/emergencies failed:", err);
    return Response.json({ error: "Failed to fetch emergencies" }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const body = await req.json();
    const db = await getDb();

    const tripId = Number(body.tripId);
    const now = new Date();

    // Upsert én rad per tripId
    await db.collection("emergencies").updateOne(
      { tripId },
      { $set: { ...body, tripId, updatedAt: now }, $setOnInsert: { createdAt: now } },
      { upsert: true }
    );

    const saved = await db.collection("emergencies").findOne({ tripId });
    return Response.json(
      { ...saved, mongoId: saved._id.toString() },
      { status: 201 }
    );
  } catch (err) {
    console.error("POST /api/emergencies failed:", err);
    return Response.json({ error: "Failed to upsert emergency" }, { status: 500 });
  }
}
