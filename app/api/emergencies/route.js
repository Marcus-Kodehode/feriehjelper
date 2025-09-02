// app/api/emergencies/route.js
// Brukerbinding med Clerk:
// - Alle spørringer filtreres med { userId }
// - Upsert gjøres per { userId, tripId } (én rad per tur for hver bruker)

import { getDb } from "@/lib/mongodb";
import { auth } from "@clerk/nextjs/server";

export const runtime = "nodejs";
export const revalidate = 0;

export async function GET(req) {
  const { userId } = auth();
  if (!userId) return Response.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const db = await getDb();

    // Valgfritt: støtt ?tripId=123 for å hente én
    const url = new URL(req.url);
    const tripIdParam = url.searchParams.get("tripId");
    const filter = { userId, ...(tripIdParam ? { tripId: Number(tripIdParam) } : {}) };

    const docs = await db.collection("emergencies").find(filter).toArray();
    const data = docs.map(({ _id, ...e }) => ({ ...e, mongoId: _id.toString() }));
    return Response.json(data, { status: 200 });
  } catch (err) {
    console.error("GET /api/emergencies failed:", err);
    return Response.json({ error: "Failed to fetch emergencies" }, { status: 500 });
  }
}

export async function POST(req) {
  const { userId } = auth();
  if (!userId) return Response.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await req.json();
    const db = await getDb();

    const tripId = Number(body.tripId);
    if (!Number.isFinite(tripId)) {
      return Response.json({ error: "tripId (number) is required" }, { status: 400 });
    }

    const now = new Date();

    // Upsert én rad per { userId, tripId }
    await db.collection("emergencies").updateOne(
      { userId, tripId },
      {
        $set: {
          ...body,
          userId,              // server setter eier
          tripId,
          updatedAt: now,
        },
        $setOnInsert: { createdAt: now },
      },
      { upsert: true }
    );

    const saved = await db.collection("emergencies").findOne({ userId, tripId });
    return Response.json(
      { ...saved, mongoId: saved._id.toString() },
      { status: 201 }
    );
  } catch (err) {
    console.error("POST /api/emergencies failed:", err);
    return Response.json({ error: "Failed to upsert emergency" }, { status: 500 });
  }
}

/**
 * /api/emergencies
 *
 * GET
 *  - Leser alle nødinfo-dokumenter.
 *  - Mapper {_id} -> mongoId:string og beholder din numeriske id.
 *
 * POST (upsert by tripId)
 *  - Body bør inneholde: { id:number, tripId:number, ...felter }
 *  - Upserter (update/insert) én rad per tripId:
 *      filter: { tripId }
 *      $set:   alle felter + updatedAt
 *      $setOnInsert: createdAt
 *  - Returnerer det lagrede dokumentet + mongoId (ObjectId som string).
 *
 * Merk
 *  - Én forekomst per reise (tripId). Klienten kan trygt poste samme tripId flere ganger
 *    uten å få duplikater.
 */
