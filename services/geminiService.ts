
// Use correct import as per guidelines
import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// Get travel suggestions using Gemini
export const getTravelSuggestions = async (prompt: string) => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `You are a Tokyo travel expert. A user is going to Tokyo for the WBC. ${prompt}. Give a concise suggestion in Traditional Chinese.`,
    });
    // Access .text property directly
    return response.text;
  } catch (error) {
    console.error("Gemini Error:", error);
    return "抱歉，目前無法取得建議。";
  }
};

// Mock weather function
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

// Get spot details using Gemini with JSON response schema
export const getSpotDetails = async (spotName: string, address: string): Promise<SpotDetail | null> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `請針對日本景點「${spotName}」（地址：${address}）提供深入的旅遊介紹。
      內容須包含：
      1. 歷史故事與背景。
      2. 附近推薦的相關景點。
      3. 附近推薦的美食。
      4. 推薦的必買伴手禮。
      請以繁體中文回答。`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            history: { type: Type.STRING, description: "景點的歷史背景與故事" },
            nearbyAttractions: { 
              type: Type.ARRAY, 
              items: { type: Type.STRING },
              description: "周邊推薦景點列表" 
            },
            nearbyFood: { 
              type: Type.ARRAY, 
              items: { type: Type.STRING },
              description: "周邊推薦美食列表" 
            },
            souvenirs: { 
              type: Type.ARRAY, 
              items: { type: Type.STRING },
              description: "推薦伴手禮列表" 
            }
          },
          required: ["history", "nearbyAttractions", "nearbyFood", "souvenirs"]
        }
      }
    });

    // Access .text property directly and parse JSON
    const text = response.text;
    if (!text) return null;
    return JSON.parse(text);
  } catch (error) {
    console.error("Gemini Detail Error:", error);
    return null;
  }
};
