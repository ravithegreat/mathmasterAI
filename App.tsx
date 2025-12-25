
import React from 'react';
import { Layout } from './components/Layout';
import { Setup } from './components/Setup';
import { QuizArena } from './components/QuizArena';
import { GradeLevel, MathTopic, QuizState, MathQuestion } from './types';

const INITIAL_STATE: QuizState = {
  grade: null,
  topic: null,
  score: 0,
  currentDifficulty: 1,
  history: []
};

const App: React.FC = () => {
  const [state, setState] = React.useState<QuizState>(INITIAL_STATE);
  const [isStarted, setIsStarted] = React.useState(false);

  const startQuiz = (grade: GradeLevel, topic: MathTopic) => {
    setState({
      ...INITIAL_STATE,
      grade,
      topic,
      currentDifficulty: 3 // Start slightly above 1 for realism
    });
    setIsStarted(true);
  };

  const handleAnswer = (isCorrect: boolean, question: MathQuestion, answerIndex: number) => {
    setState(prev => {
      // Logic for adaptive difficulty
      // Increase difficulty if correct, cap at 10.
      // Small decrease or stay if wrong, minimum 1.
      const newDifficulty = isCorrect 
        ? Math.min(prev.currentDifficulty + 1, 10)
        : Math.max(prev.currentDifficulty - 1, 1);

      return {
        ...prev,
        score: isCorrect ? prev.score + (prev.currentDifficulty * 10) : prev.score,
        currentDifficulty: newDifficulty,
        history: [...prev.history, { question, userAnswerIndex: answerIndex, isCorrect }]
      };
    });
  };

  const reset = () => {
    setState(INITIAL_STATE);
    setIsStarted(false);
  };

  return (
    <Layout>
      {!isStarted ? (
        <div className="space-y-12">
          <header className="text-center py-8 space-y-4">
            <h1 className="text-5xl md:text-7xl font-black text-slate-900 tracking-tight">
              Master Your <span className="text-indigo-600">Math</span>
            </h1>
            <p className="text-xl text-slate-500 max-w-2xl mx-auto">
              Dynamic AI-driven challenges that grow with you. Solve problems, level up, and become a Math Master.
            </p>
          </header>
          <Setup onStart={startQuiz} />
        </div>
      ) : (
        <QuizArena 
          state={state} 
          onAnswer={handleAnswer} 
          onReset={reset} 
        />
      )}
    </Layout>
  );
};

export default App;
