
import { GoogleGenAI, Type } from "@google/genai";
import { Match, SearchResponse } from "../types";

export const getDailyPredictions = async (date: string): Promise<{ data: SearchResponse, sources: any[] }> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const prompt = `Analise os jogos de futebol agendados para ${date}. 
  Encontre 13 jogos de alto nível das principais ligas globais (Premier League, La Liga, Serie A, Bundesliga, Ligue 1, Brasileirão, Champions League, etc.).
  
  Para cada jogo, você DEVE criar uma "CUSTOMBET" (estilo Bet Builder/Criar Aposta). 
  Uma CUSTOMBET é uma combinação de DOIS mercados para o mesmo jogo para aumentar o valor mantendo a segurança.
  
  Exemplos de combinações em português:
  - "Vitória da Casa" E "Mais de 1.5 Gols no Jogo"
  - "Handicap (2-0) para Casa" E "Mais de 0.5 Gols da Casa"
  - "Chance Dupla (1X)" E "Ambos Marcam - Não"
  - "Vitória do Visitante" E "Mais Escanteios para o Visitante"
  
  Para cada um dos 13 jogos, forneça em PORTUGUÊS:
  1. homeTeam: Nome do Time da Casa
  2. awayTeam: Nome do Time Visitante
  3. league: Nome da Liga
  4. market1: A primeira parte da combinação.
  5. market2: A segunda parte da combinação.
  6. confidence: Porcentagem de confiança (0-100) para o COMBO.
  7. reasoning: Uma breve justificativa tática em português explicando por que esta combinação específica é inteligente.
  
  Retorne os resultados como um objeto JSON estruturado.`;

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
                homeTeam: { type: Type.STRING },
                awayTeam: { type: Type.STRING },
                league: { type: Type.STRING },
                market1: { type: Type.STRING, description: "Primeiro mercado da aposta personalizada" },
                market2: { type: Type.STRING, description: "Segundo mercado da aposta personalizada" },
                confidence: { type: Type.NUMBER },
                reasoning: { type: Type.STRING },
              },
              required: ['homeTeam', 'awayTeam', 'league', 'market1', 'market2', 'confidence', 'reasoning']
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
    throw new Error("Falha ao processar a resposta da IA. Tente novamente.");
  }
};
