import React, { useRef, useState, useEffect } from 'react'
import { Plus, ChevronDown, Mic, AudioLines, Send, X, MicOff, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ModelOption } from '@/types'

interface ChatBoxInputProps {
    query?: string;
    setQuery?: (val: string) => void;
    onSearch?: () => void;
    image?: string | null;
    setImage?: (val: string | null) => void;
    selectedModel?: ModelOption;
    setSelectedModel?: (model: ModelOption) => void;
    models?: ModelOption[];
}

function ChatBoxInput({ 
    query = '', 
    setQuery = () => {}, 
    onSearch = () => {}, 
    image = null, 
    setImage = () => {},
    selectedModel,
    setSelectedModel = () => {},
    models = []
}: ChatBoxInputProps) {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isListening, setIsListening] = useState(false);
    const recognitionRef = useRef<any>(null);

    useEffect(() => {
        if ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window) {
            const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
            recognitionRef.current = new SpeechRecognition();
            recognitionRef.current.continuous = true;
            recognitionRef.current.interimResults = true;

            recognitionRef.current.onresult = (event: any) => {
                const currentTranscript = Array.from(event.results)
                    .map((result: any) => result[0].transcript)
                    .join('');
                setQuery(currentTranscript);
            };

            recognitionRef.current.onerror = (event: any) => {
                console.error('Speech recognition error', event.error);
                setIsListening(false);
            };

            recognitionRef.current.onend = () => {
                setIsListening(false);
            };
        }
    }, [setQuery]);

    const toggleListening = () => {
        if (isListening) {
            recognitionRef.current?.stop();
            setIsListening(false);
        } else {
            setQuery('');
            recognitionRef.current?.start();
            setIsListening(true);
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setImage(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    return (
        <div className='flex items-center justify-center w-full'>
            <div className='p-2 w-full max-w-2xl border rounded-2xl bg-background'>

                {image && (
                    <div className="relative inline-block mb-2 ml-4 mt-2">
                        <img src={image} alt="Upload preview" className="h-20 w-20 object-cover rounded-lg border border-border" />
                        <button 
                            onClick={() => setImage(null)}
                            className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full p-1 shadow-sm hover:bg-destructive/90"
                        >
                            <X className="h-3 w-3" />
                        </button>
                    </div>
                )}

                {/* Input */}
                <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder='Ask Anything'
                    className='w-full p-4 outline-none bg-transparent'
                    onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                            onSearch();
                        }
                    }}
                />

                {/* Bottom Bar */}
                <div className='flex justify-between items-center mt-2'>

                    {/* Left Side */}
                    <input 
                        type="file" 
                        accept="image/*" 
                        className="hidden" 
                        ref={fileInputRef}
                        onChange={handleFileChange}
                    />
                    <Button variant='ghost' size='icon' className='rounded-full border' onClick={() => fileInputRef.current?.click()}>
                        <Plus className='h-5 w-5 text-gray-600' />
                    </Button>

                    {/* Right Side */}
                    <div className='flex items-center gap-3'>

                        {/* Model Selector */}
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <div className='flex items-center gap-1 text-sm text-gray-600 cursor-pointer'>
                                    {selectedModel?.name || 'Model'}
                                    <ChevronDown className='h-4 w-4' />
                                </div>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-56 bg-background">
                                <DropdownMenuGroup>
                                    {models.map((model) => (
                                        <DropdownMenuItem 
                                            key={model.id} 
                                            onClick={() => setSelectedModel(model)}
                                            className="flex items-center justify-between cursor-pointer"
                                        >
                                            <div className="flex items-center gap-2">
                                                {model.logoUrl && (
                                                    <img 
                                                        src={model.logoUrl} 
                                                        alt={`${model.name} logo`} 
                                                        className="w-4 h-4 object-contain"
                                                        referrerPolicy="no-referrer"
                                                    />
                                                )}
                                                <span>{model.name}</span>
                                            </div>
                                            {selectedModel?.id === model.id && <Check className="h-4 w-4 text-[#1c7483]" />}
                                        </DropdownMenuItem>
                                    ))}
                                </DropdownMenuGroup>
                            </DropdownMenuContent>
                        </DropdownMenu>

                        {/* Mic */}
                        <Button variant='ghost' size='icon' onClick={toggleListening} className={isListening ? 'text-[#1c7483] bg-[#1c7483]/10' : ''}>
                            {isListening ? <MicOff className='h-5 w-5' /> : <Mic className='text-gray-500 h-5 w-5' />}
                        </Button>

                        {/* Audio / Send Button (Same Style) */}
                        <Button
                            size='icon'
                            className='bg-black hover:bg-black/90 rounded-full'
                            onClick={onSearch}
                        >
                            {query.trim() === "" && !image ? (
                                <AudioLines className='text-white h-5 w-5' />
                            ) : (
                                <Send className='text-white h-5 w-5' />
                            )}
                        </Button>

                    </div>
                </div>

            </div>
        </div>
    )
}

export default ChatBoxInput

