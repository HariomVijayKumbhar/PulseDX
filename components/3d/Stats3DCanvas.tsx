'use client';

import React, { useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Text, RoundedBox } from '@react-three/drei';
import * as THREE from 'three';
import { useReducedMotion } from '@/lib/hooks/useReducedMotion';

interface ProjectStatItem {
  name: string;
  key: string;
  rate: number;
  color: string;
}

interface Stats3DCanvasProps {
  stats: ProjectStatItem[];
}

function StatBar({
  position,
  rate,
  label,
  code,
  color,
  isHovered,
  onPointerOver,
  onPointerOut,
}: {
  position: [number, number, number];
  rate: number;
  label: string;
  code: string;
  color: string;
  isHovered: boolean;
  onPointerOver: () => void;
  onPointerOut: () => void;
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  const targetHeight = (rate / 100) * 2.5 + 0.3; // Scale between 0.3 and 2.8 units

  useFrame(() => {
    if (!meshRef.current) return;
    const targetY = isHovered ? position[1] + 0.15 : position[1];
    meshRef.current.position.y = THREE.MathUtils.lerp(meshRef.current.position.y, targetY, 0.1);
  });

  return (
    <group position={[position[0], 0, position[2]]}>
      {/* 3D Pillar / Bar */}
      <mesh
        ref={meshRef}
        position={[0, targetHeight / 2, 0]}
        onPointerOver={(e) => {
          e.stopPropagation();
          onPointerOver();
        }}
        onPointerOut={(e) => {
          e.stopPropagation();
          onPointerOut();
        }}
      >
        <boxGeometry args={[0.65, targetHeight, 0.65]} />
        <meshStandardMaterial
          color={isHovered ? '#ffffff' : color}
          emissive={color}
          emissiveIntensity={isHovered ? 0.8 : 0.35}
          roughness={0.2}
          metalness={0.7}
        />
      </mesh>

      {/* Ground Base Plate */}
      <mesh position={[0, -0.05, 0]}>
        <cylinderGeometry args={[0.5, 0.55, 0.08, 16]} />
        <meshStandardMaterial color="#334155" metalness={0.8} roughness={0.3} />
      </mesh>

      {/* 3D Code Text under pillar */}
      <Text
        position={[0, -0.3, 0.5]}
        fontSize={0.25}
        color={isHovered ? '#ffffff' : '#94a3b8'}
        anchorX="center"
        anchorY="middle"
      >
        {code}
      </Text>

      {/* Percentage indicator above pillar */}
      <Text
        position={[0, targetHeight + 0.3, 0]}
        fontSize={0.22}
        color={isHovered ? '#38bdf8' : '#cbd5e1'}
        anchorX="center"
        anchorY="middle"
        font={undefined}
      >
        {`${Math.round(rate)}%`}
      </Text>
    </group>
  );
}

function Scene({ stats }: { stats: ProjectStatItem[] }) {
  const groupRef = useRef<THREE.Group>(null);
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  useFrame((state) => {
    if (!groupRef.current) return;
    const targetRot = state.pointer.x * 0.3;
    groupRef.current.rotation.y = THREE.MathUtils.lerp(
      groupRef.current.rotation.y,
      targetRot,
      0.05
    );
  });

  const spacing = 1.05;
  const startX = -((stats.length - 1) * spacing) / 2;

  return (
    <group ref={groupRef} position={[0, -0.6, 0]}>
      {stats.map((stat, idx) => (
        <StatBar
          key={stat.key}
          position={[startX + idx * spacing, 0, 0]}
          rate={stat.rate}
          label={stat.name}
          code={stat.key}
          color={stat.color}
          isHovered={hoveredIdx === idx}
          onPointerOver={() => setHoveredIdx(idx)}
          onPointerOut={() => setHoveredIdx(null)}
        />
      ))}
    </group>
  );
}

export default function Stats3DCanvas({ stats }: Stats3DCanvasProps) {
  const prefersReducedMotion = useReducedMotion();

  if (prefersReducedMotion || !stats || stats.length === 0) {
    return (
      <div className="w-full h-48 flex items-end justify-between px-6 pt-4 pb-2">
        {stats.map((item) => (
          <div key={item.key} className="flex flex-col items-center gap-2 flex-1">
            <span className="text-xs font-bold text-foreground">{item.rate}%</span>
            <div className="w-8 bg-slate-200 dark:bg-slate-800 rounded-t-lg relative h-28 overflow-hidden">
              <div
                className="w-full absolute bottom-0 rounded-t-lg transition-all duration-500"
                style={{ height: `${item.rate}%`, backgroundColor: item.color }}
              />
            </div>
            <span className="text-xs font-mono text-muted-foreground">{item.key}</span>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="w-full h-56 relative">
      <Canvas
        camera={{ position: [0, 1.2, 4.2], fov: 45 }}
        gl={{ antialias: true, alpha: true }}
      >
        <ambientLight intensity={0.7} />
        <pointLight position={[5, 10, 5]} intensity={1.5} />
        <pointLight position={[-5, -5, -2]} intensity={0.5} color="#818cf8" />
        <Scene stats={stats} />
      </Canvas>
    </div>
  );
}
