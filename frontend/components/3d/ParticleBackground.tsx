'use client';

import React, { useMemo, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useReducedMotion } from '@/lib/hooks/useReducedMotion';

function ParticleField({ count = 80 }: { count?: number }) {
  const pointsRef = useRef<THREE.Points>(null);

  const [positions, colors] = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const col = new Float32Array(count * 3);

    for (let i = 0; i < count; i++) {
      // Spread across wide 3D space
      pos[i * 3] = (Math.random() - 0.5) * 20;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 20;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 10;

      // Color variation (indigo, violet, cyan)
      const colorType = Math.random();
      if (colorType > 0.6) {
        // Indigo
        col[i * 3] = 0.39;
        col[i * 3 + 1] = 0.4;
        col[i * 3 + 2] = 0.95;
      } else if (colorType > 0.3) {
        // Violet
        col[i * 3] = 0.66;
        col[i * 3 + 1] = 0.33;
        col[i * 3 + 2] = 0.98;
      } else {
        // Cyan
        col[i * 3] = 0.22;
        col[i * 3 + 1] = 0.74;
        col[i * 3 + 2] = 0.97;
      }
    }
    return [pos, col];
  }, [count]);

  useFrame((state) => {
    if (!pointsRef.current) return;
    pointsRef.current.rotation.y = state.clock.elapsedTime * 0.02;
    pointsRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.015) * 0.1;
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={positions.length / 3}
          array={positions}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-color"
          count={colors.length / 3}
          array={colors}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.08}
        vertexColors
        transparent
        opacity={0.65}
        sizeAttenuation
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

export default function ParticleBackground() {
  const prefersReducedMotion = useReducedMotion();

  if (prefersReducedMotion || process.env.NEXT_PUBLIC_ENABLE_PARTICLES === 'false') {
    return null;
  }

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden opacity-30 dark:opacity-40">
      <Canvas
        dpr={1}
        style={{ pointerEvents: 'none' }}
        camera={{ position: [0, 0, 8], fov: 60 }}
        gl={{ antialias: false, alpha: true, powerPreference: 'low-power' }}
      >
        <ParticleField count={60} />
      </Canvas>
    </div>
  );
}
