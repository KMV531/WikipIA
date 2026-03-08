import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { userChoice, aiError, aiCorrection, originalText } =
      await req.json();

    if (!process.env.GROQ_API_URL) {
      return NextResponse.json({
        isCorrect: false,
        error: "API URL not configured",
      });
    }

    const response = await fetch(process.env.GROQ_API_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages: [
          {
            role: "system",
            content: `Tu es l'Arbitre Expert du jeu VerifAI. 
            Ta mission : Déterminer si un élève a débusqué l'erreur dans un rapport.
            
            CONSIGNES :
            - Sois indulgent sur l'orthographe.
            - Si l'élève identifie l'erreur OU donne la bonne correction, c'est OUI (true).
            - Réponds uniquement en JSON : {"isCorrect": true/false}`,
          },
          {
            role: "user",
            content: `
              RAPPORT : "${originalText}"
              ERREUR : "${aiError}"
              VÉRITÉ : "${aiCorrection}"
              RÉPONSE ÉLÈVE : "${userChoice}"
            `,
          },
        ],
        temperature: 0.1,
        response_format: { type: "json_object" },
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Groq API Error:", errorText);
      return NextResponse.json({ isCorrect: false, error: "API Error" });
    }

    const dataIA = await response.json();
    const content = JSON.parse(dataIA.choices[0].message.content);

    return NextResponse.json({
      isCorrect: content.isCorrect,
    });
  } catch (error) {
    console.error("Erreur technique Verify:", error);
    return NextResponse.json({ isCorrect: false });
  }
}
