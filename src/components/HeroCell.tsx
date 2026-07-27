import { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import { getOrganism } from '@/data/organisms';
import { ProceduralCell } from '@/three/ProceduralCell';
import { VIEW_DIR } from '@/three/focus';

/** A gently auto-rotating, non-selecting preview cell for the home hero. */
export function HeroCell({ organismId }: { organismId: string }) {
  const organism = getOrganism(organismId);
  if (!organism) return null;

  return (
    <Canvas
      camera={{ position: VIEW_DIR.clone().multiplyScalar(7.6).toArray() as [number, number, number], fov: 42 }}
      dpr={[1, 2]}
    >
      <color attach="background" args={['#0b1428']} />
      <ambientLight intensity={0.6} />
      <hemisphereLight args={['#bcd4ff', '#1a1330', 0.6]} />
      <directionalLight position={[5, 6, 5]} intensity={1.1} />
      <pointLight position={[0, 0, 0]} intensity={0.5} distance={6} color="#8ee6c8" />
      <Spin>
        <ProceduralCell
          organism={organism}
          selectedStructureId={null}
          hoveredStructureId={null}
          overlay="none"
          onSelectStructure={() => {}}
          onHoverStructure={() => {}}
          onSelectMechanism={() => {}}
        />
      </Spin>
      <OrbitControls enablePan={false} enableZoom={false} />
    </Canvas>
  );
}

function Spin({ children }: { children: React.ReactNode }) {
  const ref = useRef<THREE.Group>(null);
  useFrame((_, delta) => {
    if (ref.current) ref.current.rotation.y += delta * 0.18;
  });
  return <group ref={ref}>{children}</group>;
}
