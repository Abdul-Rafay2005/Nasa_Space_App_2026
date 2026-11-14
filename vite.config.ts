import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Load all env vars from .env and .env.local regardless of prefix
  const env = loadEnv(mode, process.cwd(), '');
  const apiKey = env.VITE_GEMINI_API_KEY || env.GEMINI_API_KEY || '';
  const model = env.VITE_GEMINI_MODEL || env.GEMINI_MODEL || 'gemini-2.0-flash';

  return {
    plugins: [react()],
    define: {
      'import.meta.env.VITE_GEMINI_API_KEY': JSON.stringify(apiKey),
      'import.meta.env.VITE_GEMINI_MODEL': JSON.stringify(model),
    },
    server: {
      port: 3000,
      host: true,
    },
  };
});
