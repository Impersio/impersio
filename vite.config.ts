
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  // Set the third parameter to '' to load all env regardless of the `VITE_` prefix.
  const env = loadEnv(mode, process.cwd(), '');

  return {
    plugins: [react()],
    define: {
      // Explicitly expose these specific keys to the client side
      // Checks multiple common naming conventions for maximum compatibility
      'process.env.API_KEY': JSON.stringify(
        env.API_KEY || 
        env.VITE_API_KEY || 
        env.GOOGLE_API_KEY || 
        env.VITE_GOOGLE_API_KEY || 
        process.env.GOOGLE_API_KEY || 
        process.env.API_KEY || 
        ''
      ),
      'process.env.GROQ_API_KEY': JSON.stringify(env.GROQ_API_KEY || env.VITE_GROQ_API_KEY || ''),
    },
    server: {
      port: 3000,
    }
  };
});
