import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': 'https://arline-unbalked-hiram.ngrok-free.dev/api/v1/'
    }
  }
});
