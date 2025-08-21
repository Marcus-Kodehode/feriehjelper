// app/api/budgets/route.js
import { getDb } from "@/lib/mongodb";

export const runtime = "nodejs";
export const revalidate = 0;

export async function GET() {
  try {
    const db = await getDb();
    const docs = await db
      .collection("budgets")
      .find({})
      .sort({ tripId: 1 }) // valgfritt
      .toArray();

    // behold din egen numeriske id, send mongoId separat
    const data = docs.map(({ _id, ...b }) => ({ ...b, mongoId: _id.toString() }));
    return Response.json(data, { status: 200 });
  } catch (err) {
    console.error("GET /api/budgets failed:", err);
    return Response.json({ error: "Failed to fetch budgets" }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const body = await req.json();
    const db = await getDb();
    const doc = { ...body, createdAt: new Date() };
    const res = await db.collection("budgets").insertOne(doc);
    return Response.json(
      { ...doc, mongoId: res.insertedId.toString() },
      { status: 201 }
    );
  } catch (err) {
    console.error("POST /api/budgets failed:", err);
    return Response.json({ error: "Failed to create budget" }, { status: 500 });
  }
}
/**
 * /api/budgets
 *
 * GET
 *  - Leser alle budsjetter fra MongoDB.
 *  - Mapper {_id} -> mongoId:string og beholder din egen numeriske id.
 *
 * POST
 *  - Oppretter nytt budsjett.
 *  - Body bør inkludere `id` (number) og `tripId` (number). Øvrige felter er valgfrie.
 *  - Returnerer dokumentet + mongoId (ObjectId som string).
 *
 * Merk
 *  - Brukes også som upsert-synk for lokale elementer som mangler mongoId.
 */
