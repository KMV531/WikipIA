"use client";

import { useState, useEffect, useCallback } from "react";
import { useStore } from "@/Context/useStore";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Loader2, Timer, Trophy, ArrowRight, AlertCircle } from "lucide-react";
import { ToolTip } from "./ToolTip";
import { Mission } from "@/lib/dataTypes";

export default function QuestionsForm() {
  const {
    theme,
    name,
    score,
    addScore,
    addTime,
    questionNumber,
    nextQuestion,
    timeLeft,
    decrementTime,
  } = useStore();
  const router = useRouter();

  // --- ÉTATS POUR LA GESTION DE LA QUEUE ---
  const [missionQueue, setMissionQueue] = useState<Mission[]>([]); // Stocke les missions d'avance
  const [isFetchingBackground, setIsFetchingBackground] = useState(false);

  const [loading, setLoading] = useState(true);
  const [textIA, setTextIA] = useState("");
  const [userCorrection, setUserCorrection] = useState("");
  const [showFeedback, setShowFeedback] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [aiAnswer, setAiAnswer] = useState({
    error: "",
    correction: "",
    category: "",
  });

  // 1. FONCTION DE RÉCUPÉRATION (Gère le pack de 3)
  const fetchMissions = useCallback(async () => {
    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ theme }),
      });
      if (!response.ok) throw new Error("Erreur API");
      const data = await response.json();
      return data.missions; // Retourne le tableau [{}, {}, {}]
    } catch (error) {
      console.error(error);
      return [];
    }
  }, [theme]);

  // 2. LOGIQUE POUR PASSER À LA PROCHAINE MISSION
  const loadNextMission = useCallback(async () => {
    setLoading(true);
    setShowFeedback(false);
    setUserCorrection("");

    // Si on n'a rien en stock, on attend l'API (Premier chargement)
    let currentMissions = [...missionQueue];

    if (currentMissions.length === 0) {
      const newMissions = await fetchMissions();
      if (newMissions.length === 0) {
        toast.error("Échec de connexion satellite");
        setLoading(false);
        return;
      }
      currentMissions = newMissions;
    }

    // On prend la première mission
    const activeMission = currentMissions[0];
    const remainingMissions = currentMissions.slice(1);

    setTextIA(activeMission.text);
    setAiAnswer({
      error: activeMission.error,
      correction: activeMission.correction,
      category: activeMission.category,
    });

    setMissionQueue(remainingMissions);
    setLoading(false);

    // RECHARGE EN ARRIÈRE-PLAN : Si on a moins de 2 missions d'avance, on refill
    if (remainingMissions.length <= 1 && !isFetchingBackground) {
      setIsFetchingBackground(true);
      fetchMissions().then((newBatch) => {
        setMissionQueue((prev) => [...prev, ...newBatch]);
        setIsFetchingBackground(false);
      });
    }
  }, [missionQueue, fetchMissions, isFetchingBackground]);

  // Initialisation au montage
  useEffect(() => {
    if (!theme || !name) {
      router.push("/");
      return;
    }
    loadNextMission();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // On ne l'appelle qu'une fois, le reste est géré par nextQuestion

  // Synchronisation avec le store pour changer de question
  useEffect(() => {
    if (questionNumber > 1) {
      loadNextMission();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [questionNumber]);

  // --- LOGIQUE DU TIMER GLOBAL ---
  useEffect(() => {
    if (timeLeft <= 0 || showFeedback || loading) {
      if (timeLeft <= 0) router.push("/recap");
      return;
    }

    const timer = setInterval(() => {
      decrementTime();
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, decrementTime, router, showFeedback, loading]);

  // 3. VALIDATION
  const handleValidate = async () => {
    if (!userCorrection.trim() || timeLeft <= 0) return;
    setLoading(true);

    try {
      const response = await fetch("/api/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userChoice: userCorrection,
          aiError: aiAnswer.error,
          aiCorrection: aiAnswer.correction,
        }),
      });

      const data = await response.json();
      setShowFeedback(true);
      setIsCorrect(data.isCorrect);

      if (data.isCorrect) {
        addScore(150);
        addTime(10);
        toast.success("Correct ! +150 pts & +10s", {
          icon: <Trophy className="w-5 h-5 text-green-500" />,
          style: { background: "green", color: "#fff" },
        });
      } else {
        toast.error("Faux !", {
          icon: <AlertCircle className="w-5 h-5 text-red-500" />,
          style: { background: "red", color: "#fff" },
        });
      }
    } catch (error) {
      toast.error("Erreur d'analyse, AI a un souci, merci de verifier !");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex min-h-svh flex-col items-center justify-center p-4 md:p-8">
      <div className="w-full max-w-3xl space-y-6">
        {/* HEADER */}
        <div className="flex justify-between items-center p-4 rounded-2xl backdrop-blur-xl border border-white/10 shadow-2xl bg-white/5">
          <div className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-blue-400" />
            <p className="text-white font-bold">{score} pts</p>
          </div>

          <div
            className={`flex items-center gap-3 px-6 py-2 rounded-full border transition-colors ${timeLeft < 20 ? "border-red-500 bg-red-500/20 animate-pulse" : "border-white/20 bg-white/5"}`}
          >
            <Timer
              className={timeLeft < 20 ? "text-red-500" : "text-green-500"}
            />
            <span
              className={`text-2xl font-black font-mono ${timeLeft < 20 ? "text-red-500" : "text-green-500"}`}
            >
              {timeLeft}s
            </span>
          </div>

          <div className="text-right">
            <p className="text-white font-bold uppercase text-[10px] tracking-widest">
              Agent: {name}
            </p>
            <p className="text-white font-black">NIVEAU {questionNumber}</p>
          </div>
        </div>

        {/* CARTE TEXTE */}
        <Card className="bg-black/40 border-white/10 backdrop-blur-md shadow-2xl overflow-hidden min-h-100 flex items-center">
          <CardContent className="p-8 md:p-12 w-full">
            {loading && !showFeedback ? (
              <div className="flex flex-col items-center py-12 gap-4">
                <Loader2 className="w-12 h-12 text-blue-500 animate-spin" />
                <p className="text-blue-200 animate-pulse font-mono tracking-tighter">
                  DÉCRYPTAGE DU DOSSIER...
                </p>
              </div>
            ) : (
              <div className="space-y-8">
                <div className="relative">
                  <span className="text-blue-500 font-bold uppercase text-[10px] tracking-[0.3em] mb-4 block opacity-70">
                    Rapport de mission
                  </span>
                  <p className="text-lg md:text-xl font-mono leading-relaxed tracking-tight italic text-gray-100">
                    &quot;{textIA}&quot;
                  </p>
                </div>

                <ToolTip aiAnswer={aiAnswer} />

                {showFeedback && (
                  <div
                    className={`p-6 rounded-xl border-l-4 animate-in slide-in-from-bottom-4 duration-500 ${isCorrect ? "bg-green-500/10 border-green-500" : "bg-red-500/10 border-red-500"}`}
                  >
                    <h3
                      className={`font-black uppercase tracking-widest ${isCorrect ? "text-green-400" : "text-red-400"}`}
                    >
                      {isCorrect ? "Analyse Validée" : "Erreur de Jugement"}
                    </h3>
                    <p className="text-sm text-gray-300 mt-2 font-medium">
                      {aiAnswer.correction}
                    </p>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* INPUT / NEXT */}
        {!loading && (
          <div className="space-y-4">
            {!showFeedback ? (
              <div className="flex flex-col gap-4">
                <Textarea
                  placeholder="Écris ta correction ici pour prouver l'erreur..."
                  className="bg-white/5 border-white/10 text-white min-h-30 rounded-2xl focus:border-blue-500 transition-all text-lg"
                  value={userCorrection}
                  onChange={(e) => setUserCorrection(e.target.value)}
                />
                <Button
                  onClick={handleValidate}
                  disabled={!userCorrection.trim() || loading}
                  className="w-full cursor-pointer h-16 bg-blue-600 hover:bg-blue-500 text-white font-black rounded-2xl shadow-lg shadow-blue-900/20 transition-all uppercase tracking-widest"
                >
                  Scanner le rapport
                </Button>
              </div>
            ) : (
              <Button
                onClick={nextQuestion}
                className="w-full cursor-pointer h-16 bg-white hover:bg-gray-200 text-black font-black rounded-2xl shadow-xl transition-all uppercase tracking-widest flex items-center justify-center gap-3"
              >
                Mission Suivante <ArrowRight className="w-6 h-6" />
              </Button>
            )}
          </div>
        )}
      </div>
    </main>
  );
}
