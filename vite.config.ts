import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    host: true, // Listen on all local IPs so it's accessible via iPhone on the same Wi-Fi
    port: 5173,
  },
});
