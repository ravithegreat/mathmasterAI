
import React from 'react';
import { MathQuestion, QuizState } from '../types';
import { generateMathQuestion } from '../geminiService';

interface QuizArenaProps {
  state: QuizState;
  onAnswer: (isCorrect: boolean, question: MathQuestion, answerIndex: number) => void;
  onReset: () => void;
}

export const QuizArena: React.FC<QuizArenaProps> = ({ state, onAnswer, onReset }) => {
  const [currentQuestion, setCurrentQuestion] = React.useState<MathQuestion | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [selectedOption, setSelectedOption] = React.useState<number | null>(null);
  const [showFeedback, setShowFeedback] = React.useState(false);

  const fetchQuestion = React.useCallback(async () => {
    if (!state.grade || !state.topic) return;
    setLoading(true);
    setError(null);
    setSelectedOption(null);
    setShowFeedback(false);
    try {
      const question = await generateMathQuestion(state.grade, state.topic, state.currentDifficulty);
      setCurrentQuestion(question);
    } catch (err) {
      console.error(err);
      setError("Failed to generate question. Please check your API connection or try again.");
    } finally {
      setLoading(false);
    }
  }, [state.grade, state.topic, state.currentDifficulty]);

  React.useEffect(() => {
    fetchQuestion();
  }, [fetchQuestion]);

  const handleSubmit = () => {
    if (selectedOption === null || !currentQuestion) return;
    setShowFeedback(true);
  };

  const handleNext = () => {
    if (selectedOption === null || !currentQuestion) return;
    const isCorrect = selectedOption === currentQuestion.correctAnswerIndex;
    onAnswer(isCorrect, currentQuestion, selectedOption);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-8 animate-pulse">
        <div className="w-24 h-24 bg-indigo-100 rounded-full flex items-center justify-center">
          <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
        <div className="text-center space-y-2">
          <h3 className="text-2xl font-bold text-slate-800">Generating adaptive question...</h3>
          <p className="text-slate-500">Gemini is adjusting the difficulty based on your level.</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-100 p-8 rounded-3xl text-center space-y-6 max-w-xl mx-auto">
        <div className="text-red-600 text-5xl">⚠️</div>
        <h3 className="text-xl font-bold text-red-800">{error}</h3>
        <button 
          onClick={fetchQuestion}
          className="bg-red-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-red-700 transition"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (!currentQuestion) return null;

  const isCorrect = selectedOption === currentQuestion.correctAnswerIndex;

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      {/* Header Stats */}
      <div className="flex items-center justify-between bg-white p-4 rounded-2xl shadow-sm border border-slate-200">
        <div className="flex items-center gap-4">
          <div className="bg-slate-100 px-4 py-2 rounded-xl">
            <span className="text-xs font-bold text-slate-500 uppercase block">Grade</span>
            <span className="font-bold text-slate-900">{state.grade}</span>
          </div>
          <div className="bg-slate-100 px-4 py-2 rounded-xl">
            <span className="text-xs font-bold text-slate-500 uppercase block">Level</span>
            <span className="font-bold text-slate-900">{state.currentDifficulty}/10</span>
          </div>
        </div>
        <div className="text-right">
          <span className="text-xs font-bold text-indigo-600 uppercase block">Score</span>
          <span className="text-2xl font-black text-indigo-700">{state.score}</span>
        </div>
      </div>

      {/* Difficulty Progress Bar */}
      <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
        <div 
          className="h-full bg-indigo-600 transition-all duration-500" 
          style={{ width: `${(state.currentDifficulty / 10) * 100}%` }}
        />
      </div>

      {/* Question Card */}
      <div className="bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden">
        <div className="p-8 md:p-10 space-y-8">
          <div className="space-y-4">
            <span className="px-3 py-1 bg-indigo-50 text-indigo-700 rounded-full text-xs font-bold uppercase tracking-widest">
              {state.topic}
            </span>
            <h3 className="text-2xl md:text-3xl font-bold text-slate-900 leading-tight">
              {currentQuestion.question}
            </h3>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {currentQuestion.options.map((option, idx) => (
              <button
                key={idx}
                disabled={showFeedback}
                onClick={() => setSelectedOption(idx)}
                className={`p-5 rounded-2xl text-left font-medium text-lg transition-all duration-200 border-2 relative group ${
                  showFeedback
                    ? idx === currentQuestion.correctAnswerIndex
                      ? 'bg-emerald-50 border-emerald-500 text-emerald-800'
                      : idx === selectedOption
                        ? 'bg-rose-50 border-rose-500 text-rose-800'
                        : 'bg-slate-50 border-slate-100 opacity-50'
                    : selectedOption === idx
                      ? 'bg-indigo-50 border-indigo-600 text-indigo-800 shadow-md'
                      : 'bg-white border-slate-100 hover:border-indigo-200 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-4">
                  <span className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                    selectedOption === idx ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-500'
                  }`}>
                    {String.fromCharCode(65 + idx)}
                  </span>
                  <span>{option}</span>
                </div>
                {showFeedback && idx === currentQuestion.correctAnswerIndex && (
                  <span className="absolute right-6 top-1/2 -translate-y-1/2 text-emerald-600 text-xl font-bold">✓</span>
                )}
                {showFeedback && idx === selectedOption && idx !== currentQuestion.correctAnswerIndex && (
                  <span className="absolute right-6 top-1/2 -translate-y-1/2 text-rose-600 text-xl font-bold">✕</span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Feedback Area */}
        {showFeedback && (
          <div className={`p-8 border-t transition-colors duration-500 ${isCorrect ? 'bg-emerald-50 border-emerald-100' : 'bg-rose-50 border-rose-100'}`}>
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
              <div className="space-y-2 flex-1">
                <h4 className={`text-xl font-bold ${isCorrect ? 'text-emerald-700' : 'text-rose-700'}`}>
                  {isCorrect ? 'Correct! Amazing job.' : 'Not quite. Keep learning!'}
                </h4>
                <p className="text-slate-600 leading-relaxed italic">
                  {currentQuestion.explanation}
                </p>
              </div>
              <button
                onClick={handleNext}
                className="w-full md:w-auto px-10 py-4 bg-slate-900 text-white rounded-2xl font-bold hover:bg-black transition-all shadow-lg hover:shadow-xl active:scale-95"
              >
                Continue
              </button>
            </div>
          </div>
        )}

        {/* Action Button */}
        {!showFeedback && (
          <div className="p-8 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
            <button 
              onClick={onReset}
              className="text-slate-400 font-bold hover:text-slate-600 transition"
            >
              Quit Quiz
            </button>
            <button
              disabled={selectedOption === null}
              onClick={handleSubmit}
              className={`px-12 py-4 rounded-2xl font-bold transition-all ${
                selectedOption !== null 
                  ? 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg' 
                  : 'bg-slate-200 text-slate-400 cursor-not-allowed'
              }`}
            >
              Check Answer
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
