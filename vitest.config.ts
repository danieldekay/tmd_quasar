import { defineConfig } from 'vitest/config';
import vue from '@vitejs/plugin-vue'; // May need @vitejs/plugin-vue if not already pulled by quasar

export default defineConfig({
  plugins: [vue()], // Or ensure Quasar's Vite config handles Vue plugin for Vitest
  test: {
    globals: true,
    environment: 'happy-dom',
    setupFiles: [], // For any global test setup
    include: ['src/**/*.{test,spec}.{js,ts,jsx,tsx}'],
  },
  resolve: { // Ensure aliases match tsconfig.json if any (e.g. '@/')
    alias: {
      '@/': new URL('./src/', import.meta.url).pathname,
    }
  }
});
