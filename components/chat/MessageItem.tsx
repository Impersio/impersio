import React, { useState } from 'react';
import { Share2, RotateCcw, Copy, Check, Loader2, Search, Globe, CircleDashed, ArrowRight } from 'lucide-react';
import { Message } from '../../types';
import { Thinking } from '../Thinking';
import { MessageContent } from '../MessageContent';
import { ImpersioLogo } from '../Icons';

interface MessageItemProps {
  msg: Message;
  isLast: boolean;
  isLoading: boolean;
  onShare: () => void;
  onRewrite: (query: string) => void;
}

export const MessageItem: React.FC<MessageItemProps> = ({ msg, isLast, isLoading, onShare, onRewrite }) => {
  if (msg.role === 'user') {
    return (
      <div className="w-full max-w-3xl mx-auto pt-10 pb-6 px-4 animate-fade-in">
         <h1 className="text-[32px] font-medium text-primary tracking-tight leading-tight font-sans">
           {msg.content}
         </h1>
      </div>
    );
  }

  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    navigator.clipboard.writeText(msg.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="w-full max-w-3xl mx-auto pb-12 px-4 animate-fade-in font-sans">
      <div className="flex flex-col gap-6">
        
        {/* Copilot / Search Progress Events */}
        {msg.copilotEvents && msg.copilotEvents.length > 0 && !msg.content && !msg.reasoning && (
           <div className="animate-in fade-in slide-in-from-bottom-2 duration-300 mb-2">
                {msg.copilotEvents.map((event) => (
                    <div key={event.id} className="flex flex-col gap-2 mb-3">
                         <div className="flex items-center gap-2.5 text-sm text-muted">
                            {event.status === 'loading' ? (
                                <Loader2 className="w-4 h-4 animate-spin text-scira-accent" />
                            ) : (
                                <Check className="w-4 h-4 text-emerald-500" />
                            )}
                            <span className="font-medium text-primary/90">{event.message}</span>
                         </div>
                         {event.items && event.items.length > 0 && (
                            <div className="pl-6 flex flex-col gap-1.5 mt-1">
                                {event.items.map((item, idx) => (
                                    <div key={idx} className="flex items-center gap-2 text-xs text-muted">
                                        <Search className="w-3 h-3 opacity-50" />
                                        <span className="truncate">{item}</span>
                                    </div>
                                ))}
                            </div>
                         )}
                    </div>
                ))}
           </div>
        )}

        {/* Sources Section (Above Answer) */}
        {msg.sources && msg.sources.length > 0 && (
          <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-sm font-medium text-primary flex items-center gap-2">
                 <Globe className="w-4 h-4" /> Sources
              </span>
            </div>
            <div className="flex gap-3 overflow-x-auto pb-2 no-scrollbar">
              {msg.sources.slice(0, 4).map((source, idx) => (
                <a 
                  key={idx} href={source.link} target="_blank" rel="noreferrer"
                  className="flex-shrink-0 w-44 flex flex-col p-3 rounded-lg bg-surface hover:bg-surface-hover border border-border transition-all h-[80px] justify-between group"
                >
                  <div className="text-xs font-medium text-primary line-clamp-2 leading-snug group-hover:text-scira-accent transition-colors">
                    {source.title}
                  </div>
                  <div className="flex items-center gap-1.5 mt-auto">
                    <img 
                      src={`https://www.google.com/s2/favicons?domain=${new URL(source.link).hostname}&sz=32`} 
                      className="w-3 h-3 rounded-full opacity-60 grayscale group-hover:grayscale-0 transition-all" 
                      alt=""
                    />
                    <div className="text-[10px] text-muted font-medium truncate flex-1">
                      {source.displayLink}
                    </div>
                  </div>
                </a>
              ))}
              {msg.sources.length > 4 && (
                 <button className="flex-shrink-0 h-[80px] w-20 flex items-center justify-center rounded-lg bg-surface border border-border text-xs text-muted font-medium hover:bg-surface-hover transition-colors">
                    View {msg.sources.length - 4} more
                 </button>
              )}
            </div>
          </div>
        )}

        {/* Answer Section */}
        <div className="min-h-[20px] animate-in fade-in slide-in-from-bottom-3 duration-700">
           <div className="flex items-center gap-2 mb-3">
              <ImpersioLogo className="w-5 h-5 text-scira-accent" />
              <span className="text-sm font-medium text-primary">Impersio</span>
            </div>
          
          {/* Reasoning / Thinking Block */}
          {msg.reasoning && (
             <Thinking content={msg.reasoning} isComplete={!isLoading || !isLast || !!msg.content} />
          )}

          {isLoading && isLast && !msg.content && !msg.reasoning ? (
             <div className="w-full space-y-4 opacity-10 py-2">
                {/* Loader Placeholder if needed */}
             </div>
          ) : (
            <div className="w-full">
              <MessageContent content={msg.content} isStreaming={isLast && isLoading} sources={msg.sources} />
              
              {!isLoading && msg.content && (
                <div className="mt-6 flex items-center justify-between">
                   <div className="flex items-center gap-2">
                      <button onClick={onShare} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-surface hover:bg-surface-hover border border-border/50 text-muted hover:text-primary transition-colors text-xs font-medium">
                         <Share2 className="w-3.5 h-3.5" /> Share
                      </button>
                      <button onClick={() => onRewrite(msg.content)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-surface hover:bg-surface-hover border border-border/50 text-muted hover:text-primary transition-colors text-xs font-medium">
                         <RotateCcw className="w-3.5 h-3.5" /> Rewrite
                      </button>
                      <button onClick={handleCopy} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-surface hover:bg-surface-hover border border-border/50 text-muted hover:text-primary transition-colors text-xs font-medium">
                         {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                         {copied ? 'Copied' : 'Copy'}
                      </button>
                   </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Related Section */}
        {msg.relatedQuestions && msg.relatedQuestions.length > 0 && !isLoading && (
           <div className="animate-in fade-in slide-in-from-bottom-2 duration-700 pt-4 border-t border-border/50">
               <div className="flex items-center gap-2 mb-3">
                  <span className="text-sm font-medium text-primary flex items-center gap-2">
                      <CircleDashed className="w-4 h-4" /> Related
                  </span>
               </div>
              <div className="flex flex-col gap-2">
                 {msg.relatedQuestions.map((q, i) => (
                    <button 
                      key={i}
                      onClick={() => onRewrite(q)}
                      className="w-full text-left py-2.5 px-4 rounded-lg bg-surface border border-border/50 hover:bg-surface-hover text-sm font-medium text-primary transition-all flex items-center justify-between group"
                    >
                       <span>{q}</span>
                       <ArrowRight className="w-4 h-4 text-muted opacity-0 -translate-x-2 group-hover:translate-x-0 group-hover:opacity-100 transition-all" />
                    </button>
                 ))}
              </div>
           </div>
        )}
      </div>
    </div>
  );
};
