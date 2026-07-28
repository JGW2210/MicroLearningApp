import { defineConfig } from 'vitest/config';
import { fileURLToPath, URL } from 'node:url';

/**
 * Held apart from `vite.config.ts` so the app's build config stays free of test
 * concerns; the `@` alias is the only thing the two have to agree about.
 *
 * The environment is `node` deliberately. Nothing under test needs a DOM or a
 * GL context — the geometry invariants, the identification key and the content
 * cross-references are all pure functions over the data, which is exactly why
 * they are the parts worth guarding automatically.
 */
export default defineConfig({
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  test: {
    environment: 'node',
    include: ['tests/**/*.test.ts'],
  },
});
