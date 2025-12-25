
import React from 'react';
import { GradeLevel, MathTopic } from '../types';

interface SetupProps {
  onStart: (grade: GradeLevel, topic: MathTopic) => void;
}

const GRADES: GradeLevel[] = ['1', '2', '3', '4', '5', '6', '7', '8', 'High School', 'College'];
const TOPICS: MathTopic[] = [
  'Arithmetic', 'Algebra', 'Geometry', 'Number Systems', 
  'Probability & Statistics', 'Trigonometry', 'Calculus'
];

export const Setup: React.FC<SetupProps> = ({ onStart }) => {
  const [selectedGrade, setSelectedGrade] = React.useState<GradeLevel | null>(null);
  const [selectedTopic, setSelectedTopic] = React.useState<MathTopic | null>(null);

  const handleStart = () => {
    if (selectedGrade && selectedTopic) {
      onStart(selectedGrade, selectedTopic);
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-8 md:p-12 space-y-12">
        <div className="text-center space-y-4">
          <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900">Configure Your Challenge</h2>
          <p className="text-slate-500 text-lg">Pick your grade level and a topic to start your personalized math journey.</p>
        </div>

        <section className="space-y-6">
          <h3 className="text-sm font-bold text-indigo-600 uppercase tracking-wider">Step 1: Select Grade Level</h3>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            {GRADES.map((grade) => (
              <button
                key={grade}
                onClick={() => setSelectedGrade(grade)}
                className={`p-4 rounded-2xl border-2 transition-all duration-200 font-bold text-center ${
                  selectedGrade === grade
                    ? 'border-indigo-600 bg-indigo-50 text-indigo-700 shadow-md transform scale-105'
                    : 'border-slate-100 hover:border-indigo-300 text-slate-600 bg-slate-50'
                }`}
              >
                {grade}
              </button>
            ))}
          </div>
        </section>

        <section className="space-y-6">
          <h3 className="text-sm font-bold text-indigo-600 uppercase tracking-wider">Step 2: Choose Topic</h3>
          <div className="flex flex-wrap gap-3">
            {TOPICS.map((topic) => (
              <button
                key={topic}
                onClick={() => setSelectedTopic(topic)}
                className={`px-6 py-3 rounded-full border-2 transition-all duration-200 font-semibold ${
                  selectedTopic === topic
                    ? 'border-purple-600 bg-purple-50 text-purple-700 shadow-md transform scale-105'
                    : 'border-slate-100 hover:border-purple-300 text-slate-600 bg-slate-50'
                }`}
              >
                {topic}
              </button>
            ))}
          </div>
        </section>

        <div className="pt-8">
          <button
            onClick={handleStart}
            disabled={!selectedGrade || !selectedTopic}
            className={`w-full py-5 rounded-2xl text-xl font-bold transition-all duration-300 shadow-xl ${
              selectedGrade && selectedTopic
                ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:opacity-90 hover:shadow-2xl active:scale-95'
                : 'bg-slate-200 text-slate-400 cursor-not-allowed'
            }`}
          >
            Start Quiz
          </button>
        </div>
      </div>
    </div>
  );
};
