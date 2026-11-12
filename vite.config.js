import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// allowedHosts lets the site load through a VS Code forwarded port, and nothing else
// (VS Code tunnels use a *.devtunnels.ms host, which Vite blocks by default).
export default defineConfig({
  base: './',
  plugins: [react()],
  server: { host: true, port: 5173, allowedHosts: ['.devtunnels.ms'] },
  preview: { host: true, port: 4173, strictPort: true, allowedHosts: ['.devtunnels.ms'] },
  build: { chunkSizeWarningLimit: 900 },
});
