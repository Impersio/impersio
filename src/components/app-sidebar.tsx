"use client"
import { useLocation, Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import {
Sidebar,
SidebarContent,
SidebarFooter,
SidebarGroup,
SidebarHeader,
SidebarMenu,
SidebarMenuItem,
SidebarMenuButton,
} from "@/components/ui/sidebar"
import { Search, Newspaper, History, Download, MessageCircle, Plus, Settings } from 'lucide-react'
import { useUser } from '@clerk/clerk-react'

const BaseMenuOptions = [
{
title: 'Home',
icon: Search,
path: '/'
},
{
title: 'Discover',
icon: Newspaper,
path: '/discover'
},
{
title: 'Library',
icon: History,
path: '/library'
}
]

// Mock threads for demonstration
const MOCK_THREADS = [
    "tell me about ClaudeAI",
    "ClaudeAI new...",
    "research this contex:...",
    "take this context and d...",
    "Leonardo AI phoenix...",
    "research this topic...",
    "research this...",
    "help me planing a trip t..."
]

function AppSidebar() {
const location = useLocation();
const path = location.pathname;
const { isSignedIn } = useUser();

const menuOptions = [...BaseMenuOptions];

return (
<Sidebar className='bg-[#eff0eb] dark:bg-accent border-r-0'>
<SidebarHeader className="py-6 bg-[#eff0eb] dark:bg-accent flex flex-col gap-4 px-6">
  <div className="flex items-center justify-between">
      <img 
        src="https://upload.wikimedia.org/wikipedia/commons/1/1d/Perplexity_AI_logo.svg"
        alt="Sidebar Logo"
        className="h-8 w-auto"
        referrerPolicy="no-referrer"
      />
      <div className="text-gray-400">←</div>
  </div>
  <Button variant="outline" className="w-full justify-start gap-2 rounded-full border-gray-300 text-gray-600">
      <Plus className="h-4 w-4" />
      New Thread
      <span className="ml-auto text-xs bg-gray-200 px-1.5 py-0.5 rounded">⌘ K</span>
  </Button>
</SidebarHeader>
<SidebarContent className='bg-[#eff0eb] dark:bg-accent'>
<SidebarGroup>
<SidebarMenu>
{menuOptions.map((menu, index) => (
<SidebarMenuItem key={index}>
<SidebarMenuButton asChild size="lg" className={`p-5 py-6 hover:bg-transparent hover:font-bold ${path === menu.path ? 'font-bold' : ''}`}>
<Link to={menu.path}>
<menu.icon className='h-6 w-6' />
<span className='text-lg'>{menu.title}</span>
</Link>
</SidebarMenuButton>
</SidebarMenuItem>
))}
</SidebarMenu>
<div className="px-6 mt-4 text-sm text-gray-500">
    {MOCK_THREADS.map((thread, i) => (
        <div key={i} className="py-2 truncate hover:text-black cursor-pointer">{thread}</div>
    ))}
</div>
</SidebarGroup>
</SidebarContent>
<SidebarFooter className='bg-[#eff0eb] dark:bg-accent p-4'>
<div className="flex items-center justify-between p-2 rounded-lg hover:bg-black/5 cursor-pointer">
    <div className="flex items-center gap-2">
        <div className="h-8 w-8 rounded-full bg-gray-300" />
        <span className="font-medium">testingcatalog</span>
    </div>
    <Settings className="h-5 w-5 text-gray-500" />
</div>
<div className="flex flex-col gap-2 border-t border-black/10 pt-4 mt-2">
    <div className="flex items-center gap-2 text-gray-600 hover:text-black cursor-pointer">
        <Download className="h-5 w-5" />
        <span>Download</span>
    </div>
    <div className="flex items-center gap-4 mt-2">
        <a href="https://discord.com" target="_blank" rel="noreferrer" className="text-gray-600 hover:text-black">
            <MessageCircle className="h-5 w-5" />
        </a>
        <a href="https://twitter.com" target="_blank" rel="noreferrer" className="text-gray-600 hover:text-black">
            <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
            </svg>
        </a>
    </div>
</div>
</SidebarFooter>
</Sidebar>
)
}
export default AppSidebar

