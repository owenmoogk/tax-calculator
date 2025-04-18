import react from '@vitejs/plugin-react';
import fs from 'fs/promises'; // Use fs.promises for async file operations
import path from 'path';
import { defineConfig } from 'vite';
import eslint from 'vite-plugin-eslint';
import { viteStaticCopy } from 'vite-plugin-static-copy';

import type { Project } from '@api/projects';

export const ProjectJsonPath = path.resolve(
  __dirname,
  'src',
  'api',
  'projects.json'
);

export default defineConfig({
  plugins: [
    react({
      jsxRuntime: 'automatic',
    }),
    eslint({
      include: ['src/**/*.ts', 'src/**/*.tsx'],
      emitWarning: true,
      emitError: false, // error doesn't block compilation
      failOnWarning: false,
      failOnError: false, // error doesn't block compilation
    }),
  ],
  server: {
    port: 3000,
  },
  resolve: {
    alias: {
      '@components': path.resolve(__dirname, './src/components'),
      '@api': path.resolve(__dirname, './src/api'),
      '@global': path.resolve(__dirname, './src/global'),
    },
  },
});
