import { supabase } from './supabaseClient';
import { v4 as uuid } from 'uuid';

export const saveToLibrary = async (searchInput: string, userEmail: string, type: 'search' | 'research' = 'search') => {
  if (!searchInput.trim() || !userEmail) return;

  try {
    const { error } = await supabase
      .from('library')
      .insert({
        libid: uuid(),
        searchinput: searchInput,
        userEmail: userEmail,
        type: type,
        created_at: new Date().toISOString(),
      });

    if (error) {
      console.error('Error saving to library:', error);
    }
  } catch (err) {
    console.error('Unexpected error saving to library:', err);
  }
};
