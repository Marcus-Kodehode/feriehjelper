// app/api/budgets/[id]/route.js
// PUT/DELETE beskytter ved å inkludere { userId } i filteret.
// Da kan du kun endre/slette dine egne dokumenter.
import { ObjectId } from "mongodb";
import { getDb } from "@/lib/mongodb";
import { auth } from "@clerk/nextjs/server";

export const runtime = "nodejs";
export const revalidate = 0;

function isValidObjectId(id) {
  return typeof id === "string" && /^[a-fA-F0-9]{24}$/.test(id);
}

export async function PUT(req, { params }) {
  const { userId } = auth();
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
      .collection("budgets")
      .updateOne({ _id: new ObjectId(params.id), userId }, { $set: patch });

    if (result.matchedCount === 0) {
      return Response.json({ error: "Not found" }, { status: 404 });
    }

    return Response.json({ ok: true }, { status: 200 });
  } catch (err) {
    console.error("PUT /api/budgets/[id] failed:", err);
    return Response.json({ error: "Failed to update budget" }, { status: 500 });
  }
}

export async function DELETE(_req, { params }) {
  const { userId } = auth();
  if (!userId) return Response.json({ error: "Unauthorized" }, { status: 401 });
  if (!isValidObjectId(params.id))
    return Response.json({ error: "Bad id" }, { status: 400 });

  try {
    const db = await getDb();
    const result = await db
      .collection("budgets")
      .deleteOne({ _id: new ObjectId(params.id), userId });

    if (result.deletedCount === 0) {
      return Response.json({ error: "Not found" }, { status: 404 });
    }

    return Response.json({ ok: true }, { status: 200 });
  } catch (err) {
    console.error("DELETE /api/budgets/[id] failed:", err);
    return Response.json({ error: "Failed to delete budget" }, { status: 500 });
  }
}

/**
 * /api/budgets/:id  (id = MongoDB ObjectId)
 *
 * PUT
 *  - Oppdaterer budsjett med gitt ObjectId (payload = patch/hele objektet).
 *
 * DELETE
 *  - Sletter budsjett med gitt ObjectId.
 *
 * Merk
 *  - Standard sti når elementet allerede har mongoId i klient-state.
 */
