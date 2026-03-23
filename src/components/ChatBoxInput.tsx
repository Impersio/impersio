import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { SearchCheck, Atom, Cpu, Globe, Paperclip, Mic, Send } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { SearchModeType, ModelOption } from '@/types'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface ChatBoxInputProps {
    query: string;
    setQuery: (val: string) => void;
    onSearch: () => void;
    selectedMode: SearchModeType;
    setSelectedMode: (mode: SearchModeType) => void;
    models: ModelOption[];
    selectedModel: ModelOption;
    setSelectedModel: (model: ModelOption) => void;
    isChatView?: boolean;
}

function ChatBoxInput({ query, setQuery, onSearch, selectedMode, setSelectedMode, models, selectedModel, setSelectedModel, isChatView }: ChatBoxInputProps) {
  return (
    <div className='flex items-center justify-center w-full'>
      <div className={`p-1.5 w-full max-w-2xl border border-[#2a2a2a] bg-[#191a1a] shadow-lg ${isChatView ? 'rounded-t-xl border-b-0' : 'rounded-xl'}`}>
        <input
          type="text"
          placeholder='Ask Anything'
          className='w-full px-4 py-3 outline-none bg-transparent text-white placeholder-[#7a7a7a] text-[15px]'
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => {
              if (e.key === 'Enter') {
                  onSearch();
              }
          }}
        />

        <div className='flex justify-between items-center px-2 pb-1.5'>
          <Tabs value={selectedMode === 'extreme' ? 'Research' : 'Search'} onValueChange={(val) => setSelectedMode(val === 'Research' ? 'extreme' : 'web')}>
            <TabsList className="bg-transparent border-none h-8 p-0 gap-1">
              <TabsTrigger value="Search" className='text-[#7a7a7a] data-[state=active]:text-white data-[state=active]:bg-[#2a2a2a] rounded-md px-3 text-xs font-medium transition-all'>
                <SearchCheck className='h-3.5 w-3.5 mr-1.5' /> Search
              </TabsTrigger>
              <TabsTrigger value="Research" className='text-[#7a7a7a] data-[state=active]:text-white data-[state=active]:bg-[#2a2a2a] rounded-md px-3 text-xs font-medium transition-all'>
                <Atom className='h-3.5 w-3.5 mr-1.5' /> Research
              </TabsTrigger>
            </TabsList>
          </Tabs>

          <div className='flex gap-1 items-center'>
            {/* CPU Icon with Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant='ghost' size='icon' className="h-8 w-8 text-[#7a7a7a] hover:text-white hover:bg-[#2a2a2a]">
                  <Cpu className='h-4 w-4' />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="bg-[#191a1a] border-[#2a2a2a] text-white">
                <DropdownMenuGroup>
                  <DropdownMenuLabel className="text-[#7a7a7a] text-xs uppercase tracking-wider">Select Model</DropdownMenuLabel>
                  <DropdownMenuSeparator className="bg-[#2a2a2a]" />
                  {models.map((model) => (
                    <DropdownMenuItem 
                      key={model.id} 
                      onClick={() => setSelectedModel(model)}
                      className={`text-sm focus:bg-[#2a2a2a] focus:text-white ${selectedModel.id === model.id ? 'bg-[#2a2a2a] text-white' : 'text-[#9a9a9a]'}`}
                    >
                      <div className="flex items-center gap-2">
                        <span>{model.name}</span>
                      </div>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuGroup>
              </DropdownMenuContent>
            </DropdownMenu>

            <Button variant='ghost' size='icon' className="h-8 w-8 text-[#7a7a7a] hover:text-white hover:bg-[#2a2a2a]">
              <Globe className='h-4 w-4' />
            </Button>
            <Button variant='ghost' size='icon' className="h-8 w-8 text-[#7a7a7a] hover:text-white hover:bg-[#2a2a2a]">
              <Paperclip className='h-4 w-4' />
            </Button>
            
            {query.trim() === '' ? (
              <Button variant='ghost' size='icon' className="h-8 w-8 text-[#7a7a7a] hover:text-white hover:bg-[#2a2a2a]">
                <Mic className='h-4 w-4' />
              </Button>
            ) : (
              <Button size='icon' onClick={onSearch} className="h-8 w-8 bg-[#1c7483] hover:bg-[#1c7483]/80 rounded-full transition-all">
                <Send className='text-white h-3.5 w-3.5' />
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default ChatBoxInput
