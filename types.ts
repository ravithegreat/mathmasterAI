
export interface MathQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswerIndex: number;
  explanation: string;
  difficulty: number;
}

export type GradeLevel = '1' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | 'High School' | 'College';

export type MathTopic = 'Arithmetic' | 'Algebra' | 'Geometry' | 'Number Systems' | 'Probability & Statistics' | 'Calculus' | 'Trigonometry';

export interface QuizState {
  grade: GradeLevel | null;
  topic: MathTopic | null;
  score: number;
  currentDifficulty: number;
  history: {
    question: MathQuestion;
    userAnswerIndex: number;
    isCorrect: boolean;
  }[];
}
