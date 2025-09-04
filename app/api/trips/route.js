// app/api/trips/route.js
// Kommentar:
// - Beskytter alle spørringer med Clerk (auth()).
// - Lagrer userId på dokumenter for "per bruker"-isolasjon.
// - GET støtter ?from=YYYY-MM-DD&to=YYYY-MM-DD og returnerer kun innlogget brukers reiser.
import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getDb } from "../../../lib/mongodb";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

// Kun felter vi lar klienten skrive/oppdatere
const ALLOWED_FIELDS = [
  "id",
  "title",
  "destination",
  "from",
  "to",
  "transport",
  "stay",
  "travelers",
  "notes",
];

const pickAllowed = (obj = {}) =>
  Object.fromEntries(
    Object.entries(obj).filter(([k]) => ALLOWED_FIELDS.includes(k))
  );

export async function GET(req) {
  try {
    const { userId } = await auth();
    if (!userId)
      return NextResponse.json({ error: "unauthorized" }, { status: 401 });

    const url = new URL(req.url);
    const fromP = url.searchParams.get("from");
    const toP = url.searchParams.get("to");

    const db = await getDb();

    // Filter: alle reiser for bruker, ev. som overlapper [fromP, toP]
    const filter = { userId };
    if (fromP || toP) {
      const from = fromP || "0000-01-01";
      const to = toP || "9999-12-31";
      // Overlappslogikk: trip.to >= from  AND  trip.from <= to
      filter.$and = [{ to: { $gte: from } }, { from: { $lte: to } }];
    }

    const docs = await db
      .collection("trips")
      .find(filter, { projection: { userId: 0 } })
      .sort({ from: 1, id: 1 })
      .toArray();

    const items = docs.map(({ _id, ...rest }) => ({
      ...rest,
      mongoId: _id.toString(),
    }));

    return NextResponse.json(items);
  } catch (e) {
    console.error("GET /api/trips failed:", e);
    return NextResponse.json({ error: "server" }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const { userId } = await auth();
    if (!userId)
      return NextResponse.json({ error: "unauthorized" }, { status: 401 });

    const bodyRaw = await req.json();
    const body = pickAllowed(bodyRaw);

    if (body?.id == null) {
      return NextResponse.json({ error: "missing id" }, { status: 400 });
    }

    const doc = { ...body, userId };
    const db = await getDb();

    // NB: anbefalt unik indeks: { userId: 1, id: 1 }
    const result = await db.collection("trips").insertOne(doc);

    // Klienten din trenger bare mongoId
    return NextResponse.json(
      { mongoId: result.insertedId.toString() },
      { status: 201 }
    );
  } catch (e) {
    if (e?.code === 11000) {
      // Treffer hvis du har unik indeks { userId, id }
      return NextResponse.json(
        { error: "duplicate id for user" },
        { status: 409 }
      );
    }
    console.error("POST /api/trips failed:", e);
    return NextResponse.json({ error: "server" }, { status: 500 });
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
