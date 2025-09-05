// import { NextResponse } from "next/server";
// import { MongoClient } from "mongodb";

// export async function GET() {
//   let client;
//   try {
//
    
//     client = new MongoClient(uri);
//     console.log("Attempting to connect to MongoDB...");
//     await client.connect();
//     console.log("Connected successfully!");
    
//     const db = client.db("feriehjelper");
//     const result = await db.admin().ping();
    
//     return NextResponse.json({ 
//       status: "connected",
//       result: result,
//       dbName: db.databaseName
//     });
//   } catch (error) {
//     console.error("MongoDB connection failed:", error);
//     return NextResponse.json({ 
//       error: error.message,
//       code: error.code,
//       name: error.name
//     }, { status: 500 });
//   } finally {
//     if (client) {
//       await client.close();
//     }
//   }
// }