import clientPromise from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

// Recuperer les scores
export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db("mon_quiz_game");

    const leaderboard = await db
      .collection("scores")
      .find({})
      .sort({ score: -1, time: 1 })
      .limit(10)
      .toArray();

    return NextResponse.json(leaderboard);
  } catch (error) {
    return NextResponse.json(
      {
        error: "Impossible de charger les scores",
      },
      {
        status: 500,
      },
    );
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
