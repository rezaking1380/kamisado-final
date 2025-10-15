import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()], // Use React plugin for testing
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/setupTests.ts'],
    globals: true,
    pool: 'threads', // Try threads, but if issue persists, change to false
    poolOptions: {
      threads: {
        singleThread: true, // Run in single thread to avoid worker termination
      },
    },
  },
});