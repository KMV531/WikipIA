import { create } from "zustand";
import { persist } from "zustand/middleware";

interface GameState {
  name: string;
  theme: string;
  score: number;
  questionNumber: number;
  correctAnswers: number;
  wrongAnswers: number;
  setName: (newName: string) => void;
  setTheme: (newTheme: string) => void;
  addScore: (points: number) => void;
  nextQuestion: () => void;
  incrementCorrect: () => void;
  incrementWrong: () => void;
  timeLeft: number;
  setTimeLeft: (time: number) => void;
  decrementTime: () => void;
  addTime: (seconds: number) => void;
  restartQuiz: () => void;
  resetGame: () => void;
}

export const useStore = create<GameState>()(
  persist(
    (set) => ({
      name: "",
      theme: "",
      score: 0,
      questionNumber: 1,
      correctAnswers: 0,
      wrongAnswers: 0,
      timeLeft: 120,

      setName: (newName) => set({ name: newName }),
      setTheme: (newTheme) => set({ theme: newTheme }),
      setTimeLeft: (time) => set({ timeLeft: time }),

      addScore: (points) => set((state) => ({ score: state.score + points })),

      nextQuestion: () =>
        set((state) => ({ questionNumber: state.questionNumber + 1 })),

      incrementCorrect: () =>
        set((state) => ({ correctAnswers: state.correctAnswers + 1 })),
      incrementWrong: () =>
        set((state) => ({ wrongAnswers: state.wrongAnswers + 1 })),

      decrementTime: () =>
        set((state) => ({ timeLeft: Math.max(0, state.timeLeft - 1) })),
      addTime: (seconds) =>
        set((state) => ({ timeLeft: state.timeLeft + seconds })),

      restartQuiz: () =>
        set({
          score: 0,
          questionNumber: 1,
          correctAnswers: 0,
          wrongAnswers: 0,
          timeLeft: 120,
        }),

      resetGame: () =>
        set({
          name: "",
          theme: "",
          score: 0,
          questionNumber: 1,
          correctAnswers: 0,
          wrongAnswers: 0,
          timeLeft: 120,
        }),
    }),
    { name: "quiz-storage" },
  ),
);
