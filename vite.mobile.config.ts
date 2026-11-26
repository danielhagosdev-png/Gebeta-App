import { defineConfig, mergeConfig } from 'vite';
import { viteSingleFile } from 'vite-plugin-singlefile';
import baseConfig from './vite.config';

// Builds the same web game as ONE self-contained HTML file.
// The Expo app embeds that file, so the phone never needs the PC's dev server.
export default defineConfig((env) =>
  mergeConfig(baseConfig(env), {
    plugins: [viteSingleFile()],
    build: {
      outDir: 'dist-mobile',
      emptyOutDir: true,
      assetsInlineLimit: 100_000_000,
      cssCodeSplit: false,
    },
  }),
);
