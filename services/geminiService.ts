import { GoogleGenAI } from "@google/genai";
import type { Transaction } from '../types';

// IMPORTANT: Replace "YOUR_GEMINI_API_KEY" with your actual Google Gemini API key to enable AI features.
// In a real production application, you should never expose your API key on the client-side.
// This should be handled by a secure backend server.
const API_KEY = "YOUR_GEMINI_API_KEY";

let ai: GoogleGenAI | null = null;
if (API_KEY && API_KEY !== "YOUR_GEMINI_API_KEY") {
  ai = new GoogleGenAI({ apiKey: API_KEY });
} else {
  console.warn("Gemini API key is not configured. Please replace 'YOUR_GEMINI_API_KEY' in services/geminiService.ts. AI features will be disabled.");
}

export const analyzeSpending = async (transactions: Transaction[]): Promise<string> => {
  if (!ai) {
    return "### AI Features Disabled\nYour Gemini API key has not been configured. Please add your key to `services/geminiService.ts` to enable AI-powered spending insights.";
  }

  const model = 'gemini-2.5-flash';

  const transactionSummary = transactions
    .map(t => `${t.date}: ${t.description} (${t.category}) - ${t.amount.toFixed(8)} BTC`)
    .join('\n');

  const prompt = `
    You are a friendly financial advisor for a smart wallet app called BitPrivacy.
    Analyze the following list of user transactions and provide a brief, insightful summary of their spending habits.
    
    The user's transactions are:
    ${transactionSummary}

    Your analysis should be:
    - Concise (2-3 paragraphs max).
    - Easy to understand for a non-expert.
    - Highlight the largest spending category (excluding income).
    - Offer one or two simple, actionable tips for improvement.
    - Be encouraging and positive in tone.
    - Format your response using markdown. Use headings and bullet points for clarity.
  `;

  try {
    const response = await ai.models.generateContent({
        model: model,
        contents: prompt
    });
    return response.text;
  } catch (error) {
    console.error("Error calling Gemini API:", error);
    if (error instanceof Error && error.message.includes('API key not valid')) {
        return "Sorry, I couldn't analyze your spending. The provided Gemini API key is not valid. Please check it in `services/geminiService.ts`.";
    }
    return "Sorry, I couldn't analyze your spending right now. There was an issue connecting to the AI service.";
  }
};