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

      const { error } = await supabase
        .from('users')
        .upsert({ 
          id: user.id, 
          email: email,
          name: user.fullName || user.firstName || ''
        }, { onConflict: 'id' });

      if (error) {
        console.error('Error syncing user to Supabase:', error);
      }
    };

    syncUser();
  }, [user]);
};
