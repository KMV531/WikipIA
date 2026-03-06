import { GoogleGenAI } from "@google/genai";
import { NextResponse } from "next/server";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });

export async function POST(req: Request) {    
  try {
    const body = await req.json();
    const theme = body.theme;

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Tu es un Agent Secret. Thème : ${theme}. 
        Génère un pack de 3 missions de fact-checking pour collégiens (11-13 ans).

        RÈGLES STRICTES :
          1. LONGUEUR : Maximum 200 caractères par texte. Sois percutant.
          2. PAS DE GRAS : Le texte doit être uniforme. L'erreur doit être fondue dans la masse.
          3. L'ERREUR : Elle doit être crédible. Pas de dates absurdes comme 1800 pour un iPhone.
          4. VARIÉTÉ : Change de sujet à chaque mission (Tech, Records, Créateurs, Anecdotes).

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
              "category": "DATE | NOM |LIEU"
            }
          ]
        }`,
      config: {
        temperature: 0.7,
      },
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