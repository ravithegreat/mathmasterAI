
import { GoogleGenAI, Type } from "@google/genai";
import { GradeLevel, MathTopic, MathQuestion } from "./types";

export const generateMathQuestion = async (
  grade: GradeLevel,
  topic: MathTopic,
  difficulty: number
): Promise<MathQuestion> => {
  const apiKey = process.env.API_KEY;
  
  if (!apiKey) {
    throw new Error("API_KEY is missing. Please set it in your environment variables (e.g., in Vercel settings).");
  }

  const ai = new GoogleGenAI({ apiKey });
  const model = "gemini-3-flash-preview";
  
  const prompt = `Generate a unique multiple-choice math question for Grade ${grade} students on the topic of ${topic}. 
  The difficulty level is ${difficulty}/10 (1 is basic, 10 is extremely advanced/olympiad level). 
  Make sure the question is challenging yet appropriate for the grade level. 
  The response must be in JSON format.`;

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
            description: "Four multiple choice options"
          },
          correctAnswerIndex: {
            type: Type.INTEGER,
            description: "The 0-based index of the correct answer in the options array"
          },
          explanation: {
            type: Type.STRING,
            description: "A short, encouraging explanation of how to solve the problem"
          }
        },
        required: ["question", "options", "correctAnswerIndex", "explanation"]
      }
    }
  });

  const rawJson = response.text || "{}";
  const data = JSON.parse(rawJson);
  
  return {
    ...data,
    id: Math.random().toString(36).substring(7),
    difficulty
  };
};
