import { NextResponse } from "next/server";
import Groq from "groq-sdk";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const theme = body.theme;

    if (!theme) {
      return NextResponse.json({ error: "Thème manquant" }, { status: 400 });
    }

    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content: `Tu es l'Encyclopédiste de "Wikipia". 
          Ton but est de rédiger un texte court (3-4 phrases) 100% VRAI et vérifiable sur un thème donné.

          CONSIGNES DE RÉDACTION :
          1. ABSOLUE VÉRITÉ : Ne cite que des faits historiques ou scientifiques indiscutables (pas de théories ou de dates floues).
          2. STYLE : Pédagogique, clair, destiné à des collégiens.
          3. STRUCTURE : Un paragraphe fluide.
          4. THÈME : Sois original, évite les clichés les plus connus.
          
          FORMAT DE RÉPONSE OBLIGATOIRE (JSON) :
          {"trueText": "Ton paragraphe ici"}`
        },
        {
          role: "user",
          content: `Rédige un texte 100% vrai sur le thème : "${theme}".`
        },
      ],
      model: "llama-3.3-70b-versatile", 
      temperature: 0.2,
      response_format: { type: "json_object" },
    });

    const responseContent = completion.choices[0]?.message?.content;
    
    if (!responseContent) {
      throw new Error("L'Encyclopédiste n'a rien répondu.");
    }

    return NextResponse.json(JSON.parse(responseContent));

  } catch (error) {
    console.error("Erreur Encyclopédiste:", error);
    return NextResponse.json({ error: "Erreur de génération de vérité" }, { status: 500 });
  }
}