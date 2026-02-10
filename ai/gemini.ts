import { GoogleGenAI } from "@google/genai";
import { SearchResult, WidgetData, Message, CopilotPayload } from "../types";
import { performMultiSearch } from '../lib/search';
import { streamPollinations } from '../services/pollinationsService';
import { streamGroq } from '../services/groqService';
import { streamOpenRouter } from '../services/openRouterService';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const generateWithRetry = async (params: any, retries = 3, delay = 2000): Promise<any> => {
    try {
        return await ai.models.generateContentStream(params);
    } catch (e: any) {
        if (retries > 0 && (e.status === 429 || e.status === 'RESOURCE_EXHAUSTED' || e.message?.includes('429'))) {
            await new Promise(resolve => setTimeout(resolve, delay));
            return generateWithRetry(params, retries - 1, delay * 2);
        }
        throw e;
    }
};

// --- SMART QUERY GENERATOR (Scira Strategy) ---
export const generateSearchQueries = async (query: string): Promise<{ queries: string[], plan: string }> => {
    try {
        // Scira-style multi-query generation: 3-4 parallel vectors
        const response = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: `You are an expert search strategist.
            User Query: "${query}"
            
            Task: Generate 4 distinct, high-quality search queries to cover this topic comprehensively in parallel.
            
            Vectors:
            1. **Broad/Core**: The main entity or concept (e.g. "Nvidia stock analysis 2025").
            2. **Specific/Data**: Look for numbers, specs, or reports (e.g. "Nvidia Q3 2025 revenue breakdown").
            3. **Recent/News**: Look for the absolute latest updates (e.g. "Nvidia latest news last 7 days").
            4. **Perspective/Analysis**: Look for expert take or market consensus (e.g. "Nvidia stock buy or sell analyst ratings").
            
            Output JSON:
            {
              "plan": "Short strategic summary (max 6 words)",
              "queries": ["q1", "q2", "q3", "q4"]
            }`,
            config: { responseMimeType: "application/json", temperature: 0.3 }
        });
        
        const text = response.text;
        if (!text) throw new Error("No response from query generator");
        
        const data = JSON.parse(text);
        // Ensure we have at least 3 queries, max 4
        const queries = Array.isArray(data.queries) ? data.queries.slice(0, 4) : [query];
        
        return {
            queries: queries,
            plan: data.plan || "Parallel Search Strategy"
        };
    } catch (e) {
        console.error("Query generation failed", e);
        // Fallback strategy
        return { 
            queries: [
                `${query} overview`, 
                `${query} latest news`, 
                `${query} analysis`,
                `${query} facts`
            ], 
            plan: "Multi-vector Search..." 
        };
    }
};

export const generateCopilotStep = async (query: string): Promise<CopilotPayload | null> => {
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: `User Query: "${query}"
            Goal: ask one clarifying question to narrow down the intent.
            Return JSON: { "needs_clarification": boolean, "question": string, "type": "selection" | "text", "options": string[] }`,
            config: { responseMimeType: "application/json", temperature: 0.3 }
        });
        
        const text = response.text?.replace(/```json/g, '').replace(/```/g, '').trim();
        if (!text) return null;
        
        const data = JSON.parse(text);
        if (data.needs_clarification) {
            return {
                question: data.question,
                type: data.type || 'text',
                options: data.options
            };
        }
        return null;
    } catch (e) {
        return null;
    }
};

export const streamResponse = async (
  prompt: string, 
  modelName: string, 
  history: Message[],
  searchResults: SearchResult[],
  attachments: string[],
  isReasoningEnabled: boolean,
  isMobile: boolean,
  onChunk: (content: string, reasoning?: string) => void,
  onWidget: (widget: WidgetData) => void,
  onRelated: (questions: string[]) => void,
  onComplete?: (fullContent: string, widget: WidgetData | undefined, relatedQuestions: string[]) => void,
  deepFindings?: string,
  onSources?: (sources: SearchResult[]) => void
): Promise<void> => {
  
  const now = new Date();
  const contextResults = searchResults;

  // Build Context Block with Source Prioritization
  let ragContext = "";
  if (contextResults.length > 0) {
      ragContext = "VERIFIED SOURCES:\n" + 
        contextResults.map((r, i) => `[${i+1}] Title: ${r.title}\nContent: ${r.snippet}\nSource: ${r.displayLink}`).join('\n\n');
  }

  if (deepFindings) ragContext = `DEEP DIVE FINDINGS:\n${deepFindings}\n\n${ragContext}`;

  const isResearch = contextResults.length > 0;

  // --- Model Specific Routing ---
  let effectiveModelId = modelName;
  let systemInstruction = "";

  // Impersio Sports: Routes to Kimi K2 with specialized prompts
  if (modelName === 'impersio-sports') {
      effectiveModelId = 'moonshotai/kimi-k2-instruct-0905';
      
      systemInstruction = `
      System: You are Impersio Sports, an expert sports analyst.
      Current Date: ${now.toLocaleString()}
      
      CRITICAL: Give the direct score/answer FIRST. No preamble.
      
      CONTEXT:
      ${ragContext}
      
      FORMAT:
      1. **Direct Answer**: Score or key fact immediately.
      2. **Details**: Bullet points for stats/context.
      3. **Sources**: Cite [1] at end of sentences.
      `;
  } else if (modelName === 'impersio-travel') {
      effectiveModelId = 'moonshotai/kimi-k2-instruct-0905';
      
      systemInstruction = `
      System: You are Impersio Travel, a world-class travel planner and guide.
      Current Date: ${now.toLocaleString()}
      
      MANDATE:
      1. **Plan First**: If asked for an itinerary, provide a day-by-day breakdown immediately.
      2. **Vibe**: Be inspiring, practical, and knowledgeable. Use emojis for locations (e.g. 🗼 Tokyo).
      3. **Sources**: Strictly rely on provided sources for opening hours/prices.
      
      CONTEXT:
      ${ragContext}
      
      STRUCTURE:
      - **Summary**: 2 sentences on why this destination is great.
      - **Itinerary/Details**: Structured list with times and tips.
      - **Budget**: Estimated costs if available.
      `;
  } else if (modelName === 'moonshotai/kimi-k2-instruct-0905') {
      // Specialized Kimi K2 instruction for general queries
      systemInstruction = `
      System: You are Impersio (powered by Kimi K2), a comprehensive AI assistant.
      Current Date: ${now.toLocaleString()}
      
      MANDATE:
      1. **Medium Length**: Provide a response of approximately 200 words. Do not be brief.
      2. **Comprehensive**: Explain the "Why" and "How" of the answer. Provide adequate background.
      3. **Citations**: Strictly rely on the provided sources. Cite them using [1], [2] inline.
      
      CONTEXT:
      ${ragContext}
      
      STRUCTURE:
      - **Direct Answer**: The core answer to the user's question.
      - **Detailed Explanation**: Expand on the answer with relevant context, facts, and analysis.
      - **Context**: Mention any conflicting information or interesting nuances from the sources.
      `;
  } else {
      // Default System Prompt
      systemInstruction = `
      System: You are Impersio, a high-intelligence AI search engine.
      Current Date: ${now.toLocaleString()}
      
      MANDATE:
      1. **ANSWER FIRST**: Provide the direct, correct answer in the very first sentence. Do not say "Based on the search results" or "Here is what I found". Just state the answer.
      2. **NO HALLUCINATION**: You must strictly rely on the "VERIFIED SOURCES" provided. If the answer is not in the sources, say "I couldn't find verified information."
      3. **CITATIONS**: You MUST cite your sources using [1], [2] immediately after the fact.
      
      CONTEXT:
      ${ragContext}
      
      STRUCTURE:
      - **Direct Answer**: The immediate truth.
      - **Details**: Explanation, nuance, or context.
      - **Sources**: Mention conflicting or backup sources if relevant at the end.
      `;
  }

  const fullPrompt = `
  ${systemInstruction}

  User Query: ${prompt}
  
  Final Output:
  Generate 3 follow-up questions at the very bottom separated by "|||".
  `;

  // --- External Provider Routing ---

  const handleStream = async (streamFn: () => Promise<void>) => {
      let fullRaw = "";
      let hasFinishedThinking = false;
      await streamFn();
  };
  
  // GROQ MODELS (Includes Kimi K2 and Impersio Sports/Travel)
  const groqModels = [
      'openai/gpt-oss-120b',
      'moonshotai/kimi-k2-instruct-0905',
      'meta-llama/llama-4-scout-17b-16e-instruct',
      'qwen/qwen3-32b'
  ];

  if (groqModels.includes(effectiveModelId)) {
      try {
          let fullText = "";
          await streamGroq([{ role: 'user', content: fullPrompt }], effectiveModelId, (c) => {
              fullText += c;
              const cleanContent = fullText.replace(/<think>[\s\S]*?<\/think>/, '').trimStart();
              // Parse reasoning if needed
              onChunk(cleanContent.split('|||')[0], undefined);
          });
          const parts = fullText.replace(/<think>[\s\S]*?<\/think>/, '').split('|||');
          if (parts[1]) onRelated(parts[1].split('\n').filter(q => q.length > 5));
          if (onComplete) onComplete(parts[0], undefined, []);
      } catch (e) {
          onChunk("Error connecting to Groq model. Falling back...", undefined);
      }
      return;
  }

  // OPENROUTER MODELS
  if (effectiveModelId === 'tngtech/deepseek-r1t2-chimera:free') {
      try {
          let fullRaw = "";
          await streamOpenRouter([{ role: 'user', content: fullPrompt }], effectiveModelId, (c) => {
              fullRaw += c;
              // Simple extraction of content after </think> if present, or just content
              const parts = fullRaw.split('</think>');
              const content = parts.length > 1 ? parts[1] : parts[0]; 
              // If starts with <think>, wait.
              if (!fullRaw.startsWith('<think>') || fullRaw.includes('</think>')) {
                  onChunk(content.split('|||')[0], parts.length > 1 ? parts[0].replace('<think>', '') : undefined);
              }
          });
          // Finalization logic...
      } catch (e) {
          onChunk("Error connecting to OpenRouter.", undefined);
      }
      return;
  }

  // FALLBACK (Pollinations)
  if (effectiveModelId !== 'gemini-3-flash-preview' && !effectiveModelId.includes('gemini')) {
      try {
          let txt = "";
          await streamPollinations([{ role: 'user', content: fullPrompt }], 'openai', (c) => {
             txt += c;
             onChunk(c.split('|||')[0], undefined);
          });
          const parts = txt.split('|||');
          if (parts[1]) onRelated(parts[1].split('\n').filter(q => q.length > 5));
          if (onComplete) onComplete(parts[0], undefined, []);
      } catch (e) { onChunk("System overloaded. Please try again.", undefined); }
      return;
  }

  // --- Gemini Generation ---
  try {
    let contentsParts: any[] = [{ text: fullPrompt }];
    
    if (attachments && attachments.length > 0) {
        const imageParts = attachments.map(att => ({
            inlineData: { mimeType: att.split(';')[0].split(':')[1], data: att.split(',')[1] }
        }));
        contentsParts = [...imageParts, { text: fullPrompt }];
    }

    const result = await generateWithRetry({
        model: 'gemini-3-flash-preview', 
        contents: [{ role: 'user', parts: contentsParts }]
    });

    let fullText = "";
    for await (const chunk of result) {
        const text = chunk.text;
        if (text) {
            fullText += text;
            const split = fullText.split('|||');
            onChunk(split[0], undefined); 
        }
    }

    const parts = fullText.split('|||');
    if (parts.length > 1) {
        onRelated(parts.slice(1).join('').split('\n').map(q => q.trim()).filter(q => q.length > 5));
    } else {
        onRelated(["Explore deeper", "Related topics", "Why this matters"]);
    }
    if (onComplete) onComplete(parts[0], undefined, []);

  } catch (err: any) {
      console.error("Gemini Error:", err);
  }
};