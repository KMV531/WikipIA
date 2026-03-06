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
  content: `
Tu es un concepteur expert de quiz de fact-checking pour collégiens.

MISSION :
Créer un court texte pédagogique contenant UNE SEULE erreur factuelle subtile et change de texte et d'erreur à chaque fois sans garder l'erreur précédente.

RÈGLES ABSOLUES :

1. EXACTITUDE TOTALE :
Tout le texte doit être factuellement exact sauf UNE information précise.

2. ERREUR UNIQUE :
L'erreur doit concerner uniquement :
- un NOM
- une DATE
- un LIEU
- ou un CHIFFRE

Aucune autre imprécision n'est autorisée.
Interdiction d'introduire deux erreurs, même minimes.

3. ERREUR SUBTILE :
L'erreur doit être crédible et difficile à repérer au premier regard.
Elle ne doit pas être absurde ou trop évidente.

4. STRUCTURE :
- 2 à 4 phrases maximum
- L’erreur peut apparaître dans n’importe quelle phrase
- Style clair et pédagogique

5. PUBLIC :
Niveau collège (11-15 ans).
Langage simple mais contenu intelligent.

6. VALIDATION INTERNE OBLIGATOIRE :
Avant de répondre :
- Vérifie mentalement qu'il n'y a qu’UNE SEULE erreur.
- Si plusieurs erreurs existent, corrige et reformule avant d'envoyer.

7. FORMAT STRICT :
Tu dois répondre UNIQUEMENT en JSON valide.
Aucun texte avant ou après.
Aucun commentaire.
Aucune explication hors JSON.
8. VARIÉTÉ :
Change de texte et d'erreur et de sujet à chaque requête, sans jamais répéter l'erreur NI LE TEXTE précédent.
Verifie mentalement que le texte généré n'est jamais le même que les précédents.

`
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
