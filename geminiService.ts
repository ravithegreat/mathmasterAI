import { GoogleGenAI, Type } from "@google/genai";
import { GradeLevel, MathTopic, MathQuestion } from "./types";

export const generateMathQuestion = async (
  grade: GradeLevel,
  topic: MathTopic,
  difficulty: number
): Promise<MathQuestion> => {
  // Always initialize inside the service or right before use to ensure the most current API key
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  // Use Pro model for complex math reasoning
  const model = "gemini-3-pro-preview";
  
  const prompt = `Generate a unique multiple-choice math question for Grade ${grade} students on the topic of ${topic}. 
  The difficulty level is ${difficulty}/10 (1 is basic foundations, 10 is extremely advanced competitive math). 
  Make sure the question is challenging yet appropriate for the grade level. 
  The response must be in strict JSON format.`;

  const response = await ai.models.generateContent({
    model,
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          question: { type: Type.STRING, description: "The math question text" },
          options: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: "Exactly four multiple choice options"
          },
          correctAnswerIndex: {
            type: Type.INTEGER,
            description: "The 0-based index of the correct answer"
          },
          explanation: {
            type: Type.STRING,
            description: "A clear, encouraging step-by-step explanation"
          }
        },
        required: ["question", "options", "correctAnswerIndex", "explanation"]
      }
    }
  });

  const text = response.text;
  if (!text) throw new Error("Empty response from AI");
  
  const data = JSON.parse(text);
  
  return {
    ...data,
    id: Math.random().toString(36).substring(7),
    difficulty
  };
};