
import React, { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { 
  ChevronDown, 
  ArrowUp,
  Sun,
  Moon,
  CornerDownRight,
  Copy,
  RotateCcw,
  Menu,
  X,
  Loader2,
  ThumbsUp,
  ThumbsDown,
  ArrowRight,
  HelpCircle,
  Plus,
  BookOpen,
  ChevronRight,
  Share,
  Download,
  MoreHorizontal,
  Check,
  FileText,
  Scale,
  Heart,
  Lightbulb,
  Search,
  DollarSign,
  Baby,
  Plane
} from 'lucide-react';
import { streamResponse, generateSearchQueries, generateManualQueries } from './services/geminiService';
import { searchWeb, searchFast } from './services/googleSearchService';
import { createConversation, saveMessage, getConversationMessages } from './services/chatStorageService';
import { supabase } from './services/supabaseClient';
import { Message, SearchResult, WidgetData, ModelOption } from './types';
import { Discover } from './components/Discover';
import { About } from './components/About';
import { TimeWidget } from './components/TimeWidget';
import { StockWidget } from './components/StockWidget';
import { WeatherWidget } from './components/WeatherWidget';
import { SlidesWidget } from './components/SlidesWidget';
import { AuthModal } from './components/AuthModal';
import { HistorySidebar } from './components/HistorySidebar';
import { MessageContent } from './components/MessageContent';
import { ModelSelector } from './components/ModelSelector';
import { 
  ReasoningIcon, 
  GeminiIcon, 
  MimoIcon, 
  OpenAIIcon, 
  MetaIcon, 
  KimiIcon, 
  QwenIcon,
  SearchIcon,
  TelescopeIcon,
  GridPlusIcon,
  GlobeIcon,
  CPUIcon,
  PaperclipIcon,
  MicIcon,
  SoundWaveIcon
} from './components/Icons';

// Model Options matching user request
const MODEL_OPTIONS: ModelOption[] = [
  { id: 'gemini-3-flash', name: 'Gemini 3.0', icon: GeminiIcon },
  { id: 'gemini-2.0-flash', name: 'Gemini 2.0', icon: GeminiIcon },
  { id: 'gpt-oss-120b', name: 'GPT-4o', icon: OpenAIIcon },
  { id: 'llama-4-maverick', name: 'Llama 3.3', icon: MetaIcon },
  { id: 'kimi-k2', name: 'Kimi K2', icon: KimiIcon },
  { id: 'qwen-3-32b', name: 'Qwen 2.5', icon: QwenIcon },
  { id: 'mimo-v2-flash', name: 'Mimo Flash', icon: MimoIcon },
];

const SKIP_SEARCH_REGEX = /^(hi|hello|hey|greetings|sup|howdy|yo|good\s*(morning|afternoon|evening|night)|how\s*are\s*you|who\s*are\s*you|what\s*is\s*your\s*name|help|test|what\s*can\s*you\s*do|what\s*are\s*your\s*features|capabilities|features)$/i;
const STORAGE_KEY = 'impersio_chat_state';

export const ImpersioLogo = ({ isMobile, compact = false }: { isMobile?: boolean; compact?: boolean }) => (
  <div className={`flex items-center gap-2 select-none transition-opacity duration-300 ${compact ? 'opacity-100' : ''}`}>
    <span className={`font-serif tracking-tight text-primary ${compact ? 'text-2xl' : (isMobile ? 'text-4xl' : 'text-6xl')}`}>
      perplexity
    </span>
  </div>
);

interface SourceCardProps {
  source: SearchResult;
  index: number;
}

const SourceCard: React.FC<SourceCardProps> = ({ source, index }) => (
  <a 
      href={source.link}
      target="_blank"
      rel="noreferrer"
      className="flex flex-col p-3 rounded-lg bg-surface hover:bg-surface-hover border border-border transition-all duration-200 group h-auto"
  >
      <div className="text-[12px] text-primary font-medium group-hover:text-scira-accent transition-colors line-clamp-2 leading-tight mb-2">{source.title}</div>
      <div className="flex items-center gap-2">
           <img 
              src={`https://www.google.com/s2/favicons?domain=${new URL(source.link).hostname}&sz=32`}
              className="w-3.5 h-3.5 rounded-full opacity-70 group-hover:opacity-100 transition-opacity"
              onError={(e) => (e.target as HTMLImageElement).style.display = 'none'}
          />
          <div className="text-[10px] text-muted truncate opacity-80">{source.displayLink}</div>
          <div className="text-[10px] text-muted/50 ml-auto">{index + 1}</div>
      </div>
  </a>
);

interface MessageItemProps {
  msg: Message;
  isLast: boolean;
  isLoading: boolean;
  onSearch: (q: string) => void;
  searchStatus: string;
}

const MessageItem: React.FC<MessageItemProps> = ({ 
  msg, 
  isLast, 
  isLoading, 
  onSearch,
  searchStatus
}) => {
  const [showSources, setShowSources] = useState(false);

  if (!msg) return null;

  // User Message (Right-aligned bubble per Perplexity style)
  if (msg.role === 'user') {
    return (
      <div className="w-full max-w-3xl mx-auto py-6 flex justify-end animate-fade-in px-4">
          <div className="bg-surface border border-border px-5 py-3 rounded-[2rem] rounded-tr-sm max-w-[85%] sm:max-w-[70%] text-primary font-normal text-lg leading-relaxed break-words">
            {msg.content}
            {msg.images && msg.images.length > 0 && (
              <div className="flex gap-2 mt-4 flex-wrap justify-end">
                {msg.images.map((img, i) => (
                  <img key={i} src={img} className="h-16 w-16 rounded-xl object-cover border border-border" />
                ))}
              </div>
            )}
          </div>
      </div>
    );
  }

  // Assistant Message
  return (
      <div className="w-full max-w-3xl mx-auto pb-8 animate-fade-in flex flex-col gap-4 px-4">
        
        {/* Main Content */}
        <div className="flex-1 min-w-0">
            
            {/* Thinking / Steps Indicator */}
            <div className="flex items-center gap-2 mb-4 text-xs text-muted/80 font-medium cursor-pointer hover:text-primary transition-colors select-none">
                 {isLoading && isLast && !msg.content ? (
                    <div className="flex items-center gap-2">
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>{searchStatus || "Thinking..."}</span>
                    </div>
                 ) : (
                    <div className="flex items-center gap-2">
                         <div className="flex items-center justify-center w-4 h-4 rounded-full bg-surface border border-border">
                            <Check className="w-2.5 h-2.5 text-primary" />
                         </div>
                         <span>1 step completed</span>
                         <ChevronRight className="w-3 h-3" />
                    </div>
                 )}
            </div>

            {/* Widgets */}
            {msg.widget && (
                <div className="mb-6">
                  {msg.widget.type === 'time' && <TimeWidget data={msg.widget.data} />}
                  {msg.widget.type === 'weather' && <WeatherWidget data={msg.widget.data} />}
                  {msg.widget.type === 'stock' && <StockWidget data={msg.widget.data} />}
                  {msg.widget.type === 'slides' && <SlidesWidget data={msg.widget.data} />}
                </div>
            )}

            {/* Images Carousel */}
            {msg.images && msg.images.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-6">
                    {msg.images.slice(0, 3).map((img, i) => (
                    <div key={i} className="aspect-video rounded-xl overflow-hidden bg-surface border border-border relative group">
                        <img 
                            src={img} 
                            alt={`Result ${i + 1}`} 
                            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" 
                            loading="lazy"
                        />
                    </div>
                    ))}
                </div>
            )}
            
            {/* Text Content */}
            <div className="prose prose-neutral dark:prose-invert max-w-none mb-2 leading-relaxed text-[17px] font-light text-primary/90">
                <MessageContent 
                  content={msg.content} 
                  isStreaming={isLast && isLoading} 
                />
            </div>

            {/* Action Bar (Exact Match) */}
            <div className="flex flex-wrap items-center justify-between gap-4 mt-6">
                
                {/* Left Actions */}
                <div className="flex items-center gap-1">
                    <button className="p-2 text-muted hover:text-primary transition-colors rounded-full hover:bg-surface-hover" title="Share">
                        <Share className="w-4 h-4" />
                    </button>
                    <button className="p-2 text-muted hover:text-primary transition-colors rounded-full hover:bg-surface-hover" title="Download">
                        <Download className="w-4 h-4" />
                    </button>
                    <button className="p-2 text-muted hover:text-primary transition-colors rounded-full hover:bg-surface-hover" title="Copy">
                        <Copy className="w-4 h-4" />
                    </button>
                    <button className="p-2 text-muted hover:text-primary transition-colors rounded-full hover:bg-surface-hover" title="Reload">
                        <RotateCcw className="w-4 h-4" />
                    </button>
                </div>

                {/* Center Sources (Overlapping) */}
                {msg.sources && msg.sources.length > 0 && (
                     <div className="flex items-center gap-3 group cursor-pointer" onClick={() => setShowSources(!showSources)}>
                        <div className="flex -space-x-2">
                           {msg.sources.slice(0, 3).map((s, i) => (
                              <div key={i} className="w-6 h-6 rounded-full border-2 border-background bg-surface overflow-hidden relative z-[3] first:z-[3] second:z-[2] third:z-[1]">
                                 <img 
                                   src={`https://www.google.com/s2/favicons?domain=${new URL(s.link).hostname}&sz=32`} 
                                   className="w-full h-full object-cover"
                                   onError={(e) => (e.target as HTMLImageElement).style.display = 'none'}
                                 />
                              </div>
                           ))}
                           <div className="w-6 h-6 rounded-full border-2 border-background bg-surface-hover flex items-center justify-center relative z-0">
                               <span className="text-[9px] font-bold text-muted">
                                  <ImpersioLogo compact />
                               </span>
                           </div>
                        </div>
                        <span className="text-sm text-muted group-hover:text-primary transition-colors font-medium">
                            {msg.sources.length} sources
                        </span>
                     </div>
                )}

                {/* Right Actions */}
                <div className="flex items-center gap-1">
                     <button className="p-2 text-muted hover:text-primary transition-colors rounded-full hover:bg-surface-hover">
                       <ThumbsUp className="w-4 h-4" />
                     </button>
                     <button className="p-2 text-muted hover:text-primary transition-colors rounded-full hover:bg-surface-hover">
                       <ThumbsDown className="w-4 h-4" />
                     </button>
                     <button className="p-2 text-muted hover:text-primary transition-colors rounded-full hover:bg-surface-hover">
                       <MoreHorizontal className="w-4 h-4" />
                     </button>
                </div>
            </div>
            
            {/* Expanded Sources View */}
            {showSources && msg.sources && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-4 animate-in fade-in slide-in-from-top-2 duration-200">
                    {msg.sources.map((source, i) => (
                    <SourceCard key={i} source={source} index={i} />
                    ))}
                </div>
            )}

            {/* Related Questions */}
            {msg.relatedQuestions && msg.relatedQuestions.length > 0 && (
                <div className="mt-8 pt-6 border-t border-border/40">
                  <h4 className="text-base font-medium text-primary mb-4">Related</h4>
                  <div className="flex flex-col gap-0">
                      {msg.relatedQuestions.map((q, i) => (
                        <button 
                            key={i}
                            onClick={() => onSearch(q)}
                            className="flex items-center justify-between w-full py-3 text-left text-primary hover:bg-surface-hover/50 px-2 rounded-lg transition-colors group border-b border-border/40 last:border-0"
                        >
                            <span className="text-[16px] font-light">{q}</span>
                            <Plus className="w-4 h-4 text-muted group-hover:text-primary transition-colors" />
                        </button>
                      ))}
                  </div>
                </div>
            )}
        </div>
      </div>
  );
};

export default function App() {
  // Load initial state from localStorage
  const [messages, setMessages] = useState<Message[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        return parsed.messages || [];
      }
    } catch(e) {}
    return [];
  });

  const [hasSearched, setHasSearched] = useState(() => {
    try {
       const saved = localStorage.getItem(STORAGE_KEY);
       if (saved) return JSON.parse(saved).hasSearched || false;
    } catch(e) {}
    return false;
  });

  // Home View Mode: default, summarize, compare, info, recommend
  const [homeViewMode, setHomeViewMode] = useState<'default' | 'summarize' | 'compare' | 'info' | 'recommend'>('default');

  const [query, setQuery] = useState('');
  const [activeMode, setActiveMode] = useState<string>('auto'); 
  const [selectedModel, setSelectedModel] = useState<ModelOption>(MODEL_OPTIONS[0]);
  const [isModelDropdownOpen, setIsModelDropdownOpen] = useState(false);
  const [isReasoningEnabled, setIsReasoningEnabled] = useState(false);
  
  const [isLoading, setIsLoading] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [searchStatus, setSearchStatus] = useState<string>(''); 
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const [currentTitle, setCurrentTitle] = useState(() => {
     try {
       const saved = localStorage.getItem(STORAGE_KEY);
       if (saved) return JSON.parse(saved).currentTitle || "New Search";
     } catch(e) {}
     return "New Search";
  });
  const [view, setView] = useState<'home' | 'discover' | 'about'>('home');
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [attachments, setAttachments] = useState<string[]>([]);
  const [isMobile, setIsMobile] = useState(false);
  
  const [user, setUser] = useState<any>(null);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);

  // Persistence Effect
  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        messages,
        hasSearched,
        currentTitle
      }));
    }
  }, [messages, hasSearched, currentTitle]);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user && window.location.hash && window.location.hash.includes('access_token')) {
        window.history.replaceState(null, '', window.location.pathname);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user && window.location.hash.includes('access_token')) {
         window.history.replaceState(null, '', window.location.pathname);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') as 'dark' | 'light' | null;
    if (savedTheme) {
      setTheme(savedTheme);
      document.documentElement.classList.toggle('dark', savedTheme === 'dark');
    } else {
      document.documentElement.classList.add('dark');
    }
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    document.documentElement.classList.toggle('dark', newTheme === 'dark');
  };

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 160)}px`;
    }
  }, [query]);

  useEffect(() => {
    if (messagesEndRef.current) {
        messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages.length, isSearching]); 

  const shouldSearchWeb = (query: string, mode: string | null): boolean => {
    if (mode && mode !== 'web' && mode !== 'fast' && mode !== 'auto') return true;
    if (SKIP_SEARCH_REGEX.test(query.trim())) return false;
    if (query.trim().length < 2) return false;
    return true;
  };

  const getModelId = (id: string) => {
    switch(id) {
      case 'gemini-3-flash': return 'gemini-3-flash-preview'; 
      case 'gemini-2.0-flash': return 'gemini-2.0-flash-exp';
      case 'gpt-oss-120b': return 'openai/gpt-oss-120b';
      case 'kimi-k2': return 'moonshotai/kimi-k2-instruct-0905';
      case 'llama-4-maverick': return 'meta-llama/llama-4-maverick-17b-128e-instruct'; 
      case 'qwen-3-32b': return 'qwen/qwen3-32b';
      case 'mimo-v2-flash': return 'xiaomi/mimo-v2-flash:free';
      default: return 'gemini-3-flash-preview';
    }
  };

  const handleSearch = async (overrideQuery?: string) => {
    const finalQuery = overrideQuery || query;
    if ((!finalQuery.trim() && attachments.length === 0) || isLoading) return;

    // Reset View Mode on Search
    setHomeViewMode('default');
    setIsLoading(true);
    setQuery(''); 
    const currentAttachments = [...attachments];
    setAttachments([]);
    if (textareaRef.current) textareaRef.current.style.height = 'auto';

    let currentConversationId = conversationId;

    if (!hasSearched) {
      setHasSearched(true);
      const title = finalQuery.length > 30 ? finalQuery.substring(0, 30) + "..." : finalQuery || "Image Analysis";
      setCurrentTitle(title);
      const newId = await createConversation(title, user?.id);
      if (newId) {
        setConversationId(newId);
        currentConversationId = newId;
      }
    }
    
    setMessages(prev => [...prev, { 
        role: 'user', 
        content: finalQuery,
        images: currentAttachments 
    }]);

    if (currentConversationId) {
        await saveMessage(currentConversationId, 'user', finalQuery, { images: currentAttachments });
    }

    const modelId = getModelId(selectedModel.id);
    
    try {
      const needsSearch = shouldSearchWeb(finalQuery, activeMode) && attachments.length === 0;
      let searchResults: SearchResult[] = [];
      let searchImages: string[] = [];

      if (needsSearch) {
        setIsSearching(true);
        setSearchStatus('Thinking');
        
        // Define Complexity based on length or research keywords
        const isComplex = finalQuery.split(' ').length > 8 || finalQuery.toLowerCase().includes('report') || finalQuery.toLowerCase().includes('analysis') || activeMode === 'research';

        // Fast/Normal Mode: Use Exa (searchFast) exclusively
        if (activeMode === 'fast' || (!isComplex && activeMode === 'auto')) {
             setSearchStatus('Searching...');
             const { results, images } = await searchFast(finalQuery);
             searchResults = results;
             searchImages = images;
        } else {
             // Research Mode (Deep/Complex): Mix Exa + Tavily
             setSearchStatus('Deep Researching...');
             
             const queriesToRun = generateManualQueries(finalQuery);
             
             // Run Tavily (Breadth)
             const tavilyPromise = Promise.all(queriesToRun.slice(0, 3).map(q => searchWeb(q, 'web')));
             
             // Run Exa (Speed/Neural)
             const exaPromise = searchFast(finalQuery);

             // Combine results
             const [resultsArray, exaResult] = await Promise.all([
                 tavilyPromise,
                 exaPromise
             ]);
             
             const allResults: SearchResult[] = [];
             const seenLinks = new Set<string>();
             const allImages: string[] = [];
 
             // Add Exa Results First (High Quality / Neural)
             if (exaResult && exaResult.results) {
                 exaResult.results.forEach(item => {
                     if (!seenLinks.has(item.link)) {
                         seenLinks.add(item.link);
                         allResults.push(item);
                     }
                 });
             }

             // Add Tavily Results
             resultsArray.forEach(res => {
                 if (res.images) allImages.push(...res.images);
                 res.results.forEach(item => {
                     if (!seenLinks.has(item.link)) {
                         seenLinks.add(item.link);
                         allResults.push(item);
                     }
                 });
             });
 
             searchResults = allResults.slice(0, 25); 
             searchImages = [...new Set(allImages)]; 
        }

        setIsSearching(false);
        setSearchStatus('');
      }

      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: '', 
        sources: searchResults, 
        images: searchImages
      }]);

      await streamResponse(
        finalQuery, 
        modelId, 
        searchResults,
        currentAttachments,
        isReasoningEnabled,
        isMobile, 
        (chunkText) => {
          setMessages(prev => {
            const newMessages = [...prev];
            if (newMessages.length === 0) return prev;
            const lastMsg = newMessages[newMessages.length - 1];
            if (lastMsg.role === 'assistant') {
              lastMsg.content = chunkText;
            }
            return newMessages;
          });
        },
        (widgetData: WidgetData) => {
           setMessages(prev => {
            const newMessages = [...prev];
            if (newMessages.length === 0) return prev;
            const lastMsg = newMessages[newMessages.length - 1];
            if (lastMsg.role === 'assistant') {
              lastMsg.widget = widgetData;
            }
            return newMessages;
          });
        },
        (relatedQuestions: string[]) => {
            setMessages(prev => {
                const newMessages = [...prev];
                if (newMessages.length === 0) return prev;
                const lastMsg = newMessages[newMessages.length - 1];
                if (lastMsg.role === 'assistant') {
                  lastMsg.relatedQuestions = relatedQuestions;
                }
                return newMessages;
            });
        },
        async (fullContent, widget, relatedQuestions) => {
            if (currentConversationId) {
                await saveMessage(currentConversationId, 'assistant', fullContent, {
                    sources: searchResults,
                    images: searchImages,
                    widget: widget,
                    relatedQuestions: relatedQuestions
                });
            }
        }
      );
      
    } catch (e) {
      console.error("Search failed", e);
      setIsSearching(false);
      setSearchStatus('');
      const errorMessage = "Sorry, I encountered an error while searching.";
      setMessages(prev => [...prev, { role: 'assistant', content: errorMessage }]);
      if (currentConversationId) {
          await saveMessage(currentConversationId, 'assistant', errorMessage);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSearch();
    }
  };

  const processFile = (file: File) => {
    return new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target?.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handlePaste = async (e: React.ClipboardEvent) => {
    const items = e.clipboardData.items;
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      if (item.type.startsWith('image/')) {
        e.preventDefault();
        const file = item.getAsFile();
        if (file) {
          try {
             const base64 = await processFile(file as File);
             setAttachments(prev => [...prev, base64]);
          } catch (err) {
             console.error("Failed to read pasted image", err);
          }
        }
      }
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      const newAttachments: string[] = [];
      for (const file of files) {
         try {
            const base64 = await processFile(file as File);
            newAttachments.push(base64);
         } catch (err) {
            console.error("Failed to read file", err);
         }
      }
      setAttachments(prev => [...prev, ...newAttachments]);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const removeAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  const loadConversation = async (id: string, title: string) => {
     setIsLoading(true);
     setMessages([]);
     setHasSearched(true);
     setCurrentTitle(title);
     setConversationId(id);
     const history = await getConversationMessages(id);
     setMessages(history);
     setIsLoading(false);
  };

  const handleNewChat = () => {
     setHasSearched(false);
     setHomeViewMode('default');
     setMessages([]);
     setConversationId(null);
     setCurrentTitle("New Search");
     setQuery('');
     setAttachments([]);
     localStorage.removeItem(STORAGE_KEY); 
  };

  // Helper to resolve placeholder based on view mode
  const getPlaceholder = () => {
    switch(homeViewMode) {
      case 'summarize': return 'Summarize';
      case 'compare': return 'Compare';
      case 'recommend': return 'Recommend';
      case 'info': return 'How'; 
      default: return 'Ask anything. Type @ for mentions and / for shortcuts.';
    }
  };

  const renderHeader = (compact: boolean) => (
    <header className="fixed top-0 left-0 w-full p-4 flex justify-between items-center z-40 bg-transparent pointer-events-none">
       <div className="flex items-center gap-3 pointer-events-auto">
          <button 
             onClick={() => setIsHistoryOpen(true)}
             className="p-2 text-muted hover:text-primary rounded-xl hover:bg-surface-hover transition-colors"
          >
             <Menu className="w-5 h-5" />
          </button>
          {compact && (
            <button 
              className="cursor-pointer hover:opacity-80 transition-all duration-200"
              onClick={handleNewChat}
            >
              <ImpersioLogo compact />
            </button>
          )}
       </div>
       <div className="flex items-center gap-2 pointer-events-auto">
           {!user && (
              <button 
                 onClick={() => setIsAuthModalOpen(true)}
                 className="text-xs font-semibold px-4 py-2 bg-white text-black rounded-full hover:opacity-90 transition-all shadow-sm"
              >
                 Sign Up
              </button>
           )}
           {user && (
              <button 
                onClick={() => setIsHistoryOpen(true)} 
                className="w-8 h-8 rounded-full bg-scira-accent/10 text-scira-accent flex items-center justify-center font-medium text-xs border border-scira-accent/20"
              >
                  {user.email?.[0].toUpperCase()}
              </button>
           )}
       </div>
    </header>
  );

  const renderInputBar = (isInitial: boolean) => (
    <div className={`w-full ${isInitial ? 'max-w-3xl' : 'max-w-3xl'} mx-auto relative z-30 transition-all duration-500`}>
      {/* Title / Headline for modes */}
      {isInitial && homeViewMode !== 'default' && (
         <div className="mb-4 pl-1">
             <span className="text-sm font-medium text-muted uppercase tracking-wide opacity-0">{/* spacer */}</span>
         </div>
      )}

      <div className={`
        relative flex flex-col w-full bg-surface 
        rounded-xl
        border border-border 
        shadow-sm group 
        focus-within:border-border focus-within:ring-1 focus-within:ring-border focus-within:shadow-lg
        transition-all duration-300
        overflow-visible
        p-3 md:p-4
      `}>
         {/* Input Area */}
         <textarea
            ref={textareaRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            onPaste={handlePaste}
            placeholder={isInitial ? getPlaceholder() : "Ask a follow-up"}
            className={`w-full bg-transparent text-primary placeholder-muted/60 ${isInitial ? 'text-lg' : 'text-[15px]'} font-light px-0 focus:outline-none resize-none overflow-hidden max-h-[200px] font-sans`}
            style={{ minHeight: isInitial ? '60px' : '40px' }}
            rows={1}
            autoFocus={isInitial && !isMobile}
          />

         {/* Attachment Previews */}
         {attachments.length > 0 && (
           <div className="flex items-center gap-2 py-2 overflow-x-auto">
             {attachments.map((img, idx) => (
               <div key={idx} className="relative group/image">
                 <div className="w-16 h-16 rounded-lg overflow-hidden border border-border">
                    <img src={img} alt="attachment" className="w-full h-full object-cover" />
                 </div>
                 <button 
                   onClick={() => removeAttachment(idx)}
                   className="absolute -top-1.5 -right-1.5 bg-surface border border-border rounded-full p-0.5 shadow-sm text-muted hover:text-red-500 transition-all hover:scale-110"
                 >
                   <X className="w-3 h-3" />
                 </button>
               </div>
             ))}
           </div>
         )}

          {/* Controls Bar */}
          <div className="flex items-center justify-between mt-2">
            {/* Left Pill Group (Search Modes) */}
            <div className="flex items-center p-0.5 bg-surface-hover/30 rounded-full border border-border/50">
               <button 
                 onClick={() => setActiveMode('auto')}
                 className={`p-2 rounded-full transition-all duration-200 ${activeMode === 'auto' ? 'text-scira-accent bg-surface border border-scira-accent/30 shadow-[0_0_10px_-3px_rgba(45,182,199,0.3)]' : 'text-muted hover:text-primary'}`}
                 title="Focus"
               >
                 <SearchIcon className="w-4 h-4" />
               </button>

               <button 
                 onClick={() => setActiveMode('research')}
                 className={`p-2 rounded-full transition-all duration-200 ${activeMode === 'research' ? 'text-scira-accent bg-surface border border-scira-accent/30 shadow-sm' : 'text-muted hover:text-primary'}`}
                 title="Deep Research"
               >
                 <TelescopeIcon className="w-4 h-4" />
               </button>

               <button 
                 onClick={() => setActiveMode('slides')}
                 className={`p-2 rounded-full transition-all duration-200 ${activeMode === 'slides' ? 'text-scira-accent bg-surface border border-scira-accent/30 shadow-sm' : 'text-muted hover:text-primary'}`}
                 title="Library"
               >
                 <GridPlusIcon className="w-4 h-4" />
               </button>
            </div>

            <div className="flex items-center gap-2">
               {/* Right Side Icons */}
               <button className="text-muted hover:text-primary transition-colors p-2 rounded-full hover:bg-surface-hover" title="Language/Region">
                  <GlobeIcon className="w-4 h-4" />
               </button>
               <button className="text-muted hover:text-primary transition-colors p-2 rounded-full hover:bg-surface-hover" title="Pro">
                  <CPUIcon className="w-4 h-4" />
               </button>
               
               <input 
                 type="file" 
                 multiple 
                 accept="image/*" 
                 className="hidden" 
                 ref={fileInputRef}
                 onChange={handleFileSelect} 
               />
               <button 
                 onClick={() => fileInputRef.current?.click()}
                 className="text-muted hover:text-primary transition-colors p-2 rounded-full hover:bg-surface-hover"
                 title="Attach"
               >
                 <PaperclipIcon className="w-4 h-4" />
               </button>
               
               <button className="text-muted hover:text-primary transition-colors p-2 rounded-full hover:bg-surface-hover" title="Voice">
                 <MicIcon className="w-4 h-4" />
               </button>

               {/* Teal Submit Button */}
               <button 
                 onClick={() => handleSearch()}
                 disabled={!query.trim() && attachments.length === 0}
                 className={`flex items-center justify-center w-8 h-8 rounded-lg transition-all duration-200 ml-1 ${(!query.trim() && attachments.length === 0) ? 'bg-surface-hover text-muted cursor-not-allowed' : 'bg-scira-accent text-white hover:opacity-90 shadow-md'}`}
               >
                   <ArrowUp className="w-5 h-5" />
               </button>
            </div>
          </div>
      </div>
    </div>
  );

  // Footer Actions (Help, Theme)
  const renderFooterControls = () => (
    <div className="fixed bottom-4 right-4 flex items-center gap-2 z-50">
        <button 
          onClick={toggleTheme}
          className="p-2 rounded-full bg-surface border border-border text-muted hover:text-primary hover:bg-surface-hover transition-all shadow-sm"
          title="Toggle Theme"
        >
          {theme === 'dark' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
        </button>
        <button 
          className="p-2 rounded-full bg-surface border border-border text-muted hover:text-primary hover:bg-surface-hover transition-all shadow-sm"
          title="Help"
        >
          <HelpCircle className="w-4 h-4" />
        </button>
    </div>
  );

  const renderSuggestions = () => (
    <div className="flex flex-wrap items-center justify-center gap-2 mt-6">
       <button onClick={() => setHomeViewMode('recommend')} className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-surface border border-border text-xs font-medium text-muted hover:text-primary hover:bg-surface-hover transition-colors">
          <ThumbsUp className="w-3.5 h-3.5" />
          <span>Recommend</span>
       </button>
       <button onClick={() => setHomeViewMode('compare')} className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-surface border border-border text-xs font-medium text-muted hover:text-primary hover:bg-surface-hover transition-colors">
          <Scale className="w-3.5 h-3.5" />
          <span>Compare</span>
       </button>
       <button onClick={() => setQuery('Latest finance news')} className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-surface border border-border text-xs font-medium text-muted hover:text-primary hover:bg-surface-hover transition-colors">
          <DollarSign className="w-3.5 h-3.5" />
          <span>Finance</span>
       </button>
       <button onClick={() => setQuery('Parenting tips')} className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-surface border border-border text-xs font-medium text-muted hover:text-primary hover:bg-surface-hover transition-colors">
          <Baby className="w-3.5 h-3.5" />
          <span>Parenting</span>
       </button>
       <button onClick={() => setQuery('Travel guides')} className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-surface border border-border text-xs font-medium text-muted hover:text-primary hover:bg-surface-hover transition-colors">
          <Plane className="w-3.5 h-3.5" />
          <span>Travel</span>
       </button>
       <button onClick={() => { setHomeViewMode('info'); setQuery('How '); }} className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-surface border border-border text-xs font-medium text-muted hover:text-primary hover:bg-surface-hover transition-colors">
          <BookOpen className="w-3.5 h-3.5" />
          <span>Perplexity 101</span>
       </button>
    </div>
  );

  return (
    <div className={`min-h-screen bg-background text-primary font-sans selection:bg-scira-accent/20 flex flex-col`}>
      
      {renderHeader(hasSearched)}

      <HistorySidebar
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        onSelectChat={loadConversation}
        onNewChat={handleNewChat}
        userId={user?.id}
        onSignIn={() => {
            setIsHistoryOpen(false);
            setIsAuthModalOpen(true);
        }}
        onOpenAbout={() => {
            setIsHistoryOpen(false);
            setView('about');
        }}
      />

      <AuthModal 
        isOpen={isAuthModalOpen} 
        onClose={() => setIsAuthModalOpen(false)} 
      />

      {view === 'discover' && <Discover onBack={() => setView('home')} />}
      
      {view === 'about' && <About onBack={() => setView('home')} />}

      {view === 'home' && (
          <main className="flex-1 w-full mx-auto relative flex flex-col min-h-0 justify-center">
            {!hasSearched ? (
              <div className="flex flex-col items-center justify-center p-4 w-full">
                  <div className="mb-8 text-center">
                    {/* Dynamic Headline Based on Mode */}
                    {homeViewMode === 'default' && <ImpersioLogo isMobile={isMobile} />}
                    {homeViewMode === 'summarize' && <h1 className="text-4xl md:text-5xl font-sans font-light text-primary">What do you want to summarize?</h1>}
                    {homeViewMode === 'compare' && <h1 className="text-4xl md:text-5xl font-sans font-light text-primary">What do you want to compare?</h1>}
                    {homeViewMode === 'info' && <h1 className="text-4xl md:text-5xl font-sans font-light text-primary">Where knowledge begins</h1>}
                    {homeViewMode === 'recommend' && <h1 className="text-4xl md:text-5xl font-sans font-light text-primary">What do you want to find?</h1>}
                  </div>
                  
                  {renderInputBar(true)}
                  
                  {renderSuggestions()}
              </div>
            ) : (
              <div className="flex-1 flex flex-col pb-36 pt-20 px-4">
                  <div className="flex flex-col gap-6 max-w-4xl mx-auto w-full"> 
                    {messages.map((msg, idx) => (
                        <MessageItem 
                          key={idx}
                          msg={msg}
                          isLast={idx === messages.length - 1}
                          isLoading={isLoading}
                          onSearch={handleSearch}
                          searchStatus={searchStatus}
                        />
                    ))}
                    <div ref={messagesEndRef} />
                  </div>
                  
                  {/* Fixed Chat Input */}
                  <div className="fixed bottom-0 left-0 w-full bg-gradient-to-t from-background via-background/95 to-transparent pt-10 pb-6 px-4 z-20">
                     <div className="max-w-3xl mx-auto">
                        {renderInputBar(false)}
                     </div>
                  </div>
              </div>
            )}
          </main>
      )}

      {renderFooterControls()}
    </div>
  );
}
