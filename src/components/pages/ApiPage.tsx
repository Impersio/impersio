
import { ArrowLeft, Key, Code, Zap } from 'lucide-react';

interface ApiPageProps {
  onBack: () => void;
}

export default function ApiPage({ onBack }: ApiPageProps) {
  return (
    <div className="flex-1 overflow-y-auto w-full bg-background relative animate-fade-in">
      <div className="absolute top-4 left-4 z-10 flex gap-2">
         <button onClick={onBack} className="p-2 border border-border rounded-lg bg-surface hover:bg-surface-hover transition-colors">
            <ArrowLeft className="w-5 h-5 text-muted-foreground" />
         </button>
      </div>
      
      <div className="max-w-4xl mx-auto px-6 py-24 flex flex-col items-center justify-center min-h-[80vh] text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 text-xs font-medium bg-[#1c7483]/10 text-[#1c7483] rounded-full mb-8">
          <Zap className="w-3.5 h-3.5" /> Impersio AI API
        </div>
        
        <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6 font-sans">
          Build the future of <br className="hidden md:block"/> 
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-foreground to-[#1c7483]">AI Search</span>
        </h1>
        
        <p className="text-muted-foreground text-lg md:text-xl max-w-2xl mb-12">
          Integrate the world's most advanced conversational search engine into your applications. Fast, reliable, and grounded in real-time knowledge.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-2xl mb-16 text-left">
           <div className="p-6 bg-surface border border-border rounded-2xl">
              <Key className="w-6 h-6 text-[#1c7483] mb-4" />
              <h3 className="font-bold text-lg mb-2">High Volume Rate Limits</h3>
              <p className="text-muted text-sm">Scale your applications with enterprise-grade rate limits and reliable uptime SLA.</p>
           </div>
           <div className="p-6 bg-surface border border-border rounded-2xl">
              <Code className="w-6 h-6 text-[#1c7483] mb-4" />
              <h3 className="font-bold text-lg mb-2">Developer Friendly</h3>
              <p className="text-muted text-sm">REST API with comprehensive documentation, SDKs, and drop-in integration components.</p>
           </div>
        </div>

        <div className="bg-gradient-to-br from-[#1c7483]/20 to-transparent p-[1px] rounded-full overflow-hidden">
           <div className="bg-background px-8 py-3 rounded-full flex items-center justify-center gap-3">
              <span className="w-2 h-2 rounded-full bg-[#1c7483] animate-pulse"></span>
              <span className="font-mono text-sm tracking-widest uppercase">Coming Soon &amp; Join Waitlist</span>
           </div>
        </div>
        
        <div className="mt-8 flex gap-4 w-full flex-col sm:flex-row justify-center items-center">
            <input type="email" placeholder="jane@example.com" className="w-full sm:w-64 px-4 py-2 border border-border rounded-lg bg-surface focus:outline-none focus:ring-2 focus:ring-[#1c7483]" />
            <button className="px-6 py-2 bg-foreground text-background font-medium rounded-lg hover:bg-foreground/90 transition-colors">Join Waitlist</button>
        </div>
      </div>
    </div>
  );
}
