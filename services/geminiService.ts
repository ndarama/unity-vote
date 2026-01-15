'use client';

import { GoogleGenAI } from "@google/genai";

// Helper function to safely get the API key
const getApiKey = (): string | undefined => {
  return process.env.GEMINI_API_KEY;
};

export const generateBio = async (name: string, category: string): Promise<string> => {
  const apiKey = getApiKey();
  if (!apiKey) {
    console.warn("Gemini API Key missing. Returning mock bio.");
    return `This is a generated bio for ${name}, an expert in ${category}. (API Key missing)`;
  }

  try {
    const genAI = new GoogleGenAI({ apiKey });
    const result = await genAI.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Write a professional, short (max 2 sentences) biography for a contestant named "${name}" participating in a contest category: "${category}". Keep it engaging.`,
    });
    return result?.text || "Bio generation failed.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return `Expert in ${category} with a passion for excellence.`;
  }
};
