import { NextResponse } from "next/server";
import Groq from "groq-sdk";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export async function POST(req: Request) {
  try {
    const { userChoice, aiError, aiCorrection } = await req.json();

    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content: `Tu es l'arbitre bienveillant du jeu "Wikipia". 
            Ton rôle est de valider la réponse d'un élève.
            CONSIGNES :
            1. ANALYSE L'INTENTION : Si l'élève mentionne l'erreur cachée, même avec des fautes d'orthographe ou une phrase mal construite, tu dis OUI.
            
            2. STRICT : Si l'élève répond totalement à côté ou ne mentionne pas le sujet de l'erreur, tu dis NON.
            RÉPONSE UNIQUE : OUI ou NON.
            Si l'élève répond uniquement en pointant l'erreur sans expliquer, tu dis NON.
           Si l'élève répond en donnant une information correcte mais sans mentionner l'erreur, tu dis OUI.
           Si l'élève ne répond pas la date  exacte, tu dis NON.`,
        },
        {
          role: "user",
          content: `CONTEXTE DU JEU :
            L'IA a menti en disant : "${aiError}".
            La vérité est : "${aiCorrection}".
            L'élève a écrit : "${userChoice}".
    
            QUESTION : L'élève a-t-il corriger l'erreur ?`,
        },
      ],
      model: "meta-llama/llama-4-maverick-17b-128e-instruct", // llama-3-8b-8192
    });

    const result = completion.choices[0]?.message?.content
      ?.trim()
      .toUpperCase();
    return NextResponse.json({ isCorrect: result?.includes("OUI") });
  } catch (error) {
    return NextResponse.json({ isCorrect: false });
  }
}
