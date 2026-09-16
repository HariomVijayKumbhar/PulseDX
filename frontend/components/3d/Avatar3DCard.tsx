'use client';

import React, { useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, MeshDistortMaterial, Sphere, Torus, MeshWobbleMaterial } from '@react-three/drei';
import * as THREE from 'three';

export interface AvatarConfig {
  id: string;
  label: string;
  primaryColor: string;
  accentColor: string;
  emissiveColor: string;
  shape: 'sphere' | 'crystal' | 'toroid' | 'capsule' | 'diamond' | 'star';
  bgGradient: string;
}

export const AVATAR_3D_OPTIONS: AvatarConfig[] = [
  {
    id: 'nova',
    label: 'Nova',
    primaryColor: '#818cf8',
    accentColor: '#c084fc',
    emissiveColor: '#4f46e5',
    shape: 'sphere',
    bgGradient: 'from-indigo-500/30 via-purple-500/20 to-transparent',
  },
  {
    id: 'orbit',
    label: 'Orbit',
    primaryColor: '#f472b6',
    accentColor: '#fb923c',
    emissiveColor: '#db2777',
    shape: 'toroid',
    bgGradient: 'from-pink-500/30 via-orange-400/20 to-transparent',
  },
  {
    id: 'pixel',
    label: 'Pixel',
    primaryColor: '#34d399',
    accentColor: '#22d3ee',
    emissiveColor: '#059669',
    shape: 'crystal',
    bgGradient: 'from-emerald-500/30 via-cyan-400/20 to-transparent',
  },
  {
    id: 'zen',
    label: 'Zen',
    primaryColor: '#a78bfa',
    accentColor: '#e879f9',
    emissiveColor: '#7c3aed',
    shape: 'diamond',
    bgGradient: 'from-violet-500/30 via-fuchsia-400/20 to-transparent',
  },
  {
    id: 'flash',
    label: 'Flash',
    primaryColor: '#fbbf24',
    accentColor: '#f87171',
    emissiveColor: '#d97706',
    shape: 'star',
    bgGradient: 'from-amber-500/30 via-red-400/20 to-transparent',
  },
  {
    id: 'luna',
    label: 'Luna',
    primaryColor: '#38bdf8',
    accentColor: '#818cf8',
    emissiveColor: '#0369a1',
    shape: 'capsule',
    bgGradient: 'from-sky-500/30 via-indigo-400/20 to-transparent',
  },
];

/* ─── Individual shape components ─── */

function NovaShape({ config, hovered }: { config: AvatarConfig; hovered: boolean }) {
  const coreRef = useRef<THREE.Mesh>(null);
  const ringRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (ringRef.current) {
      ringRef.current.rotation.z += 0.012;
      ringRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.5) * 0.3;
    }
  });

  return (
    <group>
      <Sphere ref={coreRef} args={[0.6, 32, 32]}>
        <MeshDistortMaterial
          color={hovered ? '#fff' : config.primaryColor}
          emissive={config.emissiveColor}
          emissiveIntensity={hovered ? 1.2 : 0.5}
          distort={hovered ? 0.5 : 0.3}
          speed={2}
          roughness={0.05}
          metalness={0.9}
        />
      </Sphere>
      <mesh ref={ringRef} rotation={[Math.PI / 4, 0, 0]} scale={hovered ? 1.15 : 1}>
        <torusGeometry args={[0.9, 0.05, 16, 80]} />
        <meshStandardMaterial
          color={config.accentColor}
          emissive={config.accentColor}
          emissiveIntensity={hovered ? 1.2 : 0.6}
          transparent
          opacity={0.85}
        />
      </mesh>
    </group>
  );
}

function CrystalShape({ config, hovered }: { config: AvatarConfig; hovered: boolean }) {
  const meshRef = useRef<THREE.Mesh>(null);
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.018;
      meshRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.4) * 0.2;
    }
  });
  return (
    <mesh ref={meshRef} scale={hovered ? 1.1 : 1}>
      <octahedronGeometry args={[0.75, 0]} />
      <meshStandardMaterial
        color={hovered ? '#fff' : config.primaryColor}
        emissive={config.emissiveColor}
        emissiveIntensity={hovered ? 1 : 0.4}
        roughness={0.05}
        metalness={0.95}
        wireframe={false}
      />
    </mesh>
  );
}

function ToroidShape({ config, hovered }: { config: AvatarConfig; hovered: boolean }) {
  const meshRef = useRef<THREE.Mesh>(null);
  useFrame(() => {
    if (meshRef.current) {
      meshRef.current.rotation.x += 0.01;
      meshRef.current.rotation.y += 0.015;
    }
  });
  return (
    <mesh ref={meshRef} scale={hovered ? 1.1 : 1}>
      <torusGeometry args={[0.55, 0.28, 20, 60]} />
      <MeshWobbleMaterial
        color={hovered ? '#fff' : config.primaryColor}
        emissive={config.emissiveColor}
        emissiveIntensity={hovered ? 1.0 : 0.4}
        factor={hovered ? 0.5 : 0.2}
        speed={2}
        roughness={0.1}
        metalness={0.8}
      />
    </mesh>
  );
}

function DiamondShape({ config, hovered }: { config: AvatarConfig; hovered: boolean }) {
  const meshRef = useRef<THREE.Mesh>(null);
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.02;
      meshRef.current.position.y = Math.sin(state.clock.elapsedTime * 1.2) * 0.08;
    }
  });
  return (
    <group>
      <mesh ref={meshRef} scale={hovered ? 1.1 : 1}>
        <tetrahedronGeometry args={[0.8, 0]} />
        <meshStandardMaterial
          color={hovered ? '#fff' : config.primaryColor}
          emissive={config.emissiveColor}
          emissiveIntensity={hovered ? 1.2 : 0.6}
          roughness={0.0}
          metalness={1.0}
        />
      </mesh>
      <mesh scale={hovered ? 1.35 : 1.2}>
        <icosahedronGeometry args={[0.7, 1]} />
        <meshStandardMaterial
          wireframe
          color={config.accentColor}
          emissive={config.accentColor}
          emissiveIntensity={0.5}
          transparent
          opacity={0.3}
        />
      </mesh>
    </group>
  );
}

function StarShape({ config, hovered }: { config: AvatarConfig; hovered: boolean }) {
  const meshRef = useRef<THREE.Mesh>(null);
  useFrame(() => {
    if (meshRef.current) {
      meshRef.current.rotation.z += 0.025;
      meshRef.current.rotation.y += 0.01;
    }
  });
  return (
    <group>
      <mesh ref={meshRef} scale={hovered ? 1.15 : 1}>
        <dodecahedronGeometry args={[0.65, 0]} />
        <meshStandardMaterial
          color={hovered ? '#fff' : config.primaryColor}
          emissive={config.emissiveColor}
          emissiveIntensity={hovered ? 1.2 : 0.5}
          roughness={0.1}
          metalness={0.9}
        />
      </mesh>
      <Sphere args={[0.3, 16, 16]}>
        <meshStandardMaterial
          color={config.accentColor}
          emissive={config.accentColor}
          emissiveIntensity={1.5}
          roughness={0}
          metalness={1}
        />
      </Sphere>
    </group>
  );
}

function CapsuleShape({ config, hovered }: { config: AvatarConfig; hovered: boolean }) {
  const meshRef = useRef<THREE.Mesh>(null);
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.012;
      meshRef.current.rotation.z = Math.sin(state.clock.elapsedTime * 0.8) * 0.15;
    }
  });
  return (
    <group>
      <mesh ref={meshRef} scale={hovered ? 1.1 : 1}>
        <capsuleGeometry args={[0.35, 0.6, 8, 20]} />
        <MeshDistortMaterial
          color={hovered ? '#fff' : config.primaryColor}
          emissive={config.emissiveColor}
          emissiveIntensity={hovered ? 1 : 0.4}
          distort={0.25}
          speed={1.5}
          roughness={0.05}
          metalness={0.9}
        />
      </mesh>
      <mesh rotation={[Math.PI / 2, 0, 0]} scale={hovered ? 1.2 : 1.05}>
        <torusGeometry args={[0.7, 0.04, 12, 60]} />
        <meshStandardMaterial
          color={config.accentColor}
          emissive={config.accentColor}
          emissiveIntensity={0.8}
          transparent
          opacity={0.7}
        />
      </mesh>
    </group>
  );
}

/* ─── Shape Selector ─── */
function AvatarShape({ config, hovered }: { config: AvatarConfig; hovered: boolean }) {
  switch (config.shape) {
    case 'sphere':   return <NovaShape    config={config} hovered={hovered} />;
    case 'crystal':  return <CrystalShape config={config} hovered={hovered} />;
    case 'toroid':   return <ToroidShape  config={config} hovered={hovered} />;
    case 'diamond':  return <DiamondShape config={config} hovered={hovered} />;
    case 'star':     return <StarShape    config={config} hovered={hovered} />;
    case 'capsule':  return <CapsuleShape config={config} hovered={hovered} />;
  }
}

/* ─── Scene ─── */
function AvatarScene({ config, hovered }: { config: AvatarConfig; hovered: boolean }) {
  return (
    <>
      <ambientLight intensity={0.6} />
      <pointLight position={[3, 3, 3]}  intensity={1.5} color={config.primaryColor} />
      <pointLight position={[-3, -2, -2]} intensity={0.8} color={config.accentColor} />
      <Float speed={2} rotationIntensity={0.4} floatIntensity={0.5}>
        <AvatarShape config={config} hovered={hovered} />
      </Float>
    </>
  );
}

/* ─── Public Card Component ─── */
interface Avatar3DCardProps {
  config: AvatarConfig;
  selected: boolean;
  onClick: () => void;
}

export default function Avatar3DCard({ config, selected, onClick }: Avatar3DCardProps) {
  const [hovered, setHovered] = useState(false);

  return (
    <button
      type="button"
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      aria-label={`Select avatar ${config.label}`}
      className={`relative flex flex-col items-center rounded-2xl overflow-hidden border-2 transition-all duration-200 cursor-pointer
        ${selected
          ? 'border-indigo-500 ring-2 ring-indigo-500/50 scale-105 shadow-xl shadow-indigo-500/30'
          : hovered
          ? 'border-slate-400 dark:border-slate-600 scale-102 shadow-md'
          : 'border-slate-200 dark:border-slate-800'
        }
      `}
      style={{ background: 'transparent' }}
    >
      {/* Gradient background layer */}
      <div className={`absolute inset-0 bg-gradient-to-br ${config.bgGradient} dark:opacity-80`} />

      {/* 3D Canvas */}
      <div className="relative w-full" style={{ height: '90px' }}>
        <Canvas
          camera={{ position: [0, 0, 2.8], fov: 42 }}
          gl={{ antialias: true, alpha: true }}
          style={{ width: '100%', height: '100%' }}
        >
          <AvatarScene config={config} hovered={hovered || selected} />
        </Canvas>
      </div>

      {/* Name label */}
      <span
        className={`relative z-10 text-[11px] font-semibold pb-1.5 pt-0.5 tracking-wide transition-colors
          ${selected ? 'text-indigo-500' : 'text-muted-foreground'}
        `}
      >
        {config.label}
      </span>

      {/* Selected checkmark ring */}
      {selected && (
        <span className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-indigo-500 flex items-center justify-center shadow-md">
          <svg viewBox="0 0 10 10" className="w-2.5 h-2.5 text-white fill-none stroke-white stroke-2">
            <polyline points="1.5,5 4,7.5 8.5,2.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </span>
      )}
    </button>
  );
}
