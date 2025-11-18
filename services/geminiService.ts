import { GoogleGenAI, Type } from "@google/genai";
import { PlayerInput, TeamResult } from '../types';

// Helper to safely access environment variables in browser
const getEnv = (key: string): string | undefined => {
  // Check global process (if defined by bundler)
  if (typeof process !== 'undefined' && process.env && process.env[key]) {
    return process.env[key];
  }
  // Check window.process (if defined by shim)
  if (typeof window !== 'undefined' && (window as any).process && (window as any).process.env) {
    return (window as any).process.env[key];
  }
  return undefined;
};

const getClient = () => {
  const apiKey = getEnv('API_KEY');
  
  if (!apiKey) {
    console.warn("API Key not found. Ensure 'API_KEY' is set in your environment variables.");
  }
  return new GoogleGenAI({ apiKey: apiKey || '' });
};

export const balanceTeams = async (players: PlayerInput[]): Promise<TeamResult> => {
  const ai = getClient();
  
  // JSON string of players for the prompt
  const playersJson = JSON.stringify(players, null, 2);

  const prompt = `
  ATUE COMO UM TÉCNICO ESPECIALISTA EM FUTSAL E ALGORITMO DE BALANCEAMENTO.
  
  INPUT: Receba a seguinte lista de jogadores confirmados:
  ${playersJson}

  TAREFA (RACIOCÍNIO): 
  Dividir a lista em dois times (Time A e Time B), aplicando as seguintes regras estritas:

  1. **Tamanho dos Times**: O objetivo é ter times de 6 jogadores (5 na linha + 1 Goleiro).
  2. **Distribuição de Goleiros**: Distribua quem tem "posicao_preferida": "Goleiro" uniformemente. Se houver apenas 1, designe um "Goleiro Auxiliar" no outro time (priorizando Fixo ou Coringa).
  3. **Balanceamento por Posição**: 
     - Distribua "Fixo" (defesa) e "Pivô" (ataque) uniformemente.
     - Use "Ala" e "Coringa" para equilibrar e preencher lacunas.
  4. **Excedente**: Se houver mais de 12 jogadores, os excedentes (baseado na lógica de quem sobra após formar os 2 melhores times possíveis) devem ir para "Reservas". Mantenha a distribuição 6x6 como prioridade absoluta para os times principais.

  OUTPUT: Retorne APENAS o JSON no formato solicitado, sem explicações adicionais.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            Time_A: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  nome: { type: Type.STRING },
                  posicao_designada: { type: Type.STRING }
                }
              }
            },
            Time_B: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  nome: { type: Type.STRING },
                  posicao_designada: { type: Type.STRING }
                }
              }
            },
            Reservas: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  nome: { type: Type.STRING },
                  timestamp_registro: { type: Type.STRING }
                }
              }
            }
          }
        }
      }
    });

    const textResponse = response.text;
    if (!textResponse) throw new Error("No response from AI");

    return JSON.parse(textResponse) as TeamResult;
  } catch (error) {
    console.error("Error generating teams:", error);
    throw error;
  }
};