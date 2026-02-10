import React, { useState, useRef, useEffect } from 'react';
import { 
  BrainCircuit,
  Zap,
  Code as CodeIcon,
  CircleDashed,
} from 'lucide-react';
import { authService } from './services/authService';
import { User, ModelOption } from './types';
import { Discover } from './components/Discover';
import { Library } from './components/Library';
import { AuthModal } from './components/AuthModal';
import { AppSidebar } from './components/AppSidebar';
import { useTheme } from './hooks/useTheme';
import { getConversationMessages } from './services/chatStorageService';
import { MetaIcon, GeminiIcon, ImpersioLogo } from './components/Icons';
import { SubscriptionModal } from './components/SubscriptionModal';
import { useChat } from './hooks/useChat';
import { MessageItem } from './components/chat/MessageItem';
import { InputBar } from './components/search/InputBar';

// --- Available Models ---
const MODELS: ModelOption[] = [
    { id: 'moonshotai/kimi-k2-instruct-0905', name: 'Kimi K2', icon: Zap, description: 'Advanced Logic' },
    { id: 'gemini-3-flash-preview', name: 'Gemini 3 Flash', icon: GeminiIcon, description: 'Fast & Intelligent' },
    { id: 'gemini-3-pro-preview', name: 'Gemini 3 Pro', icon: GeminiIcon, description: 'High Reasoning' },
    { id: 'tngtech/deepseek-r1t2-chimera:free', name: 'DeepSeek R1t2', icon: BrainCircuit, description: 'Deep Thinking (New)', isReasoning: true },
    { id: 'openai/gpt-oss-120b', name: 'GPT OSS 120b', icon: CircleDashed, description: 'Open Reasoning', isReasoning: true },
    { id: 'meta-llama/llama-4-scout-17b-16e-instruct', name: 'Llama 4 Scout', icon: MetaIcon, description: 'Latest Architecture' },
    { id: 'qwen/qwen3-32b', name: 'Qwen 3', icon: CodeIcon, description: 'Coding Expert' },
];

export default function App() {
  const { 
    messages, 
    setMessages, 
    hasSearched, 
    setHasSearched, 
    isLoading, 
    handleSearch, 
    setActiveConversationId 
  } = useChat();
  
  const [query, setQuery] = useState('');
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isProModalOpen, setIsProModalOpen] = useState(false);
  const [view, setView] = useState<'home' | 'discover' | 'library' | 'profile'>('home');
  const [user, setUser] = useState<User | null>(null);
  const [selectedModel, setSelectedModel] = useState<ModelOption>(MODELS[0]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => { setUser(authService.getCurrentUser()); }, []);
  
  useEffect(() => { 
    if (messagesEndRef.current) messagesEndRef.current.scrollIntoView({ behavior: 'smooth' }); 
  }, [messages.length, messages[messages.length-1]?.content]);

  const onSearch = (overrideQuery?: string) => {
      const q = overrideQuery || query;
      handleSearch(q, selectedModel.id);
      setQuery('');
  };

  return (
    <div className="flex h-screen w-full bg-background text-primary font-sans selection:bg-[#1c7483]/20">
      <AppSidebar 
        currentView={view} 
        onNavigate={setView} 
        onNewChat={() => { setMessages([]); setHasSearched(false); setActiveConversationId(null); setView('home'); setSelectedModel(MODELS[0]); }}
        onSignIn={() => setIsAuthModalOpen(true)}
        user={user}
      />
      
      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
      <SubscriptionModal isOpen={isProModalOpen} onClose={() => setIsProModalOpen(false)} />
      
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden relative h-full">
           {view === 'home' && (
              <div className="flex-1 flex flex-col h-full relative">
                {!hasSearched ? (
                  <div className="flex-1 flex flex-col items-center justify-center p-4">
                      {/* Center Content with Optical Adjustment (Middle) */}
                      <div className="w-full max-w-2xl flex flex-col items-center -mt-20 animate-fade-in">
                           <h1 className="text-[42px] font-medium tracking-tight text-primary mb-8 font-sans">
                              Impersio
                           </h1>
                           <InputBar 
                              query={query} 
                              setQuery={setQuery} 
                              handleSearch={() => onSearch()} 
                              isInitial={true}
                              selectedModel={selectedModel}
                              setSelectedModel={setSelectedModel}
                              models={MODELS}
                           />
                      </div>
                  </div>
                ) : (
                  <div className="flex-1 overflow-y-auto pb-48 pt-0 px-0 scroll-smooth">
                    <div className="flex flex-col w-full"> 
                      {messages.map((msg, idx) => ( 
                        <MessageItem 
                            key={idx} 
                            msg={msg} 
                            isLast={idx === messages.length - 1} 
                            isLoading={isLoading} 
                            onShare={() => {}} 
                            onRewrite={onSearch} 
                        /> 
                      ))}
                      <div ref={messagesEndRef} />
                    </div>
                  </div>
                )}
                
                {hasSearched && (
                  <div className="absolute bottom-0 left-0 w-full bg-gradient-to-t from-background via-background/95 to-transparent pt-10 pb-6 z-20">
                      <InputBar 
                          query={query} 
                          setQuery={setQuery} 
                          handleSearch={() => onSearch()} 
                          isInitial={false}
                          selectedModel={selectedModel}
                          setSelectedModel={setSelectedModel}
                          models={MODELS}
                       />
                  </div>
                )}
                
                {/* Footer Help/Language Buttons */}
                {!hasSearched && (
                    <div className="absolute bottom-6 right-6 flex items-center gap-2">
                        <button className="w-8 h-8 flex items-center justify-center rounded-full bg-white dark:bg-[#202020] border border-gray-200 dark:border-gray-700 text-gray-400 hover:text-primary transition-colors shadow-sm">
                            <span className="text-[10px] font-bold">文A</span>
                        </button>
                         <button className="w-8 h-8 flex items-center justify-center rounded-full bg-white dark:bg-[#202020] border border-gray-200 dark:border-gray-700 text-gray-400 hover:text-primary transition-colors shadow-sm">
                            <span className="text-sm font-bold">?</span>
                        </button>
                    </div>
                )}
              </div>
           )}
           {view === 'discover' && <Discover onBack={() => setView('home')} />}
           {view === 'library' && <Library onSelectThread={(id) => { setActiveConversationId(id); getConversationMessages(id).then(msgs => { setMessages(msgs); setHasSearched(true); setView('home'); }); }} />}
           {view === 'profile' && (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-12">
                 <div className="w-20 h-20 rounded-full bg-surface flex items-center justify-center mb-8 border border-border shadow-sm">
                    <ImpersioLogo className="w-10 h-10 text-scira-accent" />
                 </div>
                 <h2 className="text-2xl font-medium tracking-tight mb-2 font-sans">Your Profile</h2>
                 <p className="text-muted max-w-sm text-sm font-sans">Settings and preferences coming soon.</p>
              </div>
           )}
      </main>
    </div>
  );
}