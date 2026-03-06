import { NextResponse } from "next/server";
import Groq from "groq-sdk";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { action } = body; 

    if (!action || (action !== "sabotage" && action !== "judge")) {
      return NextResponse.json({ error: "Action invalide ou manquante. Utilisez 'sabotage' ou 'judge'." }, { status: 400 });
    }

    // ==========================================
    // MODE 1 : LE SABOTEUR (Création du piège)
    // ==========================================
    if (action === "sabotage") {
      const { trueText } = body;
      if (!trueText) return NextResponse.json({ error: "Texte vrai manquant" }, { status: 400 });

      const completion = await groq.chat.completions.create({
        messages: [
          {
            role: "system",
            content: `Tu es le Saboteur Pédagogue. Corromps un texte vrai pour en faire un quiz pour enfants.

            CONSIGNES :
            1. PIVOT UNIQUE : Identifie une info solide (Date, Lieu, Nom) et remplace-la par une erreur indiscutable.
            2. MOBILITÉ : Place l'erreur au début, milieu ou fin.
            3. CORRECTION SIMPLE : Rédige une phrase de correction bienveillante. Si c'est une date floue, parle de "période" pour éviter le pinaillage.
            
            FORMAT JSON OBLIGATOIRE :
            {
              "text": "Texte avec l'erreur",
              "error": "Le mot faux",
              "correction": "Phrase simple rétablissant la vérité",
              "category": "DATE ou LIEU ou NOM ou CHIFFRE"
            }`
          },
          { role: "user", content: `Injecte une erreur dans ce texte : "${trueText}"` },
        ],
        model: "llama-3-8b-8192", 
        temperature: 0.6,
        response_format: { type: "json_object" },
      });

      return NextResponse.json(JSON.parse(completion.choices[0]?.message?.content || "{}"));
    }

    // ==========================================
    // MODE 2 : L'ARBITRE (Jugement de la réponse)
    // ==========================================
    if (action === "judge") {
      const { userChoice, aiError, aiCorrection } = body;
      if (!userChoice || !aiError || !aiCorrection) {
        return NextResponse.json({ error: "Données manquantes pour l'arbitrage." }, { status: 400 });
      }

      const completion = await groq.chat.completions.create({
        messages: [
          {
            role: "system",
            content: `Tu es l'Arbitre Infaillible et COMPRÉHENSIF de "Wikipia". Évalue la réponse d'un élève.

            RÈGLES PÉNALES :
            1. PIVOT : L'élève doit avoir ciblé l'information exacte qui diffère entre le Mensonge et la Vérité.
            2. INDULGENCE : Ce sont des enfants. Tolère les fautes d'orthographe, les approximations (ex: dire "fin du 16e" au lieu de "1592") et les phrases mal tournées tant que l'idée de correction est bonne. AUCUN PINAILLAGE.
            3. HORS-SUJET : Un fait vrai mais qui ne corrige pas le mensonge précis est FAUX.

            FORMAT JSON OBLIGATOIRE :
            {
              "analysis": "Explication courte du jugement (30 mots max)",
              "isCorrect": true/false,
              "reason": "Verdict final (15 mots max)"
            }`
          },
          {
            role: "user",
            content: `JUGE CETTE TENTATIVE :
            - Mensonge : "${aiError}"
            - Vérité : "${aiCorrection}"
            - Tentative de l'élève : "${userChoice}"`
          },
        ],
        model: "openai/gpt-oss-120b",
        temperature: 0.1, // Rigueur mathématique pour le jugement
        response_format: { type: "json_object" },
      });

      const result = JSON.parse(completion.choices[0]?.message?.content || "{}");
      return NextResponse.json({
        isCorrect: !!result.isCorrect,
        explanation: result.reason || "Validation traitée."
      });
    }

  } catch (error) {
    console.error("Erreur Game Engine:", error);
    return NextResponse.json({ error: "Erreur critique du serveur." }, { status: 500 });
  }
}