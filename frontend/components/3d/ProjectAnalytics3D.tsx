'use client';

import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { RoundedBox, Text } from '@react-three/drei';
import * as THREE from 'three';
import { useReducedMotion } from '@/lib/hooks/useReducedMotion';

export interface ProjectProgressDatum {
  label: string;
  value: number; // 0-100
  color: string;
}

function ProgressPillar({
  position,
  value,
  label,
  color,
}: {
  position: [number, number, number];
  value: number;
  label: string;
  color: string;
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  const height = (value / 100) * 2.4 + 0.25;

  useFrame(({ clock }) => {
    if (!meshRef.current) return;
    if (meshRef.current.scale.y < height) {
      meshRef.current.scale.y = THREE.MathUtils.lerp(meshRef.current.scale.y, height, 0.12);
      meshRef.current.position.y = meshRef.current.scale.y / 2;
    }
  });

  return (
    <group position={position}>
      <RoundedBox
        ref={meshRef as any}
        args={[0.55, 1, 0.55]}
        radius={0.08}
        smoothness={4}
        scale={[1, 0.01, 1]}
        position={[0, 0, 0]}
      >
        <meshStandardMaterial color={color} roughness={0.25} metalness={0.35} />
      </RoundedBox>
      <Text
        position={[0, height + 0.3, 0]}
        fontSize={0.28}
        color="#e2e8f0"
        anchorX="center"
        anchorY="middle"
      >
        {`${Math.round(value)}%`}
      </Text>
      <Text position={[0, -0.45, 0]} fontSize={0.18} color="#94a3b8" anchorX="center" anchorY="middle">
        {label}
      </Text>
    </group>
  );
}

/**
 * Per-project 3D analytics: completion / in-progress / backlog pillars.
 */
export default function ProjectAnalytics3D({ stats }: { stats: ProjectProgressDatum[] }) {
  const reducedMotion = useReducedMotion();

  return (
    <div className="w-full h-64 rounded-2xl overflow-hidden glass-panel">
      <Canvas camera={{ position: [0, 2.4, 5.2], fov: 45 }} dpr={[1, 1.5]}>
        <ambientLight intensity={0.7} />
        <directionalLight position={[3, 6, 4]} intensity={1.1} />
        <pointLight position={[-4, 2, -3]} intensity={0.4} color="#8b5cf6" />
        <group
          position={[-((stats.length - 1) * 0.9) / 2, 0, 0]}
          rotation={reducedMotion ? [0, 0, 0] : [0, 0.35, 0]}
        >
          {stats.map((s, i) => (
            <ProgressPillar
              key={s.label}
              position={[i * 0.9, 0, 0]}
              value={s.value}
              label={s.label}
              color={s.color}
            />
          ))}
        </group>
        {/* ground disc */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.02, 0]}>
          <circleGeometry args={[2.6, 48]} />
          <meshStandardMaterial color="#0f172a" roughness={0.9} transparent opacity={0.55} />
        </mesh>
      </Canvas>
    </div>
  );
}
