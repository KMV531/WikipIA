import { GoogleGenAI } from "@google/genai";
import { NextResponse } from "next/server";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });

// gemini-3.1-pro-preview = error 429 due to exceeded current quota
// gemini-3-flash-preview = error 503 due to experiencing high demand, but works sometimes with relevant content
// gemini-3.1-flash-lite-preview = 200 OK but less relevant content

export async function POST(req: Request) {
  try {
    const { theme } = await req.json();

    const response = await ai.models.generateContent({
      model: "gemini-3.1-flash-lite-preview", // gemini-3.1-flash-lite-preview
      contents: `Tu es un Agent Secret. Thème : ${theme}. 
        Génère un pack de 3 missions de fact-checking pour collégiens. Maximum entre 200 et 350 caractères par texte. Sois percutant.

        INTERDICTION FORMELLE de parler de :
        - L'exportation de poisson séché ou de nouilles (trop utilisé).
        - La ville de Tokyo ou du Japon pour le siège social (trop utilisé).
        - La date exacte de création 1938 (trop utilisé).

        CONSIGNE : Explore des domaines variés de ${theme}

        Réponds UNIQUEMENT au format JSON :
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
