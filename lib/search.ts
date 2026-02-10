import { SearchResult } from "../types";

// Access keys from environment variables
const getTavilyKey = () => process.env.TAVILY_API_KEY || "";
const getExaKey = () => process.env.EXA_API_KEY || "";

/**
 * STRATEGY: Exa (Primary)
 * Optimized for semantic relevance, returning highlights and neural matches.
 * Uses type: 'auto' as recommended by Scira docs for balanced performance.
 */
const searchExa = async (query: string, numResults: number = 8): Promise<SearchResult[]> => {
    const apiKey = getExaKey();
    if (!apiKey) return [];

    try {
        const response = await fetch("https://api.exa.ai/search", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "x-api-key": apiKey,
            },
            body: JSON.stringify({
                query: query,
                numResults: numResults,
                type: "auto", // Neural search (Scira standard)
                useAutoprompt: true,
                contents: {
                    text: false, 
                    highlights: {
                        numSentences: 2, // Concise snippets for RAG
                        query: query
                    }
                }
            }),
        });

        if (!response.ok) return [];
        const data = await response.json();

        return (data.results || []).map((item: any) => {
            let hostname = 'Source';
            try { hostname = new URL(item.url).hostname.replace('www.', ''); } catch (e) {}
            return {
                title: item.title || hostname,
                link: item.url,
                snippet: item.highlights?.[0] || item.text?.substring(0, 250) || "",
                displayLink: hostname,
                publishedDate: item.publishedDate
            };
        });
    } catch (e) {
        console.warn("Exa search failed", e);
        return [];
    }
};

/**
 * STRATEGY: Tavily (Fallback/News)
 * Optimized for real-time news and structured answers.
 * Uses search_depth: 'advanced' and include_answer: true.
 */
const searchTavily = async (query: string, numResults: number = 8): Promise<SearchResult[]> => {
    const apiKey = getTavilyKey();
    if (!apiKey) return [];

    try {
        const response = await fetch("https://api.tavily.com/search", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                api_key: apiKey,
                query: query,
                search_depth: "basic", // Basic for speed in multi-query, advanced for single deep
                include_answer: true,
                max_results: numResults,
                topic: "general"
            }),
        });

        if (!response.ok) return [];
        const data = await response.json();

        return (data.results || []).map((item: any) => {
            let hostname = 'Source';
            try { hostname = new URL(item.url).hostname.replace('www.', ''); } catch (e) {}
            return {
                title: item.title,
                link: item.url,
                snippet: item.content,
                displayLink: hostname,
                publishedDate: item.published_date
            };
        });
    } catch (e) {
        console.warn("Tavily search failed", e);
        return [];
    }
};

/**
 * ENGINE: Parallel Multi-Search (Scira Architecture)
 * 1. Takes distinct queries (Broad, Specific, News)
 * 2. Executes them in parallel against the best available provider
 * 3. Deduplicates by URL and Domain
 * 4. Aggregates into a dense result set
 */
export const performMultiSearch = async (queries: string[]): Promise<SearchResult[]> => {
    const exaKey = getExaKey();
    const tavilyKey = getTavilyKey();
    
    // Determine provider strategy: Prefer Exa, fall back to Tavily, or hybrid if needed
    // For Scira clone: Exa is primary for semantic depth
    const provider = exaKey ? 'exa' : (tavilyKey ? 'tavily' : 'none');
    
    if (provider === 'none') return [];

    // Parallel Execution
    const searchPromises = queries.map(query => {
        if (provider === 'exa') return searchExa(query, 6); // 6 results per query
        return searchTavily(query, 6);
    });

    const resultsArray = await Promise.all(searchPromises);
    const flatResults = resultsArray.flat();

    // Deduplication & Diversity Filtering
    const seenUrls = new Set<string>();
    const seenDomains = new Map<string, number>(); // Count results per domain
    const uniqueResults: SearchResult[] = [];

    for (const res of flatResults) {
        // 1. URL Dedup
        if (seenUrls.has(res.link)) continue;
        
        // 2. Domain Diversity (Cap max 2 results per domain)
        const domain = res.displayLink;
        const domainCount = seenDomains.get(domain) || 0;
        if (domainCount >= 2) continue;

        seenUrls.add(res.link);
        seenDomains.set(domain, domainCount + 1);
        uniqueResults.push(res);
    }

    // Limit total context to ~12 high quality results
    return uniqueResults.slice(0, 12);
};

// Legacy single search export (mapped to multi-search engine)
export const searchFast = async (query: string) => {
    const results = await performMultiSearch([query]);
    return { results };
};

export const searchNews = async (query: string) => {
    // For news specifically, Tavily often performs better on real-time
    // But sticking to the unified engine for consistency unless specified
    return searchFast(query);
};
