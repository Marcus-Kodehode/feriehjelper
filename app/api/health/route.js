// app/api/health/route.js
import { getDb } from "@/lib/mongodb";

export const runtime = "nodejs";
export const revalidate = 0;

export async function GET(req) {
  const url = new URL(req.url);

  // Valgfri auth: sett HEALTH_TOKEN i env for å beskytte i prod
  const token = url.searchParams.get("token");
  if (process.env.HEALTH_TOKEN && token !== process.env.HEALTH_TOKEN) {
    return new Response("forbidden", { status: 403 });
  }

  // Shallow vs deep: ?deep=1 gjør DB-ping
  const deep = url.searchParams.get("deep") === "1";

  try {
    let dbOk = null;
    if (deep) {
      const db = await getDb();
      const r = await db.command({ ping: 1 });
      dbOk = !!(r && r.ok);
    }

    return Response.json({
      ok: true,
      env: process.env.NODE_ENV,
      dbOk, // null hvis shallow, true/false hvis deep
    });
  } catch (err) {
    // Vis detaljer kun i dev
    const isDev = process.env.NODE_ENV !== "production";
    return Response.json(
      {
        ok: false,
        error: isDev ? err?.message : "internal error",
        ...(isDev ? { stack: err?.stack } : {}),
      },
      { status: 500 }
    );
  }
}
