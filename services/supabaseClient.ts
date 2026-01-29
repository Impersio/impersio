
// Supabase has been removed from this project. 
// This file acts as a placeholder to prevent import errors in legacy code.

export const supabase = {
    auth: {
      getSession: async () => ({ data: { session: null }, error: null }),
      onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
      signInWithPassword: async () => ({ data: null, error: new Error("Supabase removed") }),
      signUp: async () => ({ data: null, error: new Error("Supabase removed") }),
      signOut: async () => ({ error: null }),
    },
    from: (_table: string) => {
      // Chainable dummy object
      const dummyChain = {
        select: () => dummyChain,
        insert: () => dummyChain,
        eq: () => dummyChain,
        order: () => dummyChain,
        single: () => Promise.resolve({ data: null, error: null }),
        then: (resolve: any) => Promise.resolve({ data: [], error: null }).then(resolve)
      };
      return dummyChain;
    }
  };
