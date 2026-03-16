import { supabase } from './supabaseClient';

export const saveToLibrary = async (searchInput: string, userEmail: string) => {
  if (!searchInput.trim() || !userEmail) return;

  try {
    const { error } = await supabase
      .from('library')
      .insert({
        query: searchInput,
        user_email: userEmail,
        timestamp: new Date().toISOString(),
      });

    if (error) {
      console.error('Error saving to library:', error);
    }
  } catch (err) {
    console.error('Unexpected error saving to library:', err);
  }
};
