import { useStore, type ModuleId } from './state/store';
import { Home } from './components/Home';
import { StructureModule } from './components/StructureModule';
import { GramModule } from './components/GramModule';

const NAV: { id: ModuleId; label: string; icon: string }[] = [
  { id: 'home', label: 'Home', icon: '🏠' },
  { id: 'structure', label: 'Structure', icon: '🧫' },
  { id: 'gram', label: 'Gram', icon: '🔬' },
];

export function App() {
  const module = useStore((s) => s.module);
  const goToModule = useStore((s) => s.goToModule);

  return (
    <div className="app">
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

      <div className="content">
        {module === 'home' && <Home />}
        {module === 'structure' && <StructureModule />}
        {module === 'gram' && <GramModule />}
      </div>

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
