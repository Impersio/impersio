import React, { useState, useEffect } from 'react';
import { Trophy, TrendingUp } from 'lucide-react';
import { searchNews } from '../services/googleSearchService';
import { SearchResult, ModelOption } from '../types';
import { InputBar } from './search/InputBar';

interface SportsProps {
  onSearch: (query: string) => void;
  query: string;
  setQuery: (q: string) => void;
  selectedModel: ModelOption;
  setSelectedModel: (m: ModelOption) => void;
  models: ModelOption[];
}

export const Sports: React.FC<SportsProps> = ({ 
  onSearch, 
  query, 
  setQuery,
  selectedModel,
  setSelectedModel,
  models
}) => {
  const [news, setNews] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(true);

  // Auto-switch to Impersio Sports model when entering this view
  useEffect(() => {
    const sportsModel = models.find(m => m.id === 'impersio-sports');
    if (sportsModel && selectedModel.id !== 'impersio-sports') {
        setSelectedModel(sportsModel);
    }
  }, []);

  useEffect(() => {
    const fetchSportsNews = async () => {
      setLoading(true);
      // Fetch latest sports news
      const response = await searchNews('latest sports news nba nfl soccer tennis scores headlines');
      
      const resultsWithFallback = response.results.map((item) => ({
        ...item,
        // Fallback generic sports image if none provided
        image: item.image || `https://tse2.mm.bing.net/th?q=${encodeURIComponent(item.title)}&w=800&h=450&c=7&rs=1`
      }));
      setNews(resultsWithFallback);
      setLoading(false);
    };

    fetchSportsNews();
  }, []);

  return (
    <div className="flex flex-col h-full bg-background text-primary font-sans animate-fade-in relative">
        <div className="flex-1 overflow-y-auto pb-40">
            <div className="max-w-[760px] mx-auto px-4 py-12 md:py-20">
                
                {/* Title */}
                <div className="flex items-center justify-center gap-3 mb-10">
                   <h1 className="text-4xl md:text-5xl font-medium tracking-tight text-center">
                     <span className="text-primary">impersio</span> <span className="text-muted font-normal font-serif">sports</span>
                   </h1>
                </div>

                <div className="mb-12">
                     <InputBar 
                        query={query} 
                        setQuery={setQuery} 
                        handleSearch={() => onSearch(query)} 
                        isInitial={true}
                        selectedModel={selectedModel}
                        setSelectedModel={setSelectedModel}
                        models={models}
                    />
                </div>

                <div className="space-y-6">
                    <div className="flex items-center gap-2 mb-4">
                        <TrendingUp className="w-5 h-5 text-[#1c7483]" />
                        <h2 className="text-lg font-medium">Trending Sports News</h2>
                    </div>

                    {loading ? (
                        <div className="grid gap-4 animate-pulse">
                            {[1,2,3].map(i => <div key={i} className="h-24 bg-surface rounded-xl border border-border" />)}
                        </div>
                    ) : (
                        <div className="grid gap-4">
                            {news.slice(0, 5).map((item, idx) => (
                                <a 
                                    key={idx}
                                    href={item.link}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="flex gap-4 p-4 bg-surface hover:bg-surface-hover border border-border rounded-xl transition-all hover:shadow-sm group"
                                >
                                    <div className="w-24 h-24 flex-shrink-0 bg-gray-100 rounded-lg overflow-hidden">
                                        <img src={item.image} className="w-full h-full object-cover" alt="" />
                                    </div>
                                    <div className="flex flex-col justify-between py-1">
                                        <h3 className="font-medium text-primary line-clamp-2 group-hover:text-[#1c7483] transition-colors">
                                            {item.title}
                                        </h3>
                                        <div className="flex items-center gap-2 text-xs text-muted">
                                            <span>{item.displayLink}</span>
                                            <span>•</span>
                                            <span>{item.publishedDate || 'Today'}</span>
                                        </div>
                                    </div>
                                </a>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    </div>
  );
};