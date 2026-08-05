import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// GitHub Pages serves this repo at /scam-awareness-simulator/
export default defineConfig({
  base: '/scam-awareness-simulator/',
  plugins: [react()],
});
