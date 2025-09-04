// app/api/trips/local/[localId]/route.js
// Kommentar:
// - Sletter en reise med lokal numerisk id (id) kun for innlogget bruker (userId).
// - Brukes typisk når klienten har lokale rader uten mongoId.

import { getDb } from "../../../../../lib/mongodb";
import { auth } from "@clerk/nextjs/server";

export const runtime = "nodejs";
export const revalidate = 0;

export async function DELETE(_req, { params }) {
  const { userId } = await auth();
  if (!userId) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const localId = Number(params.localId);
  if (!Number.isFinite(localId)) {
    return Response.json({ error: "Invalid localId" }, { status: 400 });
  }

  try {
    const db = await getDb();
    const result = await db
      .collection("trips")
      .deleteOne({ id: localId, userId });

    if (result.deletedCount === 0) {
      return Response.json(
        { ok: false, message: "Not found" },
        { status: 404 }
      );
    }

    return Response.json({ ok: true }, { status: 200 });
  } catch (err) {
    console.error("DELETE /api/trips/local/[localId] failed:", err);
    return Response.json(
      { error: "Failed to delete by local id" },
      { status: 500 }
    );
  }
}

/**
 * /api/trips/local/:localId
 *
 * DELETE
 *  - Sletter et trip-dokument basert på appens EGEN numeriske `id` (ikke Mongo `_id`).
 *  - Brukes som fallback når et kort ennå ikke har fått `mongoId` (sync etter første POST),
 *    eller hvis det finnes server-rader som ble lagret med kun lokal `id`.
 *
 * Respons:
 *  - 200 { ok: true } ved suksess (uansett om dokument fantes eller ikke).
 *  - 500 med feilmelding ved uventet feil (DB-tilkobling o.l.).
 *
 * Merk:
 *  - Endrer ikke localStorage; UI håndterer optimistisk sletting i context først.
 */
