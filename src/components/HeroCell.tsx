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
      <color attach="background" args={['#04070f']} />
      <ambientLight intensity={0.4} />
      <hemisphereLight args={['#9fc4ff', '#140b26', 0.5]} />
      <directionalLight position={[5, 6, 5]} intensity={0.9} />
      <pointLight position={[-6, 3, -2]} intensity={0.9} distance={20} color="#37f0c8" />
      <pointLight position={[6, -3, 3]} intensity={0.7} distance={20} color="#c86bff" />
      <Spin>
        <ProceduralCell
          organism={organism}
          selectedStructureId={null}
          hoveredStructureId={null}
          selectedMechanismId={null}
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
