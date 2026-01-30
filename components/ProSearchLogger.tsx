
import React, { useState, useEffect } from 'react';
import { Check, Loader2, ChevronDown, ChevronRight, Search, BrainCircuit } from 'lucide-react';
import { ProSearchStep } from '../types';

interface ProSearchLoggerProps {
  steps: ProSearchStep[];
  isOpen?: boolean;
}

export const ProSearchLogger: React.FC<ProSearchLoggerProps> = ({ steps }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const completedCount = steps.filter(s => s.status === 'completed').length;
  const isComplete = steps.every(s => s.status === 'completed');

  if (!steps || steps.length === 0) return null;

  // Minimal collapsed view (Reference style)
  if (!isExpanded) {
     return (
       <div className="mb-6 animate-fade-in">
          <button 
             onClick={() => setIsExpanded(true)}
             className="flex items-center gap-2 text-sm text-scira-accent hover:text-scira-accent/80 transition-colors bg-surface/50 px-3 py-2 rounded-lg border border-border/30"
          >
             {isComplete ? (
                 <span className="font-medium flex items-center gap-2"><Check className="w-4 h-4" /> Research Complete</span>
             ) : (
                 <span className="font-medium flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" /> 
                    Deep Thinking... ({completedCount}/{steps.length})
                 </span>
             )}
             <ChevronRight className="w-4 h-4 opacity-50" />
          </button>
       </div>
     );
  }

  // Expanded View
  return (
    <div className="w-full max-w-3xl bg-[#191919] border border-border/50 rounded-xl overflow-hidden mb-6 animate-fade-in font-sans shadow-2xl">
      <div 
        className="flex items-center justify-between px-4 py-3 bg-[#202020] border-b border-border/50 cursor-pointer"
        onClick={() => setIsExpanded(false)}
      >
        <div className="flex items-center gap-2">
          <BrainCircuit className="w-4 h-4 text-scira-accent" />
          <span className="text-sm font-medium text-primary">Research Logic</span>
        </div>
        <ChevronDown className="w-4 h-4 text-muted" />
      </div>

      <div className="p-4 space-y-5">
           {steps.map((step) => (
             <div key={step.id} className="flex items-start gap-3">
                   <div className={`
                     w-6 h-6 rounded-full flex items-center justify-center shrink-0 border mt-0.5 transition-all duration-300
                     ${step.status === 'completed' ? 'bg-scira-accent border-scira-accent text-white' : 
                       step.status === 'in-progress' ? 'bg-transparent border-scira-accent text-scira-accent scale-110' : 
                       'bg-transparent border-border text-muted'}
                   `}>
                      {step.status === 'completed' && <Check className="w-3.5 h-3.5" />}
                      {step.status === 'in-progress' && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                      {step.status === 'pending' && <span className="w-2 h-2 rounded-full bg-current opacity-20" />}
                   </div>
                   
                   <div className="flex-1 min-w-0">
                      <div className={`text-sm font-medium transition-colors ${step.status === 'in-progress' ? 'text-scira-accent' : 'text-primary'}`}>
                          {step.title}
                      </div>
                      
                      {/* Queries (if in progress or completed) */}
                      {step.queries && step.queries.length > 0 && step.status !== 'pending' && (
                          <div className="mt-2 text-xs text-muted/60 flex flex-col gap-1">
                             {step.queries.map((q, i) => (
                                <div key={i} className="flex items-center gap-1.5 overflow-hidden">
                                   <Search className="w-3 h-3 shrink-0" /> 
                                   <span className="truncate">{q}</span>
                                </div>
                             ))}
                          </div>
                      )}

                      {/* Finding/Analysis Summary */}
                      {step.finding && (
                          <div className="mt-3 pl-3 border-l-2 border-scira-accent/30 text-xs text-muted/90 italic leading-relaxed bg-surface/30 p-2 rounded-r-lg">
                              "{step.finding}"
                          </div>
                      )}
                   </div>
             </div>
           ))}
      </div>
    </div>
  );
};
