
import React from 'react';
import { Sparkles, Lock, Check } from 'lucide-react';
import { ModelOption } from '../types';

interface ModelSelectorProps {
  selectedModel: ModelOption;
  models: ModelOption[];
  onSelect: (model: ModelOption) => void;
  isOpen: boolean;
  onToggle: () => void;
  isPro: boolean;
  onOpenProModal: () => void;
  trigger?: React.ReactNode;
}

export const ModelSelector: React.FC<ModelSelectorProps> = ({ 
  selectedModel, 
  models, 
  onSelect, 
  isOpen, 
  onToggle,
  isPro,
  onOpenProModal,
  trigger
}) => {
  return (
    <div className="relative group">
      <div onClick={onToggle}>
        {trigger || (
          <button 
            className="flex items-center justify-center h-8 px-3 rounded-full text-muted hover:text-primary hover:bg-surface-hover transition-colors text-xs font-medium border border-border/50 gap-2"
            title="Change Model"
          >
            {selectedModel.name}
          </button>
        )}
      </div>
      
      {isOpen && (
        <>
            <div 
                className="fixed inset-0 z-40" 
                onClick={onToggle}
            />
            <div className="absolute bottom-full right-0 mb-3 w-72 bg-surface border border-border rounded-xl shadow-2xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-100 p-2">
            <div className="flex flex-col gap-1">
                {models.map((model, index) => {
                const isLocked = !isPro && index !== 0; // Assuming first model is free
                const isSelected = selectedModel.id === model.id;
                
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
                    className={`w-full flex items-center gap-3 px-3 py-3 text-left rounded-lg transition-colors group/item relative
                        ${isSelected ? 'bg-surface-hover' : 'hover:bg-surface-hover'}
                        ${isLocked ? 'opacity-70 cursor-not-allowed' : ''}
                    `}
                    >
                    <div className={`p-1.5 rounded-md ${isSelected ? 'text-scira-accent bg-scira-accent/10' : 'text-muted bg-border/30'}`}>
                        {React.createElement(model.icon, { className: "w-4 h-4" })}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                            <span className={`text-sm font-medium ${isSelected ? 'text-primary' : 'text-primary'}`}>
                                {model.name}
                            </span>
                            {isLocked && <Lock className="w-3 h-3 text-muted" />}
                        </div>
                        {model.description && (
                            <div className="text-xs text-muted truncate">
                                {model.description}
                            </div>
                        )}
                    </div>
                    </button>
                );
                })}
            </div>
            {!isPro && (
                <div className="mt-2 pt-2 border-t border-border px-2">
                    <button onClick={onOpenProModal} className="w-full py-2 text-xs font-medium text-center text-scira-accent hover:underline">
                        Upgrade to unlock all models
                    </button>
                </div>
            )}
            </div>
        </>
      )}
    </div>
  );
};
