import { useState } from 'react';
import { Message, SearchResult, SearchModeType } from '../types';
import { performMultiSearch } from '../lib/search';
import { streamResponse, generateSearchQueries } from '../services/geminiService';
import { createConversation, saveMessage } from '../services/chatStorageService';
import { searchForMode, executeToolsForMode } from '../services/toolService';

export const useChat = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);

  const handleSearch = async (query: string, modelId: string, forcedMode?: SearchModeType) => {
    if (!query.trim() || isLoading) return;
    
    setIsLoading(true);
    if (!hasSearched) setHasSearched(true);

    let currentId = activeConversationId;
    if (!currentId) {
       currentId = await createConversation(query);
       setActiveConversationId(currentId);
    }

    const userMsg: Message = { role: 'user', content: query, mode: forcedMode };
    const assistantMsg: Message = { 
        role: 'assistant', 
        content: '', 
        reasoning: '', 
        sources: [], 
        copilotEvents: [] 
    };
    setMessages(prev => [...prev, userMsg, assistantMsg]);
    
    if (currentId) await saveMessage(currentId, 'user', query);
    
    try {
      // 1. SEARCH EXECUTION
      // Default to 'web' if no mode is forced
      const mode: SearchModeType = forcedMode || 'web';
      let allResults: SearchResult[] = [];
      let toolData: any = null;

      // Update UI to show searching state
      setMessages(prev => {
        const newMsgs = [...prev];
        const last = newMsgs[newMsgs.length - 1];
        if (last) {
            last.copilotEvents = [{ 
                id: '1', 
                status: 'loading', 
                message: `Searching (${mode})...`, 
                items: [query] 
            }];
        }
        return newMsgs;
      });

      if (mode === 'chat') {
        // Skip search
      } else if (mode === 'crypto' || mode === 'stocks' || mode === 'weather') {
        // Execute specific tool AND search for context
        toolData = await executeToolsForMode(mode, query);
        allResults = await searchForMode(mode, query);
      } else {
        // Standard search with mode-specific context
        allResults = await searchForMode(mode, query);
      }

      // 2. RESULTS PROCESSING
      setMessages(prev => {
            const newMsgs = [...prev];
            const last = newMsgs[newMsgs.length - 1];
            if (last && last.copilotEvents) {
                const lastIdx = last.copilotEvents.length - 1;
                last.copilotEvents[lastIdx].status = 'completed';
                
                last.sources = allResults;
                last.copilotEvents.push({ id: '2', status: 'completed', message: `Found ${allResults.length} results` });
            }
            return newMsgs;
       });

      // 3. STREAM ANSWER
      await streamResponse(
        query, // Use original query
        modelId, 
        [], 
        allResults, 
        [], 
        false, 
        false, 
        (chunk, reasoning) => {
          setMessages(prev => {
              const newMsgs = [...prev];
              const last = newMsgs[newMsgs.length - 1];
              if (last) {
                  if (chunk) last.content = chunk;
                  if (reasoning) last.reasoning = reasoning;
              }
              return newMsgs;
          });
        },
        () => {},
        (related) => {
          setMessages(prev => {
              const newMsgs = [...prev];
              const last = newMsgs[newMsgs.length - 1];
              if (last) last.relatedQuestions = related;
              return newMsgs;
          });
        },
        (fullContent, widget, related) => {
           if (currentId) saveMessage(currentId, 'assistant', fullContent, { sources: allResults, relatedQuestions: related });
        },
        undefined, // deepFindings
        (rankedSources) => {
           setMessages(prev => {
              const newMsgs = [...prev];
              const last = newMsgs[newMsgs.length - 1];
              if (last) last.sources = rankedSources;
              return newMsgs;
          });
        }
      );
      
    } catch (e) {
        console.error(e);
        setMessages(prev => {
            const newMsgs = [...prev];
            const last = newMsgs[newMsgs.length - 1];
            if (last) last.content = "I encountered an error while searching. Please try again.";
            return newMsgs;
        });
    } finally {
      setIsLoading(false);
    }
  };

  return {
    messages,
    setMessages,
    hasSearched,
    setHasSearched,
    isLoading,
    handleSearch,
    activeConversationId,
    setActiveConversationId
  };
};