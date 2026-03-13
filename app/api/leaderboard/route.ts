import clientPromise from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const playerName = searchParams.get("name");

    const client = await clientPromise;
    const db = client.db("mon_quiz_game");
    const collection = db.collection("scores");

    // 1. Récupérer le Top 10 trié par Succès, puis par Score
    const top10 = await collection
      .find({})
      .sort({ correctAnswers: -1, score: -1, createdAt: -1 })
      .limit(10)
      .toArray();

    let userStats = null;

    // 2. Trouver le rang global de l'utilisateur
    if (playerName) {
      const userDoc = await collection.findOne(
        { name: playerName },
        { sort: { createdAt: -1 } },
      );

      if (userDoc) {
        // Le rang est le nombre de personnes qui ont :
        // SOIT plus de bonnes réponses
        // SOIT le même nombre de bonnes réponses MAIS un meilleur score
        const rank = await collection.countDocuments({
          $or: [
            { correctAnswers: { $gt: userDoc.correctAnswers || 0 } },
            {
              correctAnswers: userDoc.correctAnswers || 0,
              score: { $gt: userDoc.score },
            },
            {
              correctAnswers: userDoc.correctAnswers || 0,
              score: userDoc.score,
              createdAt: { $lt: userDoc.createdAt },
            },
          ],
        });
        userStats = { ...userDoc, rank: rank + 1 };
      }
    }

    return NextResponse.json({ top10, userStats });
  } catch (error) {
    console.error("Erreur Leaderboard:", error);
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
