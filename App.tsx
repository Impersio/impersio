import React, { useState, useRef, useEffect } from 'react';
import { 
  Copy,
  Plus,
  ArrowRight,
  Sparkles,
  AlignLeft,
  MessageSquare,
  Zap,
  Check,
  Search,
  ArrowUp,
  Globe,
  Layers,
  Image as ImageIcon,
  PlayCircle,
  ChevronDown,
  Loader2
} from 'lucide-react';
import { streamResponse, generateCopilotStep } from './services/geminiService';
import { searchFast, searchMedia } from './services/googleSearchService';
import { authService } from './services/authService';
import { Message, ModelOption, User, CopilotPayload, SearchResult, CopilotEvent } from './types';
import { Discover } from './components/Discover';
import { About } from './components/About';
import { AuthModal } from './components/AuthModal';
import { SubscriptionModal } from './components/SubscriptionModal';
import { HistorySidebar } from './components/HistorySidebar';
import { AppSidebar } from './components/AppSidebar';
import { MessageContent } from './components/MessageContent';
import { useTheme } from './hooks/useTheme';
import { SidebarProvider, SidebarInset, SidebarTrigger } from './components/ui/sidebar';
import { 
  ImpersioLogo,
  ClaudeIcon,
  OpenAIIcon,
  GeminiIcon,
  CodeIcon,
  MetaIcon
} from './components/Icons';

const MODEL_OPTIONS: ModelOption[] = [
  { id: 'gemini-2.0-flash', name: 'Gemini 2.0 Flash', description: 'Fastest reasoning model by Google', icon: GeminiIcon },
  { id: 'gpt-4', name: 'GPT-4', description: 'Powerful model via Pollinations.AI', icon: OpenAIIcon },
  { id: 'llama-3.3-70b-groq', name: 'Llama 3.3 (Groq)', description: 'Ultra-fast via Groq', icon: MetaIcon },
  { id: 'llama-3.3-70b-openrouter', name: 'Llama 3.3 (OR)', description: 'Via OpenRouter', icon: MetaIcon },
  { id: 'sonar', name: 'Sonar', description: 'Fast model by Perplexity', icon: Zap },
  { id: 'claude-3-7-sonnet', name: 'Claude 3.7', description: 'Smart model by Anthropic', icon: ClaudeIcon },
  { id: 'deepseek-coder', name: 'DeepSeek', description: 'Code-focused model', icon: CodeIcon },
];

// --- Copilot Components ---

const CopilotProgress = ({ events }: { events: CopilotEvent[] }) => {
    return (
        <div className="flex flex-col gap-4 py-2 animate-fade-in w-full">
            {events.map((event) => (
                <div key={event.id} className="flex items-start gap-3">
                    <div className="mt-0.5 shrink-0">
                        {event.status === 'loading' && <Loader2 className="w-4 h-4 text-[#21808D] animate-spin" />}
                        {event.status === 'completed' && <Check className="w-4 h-4 text-[#21808D]" />}
                        {event.status === 'pending' && <div className="w-4 h-4 rounded-full border border-border" />}
                    </div>
                    <div className="flex flex-col gap-1.5 min-w-0">
                        <span className={`text-sm font-medium ${event.status === 'completed' ? 'text-primary' : 'text-muted'} transition-colors duration-300`}>
                            {event.message}
                        </span>
                        {/* Show items like search queries in a clean pill layout */}
                        {event.items && event.items.length > 0 && (
                            <div className="flex flex-wrap gap-2 animate-in slide-in-from-top-2 fade-in duration-300">
                                {event.items.map((item, i) => (
                                    <span key={i} className="text-xs bg-surface border border-border/60 text-muted px-2.5 py-1 rounded-md">
                                        {item}
                                    </span>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            ))}
        </div>
    );
};

const CopilotWidget = ({ 
    step, 
    onAnswer 
}: { 
    step: CopilotPayload, 
    onAnswer: (ans: string) => void 
}) => {
    const [input, setInput] = useState('');
    const [selected, setSelected] = useState<string[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = () => {
        setIsSubmitting(true);
        if (step.type === 'selection') {
            onAnswer(selected.join(', '));
        } else {
            onAnswer(input);
        }
    };

    const handleSkip = () => {
        setIsSubmitting(true);
        onAnswer("Skip");
    };

    return (
        <div className="w-full bg-surface border border-border rounded-xl p-6 my-4 animate-in fade-in slide-in-from-bottom-4 duration-500 shadow-sm font-sans">
            <h3 className="text-[15px] font-medium text-primary mb-5 leading-relaxed">{step.question}</h3>
            
            {step.type === 'text' && (
                <input 
                    type="text" 
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Type your answer..."
                    className="w-full bg-background border border-border rounded-lg px-4 py-3 text-primary text-sm focus:outline-none focus:border-[#21808D] focus:ring-1 focus:ring-[#21808D]/20 mb-6 placeholder:text-muted/60 transition-all"
                    autoFocus
                    onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
                />
            )}

            {step.type === 'selection' && step.options && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
                    {step.options.map((opt) => (
                        <button
                            key={opt}
                            onClick={() => setSelected(prev => 
                                prev.includes(opt) ? prev.filter(p => p !== opt) : [...prev, opt]
                            )}
                            className={`flex items-center gap-3 px-3.5 py-3 rounded-lg border text-sm text-left transition-all duration-200 ${
                                selected.includes(opt) 
                                    ? 'bg-[#21808D]/5 border-[#21808D] text-primary' 
                                    : 'bg-transparent border-transparent hover:bg-surface-hover text-muted hover:text-primary'
                            }`}
                        >
                            <div className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 transition-colors ${
                                selected.includes(opt) ? 'bg-[#21808D] border-[#21808D]' : 'border-muted/50'
                            }`}>
                                {selected.includes(opt) && <Check className="w-3 h-3 text-white" />}
                            </div>
                            <span className="truncate">{opt}</span>
                        </button>
                    ))}
                </div>
            )}

            <div className="flex items-center gap-2">
                <button 
                    onClick={handleSubmit}
                    disabled={isSubmitting || (step.type === 'text' && !input) || (step.type === 'selection' && selected.length === 0)}
                    className="px-4 py-2 bg-[#21808D] hover:bg-[#1A6A76] disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg text-sm font-medium transition-colors"
                >
                    Continue
                </button>
                <button 
                    onClick={handleSkip}
                    disabled={isSubmitting}
                    className="px-4 py-2 bg-surface-hover hover:bg-border text-primary rounded-lg text-sm font-medium transition-colors"
                >
                    Skip
                </button>
            </div>
        </div>
    );
};

interface MessageItemProps {
  msg: Message;
  isLast: boolean;
  isLoading: boolean;
  onCopilotAnswer: (ans: string) => void;
}

const MessageItem: React.FC<MessageItemProps> = ({ 
  msg, 
  isLast, 
  isLoading,
  onCopilotAnswer
}) => {
  // --- USER MESSAGE ---
  if (msg.role === 'user') {
    return (
      <div className="w-full max-w-5xl mx-auto pt-10 pb-6 px-4 md:px-8 animate-fade-in">
         <h1 className="text-[32px] md:text-[36px] font-medium text-primary font-serif tracking-tight leading-[1.2]">
            {msg.content}
         </h1>
      </div>
    );
  }

  // --- COPILOT ACTIVE FLOW (Centered) ---
  if (msg.isCopilotActive) {
      return (
          <div className="w-full max-w-2xl mx-auto px-6 pb-12 pt-4">
              <div className="flex items-center gap-2 mb-6 text-primary font-medium opacity-90">
                   <Sparkles className="w-4 h-4 text-[#21808D]" />
                   <span>Copilot</span>
              </div>
              
              {/* Progress Log */}
              {msg.copilotEvents && <CopilotProgress events={msg.copilotEvents} />}

              {/* Widget (Only show if not searching yet) */}
              {msg.copilotStep && !msg.copilotEvents?.some(e => e.message === 'Searching web') && (
                  <CopilotWidget step={msg.copilotStep} onAnswer={onCopilotAnswer} />
              )}
          </div>
      );
  }

  // --- RESULT LAYOUT (Pro Search Style - Centered with Sidebar) ---
  return (
      <div className="w-full max-w-5xl mx-auto pb-16 px-4 md:px-8 animate-fade-in pt-6">
        
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-12">
            
            {/* LEFT COLUMN: Main Content */}
            <div className="min-w-0 flex flex-col gap-8">
                
                {/* Collapsed Copilot Status */}
                {msg.copilotEvents && msg.copilotEvents.length > 0 && (
                     <div className="flex items-center justify-between py-2.5 px-4 bg-surface/50 border border-border/60 rounded-lg max-w-md">
                        <div className="flex items-center gap-2 text-primary/80 font-medium text-sm">
                            <Check className="w-3.5 h-3.5 text-[#21808D]" />
                            <span>Researched with Copilot</span>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-muted">
                            <span>{msg.copilotEvents.length} steps</span>
                            <ChevronDown className="w-3.5 h-3.5" />
                        </div>
                    </div>
                )}

                {/* Loading State */}
                {isLoading && isLast && !msg.content && (
                    <div className="flex items-center gap-3 text-primary font-medium pl-1">
                        <div className="w-4 h-4 flex items-center justify-center">
                             <Loader2 className="w-4 h-4 animate-spin text-[#21808D]" />
                        </div>
                        <span className="text-base font-sans text-primary/80">Generating answer...</span>
                    </div>
                )}

                {/* Sources - Grid */}
                {msg.sources && msg.sources.length > 0 && (
                    <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
                        <div className="flex items-center gap-2 mb-3 text-primary">
                            <AlignLeft className="w-4 h-4 text-muted" />
                            <h3 className="text-sm font-medium font-sans text-muted uppercase tracking-wide">Sources</h3>
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                            {msg.sources.slice(0, 4).map((source, idx) => (
                                <a 
                                    key={idx}
                                    href={source.link}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="flex flex-col p-3 rounded-lg bg-surface hover:bg-surface-hover border border-border transition-all h-[72px] justify-between group"
                                >
                                    <div className="text-xs font-medium text-primary line-clamp-2 leading-snug font-sans group-hover:text-[#21808D] transition-colors">
                                        {source.title}
                                    </div>
                                    <div className="flex items-center gap-2 mt-1">
                                        <div className="w-3.5 h-3.5 rounded-full bg-border/50 overflow-hidden shrink-0">
                                            <img 
                                                src={`https://www.google.com/s2/favicons?domain=${new URL(source.link).hostname}&sz=32`}
                                                className="w-full h-full object-cover opacity-80"
                                                onError={(e) => (e.target as HTMLImageElement).style.display = 'none'}
                                                alt=""
                                            />
                                        </div>
                                        <div className="text-[10px] text-muted truncate">
                                            {source.displayLink}
                                        </div>
                                    </div>
                                </a>
                            ))}
                        </div>
                    </div>
                )}

                {/* Answer Content */}
                {msg.content && (
                    <div className="min-h-[20px] animate-in fade-in slide-in-from-bottom-2 duration-700 delay-100">
                        <div className="flex items-center gap-2 mb-2 text-primary">
                            <AlignLeft className="w-4 h-4 text-[#21808D]" />
                            <h3 className="text-lg font-medium font-sans">Answer</h3>
                        </div>
                        <MessageContent 
                            content={msg.content} 
                            isStreaming={isLast && isLoading} 
                            sources={msg.sources}
                        />
                    </div>
                )}

                {/* Related Questions */}
                {msg.relatedQuestions && msg.relatedQuestions.length > 0 && (
                    <div className="pt-6 border-t border-border mt-2 animate-in fade-in slide-in-from-bottom-2 duration-700 delay-200">
                        <div className="flex items-center gap-2 mb-4 text-primary">
                            <Layers className="w-4 h-4 text-muted" />
                            <h3 className="text-sm font-medium font-sans text-muted uppercase tracking-wide">Related</h3>
                        </div>
                        <div className="flex flex-col gap-1">
                            {msg.relatedQuestions.map((q, idx) => (
                                <div 
                                key={idx} 
                                className="flex items-center justify-between py-3 px-2 rounded-lg hover:bg-surface-hover cursor-pointer group transition-colors border border-transparent hover:border-border/50"
                                onClick={() => { /* Handle click */ }}
                                >
                                    <span className="text-primary/90 font-medium text-[15px]">{q}</span>
                                    <Plus className="w-4 h-4 text-muted group-hover:text-primary transition-transform group-hover:rotate-90" />
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* RIGHT COLUMN: Media Gallery & Widgets */}
            <div className="flex flex-col gap-6 pt-1">
                
                {/* Images Section */}
                {msg.images && msg.images.length > 0 && (
                     <div className="animate-in fade-in slide-in-from-right-4 duration-500">
                        <div className="flex items-center gap-2 mb-3">
                             <ImageIcon className="w-4 h-4 text-muted" />
                             <span className="text-xs font-medium text-muted uppercase tracking-wide">Images</span>
                        </div>
                        <div className="grid grid-cols-2 gap-2.5">
                            {/* Featured large image */}
                            {msg.images[0] && (
                                <div className="col-span-2 aspect-video rounded-xl overflow-hidden border border-border bg-surface-hover relative group cursor-pointer shadow-sm">
                                    <img 
                                        src={msg.images[0].image} 
                                        alt={msg.images[0].title}
                                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                                </div>
                            )}
                            {/* Smaller images */}
                            {msg.images.slice(1, 3).map((img, idx) => (
                                <div key={idx} className="aspect-square rounded-xl overflow-hidden border border-border bg-surface-hover relative group cursor-pointer shadow-sm">
                                     <img 
                                        src={img.image} 
                                        alt={img.title}
                                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                    />
                                </div>
                            ))}
                        </div>
                     </div>
                )}

                {/* Videos Section */}
                {msg.videos && msg.videos.length > 0 && (
                     <div className="animate-in fade-in slide-in-from-right-4 duration-700 delay-100">
                        <div className="flex items-center gap-2 mb-3">
                             <PlayCircle className="w-4 h-4 text-muted" />
                             <span className="text-xs font-medium text-muted uppercase tracking-wide">Videos</span>
                        </div>
                        <div className="flex flex-col gap-3">
                             {msg.videos.slice(0, 3).map((vid, idx) => (
                                 <a 
                                    key={idx}
                                    href={vid.link}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="flex gap-3 p-2.5 rounded-xl bg-surface hover:bg-surface-hover border border-border transition-colors group shadow-sm"
                                 >
                                     <div className="w-24 h-14 rounded-lg bg-black/10 overflow-hidden relative shrink-0">
                                         {vid.image ? (
                                             <img src={vid.image} className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity" alt="" />
                                         ) : (
                                             <div className="w-full h-full flex items-center justify-center bg-gray-800">
                                                 <PlayCircle className="w-6 h-6 text-white/50" />
                                             </div>
                                         )}
                                         <div className="absolute inset-0 flex items-center justify-center">
                                             <div className="w-6 h-6 rounded-full bg-black/50 flex items-center justify-center backdrop-blur-sm">
                                                <PlayCircle className="w-3 h-3 text-white fill-current" />
                                             </div>
                                         </div>
                                     </div>
                                     <div className="flex flex-col justify-center min-w-0">
                                         <span className="text-xs font-medium text-primary line-clamp-2 leading-snug group-hover:text-[#21808D] transition-colors">
                                             {vid.title}
                                         </span>
                                         <span className="text-[10px] text-muted mt-1">YouTube</span>
                                     </div>
                                 </a>
                             ))}
                        </div>
                     </div>
                )}

            </div>
        </div>

      </div>
  );
};

export default function App() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [query, setQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isCopilotMode, setIsCopilotMode] = useState(false);
  const [selectedModel, setSelectedModel] = useState<ModelOption>(MODEL_OPTIONS[0]);
  
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const [view, setView] = useState<'home' | 'discover' | 'about'>('home');
  const [user, setUser] = useState<User | null>(null);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isSubscriptionModalOpen, setIsSubscriptionModalOpen] = useState(false);

  const { theme, setTheme } = useTheme();

  useEffect(() => {
    setUser(authService.getCurrentUser());
  }, []);

  useEffect(() => {
    if (messagesEndRef.current) {
        messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages.length, messages[messages.length-1]?.content, messages[messages.length-1]?.copilotEvents]);

  // Handle Search Initiation
  const handleSearch = async (overrideQuery?: string) => {
    const finalQuery = overrideQuery || query;
    if (!finalQuery.trim() || isLoading) return;

    setIsLoading(true);
    setQuery(''); 
    
    if (textareaRef.current) textareaRef.current.style.height = 'auto';

    if (!hasSearched) setHasSearched(true);

    // 1. Setup new user message
    const userMsg: Message = { role: 'user', content: finalQuery };
    
    // 2. Setup Assistant message placeholder
    // If Copilot is ON, we start with isCopilotActive = true and initial events
    const initialEvents: CopilotEvent[] = isCopilotMode ? [
        { id: '1', message: 'Understanding question', status: 'loading' }
    ] : [];

    const assistantMsg: Message = { 
        role: 'assistant', 
        content: '', 
        sources: [], 
        images: [], 
        videos: [],
        isCopilotActive: isCopilotMode,
        copilotEvents: initialEvents
    };

    setMessages(prev => [...prev, userMsg, assistantMsg]);
    
    const currentHistory = [...messages, userMsg];

    try {
        if (isCopilotMode) {
             // --- COPILOT FLOW PHASE 1: UNDERSTANDING ---
             
             // Simulate "Understanding" delay for UX
             await new Promise(r => setTimeout(r, 1200));
             
             // Try to generate a Copilot Widget
             const copilotStep = await generateCopilotStep(finalQuery);
             
             if (copilotStep) {
                 // --- WIDGET DETECTED ---
                 // Update state: Understanding complete, waiting for widget interaction
                 setMessages(prev => {
                     const newMsgs = [...prev];
                     const last = newMsgs[newMsgs.length - 1];
                     if (last) {
                         last.copilotEvents = [
                             { id: '1', message: 'Understanding question', status: 'completed' }
                         ];
                         last.copilotStep = copilotStep;
                     }
                     return newMsgs;
                 });
                 
                 // STOP here. Wait for handleCopilotAnswer to trigger the next phase.
                 setIsLoading(false); 
                 return;
             } 
             
             // If no widget needed (e.g. simple query), proceed directly to search
             // Update state: Understanding complete -> Searching
             setMessages(prev => {
                const newMsgs = [...prev];
                const last = newMsgs[newMsgs.length - 1];
                if (last) {
                    last.copilotEvents = [
                        { id: '1', message: 'Understanding question', status: 'completed' },
                        { id: '2', message: 'Searching web', status: 'loading' }
                    ];
                }
                return newMsgs;
             });
        }

        // --- STANDARD / SEARCH EXECUTION ---
        await executeSearch(finalQuery, currentHistory);

    } catch (e) {
        console.error(e);
        setIsLoading(false);
    }
  };

  const executeSearch = async (searchQuery: string, history: Message[]) => {
      setIsLoading(true);
      
      let results: SearchResult[] = [];
      let images: SearchResult[] = [];
      let videos: SearchResult[] = [];

      try {
          // ALWAYS fetch media alongside text for better UX (Elon Musk images etc.)
          const [textRes, mediaRes] = await Promise.all([
              searchFast(searchQuery),
              searchMedia(searchQuery)
          ]);
          
          results = textRes.results;
          images = mediaRes.images;
          videos = mediaRes.videos;
      } catch (e) {
          console.warn("Search failed", e);
      }
      
      // Update state with results and complete the "Searching" event
      setMessages(prev => {
          const newMsgs = [...prev];
          const last = newMsgs[newMsgs.length - 1];
          if (last) {
              last.sources = results;
              last.images = images;
              last.videos = videos;
              
              // If we were in copilot mode, finalize the events
              if (last.isCopilotActive) {
                  const newEvents = last.copilotEvents?.map(e => 
                      e.message === 'Searching web' ? { ...e, status: 'completed' as const } : e
                  ) || [];
                  
                  // If we skipped the widget, we might not have the "Searching" event yet in the log, add it.
                  if (!newEvents.some(e => e.message === 'Searching web') && isCopilotMode) {
                      newEvents.push({ id: '2', message: 'Searching web', status: 'completed' });
                  }
                  
                  last.copilotEvents = newEvents;
                  last.isCopilotActive = false; // Transition to final answer view
              }
          }
          return newMsgs;
      });

      await streamResponse(
          searchQuery,
          selectedModel.id, 
          history.slice(-6),
          results,
          [],
          false,
          false,
          (chunk) => {
              setMessages(prev => {
                  const newMsgs = [...prev];
                  const last = newMsgs[newMsgs.length - 1];
                  if (last) last.content = chunk;
                  return newMsgs;
              });
          },
          () => {},
          (related) => {
              setMessages(prev => {
                  const newMsgs = [...prev];
                  const last = newMsgs[newMsgs.length - 1];
                  if (last) last.relatedQuestions = related;
                  return newMsgs;
              });
          },
          undefined,
          undefined,
          (sources) => {
               // Update sources if they come late (Google Search Tool)
               setMessages(prev => {
                  const newMsgs = [...prev];
                  const last = newMsgs[newMsgs.length - 1];
                  if (last && (!last.sources || last.sources.length === 0)) {
                      last.sources = sources;
                  }
                  return newMsgs;
              });
          }
      );
      
      setIsLoading(false);
  };

  const handleCopilotAnswer = async (answer: string) => {
      const currentMsgs = [...messages];
      const userQuery = currentMsgs[currentMsgs.length - 2].content;
      const refinedQuery = `${userQuery} ${answer}`;
      
      // Update the UI: Show "Searching web" loading state with the user's choice
      setMessages(prev => {
          const newMsgs = [...prev];
          const last = newMsgs[newMsgs.length - 1];
          if (last && last.copilotEvents) {
              last.copilotEvents = [
                  ...last.copilotEvents,
                  { id: '2', message: 'Searching web', status: 'loading', items: [answer !== 'Skip' ? answer : userQuery] }
              ];
          }
          return newMsgs;
      });

      setIsLoading(true);
      
      // Execute search reusing the assistant message bubble
      // We pass the history excluding the current assistant bubble to avoid dups
      const historyForGen = currentMsgs.slice(0, -1);
      
      await executeSearch(refinedQuery, historyForGen);
  };

  const renderInputBar = (isInitial: boolean) => {
    return (
        <div className={`w-full max-w-3xl mx-auto relative z-30 ${isInitial ? '' : 'pb-6'}`}>
          <div className={`
            relative flex items-center w-full bg-surface
            ${isInitial ? 'rounded-xl border border-border min-h-[120px] p-4 flex-col' : 'rounded-full border border-border px-4 py-2.5 shadow-sm hover:shadow-md'}
            transition-all duration-300
            focus-within:ring-1 focus-within:ring-border/50
          `}>
             <textarea
                ref={textareaRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSearch();
                    }
                }}
                placeholder={isInitial ? "Ask anything..." : "Ask follow-up..."}
                className={`w-full bg-transparent text-primary placeholder:text-muted/50 font-normal focus:outline-none resize-none overflow-hidden font-sans leading-relaxed
                    ${isInitial ? 'text-[18px] mb-auto px-1' : 'text-[16px] flex-1 py-1'}
                `}
                style={{ minHeight: isInitial ? '28px' : '24px' }}
                rows={1}
                autoFocus={isInitial}
              />
              
              {/* Controls */}
              <div className={`flex items-center gap-4 ${isInitial ? 'w-full justify-between mt-auto' : 'ml-2'}`}>
                  {isInitial && (
                      <div className="flex items-center gap-4 text-muted text-sm font-medium">
                         <button className="flex items-center gap-2 hover:text-primary transition-colors">
                            <Search className="w-4 h-4" /> Focus
                         </button>
                         <button className="flex items-center gap-2 hover:text-primary transition-colors">
                             <Plus className="w-4 h-4 rounded-full border border-current p-0.5" /> File
                         </button>
                      </div>
                  )}

                  <div className="flex items-center gap-3 ml-auto">
                        
                        {/* Copilot Toggle inside the search bar */}
                        <div 
                            className="flex items-center gap-2 cursor-pointer group select-none bg-surface-hover/50 px-2 py-1 rounded-full border border-transparent hover:border-border transition-all" 
                            onClick={() => setIsCopilotMode(!isCopilotMode)}
                        >
                            <div className={`
                                w-8 h-4.5 rounded-full relative transition-colors duration-200 ease-in-out
                                ${isCopilotMode ? 'bg-[#21808D]' : 'bg-border'}
                            `}>
                                <div className={`
                                    absolute top-0.5 left-0.5 w-3.5 h-3.5 rounded-full bg-white transition-transform duration-200 ease-in-out shadow-sm
                                    ${isCopilotMode ? 'translate-x-3.5' : 'translate-x-0'}
                                `} />
                            </div>
                            <span className={`text-xs font-medium ${isCopilotMode ? 'text-[#21808D]' : 'text-muted'}`}>Copilot</span>
                        </div>

                        {/* Divider */}
                        {!isInitial && <div className="h-5 w-[1px] bg-border mx-1"></div>}
                        
                        <button 
                            onClick={() => handleSearch()}
                            className={`flex items-center justify-center rounded-full transition-all duration-200 
                                ${isInitial ? 'w-8 h-8 bg-[#21808D] text-white' : 'w-8 h-8 bg-[#21808D] text-white hover:opacity-90'}
                                ${!query.trim() ? 'opacity-50 cursor-not-allowed' : 'opacity-100'}
                            `}
                            disabled={!query.trim()}
                        >
                            {isInitial ? <ArrowRight className="w-4 h-4" /> : <ArrowUp className="w-5 h-5" />}
                        </button>
                  </div>
              </div>
          </div>
        </div>
    );
  };

  return (
    <SidebarProvider>
      <div className={`min-h-screen bg-background text-primary font-sans selection:bg-[#21808D]/20 flex flex-row overflow-hidden w-full`}>
        <AppSidebar 
          currentView={view} 
          onNavigate={setView}
          onNewChat={() => { setMessages([]); setHasSearched(false); }}
          onToggleHistory={() => setIsHistoryOpen(true)}
          onSignIn={() => setIsAuthModalOpen(true)}
          onUpgrade={() => setIsSubscriptionModalOpen(true)}
          user={user}
          theme={theme}
          onToggleTheme={() => setTheme(theme === 'light' ? 'dark' : 'light')}
        />

        <HistorySidebar
          isOpen={isHistoryOpen}
          onClose={() => setIsHistoryOpen(false)}
          onSelectChat={() => {}}
          onNewChat={() => { setMessages([]); setHasSearched(false); }}
          userId={user?.id || ''}
          onSignIn={() => setIsAuthModalOpen(true)}
          onOpenAbout={() => setView('about')}
          theme={theme}
          onToggleTheme={() => setTheme(theme === 'light' ? 'dark' : 'light')}
        />

        <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
        <SubscriptionModal isOpen={isSubscriptionModalOpen} onClose={() => setIsSubscriptionModalOpen(false)} />

        <SidebarInset>
           <div className="absolute inset-0 flex flex-col min-w-0 overflow-hidden">
             <div className="md:hidden fixed top-3 left-3 z-50">
                 <SidebarTrigger />
             </div>

             {view === 'about' && <About onBack={() => setView('home')} />}
             {view === 'discover' && <Discover onBack={() => setView('home')} />}

             {view === 'home' && (
                <div className="flex-1 flex flex-col h-full relative">
                  {!hasSearched ? (
                    <div className="flex flex-col items-center justify-center p-4 w-full h-full animate-fade-in max-w-4xl mx-auto">
                        <div className="w-full max-w-2xl mb-8 flex flex-col items-center text-center">
                             <h1 className="text-[40px] md:text-[44px] font-normal text-primary font-serif tracking-tight text-[#111] dark:text-[#EEE]">
                                Where knowledge begins
                             </h1>
                        </div>
                        {renderInputBar(true)}
                    </div>
                  ) : (
                    <div className="flex-1 overflow-y-auto pb-44 pt-6 px-0 scroll-smooth">
                      <div className="flex flex-col w-full"> 
                        {messages.map((msg, idx) => (
                            <MessageItem 
                              key={idx}
                              msg={msg}
                              isLast={idx === messages.length - 1}
                              isLoading={isLoading}
                              onCopilotAnswer={handleCopilotAnswer}
                            />
                        ))}
                        <div ref={messagesEndRef} />
                      </div>
                    </div>
                  )}
                  {hasSearched && (
                    <div className="absolute bottom-0 left-0 w-full bg-gradient-to-t from-background via-background to-transparent pt-12 pb-0 z-20 px-4">
                        {renderInputBar(false)}
                    </div>
                  )}
                </div>
             )}
           </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}