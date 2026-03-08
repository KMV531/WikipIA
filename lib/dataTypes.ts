export interface Board {
  _id: string;
  name: string;
  label: string;
  theme: string;
  color: string;
  questionNumber: number;
  score: number;
  correctAnswers: number;
  wrongAnswers: number;
}

export interface Mission {
  text: string;
  error: string;
  correction: string;
  category: string;
}
