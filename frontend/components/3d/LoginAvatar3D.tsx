'use client';

/**
 * LoginAvatar3D — A large, cinematic 3D scene for the login page left panel.
 * Features: 6 orbiting avatar-shapes that revolve around a glowing central core,
 * with mouse parallax and pulsing lights.
 */

import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import {
  Float,
  MeshDistortMaterial,
  MeshWobbleMaterial,
  Sphere,
  Stars,
} from '@react-three/drei';
import * as THREE from 'three';

/* ── Central Core ── */
function Core() {
  const meshRef = useRef<THREE.Mesh>(null);
  const outerRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (!meshRef.current || !outerRef.current) return;
    meshRef.current.rotation.y += 0.008;
    meshRef.current.rotation.z += 0.004;
    outerRef.current.rotation.y -= 0.012;
    outerRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.5) * 0.3;
  });

  return (
    <group>
      {/* Outer wireframe cage */}
      <mesh ref={outerRef} scale={2.5}>
        <icosahedronGeometry args={[1, 1]} />
        <meshStandardMaterial
          wireframe
          color="#818cf8"
          emissive="#4f46e5"
          emissiveIntensity={0.8}
          transparent
          opacity={0.5}
        />
      </mesh>

      {/* Distorted glowing core */}
      <Sphere ref={meshRef} args={[1.05, 48, 48]}>
        <MeshDistortMaterial
          color="#6366f1"
          emissive="#3730a3"
          emissiveIntensity={0.7}
          distort={0.4}
          speed={2.5}
          roughness={0.05}
          metalness={0.95}
        />
      </Sphere>

      {/* Inner bright nucleus */}
      <Sphere args={[0.45, 24, 24]}>
        <meshStandardMaterial
          color="#a5b4fc"
          emissive="#818cf8"
          emissiveIntensity={2.5}
          roughness={0}
          metalness={1}
        />
      </Sphere>
    </group>
  );
}

/* ── Orbiting Avatar Orb ── */
interface OrbProps {
  radius: number;
  speed: number;
  phaseOffset: number;
  orbitTilt: number;
  color: string;
  emissive: string;
  size: number;
  shape: 'sphere' | 'octahedron' | 'torus' | 'tetra' | 'dodeca' | 'capsule';
}

function OrbitingOrb({ radius, speed, phaseOffset, orbitTilt, color, emissive, size, shape }: OrbProps) {
  const groupRef = useRef<THREE.Group>(null);
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (!groupRef.current || !meshRef.current) return;
    const t = state.clock.elapsedTime * speed + phaseOffset;
    groupRef.current.position.x = Math.cos(t) * radius;
    groupRef.current.position.y = Math.sin(t * 0.6) * radius * Math.sin(orbitTilt);
    groupRef.current.position.z = Math.sin(t) * radius * Math.cos(orbitTilt);
    meshRef.current.rotation.x += 0.02;
    meshRef.current.rotation.y += 0.03;
  });

  const mat = (
    <MeshWobbleMaterial
      color={color}
      emissive={emissive}
      emissiveIntensity={0.7}
      factor={0.3}
      speed={3}
      roughness={0.05}
      metalness={0.9}
    />
  );

  return (
    <group ref={groupRef}>
      <mesh ref={meshRef} scale={size}>
        {shape === 'sphere'     && <sphereGeometry      args={[1, 20, 20]} />}
        {shape === 'octahedron' && <octahedronGeometry  args={[1, 0]}      />}
        {shape === 'torus'      && <torusGeometry       args={[1, 0.4, 12, 40]} />}
        {shape === 'tetra'      && <tetrahedronGeometry args={[1, 0]}      />}
        {shape === 'dodeca'     && <dodecahedronGeometry args={[1, 0]}     />}
        {shape === 'capsule'    && <capsuleGeometry     args={[0.6, 0.8, 6, 16]} />}
        {mat}
      </mesh>
      {/* Glow halo around each orb */}
      <pointLight color={color} intensity={0.8} distance={2.5} decay={2} />
    </group>
  );
}

/* ── Orbit Trail Ring ── */
function OrbitRing({ radius, tilt }: { radius: number; tilt: number }) {
  return (
    <mesh rotation={[tilt, 0, 0]}>
      <torusGeometry args={[radius, 0.015, 8, 100]} />
      <meshStandardMaterial
        color="#818cf8"
        emissive="#4338ca"
        emissiveIntensity={0.4}
        transparent
        opacity={0.25}
      />
    </mesh>
  );
}

/* ── Full Scene ── */
function Scene() {
  const rootRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (!rootRef.current) return;
    // Gentle mouse parallax on the whole scene
    const targetX = state.pointer.x * 0.25;
    const targetY = state.pointer.y * 0.15;
    rootRef.current.rotation.y = THREE.MathUtils.lerp(rootRef.current.rotation.y, targetX, 0.04);
    rootRef.current.rotation.x = THREE.MathUtils.lerp(rootRef.current.rotation.x, -targetY, 0.04);
  });

  const orbs: OrbProps[] = [
    { radius: 2.4, speed: 0.5,  phaseOffset: 0,              orbitTilt: 0.3,  color: '#818cf8', emissive: '#4f46e5', size: 0.28, shape: 'sphere'     },
    { radius: 2.2, speed: 0.35, phaseOffset: Math.PI / 3,    orbitTilt: 0.9,  color: '#f472b6', emissive: '#db2777', size: 0.24, shape: 'octahedron'  },
    { radius: 2.6, speed: 0.45, phaseOffset: (2 * Math.PI)/3, orbitTilt: 1.2, color: '#34d399', emissive: '#059669', size: 0.22, shape: 'torus'       },
    { radius: 2.3, speed: 0.6,  phaseOffset: Math.PI,        orbitTilt: 0.5,  color: '#a78bfa', emissive: '#7c3aed', size: 0.26, shape: 'tetra'       },
    { radius: 2.5, speed: 0.38, phaseOffset: (4 * Math.PI)/3, orbitTilt: 1.5, color: '#fbbf24', emissive: '#d97706', size: 0.20, shape: 'dodeca'      },
    { radius: 2.1, speed: 0.55, phaseOffset: (5 * Math.PI)/3, orbitTilt: 0.7, color: '#38bdf8', emissive: '#0369a1', size: 0.25, shape: 'capsule'     },
  ];

  return (
    <group ref={rootRef}>
      {/* Starfield backdrop */}
      <Stars radius={20} depth={8} count={600} factor={2} saturation={0.5} fade speed={0.5} />

      {/* Orbit trail rings */}
      <OrbitRing radius={2.4} tilt={0.3} />
      <OrbitRing radius={2.25} tilt={0.9} />
      <OrbitRing radius={2.55} tilt={1.2} />

      {/* Glowing central core */}
      <Float speed={1.2} rotationIntensity={0.3} floatIntensity={0.2}>
        <Core />
      </Float>

      {/* Orbiting avatar-shapes */}
      {orbs.map((o, i) => (
        <OrbitingOrb key={i} {...o} />
      ))}
    </group>
  );
}

/* ── Exported Canvas ── */
export default function LoginAvatar3D() {
  return (
    <Canvas
      camera={{ position: [0, 0, 7], fov: 50 }}
      gl={{ antialias: true, alpha: true }}
      style={{ width: '100%', height: '100%' }}
    >
      <ambientLight intensity={0.3} />
      <pointLight position={[8, 8, 8]}  intensity={2}   color="#818cf8" />
      <pointLight position={[-8, -5, -5]} intensity={1.2} color="#c084fc" />
      <pointLight position={[0, -8, 4]} intensity={0.8}  color="#38bdf8" />
      <Scene />
    </Canvas>
  );
}
