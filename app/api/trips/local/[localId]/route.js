// app/api/trips/local/[localId]/route.js
import { getDb } from "@/lib/mongodb";

export const runtime = "nodejs";
export const revalidate = 0;

export async function DELETE(_req, { params }) {
  try {
    const localId = Number(params.localId);
    const db = await getDb();
    await db.collection("trips").deleteOne({ id: localId });
    return Response.json({ ok: true }, { status: 200 });
  } catch (err) {
    console.error("DELETE /api/trips/local/[localId] failed:", err);
    return Response.json({ error: "Failed to delete by local id" }, { status: 500 });
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