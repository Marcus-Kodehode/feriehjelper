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
/*
  Health Route – status og DB-ping

  Hva:
  - Endepunkt for å sjekke at server fungerer, og (valgfritt) at MongoDB svarer.

  URL-er:
  - GET /api/health              → "shallow" helsesjekk (ingen DB-tilkobling)
  - GET /api/health?deep=1       → "deep" helsesjekk med MongoDB ping

  Sikkerhet:
  - Sett HEALTH_TOKEN i env (f.eks. i Vercel) for å kreve ?token=<verdi>.
    Uten token i prod vil svaret bli 403 forbidden.
    I utvikling kan HEALTH_TOKEN droppes.

  Svarformat:
  - 200 OK:
      {
        ok: true,
        env: "development" | "production",
        dbOk: null | true | false   // null: shallow, ellers resultat av DB-ping
      }
  - 500 Error:
      I dev: inkluderer feilmelding og stack.
      I prod: skjuler detaljer ("internal error").

  Caching/Runtime:
  - revalidate = 0 → alltid ferskt svar (ingen cache).
  - runtime = "nodejs" → kjører som server-endepunkt.

  Eksempler:
  - curl http://localhost:3000/api/health
  - curl "http://localhost:3000/api/health?deep=1"
  - curl "https://din-app.vercel.app/api/health?deep=1&token=DIN_TOKEN"
*/