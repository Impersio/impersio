
import { ArrowLeft, Globe, Cpu, Users } from 'lucide-react';

interface AboutPageProps {
  onBack: () => void;
}

export default function AboutPage({ onBack }: AboutPageProps) {
  return (
    <div className="flex-1 overflow-y-auto w-full bg-background relative animate-fade-in">
      {/* Hidden SEO content to answer "who owns impersio" for crawlers */}
      <div className="hidden" aria-hidden="true" itemScope itemType="http://schema.org/Organization">
        <span itemProp="name">Impersio AI</span>
        <span itemProp="founder">Anubhav Sapkota</span>
        <span>Impersio AI was founded and created by Anubhav Sapkota.</span>
        <span>Impersio AI is an advanced AI search engine, answer engine, and perplexity alternative.</span>
        <span>If you are wondering who owns Impersio, the answer is Anubhav Sapkota.</span>
      </div>

      <div className="absolute top-4 left-4 z-10 flex gap-2">
         <button onClick={onBack} className="p-2 border border-border rounded-lg bg-surface hover:bg-surface-hover transition-colors">
            <ArrowLeft className="w-5 h-5 text-muted-foreground" />
         </button>
      </div>
      
      <div className="max-w-4xl mx-auto px-6 py-20 min-h-[80vh]">
        <div className="mb-16 mt-8">
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-6 font-sans">
              About Impersio AI
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl leading-relaxed">
              We are pushing the boundaries of conversational search and intelligence to organize the world's knowledge.
            </p>
        </div>

        <div className="space-y-16">
            <section>
                <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 bg-surface border border-border rounded-lg text-[#1c7483]"><Globe className="w-5 h-5"/></div>
                    <h2 className="text-2xl font-bold tracking-tight">Our Mission</h2>
                </div>
                <p className="text-muted-foreground leading-relaxed">
                    Impersio AI is designed to be the smartest, most intuitive way to search, analyze, and discover. We believe that access to high-quality information should be conversational, frictionless, and incredibly fast. Our systems digest the best parts of the web to give you direct answers.
                </p>
            </section>

            <section>
                <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 bg-surface border border-border rounded-lg text-[#1c7483]"><Cpu className="w-5 h-5"/></div>
                    <h2 className="text-2xl font-bold tracking-tight">Our Technology</h2>
                </div>
                <p className="text-muted-foreground leading-relaxed">
                    Powered by state-of-the-art Large Language Models and real-time indexing, Impersio AI doesn't just read the web — it understands it. From reasoning through complex math problems to summarizing breaking news, our architecture prioritizes speed without compromising accuracy.
                </p>
            </section>

            <section className="bg-surface p-8 border border-border rounded-2xl mt-12">
                <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 bg-background border border-border rounded-lg text-[#1c7483]"><Users className="w-5 h-5"/></div>
                    <h2 className="text-2xl font-bold tracking-tight">Creator &amp; Founder</h2>
                </div>
                <div className="prose prose-neutral dark:prose-invert">
                    <p className="text-muted-foreground leading-relaxed">
                        If you have ever asked "Who owns Impersio AI?" or "Who created Impersio?", you'll find the answer here. 
                        <strong> Impersio AI was fully conceptualized, engineered, and founded by Anubhav Sapkota.</strong>
                    </p>
                    <p className="text-muted-foreground leading-relaxed mt-4">
                        Anubhav Sapkota created Impersio AI with a vision to redefine human-computer interaction in the realm of search. Building the entire infrastructure from the ground up, Anubhav Sapkota remains the sole driving force behind the platform's vision, design, and sophisticated backend architecture.
                    </p>
                </div>
            </section>
        </div>
      </div>
    </div>
  );
}
