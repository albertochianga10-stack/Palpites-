
import { GoogleGenAI, Type } from "@google/genai";
import { Match, SearchResponse } from "../types";

export const getDailyPredictions = async (date: string): Promise<{ data: SearchResponse, sources: any[] }> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const prompt = `Analyze football matches scheduled for ${date}. 
  Find 13 high-profile matches from major leagues (Premier League, La Liga, Serie A, Bundesliga, Ligue 1, Brasileirão, Champions League, etc.).
  For each match, provide:
  1. Home Team
  2. Away Team
  3. League
  4. Predicted Result (1 for Home Win, X for Draw, 2 for Away Win)
  5. Confidence percentage (0-100)
  6. A brief tactical reasoning based on current form, injuries, and stats found in real-time.
  
  Return the results as a structured JSON object.`;

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: prompt,
    config: {
      tools: [{ googleSearch: {} }],
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          matches: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                id: { type: Type.STRING },
                homeTeam: { type: Type.STRING },
                awayTeam: { type: Type.STRING },
                league: { type: Type.STRING },
                startTime: { type: Type.STRING },
                prediction: { type: Type.STRING, enum: ['1', 'X', '2'] },
                confidence: { type: Type.NUMBER },
                reasoning: { type: Type.STRING },
              },
              required: ['homeTeam', 'awayTeam', 'league', 'prediction', 'confidence', 'reasoning']
            }
          },
          summary: { type: Type.STRING }
        }
      }
    },
  });

  const text = response.text;
  const sources = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
  
  try {
    const data = JSON.parse(text) as SearchResponse;
    return { data, sources };
  } catch (e) {
    throw new Error("Failed to parse AI response. Try again.");
  }
};
