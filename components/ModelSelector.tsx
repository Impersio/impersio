
import React from 'react';
import { ChevronDown, Check } from 'lucide-react';
import { ModelOption } from '../types';

interface ModelSelectorProps {
  selectedModel: ModelOption;
  models: ModelOption[];
  onSelect: (model: ModelOption) => void;
  isOpen: boolean;
  onToggle: () => void;
}

export const ModelSelector: React.FC<ModelSelectorProps> = ({ 
  selectedModel, 
  models, 
  onSelect, 
  isOpen, 
  onToggle 
}) => {
  return (
    <div className="relative">
      <button 
        onClick={onToggle}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium text-muted hover:text-primary hover:bg-surface-hover transition-colors"
      >
        <selectedModel.icon className="w-3.5 h-3.5" />
        <span>{selectedModel.name}</span>
        <ChevronDown className="w-3 h-3 opacity-50" />
      </button>
      
      {isOpen && (
        <div className="absolute bottom-full left-0 mb-2 w-64 bg-surface border border-border rounded-xl shadow-xl z-50 p-1 animate-in fade-in zoom-in-95 duration-100 overflow-hidden">
           <div className="px-2 py-1.5 text-[10px] font-semibold text-muted uppercase tracking-wider">
              Select Model
           </div>
           {models.map((model) => (
             <button
               key={model.id}
               onClick={() => {
                 onSelect(model);
                 onToggle();
               }}
               className={`w-full flex items-center gap-3 px-3 py-2 text-sm text-left rounded-lg transition-colors ${selectedModel.id === model.id ? 'bg-surface-hover text-primary' : 'text-muted hover:text-primary hover:bg-surface-hover'}`}
             >
               <div className={`p-1 rounded-md ${selectedModel.id === model.id ? 'bg-background shadow-sm' : 'bg-transparent'}`}>
                  <model.icon className="w-4 h-4" />
               </div>
               <span className="flex-1 truncate">{model.name}</span>
               {selectedModel.id === model.id && <Check className="w-3.5 h-3.5 text-scira-accent" />}
             </button>
           ))}
        </div>
      )}
    </div>
  );
};
