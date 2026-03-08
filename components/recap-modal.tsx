"use client";

import { useEffect, useRef } from "react";
import { useStore } from "@/Context/useStore";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import confetti from "canvas-confetti";
import {
  Trophy,
  RefreshCw,
  Home,
  CheckCircle2,
  XCircle,
  Target,
} from "lucide-react";

const LEVELS = [
  {
    min: 500,
    label: "Légende du Bureau",
    color: "text-yellow-400",
    msg: "Performance historique. Tes capacités d'analyse dépassent l'entendement. Le dossier est clos, avec les honneurs.",
  },
  {
    min: 300,
    label: "Agent d'Élite",
    color: "text-blue-400",
    msg: "Impressionnant. Tu as débusqué les anomalies avec une précision chirurgicale. Une promotion est en vue.",
  },
  {
    min: 150,
    label: "Inspecteur de Terrain",
    color: "text-emerald-400",
    msg: "Bon travail de terrain. Les preuves ont parlé et tu as su les écouter. Continue d'aiguiser ton flair.",
  },
  {
    min: 0,
    label: "Recrue",
    color: "text-slate-400",
    msg: "L'enquête est complexe, mais le métier rentre. Analyse tes erreurs et retourne sur le terrain pour progresser.",
  },
];

export default function RecapModal() {
  const {
    name,
    score,
    questionNumber,
    theme,
    correctAnswers,
    wrongAnswers,
    restartQuiz,
    resetGame,
  } = useStore();

  const router = useRouter();
  const hasSaved = useRef(false); // Pour éviter le double envoi en StrictMode

  const currentGrade =
    LEVELS.find((l) => score >= l.min) || LEVELS[LEVELS.length - 1];

  // Calcul de la précision
  const totalAttempted = correctAnswers + wrongAnswers;
  const accuracy =
    totalAttempted > 0
      ? Math.round((correctAnswers / totalAttempted) * 100)
      : 0;

  useEffect(() => {
    // --- 1. Confettis ---
    const duration = 3 * 1000;
    const end = Date.now() + duration;
    const frame = () => {
      confetti({
        particleCount: 3,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: ["#3b82f6", "#ffffff", "#facc15"],
      });
      confetti({
        particleCount: 3,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: ["#3b82f6", "#ffffff", "#facc15"],
      });
      if (Date.now() < end) requestAnimationFrame(frame);
    };
    frame();

    // --- 2. Sauvegarde du Score ---
    const saveScore = async () => {
      if (hasSaved.current) return;
      hasSaved.current = true;

      try {
        await fetch("/api/leaderboard", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name,
            score,
            theme,
            correctAnswers,
            wrongAnswers,
            questionNumber, // On garde pour la structure globale
            label: currentGrade.label,
            color: currentGrade.color,
          }),
        });
      } catch (error) {
        console.error("Erreur archivage score:", error);
      }
    };

    if (name && score !== undefined) {
      saveScore();
    }
  }, [
    name,
    score,
    theme,
    correctAnswers,
    wrongAnswers,
    questionNumber,
    currentGrade.label,
    currentGrade.color,
  ]);

  return (
    <main className="flex min-h-svh flex-col items-center justify-center p-6 text-center bg-radial-at-t from-blue-900/20 to-black">
      <div className="z-10 w-full max-w-2xl space-y-8 p-8 md:p-12 rounded-3xl backdrop-blur-xl border border-white/10 shadow-2xl animate-in zoom-in-95 duration-500">
        {/* ICON & GRADE */}
        <div className="space-y-4">
          <div className="flex justify-center">
            <div className="bg-white/5 p-6 rounded-full border border-white/10 shadow-inner">
              <Trophy
                className={`w-16 h-16 ${score >= 300 ? "text-yellow-400" : "text-blue-400"}`}
              />
            </div>
          </div>
          <h1
            className={`text-4xl md:text-5xl font-black italic uppercase tracking-tighter ${currentGrade.color}`}
          >
            {currentGrade.label}
          </h1>
          <p className="text-blue-100 text-lg max-w-md mx-auto opacity-80">
            <span className="font-bold text-white uppercase">{name}</span>,{" "}
            {currentGrade.msg}
          </p>
        </div>

        {/* DETAILED STATS BOX */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white/5 rounded-2xl p-6 border border-white/5 hover:border-blue-500/30 transition-colors">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Target className="w-4 h-4 text-blue-400" />
              <p className="text-gray-400 uppercase text-[10px] tracking-widest font-bold">
                Score Global
              </p>
            </div>
            <p className="text-3xl font-black text-white font-mono">{score}</p>
          </div>

          <div className="bg-white/5 rounded-2xl p-6 border border-white/5 hover:border-green-500/30 transition-colors">
            <div className="flex items-center justify-center gap-2 mb-2">
              <CheckCircle2 className="w-4 h-4 text-green-500" />
              <p className="text-gray-400 uppercase text-[10px] tracking-widest font-bold">
                Succès
              </p>
            </div>
            <p className="text-3xl font-black text-green-500 font-mono">
              {correctAnswers}
            </p>
          </div>

          <div className="bg-white/5 rounded-2xl p-6 border border-white/5 hover:border-red-500/30 transition-colors">
            <div className="flex items-center justify-center gap-2 mb-2">
              <XCircle className="w-4 h-4 text-red-500" />
              <p className="text-gray-400 uppercase text-[10px] tracking-widest font-bold">
                Échecs
              </p>
            </div>
            <p className="text-3xl font-black text-red-500 font-mono">
              {wrongAnswers}
            </p>
          </div>
        </div>

        {/* ACCURACY BAR */}
        <div className="space-y-2">
          <div className="flex justify-between text-[10px] uppercase font-bold tracking-widest text-gray-500">
            <span>Précision de l'analyse</span>
            <span className="text-blue-400">{accuracy}%</span>
          </div>
          <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden border border-white/5">
            <div
              className="h-full bg-blue-500 transition-all duration-1000 ease-out"
              style={{ width: `${accuracy}%` }}
            />
          </div>
        </div>

        {/* ACTIONS */}
        <div className="flex flex-col gap-3">
          <div className="grid grid-cols-2 gap-3">
            <Button
              onClick={() => {
                restartQuiz();
                router.push("/theme");
              }}
              className="h-14 bg-blue-600 hover:bg-blue-500 hover:cursor-pointer text-white font-bold rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-blue-900/20 transition-all active:scale-95"
            >
              <RefreshCw className="w-5 h-5" /> Rejouer
            </Button>
            <Button
              onClick={() => {
                resetGame();
                router.push("/");
              }}
              variant="outline"
              className="h-14 border-white/10 text-white hover:cursor-pointer hover:bg-white/5 font-bold rounded-xl flex items-center justify-center gap-2 transition-all active:scale-95"
            >
              <Home className="w-5 h-5" /> Accueil
            </Button>
          </div>
          <Button
            onClick={() => router.push("/leaderboard")}
            className="h-14 bg-white hover:bg-gray-200 hover:cursor-pointer text-black font-black uppercase tracking-widest rounded-xl transition-all active:scale-95"
          >
            Consulter le Leaderboard
          </Button>
        </div>
      </div>
    </main>
  );
}
