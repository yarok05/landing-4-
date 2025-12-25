import { GoogleGenAI, Type } from "@google/genai";

// Initialize with a named parameter as required
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const getSmartAuditInsight = async (website: string, niche: string): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Ти — преміальний експерт з Meta Ads Ігор Яровий (IGADSFLEX). Надай короткий стратегічний коментар (2 речення) для бізнесу в ніші ${niche} з сайтом ${website}. Фокусуйся на прибутку та ROI, а не просто на трафіку. Мова відповіді: українська. Тон: професійний, впевнений.`,
      config: {
        maxOutputTokens: 150,
        temperature: 0.7,
      },
    });
    
    return response.text || "Мені потрібно детальніше вивчити ваші показники, але я вже бачу потенціал для масштабування вашого ROAS.";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Готовий перетворити ваші витрати на рекламу в прогнозований двигун прибутку.";
  }
};