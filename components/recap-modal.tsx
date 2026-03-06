"use client";

import { useEffect } from "react";
import { useStore } from "@/Context/useStore";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import confetti from "canvas-confetti";
import { Trophy, RefreshCw, Home } from "lucide-react";

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
  const { name, score, questionNumber, theme, restartQuiz, resetGame } =
    useStore();
  const router = useRouter();

  const currentGrade =
    LEVELS.find((l) => score >= l.min) || LEVELS[LEVELS.length - 1];

  useEffect(() => {
    // --- 1. Tes Confettis ---
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

    const saveScore = async () => {
      try {
        await fetch("/api/leaderboard", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: name,
            score: score,
            theme: theme,
            questionNumber: questionNumber,
            label: currentGrade.label,
            color: currentGrade.color,
          }),
        });
      } catch (error) {
        console.error(error);
      }
    };

    if (name && score !== undefined) {
      saveScore();
    }
  }, []);

  const handleReplay = () => {
    restartQuiz();
    router.push("/theme");
  };

  const handleGoHome = () => {
    resetGame();
    router.push("/");
  };

  const handleLeaderBoard = () => {
    router.push("/leaderboard");
  };

  return (
    <main className="flex min-h-svh flex-col items-center justify-center p-6 text-center">
      <div className="z-10 space-y-8 p-12 rounded-3xl backdrop-blur-lg border border-white/10 shadow-2xl animate-in zoom-in-95 duration-500">
        <div className="flex justify-center">
          <div className="bg-yellow-500/20 p-6 rounded-full border-2 border-green-500/50">
            {currentGrade.min ? (
              <Trophy className="w-12 h-12 text-green-400" />
            ) : (
              <Trophy className="w-12 h-12 text-yellow-500" />
            )}
          </div>
        </div>

        <div className="space-y-4">
          <h1
            className={`text-4xl font-black italic uppercase tracking-tighter ${currentGrade.color}`}
          >
            {currentGrade.label}
          </h1>

          <p className="text-blue-100 text-lg max-w-md mx-auto">
            <span className="font-bold text-white">{name}</span>,{" "}
            {currentGrade.msg}
          </p>
        </div>

        <div className="bg-white/5 rounded-2xl p-8 border border-white/5 flex flex-col items-start justify-between">
          <div className="flex items-center justify-between gap-8">
            <p className="text-gray-400 uppercase text-xs tracking-[0.3em]">
              Score Final :
            </p>
            <p className="text-xl font-black text-white font-mono">{score}</p>
          </div>
          <div className="flex items-center justify-between gap-8">
            <p className="text-gray-400 uppercase text-xs tracking-[0.3em]">
              No de Questions :
            </p>
            <p className="text-xl font-black text-white font-mono">
              {questionNumber}
            </p>
          </div>
        </div>

        <div className="flex flex-col items-center justify-center gap-4">
          <div className="flex flex-row items-center justify-between gap-28">
            <Button
              onClick={handleReplay}
              className="cursor-pointer h-14 px-8 bg-blue-600 hover:bg-blue-500 text-lg font-bold rounded-xl flex items-center gap-2"
            >
              <RefreshCw className="w-5 h-5" /> Rejouer
            </Button>
            <Button
              onClick={handleGoHome}
              variant="outline"
              className="cursor-pointer h-14 px-8 border-white/20 text-white hover:bg-white/10 text-lg font-bold rounded-xl flex items-center gap-2"
            >
              <Home className="w-5 h-5" /> Accueil
            </Button>
          </div>
          <div>
            <Button
              onClick={handleLeaderBoard}
              variant="outline"
              className="cursor-pointer h-14 px-8 border-white/20 text-white hover:bg-white/10 text-lg font-bold rounded-xl flex items-center gap-2 mt-4"
            >
              <Trophy className="w-5 h-5" /> Voir mon Classement
            </Button>
          </div>
        </div>
      </div>
    </main>
  );
}
