import { useMemo } from 'react';
import type { AgarAppearance } from '@/types/content';

/** A stylized top-down petri dish rendered from an AgarAppearance record. */
export function AgarPlate({ agar }: { agar: AgarAppearance }) {
  // Deterministic colony scatter so the plate is stable across renders.
  const colonies = useMemo(() => {
    const pts: { x: number; y: number; r: number }[] = [];
    const n = 14;
    const golden = Math.PI * (3 - Math.sqrt(5));
    for (let i = 0; i < n; i++) {
      const t = (i + 0.5) / n;
      const rad = 30 * Math.sqrt(t);
      const theta = golden * i;
      pts.push({
        x: 50 + Math.cos(theta) * rad,
        y: 50 + Math.sin(theta) * rad,
        r: 2.2 + ((i * 0.618) % 1) * 1.8,
      });
    }
    return pts;
  }, []);

  return (
    <div className="agar-card">
      <svg viewBox="0 0 100 100" width="100%" style={{ display: 'block' }}>
        <defs>
          <radialGradient id={`dish-${slug(agar.medium)}`} cx="45%" cy="40%" r="70%">
            <stop offset="0%" stopColor={lighten(agar.mediumColor)} />
            <stop offset="100%" stopColor={agar.mediumColor} />
          </radialGradient>
        </defs>
        <circle cx="50" cy="50" r="48" fill="#0a0f1a" />
        <circle cx="50" cy="50" r="45" fill={`url(#dish-${slug(agar.medium)})`} stroke="#1d2c46" strokeWidth="1.5" />
        {agar.halo &&
          colonies.map((c, i) => (
            <circle key={`h-${i}`} cx={c.x} cy={c.y} r={c.r * 2.4} fill={agar.halo!.color} opacity={0.35} />
          ))}
        {colonies.map((c, i) => (
          <circle key={i} cx={c.x} cy={c.y} r={c.r} fill={agar.colonyColor} opacity={0.95} />
        ))}
        <ellipse cx="38" cy="30" rx="20" ry="10" fill="#ffffff" opacity="0.05" />
      </svg>
      <h4>{agar.medium}</h4>
      <p>{agar.appearance}</p>
      {agar.halo && (
        <p style={{ marginTop: 4, color: 'var(--text-faint)' }}>◐ {agar.halo.label}</p>
      )}
      <p style={{ marginTop: 6, fontStyle: 'italic' }}>{agar.note}</p>
    </div>
  );
}

function slug(s: string): string {
  return s.replace(/[^a-z0-9]/gi, '').toLowerCase();
}

/** Naive lighten for the dish highlight — parses #rrggbb and blends toward white. */
function lighten(hex: string): string {
  const m = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!m) return hex;
  const mix = (c: number) => Math.round(c + (255 - c) * 0.22);
  const r = mix(parseInt(m[1], 16));
  const g = mix(parseInt(m[2], 16));
  const b = mix(parseInt(m[3], 16));
  return `rgb(${r}, ${g}, ${b})`;
}
