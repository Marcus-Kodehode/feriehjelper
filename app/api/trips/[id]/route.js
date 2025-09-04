// app/api/trips/[id]/route.js
// Kommentar:
// - Oppdatering/sletting er autorisert per eier: filter { _id, userId }.
// - Returnerer 400 hvis id er ugyldig, 404 hvis ikke funnet.
import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { auth } from "@clerk/nextjs/server";
import { getDb } from "@/lib/mongodb";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

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

export async function PUT(req, { params }) {
  const { userId } = await auth();
  if (!userId)
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const id = params.id;
  if (!ObjectId.isValid(id)) {
    return NextResponse.json(
      { ok: false, message: "invalid id" },
      { status: 400 }
    );
  }

  try {
    const patchRaw = await req.json();
    const patch = pickAllowed(patchRaw);

    const db = await getDb();
    const result = await db
      .collection("trips")
      .updateOne({ _id: new ObjectId(id), userId }, { $set: patch });

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { ok: false, message: "not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("PUT /api/trips/[id] failed:", err);
    return NextResponse.json(
      { ok: false, message: err?.message || "failed to update trip" },
      { status: 500 }
    );
  }
}

export async function DELETE(_req, { params }) {
  const { userId } = await auth();
  if (!userId)
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const id = params.id;
  if (!ObjectId.isValid(id)) {
    return NextResponse.json(
      { ok: false, message: "invalid id" },
      { status: 400 }
    );
  }

  try {
    const db = await getDb();
    const result = await db
      .collection("trips")
      .deleteOne({ _id: new ObjectId(id), userId });

    if (result.deletedCount === 0) {
      return NextResponse.json(
        { ok: false, message: "not found" },
        { status: 404 }
      );
    }

    // 204 No Content er fint for DELETE
    return new Response(null, { status: 204 });
  } catch (err) {
    console.error("DELETE /api/trips/[id] failed:", err);
    return NextResponse.json(
      { ok: false, message: err?.message || "failed to delete trip" },
      { status: 500 }
    );
  }
}

/**
 * /api/trips/:id   (id = MongoDB ObjectId)
 *
 * PUT
 *  - Oppdaterer dokumentet med gitt ObjectId (payload = patch/hele objektet).
 *
 * DELETE
 *  - Sletter dokumentet med gitt ObjectId.
 *
 * Anbefaling
 *  - Klienten bruker PUT/DELETE når elementet allerede har mongoId.
 *  - For elementer som ennå ikke har rukket å få mongoId kan du (valgfritt)
 *    implementere et ekstra endepunkt: /api/trips/local/:localId for sletting via din numeriske id.
 */
