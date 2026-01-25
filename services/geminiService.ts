import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const getTravelSuggestions = async (prompt: string) => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `You are a Tokyo travel expert. A user is going to Tokyo for the WBC. ${prompt}. Give a concise suggestion in Traditional Chinese.`,
    });
    return response.text;
  } catch (error) {
    console.error("Gemini Error:", error);
    return "抱歉，目前無法取得建議。";
  }
};

export const getWeather = async (date: string) => {
  return {
    temp: Math.floor(Math.random() * (15 - 5 + 1)) + 5, 
    condition: 'Sunny'
  };
};

export interface SpotDetail {
  history: string;
  nearbyAttractions: string[];
  nearbyFood: string[];
  souvenirs: string[];
}

export const getSpotDetails = async (spotName: string, address: string): Promise<SpotDetail | null> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `請針對日本景點「${spotName}」（地址：${address}）提供深入的旅遊介紹。
      內容須包含歷史、附近推薦景點、美食及伴手禮。
      請以繁體中文回答。`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            history: { type: Type.STRING },
            nearbyAttractions: { type: Type.ARRAY, items: { type: Type.STRING } },
            nearbyFood: { type: Type.ARRAY, items: { type: Type.STRING } },
            souvenirs: { type: Type.ARRAY, items: { type: Type.STRING } }
          },
          required: ["history", "nearbyAttractions", "nearbyFood", "souvenirs"]
        }
      }
    });

    return JSON.parse(response.text);
  } catch (error) {
    console.error("Gemini Detail Error:", error);
    return null;
  }
};