// app/api/budgets/[id]/route.js
import { ObjectId } from "mongodb";
import { getDb } from "@/lib/mongodb";

export const runtime = "nodejs";
export const revalidate = 0;

export async function PUT(req, { params }) {
  try {
    const patch = await req.json();
    const db = await getDb();
    await db
      .collection("budgets")
      .updateOne({ _id: new ObjectId(params.id) }, { $set: patch });
    return Response.json({ ok: true }, { status: 200 });
  } catch (err) {
    console.error("PUT /api/budgets/[id] failed:", err);
    return Response.json({ error: "Failed to update budget" }, { status: 500 });
  }
}

export async function DELETE(_req, { params }) {
  try {
    const db = await getDb();
    await db.collection("budgets").deleteOne({ _id: new ObjectId(params.id) });
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
