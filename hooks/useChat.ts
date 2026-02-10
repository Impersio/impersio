import { useState } from 'react';
import { Message, SearchResult } from '../types';
import { searchFast } from '../lib/search';
import { streamResponse, generateSearchQueries } from '../ai/gemini';
import { createConversation, saveMessage } from '../services/chatStorageService';

export const useChat = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);

  const handleSearch = async (query: string, modelId: string) => {
    if (!query.trim() || isLoading) return;
    
    setIsLoading(true);
    if (!hasSearched) setHasSearched(true);

    let currentId = activeConversationId;
    if (!currentId) {
       currentId = await createConversation(query);
       setActiveConversationId(currentId);
    }

    const userMsg: Message = { role: 'user', content: query };
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
      // 1. THINKING PHASE
      setMessages(prev => {
        const newMsgs = [...prev];
        const last = newMsgs[newMsgs.length - 1];
        if (last) {
            last.copilotEvents = [{ id: '1', status: 'loading', message: 'Generating strategic plan...' }];
        }
        return newMsgs;
      });

      const { queries, plan } = await generateSearchQueries(query);

      // 2. SHOW QUERIES
      setMessages(prev => {
        const newMsgs = [...prev];
        const last = newMsgs[newMsgs.length - 1];
        if (last && last.copilotEvents) {
             last.copilotEvents[0].status = 'completed';
             last.copilotEvents[0].message = plan; 
             
             last.copilotEvents.push({ 
                id: '2', 
                status: 'loading', 
                message: 'Searching specific sources...', 
                items: queries 
            });
        }
        return newMsgs;
      });

      // 3. EXECUTE SEARCH
      const searchPromises = queries.map(q => searchFast(q));
      const resultsArray = await Promise.all(searchPromises);
      
      const seenLinks = new Set<string>();
      const allResults: SearchResult[] = [];
      
      resultsArray.forEach(res => {
         res.results.forEach(item => {
             if (!seenLinks.has(item.link)) {
                 seenLinks.add(item.link);
                 allResults.push(item);
             }
         });
      });

      // 4. REVIEW SOURCES
      setMessages(prev => {
            const newMsgs = [...prev];
            const last = newMsgs[newMsgs.length - 1];
            if (last && last.copilotEvents) {
                const lastIdx = last.copilotEvents.length - 1;
                last.copilotEvents[lastIdx].status = 'completed';
                
                last.sources = allResults;
                last.copilotEvents.push({ id: '3', status: 'completed', message: `Analyzed ${allResults.length} sources` });
            }
            return newMsgs;
       });

      // 5. GENERATE ANSWER
      await streamResponse(
        query, 
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
        undefined,
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
