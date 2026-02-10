import React, { useEffect } from 'react';
import { ModelOption } from '../types';
import { InputBar } from './search/InputBar';

interface TravelProps {
  onSearch: (query: string) => void;
  query: string;
  setQuery: (q: string) => void;
  selectedModel: ModelOption;
  setSelectedModel: (m: ModelOption) => void;
  models: ModelOption[];
}

const DESTINATIONS = [
  {
    title: 'Barcelona',
    subtitle: 'Gaudí, beaches, tapas',
    image: 'https://images.unsplash.com/photo-1583422409516-2895a77efded?q=80&w=800&auto=format&fit=crop'
  },
  {
    title: 'Edinburgh',
    subtitle: 'Castles, dramatic landscapes',
    image: 'https://images.unsplash.com/photo-1571505345999-52e803a0888d?q=80&w=800&auto=format&fit=crop'
  },
  {
    title: 'Gold Coast',
    subtitle: 'Beautiful now, perfect later',
    image: 'https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?q=80&w=800&auto=format&fit=crop'
  },
  {
    title: 'Mexico City',
    subtitle: 'Food, history, murals',
    image: 'https://images.unsplash.com/photo-1518105779142-d975f22f1b0a?q=80&w=800&auto=format&fit=crop'
  },
  {
    title: 'Rio De Janeiro',
    subtitle: 'Carnival, beaches, nightlife',
    image: 'https://images.unsplash.com/photo-1483729558449-99ef09a8c325?q=80&w=800&auto=format&fit=crop'
  },
  {
    title: 'Tokyo',
    subtitle: 'Sushi, skylines, gardens',
    image: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?q=80&w=800&auto=format&fit=crop'
  }
];

export const Travel: React.FC<TravelProps> = ({ 
  onSearch, 
  query, 
  setQuery,
  selectedModel,
  setSelectedModel,
  models
}) => {

  // Auto-switch to Impersio Travel model (Kimi K2)
  useEffect(() => {
    const travelModel = models.find(m => m.id === 'impersio-travel');
    if (travelModel && selectedModel.id !== 'impersio-travel') {
        setSelectedModel(travelModel);
    }
  }, []);

  return (
    <div className="flex flex-col h-full bg-background text-primary font-sans animate-fade-in relative">
        <div className="flex-1 overflow-y-auto pb-40">
            <div className="max-w-[760px] mx-auto px-4 py-12 md:py-20">
                
                {/* Title */}
                <div className="flex items-center justify-center gap-3 mb-10">
                   <h1 className="text-4xl md:text-5xl font-medium tracking-tight text-center">
                     <span className="text-primary">impersio</span> <span className="text-muted font-normal font-serif">travel</span>
                   </h1>
                </div>
                
                {/* Search */}
                <div className="mb-12">
                     <InputBar 
                        query={query} 
                        setQuery={setQuery} 
                        handleSearch={() => onSearch(query)} 
                        isInitial={true}
                        selectedModel={selectedModel}
                        setSelectedModel={setSelectedModel}
                        models={models}
                    />
                </div>

                {/* Trending Grid */}
                <div>
                    <h2 className="text-xl font-medium text-primary mb-5">Trending Destinations</h2>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                        {DESTINATIONS.map((dest, idx) => (
                            <button 
                                key={idx}
                                onClick={() => onSearch(`Plan a trip to ${dest.title}`)}
                                className="group text-left bg-surface border border-border rounded-xl overflow-hidden hover:shadow-md transition-all duration-300 hover:-translate-y-1"
                            >
                                <div className="aspect-[4/3] w-full overflow-hidden relative">
                                    <img 
                                      src={dest.image} 
                                      alt={dest.title}
                                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                                </div>
                                <div className="p-4 bg-surface">
                                    <h3 className="font-semibold text-lg text-primary mb-1">{dest.title}</h3>
                                    <p className="text-sm text-muted line-clamp-1">{dest.subtitle}</p>
                                </div>
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    </div>
  );
};