import React, { useState } from 'react';
import { Globe, ArrowRight, ChevronUp, ChevronDown } from 'lucide-react';
import { SearchResult } from '../../types';

interface SourceCardProps {
  sources: SearchResult[];
}

export const SourceCard: React.FC<SourceCardProps> = ({ sources }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  
  // Filter sources that have images for the carousel
  const sourcesWithImages = sources.filter(s => s.image);
  // User asked for 10 images
  const displayImages = sourcesWithImages.slice(0, 10);
  
  return (
    <div className="w-full bg-white border border-gray-200 rounded-xl overflow-hidden mb-6 animate-in fade-in slide-in-from-bottom-2 duration-500 shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-gray-50/50 border-b border-gray-100">
        <div className="flex items-center gap-2">
            <div className="flex items-center justify-center w-5 h-5 rounded-full bg-white border border-gray-200 shadow-sm">
                <Globe className="w-3 h-3 text-blue-600" />
            </div>
            <span className="text-xs font-bold text-gray-500 tracking-widest uppercase">Sources</span>
        </div>
        <div className="flex items-center gap-4">
            <span className="text-xs font-medium text-gray-400">{sources.length} found</span>
            <button 
                onClick={() => setIsExpanded(!isExpanded)}
                className="flex items-center gap-1 text-xs font-medium text-gray-500 hover:text-gray-900 transition-colors"
            >
                {isExpanded ? 'Collapse' : 'View all'} 
                {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ArrowRight className="w-3 h-3 rotate-45" />}
            </button>
        </div>
      </div>

      {/* Expanded List View */}
      {isExpanded && (
          <div className="flex flex-col divide-y divide-gray-100 bg-white">
              {sources.slice(0, 5).map((source, idx) => (
                  <a key={idx} href={source.link} target="_blank" rel="noreferrer" className="p-3 hover:bg-gray-50 transition-colors group flex items-start gap-3">
                      <div className="mt-1 min-w-[16px]">
                          <img 
                            src={`https://www.google.com/s2/favicons?domain=${new URL(source.link).hostname}&sz=32`} 
                            className="w-4 h-4 rounded-full opacity-70" 
                            alt="" 
                            onError={(e) => { (e.target as HTMLImageElement).src = 'https://www.google.com/s2/favicons?domain=google.com&sz=32'; }}
                          />
                      </div>
                      <div className="flex flex-col gap-0.5 overflow-hidden">
                          <h4 className="text-sm font-medium text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-1 truncate">{source.title}</h4>
                          <div className="flex items-center gap-2 text-xs text-gray-500">
                              <span className="truncate">{source.displayLink}</span>
                              {source.publishedDate && (
                                <>
                                    <span>•</span>
                                    <span>{source.publishedDate}</span>
                                </>
                              )}
                          </div>
                          <p className="text-xs text-gray-500 line-clamp-2 mt-1">{source.snippet}</p>
                      </div>
                  </a>
              ))}
          </div>
      )}

      {/* Image Carousel */}
      {displayImages.length > 0 && (
        <div className="p-3 bg-white border-t border-gray-100">
            <div className="flex gap-3 overflow-x-auto pb-2 no-scrollbar snap-x">
                {displayImages.map((source, idx) => (
                    <a 
                    key={idx} href={source.link} target="_blank" rel="noreferrer"
                    className="flex-shrink-0 w-48 h-28 rounded-lg overflow-hidden border border-gray-200 relative group snap-start bg-gray-100"
                    >
                        <img src={source.image} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" alt="" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-2">
                            <span className="text-[10px] text-white font-medium line-clamp-1">{source.title}</span>
                        </div>
                    </a>
                ))}
            </div>
        </div>
      )}
    </div>
  );
};
