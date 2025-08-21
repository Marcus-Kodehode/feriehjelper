import { getDb } from "@/lib/mongodb";

export const runtime = "nodejs";

export async function GET() {
  try {
    const db = await getDb();
    const r = await db.command({ ping: 1 });
    return new Response(JSON.stringify({ ok: true, ping: r }), {
      status: 200,
      headers: { "content-type": "application/json" },
    });
  } catch (err) {
    return new Response(
      JSON.stringify({
        ok: false,
        message: err.message,
        name: err.name,
        stack: err.stack,
      }),
      { status: 500, headers: { "content-type": "application/json" } }
    );
  }
}
