import { useEffect } from 'react';
import { useUser } from '@clerk/clerk-react';
import { supabase } from '@/lib/supabase';

export const useUserSync = () => {
  const { user } = useUser();

  useEffect(() => {
    const syncUser = async () => {
      if (!user) return;
      
      const email = user.primaryEmailAddress?.emailAddress;
      if (!email) return;

      // Check if user already exists
      const { data: existingUser } = await supabase
        .from('users')
        .select('id')
        .eq('id', user.id)
        .maybeSingle();

      if (!existingUser) {
        // Insert new user if they don't exist
        const { error } = await supabase
          .from('users')
          .insert([{ 
            id: user.id, 
            email: email,
            name: user.fullName || user.firstName || '',
            credits: 100
          }]);

        if (error) {
          console.error('Error syncing user to Supabase:', error);
          alert('Supabase User Sync Error: ' + error.message + ' | ' + error.details);
        }
      }
    };

    syncUser();
  }, [user]);
};
