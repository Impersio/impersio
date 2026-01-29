
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  const env = loadEnv(mode, process.cwd(), '');

  return {
    plugins: [react()],
    define: {
      // API Keys Mapping (Securely passed from build environment to client)
      'process.env.GOOGLE_API_KEY': JSON.stringify(env.GOOGLE_API_KEY || env.VITE_GOOGLE_API_KEY || ''),
      'process.env.TAVILY_API_KEY': JSON.stringify(env.TAVILY_API_KEY || env.VITE_TAVILY_API_KEY || ''),
      'process.env.EXA_API_KEY': JSON.stringify(env.EXA_API_KEY || env.VITE_EXA_API_KEY || ''),
      'process.env.OPENROUTER_API_KEY': JSON.stringify(env.OPENROUTER_API_KEY || env.VITE_OPENROUTER_API_KEY || ''),
      'process.env.CEREBRAS_API_KEY': JSON.stringify(env.CEREBRAS_API_KEY || env.VITE_CEREBRAS_API_KEY || ''),
      'process.env.GROQ_API_KEY': JSON.stringify(env.GROQ_API_KEY || env.VITE_GROQ_API_KEY || ''),
    },
    server: {
      port: 3000,
    }
  };
});
