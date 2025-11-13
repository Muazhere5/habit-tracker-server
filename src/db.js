import { MongoClient, ServerApiVersion } from "mongodb";

export let mongoClient = null;
export let db = null;

export async function connectDB(uri, dbName) {
  mongoClient = new MongoClient(uri, {
    serverApi: { version: ServerApiVersion.v1, strict: true, deprecationErrors: true }
  });
  await mongoClient.connect();
  db = mongoClient.db(dbName || "habitdb");
  
  await db.admin().command({ ping: 1 });
  console.log("✅ MongoDB connected (native driver), DB:", db.databaseName);
}

export function habitsCol() {
  if (!db) throw new Error("DB not connected yet");
  return db.collection("habits");
}
