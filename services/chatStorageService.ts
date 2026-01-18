import { supabase } from './supabaseClient';
import { Message, SearchResult, WidgetData } from '../types';

export interface SavedConversation {
  id: string;
  title: string;
  created_at: string;
}

export const createConversation = async (title: string, userId?: string): Promise<string | null> => {
  try {
    const payload: any = { title };
    if (userId) {
      payload.user_id = userId;
    }

    const { data, error } = await supabase
      .from('conversations')
      .insert([payload])
      .select('id')
      .single();

    if (error) {
      console.error('Error creating conversation:', error);
      return null;
    }
    return data.id;
  } catch (e) {
    console.error('Unexpected error creating conversation:', e);
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
    const { error } = await supabase
      .from('messages')
      .insert([{
        conversation_id: conversationId,
        role,
        content,
        images: extraData?.images ? JSON.stringify(extraData.images) : null,
        sources: extraData?.sources ? JSON.stringify(extraData.sources) : null,
        widget: extraData?.widget ? JSON.stringify(extraData.widget) : null,
        related_questions: extraData?.relatedQuestions ? JSON.stringify(extraData.relatedQuestions) : null
      }]);

    if (error) {
      console.error('Error saving message:', error);
    }
  } catch (e) {
    console.error('Unexpected error saving message:', e);
  }
};

export const getUserConversations = async (userId: string): Promise<SavedConversation[]> => {
  try {
    const { data, error } = await supabase
      .from('conversations')
      .select('id, title, created_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching conversations:', error);
      return [];
    }
    return data || [];
  } catch (e) {
    console.error('Unexpected error fetching conversations:', e);
    return [];
  }
};

export const getConversationMessages = async (conversationId: string): Promise<Message[]> => {
  try {
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error fetching messages:', error);
      return [];
    }

    return (data || []).map((msg: any) => ({
      role: msg.role,
      content: msg.content,
      images: msg.images ? JSON.parse(msg.images) : undefined,
      sources: msg.sources ? JSON.parse(msg.sources) : undefined,
      widget: msg.widget ? JSON.parse(msg.widget) : undefined,
      relatedQuestions: msg.related_questions ? JSON.parse(msg.related_questions) : undefined
    }));
  } catch (e) {
    console.error('Unexpected error fetching messages:', e);
    return [];
  }
};