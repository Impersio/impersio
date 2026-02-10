import { SearchResult } from "../types";

// Access keys from environment variables configured in vite.config.ts
const getTavilyKey = () => process.env.TAVILY_API_KEY || "";
const getExaKey = () => process.env.EXA_API_KEY || "";

// Optimized for speed < 1s using Exa highlights
export const searchFast = async (query: string): Promise<{ results: SearchResult[] }> => {
  const exaKey = getExaKey();
  
  // If Exa key is missing, fall back to Tavily
  if (!exaKey) {
      return searchWeb(query);
  }

  try {
    // Execute Exa Search
    // Optimization: Request fewer results (5) and prioritize highlights over full text
    const exaResponse = await fetch("https://api.exa.ai/search", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "x-api-key": exaKey,
        },
        body: JSON.stringify({
            query: query,
            numResults: 5, 
            type: "keyword",
            useAutoprompt: false,
            contents: {
                text: false, // Disabled full text for speed
                highlights: {
                    numSentences: 3, // Sufficient for RAG
                    query: query
                }
            }
        }),
    }).then(r => r.ok ? r.json() : null);

    if (!exaResponse) {
        throw new Error("Exa API request failed");
    }

    const results = exaResponse.results?.map((item: any) => {
        let hostname = 'Source';
        try { hostname = new URL(item.url).hostname; } catch (e) {}
        
        // Use highlight or summary
        const snippet = item.highlights?.[0] || item.text?.substring(0, 200) || "";

        return {
            title: item.title || hostname,
            link: item.url,
            snippet: snippet,
            displayLink: hostname,
            publishedDate: item.publishedDate
        };
    }) || [];

    return { results };

  } catch (error) {
    console.warn("Exa Search Error, falling back to Tavily:", error);
    return searchWeb(query);
  }
};

export const searchWeb = async (query: string, mode: string = 'web'): Promise<{ results: SearchResult[] }> => {
  const tavilyKey = getTavilyKey();

  if (!tavilyKey) {
      console.warn("Tavily API Key missing");
      return { results: [] };
  }

  try {
    let includeDomains: string[] | undefined = undefined;
    let topic = "general";
    let searchDepth = "basic"; 
    let maxResults = 5; // Reduced from 6 for slight speed bump

    if (mode === 'x') {
      includeDomains = ['twitter.com', 'x.com'];
    } else if (mode === 'reddit') {
      includeDomains = ['reddit.com'];
    } else if (mode === 'research') {
      searchDepth = "advanced";
      maxResults = 8;
    }

    const response = await fetch("https://api.tavily.com/search", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        api_key: tavilyKey,
        query: query,
        search_depth: searchDepth,
        include_images: false,
        max_results: maxResults, 
        include_domains: includeDomains,
        topic: topic
      }),
    });

    if (!response.ok) throw new Error("Tavily Error");

    const data = await response.json();

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

    return { results };

  } catch (error) {
    console.error("Search Error:", error);
    return { results: [] };
  }
};

export const searchMedia = async (query: string): Promise<{ images: SearchResult[], videos: SearchResult[] }> => {
    const tavilyKey = getTavilyKey();
    if (!tavilyKey) return { images: [], videos: [] };

    try {
        const response = await fetch("https://api.tavily.com/search", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                api_key: tavilyKey,
                query: query,
                search_depth: "basic",
                include_images: true,
                max_results: 8,
                include_image_descriptions: true
            }),
        });

        if (!response.ok) return { images: [], videos: [] };

        const data = await response.json();
        
        const images: SearchResult[] = (data.images || []).map((img: any) => ({
            title: img.description || "Image",
            link: img.url,
            snippet: "",
            displayLink: "Image",
            image: img.url 
        }));

        const videos: SearchResult[] = (data.results || [])
            .filter((r: any) => r.url.includes('youtube.com') || r.url.includes('vimeo.com'))
            .map((r: any) => {
                let thumb = "";
                if (r.url.includes('youtube.com/watch')) {
                    try {
                        const vId = new URL(r.url).searchParams.get('v');
                        if (vId) thumb = `https://img.youtube.com/vi/${vId}/mqdefault.jpg`;
                    } catch(e) {}
                }
                return {
                    title: r.title,
                    link: r.url,
                    snippet: r.content,
                    displayLink: "YouTube",
                    image: thumb
                };
            });

        return { images, videos };

    } catch (e) {
        console.error("Media Search Error", e);
        return { images: [], videos: [] };
    }
};

export const searchNews = async (query: string) => {
    return searchWeb(query, 'news');
};

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