// app/api/trips/route.js
// Kommentar:
// - Beskytter alle spørringer med Clerk (auth()).
// - Lagrer userId på dokumenter for "per bruker"-isolasjon.
// - GET støtter ?from=YYYY-MM-DD&to=YYYY-MM-DD og returnerer kun innlogget brukers reiser.

import { auth } from "@clerk/nextjs/server";
import { getDb } from "@/lib/mongodb";

export const runtime = "nodejs";
export const revalidate = 0;

export async function GET(req) {
  const { userId } = auth();
  if (!userId) return Response.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const url = new URL(req.url);
    const from = url.searchParams.get("from");
    const to = url.searchParams.get("to");

    const filter = { userId };
    if (from || to) {
      filter.from = {};
      if (from) filter.from.$gte = from;
      if (to) filter.from.$lte = to;
    }

    const db = await getDb();
    const trips = await db
      .collection("trips")
      .find(filter)
      .sort({ from: 1 })
      .toArray();

    const data = trips.map(({ _id, ...t }) => ({
      ...t,
      mongoId: _id.toString(),
    }));
    return Response.json(data, { status: 200 });
  } catch (err) {
    console.error("GET /api/trips failed:", err);
    return Response.json(
      { ok: false, message: err?.message || "Failed to fetch trips" },
      { status: 500 }
    );
  }
}

export async function POST(req) {
  const { userId } = auth();
  if (!userId) return Response.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await req.json();
    const db = await getDb();
    const doc = { ...body, userId, createdAt: new Date() };
    const res = await db.collection("trips").insertOne(doc);

    return Response.json(
      { ...doc, mongoId: res.insertedId.toString() },
      { status: 201 }
    );
  } catch (err) {
    console.error("POST /api/trips failed:", err);
    return Response.json(
      { ok: false, message: err?.message || "Failed to create trip" },
      { status: 500 }
    );
  }
}

/**
 * /api/trips
 *
 * GET
 *  - Henter alle reiser sortert på startdato (from).
 *  - Beholder din egen numeriske `id` som UI-nøkkel.
 *  - Mapper MongoDBs `_id` til `mongoId` (string) i svaret.
 *
 * POST
 *  - Tar imot hele trip-objektet (inkl. din numeriske `id`).
 *  - Lagrer dokumentet, setter `createdAt` på server, og returnerer `mongoId`.
 *
 * Notater
 *  - `export const runtime = "nodejs"` og `revalidate = 0` gir forutsigbar server-runtime og ferske data i dev.
 *  - Ved feil returneres JSON (ikke HTML) med `message` og `stack` for enklere feilsøk.
 */
