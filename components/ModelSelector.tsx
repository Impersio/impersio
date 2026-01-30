
import React from 'react';
import { Sparkles, Lock } from 'lucide-react';
import { ModelOption } from '../types';

interface ModelSelectorProps {
  selectedModel: ModelOption;
  models: ModelOption[];
  onSelect: (model: ModelOption) => void;
  isOpen: boolean;
  onToggle: () => void;
  isPro: boolean;
  onOpenProModal: () => void;
}

export const ModelSelector: React.FC<ModelSelectorProps> = ({ 
  selectedModel, 
  models, 
  onSelect, 
  isOpen, 
  onToggle,
  isPro,
  onOpenProModal
}) => {
  return (
    <div className="relative group">
      <button 
        onClick={onToggle}
        className="flex items-center justify-center h-8 px-3 rounded-full text-muted hover:text-primary hover:bg-surface-hover transition-colors text-xs font-medium border border-border/50 gap-2"
        title="Change Model"
      >
        {selectedModel.name}
        {/* Show sparkle if using a pro model or if user is pro (optional visual cue) */}
      </button>
      
      {isOpen && (
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 w-56 bg-[#1E1E1E] border border-border rounded-xl shadow-2xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-100 p-1.5">
           <div className="px-3 py-2 text-xs font-medium text-muted border-b border-border/50 mb-1 flex justify-between items-center">
              <span>Select Model</span>
              {!isPro && (
                  <button onClick={onOpenProModal} className="text-scira-accent hover:underline text-[10px]">
                      Upgrade to unlock
                  </button>
              )}
           </div>
           
           <div className="flex flex-col gap-0.5">
             {models.map((model, index) => {
               const isLocked = !isPro && index !== 0; // Assuming first model is free
               
               return (
                 <button
                   key={model.id}
                   disabled={isLocked}
                   onClick={() => {
                     if (!isLocked) {
                        onSelect(model);
                        onToggle();
                     } else {
                        onOpenProModal();
                     }
                   }}
                   className={`w-full flex items-center px-3 py-2 text-sm text-left rounded-lg transition-colors group/item relative
                     ${selectedModel.id === model.id ? 'bg-[#2A2A2A] text-white' : 'text-[#A0A0A0] hover:bg-[#2A2A2A] hover:text-white'}
                     ${isLocked ? 'opacity-70 cursor-not-allowed hover:bg-transparent' : ''}
                   `}
                 >
                   <span className="flex-1 font-medium truncate">{model.name}</span>
                   {isLocked && <Lock className="w-3.5 h-3.5 text-muted ml-2" />}
                   {index !== 0 && !isLocked && <Sparkles className="w-3.5 h-3.5 text-scira-accent ml-2" />}
                 </button>
               );
             })}
           </div>
        </div>
      )}
    </div>
  );
};
