export type Stage =
  | "loading"
  | "intro"
  | "tutorial"
  | "quizQuestion"
  | "quizAnswer"
  | "quizCorrect"
  | "quizIncorrect"
  | "resultScore"
  | "resultDetails"
  | "book";

export interface KarutaCard {
  id: number;
  name: string;
  year: string;
  description: string;
  omote: string;
  ura: string;
  yomi: string;
  yomiSp: string;
  link: string;
}

export interface QuizAnswer {
  question: KarutaCard;
  selected: KarutaCard;
  correct: boolean;
}

export type SoundMode = "on" | "off";
