import { GoogleGenAI } from "@google/genai";
import { NextResponse } from "next/server";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });

export async function POST(req: Request) {
  try {
    const { theme } = await req.json();

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Tu es un Agent Secret. Thème : ${theme}. 
        Génère un pack de 3 missions de fact-checking pour collégiens (11-13 ans).

        INTERDICTION FORMELLE de parler de :
        - L'exportation de poisson séché ou de nouilles (trop utilisé).
        - La ville de Tokyo ou du Japon pour le siège social (trop utilisé).
        - La date exacte de création 1938 (trop utilisé).

        CONSIGNE : Explore des domaines variés de ${theme} comme :
        - Les brevets étranges (écrans pliables, bagues connectées).
        - La fabrication (semi-conducteurs, processeurs).
        - Les records de vente ou les modèles oubliés.
        - Les matériaux utilisés (verre, plastique recyclé).
        - Des anecdotes sur les publicités ou les stades sponsorisés.

        Réponds UNIQUEMENT au format JSON suivant :
        {
          "missions": [
            {
              "text": "Texte avec une erreur",
              "error": "L'erreur",
              "correction": "La vérité",
              "category": "DATE/NOM/LIEU"
            }
          ]
        }`,
      config: {
        temperature: 0.7,
      },
      // La v3 supporte souvent mieux le formatage JSON direct
    });

    const data = JSON.parse(response.text!);
    return NextResponse.json(data);
  } catch (error) {
    console.error("Erreur Gemini 3:", error);
    return NextResponse.json(
      { error: "Interférence avec Gemini 3" },
      { status: 500 },
    );
  }
}
