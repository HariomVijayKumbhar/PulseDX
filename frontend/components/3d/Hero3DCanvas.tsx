'use client';

import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, MeshDistortMaterial, Sphere, TorusKnot } from '@react-three/drei';
import * as THREE from 'three';
import { useReducedMotion } from '@/lib/hooks/useReducedMotion';

function FloatingPolyhedron() {
  const meshRef = useRef<THREE.Group>(null);
  const coreRef = useRef<THREE.Mesh>(null);
  const outerRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (!meshRef.current) return;

    // Subtle mouse parallax with smooth damping
    const targetX = state.pointer.x * 0.4;
    const targetY = state.pointer.y * 0.4;

    meshRef.current.rotation.y = THREE.MathUtils.lerp(meshRef.current.rotation.y, targetX + state.clock.elapsedTime * 0.15, 0.05);
    meshRef.current.rotation.x = THREE.MathUtils.lerp(meshRef.current.rotation.x, -targetY + Math.sin(state.clock.elapsedTime * 0.3) * 0.1, 0.05);

    if (coreRef.current) {
      coreRef.current.rotation.z += 0.005;
    }
  });

  return (
    <group ref={meshRef}>
      {/* Outer Wireframe / Geometric cage */}
      <mesh ref={outerRef} scale={1.8}>
        <icosahedronGeometry args={[1, 1]} />
        <meshStandardMaterial
          wireframe
          color="#818cf8"
          emissive="#4f46e5"
          emissiveIntensity={0.6}
          roughness={0.2}
          metalness={0.8}
        />
      </mesh>

      {/* Inner Glowing Distorted Core */}
      <Sphere ref={coreRef} args={[1.0, 32, 32]} scale={1.1}>
        <MeshDistortMaterial
          color="#6366f1"
          emissive="#312e81"
          emissiveIntensity={0.4}
          roughness={0.1}
          metalness={0.9}
          distort={0.35}
          speed={1.5}
        />
      </Sphere>

      {/* Orbiting Subtle Ring */}
      <mesh rotation={[Math.PI / 3, 0, 0]} scale={2.4}>
        <torusGeometry args={[1, 0.02, 16, 100]} />
        <meshStandardMaterial
          color="#c084fc"
          emissive="#9333ea"
          emissiveIntensity={0.8}
          transparent
          opacity={0.7}
        />
      </mesh>
    </group>
  );
}

export default function Hero3DCanvas() {
  const prefersReducedMotion = useReducedMotion();

  // If user prefers reduced motion, degrade to a beautiful static ambient gradient
  if (prefersReducedMotion) {
    return (
      <div className="w-full h-full min-h-[220px] flex items-center justify-center">
        <div className="w-36 h-36 rounded-full bg-gradient-to-tr from-indigo-600/40 via-purple-500/30 to-pink-500/20 blur-2xl animate-pulse-subtle" />
      </div>
    );
  }

  return (
    <div className="w-full h-full min-h-[200px] sm:min-h-[220px] relative pointer-events-auto touch-pan-y" style={{ touchAction: 'pan-y' }}>
      <Canvas
        camera={{ position: [0, 0, 4.8], fov: 45 }}
        gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
        className="w-full h-full"
      >
        <ambientLight intensity={0.8} />
        <pointLight position={[10, 10, 10]} intensity={1.5} color="#818cf8" />
        <pointLight position={[-10, -10, -5]} intensity={0.8} color="#c084fc" />
        <directionalLight position={[0, 5, 5]} intensity={1.2} />
        <Float speed={1.5} rotationIntensity={0.6} floatIntensity={0.8}>
          <FloatingPolyhedron />
        </Float>
      </Canvas>
    </div>
  );
}
