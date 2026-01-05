
import { GoogleGenAI, Type } from "@google/genai";
import { Match, SearchResponse } from "../types";

export const getDailyPredictions = async (date: string): Promise<{ data: SearchResponse, sources: any[] }> => {
  // A chave de API deve estar configurada no Netlify (Site Settings > Environment Variables)
  const apiKey = process.env.API_KEY;
  
  if (!apiKey) {
    throw new Error("API_KEY_MISSING");
  }

  const ai = new GoogleGenAI({ apiKey });
  
  // Usamos o modelo Gemini 3 Pro para garantir suporte superior a Google Search e JSON complexo
  const modelName = 'gemini-3-pro-preview';

  const prompt = `Você é um analista estatístico de futebol de elite.
  Data alvo: ${date}.
  
  MISSÃO:
  1. Use a ferramenta Google Search para encontrar 13 jogos reais de futebol que acontecem em ${date}.
  2. Se não houver 13 jogos grandes nesta data exata, procure jogos nas 12 horas seguintes ou em ligas profissionais secundárias.
  3. Para cada jogo, crie um "CUSTOMBET" (combinação lógica de dois mercados).
  4. Exemplo de mercado: "Vitória do Time A + Mais de 1.5 gols no jogo".
  
  FORMATO DE RESPOSTA:
  Retorne EXATAMENTE um objeto JSON com um array 'matches' contendo 13 objetos.
  Cada objeto deve ter: homeTeam, awayTeam, league, market1, market2, confidence (0-100) e reasoning (uma frase curta justificando o palpite).
  
  IMPORTANTE: Se não encontrar dados suficientes, retorne os jogos mais recentes/próximos disponíveis para preencher os 13 slots. NÃO retorne menos que 13 jogos.`;

  try {
    const response = await ai.models.generateContent({
      model: modelName,
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
        // Adicionamos um pequeno orçamento de pensamento para garantir a qualidade dos 13 jogos
        thinkingConfig: { thinkingBudget: 2000 },
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            matches: {
              type: Type.ARRAY,
              description: "Lista de 13 partidas analisadas",
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
            summary: { type: Type.STRING, description: "Resumo da rodada" }
          },
          required: ["matches"]
        }
      },
    });

    const text = response.text;
    if (!text) {
      throw new Error("EMPTY_RESPONSE");
    }

    const sources = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    const data = JSON.parse(text) as SearchResponse;
    
    // Garantir que sempre temos um array, mesmo que vazio
    if (!data.matches) data.matches = [];
    
    return { data, sources };
  } catch (e: any) {
    console.error("Erro detalhado na Gemini API:", e);
    // Propaga erros específicos para o App.tsx tratar
    if (e.message?.includes("API_KEY")) throw new Error("API_KEY_INVALID");
    if (e.message?.includes("safety")) throw new Error("SAFETY_BLOCK");
    throw e;
  }
};
