
import React from 'react';
import { 
  Plus, 
  MessageSquare,
  LayoutGrid,
  Library,
  Code,
  Sparkles
} from 'lucide-react';
import { SidebarToggleIcon } from './Icons';
import { User } from '../types';

interface AppSidebarProps {
  currentView: 'home' | 'discover' | 'about';
  onNavigate: (view: 'home' | 'discover' | 'about') => void;
  onNewChat: () => void;
  onToggleHistory: () => void;
  onSignIn: () => void;
  onUpgrade: () => void;
  user: User | null;
  theme: 'light' | 'dark' | 'system';
  onToggleTheme: () => void;
}

export const AppSidebar: React.FC<AppSidebarProps> = ({ 
  onNewChat,
  onToggleHistory,
  onSignIn,
  onUpgrade,
  user
}) => {
  return (
    <aside className="hidden md:flex w-[50px] h-screen bg-sidebar border-r border-border flex-col items-center py-4 fixed left-0 top-0 z-50">
       
       {/* Top Actions */}
       <div className="flex flex-col gap-2 mb-4">
         {/* Toggle Sidebar */}
         <button 
            onClick={onToggleHistory}
            className="w-10 h-10 flex items-center justify-center text-muted hover:text-primary hover:bg-surface-hover rounded-lg transition-colors"
            title="Toggle Sidebar"
         >
            <SidebarToggleIcon className="w-5 h-5" />
         </button>

         {/* New Chat */}
         <button 
            onClick={onNewChat}
            className="w-10 h-10 flex items-center justify-center text-muted hover:text-primary hover:bg-surface-hover rounded-lg transition-colors"
            title="New Chat"
         >
            <Plus className="w-5 h-5" />
         </button>
       </div>

       {/* Middle Actions */}
       <div className="flex flex-col gap-2">
          {/* Recent/Chat */}
          <button 
             className="w-10 h-10 flex items-center justify-center text-muted hover:text-primary hover:bg-surface-hover rounded-lg transition-colors"
             title="Recents"
          >
             <MessageSquare className="w-5 h-5" />
          </button>

          {/* Library */}
          <button 
             className="w-10 h-10 flex items-center justify-center text-muted hover:text-primary hover:bg-surface-hover rounded-lg transition-colors"
             title="Library"
          >
             <Library className="w-5 h-5" />
          </button>

          {/* Projects */}
          <button 
             className="w-10 h-10 flex items-center justify-center text-muted hover:text-primary hover:bg-surface-hover rounded-lg transition-colors"
             title="Projects"
          >
             <LayoutGrid className="w-5 h-5" />
          </button>

          {/* Code/API */}
          <button 
             className="w-10 h-10 flex items-center justify-center text-muted hover:text-primary hover:bg-surface-hover rounded-lg transition-colors"
             title="Code"
          >
             <Code className="w-5 h-5" />
          </button>
       </div>

       <div className="mt-auto flex flex-col items-center gap-3">
          {/* Upgrade Icon if not pro */}
          {(!user || !user.is_pro) && (
              <button 
                onClick={onUpgrade}
                className="w-8 h-8 rounded-full bg-surface hover:bg-surface-hover text-scira-accent flex items-center justify-center transition-colors"
                title="Upgrade to Pro"
              >
                 <Sparkles className="w-4 h-4" />
              </button>
          )}

          {/* User Profile */}
          <button 
            onClick={onSignIn}
            className="w-8 h-8 rounded-full bg-[#E5E3DC] text-[#333] flex items-center justify-center font-medium text-xs hover:opacity-90 transition-opacity"
          >
             {user?.email ? user.email[0].toUpperCase() : 'G'}
          </button>
       </div>
    </aside>
  );
};
