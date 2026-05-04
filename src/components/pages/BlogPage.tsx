
import { ArrowLeft, ArrowRight, Rss } from 'lucide-react';

interface BlogPageProps {
  onBack: () => void;
}

const POSTS = [
  {
    date: 'October 14, 2024',
    title: 'Welcome to Impersio AI',
    description: 'A new era of intelligent, conversational search has arrived. Learn what makes Impersio different from traditional search engines.',
    category: 'Company'
  },
  {
    date: 'November 2, 2024',
    title: 'Our Architecture: Speed meets Accuracy',
    description: 'Deep dive into how we handle real-time grounding, API integration, and latency to provide sub-second responses.',
    category: 'Engineering'
  },
  {
    date: 'January 15, 2025',
    title: 'The Future of the Impersio API',
    description: 'Announcing our upcoming developer API waitlist. Build AI-powered search directly into your own products.',
    category: 'Product'
  }
];

export default function BlogPage({ onBack }: BlogPageProps) {
  return (
    <div className="flex-1 overflow-y-auto w-full bg-background relative animate-fade-in">
      <div className="absolute top-4 left-4 z-10 flex gap-2">
         <button onClick={onBack} className="p-2 border border-border rounded-lg bg-surface hover:bg-surface-hover transition-colors">
            <ArrowLeft className="w-5 h-5 text-muted-foreground" />
         </button>
      </div>
      
      <div className="max-w-4xl mx-auto px-6 py-20 min-h-[80vh]">
        <div className="mb-16 mt-8 flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
                <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4 font-sans">
                  Impersio Blog
                </h1>
                <p className="text-xl text-muted-foreground max-w-xl leading-relaxed">
                  News, product updates, and engineering deep dives from the team.
                </p>
            </div>
            <button className="flex items-center gap-2 px-4 py-2 bg-surface border border-border rounded-lg text-sm font-medium hover:bg-surface-hover transition-colors w-fit">
                <Rss className="w-4 h-4" /> Subscribe
            </button>
        </div>

        <div className="space-y-12">
            {POSTS.map((post, i) => (
                <article key={i} className="group cursor-pointer">
                    <div className="flex flex-col md:flex-row gap-4 md:gap-12">
                        <div className="md:w-48 shrink-0">
                            <span className="text-sm font-medium text-muted">{post.date}</span>
                        </div>
                        <div>
                            <div className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-surface border border-border text-muted-foreground mb-3">
                                {post.category}
                            </div>
                            <h2 className="text-2xl font-bold tracking-tight mb-3 group-hover:text-[#1c7483] transition-colors">{post.title}</h2>
                            <p className="text-muted-foreground leading-relaxed mb-4">
                                {post.description}
                            </p>
                            <div className="flex items-center text-sm font-medium text-foreground group-hover:text-[#1c7483] transition-colors">
                                Read more <ArrowRight className="w-4 h-4 ml-1 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                            </div>
                        </div>
                    </div>
                    {i !== POSTS.length - 1 && <div className="h-[1px] w-full bg-border mt-12"></div>}
                </article>
            ))}
        </div>
      </div>
    </div>
  );
}
