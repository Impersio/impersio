import React, { useState, useRef, useEffect } from 'react';
import { 
  Copy,
  RotateCcw, 
  ThumbsUp,
  ThumbsDown,
  ArrowUp,
  Clock,
  Search,
  Share,
  Download,
  Check,
  X,
  FileText,
  File,
  Sparkles,
  Cpu,
  Globe,
  Paperclip,
  Mic,
  AudioLines,
  Zap,
  Atom,
  ChevronDown,
  AlignLeft,
  Image as ImageIcon,
  Plus
} from 'lucide-react';
import { streamResponse, orchestrateProSearch, detectIntent } from './services/geminiService';
import { searchFast, getSuggestions } from './services/googleSearchService';
import { createConversation, saveMessage } from './services/chatStorageService';
import { authService } from './services/authService';
import { Message, SearchResult, ModelOption, User } from './types';
import { Discover } from './components/Discover';
import { About } from './components/About';
import { TimeWidget } from './components/TimeWidget';
import { StockWidget } from './components/StockWidget';
import { WeatherWidget } from './components/WeatherWidget';
import { SlidesWidget } from './components/SlidesWidget';
import { AuthModal } from './components/AuthModal';
import { SubscriptionModal } from './components/SubscriptionModal';
import { HistorySidebar } from './components/HistorySidebar';
import { AppSidebar } from './components/AppSidebar';
import { MessageContent } from './components/MessageContent';
import { ModelSelector } from './components/ModelSelector';
import { SearchModes } from './components/SearchModes';
import { ProSearchLogger } from './components/ProSearchLogger';
import { useTheme } from './hooks/useTheme';
import { SidebarProvider, SidebarInset, SidebarTrigger } from './components/ui/sidebar';
import { 
  ImpersioLogo,
  CoffeeIcon,
  PenIcon,
  GraduationCapIcon,
  TrendingUpIcon,
  CodeIcon,
  CPUIcon,
  ClaudeIcon,
  OpenAIIcon,
  GeminiIcon,
  PerplexityLogo
} from './components/Icons';

// Updated models to match the requested interface
const MODEL_OPTIONS: ModelOption[] = [
  { id: 'sonar', name: 'Sonar', description: 'Fast model by Perplexity', icon: Zap }, // Using Zap as placeholder for Sonar
  { id: 'claude-3-7-sonnet', name: 'Claude 3.7', description: 'Smart model by Anthropic', icon: ClaudeIcon },
  { id: 'gpt-4o', name: 'GPT-4o', description: 'Powerful model by OpenAI', icon: OpenAIIcon },
  { id: 'gemini-2.0-flash', name: 'Gemini 2.5 Flash', description: 'Versatile model by Google', icon: GeminiIcon },
  { id: 'deepseek-coder', name: 'DeepSeek', description: 'Code-focused model', icon: CodeIcon },
];

const STORAGE_KEY = 'impersio_chat_state';

interface FeedbackModalProps {
  type: 'up' | 'down';
  onClose: () => void;
  onSubmit: (reasons: string[]) => void;
}

const FeedbackModal: React.FC<FeedbackModalProps> = ({ type, onClose, onSubmit }) => {
  const [selected, setSelected] = useState<string[]>([]);
  const options = type === 'up' 
    ? ['Up to date', 'Accurate', 'Helpful', 'Followed instructions', 'Good sources', 'Other...']
    : ['Out of date', 'Inaccurate', 'Wrong sources', 'Too long', 'Too short', 'Other...'];

  const toggleOption = (opt: string) => {
    setSelected(prev => prev.includes(opt) ? prev.filter(p => p !== opt) : [...prev, opt]);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
       <div className="bg-[#1F1F1F] border border-[#333] rounded-xl p-5 w-full max-w-md m-4 shadow-2xl animate-in zoom-in-95 duration-200">
          <div className="flex justify-between items-start mb-4">
             <h3 className="text-[#ECECEC] font-medium text-lg">
                {type === 'up' ? 'What did you like about this response?' : "What didn't you like about this response?"}
                <span className="text-[#888] text-sm ml-2 font-normal">(optional)</span>
             </h3>
             <button onClick={onClose} className="text-[#888] hover:text-[#ECECEC]">
               <X className="w-5 h-5" />
             </button>
          </div>
          
          <div className="grid grid-cols-2 gap-3 mb-6">
             {options.map(opt => (
                <button
                  key={opt}
                  onClick={() => toggleOption(opt)}
                  className={`px-4 py-2.5 rounded-lg text-sm font-medium transition-all text-center border ${
                    selected.includes(opt) 
                    ? 'bg-scira-accent/20 text-scira-accent border-scira-accent' 
                    : 'bg-[#2A2A2A] text-[#BBB] border-transparent hover:bg-[#333] hover:text-white'
                  }`}
                >
                   {opt}
                </button>
             ))}
          </div>
          
          <div className="flex justify-end gap-3">
             <button onClick={onClose} className="px-4 py-2 text-sm text-[#888] hover:text-white transition-colors">Skip</button>
             <button 
                onClick={() => { onSubmit(selected); onClose(); }}
                className="px-6 py-2 bg-scira-accent hover:bg-scira-accent-hover text-white text-sm font-medium rounded-lg transition-colors"
             >
                Submit Feedback
             </button>
          </div>
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

const MessageItem: React.FC<MessageItemProps> = ({ 
  msg, 
  isLast, 
  isLoading, 
}) => {
  const [activeTab, setActiveTab] = useState<'answer' | 'images' | 'sources'>('answer');
  const [isCopied, setIsCopied] = useState(false);
  const [feedbackType, setFeedbackType] = useState<'up' | 'down' | null>(null);
  const [isDownloadOpen, setIsDownloadOpen] = useState(false);
  const downloadRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (downloadRef.current && !downloadRef.current.contains(event.target as Node)) {
        setIsDownloadOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleCopy = () => {
    navigator.clipboard.writeText(msg.content);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Impersio Chat',
          text: msg.content,
        });
      } catch (err) {
        console.log('Share failed', err);
      }
    } else {
      handleCopy();
      alert('Link copied to clipboard');
    }
  };

  const handleDownload = (format: 'pdf' | 'md' | 'docx') => {
      const content = msg.content;
      // ... existing download logic ...
      setIsDownloadOpen(false);
  };

  if (!msg) return null;

  // --- USER MESSAGE ---
  if (msg.role === 'user') {
    return (
      <div className="w-full max-w-3xl mx-auto py-6 px-4 animate-fade-in flex justify-end">
          <div className="bg-[#F3F3F3] dark:bg-[#1A1A1A] text-primary px-5 py-2.5 rounded-2xl text-[20px] leading-relaxed max-w-[85%] font-sans">
             {msg.content}
          </div>
      </div>
    );
  }

  // --- ASSISTANT MESSAGE ---
  const hasSearch = (msg.sources && msg.sources.length > 0) || (msg.proSearchSteps && msg.proSearchSteps.length > 0);
  const displayedSources = msg.sources || [];
  const searchImages = msg.searchImages || [];

  return (
      <div className="w-full max-w-3xl mx-auto pb-8 px-4 animate-fade-in flex flex-col gap-2 relative group/msg">
        
        {feedbackType && (
            <FeedbackModal 
                type={feedbackType} 
                onClose={() => setFeedbackType(null)} 
                onSubmit={(reasons) => console.log('Feedback:', reasons)} 
            />
        )}

        {/* Pro Search Status */}
        {msg.proSearchSteps && msg.proSearchSteps.length > 0 && (
            <div className="mb-4">
                <ProSearchLogger steps={msg.proSearchSteps} />
            </div>
        )}

        {/* Tabs - Only show if there are sources */}
        {hasSearch && (
            <div className="flex items-center gap-6 border-b border-border/40 mb-6">
                <button 
                    onClick={() => setActiveTab('answer')}
                    className={`flex items-center gap-2 pb-3 text-sm font-medium transition-colors border-b-2 ${activeTab === 'answer' ? 'border-primary text-primary' : 'border-transparent text-muted hover:text-primary'}`}
                >
                    <Sparkles className="w-4 h-4" />
                    Answer
                </button>
                <button 
                    onClick={() => setActiveTab('images')}
                    className={`flex items-center gap-2 pb-3 text-sm font-medium transition-colors border-b-2 ${activeTab === 'images' ? 'border-primary text-primary' : 'border-transparent text-muted hover:text-primary'}`}
                >
                    <ImageIcon className="w-4 h-4" />
                    Images
                </button>
                <button 
                    onClick={() => setActiveTab('sources')}
                    className={`flex items-center gap-2 pb-3 text-sm font-medium transition-colors border-b-2 ${activeTab === 'sources' ? 'border-primary text-primary' : 'border-transparent text-muted hover:text-primary'}`}
                >
                    <AlignLeft className="w-4 h-4" />
                    Sources
                    {displayedSources.length > 0 && <span className="bg-surface-hover text-xs py-0.5 px-1.5 rounded-full">{displayedSources.length}</span>}
                </button>
            </div>
        )}

        {/* Tab Content */}
        <div className="flex flex-col gap-4">
            
            {activeTab === 'answer' && (
                <>
                    {/* Sources Grid (Top 4) */}
                    {hasSearch && displayedSources.length > 0 && (
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
                            {displayedSources.slice(0, 4).map((source, idx) => (
                                <a 
                                    key={idx}
                                    href={source.link}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="flex flex-col p-3 rounded-lg bg-surface hover:bg-surface-hover border border-border transition-all h-20 justify-between group shadow-sm hover:shadow-md"
                                >
                                    <div className="flex items-center gap-2 mb-1">
                                        <div className="w-4 h-4 rounded-full bg-border/50 overflow-hidden shrink-0">
                                            <img 
                                                src={`https://www.google.com/s2/favicons?domain=${new URL(source.link).hostname}&sz=32`}
                                                className="w-full h-full object-cover"
                                                onError={(e) => (e.target as HTMLImageElement).style.display = 'none'}
                                                alt=""
                                            />
                                        </div>
                                        <div className="text-[11px] text-muted truncate font-medium">{source.displayLink}</div>
                                    </div>
                                    <div className="text-xs font-medium text-primary line-clamp-2 leading-tight">
                                        {source.title}
                                    </div>
                                </a>
                            ))}
                        </div>
                    )}

                    {/* Thinking Indicator */}
                    {isLoading && isLast && !msg.content && (!msg.proSearchSteps || msg.proSearchSteps.length === 0) && (
                        <div className="flex items-center gap-3 mb-6 animate-pulse">
                            <ImpersioLogo className="w-6 h-6 text-scira-accent animate-spin-slow" />
                        </div>
                    )}

                    {/* Main Content */}
                    <div className="min-h-[20px] font-serif text-lg leading-relaxed text-primary">
                        <MessageContent 
                            content={msg.content} 
                            isStreaming={isLast && isLoading} 
                            sources={msg.sources}
                        />
                    </div>

                    {/* Widgets */}
                    {msg.widget && (
                        <div className="mt-8">
                            {msg.widget.type === 'time' && <TimeWidget data={msg.widget.data} />}
                            {msg.widget.type === 'weather' && <WeatherWidget data={msg.widget.data} />}
                            {msg.widget.type === 'stock' && <StockWidget data={msg.widget.data} />}
                            {msg.widget.type === 'slides' && <SlidesWidget data={msg.widget.data} />}
                        </div>
                    )}
                </>
            )}

            {activeTab === 'images' && (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
                    {searchImages.length > 0 ? (
                        searchImages.slice(0, 6).map((img, idx) => (
                            <div key={idx} className="aspect-video bg-surface rounded-xl overflow-hidden border border-border relative group">
                                <img src={img} alt="Result" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                            </div>
                        ))
                    ) : displayedSources.length > 0 ? (
                         // Fallback to source images if no direct search images
                         displayedSources.slice(0, 6).filter(s => s.image).map((s, idx) => (
                            <div key={idx} className="aspect-video bg-surface rounded-xl overflow-hidden border border-border relative group">
                                <img src={s.image} alt={s.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                                <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                                    <p className="text-[10px] text-white truncate">{s.title}</p>
                                </div>
                            </div>
                         ))
                    ) : (
                        <div className="col-span-full py-12 text-center text-muted">
                            <ImageIcon className="w-12 h-12 mx-auto mb-4 opacity-20" />
                            No images found
                        </div>
                    )}
                </div>
            )}

            {activeTab === 'sources' && (
                <div className="grid grid-cols-1 gap-3 animate-in fade-in slide-in-from-bottom-2 duration-300">
                    {displayedSources.map((source, idx) => (
                        <a 
                            key={idx}
                            href={source.link}
                            target="_blank"
                            rel="noreferrer"
                            className="flex items-start gap-4 p-4 rounded-xl bg-surface hover:bg-surface-hover border border-border transition-all group"
                        >
                            <div className="w-8 h-8 rounded-full bg-border/50 overflow-hidden shrink-0 mt-1">
                                <img 
                                    src={`https://www.google.com/s2/favicons?domain=${new URL(source.link).hostname}&sz=32`}
                                    className="w-full h-full object-cover"
                                    onError={(e) => (e.target as HTMLImageElement).style.display = 'none'}
                                    alt=""
                                />
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="text-sm font-semibold text-primary truncate mb-1 group-hover:text-blue-500 transition-colors">
                                    {source.title}
                                </div>
                                <div className="text-xs text-muted truncate mb-2 font-mono">
                                    {source.link}
                                </div>
                                <p className="text-sm text-muted/80 line-clamp-2 leading-relaxed">
                                    {source.snippet}
                                </p>
                            </div>
                        </a>
                    ))}
                </div>
            )}

            {/* Action Bar (Only visible in Answer tab usually, but can be global) */}
            {activeTab === 'answer' && (
                <div className="flex items-center gap-1 mt-4 opacity-100 transition-opacity duration-200">
                    <button 
                        onClick={handleCopy}
                        className="p-2 text-muted hover:text-primary hover:bg-surface-hover rounded-lg transition-all" 
                        title={isCopied ? "Copied" : "Copy"}
                    >
                        {isCopied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                    </button>
                    
                    <button 
                        onClick={() => setFeedbackType('up')}
                        className="p-2 text-muted hover:text-primary hover:bg-surface-hover rounded-lg transition-all" 
                        title="Good response"
                    >
                        <ThumbsUp className="w-4 h-4" />
                    </button>
                    
                    <button 
                        onClick={() => setFeedbackType('down')}
                        className="p-2 text-muted hover:text-primary hover:bg-surface-hover rounded-lg transition-all" 
                        title="Bad response"
                    >
                        <ThumbsDown className="w-4 h-4" />
                    </button>
                    
                    <button 
                        onClick={handleShare}
                        className="p-2 text-muted hover:text-primary hover:bg-surface-hover rounded-lg transition-all" 
                        title="Share"
                    >
                        <Share className="w-4 h-4" />
                    </button>

                    {/* Download Dropdown */}
                    <div className="relative" ref={downloadRef}>
                        <button 
                            onClick={() => setIsDownloadOpen(!isDownloadOpen)}
                            className={`p-2 hover:text-primary hover:bg-surface-hover rounded-lg transition-all ${isDownloadOpen ? 'text-primary bg-surface-hover' : 'text-muted'}`}
                            title="Download"
                        >
                            <Download className="w-4 h-4" />
                        </button>
                        
                        {isDownloadOpen && (
                            <div className="absolute top-full left-0 mt-2 w-36 bg-surface border border-border rounded-xl shadow-2xl py-1 z-50 animate-in fade-in zoom-in-95 duration-100">
                                <button 
                                    onClick={() => handleDownload('pdf')}
                                    className="w-full text-left px-4 py-2.5 text-sm text-muted hover:text-primary hover:bg-surface-hover flex items-center gap-2"
                                >
                                    <FileText className="w-3.5 h-3.5" /> PDF
                                </button>
                                <button 
                                    onClick={() => handleDownload('md')}
                                    className="w-full text-left px-4 py-2.5 text-sm text-muted hover:text-primary hover:bg-surface-hover flex items-center gap-2"
                                >
                                    <File className="w-3.5 h-3.5" /> Markdown
                                </button>
                                <button 
                                    onClick={() => handleDownload('docx')}
                                    className="w-full text-left px-4 py-2.5 text-sm text-muted hover:text-primary hover:bg-surface-hover flex items-center gap-2"
                                >
                                    <FileText className="w-3.5 h-3.5" /> DOCX
                                </button>
                            </div>
                        )}
                    </div>

                    <div className="flex-1" />
                    
                    <button 
                        className="p-2 text-muted hover:text-primary hover:bg-surface-hover rounded-lg transition-all" 
                        title="Retry"
                    >
                        <RotateCcw className="w-4 h-4" />
                    </button>
                </div>
            )}
        </div>
      </div>
  );
};

export default function App() {
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

  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [selectedModel, setSelectedModel] = useState<ModelOption>(MODEL_OPTIONS[0]);
  const [isLoading, setIsLoading] = useState(false);
  const [isDeepMode, setIsDeepMode] = useState(false); // Deep Research State
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [view, setView] = useState<'home' | 'discover' | 'about'>('home');
  const [attachments, setAttachments] = useState<string[]>([]);
  const [isMobile, setIsMobile] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [conversationId, setConversationId] = useState<string | null>(null);
  
  // Modals
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isModelSelectorOpen, setIsModelSelectorOpen] = useState(false);
  const [isSubscriptionModalOpen, setIsSubscriptionModalOpen] = useState(false);
  const [isSearchModesOpen, setIsSearchModesOpen] = useState(false);
  const [searchMode, setSearchMode] = useState('web');

  const { theme, setTheme } = useTheme();

  // Load user on mount and check model permission
  useEffect(() => {
    const currentUser = authService.getCurrentUser();
    setUser(currentUser);
    
    // Enforce model lock if not pro
    if (!currentUser?.is_pro && selectedModel.id !== MODEL_OPTIONS[0].id) {
        setSelectedModel(MODEL_OPTIONS[0]);
    }
  }, []);

  useEffect(() => {
    const fetchSuggestions = async () => {
      if (query.trim().length < 2) {
        setSuggestions([]);
        return;
      }
      const newSuggestions = await getSuggestions(query);
      setSuggestions(newSuggestions);
    };

    const debounce = setTimeout(fetchSuggestions, 300);
    return () => clearTimeout(debounce);
  }, [query]);

  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        messages,
        hasSearched
      }));
    }
  }, [messages, hasSearched]);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.max(24, Math.min(textareaRef.current.scrollHeight, 160))}px`;
    }
  }, [query]);

  useEffect(() => {
    if (messagesEndRef.current) {
        messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages.length]); 

  const cycleTheme = () => {
    setTheme(prev => {
      if (prev === 'system') return 'light';
      if (prev === 'light') return 'dark';
      return 'system';
    });
  };

  const handleSearch = async (overrideQuery?: string) => {
    const finalQuery = overrideQuery || query;
    setSuggestions([]);

    if ((!finalQuery.trim() && attachments.length === 0) || isLoading) return;

    setIsLoading(true);
    setQuery(''); 
    const currentAttachments = [...attachments];
    setAttachments([]);
    if (textareaRef.current) textareaRef.current.style.height = 'auto';

    let currentConversationId = conversationId;

    if (!hasSearched) {
      setHasSearched(true);
      const title = finalQuery.length > 30 ? finalQuery.substring(0, 30) + "..." : finalQuery || "Search";
      const newId = await createConversation(title, user?.id || 'guest');
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

    const modelId = selectedModel.id;
    
    try {
        setMessages(prev => [...prev, { 
            role: 'assistant', 
            content: '', 
            sources: [], 
            searchImages: [],
            proSearchSteps: []
        }]);

        // --- INTENT DETECTION ---
        // Automatically determine if Pro Search (Deep Research) is needed
        let executeProSearch = isDeepMode;
        let needsSearch = true; // Default

        if (!isDeepMode) {
             const intent = await detectIntent(finalQuery);
             needsSearch = intent.search;
             executeProSearch = intent.isPro;
        }

        // --- DEEP RESEARCH LOGIC ---
        if (executeProSearch) {
            await orchestrateProSearch(
                finalQuery,
                modelId,
                messages,
                (steps) => {
                    setMessages(prev => {
                        const newMessages = [...prev];
                        const lastIndex = newMessages.length - 1;
                        if (newMessages[lastIndex].role === 'assistant') {
                            newMessages[lastIndex] = {
                                ...newMessages[lastIndex],
                                proSearchSteps: steps
                            };
                        }
                        return newMessages;
                    });
                },
                (content, sources) => {
                    setMessages(prev => {
                        const newMessages = [...prev];
                        const lastIndex = newMessages.length - 1;
                         if (newMessages[lastIndex].role === 'assistant') {
                            newMessages[lastIndex] = {
                                ...newMessages[lastIndex],
                                content: content,
                                sources: sources
                            };
                        }
                        return newMessages;
                    });
                }
            );
        } 
        // --- STANDARD SEARCH LOGIC ---
        else {
            let allSources: SearchResult[] = [];
            let allImages: string[] = [];
            
            if (needsSearch) {
                 const searchResult = await searchFast(finalQuery);
                 if (searchResult && searchResult.results) {
                     allSources = searchResult.results;
                     allImages = searchResult.images || [];
                 }
                 // Deduplicate sources
                 allSources = allSources.filter((s, index, self) => 
                     index === self.findIndex((t) => (t.link === s.link))
                 );
            }

            await streamResponse(
                finalQuery,
                modelId,
                messages.slice(-6),
                allSources,
                currentAttachments,
                false,
                isMobile,
                (chunk) => {
                        setMessages(prev => {
                        if (!prev || prev.length === 0) return prev;
                        const newMessages = [...prev];
                        const lastIndex = newMessages.length - 1;
                        if (newMessages[lastIndex].role === 'assistant') {
                            newMessages[lastIndex] = { 
                                ...newMessages[lastIndex], 
                                content: chunk, 
                                sources: allSources,
                                searchImages: allImages
                            };
                        }
                        return newMessages;
                    });
                },
                (widget) => {
                        setMessages(prev => {
                        const newMessages = [...prev];
                        const lastIndex = newMessages.length - 1;
                        newMessages[lastIndex].widget = widget;
                        return newMessages;
                    });
                },
                (related) => {
                    setMessages(prev => {
                        const newMessages = [...prev];
                        const lastIndex = newMessages.length - 1;
                        newMessages[lastIndex].relatedQuestions = related;
                        return newMessages;
                    });
                }
            );
        }

    } catch (e) {
      console.error("Search failed", e);
      const errorMessage = "Sorry, I encountered an error.";
      setMessages(prev => {
          if (!prev || prev.length === 0) return prev;
          const newMessages = [...prev];
          const lastMsg = newMessages[newMessages.length - 1];
          if (lastMsg && lastMsg.role === 'assistant' && !lastMsg.content) {
              newMessages[newMessages.length - 1] = { ...lastMsg, content: errorMessage };
          } else {
             newMessages.push({ role: 'assistant', content: errorMessage });
          }
          return newMessages;
      });
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

  const handleNewChat = () => {
     setHasSearched(false);
     setMessages([]);
     setConversationId(null);
     setQuery('');
     setAttachments([]);
     setView('home');
     setSuggestions([]);
     setIsDeepMode(false);
     localStorage.removeItem(STORAGE_KEY); 
  };

  const renderInputBar = (isInitial: boolean) => (
    <div className={`w-full ${isInitial ? 'max-w-2xl' : 'max-w-3xl'} mx-auto relative z-30 transition-all duration-500`}>
      <div className={`
        relative flex flex-col w-full bg-surface
        rounded-[26px]
        border border-border
        shadow-[0_0_15px_rgba(0,0,0,0.03)]
        transition-all duration-300
        overflow-visible
        group
        ${isInitial ? 'min-h-[140px]' : ''}
      `}>
         <div className="flex flex-col px-4 pt-4 pb-2 h-full">
             <textarea
                ref={textareaRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={isInitial ? "Ask Anything" : "Reply..."}
                className={`w-full bg-transparent text-primary placeholder:text-muted/40 text-[20px] font-light px-1 focus:outline-none resize-none overflow-hidden mb-2 font-sans`}
                style={{ minHeight: '44px' }}
                rows={1}
                autoFocus={isInitial && !isMobile}
              />
              
              <div className={`flex items-center justify-between mt-auto pt-2 ${isInitial ? 'absolute bottom-3 left-3 right-3' : ''}`}>
                 <div className="flex items-center gap-1">
                     <button 
                        onClick={() => setIsDeepMode(false)}
                        className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium transition-colors border 
                           ${!isDeepMode 
                             ? 'bg-transparent text-scira-accent border-border/60 shadow-[0_1px_2px_rgba(0,0,0,0.05)]' 
                             : 'text-muted/60 border-transparent hover:text-primary'}`}
                     >
                        <Search className="w-4 h-4" strokeWidth={2.5} />
                        <span>Search</span>
                     </button>
                     <button 
                        onClick={() => setIsDeepMode(true)}
                        className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium transition-colors border
                           ${isDeepMode 
                             ? 'bg-transparent text-scira-accent border-border shadow-sm' 
                             : 'text-muted/60 border-transparent hover:text-primary'}`}
                     >
                        <Atom className="w-4 h-4" strokeWidth={2.5} />
                        <span>Research</span>
                     </button>
                 </div>

                 <div className="flex items-center gap-3">
                     {/* Model Selector on Chip/CPU Icon */}
                     <ModelSelector
                        selectedModel={selectedModel}
                        models={MODEL_OPTIONS}
                        onSelect={setSelectedModel}
                        isOpen={isModelSelectorOpen}
                        onToggle={() => setIsModelSelectorOpen(!isModelSelectorOpen)}
                        isPro={!!user?.is_pro}
                        onOpenProModal={() => user ? setIsSubscriptionModalOpen(true) : setIsAuthModalOpen(true)}
                        trigger={
                           <button className="text-muted/60 hover:text-primary transition-colors" title="Model">
                              <Cpu className="w-5 h-5" strokeWidth={2} />
                           </button>
                        }
                     />

                     {/* Search Modes on Globe Icon */}
                     <div className="relative flex items-center">
                        <button 
                          onClick={() => setIsSearchModesOpen(!isSearchModesOpen)}
                          className={`text-muted/60 hover:text-primary transition-colors ${isSearchModesOpen ? 'text-primary' : ''}`}
                          title="Focus"
                        >
                           <Globe className="w-5 h-5" strokeWidth={2} />
                        </button>
                        <SearchModes 
                           activeMode={searchMode}
                           onSelect={setSearchMode}
                           isOpen={isSearchModesOpen}
                           onClose={() => setIsSearchModesOpen(false)}
                        />
                     </div>

                     <button className="text-muted/60 hover:text-primary transition-colors" title="Attach">
                         <Paperclip className="w-5 h-5" strokeWidth={2} />
                     </button>

                     <div className="w-px h-5 bg-border mx-1"></div> {/* Separator */}

                     <button className="bg-surface-hover/50 hover:bg-surface-hover text-primary p-2 rounded-full transition-colors" title="Voice">
                         <Mic className="w-5 h-5" strokeWidth={2} />
                     </button>
                     
                     <button 
                        onClick={() => handleSearch()}
                        disabled={!query.trim() && attachments.length === 0}
                        className={`flex items-center justify-center w-10 h-10 rounded-xl transition-all duration-200 
                            bg-scira-accent text-white hover:opacity-90 shadow-md ml-2`}
                     >
                        {query.trim() ? <ArrowUp className="w-5 h-5" strokeWidth={3} /> : <AudioLines className="w-5 h-5" />}
                     </button>
                 </div>
              </div>
         </div>
          
          {suggestions.length > 0 && query.trim().length > 0 && (
             <div className="absolute top-full left-0 right-0 mt-2 bg-surface border border-border rounded-xl shadow-2xl overflow-hidden z-50 animate-fade-in mx-0 p-1">
                {suggestions.map((suggestion, index) => (
                   <button
                      key={index}
                      onClick={() => {
                         setQuery(suggestion);
                         handleSearch(suggestion);
                      }}
                      className="w-full flex items-center gap-3 px-3 py-2.5 text-left hover:bg-surface-hover rounded-lg transition-colors group"
                   >
                      <Search className="w-4 h-4 text-muted group-hover:text-primary transition-colors" />
                      <span className="text-sm font-medium text-primary font-sans">{suggestion}</span>
                   </button>
                ))}
             </div>
          )}
      </div>
    </div>
  );

  return (
    <SidebarProvider>
      <div className={`min-h-screen bg-background text-primary font-sans selection:bg-scira-accent/20 flex flex-row overflow-hidden transition-colors duration-300 w-full`}>
        <AppSidebar 
          currentView={view} 
          onNavigate={setView}
          onNewChat={handleNewChat}
          onToggleHistory={() => setIsHistoryOpen(true)}
          onSignIn={() => setIsAuthModalOpen(true)}
          onUpgrade={() => {
              if (user) {
                  setIsSubscriptionModalOpen(true);
              } else {
                  setIsAuthModalOpen(true);
              }
          }}
          user={user}
          theme={theme}
          onToggleTheme={cycleTheme}
        />

        <HistorySidebar
          isOpen={isHistoryOpen}
          onClose={() => setIsHistoryOpen(false)}
          onSelectChat={(id, title) => {}}
          onNewChat={handleNewChat}
          userId={user?.id}
          onSignIn={() => { setIsHistoryOpen(false); setIsAuthModalOpen(true); }}
          onOpenAbout={() => { setIsHistoryOpen(false); setView('about'); }}
          theme={theme}
          onToggleTheme={cycleTheme}
        />

        <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
        <SubscriptionModal isOpen={isSubscriptionModalOpen} onClose={() => setIsSubscriptionModalOpen(false)} />

        <SidebarInset>
           <main className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden relative transition-all duration-300">
             {/* Mobile Sidebar Trigger */}
             <div className="md:hidden fixed top-3 left-3 z-50">
                 <SidebarTrigger />
             </div>

             {view === 'about' && <About onBack={() => setView('home')} />}
             {view === 'discover' && <Discover onBack={() => setView('home')} />}

             {view === 'home' && (
                <div className="flex-1 flex flex-col h-full relative">
                  {!hasSearched ? (
                    <div className="flex flex-col items-center justify-center p-4 w-full h-full animate-fade-in max-w-4xl mx-auto">
                        
                        {/* Logo Area */}
                        <div className="w-full max-w-2xl mb-10 flex flex-col items-center text-center">
                          <div className="flex items-center gap-4 mb-2">
                             <ImpersioLogo className="w-14 h-14 text-scira-accent" />
                             <span className="text-4xl md:text-5xl font-medium text-primary font-serif tracking-tight">
                                Impersio
                             </span>
                          </div>
                        </div>

                        {renderInputBar(true)}
                    </div>
                  ) : (
                    <div className="flex-1 flex flex-col relative h-full">
                        <div className="flex-1 overflow-y-auto pb-40 pt-6 px-4 md:px-0 scroll-smooth">
                          <div className="flex flex-col w-full"> 
                            {messages.map((msg, idx) => (
                                <MessageItem 
                                  key={idx}
                                  msg={msg}
                                  isLast={idx === messages.length - 1}
                                  isLoading={isLoading}
                                  onSearch={handleSearch}
                                />
                            ))}
                            <div ref={messagesEndRef} />
                          </div>
                        </div>
                        
                        <div className="absolute bottom-0 left-0 w-full bg-gradient-to-t from-background via-background to-transparent pt-12 pb-8 z-20 px-4">
                          <div className="max-w-3xl mx-auto">
                              {renderInputBar(false)}
                          </div>
                        </div>
                    </div>
                  )}
                </div>
             )}
           </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
