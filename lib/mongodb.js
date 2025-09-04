import { MongoClient, ServerApiVersion } from "mongodb";

const uri = process.env.MONGODB_URI;
const dbName = process.env.MONGODB_DB || "feriehjelper";

console.log("MongoDB URI exists:", !!uri);
console.log("Database name:", dbName);

if (!uri) {
  throw new Error("Missing MONGODB_URI in .env.local");
}

let client;
let clientPromise;

// In development, use a global variable to preserve the connection
// across module reloads caused by HMR (Hot Module Replacement)
if (process.env.NODE_ENV === "development") {
  if (!global._mongoClientPromise) {
    client = new MongoClient(uri, {
      serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
      },
      maxPoolSize: 10,
      minPoolSize: 2,
      maxIdleTimeMS: 60000,
      serverSelectionTimeoutMS: 5000,
    });

    console.log("Creating new MongoDB connection in development...");
    global._mongoClientPromise = client
      .connect()
      .then((client) => {
        console.log("MongoDB connected successfully!");
        return client;
      })
      .catch((err) => {
        console.error("MongoDB connection failed:", err.message);
        delete global._mongoClientPromise;
        throw err;
      });
  }
  clientPromise = global._mongoClientPromise;
} else {
  // In production, create a new client for each request
  client = new MongoClient(uri, {
    serverApi: {
      version: ServerApiVersion.v1,
      strict: true,
      deprecationErrors: true,
    },
  });
  clientPromise = client.connect();
}

export async function getDb() {
  try {
    const client = await clientPromise;
    console.log("Getting database:", dbName);
    return client.db(dbName);
  } catch (error) {
    console.error("Error getting database:", error.message);
    console.error("Full error:", error);
    throw new Error(`Database connection failed: ${error.message}`);
  }
}
