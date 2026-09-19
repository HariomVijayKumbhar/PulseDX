'use client';

/**
 * Avatar3DOrb — a small, reusable 3D avatar. Renders one of the six
 * avatar personas (from Avatar3DCard's AVATAR_3D_OPTIONS) as a live
 * Three.js shape inside a compact canvas. Falls back to a static
 * gradient orb on the server / when WebGL is unavailable.
 */

import React, { useEffect, useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, MeshDistortMaterial, MeshWobbleMaterial, Sphere } from '@react-three/drei';
import * as THREE from 'three';
import { AvatarConfig } from './Avatar3DCard';

/* ─── Individual shapes (mirrors Avatar3DCard) ─── */

function ShapeFor({ config, hovered }: { config: AvatarConfig; hovered: boolean }) {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (!meshRef.current) return;
    meshRef.current.rotation.y += 0.015;
    meshRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.6) * 0.25;
  });

  const material =
    config.shape === 'toroid' ? (
      <MeshWobbleMaterial
        color={hovered ? '#fff' : config.primaryColor}
        emissive={config.emissiveColor}
        emissiveIntensity={hovered ? 1 : 0.45}
        factor={0.3}
        speed={2}
        roughness={0.1}
        metalness={0.85}
      />
    ) : config.shape === 'sphere' ? (
      <MeshDistortMaterial
        color={hovered ? '#fff' : config.primaryColor}
        emissive={config.emissiveColor}
        emissiveIntensity={hovered ? 1.1 : 0.5}
        distort={0.35}
        speed={2}
        roughness={0.05}
        metalness={0.9}
      />
    ) : (
      <meshStandardMaterial
        color={hovered ? '#fff' : config.primaryColor}
        emissive={config.emissiveColor}
        emissiveIntensity={hovered ? 1.2 : 0.55}
        roughness={0.05}
        metalness={0.95}
      />
    );

  return (
    <mesh ref={meshRef} scale={hovered ? 1.12 : 1}>
      {config.shape === 'sphere' && <sphereGeometry args={[0.7, 32, 32]} />}
      {config.shape === 'crystal' && <octahedronGeometry args={[0.8, 0]} />}
      {config.shape === 'diamond' && <tetrahedronGeometry args={[0.85, 0]} />}
      {config.shape === 'star' && <dodecahedronGeometry args={[0.7, 0]} />}
      {config.shape === 'toroid' && <torusGeometry args={[0.55, 0.26, 20, 60]} />}
      {config.shape === 'capsule' && <capsuleGeometry args={[0.36, 0.62, 8, 20]} />}
      {material}
    </mesh>
  );
}

/* ─── Static fallback (no WebGL / SSR) ─── */
function StaticFallback({ config }: { config: AvatarConfig }) {
  return (
    <div
      className="w-full h-full rounded-full"
      style={{
        background: `radial-gradient(circle at 30% 30%, ${config.accentColor}, ${config.primaryColor} 60%, ${config.emissiveColor})`,
        boxShadow: `0 0 18px ${config.primaryColor}66, inset 0 -4px 10px ${config.emissiveColor}88`,
      }}
      aria-hidden
    />
  );
}

/* ─── Public component ─── */
interface Avatar3DOrbProps {
  config: AvatarConfig;
  /** Tailwind size classes, e.g. "w-8 h-8" */
  className?: string;
}

export default function Avatar3DOrb({ config, className = 'w-8 h-8' }: Avatar3DOrbProps) {
  const [mounted, setMounted] = useState(false);
  const [webglOk, setWebglOk] = useState(true);

  useEffect(() => {
    setMounted(true);
    try {
      const canvas = document.createElement('canvas');
      const ok = !!(canvas.getContext('webgl') || canvas.getContext('experimental-webgl'));
      setWebglOk(ok);
    } catch {
      setWebglOk(false);
    }
  }, []);

  return (
    <div className={`${className} rounded-full overflow-hidden shrink-0`} aria-label={`${config.label} 3D avatar`}>
      {!mounted || !webglOk ? (
        <StaticFallback config={config} />
      ) : (
        <Canvas
          camera={{ position: [0, 0, 3], fov: 42 }}
          gl={{ antialias: true, alpha: true, powerPreference: 'low-power' }}
          style={{ width: '100%', height: '100%' }}
        >
          <ambientLight intensity={0.7} />
          <pointLight position={[3, 3, 3]} intensity={1.6} color={config.primaryColor} />
          <pointLight position={[-3, -2, -2]} intensity={0.9} color={config.accentColor} />
          <Float speed={2} rotationIntensity={0.35} floatIntensity={0.4}>
            <ShapeFor config={config} hovered={false} />
          </Float>
        </Canvas>
      )}
    </div>
  );
}
