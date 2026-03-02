import { create } from "zustand";
import { persist } from "zustand/middleware";

interface GameState {
  name: string;
  theme: string;
  score: number;
  questionNumber: number;
  setName: (newName: string) => void;
  setTheme: (newTheme: string) => void;
  addScore: (points: number) => void;
  nextQuestion: () => void;
  resetGame: () => void;
}

export const useStore = create<GameState>()(
  persist(
    (set) => ({
      name: "",
      theme: "",
      score: 0,
      questionNumber: 1,

      setName: (newName) => set({ name: newName }),

      setTheme: (newTheme) => set({ theme: newTheme }),

      addScore: (points) => set((state) => ({ score: state.score + points })),

      nextQuestion: () =>
        set((state) => ({
          questionNumber: state.questionNumber + 1,
        })),

      resetGame: () =>
        set({ name: "", theme: "", score: 0, questionNumber: 1 }),
    }),
    {
      name: "quiz-storage",
    },
  ),
);
