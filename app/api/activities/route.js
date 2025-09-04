// app/api/activities/route.js
import { getDb } from "@/lib/mongodb";
import { auth } from "@clerk/nextjs/server";

export const runtime = "nodejs";
export const revalidate = 0;

/**
 * Henter aktiviteter KUN for innlogget bruker.
 * Støtter valgfritt ?tripId=123 for filtrering.
 */
export async function GET(req) {
  const { userId } = await auth();
  if (!userId) return Response.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const db = await getDb();
    const url = new URL(req.url);
    const tripIdParam = url.searchParams.get("tripId");

    const filter = { userId };
    if (tripIdParam != null) filter.tripId = Number(tripIdParam);

    const docs = await db
      .collection("activities")
      .find(filter)
      .sort({ date: 1 })
      .toArray();

    const data = docs.map(({ _id, ...a }) => ({
      ...a,
      mongoId: _id.toString(),
    }));
    return Response.json(data, { status: 200 });
  } catch (err) {
    console.error("GET /api/activities failed:", err);
    return Response.json(
      { error: "Failed to fetch activities" },
      { status: 500 }
    );
  }
}

/**
 * Oppretter aktivitet for innlogget bruker.
 * Serveren setter userId; ignorer evt. userId/_id/mongoId i body.
 */
export async function POST(req) {
  const { userId } = auth();
  if (!userId) return Response.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const raw = await req.json();
    const db = await getDb();

    // Rens farlige/irrelevante felter fra klient
    const { _id, mongoId, userId: _ignoreUserId, ...safe } = raw;

    // Normaliser tripId hvis oppgitt
    if (safe.tripId != null) {
      const t = Number(safe.tripId);
      if (!Number.isFinite(t)) {
        return Response.json(
          { error: "tripId must be a number" },
          { status: 400 }
        );
      }
      safe.tripId = t;
    }

    const doc = { ...safe, userId, createdAt: new Date() };
    const res = await db.collection("activities").insertOne(doc);

    return Response.json(
      { ...doc, mongoId: res.insertedId.toString() },
      { status: 201 }
    );
  } catch (err) {
    console.error("POST /api/activities failed:", err);
    return Response.json(
      { error: "Failed to create activity" },
      { status: 500 }
    );
  }
}

/**
 * /api/activities
 *
 * GET
 *  - Returnerer alle aktiviteter fra MongoDB.
 *  - Mapper {_id} -> mongoId:string og beholder din egen numeriske id.
 *
 * POST
 *  - Oppretter ny aktivitet.
 *  - Body må inkludere `id` (number) og `tripId` (number). Øvrige felter er valgfrie.
 *  - Returnerer dokumentet + mongoId (ObjectId som string).
 *
 * Notat
 *  - Brukes også til å synkronisere lokale elementer som mangler mongoId
 *    (ActivityContext poster hele objektet slik det ligger lokalt).
 */
