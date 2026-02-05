
import React, { useState, useEffect, useRef } from 'react';
import { 
  ArrowUp, 
  ArrowDown, 
  Search, 
  RefreshCcw, 
  TrendingUp, 
  Clock, 
  BarChart3,
  Coins,
  Target,
  LayoutGrid,
  Cpu,
  Loader2
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  ReferenceLine
} from 'recharts';
import { searchNews } from '../services/googleSearchService';
import { SearchResult } from '../types';

// --- Real Data Services ---

const CORS_PROXY = "https://corsproxy.io/?";

const fetchStockPrice = async (symbol: string) => {
  try {
    const res = await fetch(`${CORS_PROXY}${encodeURIComponent(`https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?interval=1m&range=1d`)}`);
    const data = await res.json();
    const result = data.chart.result[0];
    const price = result.meta.regularMarketPrice;
    const prevClose = result.meta.previousClose;
    const change = ((price - prevClose) / prevClose) * 100;
    const changeAbs = price - prevClose;
    
    return {
      price,
      change: parseFloat(change.toFixed(2)),
      changeAbs: parseFloat(changeAbs.toFixed(2)),
      name: result.meta.symbol // Simplified, real name usually requires another endpoint
    };
  } catch (e) {
    console.warn(`Failed to fetch price for ${symbol}`, e);
    return null;
  }
};

const fetchChartHistory = async (symbol: string, period: string) => {
  let interval = '15m';
  let range = '1d';

  switch (period) {
    case '24H': interval = '5m'; range = '1d'; break;
    case '7D': interval = '1h'; range = '7d'; break;
    case '30D': interval = '1d'; range = '1mo'; break;
    case '90D': interval = '1d'; range = '3mo'; break;
    case '1Y': interval = '1wk'; range = '1y'; break;
  }

  try {
    const res = await fetch(`${CORS_PROXY}${encodeURIComponent(`https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?interval=${interval}&range=${range}`)}`);
    const data = await res.json();
    const result = data.chart.result[0];
    const timestamps = result.timestamp;
    const prices = result.indicators.quote[0].close;

    return timestamps.map((ts: number, i: number) => ({
      time: new Date(ts * 1000).toISOString(),
      displayTime: period === '24H' 
        ? new Date(ts * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        : new Date(ts * 1000).toLocaleDateString([], { month: 'short', day: 'numeric' }),
      value: prices[i] || prices[i-1] || result.meta.regularMarketPrice,
    })).filter((d: any) => d.value !== null);
  } catch (e) {
    console.warn(`Failed to fetch history for ${symbol}`, e);
    return [];
  }
};

const INITIAL_INDICES = [
  { symbol: '^GSPC', name: 'S&P 500', price: 0, change: 0, changeAbs: 0 },
  { symbol: '^DJI', name: 'Dow Jones', price: 0, change: 0, changeAbs: 0 },
  { symbol: '^IXIC', name: 'NASDAQ', price: 0, change: 0, changeAbs: 0 },
  { symbol: '^VIX', name: 'VIX', price: 0, change: 0, changeAbs: 0 },
];

const PERIODS = ['24H', '7D', '30D', '90D', '1Y'];

export const Finance: React.FC = () => {
  const [indices, setIndices] = useState(INITIAL_INDICES);
  const [activeSymbol, setActiveSymbol] = useState({ symbol: '^GSPC', name: 'S&P 500', price: 0, change: 0 });
  const [period, setPeriod] = useState('24H');
  const [chartData, setChartData] = useState<any[]>([]);
  const [news, setNews] = useState<SearchResult[]>([]);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [hoverData, setHoverData] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'stocks' | 'crypto' | 'predict'>('stocks');
  const [loading, setLoading] = useState(true);

  const pollIntervalRef = useRef<number | null>(null);

  // 1. Initial Load & Ticker Polling
  useEffect(() => {
    const updateIndices = async () => {
      const updated = await Promise.all(INITIAL_INDICES.map(async (idx) => {
        const data = await fetchStockPrice(idx.symbol);
        return data ? { ...idx, ...data } : idx;
      }));
      setIndices(updated);
      
      // Update active symbol if it's one of the indices
      const currentIdx = updated.find(i => i.symbol === activeSymbol.symbol);
      if (currentIdx) {
        setActiveSymbol(prev => ({ ...prev, ...currentIdx }));
      }
    };

    updateIndices();
    const interval = window.setInterval(updateIndices, 10000); // Update market overview every 10s
    return () => clearInterval(interval);
  }, [activeSymbol.symbol]);

  // 2. Main Chart & News Fetching
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const [history, newsData] = await Promise.all([
        fetchChartHistory(activeSymbol.symbol, period),
        searchNews(`${activeSymbol.name} ${activeSymbol.symbol} finance news`)
      ]);
      
      setChartData(history);
      setNews(newsData.results.slice(0, 6));
      setLoading(false);
    };

    fetchData();
  }, [activeSymbol.symbol, period]);

  // 3. Ultra-Fast Ticker Simulation (for the "1 second" feel between polls)
  useEffect(() => {
    if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
    
    pollIntervalRef.current = window.setInterval(() => {
      setActiveSymbol(prev => {
        // Small random movement (simulation of sub-second ticks)
        const drift = (Math.random() - 0.5) * (prev.price * 0.0001);
        return { ...prev, price: prev.price + drift };
      });
    }, 1000);

    return () => {
      if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
    };
  }, [activeSymbol.symbol]);

  const handleSearchStock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setLoading(true);
    const data = await fetchStockPrice(searchQuery.toUpperCase());
    if (data) {
      setActiveSymbol({
        symbol: searchQuery.toUpperCase(),
        name: searchQuery.toUpperCase(),
        ...data
      });
      setIsSearchOpen(false);
      setSearchQuery('');
    } else {
      alert("Stock not found or API error.");
    }
    setLoading(false);
  };

  const isPositive = activeSymbol.change >= 0;
  const color = isPositive ? '#10B981' : '#EF4444'; 

  return (
    <div className="flex flex-col h-full bg-background text-primary font-sans animate-fade-in overflow-y-auto">
      <div className="max-w-[1400px] mx-auto w-full px-6 py-8">
        
        {/* Header Section */}
        <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
                <BarChart3 className="w-7 h-7 text-[#21808D]" />
                <h1 className="text-3xl font-medium tracking-tight text-primary">Finance</h1>
            </div>
            
            <div className="flex items-center gap-3">
                {isSearchOpen ? (
                     <form onSubmit={handleSearchStock} className="relative animate-in fade-in slide-in-from-right-2">
                        <input 
                            autoFocus
                            type="text" 
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            onBlur={() => !searchQuery && setIsSearchOpen(false)}
                            placeholder="Enter symbol (e.g. AAPL, BTC-USD)" 
                            className="bg-surface border border-border rounded-full px-4 py-2 text-sm w-72 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                        />
                    </form>
                ) : (
                    <button 
                        onClick={() => setIsSearchOpen(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-surface hover:bg-surface-hover border border-border rounded-full text-sm font-medium transition-colors group"
                    >
                        <Search className="w-4 h-4 text-muted group-hover:text-primary" />
                        <span>Search stocks</span>
                    </button>
                )}
                <button 
                    onClick={() => window.location.reload()}
                    className="p-2 text-muted hover:text-primary transition-colors hover:bg-surface-hover rounded-full"
                >
                    <RefreshCcw className="w-5 h-5" />
                </button>
            </div>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-3 mb-8">
            <button 
                onClick={() => setActiveTab('stocks')}
                className={`px-5 py-2.5 rounded-full text-sm font-medium flex items-center gap-2 transition-all ${
                    activeTab === 'stocks' 
                        ? 'bg-[#21808D]/10 text-[#21808D] border border-[#21808D]/20' 
                        : 'bg-surface/50 text-muted hover:text-primary hover:bg-surface border border-transparent'
                }`}
            >
                <LayoutGrid className="w-4 h-4" /> Stocks
            </button>
            <button 
                onClick={() => {
                    setActiveTab('crypto');
                    setActiveSymbol({ symbol: 'BTC-USD', name: 'Bitcoin', price: 64000, change: 0 });
                }}
                className={`px-5 py-2.5 rounded-full text-sm font-medium flex items-center gap-2 transition-all ${
                    activeTab === 'crypto' 
                        ? 'bg-[#21808D]/10 text-[#21808D] border border-[#21808D]/20' 
                        : 'bg-surface/50 text-muted hover:text-primary hover:bg-surface border border-transparent'
                }`}
            >
                <Coins className="w-4 h-4" /> Crypto
            </button>
            <button 
                onClick={() => setActiveTab('predict')}
                className={`px-5 py-2.5 rounded-full text-sm font-medium flex items-center gap-2 transition-all ${
                    activeTab === 'predict' 
                        ? 'bg-[#21808D]/10 text-[#21808D] border border-[#21808D]/20' 
                        : 'bg-surface/50 text-muted hover:text-primary hover:bg-surface border border-transparent'
                }`}
            >
                <Target className="w-4 h-4" /> Predict
            </button>
        </div>

        {/* Market Overview Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {indices.map((idx) => (
                <div 
                    key={idx.symbol}
                    onClick={() => setActiveSymbol(idx)}
                    className={`
                        p-5 rounded-2xl border transition-all duration-200 cursor-pointer relative overflow-hidden group
                        ${activeSymbol.symbol === idx.symbol 
                            ? 'bg-surface border-[#21808D]/50 shadow-sm ring-1 ring-[#21808D]/20' 
                            : 'bg-surface border-border hover:border-border/80 shadow-elegant'}
                    `}
                >
                    <div className="flex items-center gap-2 mb-4 text-muted">
                        <TrendingUp className="w-4 h-4" />
                        <span className="text-xs font-medium uppercase tracking-wider">{idx.name}</span>
                    </div>
                    
                    <div className="text-2xl font-semibold text-primary mb-2 font-mono tabular-nums">
                        {idx.price > 0 ? idx.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '---'}
                    </div>
                    
                    <div className={`flex items-center gap-2 text-sm font-medium ${idx.change >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                        {idx.change >= 0 ? <ArrowUp className="w-4 h-4" /> : <ArrowDown className="w-4 h-4" />}
                        <span>{idx.change > 0 ? '+' : ''}{idx.change}%</span>
                        <span className="opacity-60 font-mono">({idx.changeAbs > 0 ? '+' : ''}{idx.changeAbs})</span>
                    </div>
                </div>
            ))}
        </div>

        {/* Main Chart Card */}
        <div className="w-full bg-surface border border-border rounded-3xl p-6 md:p-8 mb-10 relative shadow-elegant overflow-hidden">
             {loading && (
                 <div className="absolute inset-0 bg-background/40 backdrop-blur-[1px] z-20 flex items-center justify-center">
                    <Loader2 className="w-8 h-8 animate-spin text-[#21808D]" />
                 </div>
             )}

             {/* Card Header */}
             <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-[#21808D]/10 flex items-center justify-center">
                        <Cpu className="w-6 h-6 text-[#21808D]" />
                    </div>
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <h2 className="text-xl font-bold text-primary">{activeSymbol.name}</h2>
                            <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-[#21808D]/5 text-[#21808D] border border-[#21808D]/20 uppercase">
                                {activeSymbol.symbol}
                            </span>
                        </div>
                        <div className="flex items-baseline gap-3">
                             <span className="text-3xl font-mono font-medium tracking-tight text-primary tabular-nums">
                                ${(hoverData?.value || activeSymbol.price).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                             </span>
                             <div className={`flex items-center gap-1 text-sm font-medium px-2 py-0.5 rounded-full ${
                                 isPositive ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'
                             }`}>
                                {isPositive ? <ArrowUp className="w-3.5 h-3.5" /> : <ArrowDown className="w-3.5 h-3.5" />}
                                {Math.abs(activeSymbol.change)}%
                             </div>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-4 w-full md:w-auto">
                    <button 
                        onClick={() => setIsSearchOpen(true)}
                        className="ml-auto md:ml-0 flex items-center gap-2 px-4 py-2 bg-background hover:bg-surface-hover border border-border rounded-lg text-sm font-medium transition-colors"
                    >
                        <RefreshCcw className="w-4 h-4 text-muted" />
                        Change Stock
                    </button>
                </div>
             </div>

             {/* Chart Controls & Visualization */}
             <div className="space-y-6">
                {/* Time Periods */}
                <div className="flex gap-2 pb-4 border-b border-border/40">
                    {PERIODS.map(p => (
                        <button
                            key={p}
                            onClick={() => setPeriod(p)}
                            className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${
                                period === p 
                                    ? 'text-primary font-bold' 
                                    : 'text-muted hover:text-primary'
                            }`}
                        >
                            {p}
                        </button>
                    ))}
                    <div className="ml-auto flex items-center gap-1.5">
                        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                        <span className="text-[10px] font-bold text-muted uppercase tracking-widest">Live Market Data</span>
                    </div>
                </div>

                {/* The Chart */}
                <div className="h-[400px] w-full relative group">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart 
                            data={chartData} 
                            onMouseMove={(data) => {
                                if (data.activePayload) {
                                    setHoverData(data.activePayload[0].payload);
                                }
                            }}
                            onMouseLeave={() => setHoverData(null)}
                            margin={{ top: 10, right: 0, left: 0, bottom: 0 }}
                        >
                            <defs>
                                <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor={color} stopOpacity={0.25}/>
                                    <stop offset="95%" stopColor={color} stopOpacity={0}/>
                                </linearGradient>
                            </defs>
                            <CartesianGrid 
                                strokeDasharray="3 3" 
                                stroke="var(--border)" 
                                opacity={0.1} 
                                vertical={false} 
                            />
                            <XAxis 
                                dataKey="displayTime" 
                                hide={false}
                                axisLine={false} 
                                tickLine={false}
                                tick={{ fill: 'var(--text-secondary)', fontSize: 11 }}
                                minTickGap={50}
                            />
                            <YAxis 
                                domain={['auto', 'auto']} 
                                orientation="right" 
                                tick={{ fill: 'var(--text-secondary)', fontSize: 11, fontFamily: 'monospace' }}
                                tickLine={false}
                                axisLine={false}
                                tickFormatter={(val) => val.toFixed(0)}
                                width={60}
                            />
                            <Tooltip 
                                content={() => null} 
                                cursor={{ stroke: 'var(--text-secondary)', strokeWidth: 1, strokeDasharray: '4 4' }}
                            />
                            <Area 
                                type="monotone" 
                                dataKey="value" 
                                stroke={color} 
                                strokeWidth={2.5}
                                fillOpacity={1} 
                                fill="url(#colorValue)" 
                                animationDuration={1000}
                                isAnimationActive={false}
                            />
                            {hoverData && (
                                <ReferenceLine x={hoverData.displayTime} stroke="var(--border)" strokeDasharray="3 3" />
                            )}
                        </AreaChart>
                    </ResponsiveContainer>

                    {/* Floating Tooltip */}
                    {hoverData && (
                        <div className="absolute top-0 right-[70px] bg-background/90 backdrop-blur border border-border px-4 py-2 rounded-xl shadow-lg pointer-events-none z-10 animate-in fade-in duration-200">
                            <div className="flex flex-col gap-1">
                                <span className="text-[10px] text-muted font-bold uppercase">{hoverData.displayTime}</span>
                                <span className="text-lg font-mono font-medium text-primary tabular-nums">
                                    ${hoverData.value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                </span>
                            </div>
                        </div>
                    )}
                </div>
             </div>
        </div>

        {/* News Section */}
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="flex items-center gap-3 mb-6">
                <div className="p-1.5 bg-surface rounded-md border border-border">
                    <Clock className="w-4 h-4 text-[#21808D]" />
                </div>
                <h3 className="text-lg font-bold text-primary">Financial Intelligence</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {news.map((item, idx) => (
                    <a 
                        key={idx}
                        href={item.link}
                        target="_blank"
                        rel="noreferrer"
                        className="group flex flex-col h-full bg-surface border border-border rounded-xl p-5 hover:bg-surface-hover transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5"
                    >
                        <div className="flex items-start justify-between gap-3 mb-4">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-muted bg-background px-2.5 py-1 rounded border border-border">
                                {item.displayLink}
                            </span>
                            <span className="text-[10px] text-muted whitespace-nowrap">
                                {item.publishedDate || 'Market Update'}
                            </span>
                        </div>
                        
                        <h4 className="text-[15px] font-bold text-primary leading-snug mb-2 group-hover:text-[#21808D] transition-colors line-clamp-2">
                            {item.title}
                        </h4>
                        
                        <p className="text-sm text-muted leading-relaxed line-clamp-3 mb-5 flex-1">
                            {item.snippet}
                        </p>

                        <div className="flex items-center gap-3 mt-auto pt-4 border-t border-border/50">
                            {item.image ? (
                                <img src={item.image} className="w-8 h-8 rounded-lg object-cover" alt="" />
                            ) : (
                                <div className="w-8 h-8 rounded-lg bg-[#21808D]/10 flex items-center justify-center">
                                    <TrendingUp className="w-4 h-4 text-[#21808D]" />
                                </div>
                            )}
                            <span className="text-xs font-semibold text-muted group-hover:text-primary transition-colors">Read Full Insight</span>
                        </div>
                    </a>
                ))}
            </div>
        </div>

      </div>
    </div>
  );
};
