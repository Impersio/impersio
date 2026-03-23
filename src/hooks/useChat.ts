import { useState } from 'react';
import Groq from 'groq-sdk';
import { OpenRouter } from '@openrouter/sdk';

const groq = new Groq({ 
  apiKey: import.meta.env.VITE_GROQ_API_KEY || 'missing-key', 
  dangerouslyAllowBrowser: true 
});

const openrouter = new OpenRouter({
  apiKey: import.meta.env.VITE_OPENROUTER_API_KEY || 'missing-key',
});

export const useChat = () => {
  const [messages, setMessages] = useState<any[]>([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);

  const handleSearch = async (query: string, modelId: string, _mode: string) => {
    setHasSearched(true);
    const newMessages = [...messages, { role: 'user', content: query }];
    setMessages([...newMessages, { role: 'assistant', content: '', sources: [], images: [], videos: [] }]);
    setIsLoading(true);

    try {
      let sources: any[] = [];
      let images: any[] = [];
      let videos: any[] = [];
      let searchContext = '';

      // Perform Tavily Search
      if (import.meta.env.VITE_TAVILY_API_KEY && !['hi', 'hello', 'how are you', 'who are you', 'who created you', 'what is your name'].includes(query.toLowerCase().trim())) {
        try {
          const tavilyResponse = await fetch('https://api.tavily.com/search', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              api_key: import.meta.env.VITE_TAVILY_API_KEY,
              query: query,
              include_images: true,
              search_depth: 'advanced',
              max_results: 10,
            })
          });
          const tavilyData = await tavilyResponse.json();
          if (tavilyData.results) {
            sources = tavilyData.results.map((r: any) => ({
              title: r.title,
              link: r.url,
              snippet: r.content,
              displayLink: new URL(r.url).hostname,
              type: 'web'
            }));
            searchContext += `\n\nWeb Search Results:\n${tavilyData.results.map((r: any) => `Title: ${r.title}\nURL: ${r.url}\nContent: ${r.content}`).join('\n\n')}`;
          }
          if (tavilyData.images) {
            images = tavilyData.images.map((img: string) => ({
              title: 'Image',
              link: img,
              image: img,
              snippet: '',
              displayLink: '',
              type: 'web'
            }));
          }
        } catch (e) {
          console.error("Tavily search error:", e);
        }
      }

      // Perform Serper.dev Video Search
      if (import.meta.env.VITE_SERPER_API_KEY && !['hi', 'hello', 'how are you', 'who are you', 'who created you', 'what is your name'].includes(query.toLowerCase().trim())) {
        try {
          const serperResponse = await fetch('https://google.serper.dev/videos', {
            method: 'POST',
            headers: {
              'X-API-KEY': import.meta.env.VITE_SERPER_API_KEY,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({ q: query, num: 10 })
          });
          const serperData = await serperResponse.json();
          if (serperData.videos) {
            videos = serperData.videos.map((v: any) => ({
              title: v.title,
              link: v.link,
              snippet: v.snippet,
              displayLink: v.source || (v.link ? new URL(v.link).hostname : 'Video'),
              image: v.imageUrl,
              type: 'video'
            }));

            // Find a YouTube video and add to sources for citation
            const youtubeVideo = videos.find(v => v.link.includes('youtube.com') || v.link.includes('youtu.be'));
            if (youtubeVideo) {
              sources.push({
                title: youtubeVideo.title,
                link: youtubeVideo.link,
                snippet: youtubeVideo.snippet,
                displayLink: 'youtube.com',
                type: 'web'
              });
              searchContext += `\n\nYouTube Source:\nTitle: ${youtubeVideo.title}\nURL: ${youtubeVideo.link}\nContent: ${youtubeVideo.snippet}`;
            }
          }
        } catch (e) {
          console.error("Serper video search error:", e);
        }
      }

      const systemPrompt = modelId === 'moonshotai/kimi-k2-instruct-0905'
        ? `You are an expert AI assistant. Your goal is to generate expert, useful, factually correct, and contextually relevant responses.
        
        Instructions:
        - Use provided tools to gather information before answering.
        - Cite all claims using [web:x] format.
        - Keep responses concise (max 5 paragraphs).
        - Use Markdown headers for structure.
        - At the end of your response, provide 3-5 relevant follow-up questions in a list format under the header "### Related Questions".
        
        Tone: Clear, direct, active voice.
        
        Requirements:
        - Never reproduce copyrighted content.
        - Do not quote exact text from search results.
        - If uncertain, omit rather than hallucinate.`
        : `You are an expert AI research assistant. 
          Your task is to provide comprehensive, detailed, and high-quality answers. 
          When asked about companies, technologies, or news, provide deep insights.
          
          At the end of your response, provide 3-5 relevant follow-up questions in a list format under the header "### Related Questions".
          
          Always synthesize information from the provided search context to create a coherent summary.`;

      const messagesWithContext = [
        { role: 'system', content: systemPrompt },
        ...newMessages.map((m, i) => {
          if (i === newMessages.length - 1 && searchContext) {
            return { role: m.role, content: `${m.content}\n\nContext from web search: ${searchContext}` };
          }
          return { role: m.role, content: m.content };
        })
      ];

      let responseContent = '';
      
      const isGroq = modelId === 'moonshotai/kimi-k2-instruct-0905' || modelId === 'openai/gpt-oss-120b';
      const isOpenRouter = modelId === 'nvidia/nemotron-3-super-120b-a12b:free';
      
      if (isGroq) {
        const stream = await groq.chat.completions.create({
          model: modelId,
          messages: messagesWithContext,
          temperature: 1,
          max_completion_tokens: 8192,
          top_p: 1,
          stream: true,
        });

        setMessages(prev => {
          const updated = [...prev];
          updated[updated.length - 1] = { ...updated[updated.length - 1], content: '', sources, images, videos };
          return updated;
        });
        for await (const chunk of stream) {
          responseContent += chunk.choices[0]?.delta?.content || "";
          
          // Parse content to separate main answer and related questions
          const parts = responseContent.split('### Related Questions');
          const mainAnswer = parts[0].trim();
          let followUps: string[] = [];
          if (parts.length > 1) {
            followUps = parts[1].split('\n')
              .filter(line => line.trim().startsWith('-'))
              .map(line => line.trim().replace(/^-\s*/, ''));
          }

          setMessages(prev => {
            const updated = [...prev];
            updated[updated.length - 1] = { 
              ...updated[updated.length - 1], 
              content: mainAnswer, 
              followUps,
              sources, 
              images, 
              videos 
            };
            return updated;
          });
        }
      } else if (isOpenRouter) {
        const stream = await openrouter.chat.send({
          chatGenerationParams: {
            model: modelId,
            messages: messagesWithContext,
            stream: true,
          }
        });

        setMessages(prev => {
          const updated = [...prev];
          updated[updated.length - 1] = { ...updated[updated.length - 1], content: '', sources, images, videos };
          return updated;
        });
        for await (const chunk of stream) {
          responseContent += chunk?.choices?.[0]?.delta?.content || "";
          
          // Parse content to separate main answer and related questions
          const parts = responseContent.split('### Related Questions');
          const mainAnswer = parts[0].trim();
          let followUps: string[] = [];
          if (parts.length > 1) {
            followUps = parts[1].split('\n')
              .filter(line => line.trim().startsWith('-'))
              .map(line => line.trim().replace(/^-\s*/, ''));
          }

          setMessages(prev => {
            const updated = [...prev];
            updated[updated.length - 1] = { 
              ...updated[updated.length - 1], 
              content: mainAnswer, 
              followUps,
              sources, 
              images, 
              videos 
            };
            return updated;
          });
        }
      } else {
        // Fallback for other models
        setTimeout(() => {
          setMessages(prev => {
            const updated = [...prev];
            updated[updated.length - 1] = { ...updated[updated.length - 1], content: 'This is a mock response for ' + modelId, sources, images, videos };
            return updated;
          });
          setIsLoading(false);
        }, 1000);
        return;
      }
    } catch (error: any) {
      console.error("Error fetching chat:", error);
      const errorMessage = error?.message || 'Sorry, an error occurred.';
      setMessages(prev => {
        const updated = [...prev];
        updated[updated.length - 1] = { ...updated[updated.length - 1], content: `Error: ${errorMessage}` };
        return updated;
      });
    } finally {
      setIsLoading(false);
    }
  };

  return {
    messages,
    setMessages,
    hasSearched,
    setHasSearched,
    isLoading,
    handleSearch,
    activeConversationId,
    setActiveConversationId
  };
};
