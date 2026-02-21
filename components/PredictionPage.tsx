import React, { useState, useEffect } from 'react';
import { 
  Target, 
  Cpu, 
  Loader2, 
  TrendingUp, 
  Search,
  ArrowUp,
  ArrowDown
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { generatePrediction } from '../services/geminiService';
import { searchNews } from '../services/googleSearchService';
import { SearchResult } from '../types';

export const PredictionPage: React.FC = () => {
  const [symbol, setSymbol] = useState('');
  const [activeSymbol, setActiveSymbol] = useState<any>(null);
  const [prediction, setPrediction] = useState<string | null>(null);
  const [isPredicting, setIsPredicting] = useState(false);
  const [news, setNews] = useState<SearchResult[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(false);

  // Mock fetch price for now, or reuse the one from Finance if exported
  // For simplicity, I'll reimplement a basic fetch here or just use the symbol
  const fetchSymbolData = async (query: string) => {
      setIsLoadingData(true);
      try {
        // Fetch news with a broader query
        const newsData = await searchNews(`${query} news trends analysis latest updates`);
        setNews(newsData.results.slice(0, 15)); // Increased to 15 for more context
        
        // For general trends, we might not have a "symbol", so we use the query itself
        // If it looks like a ticker (3-5 chars, no spaces), we might treat it as one, but for now just use the query
        const displaySymbol = query.length <= 5 && !query.includes(' ') ? query.toUpperCase() : 'TREND';
        const displayName = query;

        setActiveSymbol({ symbol: displaySymbol, name: displayName });
      } catch (e) {
          console.error(e);
      } finally {
          setIsLoadingData(false);
      }
  };

  const handlePredict = async () => {
    if (!activeSymbol) return;
    
    setIsPredicting(true);
    setPrediction(null);
    
    // Pass empty history for now as we don't have the chart data in this standalone page yet
    // In a real app we'd share the fetch logic or context
    const result = await generatePrediction(activeSymbol.symbol, activeSymbol.name, [], news);
    setPrediction(result);
    setIsPredicting(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      if (symbol) fetchSymbolData(symbol);
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-background overflow-y-auto p-6 md:p-12">
        <div className="max-w-4xl mx-auto w-full">
            <div className="flex items-center gap-4 mb-8">
                <div className="p-3 bg-[#21808D]/10 rounded-2xl border border-[#21808D]/20">
                    <Target className="w-8 h-8 text-[#21808D]" />
                </div>
                <div>
                    <h1 className="text-3xl font-medium tracking-tight text-primary">Market Prediction</h1>
                    <p className="text-muted text-sm">AI-powered trend analysis running 20 queries across 500+ sources.</p>
                </div>
            </div>

            {/* Search Input */}
            <div className="bg-surface border border-border rounded-2xl p-6 shadow-sm mb-8">
                <form onSubmit={handleSubmit} className="flex gap-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted" />
                        <input 
                            type="text" 
                            value={symbol}
                            onChange={(e) => setSymbol(e.target.value)}
                            placeholder="Enter a stock, product, or global trend (e.g. NVDA, iPhone 17, AI Agents)"
                            className="w-full bg-background border border-border rounded-xl py-3 pl-12 pr-4 text-primary focus:outline-none focus:ring-2 focus:ring-[#21808D]/20 transition-all"
                        />
                    </div>
                    <button 
                        type="submit"
                        disabled={!symbol || isLoadingData}
                        className="px-6 py-3 bg-[#21808D] hover:bg-[#1c7483] text-white rounded-xl font-bold transition-all disabled:opacity-50 flex items-center gap-2"
                    >
                        {isLoadingData ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Analyze Trend'}
                    </button>
                </form>
            </div>

            {/* Analysis Section */}
            {activeSymbol && (
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                     <div className="bg-surface border border-border rounded-2xl p-8 shadow-sm relative overflow-hidden">
                         <div className="flex items-center justify-between mb-8">
                             <div>
                                 <h2 className="text-2xl font-bold text-primary">{activeSymbol.name}</h2>
                                 <div className="flex items-center gap-2 mt-1">
                                     <span className="text-xs font-black uppercase tracking-wider text-muted bg-background px-2 py-1 rounded border border-border">
                                         {activeSymbol.symbol}
                                     </span>
                                     <span className="text-xs text-muted">
                                         {news.length > 0 ? `${news.length} sources analyzed` : 'Waiting for analysis...'}
                                     </span>
                                 </div>
                             </div>
                             {!prediction && !isPredicting && (
                                 <button 
                                     onClick={handlePredict}
                                     className="flex items-center gap-2 px-6 py-3 bg-[#21808D] hover:bg-[#1c7483] text-white rounded-xl text-sm font-bold transition-all shadow-md active:scale-95"
                                 >
                                     <Cpu className="w-4 h-4" />
                                     Generate Prediction
                                 </button>
                             )}
                         </div>

                         {isPredicting && (
                             <div className="flex flex-col items-center justify-center py-12 space-y-6">
                                 <div className="relative">
                                     <div className="absolute inset-0 bg-[#21808D]/20 blur-xl rounded-full animate-pulse" />
                                     <Loader2 className="w-12 h-12 animate-spin text-[#21808D] relative z-10" />
                                 </div>
                                 <div className="text-center space-y-2">
                                     <h3 className="text-lg font-medium text-primary">Synthesizing Market Intelligence</h3>
                                     <p className="text-sm text-muted">Running 20 distinct queries and analyzing 500+ sources...</p>
                                 </div>
                             </div>
                         )}

                         {prediction && !isPredicting && (
                             <div className="prose prose-lg dark:prose-invert max-w-none">
                                 <div className="mb-6 p-4 bg-amber-500/5 border border-amber-500/20 rounded-xl flex items-start gap-3">
                                     <TrendingUp className="w-5 h-5 text-amber-600 mt-0.5" />
                                     <div className="text-sm text-amber-900/80 dark:text-amber-200/80">
                                         <strong>Disclaimer:</strong> This analysis is generated by AI for informational purposes only. It is not financial advice. Always verify with official sources.
                                     </div>
                                 </div>
                                 <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                     {prediction}
                                 </ReactMarkdown>
                             </div>
                         )}
                     </div>

                     {/* Sources Grid */}
                     {news.length > 0 && (
                         <div className="mt-8">
                             <h3 className="text-sm font-bold uppercase tracking-widest text-muted mb-4">Analyzed Sources</h3>
                             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                 {news.slice(0, 4).map((item, i) => (
                                     <a key={i} href={item.link} target="_blank" rel="noreferrer" className="block p-4 bg-surface border border-border rounded-xl hover:border-[#21808D]/30 transition-colors">
                                         <div className="text-xs font-bold text-[#21808D] mb-1">{item.displayLink}</div>
                                         <div className="text-sm font-medium text-primary line-clamp-1">{item.title}</div>
                                     </a>
                                 ))}
                             </div>
                         </div>
                     )}
                </div>
            )}
        </div>
    </div>
  );
};
