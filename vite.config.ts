import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  const env = loadEnv(mode, (process as any).cwd(), '');

  return {
    plugins: [react()],
    define: {
      // API Keys Mapping
      'process.env.GOOGLE_API_KEY': JSON.stringify(env.GOOGLE_API_KEY || env.VITE_GOOGLE_API_KEY || 'AIzaSyBQ0ZwOg0rIwhJvx4wIWrKAA5f_BjK9lyQ'),
      'process.env.TAVILY_API_KEY': JSON.stringify(env.TAVILY_API_KEY || env.VITE_TAVILY_API_KEY || ''),
      'process.env.EXA_API_KEY': JSON.stringify(env.EXA_API_KEY || env.VITE_EXA_API_KEY || '32685eab-b7b5-4b33-b90d-3569b6e07958'),
      'process.env.OPENROUTER_API_KEY': JSON.stringify(env.OPENROUTER_API_KEY || env.VITE_OPENROUTER_API_KEY || ''),
      'process.env.CEREBRAS_API_KEY': JSON.stringify(env.CEREBRAS_API_KEY || env.VITE_CEREBRAS_API_KEY || ''),
      'process.env.GROQ_API_KEY': JSON.stringify(env.GROQ_API_KEY || env.VITE_GROQ_API_KEY || ''),
    },
    server: {
      port: 3000,
    }
  };
});