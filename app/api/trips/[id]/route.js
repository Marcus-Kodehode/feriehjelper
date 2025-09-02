// app/api/trips/[id]/route.js
// Kommentar:
// - Oppdatering/sletting er autorisert per eier: filter { _id, userId }.
// - Returnerer 400 hvis id er ugyldig, 404 hvis ikke funnet.

import { ObjectId } from "mongodb";
import { auth } from "@clerk/nextjs/server";
import { getDb } from "@/lib/mongodb";

export const runtime = "nodejs";
export const revalidate = 0;

export async function PUT(req, { params }) {
  const { userId } = auth();
  if (!userId) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const id = params.id;
  if (!ObjectId.isValid(id)) {
    return Response.json({ ok: false, message: "Invalid id" }, { status: 400 });
  }

  try {
    const patch = await req.json();
    const db = await getDb();
    const result = await db
      .collection("trips")
      .updateOne({ _id: new ObjectId(id), userId }, { $set: patch });

    if (result.matchedCount === 0) {
      return Response.json(
        { ok: false, message: "Not found" },
        { status: 404 }
      );
    }

    return Response.json({ ok: true }, { status: 200 });
  } catch (err) {
    console.error("PUT /api/trips/[id] failed:", err);
    return Response.json(
      { ok: false, message: err?.message || "Failed to update trip" },
      { status: 500 }
    );
  }
}

export async function DELETE(_req, { params }) {
  const { userId } = auth();
  if (!userId) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const id = params.id;
  if (!ObjectId.isValid(id)) {
    return Response.json({ ok: false, message: "Invalid id" }, { status: 400 });
  }

  try {
    const db = await getDb();
    const result = await db.collection("trips").deleteOne({
      _id: new ObjectId(id),
      userId,
    });

    if (result.deletedCount === 0) {
      return Response.json(
        { ok: false, message: "Not found" },
        { status: 404 }
      );
    }

    return Response.json({ ok: true }, { status: 200 });
  } catch (err) {
    console.error("DELETE /api/trips/[id] failed:", err);
    return Response.json(
      { ok: false, message: err?.message || "Failed to delete trip" },
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
