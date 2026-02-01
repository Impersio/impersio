import React from 'react';
import { 
  Search,
  Globe,
  Library,
  Sparkles,
  LogIn,
  LogOut,
  User as UserIcon,
  Plus
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
  onUpgrade,
  user
}) => {
  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <SidebarMenu>
            <SidebarMenuItem>
                <SidebarMenuButton 
                  size="lg" 
                  className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground group-data-[collapsible=icon]:!p-0"
                  onClick={onNewChat}
                >
                    <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-transparent text-[#21808D]">
                        <ImpersioLogo className="size-6" />
                    </div>
                    <div className="grid flex-1 text-left text-sm leading-tight">
                        <span className="truncate font-semibold text-lg font-serif">Impersio</span>
                    </div>
                </SidebarMenuButton>
            </SidebarMenuItem>
            
            <div className="group-data-[collapsible=icon]:hidden px-2 py-1">
                 <button 
                    onClick={onNewChat}
                    className="w-full flex items-center gap-2 bg-surface border border-border rounded-full px-3 py-1.5 text-sm text-muted hover:text-primary transition-colors shadow-sm"
                 >
                     <Plus className="w-4 h-4" />
                     <span>New Thread</span>
                     <span className="ml-auto text-xs opacity-50 border border-border px-1.5 rounded">Ctrl I</span>
                 </button>
            </div>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
            <SidebarMenu>
                <SidebarMenuItem>
                    <SidebarMenuButton 
                        onClick={() => onNavigate('home')} 
                        isActive={currentView === 'home'}
                        tooltip="Home"
                    >
                        <Search className="size-4" />
                        <span>Home</span>
                    </SidebarMenuButton>
                </SidebarMenuItem>
                
                <SidebarMenuItem>
                    <SidebarMenuButton 
                        onClick={() => onNavigate('discover')} 
                        isActive={currentView === 'discover'}
                        tooltip="Discover"
                    >
                        <Globe className="size-4" />
                        <span>Discover</span>
                    </SidebarMenuButton>
                </SidebarMenuItem>
                
                <SidebarMenuItem>
                    <SidebarMenuButton 
                        onClick={onToggleHistory} 
                        tooltip="Library"
                    >
                        <Library className="size-4" />
                        <span>Library</span>
                    </SidebarMenuButton>
                </SidebarMenuItem>

                {!user?.is_pro && (
                  <SidebarMenuItem className="mt-4">
                     <SidebarMenuButton onClick={onUpgrade} tooltip="Upgrade">
                        <Sparkles className="size-4 text-[#21808D]" />
                        <span>Try Pro</span>
                     </SidebarMenuButton>
                  </SidebarMenuItem>
                )}
            </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
         <SidebarMenu>
            {user ? (
                <SidebarMenuItem>
                    <SidebarMenuButton onClick={onSignIn} tooltip="Profile">
                        <div className="flex items-center justify-center size-5 rounded-full bg-[#E5E3DC] text-[#333] text-xs font-medium">
                            {user.email ? user.email[0].toUpperCase() : 'U'}
                        </div>
                        <span className="truncate">{user.full_name || user.email}</span>
                    </SidebarMenuButton>
                </SidebarMenuItem>
            ) : (
                <SidebarMenuItem>
                    <SidebarMenuButton onClick={onSignIn} tooltip="Sign Up">
                        <LogIn className="size-4" />
                        <span>Sign Up</span>
                    </SidebarMenuButton>
                </SidebarMenuItem>
            )}
         </SidebarMenu>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
};
