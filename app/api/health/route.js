import { getDb } from "@/lib/mongodb";

export async function GET() {
  try {
    const db = await getDb();
    // ping ved å lese en tom pipeline
    await db.command({ ping: 1 });
    return Response.json({ ok: true });
  } catch (e) {
    console.error(e);
    return Response.json({ ok: false, error: e.message }, { status: 500 });
  }
}
