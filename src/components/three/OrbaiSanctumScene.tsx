import * as React from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

function SanctumOrbitalSculpture(): React.JSX.Element {
  const outerRingRef = React.useRef<THREE.Mesh>(null);
  const innerRingRef = React.useRef<THREE.Mesh>(null);
  const coreRef = React.useRef<THREE.Mesh>(null);

  useFrame((state, delta) => {
    if (outerRingRef.current) {
      outerRingRef.current.rotation.z += delta * 0.14;
      outerRingRef.current.rotation.x = THREE.MathUtils.lerp(
        outerRingRef.current.rotation.x,
        0.35 + state.pointer.y * 0.18,
        0.05
      );
      outerRingRef.current.rotation.y = THREE.MathUtils.lerp(
        outerRingRef.current.rotation.y,
        state.pointer.x * 0.22,
        0.05
      );
    }
    if (innerRingRef.current) {
      innerRingRef.current.rotation.y -= delta * 0.2;
      innerRingRef.current.rotation.x += delta * 0.1;
    }
    if (coreRef.current) {
      coreRef.current.rotation.y += delta * 0.25;
    }
  });

  return (
    <group position={[0, 0, 0]}>
      <ambientLight intensity={0.85} />
      <directionalLight position={[4, 5, 4]} intensity={1.8} color="#FAF8F5" />
      <directionalLight position={[-4, -3, 2]} intensity={1.2} color="#C5A059" />

      <mesh ref={outerRingRef}>
        <torusGeometry args={[1.45, 0.032, 24, 96]} />
        <meshStandardMaterial color="#C5A059" metalness={0.75} roughness={0.22} />
      </mesh>

      <mesh ref={innerRingRef} rotation={[Math.PI / 3, 0, 0]}>
        <torusGeometry args={[1.08, 0.024, 20, 72]} />
        <meshStandardMaterial color="#0D4A3E" metalness={0.45} roughness={0.3} />
      </mesh>

      <mesh ref={coreRef}>
        <icosahedronGeometry args={[0.52, 1]} />
        <meshPhysicalMaterial
          color="#166154"
          roughness={0.18}
          metalness={0.15}
          transmission={0.65}
          thickness={0.5}
          wireframe={false}
        />
      </mesh>
    </group>
  );
}

export interface OrbaiSanctumSceneProps {
  isInView: boolean;
}

export default function OrbaiSanctumScene({
  isInView,
}: OrbaiSanctumSceneProps): React.JSX.Element {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 z-10 opacity-75"
    >
      <Canvas
        dpr={[1, 1.5]}
        frameloop={isInView ? 'always' : 'never'}
        camera={{ position: [0, 0, 4.2], fov: 40 }}
        gl={{ alpha: true, antialias: true, powerPreference: 'low-power' }}
      >
        <SanctumOrbitalSculpture />
      </Canvas>
    </div>
  );
}
