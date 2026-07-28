import { useRef, type MutableRefObject } from 'react';
import * as THREE from 'three';
import { useFrame, useThree } from '@react-three/fiber';

/** Preferred on-screen bar length, capped on narrow (mobile) canvases. */
const TARGET_PX = 130;

const ORIGIN = new THREE.Vector3(0, 0, 0);

/** Round to a 1-2-5 sequence so the bar reads 1, 2, 5, 10, 20, 50 … */
function niceLength(value: number): number {
  if (!(value > 0) || !Number.isFinite(value)) return 1;
  const exp = Math.floor(Math.log10(value));
  const base = Math.pow(10, exp);
  const f = value / base;
  const nice = f >= 5 ? 5 : f >= 2 ? 2 : 1;
  return nice * base;
}

/** Human-readable length, switching units so the number stays small. */
export function formatLength(um: number): string {
  if (um < 0.001) return `${+(um * 1e6).toPrecision(3)} pm`;
  if (um < 1) return `${+(um * 1000).toPrecision(3)} nm`;
  if (um < 1000) return `${+um.toPrecision(3)} µm`;
  return `${+(um / 1000).toPrecision(3)} mm`;
}

export interface ScaleBarRefs {
  bar: MutableRefObject<HTMLDivElement | null>;
  label: MutableRefObject<HTMLSpanElement | null>;
}

/**
 * Measures the live camera framing each frame and drives the scale bar's width
 * and label. It writes to the DOM directly rather than through React state —
 * this runs at frame rate, and re-rendering the tree on every camera nudge would
 * be wasteful.
 */
export function ScaleProbe({
  umPerUnit,
  refs,
}: {
  umPerUnit: number;
  refs: ScaleBarRefs;
}) {
  const { camera, size, controls } = useThree();
  const lastPx = useRef(-1);
  const lastLabel = useRef('');

  useFrame(() => {
    const bar = refs.bar.current;
    const label = refs.label.current;
    if (!bar || !label) return;

    const persp = camera as THREE.PerspectiveCamera;
    const target = (controls as { target?: THREE.Vector3 } | null)?.target ?? ORIGIN;
    const distance = camera.position.distanceTo(target);

    // World height spanned by the viewport at the focal distance.
    const worldHeight = 2 * distance * Math.tan(((persp.fov ?? 42) * Math.PI) / 360);
    if (!(worldHeight > 0)) return;
    const pxPerUnit = size.height / worldHeight;
    const pxPerUm = pxPerUnit / umPerUnit;
    if (!Number.isFinite(pxPerUm) || pxPerUm <= 0) return;

    const targetPx = Math.min(TARGET_PX, size.width * 0.34);
    const lengthUm = niceLength(targetPx / pxPerUm);
    const px = Math.round(lengthUm * pxPerUm);
    const text = formatLength(lengthUm);

    if (px !== lastPx.current) {
      bar.style.width = `${px}px`;
      lastPx.current = px;
    }
    if (text !== lastLabel.current) {
      label.textContent = text;
      lastLabel.current = text;
    }
  });

  return null;
}

/** The rendered key. Sits over the canvas; `ScaleProbe` drives its size/label. */
export function ScaleBar({ refs }: { refs: ScaleBarRefs }) {
  return (
    <div className="scale-key" aria-hidden>
      <span ref={refs.label} className="scale-key-label" />
      <div ref={refs.bar} className="scale-key-bar" />
    </div>
  );
}

/** Convenience hook pairing the two halves. */
export function useScaleBarRefs(): ScaleBarRefs {
  const bar = useRef<HTMLDivElement | null>(null);
  const label = useRef<HTMLSpanElement | null>(null);
  return { bar, label };
}
