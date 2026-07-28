import { Suspense, lazy, useEffect } from 'react';
import { useStore, type ModuleId } from './state/store';
import { Home } from './components/Home';

/**
 * The two modules are split out of the entry bundle. Home stays eager — it is
 * what the first request is for — but it is also almost entirely text, so
 * making it wait behind a megabyte of three.js before anything appears was
 * paying the whole 3D cost up front for a page whose 3D is one decorative
 * hero.
 */
const StructureModule = lazy(() =>
  import('./components/StructureModule').then((m) => ({ default: m.StructureModule })),
);
const GramModule = lazy(() =>
  import('./components/GramModule').then((m) => ({ default: m.GramModule })),
);

const NAV: { id: ModuleId; label: string; icon: string }[] = [
  { id: 'home', label: 'Home', icon: '🏠' },
  { id: 'structure', label: 'Structure', icon: '🧫' },
  { id: 'gram', label: 'Gram', icon: '🔬' },
];

export function App() {
  const module = useStore((s) => s.module);
  const goToModule = useStore((s) => s.goToModule);

  /**
   * Fetch both module chunks once the browser is otherwise idle.
   *
   * Splitting them out is only a win if the split is invisible: a student who
   * opens the explorer should not trade a slow first paint for a spinner on
   * every navigation. By the time anyone has read the two cards on the home
   * page these are in cache, and the click resolves instantly. They are also
   * cheap by then — the heavy shared chunk is three.js, which the hero has
   * already pulled.
   */
  useEffect(() => {
    const warm = () => {
      void import('./components/StructureModule');
      void import('./components/GramModule');
    };
    if (typeof window.requestIdleCallback !== 'function') {
      const timer = window.setTimeout(warm, 1500);
      return () => window.clearTimeout(timer);
    }
    const handle = window.requestIdleCallback(warm, { timeout: 3000 });
    return () => window.cancelIdleCallback(handle);
  }, []);

  return (
    <div className="app">
      {/* Three rails and a tab bar sit between the top of the document and the
          model, so a keyboard user otherwise tabs through all of them on every
          page. Visually hidden until focused. */}
      <a className="skip-link" href="#content">
        Skip to the model
      </a>
      <header className="topbar">
        <div className="brand">
          <svg className="brand-mark" viewBox="0 0 32 32" aria-hidden>
            <circle cx="16" cy="16" r="9" fill="none" stroke="#3ddc97" strokeWidth="2" />
            <circle cx="16" cy="16" r="5.5" fill="none" stroke="#6ea8fe" strokeWidth="1.6" />
            <circle cx="14" cy="14" r="1.5" fill="#f0b64d" />
            <circle cx="18.5" cy="17" r="1.2" fill="#f0b64d" />
          </svg>
          <div>
            MicroLearning
            <small>Interactive microbiology</small>
          </div>
        </div>

        <nav className="nav">
          {NAV.map((n) => (
            <button
              key={n.id}
              className={module === n.id ? 'active' : ''}
              onClick={() => goToModule(n.id)}
            >
              {n.id === 'structure' ? 'Bacterial Structure' : n.id === 'gram' ? 'Gram Staining' : n.label}
            </button>
          ))}
        </nav>

        <div className="spacer" />
        <div className="topbar-hint">Click any structure to zoom in &amp; learn</div>
      </header>

      <main className="content" id="content" tabIndex={-1}>
        {module === 'home' && <Home />}
        <Suspense fallback={<div className="empty-hint">Loading…</div>}>
          {module === 'structure' && <StructureModule />}
          {module === 'gram' && <GramModule />}
        </Suspense>
      </main>

      <nav className="tabbar">
        {NAV.map((n) => (
          <button
            key={n.id}
            className={module === n.id ? 'active' : ''}
            onClick={() => goToModule(n.id)}
          >
            <span className="ic">{n.icon}</span>
            {n.label}
          </button>
        ))}
      </nav>
    </div>
  );
}
