
import { Message, SearchResult, WidgetData } from '../types';

export interface SavedConversation {
  id: string;
  title: string;
  created_at: string;
}

const CONVERSATIONS_KEY = 'impersio_local_conversations';
const MESSAGES_PREFIX = 'impersio_local_msgs_';

export const createConversation = async (title: string, userId?: string): Promise<string | null> => {
  try {
    const id = crypto.randomUUID();
    const newConv: SavedConversation = {
      id,
      title,
      created_at: new Date().toISOString()
    };

    const existing = localStorage.getItem(CONVERSATIONS_KEY);
    const conversations = existing ? JSON.parse(existing) : [];
    conversations.unshift(newConv);
    localStorage.setItem(CONVERSATIONS_KEY, JSON.stringify(conversations));
    
    return id;
  } catch (e) {
    console.error('Error creating conversation:', e);
    return null;
  }
};

export const saveMessage = async (
  conversationId: string,
  role: 'user' | 'assistant',
  content: string,
  extraData?: {
    images?: string[];
    sources?: SearchResult[];
    widget?: WidgetData;
    relatedQuestions?: string[];
  }
) => {
  try {
    const key = `${MESSAGES_PREFIX}${conversationId}`;
    const existing = localStorage.getItem(key);
    const messages = existing ? JSON.parse(existing) : [];

    const newMessage = {
        role,
        content,
        images: extraData?.images,
        sources: extraData?.sources,
        widget: extraData?.widget,
        related_questions: extraData?.relatedQuestions,
        created_at: new Date().toISOString()
    };

    messages.push(newMessage);
    localStorage.setItem(key, JSON.stringify(messages));
  } catch (e) {
    console.error('Error saving message:', e);
  }
};

export const getUserConversations = async (userId: string): Promise<SavedConversation[]> => {
    // In local mode, we ignore userId and return all local conversations
    const existing = localStorage.getItem(CONVERSATIONS_KEY);
    return existing ? JSON.parse(existing) : [];
};

export const getConversationMessages = async (conversationId: string): Promise<Message[]> => {
  const key = `${MESSAGES_PREFIX}${conversationId}`;
  const existing = localStorage.getItem(key);
  const rawMessages = existing ? JSON.parse(existing) : [];

  return rawMessages.map((msg: any) => ({
      role: msg.role,
      content: msg.content,
      images: msg.images,
      sources: msg.sources,
      widget: msg.widget,
      relatedQuestions: msg.related_questions
  }));
};
