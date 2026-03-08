import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { userChoice, aiError, aiCorrection, originalText } =
      await req.json();

    const response = await fetch(process.env.GROQ_API_KEY!, {
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
            - Sois indulgent sur l'orthographe (ex: "Samsoung" = "Samsung").
            - Si l'élève identifie l'erreur OU donne la bonne correction, c'est OUI.
            - Si l'élève est hors-sujet ou ne trouve pas l'élément faux, c'est NON.
            - Réponds uniquement par JSON : {"isCorrect": true/false, "explanation": "bref pourquoi"}`,
          },
          {
            role: "user",
            content: `
              CONTEXTE DE LA MISSION : 
              "${originalText}"

              ÉLÉMENTS DE RÉFÉRENCE :
              - L'erreur identifiée par le système : "${aiError}"
              - La correction attendue : "${aiCorrection}"
  
              RÉPONSE DE L'AGENT (ÉLÈVE) : 
              "${userChoice}"
  
              L'élève a-t-il correctement identifié l'erreur ou apporté la correction nécessaire par rapport au contexte ?`,
          },
        ],
        temperature: 0.1,
        format: "json",
        stream: false,
      }),
    });

    const dataIA = await response.json();
    const content = dataIA.choices[0].message.content;

    let finalResult = { isCorrect: false };
    try {
      finalResult = JSON.parse(content);
    } catch {
      finalResult.isCorrect =
        content.toUpperCase().includes("TRUE") ||
        content.toUpperCase().includes("OUI");
    }

    return NextResponse.json({
      isCorrect: finalResult.isCorrect,
    });
  } catch (error) {
    console.error("Erreur LiteLLM Verify:", error);
    return NextResponse.json({ isCorrect: false });
  }
}
