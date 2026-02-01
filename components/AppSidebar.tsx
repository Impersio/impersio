import React from 'react';
import { 
  Search,
  Globe,
  Library,
  Plus,
  LogIn
} from 'lucide-react';
import { 
  Sidebar, 
  SidebarContent, 
  SidebarFooter, 
  SidebarHeader, 
  SidebarMenu, 
  SidebarMenuItem, 
  SidebarMenuButton,
  SidebarGroup,
  SidebarRail
} from './ui/sidebar';
import { ImpersioLogo } from './Icons';
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
  currentView,
  onNavigate,
  onNewChat,
  onToggleHistory,
  onSignIn,
  user
}) => {
  return (
    <Sidebar collapsible="none" className="w-[60px] border-r border-border bg-sidebar flex flex-col items-center py-4 gap-4">
      <SidebarHeader className="p-0 flex justify-center w-full">
        <SidebarMenu>
            <SidebarMenuItem>
                <div className="flex items-center justify-center w-10 h-10">
                     <ImpersioLogo className="w-8 h-8 text-[#21808D]" />
                </div>
            </SidebarMenuItem>
            
            <SidebarMenuItem className="mt-4">
                 <button 
                    onClick={onNewChat}
                    className="w-10 h-10 flex items-center justify-center rounded-full bg-surface hover:bg-surface-hover border border-border text-primary transition-colors"
                    title="New Thread"
                 >
                     <Plus className="w-5 h-5" />
                 </button>
            </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent className="flex flex-col gap-6 mt-2 w-full items-center px-0">
         <button 
            onClick={() => onNavigate('home')} 
            className={`w-10 h-10 flex items-center justify-center rounded-lg transition-colors ${currentView === 'home' ? 'text-primary bg-surface-hover' : 'text-muted hover:text-primary'}`}
            title="Home"
         >
             <Search className="w-5 h-5" />
         </button>
         
         <button 
            onClick={() => onNavigate('discover')} 
            className={`w-10 h-10 flex items-center justify-center rounded-lg transition-colors ${currentView === 'discover' ? 'text-primary bg-surface-hover' : 'text-muted hover:text-primary'}`}
            title="Discover"
         >
             <Globe className="w-5 h-5" />
         </button>
         
         <button 
            onClick={onToggleHistory} 
            className="w-10 h-10 flex items-center justify-center rounded-lg text-muted hover:text-primary transition-colors"
            title="Library"
         >
             <Library className="w-5 h-5" />
         </button>
      </SidebarContent>

      <SidebarFooter className="mt-auto w-full flex justify-center p-0 pb-4">
         {user ? (
            <button onClick={onSignIn} title="Profile" className="w-8 h-8 rounded-full bg-[#E5E3DC] text-[#333] flex items-center justify-center text-xs font-medium">
                {user.email ? user.email[0].toUpperCase() : 'U'}
            </button>
         ) : (
            <button onClick={onSignIn} title="Sign Up" className="text-muted hover:text-primary">
                <LogIn className="w-5 h-5" />
            </button>
         )}
      </SidebarFooter>
    </Sidebar>
  );
};