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
import { Search, User, Newspaper, History, Plus, Bell, CircleUser, ArrowUp } from 'lucide-react'
import { useUser, useClerk } from '@clerk/clerk-react'

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
    title: 'Spaces',
    icon: History, // Placeholder for Spaces
    path: '/spaces'
  },
  {
    title: 'Finance',
    icon: History, // Placeholder for Finance
    path: '/finance'
  }
]

function AppSidebar() {
  const location = useLocation();
  const path = location.pathname;
  const { isSignedIn } = useUser();

  return (
    <Sidebar className='bg-[#f4f4f4] border-r-0 w-20 flex flex-col items-center py-4'>
      <SidebarHeader className="bg-transparent flex items-center justify-center mb-4">
        <img 
          src="https://assets.streamlinehq.com/image/private/w_300,h_300,ar_1/f_auto/v1/icons/logos/perplexity-kcjtmnt09fjb1qgfxcdbd.png/perplexity-e6a4e1t06hd6dhczot580o.png?_a=DATAiZAAZAA0"
          alt="Perplexity Logo"
          className="h-8 w-8"
          referrerPolicy="no-referrer"
        />
      </SidebarHeader>
      <SidebarContent className='bg-transparent flex flex-col items-center w-full'>
        <SidebarGroup className="flex flex-col items-center w-full">
          <SidebarMenu className="flex flex-col items-center w-full">
            <SidebarMenuItem className="mb-4">
              <SidebarMenuButton size="lg" className="flex flex-col items-center justify-center p-2 hover:bg-gray-200 rounded-lg">
                <Plus className='h-6 w-6' />
              </SidebarMenuButton>
            </SidebarMenuItem>
            {BaseMenuOptions.map((menu, index) => (
              <SidebarMenuItem key={index} className="mb-2 w-full flex justify-center">
                <SidebarMenuButton asChild size="lg" className={`flex flex-col items-center justify-center p-2 hover:bg-gray-200 rounded-lg ${path === menu.path ? 'bg-gray-200 font-bold' : ''}`}>
                  <Link to={menu.path} className="flex flex-col items-center">
                    <menu.icon className='h-6 w-6 mb-1' />
                    <span className='text-[10px]'>{menu.title}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className='bg-transparent flex flex-col items-center w-full mt-auto'>
        <SidebarMenu className="flex flex-col items-center w-full">
          <SidebarMenuItem className="mb-2">
            <SidebarMenuButton size="lg" className="flex flex-col items-center justify-center p-2 hover:bg-gray-200 rounded-lg">
              <Bell className='h-6 w-6' />
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem className="mb-2">
            <SidebarMenuButton size="lg" className="flex flex-col items-center justify-center p-2 hover:bg-gray-200 rounded-lg">
              <CircleUser className='h-6 w-6' />
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem className="mb-2">
            <SidebarMenuButton size="lg" className="flex flex-col items-center justify-center p-2 hover:bg-gray-200 rounded-lg">
              <ArrowUp className='h-6 w-6' />
              <span className='text-[10px]'>Upgrade</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}
export default AppSidebar

