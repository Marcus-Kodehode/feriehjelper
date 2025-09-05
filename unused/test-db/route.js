// // app/api/test-db/route.js
// import { getDb } from "../../lib/mongodb";

// export async function GET() {
//   console.log("Testing database connection...");
//   console.log("Environment variables:");
//   console.log("- MONGODB_URI exists:", !!process.env.MONGODB_URI);
//   console.log("- MONGODB_DB:", process.env.MONGODB_DB);
//   console.log("- NODE_ENV:", process.env.NODE_ENV);

//   try {
//     const db = await getDb();

//     // Test the connection by listing collections
//     const collections = await db.listCollections().toArray();
//     console.log(
//       "Available collections:",
//       collections.map((c) => c.name)
//     );

//     // Try to count documents in activities collection
//     const activitiesCount = await db.collection("activities").countDocuments();
//     console.log("Activities count:", activitiesCount);

//     return Response.json({
//       success: true,
//       message: "Database connection successful!",
//       database: db.databaseName,
//       collections: collections.map((c) => c.name),
//       activitiesCount,
//     });
//   } catch (error) {
//     console.error("Database test failed:", error);
//     return Response.json(
//       {
//         success: false,
//         error: error.message,
//         stack: error.stack,
//         mongoUri: process.env.MONGODB_URI ? "Set (hidden)" : "NOT SET",
//         mongoDb: process.env.MONGODB_DB || "NOT SET",
//       },
//       { status: 500 }
//     );
//   }
// }
