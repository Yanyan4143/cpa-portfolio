import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import vercel from '@astrojs/vercel'; // You will likely need an adapter

export default defineConfig({
  // 1. Change 'static' to 'server' to allow API routes
  output: 'server', 

  // 2. Add an adapter (Vercel is best for Astro + Gemini)
  adapter: vercel(),

  server: {
    port: 4321
  },

  integrations: [react()]
});