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
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to generate question. Please check your connection.");
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
        <div className="relative">
          <div className="w-24 h-24 bg-indigo-50 rounded-full flex items-center justify-center">
            <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
          <div className="absolute -top-2 -right-2 bg-indigo-600 text-white text-[10px] font-bold px-2 py-1 rounded-full shadow-lg">
            PRO AI
          </div>
        </div>
        <div className="text-center space-y-2">
          <h3 className="text-2xl font-bold text-slate-800">Calculating your next challenge...</h3>
          <p className="text-slate-500 max-w-sm">Generating a Grade {state.grade} {state.topic} problem at level {state.currentDifficulty}/10.</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white border border-slate-200 p-10 rounded-3xl shadow-xl text-center space-y-6 max-w-xl mx-auto">
        <div className="w-20 h-20 bg-rose-50 text-rose-500 rounded-full flex items-center justify-center mx-auto text-4xl">
          ⚠️
        </div>
        <div className="space-y-2">
          <h3 className="text-xl font-bold text-slate-900">Oops! Something went wrong</h3>
          <p className="text-slate-500">{error}</p>
        </div>
        <div className="flex flex-col gap-3">
          <button 
            onClick={fetchQuestion}
            className="w-full bg-indigo-600 text-white px-8 py-4 rounded-2xl font-bold hover:bg-indigo-700 transition-all shadow-lg active:scale-95"
          >
            Try Again
          </button>
          <button 
            onClick={onReset}
            className="w-full bg-slate-100 text-slate-600 px-8 py-4 rounded-2xl font-bold hover:bg-slate-200 transition-all"
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  if (!currentQuestion) return null;

  const isCorrect = selectedOption === currentQuestion.correctAnswerIndex;

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      {/* Header Stats */}
      <div className="flex items-center justify-between bg-white p-5 rounded-3xl shadow-sm border border-slate-200">
        <div className="flex items-center gap-6">
          <div className="text-center">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Grade</span>
            <span className="font-extrabold text-slate-900 bg-slate-100 px-3 py-1 rounded-lg">{state.grade}</span>
          </div>
          <div className="text-center">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Difficulty</span>
            <span className="font-extrabold text-slate-900 bg-indigo-50 text-indigo-700 px-3 py-1 rounded-lg">{state.currentDifficulty}/10</span>
          </div>
        </div>
        <div className="text-right">
          <span className="text-[10px] font-bold text-indigo-500 uppercase tracking-widest block mb-1">Current Score</span>
          <span className="text-3xl font-black text-slate-900">{state.score}</span>
        </div>
      </div>

      {/* Difficulty Progress Bar */}
      <div className="space-y-2">
        <div className="flex justify-between items-center text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">
          <span>Mastery Level</span>
          <span>{state.currentDifficulty * 10}%</span>
        </div>
        <div className="w-full h-3 bg-slate-200 rounded-full overflow-hidden shadow-inner p-0.5">
          <div 
            className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-full transition-all duration-1000 ease-out" 
            style={{ width: `${(state.currentDifficulty / 10) * 100}%` }}
          />
        </div>
      </div>

      {/* Question Card */}
      <div className="bg-white rounded-[2.5rem] shadow-2xl shadow-indigo-100/50 border border-slate-100 overflow-hidden">
        <div className="p-8 md:p-12 space-y-10">
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <span className="px-4 py-1.5 bg-indigo-600 text-white rounded-full text-[10px] font-black uppercase tracking-[0.2em]">
                {state.topic}
              </span>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                Adaptive Problem #{state.history.length + 1}
              </span>
            </div>
            <h3 className="text-2xl md:text-4xl font-extrabold text-slate-900 leading-[1.15]">
              {currentQuestion.question}
            </h3>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {currentQuestion.options.map((option, idx) => (
              <button
                key={idx}
                disabled={showFeedback}
                onClick={() => setSelectedOption(idx)}
                className={`group p-6 rounded-3xl text-left font-semibold text-lg transition-all duration-300 border-2 relative ${
                  showFeedback
                    ? idx === currentQuestion.correctAnswerIndex
                      ? 'bg-emerald-50 border-emerald-500 text-emerald-900'
                      : idx === selectedOption
                        ? 'bg-rose-50 border-rose-500 text-rose-900'
                        : 'bg-white border-slate-100 opacity-40 grayscale'
                    : selectedOption === idx
                      ? 'bg-indigo-50 border-indigo-600 text-indigo-900 shadow-xl shadow-indigo-100 -translate-y-1'
                      : 'bg-white border-slate-100 hover:border-indigo-200 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-5">
                  <span className={`w-10 h-10 rounded-2xl flex items-center justify-center text-sm font-black transition-colors ${
                    selectedOption === idx ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-400 group-hover:bg-indigo-100 group-hover:text-indigo-600'
                  }`}>
                    {String.fromCharCode(65 + idx)}
                  </span>
                  <span className="flex-1">{option}</span>
                </div>
                {showFeedback && idx === currentQuestion.correctAnswerIndex && (
                  <div className="absolute right-6 top-1/2 -translate-y-1/2 w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center shadow-lg shadow-emerald-200">
                    <span className="text-white text-sm font-black">✓</span>
                  </div>
                )}
                {showFeedback && idx === selectedOption && idx !== currentQuestion.correctAnswerIndex && (
                  <div className="absolute right-6 top-1/2 -translate-y-1/2 w-8 h-8 bg-rose-500 rounded-full flex items-center justify-center shadow-lg shadow-rose-200">
                    <span className="text-white text-sm font-black">✕</span>
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Feedback Area */}
        {showFeedback && (
          <div className={`p-8 md:p-12 border-t transition-all duration-700 ${isCorrect ? 'bg-emerald-50 border-emerald-100' : 'bg-rose-50 border-rose-100'}`}>
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
              <div className="space-y-4 flex-1">
                <div className="flex items-center gap-2">
                   <div className={`w-8 h-8 rounded-full flex items-center justify-center ${isCorrect ? 'bg-emerald-500' : 'bg-rose-500'}`}>
                      <span className="text-white text-xs font-black">{isCorrect ? '✓' : '!'}</span>
                   </div>
                   <h4 className={`text-2xl font-black ${isCorrect ? 'text-emerald-800' : 'text-rose-800'}`}>
                    {isCorrect ? 'Brilliant Solution!' : 'Almost Got It!'}
                  </h4>
                </div>
                <div className="bg-white/60 backdrop-blur-sm p-6 rounded-3xl border border-white/80">
                  <p className="text-slate-700 leading-relaxed font-medium">
                    {currentQuestion.explanation}
                  </p>
                </div>
              </div>
              <button
                onClick={handleNext}
                className="w-full md:w-auto px-12 py-5 bg-slate-900 text-white rounded-2xl font-black text-lg hover:bg-black transition-all shadow-xl hover:shadow-2xl active:scale-95 group"
              >
                <span>Continue</span>
                <span className="ml-2 group-hover:ml-4 transition-all">→</span>
              </button>
            </div>
          </div>
        )}

        {/* Action Button */}
        {!showFeedback && (
          <div className="p-8 bg-slate-50 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
            <button 
              onClick={onReset}
              className="text-slate-400 font-bold hover:text-slate-600 transition tracking-tight"
            >
              Cancel Quiz session
            </button>
            <button
              disabled={selectedOption === null}
              onClick={handleSubmit}
              className={`w-full sm:w-auto px-16 py-5 rounded-2xl font-black text-lg transition-all duration-300 ${
                selectedOption !== null 
                  ? 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-xl shadow-indigo-100 active:scale-95' 
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