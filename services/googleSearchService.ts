
import { SearchResult } from "../types";

// Access keys from environment variables configured in vite.config.ts
// Direct access ensures Vite replacement works in browser
const getTavilyKey = () => process.env.TAVILY_API_KEY || "";
const getExaKey = () => process.env.EXA_API_KEY || "";

// Heuristic to detect if a user likely wants to see images
const isVisualIntent = (query: string): boolean => {
  const q = query.toLowerCase();
  const visualKeywords = [
    'image', 'photo', 'picture', 'pic', 'show me', 'look like', 'appearance', 
    'outfit', 'style', 'design', 'logo', 'color', 'diagram', 'sketch', 
    'drawing', 'render', 'concept', 'map', 'chart', 'graph', 'infographic'
  ];
  if (visualKeywords.some(k => q.includes(k))) return true;
  return false;
};

// Optimized for speed < 2s using Exa for text + Tavily for images
export const searchFast = async (query: string): Promise<{ results: SearchResult[]; images: string[] }> => {
  const exaKey = getExaKey();
  const tavilyKey = getTavilyKey();
  
  const visual = isVisualIntent(query);

  // If Exa key is missing, or visual intent is high, fall back immediately to Tavily
  if (!exaKey || visual) {
      return searchWeb(query, visual ? 'fast-visual' : 'fast-fallback');
  }

  try {
    // Execute searches in parallel:
    // 1. Exa for high-quality, fast text results
    // 2. Tavily for images (since Exa's fast mode doesn't provide them efficiently)
    const [exaResponse, tavilyResponse] = await Promise.all([
        fetch("https://api.exa.ai/search", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "x-api-key": exaKey,
            },
            body: JSON.stringify({
                query: query,
                numResults: 10,
                type: "keyword",
                useAutoprompt: false,
                contents: {
                    text: true,
                    highlights: {
                        numSentences: 2,
                        query: query
                    }
                }
            }),
        }).then(r => r.ok ? r.json() : null),
        
        tavilyKey ? searchWeb(query, 'images-only') : Promise.resolve({ images: [] as string[] })
    ]);

    if (!exaResponse) {
        throw new Error("Exa API request failed");
    }

    const results = exaResponse.results?.map((item: any) => {
        let hostname = 'Source';
        try { hostname = new URL(item.url).hostname; } catch (e) {}
        
        const snippet = item.highlights?.[0] || item.text?.substring(0, 300) || "";

        return {
            title: item.title || hostname,
            link: item.url,
            snippet: snippet,
            displayLink: hostname,
            publishedDate: item.publishedDate
        };
    }) || [];

    // Return combined results: Exa text + Tavily images
    return { 
        results, 
        images: tavilyResponse.images || [] 
    };

  } catch (error) {
    console.warn("Exa Search Error, falling back to Tavily:", error);
    return searchWeb(query, 'fast-fallback');
  }
};

export const searchWeb = async (query: string, mode: string = 'web'): Promise<{ results: SearchResult[]; images: string[] }> => {
  const tavilyKey = getTavilyKey();

  if (!tavilyKey) {
      console.warn("Tavily API Key missing");
      return { results: [], images: [] };
  }

  try {
    let includeDomains: string[] | undefined = undefined;
    let topic = "general";
    let searchDepth = "basic"; 
    let includeImages = true;
    let maxResults = 8; 

    if (mode === 'x') {
      includeDomains = ['twitter.com', 'x.com'];
    } else if (mode === 'reddit') {
      includeDomains = ['reddit.com'];
    } else if (mode === 'videos') {
       includeDomains = ['youtube.com', 'vimeo.com'];
    } else if (mode === 'research') {
      searchDepth = "advanced";
      maxResults = 12;
    } else if (mode === 'fast-visual') {
        maxResults = 8;
        includeImages = true;
    } else if (mode === 'fast-fallback') {
        includeImages = true; // Enable images even in fallback
        maxResults = 5;
        searchDepth = "basic";
    } else if (mode === 'images-only') {
        includeImages = true;
        maxResults = 5; // We mainly want the images array
        searchDepth = "basic";
    }

    let searchString = query;
    if (mode === 'factcheck') {
       searchString = `${query} fact check snopes politifact`;
    }

    const response = await fetch("https://api.tavily.com/search", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        api_key: tavilyKey,
        query: searchString,
        search_depth: searchDepth,
        include_images: includeImages, 
        max_results: maxResults, 
        include_domains: includeDomains,
        topic: topic
      }),
    });

    if (!response.ok) throw new Error("Tavily Error");

    const data = await response.json();
    const globalImages = data.images || [];

    const results = data.results?.map((item: any) => {
      let hostname = 'Source';
      try { hostname = new URL(item.url).hostname; } catch (e) {}

      return {
        title: item.title,
        link: item.url,
        snippet: item.content,
        displayLink: hostname,
        publishedDate: item.published_date || undefined
      };
    }) || [];

    return { results, images: globalImages };

  } catch (error) {
    console.error("Search Error:", error);
    return { results: [], images: [] };
  }
};

export const searchNews = searchWeb;

export const getSuggestions = async (query: string): Promise<string[]> => {
  if (!query || query.trim().length < 2) return [];
  try {
    const response = await fetch(`https://en.wikipedia.org/w/api.php?action=opensearch&search=${encodeURIComponent(query)}&limit=5&origin=*&format=json`);
    const data = await response.json();
    return data[1] || [];
  } catch (error) {
    console.error("Suggestion Error:", error);
    return [];
  }
};
