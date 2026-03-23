import { useState, useEffect } from 'react';
import { Share, Download, Copy, RotateCw, ThumbsUp, ThumbsDown, MoreHorizontal } from 'lucide-react';

interface NewsItem {
  title: string;
  link: string;
  snippet: string;
  imageUrl?: string;
  source: string;
}

export const Discover = ({ onBack }: { onBack: () => void }) => {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNews = async (query: string) => {
      try {
        const response = await fetch('https://google.serper.dev/news', {
          method: 'POST',
          headers: {
            'X-API-KEY': import.meta.env.VITE_SERPER_API_KEY,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ q: query, num: 10 })
        });
        const data = await response.json();
        return data.news ? data.news.map((n: any) => ({
          title: n.title,
          link: n.link,
          snippet: n.snippet,
          imageUrl: n.imageUrl,
          source: n.source
        })) : [];
      } catch (error) {
        console.error(`Error fetching ${query} news:`, error);
        return [];
      }
    };

    const queries = ['openai', 'tech news', 'ai news', 'deepmindnews', 'perplexity news'];
    
    Promise.all(queries.map(q => fetchNews(q))).then(results => {
      const aggregatedNews = results.flat().filter(item => item.imageUrl);
      setNews(aggregatedNews);
    }).finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground font-sans">
      {/* Hero Section */}
      <header className="border-b border-border/50 bg-background/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-8 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-semibold tracking-tight text-foreground">Discover</h1>
            <p className="text-muted mt-2">Stay updated with the latest advancements in AI and tech.</p>
          </div>
          <div className="flex items-center gap-4">
            {/* Toolbar */}
            <div className="flex items-center gap-3 text-muted-foreground">
              <Share className="w-5 h-5 cursor-pointer hover:text-foreground" />
              <Download className="w-5 h-5 cursor-pointer hover:text-foreground" />
              <Copy className="w-5 h-5 cursor-pointer hover:text-foreground" />
              <RotateCw className="w-5 h-5 cursor-pointer hover:text-foreground" />
              <ThumbsUp className="w-5 h-5 cursor-pointer hover:text-foreground" />
              <ThumbsDown className="w-5 h-5 cursor-pointer hover:text-foreground" />
              <MoreHorizontal className="w-5 h-5 cursor-pointer hover:text-foreground" />
            </div>
            <button 
              onClick={onBack} 
              className="px-5 py-2.5 bg-foreground text-background hover:bg-foreground/90 rounded-full text-sm font-medium transition-all"
            >
              Back to Chat
            </button>
          </div>
        </div>
      </header>

      {/* Content Grid */}
      <main className="max-w-7xl mx-auto px-6 py-12">
        {loading ? (
          <div className="text-center text-muted py-20">Loading the latest insights...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {news.map((item, idx) => (
              <a 
                key={idx} 
                href={item.link} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="group bg-surface border border-border/50 rounded-2xl p-5 hover:border-foreground/20 transition-all flex flex-col gap-4 shadow-sm hover:shadow-md"
              >
                {item.imageUrl && (
                  <img 
                    src={item.imageUrl} 
                    alt={item.title} 
                    className="w-full h-48 object-cover rounded-xl" 
                    referrerPolicy="no-referrer" 
                  />
                )}
                <div className="flex flex-col gap-2">
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">{item.source}</span>
                  <h3 className="font-medium text-lg text-foreground leading-snug group-hover:text-indigo-600 transition-colors line-clamp-2">{item.title}</h3>
                  <p className="text-sm text-muted line-clamp-3">{item.snippet}</p>
                </div>
              </a>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};
