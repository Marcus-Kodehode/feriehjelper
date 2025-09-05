// // app/api/debug/ensure-indexes/route.js
// import { NextResponse } from "next/server";
// import { getDb } from "@/lib/mongodb";

// export const runtime = "nodejs";
// export const revalidate = 0;

// export async function GET() {
//   // Kun i development – fjern hvis du vil kjøre i prod
//   if (process.env.NODE_ENV !== "development") {
//     return NextResponse.json({ error: "forbidden" }, { status: 403 });
//   }

//   try {
//     const db = await getDb();

//     const ensure = async (colName, keys, opts) => {
//       try {
//         const name = await db.collection(colName).createIndex(keys, opts);
//         return { collection: colName, name, created: true };
//       } catch (e) {
//         // Hvis indeksen finnes men med samme spesifikasjon, går dette fint.
//         // Noen ganger kan Atlas kaste ‘IndexOptionsConflict’ (85) hvis noe
//         // ikke matcher helt – vi svarer pent i stedet for 500.
//         if (e?.code === 85 || e?.code === 86) {
//           return {
//             collection: colName,
//             name: opts?.name,
//             created: false,
//             note: "already exists / options conflict",
//           };
//         }
//         throw e;
//       }
//     };

//     const results = [];
//     // trips: unik per (userId, id)
//     results.push(
//       await ensure(
//         "trips",
//         { userId: 1, id: 1 },
//         { unique: true, name: "uniq_userId_id" }
//       )
//     );

//     // kjør tilsvarende for andre collections hvis du vil:
//     // results.push(await ensure("budgets", { userId: 1, id: 1 }, { unique: true, name: "uniq_userId_id" }));
//     // results.push(await ensure("activities", { userId: 1, id: 1 }, { unique: true, name: "uniq_userId_id" }));
//     // results.push(await ensure("emergencies", { userId: 1, id: 1 }, { unique: true, name: "uniq_userId_id" }));

//     return NextResponse.json({ ok: true, results });
//   } catch (e) {
//     console.error("ensure-indexes failed", e);
//     return NextResponse.json(
//       { ok: false, error: e?.message || "failed" },
//       { status: 500 }
//     );
//   }
// }
