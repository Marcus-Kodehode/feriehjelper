// app/api/activities/[id]/route.js
import { ObjectId } from "mongodb";
import { getDb } from "../../../../lib/mongodb";
import { auth } from "@clerk/nextjs/server";

export const runtime = "nodejs";
export const revalidate = 0;

function isValidObjectId(id) {
  return typeof id === "string" && /^[a-fA-F0-9]{24}$/.test(id);
}

/** Oppdater aktivitet, men kun hvis dokumentet tilhører innlogget bruker. */
export async function PUT(req, { params }) {
  const { userId } = await auth();
  if (!userId) return Response.json({ error: "Unauthorized" }, { status: 401 });
  if (!isValidObjectId(params.id))
    return Response.json({ error: "Bad id" }, { status: 400 });

  try {
    const patchRaw = await req.json();
    const { _id, mongoId, userId: _ignoreUserId, ...patch } = patchRaw;

    if (patch.tripId != null) {
      const t = Number(patch.tripId);
      if (!Number.isFinite(t)) {
        return Response.json(
          { error: "tripId must be a number" },
          { status: 400 }
        );
      }
      patch.tripId = t;
    }

    const db = await getDb();
    const result = await db
      .collection("activities")
      .updateOne({ _id: new ObjectId(params.id), userId }, { $set: patch });

    if (result.matchedCount === 0) {
      return Response.json({ error: "Not found" }, { status: 404 });
    }

    return Response.json({ ok: true }, { status: 200 });
  } catch (err) {
    console.error("PUT /api/activities/[id] failed:", err);
    return Response.json(
      { error: "Failed to update activity" },
      { status: 500 }
    );
  }
}

/** Slett aktivitet, men kun hvis dokumentet tilhører innlogget bruker. */
export async function DELETE(_req, { params }) {
  const { userId } = await auth();
  if (!userId) return Response.json({ error: "Unauthorized" }, { status: 401 });
  if (!isValidObjectId(params.id))
    return Response.json({ error: "Bad id" }, { status: 400 });

  try {
    const db = await getDb();
    const result = await db.collection("activities").deleteOne({
      _id: new ObjectId(params.id),
      userId,
    });

    if (result.deletedCount === 0) {
      return Response.json({ error: "Not found" }, { status: 404 });
    }

    return Response.json({ ok: true }, { status: 200 });
  } catch (err) {
    console.error("DELETE /api/activities/[id] failed:", err);
    return Response.json(
      { error: "Failed to delete activity" },
      { status: 500 }
    );
  }
}
/**
 * /api/activities/:id  (id = MongoDB ObjectId)
 *
 * PUT
 *  - Oppdaterer aktivitet med gitt ObjectId.
 *
 * DELETE
 *  - Sletter aktivitet med gitt ObjectId.
 *
 * Merk
 *  - Dette er "normal sti" når elementet allerede har mongoId i klient-state.
 */
