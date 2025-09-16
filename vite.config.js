import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    // Add your ngrok URL to this list
    // Oyaage ngrok URL eka methanata daanna
    allowedHosts: ['38462e20ae1c.ngrok-free.app'],
  }
})