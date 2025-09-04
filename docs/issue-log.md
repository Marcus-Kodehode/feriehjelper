Symptomer

GET /api/* ga 401 og/eller 404 (emergencies, trips, activities, budgets).

/api/debug/whoami returnerte alltid { ok: true, userId: null, ... }.

Konsollen var full av 401-feil selv etter innlogging.

Middleware-forsøk feilet med TypeError: auth(...).protect is not a function.

I Clerk-debugloggene sto status: signed-in (dvs. du var faktisk innlogget).

Hva vi fant

Versjonsmismatch/feil API-bruk i middleware:
Koden brukte auth().protect() og redirectToSignIn-mønstre som ikke finnes i din Clerk-versjon. Det ga runtime-feil.

Dev-caching/Turbopack gjorde API-routene “statisk generert”:
Da ble auth() kjørt i en kontekst uten sesjon → userId endte som null, selv om du var innlogget. Samtidig ble flere app/api/* ikke riktig plukket opp → 404.

.env med anførselstegn kunne skape parsing-trøbbel (sekundært).

Route-struktur/exports: Minst én API-fil manglet korrekte GET/POST-exports eller lå i en bane Next ikke matchet → 404.

Rotårsak(er)

Feil middleware-API for din Clerk-versjon + Next/Turbopack som cachet/optimaliserte handlerne slik at auth() ble kalt i en “statisk” edge-kontekst uten sesjon.

Tiltak (fasit)

Bytt til et enkelt middleware: clerkMiddleware + createRouteMatcher, og ikke bruk auth().protect(). Ved manglende innlogging: NextResponse.redirect('/sign-in').

I alle API-routene som trenger auth: legg til
export const dynamic = "force-dynamic"; og export const runtime = "nodejs"; for å hindre statisk caching i dev.

Rydd opp i .env (uten anførselstegn) og restart dev-serveren.

Slett .next/ og start med webpack i dev (npm run dev -- --no-turbo) for å unngå Turbopack-glitchene.

Verifiser at hver app/api/<navn>/route.ts faktisk eksporterer GET/POST.

Forventet effekt

/api/debug/whoami viser faktisk userId.

GET/POST /api/budgets (og øvrige) gir 200 når innlogget (401 når ikke), og 404 forsvinner når path/exports er korrekte.