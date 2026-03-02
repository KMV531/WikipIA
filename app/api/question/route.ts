import { NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { theme, type, userJustification } = body;

    if (!theme) {
      return NextResponse.json({ error: "Theme is required" }, { status: 400 });
    }

    let prompt = "";

    if (type === "generate") {
      prompt = `
        Génère une question pour un collégien sur le thème "${theme}".
        Inclue 1 erreur volontaire dans le texte.
        Retourne uniquement le texte de la question.
      `;
    } else if (type === "verify" && userJustification) {
      prompt = `
        L'élève a donné la justification suivante : "${userJustification}".
        Vérifie si cette justification est correcte pour la question précédente.
        Répond avec "true" si correct, "false" sinon, et explique pourquoi.
      `;
    }

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
    });

    const content = response.text || "";

    return NextResponse.json({
      question: type === "generate" ? content : undefined,
      answer:
        type === "verify" ? content.toLowerCase().includes("true") : undefined,
      explanation: type === "verify" ? content : undefined,
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 },
    );
  }
}
