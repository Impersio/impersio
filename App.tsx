import React, { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { 
  Paperclip, 
  ChevronDown, 
  Globe, 
  ArrowUp,
  Sun,
  Moon,
  Mic,
  CornerDownRight,
  Copy,
  Share,
  RotateCcw,
  Menu,
  Check,
  X,
  Zap,
  Loader2,
  Image as ImageIcon,
  Presentation,
  ThumbsUp,
  ThumbsDown,
  MoreHorizontal,
  Download,
  Sparkles
} from 'lucide-react';
import { streamResponse, generateSearchQueries, generateManualQueries } from './services/geminiService';
import { searchWeb, searchFast } from './services/googleSearchService';
import { createConversation, saveMessage, getConversationMessages } from './services/chatStorageService';
import { supabase } from './services/supabaseClient';
import { Message, SearchResult, WidgetData } from './types';
import { Discover } from './components/Discover';
import { About } from './components/About';
import { TimeWidget } from './components/TimeWidget';
import { StockWidget } from './components/StockWidget';
import { WeatherWidget } from './components/WeatherWidget';
import { SlidesWidget } from './components/SlidesWidget';
import { AuthModal } from './components/AuthModal';
import { HistorySidebar } from './components/HistorySidebar';
import { MessageContent } from './components/MessageContent';
import { 
  ReasoningIcon, 
  GeminiIcon, 
  MimoIcon, 
  OpenAIIcon, 
  MetaIcon, 
  KimiIcon, 
  QwenIcon
} from './components/Icons';

// Model Options matching user request
const MODEL_OPTIONS = [
  { id: 'gemini-3-flash', name: 'Gemini 3.0 Flash', icon: GeminiIcon },
  { id: 'gemini-2.0-flash', name: 'Gemini 2.0 Flash', icon: GeminiIcon },
  { id: 'gpt-oss-120b', name: 'GPT OSS 120B', icon: OpenAIIcon },
  { id: 'llama-4-maverick', name: 'Llama 4 Maverick', icon: MetaIcon },
  { id: 'kimi-k2', name: 'Kimi K2', icon: KimiIcon },
  { id: 'qwen-3-32b', name: 'Qwen 3', icon: QwenIcon },
  { id: 'mimo-v2-flash', name: 'Mimo V2 Flash', icon: MimoIcon },
];

const SKIP_SEARCH_REGEX = /^(hi|hello|hey|greetings|sup|howdy|yo|good\s*(morning|afternoon|evening|night)|how\s*are\s*you|who\s*are\s*you|what\s*is\s*your\s*name|help|test|what\s*can\s*you\s*do|what\s*are\s*your\s*features|capabilities|features)$/i;

export const ImpersioLogo = ({ isMobile, compact = false }: { isMobile?: boolean; compact?: boolean }) => (
  <div className={`flex items-center ${compact ? 'gap-2' : 'gap-3'} select-none transition-transform duration-300 hover:scale-105 cursor-default`}>
    <div className={`${compact ? 'w-6 h-6' : (isMobile ? 'w-10 h-10' : 'w-12 h-12')} relative flex items-center justify-center text-primary`}>
       <svg viewBox="0 0 50 40" fill="none" stroke="currentColor" strokeWidth="4" className="w-full h-full">
          <rect x="4" y="2" width="20" height="36" rx="10" />
          <rect x="20" y="2" width="20" height="36" rx="10" />
          <circle cx="14" cy="11" r="3" fill="currentColor" stroke="none" />
       </svg>
    </div>
    <span className={`font-sans font-medium tracking-tight text-primary ${compact ? 'text-lg' : (isMobile ? 'text-4xl' : 'text-5xl')}`}>
      Impersio
    </span>
  </div>
);

const SourcesGrid = ({ sources }: { sources: SearchResult[] }) => {
  const [expanded, setExpanded] = useState(false);
  
  if (!sources || sources.length === 0) return null;
  
  const displayedSources = expanded ? sources : sources.slice(0, 4);
  const hiddenCount = sources.length - 4;

  return (
    <div className="">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {displayedSources.map((source, i) => (
                <a 
                    key={i} 
                    href={source.link}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-3 p-3 rounded-lg bg-surface hover:bg-surface-hover border border-border transition-all duration-200 group h-full hover:scale-[1.02] hover:shadow-md"
                >
                    <div className="w-6 h-6 rounded-full bg-background border border-border flex items-center justify-center shrink-0">
                        <img 
                            src={`https://www.google.com/s2/favicons?domain=${new URL(source.link).hostname}&sz=64`}
                            className="w-3 h-3 opacity-70 group-hover:opacity-100 transition-opacity"
                            onError={(e) => (e.target as HTMLImageElement).style.display = 'none'}
                        />
                    </div>
                    <div className="min-w-0 flex-1">
                        <div className="text-xs font-medium text-primary truncate group-hover:text-scira-accent transition-colors">{source.title}</div>
                        <div className="text-[10px] text-muted truncate opacity-80">{source.displayLink}</div>
                    </div>
                </a>
            ))}
            {!expanded && hiddenCount > 0 && (
                <button 
                    onClick={() => setExpanded(true)}
                    className="flex items-center justify-center gap-2 p-3 rounded-lg bg-surface hover:bg-surface-hover border border-border transition-all duration-200 text-xs font-medium text-muted hover:text-primary h-full"
                >
                    <span className="w-6 h-6 rounded-full bg-background border border-border flex items-center justify-center">
                        +{hiddenCount}
                    </span>
                    View {hiddenCount} more
                </button>
            )}
        </div>
    </div>
  );
};

interface MessageItemProps {
  msg: Message;
  isLast: boolean;
  isLoading: boolean;
  onSearch: (q: string) => void;
}

// Extracted Message Item Component
const MessageItem: React.FC<MessageItemProps> = ({ 
  msg, 
  isLast, 
  isLoading, 
  onSearch 
}) => {
  const [showSources, setShowSources] = useState(false);

  if (msg.role === 'user') {
    return (
      <div className="flex flex-col items-end animate-fade-in gap-2 mb-8">
          <div className="max-w-2xl text-right">
            <div className="inline-block bg-surface-hover text-primary px-5 py-2.5 rounded-2xl text-lg md:text-xl">
              {msg.content}
            </div>
          </div>
          {msg.images && msg.images.length > 0 && (
            <div className="flex gap-2 justify-end">
              {msg.images.map((img, i) => (
                <img key={i} src={img} className="h-16 w-16 rounded-xl object-cover border border-border" />
              ))}
            </div>
          )}
      </div>
    );
  }

  // Assistant Message
  return (
      <div className="w-full max-w-3xl mx-auto animate-fade-in mb-12">
        {/* Widgets */}
        {msg.widget && (
            <div className="mb-8">
              {msg.widget.type === 'time' && <TimeWidget data={msg.widget.data} />}
              {msg.widget.type === 'weather' && <WeatherWidget data={msg.widget.data} />}
              {msg.widget.type === 'stock' && <StockWidget data={msg.widget.data} />}
              {msg.widget.type === 'slides' && <SlidesWidget data={msg.widget.data} />}
            </div>
        )}

        {/* Images Carousel */}
        {msg.images && msg.images.length > 0 && (
            <div className="flex gap-3 overflow-x-auto pb-4 scrollbar-hide -mx-2 px-2 mb-8">
                {msg.images.map((img, i) => (
                <div key={i} className="flex-none h-32 w-auto aspect-video rounded-xl overflow-hidden bg-surface relative border border-border shadow-sm group">
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
        <div className="prose prose-neutral dark:prose-invert max-w-none mb-6">
            <MessageContent 
              content={msg.content} 
              isStreaming={isLast && isLoading} 
            />
        </div>

        {/* Related Questions */}
        {msg.relatedQuestions && msg.relatedQuestions.length > 0 && (
            <div className="mt-6 mb-8 border-t border-border pt-4">
              <h4 className="text-sm font-medium text-primary mb-3 flex items-center gap-2">
                 <CornerDownRight className="w-4 h-4 text-muted" />
                 Related
              </h4>
              <div className="flex flex-col gap-2">
                  {msg.relatedQuestions.map((q, i) => (
                    <button 
                        key={i}
                        onClick={() => onSearch(q)}
                        className="text-left text-primary hover:text-scira-accent transition-colors py-2 px-1 flex items-center gap-3 group"
                    >
                        <span className="font-medium text-[15px]">{q}</span>
                    </button>
                  ))}
              </div>
            </div>
        )}

        {/* Action Bar */}
        <div className="flex items-center justify-between mt-6 pt-2 select-none">
            <div className="flex items-center gap-1">
                 <button className="p-2 text-muted hover:text-primary transition-colors rounded-lg hover:bg-surface-hover" title="Share">
                   <Share className="w-4 h-4" />
                 </button>
                 <button className="p-2 text-muted hover:text-primary transition-colors rounded-lg hover:bg-surface-hover" title="Rewrite">
                   <RotateCcw className="w-4 h-4" />
                 </button>
                 <button className="p-2 text-muted hover:text-primary transition-colors rounded-lg hover:bg-surface-hover" title="Copy">
                   <Copy className="w-4 h-4" />
                 </button>
                 
                 <div className="h-4 w-[1px] bg-border mx-2"></div>

                 {/* Sources Toggle Button */}
                 {msg.sources && msg.sources.length > 0 && (
                    <button 
                        onClick={() => setShowSources(!showSources)}
                        className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200 border ml-1 ${showSources ? 'bg-surface-hover border-border text-primary' : 'bg-surface border-border text-muted hover:text-primary hover:bg-surface-hover'}`}
                    >
                        <div className="flex items-center justify-center">
                           <Globe className="w-3.5 h-3.5" />
                        </div>
                        {msg.sources.length} sources
                    </button>
                 )}
            </div>

            <div className="flex items-center gap-1">
                <button className="p-2 text-muted hover:text-primary transition-colors rounded-lg hover:bg-surface-hover">
                  <ThumbsUp className="w-4 h-4" />
                </button>
                <button className="p-2 text-muted hover:text-primary transition-colors rounded-lg hover:bg-surface-hover">
                  <ThumbsDown className="w-4 h-4" />
                </button>
                <button className="p-2 text-muted hover:text-primary transition-colors rounded-lg hover:bg-surface-hover">
                  <MoreHorizontal className="w-4 h-4" />
                </button>
            </div>
        </div>

        {/* Collapsible Sources Panel */}
        {showSources && msg.sources && (
            <div className="mt-4 pt-4 border-t border-border animate-in fade-in slide-in-from-top-2">
                <SourcesGrid sources={msg.sources} />
            </div>
        )}
      </div>
  );
};

export default function App() {
  const [query, setQuery] = useState('');
  const [activeMode, setActiveMode] = useState<string>('auto'); 
  const [selectedModel, setSelectedModel] = useState(MODEL_OPTIONS[0]);
  const [isModelDropdownOpen, setIsModelDropdownOpen] = useState(false);
  const [isReasoningEnabled, setIsReasoningEnabled] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [searchStatus, setSearchStatus] = useState<string>(''); 
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [hasSearched, setHasSearched] = useState(false);
  const [currentTitle, setCurrentTitle] = useState("New Search");
  const [view, setView] = useState<'home' | 'discover' | 'about'>('home');
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [attachments, setAttachments] = useState<string[]>([]);
  const [isMobile, setIsMobile] = useState(false);
  
  const [user, setUser] = useState<any>(null);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);

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

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [query]);

  useEffect(() => {
    if (messagesEndRef.current) {
        messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isLoading, isSearching]);

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

    setIsLoading(true);
    setQuery(''); 
    const currentAttachments = [...attachments];
    setAttachments([]);

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
        setSearchStatus('Thinking...');
        
        const isComplex = finalQuery.split(' ').length > 8 || finalQuery.toLowerCase().includes('report') || finalQuery.toLowerCase().includes('analysis');

        if (!isComplex && activeMode === 'auto') {
             const { results, images } = await searchFast(finalQuery);
             searchResults = results;
             searchImages = images;
        } else {
             const queriesToRun = generateManualQueries(finalQuery);
             setSearchStatus(`Analyzing...`);
             
             const searchPromises = queriesToRun.slice(0, 3).map(q => searchWeb(q, 'web'));
             const resultsArray = await Promise.all(searchPromises);
             
             const allResults: SearchResult[] = [];
             const seenLinks = new Set<string>();
             const allImages: string[] = [];
 
             resultsArray.forEach(res => {
                 if (res.images) allImages.push(...res.images);
                 res.results.forEach(item => {
                     if (!seenLinks.has(item.link)) {
                         seenLinks.add(item.link);
                         allResults.push(item);
                     }
                 });
             });
 
             searchResults = allResults.slice(0, 20);
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
     setMessages([]);
     setConversationId(null);
     setCurrentTitle("New Search");
     setQuery('');
     setAttachments([]);
  };

  const renderHeader = (compact: boolean) => (
    <div className="absolute top-0 left-0 w-full p-4 flex justify-between items-start z-50 pointer-events-none">
       <div className="flex items-center gap-3 pointer-events-auto">
          <button 
             onClick={() => setIsHistoryOpen(true)}
             className="p-2 text-muted hover:text-primary rounded-xl hover:bg-surface/50 transition-colors backdrop-blur-sm"
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
       <div className="pointer-events-auto">
           {!user && (
              <button 
                 onClick={() => setIsAuthModalOpen(true)}
                 className="text-xs font-medium px-4 py-2 bg-surface hover:bg-surface-hover border border-border rounded-full transition-all shadow-sm text-primary"
              >
                 Sign In
              </button>
           )}
           {user && (
              <button 
                onClick={() => setIsHistoryOpen(true)} 
                className="w-8 h-8 rounded-full bg-scira-accent/20 text-scira-accent flex items-center justify-center font-medium text-xs border border-scira-accent/30"
              >
                  {user.email?.[0].toUpperCase()}
              </button>
           )}
       </div>
    </div>
  );

  const renderInputBar = (isInitial: boolean) => (
    <div className={`w-full max-w-[672px] mx-auto relative z-10`}>
      <div className={`
        relative flex flex-col w-full bg-surface 
        rounded-[32px] 
        border border-border/50 
        shadow-sm group 
        focus-within:border-muted/40 focus-within:shadow-md
        transition-all duration-300
        ${isMobile ? 'p-3' : 'p-4'}
      `}>
         {/* Attachment Previews */}
         {attachments.length > 0 && (
           <div className="flex items-center gap-2 px-2 pb-2 overflow-x-auto">
             {attachments.map((img, idx) => (
               <div key={idx} className="relative group/image">
                 <div className="w-12 h-12 rounded-lg overflow-hidden border border-border">
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

         <textarea
            ref={textareaRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            onPaste={handlePaste}
            placeholder={isMobile ? "Ask anything..." : "Ask anything..."}
            className={`w-full bg-transparent text-primary placeholder-muted/50 text-[16px] px-1 focus:outline-none resize-none overflow-hidden min-h-[24px] max-h-[200px] mb-2`}
            style={{ lineHeight: '1.5' }}
            rows={1}
            autoFocus={isInitial && !isMobile}
          />

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1 -ml-2">
               {/* Reasoning Toggle */}
               <button 
                 onClick={() => setIsReasoningEnabled(!isReasoningEnabled)}
                 className={`p-2 rounded-full transition-colors duration-200 group/btn flex items-center gap-2 ${isReasoningEnabled ? 'text-scira-accent bg-scira-accent/10' : 'text-muted hover:text-primary hover:bg-surface-hover'}`}
                 title="Reasoning"
               >
                 <ReasoningIcon className="w-5 h-5 stroke-[1.5]" />
               </button>

               {/* Model Selector */}
               <div className="relative">
                  <button 
                    onClick={() => setIsModelDropdownOpen(!isModelDropdownOpen)}
                    className="flex items-center justify-center p-2 rounded-full text-muted hover:text-primary hover:bg-surface-hover transition-colors"
                  >
                    <Sparkles className="w-5 h-5 stroke-[1.5] text-purple-400" />
                  </button>
                  
                  {isModelDropdownOpen && (
                      <div className="absolute bottom-full mb-2 left-0 w-60 bg-surface border border-border rounded-xl shadow-xl z-50 py-1 overflow-hidden animate-in fade-in zoom-in-95 duration-100">
                        {MODEL_OPTIONS.map(model => (
                          <button
                            key={model.id}
                            onClick={() => {
                              setSelectedModel(model);
                              setIsModelDropdownOpen(false);
                            }}
                            className={`w-full text-left px-4 py-3 text-sm transition-colors flex items-center justify-between group
                              ${selectedModel.id === model.id ? 'bg-surface-hover text-scira-accent' : 'text-muted hover:bg-surface-hover hover:text-scira-accent'}
                            `}
                          >
                            <div className="flex items-center gap-3">
                              <model.icon className={`w-5 h-5 ${selectedModel.id === model.id ? 'opacity-100' : 'opacity-70 group-hover:opacity-100'}`} />
                              <span className="font-medium">{model.name}</span>
                            </div>
                            {selectedModel.id === model.id && (
                              <Check className="w-4 h-4 text-scira-accent" />
                            )}
                          </button>
                        ))}
                      </div>
                    )}
               </div>

               {/* File Input */}
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
                 className="p-2 rounded-full text-muted hover:text-primary hover:bg-surface-hover transition-colors"
               >
                 <Paperclip className="w-5 h-5 stroke-[1.5]" />
               </button>
            </div>

            <div className="flex items-center gap-2">
               {query.trim().length > 0 || attachments.length > 0 ? (
                 <button 
                    onClick={() => handleSearch()}
                    className="flex items-center justify-center h-8 w-8 bg-scira-accent hover:opacity-90 rounded-lg text-background transition-all duration-200 shadow-sm"
                 >
                    <ArrowUp className="w-4 h-4 stroke-[2.5]" />
                 </button>
               ) : (
                 <button className="flex items-center justify-center p-2 rounded-full bg-surface-hover/50 text-primary transition-all duration-200 hover:bg-surface-hover">
                    <Mic className="w-5 h-5 stroke-[1.5]" />
                 </button>
               )}
            </div>
          </div>
      </div>
    </div>
  );

  return (
    <div className={`min-h-screen bg-background text-primary font-sans selection:bg-scira-accent/20 flex flex-col ${isMobile ? 'pb-20' : ''}`}>
      
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
          <main className="flex-1 w-full max-w-4xl mx-auto px-4 md:px-8 relative flex flex-col min-h-0">
            {!hasSearched ? (
              <div className="flex-1 flex flex-col items-center justify-center -mt-20">
                  <div className="mb-8 animate-fade-in-down">
                    <ImpersioLogo isMobile={isMobile} />
                  </div>
                  
                  {renderInputBar(true)}
                  
                  <div className="mt-8 flex gap-6 text-sm text-muted font-medium">
                    <button onClick={() => setView('discover')} className="hover:text-scira-accent transition-colors">Discover</button>
                    <button onClick={() => setView('about')} className="hover:text-scira-accent transition-colors">About</button>
                  </div>
              </div>
            ) : (
              <div className="flex-1 flex flex-col pb-48 pt-24 md:pt-32">
                  <div className="flex flex-col gap-0"> 
                    {messages.map((msg, idx) => (
                        <MessageItem 
                          key={idx}
                          msg={msg}
                          isLast={idx === messages.length - 1}
                          isLoading={isLoading}
                          onSearch={handleSearch}
                        />
                    ))}
                    
                    {isLoading && messages[messages.length - 1]?.role === 'user' && (
                        <div className="w-full max-w-3xl mx-auto flex flex-col gap-4 animate-pulse mt-8">
                          <div className="flex items-center gap-3 mb-2">
                              <div className="w-4 h-4 rounded-full bg-scira-accent/20 animate-pulse" />
                              <div className="text-sm text-muted">Reasoning...</div>
                          </div>
                          <div className="space-y-3">
                              <div className="h-4 w-3/4 bg-surface-hover rounded" />
                              <div className="h-4 w-1/2 bg-surface-hover rounded" />
                              <div className="h-4 w-5/6 bg-surface-hover rounded" />
                          </div>
                        </div>
                    )}
                    
                    {isSearching && (
                        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 flex items-center gap-3 px-4 py-2 bg-surface border border-border rounded-full shadow-lg z-30 animate-in slide-in-from-bottom-5 fade-in duration-300">
                          <Loader2 className="w-4 h-4 animate-spin text-scira-accent" />
                          <span className="text-sm font-medium text-primary">{searchStatus || "Thinking..."}</span>
                        </div>
                    )}

                    <div ref={messagesEndRef} />
                  </div>
                  
                  <div className="fixed bottom-0 left-0 w-full bg-gradient-to-t from-background via-background/95 to-transparent pt-12 pb-6 px-4 z-20 pointer-events-none">
                     <div className="pointer-events-auto">
                        {renderInputBar(false)}
                     </div>
                  </div>
              </div>
            )}
          </main>
      )}
    </div>
  );
}