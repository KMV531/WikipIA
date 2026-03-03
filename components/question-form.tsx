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

  // 1. FETCH QUESTION (SANS reset du timer)
  const fetchQuestion = useCallback(async () => {
    setLoading(true);
    setShowFeedback(false);
    setUserCorrection("");

    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ theme }),
      });
      if (!response.ok) throw new Error("Erreur API");
      const data = await response.json();
      setTextIA(data.text);
      setAiAnswer({
        error: data.error,
        correction: data.correction,
        category: data.category,
      });
      setLoading(false);
    } catch (error) {
      toast.error("Erreur de génération", {
        icon: <AlertCircle className="w-5 h-5 text-red-500" />,
        style: { background: "red", color: "#fff" },
      });
      setLoading(false);
    }
  }, [theme]);

  useEffect(() => {
    if (!theme || !name) {
      router.push("/");
      return;
    }
    fetchQuestion();
  }, [questionNumber, fetchQuestion]);

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
      toast.error("Erreur d'analyse", {
        icon: <AlertCircle className="w-5 h-5 text-red-500" />,
        style: { background: "red", color: "#fff" },
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex min-h-svh flex-col items-center justify-center p-4 md:p-8">
      <div className="w-full max-w-3xl space-y-6">
        {/* HEADER avec le temps Global */}
        <div className="flex justify-between items-center p-4 rounded-2xl backdrop-blur-xl border border-white/10 shadow-2xl">
          <div className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-blue-400" />
            <p className="text-white font-bold">{score}</p>
          </div>

          <div
            className={`flex items-center gap-3 px-6 py-2 rounded-full border transition-colors ${
              timeLeft < 20
                ? "border-red-500 bg-red-500/20 animate-pulse"
                : "border-white/20 bg-white/5"
            }`}
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
            <p className="text-white font-bold"># {questionNumber}</p>
          </div>
        </div>

        {/* CARTE TEXTE */}
        <Card className="bg-black/40 border-white/10 backdrop-blur-md shadow-2xl overflow-hidden">
          <CardContent className="p-8 md:p-12">
            {loading && !showFeedback ? (
              <div className="flex flex-col items-center py-12 gap-4">
                <Loader2 className="w-12 h-12 text-blue-500 animate-spin" />
                <p className="text-blue-200 animate-pulse">
                  Nouvelle analyse en cours...
                </p>
              </div>
            ) : (
              <div className="space-y-8">
                <div>
                  <span className="text-blue-500 font-bold uppercase text-xs tracking-[0.2em] mb-4 block">
                    Rapport d&apos;analyse
                  </span>
                  <p className="text-xl md:text-2xl text-gray-100 leading-relaxed font-serif italic">
                    &quot;{textIA}&quot;
                  </p>
                </div>
                <p className="text-lg font-semibold">
                  <ToolTip aiAnswer={aiAnswer} />
                </p>

                {showFeedback && (
                  <div
                    className={`p-6 rounded-xl border-l-4 animate-in zoom-in-95 ${isCorrect ? "bg-green-500/10 border-green-500" : "bg-red-500/10 border-red-500"}`}
                  >
                    <h3
                      className={`font-bold ${isCorrect ? "text-green-400" : "text-red-400"}`}
                    >
                      {isCorrect ? "VRAI !" : "FAUX !"}
                    </h3>
                    <p className="text-sm text-gray-300 mt-2">
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
              <>
                <Textarea
                  placeholder="Trouve l'erreur..."
                  className="bg-white/5 border-white/10 text-white min-h-30 rounded-2xl"
                  value={userCorrection}
                  onChange={(e) => setUserCorrection(e.target.value)}
                />
                <Button
                  onClick={handleValidate}
                  disabled={!userCorrection.trim()}
                  className="w-full cursor-pointer h-14 bg-blue-600 font-bold rounded-2xl"
                >
                  Vérifier
                </Button>
              </>
            ) : (
              <Button
                onClick={nextQuestion}
                className="w-full cursor-pointer h-14 bg-white text-black font-bold rounded-2xl"
              >
                Question suivante <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            )}
          </div>
        )}
      </div>
    </main>
  );
}
