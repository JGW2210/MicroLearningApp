import { defineConfig, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath, URL } from 'node:url';

/** Chunks the browser must not be made to fetch before the first paint. */
const DEFERRED_CHUNKS = ['three'];

/**
 * Ceiling on the JavaScript the browser must have before it can paint anything,
 * in bytes before compression. Currently around 160 kB — the app shell, React
 * and the state store. The headroom is deliberate but finite: the single
 * biggest regression available here is importing the organism registry from
 * somewhere eager, which alone would put it over.
 */
const CRITICAL_PATH_BUDGET = 250_000;

/**
 * Fail the build if the critical path grows or a deferred chunk lands on it.
 *
 * Splitting three.js out is easy to do and easy to undo by accident, because
 * undoing it looks like nothing: any module the entry needs that Rollup happens
 * to place in the three chunk makes the entry statically depend on it, and Vite
 * then emits a `modulepreload` so the browser fetches the lot up front. The
 * split still appears in the build output, chunk sizes and all — it just stops
 * doing anything.
 *
 * That happened three times while this was being set up: once via Vite's own
 * dynamic-import preload helper, once via React reached through drei, once via
 * zustand. Each was invisible in the chunk listing and plain in the emitted
 * HTML, so this reads the static import graph rather than the file sizes.
 */
function guardCriticalPath(): Plugin {
  return {
    name: 'guard-critical-path',
    generateBundle(_options, bundle) {
      const entry = Object.values(bundle).find((c) => c.type === 'chunk' && c.isEntry);
      if (!entry || entry.type !== 'chunk') return;

      // Everything the browser must have in hand before the entry can run.
      const eager = new Set<string>();
      const walk = (fileName: string) => {
        if (eager.has(fileName)) return;
        eager.add(fileName);
        const chunk = bundle[fileName];
        if (chunk?.type === 'chunk') chunk.imports.forEach(walk);
      };
      walk(entry.fileName);

      const leaked = [...eager].filter((name) =>
        DEFERRED_CHUNKS.some((c) => name.startsWith(`assets/${c}-`)),
      );
      if (leaked.length > 0) {
        this.error(
          `${leaked.join(', ')} is on the critical path: the entry chunk imports it ` +
            `statically, so the browser fetches it before first paint. Something the ` +
            `app shell needs was placed in it — name that dependency explicitly in ` +
            `manualChunks.`,
        );
      }

      const bytes = [...eager].reduce((total, name) => {
        const chunk = bundle[name];
        return total + (chunk?.type === 'chunk' ? chunk.code.length : 0);
      }, 0);
      if (bytes > CRITICAL_PATH_BUDGET) {
        this.error(
          `The critical path is ${(bytes / 1000).toFixed(0)} kB, over the ` +
            `${CRITICAL_PATH_BUDGET / 1000} kB budget. Something heavy is being imported ` +
            `eagerly that could be loaded on demand: ${[...eager].join(', ')}.`,
        );
      }
    },
  };
}

export default defineConfig({
  // Relative base so the built app works when served from a project-pages
  // subpath (https://<user>.github.io/<repo>/) as well as from a domain root.
  base: './',
  plugins: [react(), guardCriticalPath()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  build: {
    // The three chunk is deliberately large and deliberately deferred, so the
    // default warning would only ever fire about the one chunk that is meant to
    // be that size — and its advice, to code-split, has been taken.
    // `guardCriticalPath` polices the part that matters instead: what has to
    // arrive before anything appears.
    chunkSizeWarningLimit: 900,
    rollupOptions: {
      output: {
        /**
         * Keep three.js and its React bindings in a chunk of their own.
         *
         * They are the bulk of the payload and they barely change, while the
         * code and content beside them change constantly. Bundled together,
         * every edit to an organism's description invalidated a megabyte of
         * unchanged library in every returning visitor's cache.
         */
        manualChunks(id) {
          // Three first: `@react-three` would otherwise match the shell rule.
          if (/[\\/]node_modules[\\/](three|three-stdlib|@react-three)[\\/]/.test(id)) {
            return 'three';
          }
          // Everything the app shell needs in order to render anything at all,
          // named explicitly. Left unassigned, each of these was liable to be
          // folded into the three chunk — which is exactly what
          // `guardCriticalPath` now refuses to ship.
          if (id.includes('vite/preload-helper')) return 'shell';
          if (/[\\/]node_modules[\\/](react|react-dom|scheduler|zustand)[\\/]/.test(id)) {
            return 'shell';
          }
          // The rest is left to Rollup. A catch-all `vendor` chunk was tried and
          // was worse than no split at all: it put drei's helper libraries —
          // only ever needed by the 3D views — in with zustand, which the entry
          // needs, and so dragged 100 kB of geometry maths onto the critical
          // path in order to fetch a state store.
        },
      },
    },
  },

  server: {
    port: 5173,
    open: false,
  },
});
