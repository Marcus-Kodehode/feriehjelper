// app/api/emergencies/[id]/route.js
// Endre/slett kun egne dokumenter: filter inkluderer { _id, userId }.

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

  if (!isValidObjectId(params.id)) {
    return Response.json({ error: "Bad id" }, { status: 400 });
  }

  try {
    const patchRaw = await req.json();
    const { _id, mongoId, userId: _ignoreUserId, ...patch } = patchRaw;

    const db = await getDb();
    const result = await db
      .collection("emergencies")
      .updateOne(
        { _id: new ObjectId(params.id), userId },
        { $set: { ...patch, updatedAt: new Date() } }
      );

    if (result.matchedCount === 0) {
      return Response.json({ error: "Not found" }, { status: 404 });
    }

    return Response.json({ ok: true }, { status: 200 });
  } catch (err) {
    console.error("PUT /api/emergencies/[id] failed:", err);
    return Response.json(
      { error: "Failed to update emergency" },
      { status: 500 }
    );
  }
}

export async function DELETE(_req, { params }) {
  const { userId } = auth();
  if (!userId) return Response.json({ error: "Unauthorized" }, { status: 401 });

  if (!isValidObjectId(params.id)) {
    return Response.json({ error: "Bad id" }, { status: 400 });
  }

  try {
    const db = await getDb();
    const result = await db
      .collection("emergencies")
      .deleteOne({ _id: new ObjectId(params.id), userId });

    if (result.deletedCount === 0) {
      return Response.json({ error: "Not found" }, { status: 404 });
    }

    return Response.json({ ok: true }, { status: 200 });
  } catch (err) {
    console.error("DELETE /api/emergencies/[id] failed:", err);
    return Response.json(
      { error: "Failed to delete emergency" },
      { status: 500 }
    );
  }
}

/**
 * /api/emergencies/:id  (id = MongoDB ObjectId)
 *
 * PUT
 *  - Oppdaterer dokument med gitt ObjectId.
 *  - Legger på updatedAt på server.
 *
 * DELETE
 *  - Sletter dokument med gitt ObjectId.
 *
 * Merk
 *  - Dette er “vanlig” edit/slett når klienten allerede kjenner mongoId på elementet.
 */
