import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export interface QueryAnalysis {
  originalQuery: string;
  refinedQuery: string;
  intent: 'informational' | 'transactional' | 'navigational' | 'financial' | 'creative' | 'academic' | 'news' | 'social' | 'code' | 'entertainment' | 'location';
  needsRealTime: boolean;
  suggestedMode: 'web' | 'chat' | 'x' | 'stocks' | 'code' | 'academic' | 'extreme' | 'reddit' | 'github' | 'crypto' | 'prediction' | 'youtube' | 'spotify' | 'connectors' | 'memory' | 'voice' | 'xql';
  confidence: number;
}

export const processQuery = async (query: string): Promise<QueryAnalysis> => {
  try {
    const prompt = `
    You are an AI Query Understanding Engine for a search platform.
    Analyze the following user query: "${query}"

    Determine the following:
    1. **Refined Query**: A version of the query optimized for a search engine.
    2. **Intent**: The primary user intent.
       - 'informational', 'transactional', 'navigational', 'financial', 'creative', 'academic', 'news', 'social', 'code', 'entertainment', 'location'
    3. **Needs Real-Time**: Does this query require up-to-the-minute data? (true/false)
    4. **Suggested Mode**: The best search mode for this query.
       - 'web': General search.
       - 'chat': Conversational, no search needed.
       - 'x': Twitter/X posts, trends.
       - 'stocks': Market data, charts.
       - 'code': Programming help, snippets.
       - 'academic': Research papers.
       - 'extreme': Deep research, multiple steps.
       - 'reddit': Community discussions.
       - 'github': Repositories, code.
       - 'crypto': Cryptocurrency data.
       - 'prediction': Prediction markets (Polymarket).
       - 'youtube': Videos.
       - 'spotify': Music, songs, artists.
       - 'connectors': Personal files (Drive, Notion).
       - 'memory': Personal memory.
       - 'voice': Voice interaction.
       - 'xql': Advanced tweet analysis.

    Return strictly JSON:
    {
      "refinedQuery": "string",
      "intent": "string",
      "needsRealTime": boolean,
      "suggestedMode": "string",
      "confidence": number (0-1)
    }
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: { responseMimeType: "application/json", temperature: 0.1 }
    });

    const text = response.text;
    if (!text) throw new Error("No response from query processor");

    const data = JSON.parse(text);
    
    return {
      originalQuery: query,
      refinedQuery: data.refinedQuery || query,
      intent: data.intent || 'informational',
      needsRealTime: data.needsRealTime || false,
      suggestedMode: data.suggestedMode || 'web',
      confidence: data.confidence || 0.8
    };

  } catch (e) {
    console.error("Query processing failed", e);
    // Fallback
    return {
      originalQuery: query,
      refinedQuery: query,
      intent: 'informational',
      needsRealTime: true,
      suggestedMode: 'web',
      confidence: 0.5
    };
  }
};
