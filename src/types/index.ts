export interface Answer {
  id: number;
  value: "A" | "B" | "C" | "D";
}

export interface TestData {
  id: string;
  title: string;
  description?: string;
  answers: Answer[];
  timeLimitMinutes?: number;
  dataFile?: string; // public URL like /tests/xxx.json
  createdAt: string;
  updatedAt: string;
}

export interface UserAnswer {
  id: number;
  value: "A" | "B" | "C" | "D";
}

export interface TestStats {
  correct: number;
  incorrect: number;
  answered: number;
  score: number;
}

// Multi-part structures
export type Choice = "A" | "B" | "C" | "D";

export interface Part5Question {
  part: 5;
  id: number;
  question: string;
  options: Record<Choice, string>;
  answer: Choice;
  explanation?: any;
}

export interface Part6Question {
  id: number;
  question: string;
  options: Record<Choice, string>;
  answer: Choice;
  explanation?: any;
}

export interface Part6Passage {
  part: 6;
  passage_id: number;
  title?: string;
  context: string; // passage text with blanks markers like (131)
  questions: Part6Question[];
}

export interface Part7Question {
  id: number;
  question: string;
  options: Record<Choice, string>;
  answer: Choice;
  explanation?: any;
}

export interface Part7Passage {
  part: 7;
  passage_id: number;
  title?: string;
  context: string;
  questions: Part7Question[];
}

export type CombinedItem = Part5Question | Part6Passage | Part7Passage;
