import clientPromise from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

// Recuperer les scores
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const playerName = searchParams.get("name");

    const client = await clientPromise;
    const db = client.db("mon_quiz_game");
    const collection = db.collection("scores");

    // 1. Récupérer le Top 10
    const top10 = await collection
      .find({})
      .sort({ score: -1, createdAt: -1 })
      .limit(10)
      .toArray();

    let userStats = null;

    // 2. Si un nom est fourni, trouver son rang global
    if (playerName) {
      const userDoc = await collection.findOne(
        { name: playerName },
        { sort: { createdAt: -1 } },
      );
      if (userDoc) {
        const rank = await collection.countDocuments({
          $or: [
            { score: { $gt: userDoc.score } },
            { score: userDoc.score, createdAt: { $lt: userDoc.createdAt } },
          ],
        });
        userStats = { ...userDoc, rank: rank + 1 };
      }
    }

    return NextResponse.json({ top10, userStats });
  } catch (error) {
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

// Enregistrer un score
export async function POST(req: NextRequest) {
  try {
    const client = await clientPromise;
    const db = client.db("mon_quiz_game");
    const data = await req.json();

    const newScore = {
      ...data,
      createdAt: new Date(),
    };

    await db.collection("scores").insertOne(newScore);

    return NextResponse.json({ message: "Score enregistré avec succès !" });
  } catch (error) {
    return NextResponse.json(
      { error: "Erreur lors de l'enregistrement" },
      { status: 500 },
    );
  }
}
