import { MongoClient } from "mongodb";

const uri = process.env.MONGODB_URI!;
const options = {};

if (!uri) {
  throw new Error("Ajoute MONGODB_URI a ton fichier .env.local");
}

const client = new MongoClient(uri, options);
const clientPromise = client.connect();

export default clientPromise;
