// app/api/activities/[id]/route.js
import { ObjectId } from "mongodb";
import { getDb } from "@/lib/mongodb";
import { auth } from "@clerk/nextjs/server";

export const runtime = "nodejs";
export const revalidate = 0;

/**
 * Oppdater aktivitet, men kun hvis dokumentet tilhører innlogget bruker.
 */
export async function PUT(req, { params }) {
  const { userId } = auth();
  if (!userId) return Response.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const patch = await req.json();
    const db = await getDb();

    const result = await db.collection("activities").updateOne(
      { _id: new ObjectId(params.id), userId }, // <-- eier-sjekk
      { $set: patch }
    );

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

/**
 * Slett aktivitet, men kun hvis dokumentet tilhører innlogget bruker.
 */
export async function DELETE(_req, { params }) {
  const { userId } = auth();
  if (!userId) return Response.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const db = await getDb();
    const result = await db
      .collection("activities")
      .deleteOne({ _id: new ObjectId(params.id), userId }); // <-- eier-sjekk

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
