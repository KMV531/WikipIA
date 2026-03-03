import { NextResponse } from "next/server";
import Groq from "groq-sdk";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export async function POST(req: Request) {
  try {
    const { theme } = await req.json();

    if (!theme) {
      return NextResponse.json({ error: "Thème manquant" }, { status: 400 });
    }

    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content: `Tu es un concepteur de jeux de fact-checking. 
            Tu génères des textes pour des collégiens. 
            RÈGLES CRUCIALES :
            1. ZERO CONFUSION : Tout le texte doit être 100% vrai, SAUF un seul fait précis (nom, date, lieu).
            2. DIVERSITÉ : Ne reste pas sur le sujet le plus connu du thème (ex: si thème 'Dinosaures', évite le T-Rex si possible). Explore des sous-sujets originaux.
            3. MOT-CLÉ DE SÉCURITÉ : Dans le champ "error", ne mets qu'un seul mot ou un groupe de mots très court qui représente l'erreur.
            4. STRUCTURE : 3 phrases de contexte vrai, 1 phrase contenant l'erreur unique.`,
        },
        {
          role: "user",
          content: `Génère un quiz sur : "${theme}".
            Interdiction d'inventer plusieurs erreurs.
            Réponds UNIQUEMENT en JSON :
            {
              "text": "Texte court et pédagogique",
              "error": "Le mot-clé précis à trouver",
              "correction": "La vérité en une phrase simple",
              "category": "DATE ou LIEU ou NOM ou CHIFFRE" 
            }`,
        },
      ],
      model: "meta-llama/llama-4-scout-17b-16e-instruct", // llama-3.3-70b-versatile
      temperature: 0.7,
      response_format: { type: "json_object" },
    });

    const responseContent = completion.choices[0]?.message?.content;

    if (!responseContent) {
      throw new Error("Pas de réponse de l'IA");
    }

    const data = JSON.parse(responseContent);
    return NextResponse.json(data);
  } catch (error) {
    console.error("Erreur Groq:", error);
    return NextResponse.json(
      { error: "Impossible de générer la question" },
      { status: 500 },
    );
  }
}
