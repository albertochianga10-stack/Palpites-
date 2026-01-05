
import { GoogleGenAI, Type } from "@google/genai";
import { Match, SearchResponse } from "../types";

export const getDailyPredictions = async (date: string): Promise<{ data: SearchResponse, sources: any[] }> => {
  if (!process.env.API_KEY) {
    throw new Error("API_KEY não configurada no ambiente.");
  }

  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  // Usamos o modelo Pro para tarefas que exigem busca e raciocínio complexo de 13 itens
  const modelName = 'gemini-3-pro-preview';

  const prompt = `Você é um analista estatístico de futebol profissional. 
  Data de análise: ${date}.
  
  Tarefa: Identifique 13 partidas reais de futebol que ocorrem em ${date} ou nas próximas 24 horas.
  Se não houver 13 jogos grandes, use jogos de ligas secundárias confiáveis.
  
  Para cada jogo, crie um "CUSTOMBET" (combinação de dois mercados). 
  Exemplos: "Vitória + Mais de 1.5 gols", "Handicap + Gols do Time", "Ambos Marcam + Escanteios".
  
  REGRAS:
  1. Idioma: Português (Brasil).
  2. Seja realista: Baseie-se em dados reais de notícias e escalações.
  3. Formato: Retorne EXATAMENTE no esquema JSON solicitado.
  
  Retorne 13 objetos no array 'matches'.`;

  try {
    const response = await ai.models.generateContent({
      model: modelName,
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
        thinkingConfig: { thinkingBudget: 4000 },
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
                  market1: { type: Type.STRING },
                  market2: { type: Type.STRING },
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
    if (!text) throw new Error("A IA retornou uma resposta vazia.");

    const sources = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    const data = JSON.parse(text) as SearchResponse;
    
    return { data, sources };
  } catch (e: any) {
    console.error("Erro na API Gemini:", e);
    throw new Error(e.message || "Erro desconhecido ao consultar a IA.");
  }
};
