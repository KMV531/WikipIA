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
          content: `Tu es un Agent de Liaison du QG. Thème : ${theme}. 
            Génère un pack de 3 rapports d'enquête pour collégiens (11-14 ans).

            STRUCTURE DE CHAQUE RAPPORT :
            - Longueur cible : Entre 250 et 350 caractères (environ 3-4 phrases).
            - Le texte doit commencer par une info VRAIE et intéressante pour accrocher le lecteur.
            - L'ERREUR doit être glissée naturellement au milieu ou à la fin, sans être évidente.
            - Style : Professionnel, mystérieux, type "Rapport de Terrain".

            INTERDICTIONS (Sujets bannis pour éviter les boucles) :
            - Samsung : Poissons séchés, nouilles, Tokyo, date 1938.
            - Minecraft : Markus Persson (Notch), 2.5 milliards, Microsoft/Mojang classique.
            - iPhone : Steve Jobs dans un garage, 2007, 1987.

            CONSIGNE DE VARIÉTÉ : 
            Ne reste pas en surface ! Parle de : ${theme} sous l'angle des brevets secrets, des matériaux insolites, des records mondiaux oubliés, ou des collaborations avec d'autres marques.`,
        },
        {
          role: "user",
          content: `Génère une nouvelle mission sur le thème : "${theme}".
              Réponds UNIQUEMENT au format JSON :
              {
                "missions": [
                  {
                    "text": "Le rapport complet avec l'erreur intégrée",
                    "error": "Le mot ou groupe de mots faux",
                    "correction": "La vérité",
                    "category": "NOM | DATE | LIEU | CHIFFRE | MATÉRIAU",
                  }
                ]
              }`,
        },
      ],
      model: "llama-3.3-70b-versatile",
      temperature: 1.0,
      response_format: { type: "json_object" },
    });

    const responseContent = completion.choices[0]?.message?.content;
    if (!responseContent) throw new Error("Réponse vide");

    return NextResponse.json(JSON.parse(responseContent));
  } catch (error) {
    console.error("Erreur Groq:", error);
    return NextResponse.json({ error: "Échec de la mission" }, { status: 500 });
  }
}