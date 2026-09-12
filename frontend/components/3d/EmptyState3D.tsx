'use client';

import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float } from '@react-three/drei';
import * as THREE from 'three';
import { useReducedMotion } from '@/lib/hooks/useReducedMotion';

function FloatingBox() {
  const meshRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (!meshRef.current) return;
    meshRef.current.rotation.x = state.clock.elapsedTime * 0.4;
    meshRef.current.rotation.y = state.clock.elapsedTime * 0.5;
  });

  return (
    <group ref={meshRef}>
      {/* Outer Wireframe Box */}
      <mesh>
        <boxGeometry args={[1.5, 1.5, 1.5]} />
        <meshStandardMaterial
          wireframe
          color="#a855f7"
          emissive="#7e22ce"
          emissiveIntensity={0.5}
          roughness={0.3}
        />
      </mesh>
      {/* Inner Floating Octahedron */}
      <mesh scale={0.6}>
        <octahedronGeometry />
        <meshStandardMaterial
          color="#38bdf8"
          emissive="#0284c7"
          emissiveIntensity={0.6}
          roughness={0.1}
          metalness={0.8}
        />
      </mesh>
    </group>
  );
}

export default function EmptyState3D() {
  const prefersReducedMotion = useReducedMotion();

  if (prefersReducedMotion) {
    return (
      <div className="w-24 h-24 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center">
        <span className="text-3xl">📦</span>
      </div>
    );
  }

  return (
    <div className="w-32 h-32 relative">
      <Canvas
        camera={{ position: [0, 0, 3.5], fov: 45 }}
        gl={{ antialias: true, alpha: true }}
      >
        <ambientLight intensity={0.7} />
        <pointLight position={[5, 5, 5]} intensity={1.2} color="#c084fc" />
        <Float speed={2} rotationIntensity={0.8} floatIntensity={1}>
          <FloatingBox />
        </Float>
      </Canvas>
    </div>
  );
}
