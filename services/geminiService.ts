import { GoogleGenAI, Type } from "@google/genai";
import { Job, JobPriority } from "../types";

// Helper to get client securely
const getAiClient = () => {
  if (!process.env.API_KEY) {
    throw new Error("API Key is missing");
  }
  return new GoogleGenAI({ apiKey: process.env.API_KEY });
};

export interface JobAnalysisResult {
  summary: string;
  suggestedPriority: JobPriority;
  toolList: string[];
  estimatedHours: number;
}

export const analyzeJobWithGemini = async (job: Job): Promise<JobAnalysisResult> => {
  const ai = getAiClient();
  
  const prompt = `
    You are an expert field service dispatcher. Analyze the following job description and provide structured data to help a human dispatcher.
    
    Job Title: ${job.title}
    Description: ${job.description}
    
    Return the response in JSON format conforming to the schema.
  `;

  try {
    // Fix: Updated model to 'gemini-3-flash-preview' per latest SDK guidelines for text tasks
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            summary: {
              type: Type.STRING,
              description: "A concise 1-sentence summary of the issue for the technician.",
            },
            suggestedPriority: {
              type: Type.STRING,
              enum: ["Low", "Medium", "High", "Critical"],
              description: "The recommended priority level based on urgency and business impact.",
            },
            toolList: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "A list of tools or parts likely needed for this job.",
            },
            estimatedHours: {
              type: Type.NUMBER,
              description: "Estimated time in hours to complete the job.",
            },
          },
          required: ["summary", "suggestedPriority", "toolList", "estimatedHours"],
        },
      },
    });

    const text = response.text;
    if (!text) throw new Error("No response from AI");
    
    return JSON.parse(text) as JobAnalysisResult;
  } catch (error) {
    console.error("Gemini Analysis Failed:", error);
    throw error;
  }
};
