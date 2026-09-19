'use client';

/**
 * Human3DAvatar — Snap-memoji-style 3D cartoon human persona.
 * Built entirely from Three.js primitives (no GLTF assets needed).
 * Styles: skin tone, hair style/color, shirt color, eye color, accessory.
 */

import React, { useRef, useState, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float } from '@react-three/drei';
import * as THREE from 'three';

export interface HumanAvatarStyle {
  id: string;
  label: string;
  skinTone: string;
  hairColor: string;
  hairStyle: 'short' | 'curly' | 'bun' | 'buzz' | 'long' | 'mohawk';
  shirtColor: string;
  eyeColor: string;
  accessory: 'none' | 'glasses' | 'headphones' | 'beanie';
}

export const AVATAR_3D_OPTIONS: HumanAvatarStyle[] = [
  {
    id: 'ace',
    label: 'Ace',
    skinTone: '#f2c99a',
    hairColor: '#2b1d16',
    hairStyle: 'short',
    shirtColor: '#6366f1',
    eyeColor: '#3b82f6',
    accessory: 'none',
  },
  {
    id: 'nova',
    label: 'Nova',
    skinTone: '#8d5a3a',
    hairColor: '#120d0a',
    hairStyle: 'curly',
    shirtColor: '#ec4899',
    eyeColor: '#10b981',
    accessory: 'glasses',
  },
  {
    id: 'pixel',
    label: 'Pixel',
    skinTone: '#ffdbac',
    hairColor: '#f59e0b',
    hairStyle: 'mohawk',
    shirtColor: '#10b981',
    eyeColor: '#8b5cf6',
    accessory: 'headphones',
  },
  {
    id: 'zen',
    label: 'Zen',
    skinTone: '#c68b59',
    hairColor: '#1f2937',
    hairStyle: 'bun',
    shirtColor: '#0ea5e9',
    eyeColor: '#78350f',
    accessory: 'none',
  },
  {
    id: 'flash',
    label: 'Flash',
    skinTone: '#f2c99a',
    hairColor: '#ef4444',
    hairStyle: 'buzz',
    shirtColor: '#f59e0b',
    eyeColor: '#ef4444',
    accessory: 'none',
  },
  {
    id: 'luna',
    label: 'Luna',
    skinTone: '#eab89a',
    hairColor: '#a855f7',
    hairStyle: 'long',
    shirtColor: '#8b5cf6',
    eyeColor: '#06b6d4',
    accessory: 'beanie',
  },
];

/* ─── Head group (face, eyes, hair) ─── */
function Head({ style, blink, hovered }: { style: HumanAvatarStyle; blink: boolean; hovered: boolean }) {
  const headRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (!headRef.current) return;
    // Gentle head tilt + look toward pointer (Snap-like liveliness)
    const t = state.clock.elapsedTime;
    headRef.current.rotation.y = state.pointer.x * 0.35 + Math.sin(t * 0.6) * 0.06;
    headRef.current.rotation.x = -state.pointer.y * 0.2 + Math.sin(t * 0.8) * 0.03;
  });

  const skin = hovered ? '#fff7ed' : style.skinTone;

  return (
    <group ref={headRef} position={[0, 0.55, 0]}>
      {/* Skull */}
      <mesh scale={[1, 1.08, 0.95]}>
        <sphereGeometry args={[0.55, 48, 48]} />
        <meshStandardMaterial color={skin} roughness={0.55} metalness={0.05} />
      </mesh>
      {/* Jaw / chin */}
      <mesh position={[0, -0.28, 0.08]} scale={[0.82, 0.65, 0.8]}>
        <sphereGeometry args={[0.5, 32, 32]} />
        <meshStandardMaterial color={skin} roughness={0.55} />
      </mesh>
      {/* Nose */}
      <mesh position={[0, -0.06, 0.5]}>
        <sphereGeometry args={[0.09, 16, 16]} />
        <meshStandardMaterial color={skin} roughness={0.5} />
      </mesh>

      {/* Eyes */}
      {[-0.2, 0.2].map((x, i) => (
        <group key={i} position={[x, 0.08, 0.44]}>
          {/* White */}
          <mesh scale={[1, blink ? 0.1 : 1, 0.6]}>
            <sphereGeometry args={[0.115, 20, 20]} />
            <meshStandardMaterial color="#ffffff" roughness={0.15} />
          </mesh>
          {/* Iris */}
          <mesh position={[0, 0, blink ? 0 : 0.075]} scale={[1, blink ? 0.1 : 1, 0.5]}>
            <sphereGeometry args={[0.06, 16, 16]} />
            <meshStandardMaterial
              color={style.eyeColor}
              emissive={style.eyeColor}
              emissiveIntensity={0.35}
              roughness={0.1}
            />
          </mesh>
          {/* Pupil */}
          <mesh position={[0, 0, blink ? 0 : 0.105]} scale={[1, blink ? 0.1 : 1, 0.5]}>
            <sphereGeometry args={[0.028, 12, 12]} />
            <meshStandardMaterial color="#111827" roughness={0.1} />
          </mesh>
        </group>
      ))}

      {/* Smile */}
      <mesh position={[0, -0.24, 0.42]} rotation={[0.15, 0, 0]}>
        <torusGeometry args={[0.14, 0.022, 10, 24, Math.PI]} />
        <meshStandardMaterial color="#9d4b4b" roughness={0.4} />
      </mesh>
      {/* Blush */}
      {[-0.34, 0.34].map((x, i) => (
        <mesh key={i} position={[x, -0.12, 0.36]} scale={[1, 0.6, 0.4]}>
          <sphereGeometry args={[0.07, 12, 12]} />
          <meshStandardMaterial color="#f87171" transparent opacity={0.35} roughness={0.6} />
        </mesh>
      ))}

      {/* Ears */}
      {[-0.52, 0.52].map((x, i) => (
        <mesh key={i} position={[x, -0.02, 0.05]} scale={[0.5, 1, 0.6]}>
          <sphereGeometry args={[0.12, 12, 12]} />
          <meshStandardMaterial color={skin} roughness={0.55} />
        </mesh>
      ))}

      {/* Hair styles */}
      {style.hairStyle === 'short' && (
        <mesh position={[0, 0.28, -0.02]} scale={[1.04, 0.9, 1.02]}>
          <sphereGeometry args={[0.56, 32, 32, 0, Math.PI * 2, 0, Math.PI / 2]} />
          <meshStandardMaterial color={style.hairColor} roughness={0.8} />
        </mesh>
      )}
      {style.hairStyle === 'curly' &&
        [
          [0, 0.35, -0.05],
          [-0.3, 0.28, 0.15],
          [0.3, 0.28, 0.15],
          [-0.38, 0.2, -0.2],
          [0.38, 0.2, -0.2],
          [-0.15, 0.4, -0.3],
          [0.15, 0.4, -0.3],
          [0, 0.3, 0.35],
        ].map((p, i) => (
          <mesh key={i} position={p as [number, number, number]}>
            <sphereGeometry args={[0.19, 12, 12]} />
            <meshStandardMaterial color={style.hairColor} roughness={0.9} />
          </mesh>
        ))}
      {style.hairStyle === 'bun' && (
        <group>
          <mesh position={[0, 0.28, -0.02]} scale={[1.04, 0.9, 1.02]}>
            <sphereGeometry args={[0.56, 32, 32, 0, Math.PI * 2, 0, Math.PI / 2]} />
            <meshStandardMaterial color={style.hairColor} roughness={0.8} />
          </mesh>
          <mesh position={[0, 0.62, -0.18]}>
            <sphereGeometry args={[0.2, 16, 16]} />
            <meshStandardMaterial color={style.hairColor} roughness={0.8} />
          </mesh>
        </group>
      )}
      {style.hairStyle === 'buzz' && (
        <mesh position={[0, 0.26, -0.02]} scale={[1.02, 0.95, 1.0]}>
          <sphereGeometry args={[0.55, 32, 32, 0, Math.PI * 2, 0, Math.PI / 2.1]} />
          <meshStandardMaterial color={style.hairColor} roughness={0.85} />
        </mesh>
      )}
      {style.hairStyle === 'long' && (
        <group>
          <mesh position={[0, 0.26, -0.02]} scale={[1.05, 0.95, 1.04]}>
            <sphereGeometry args={[0.56, 32, 32, 0, Math.PI * 2, 0, Math.PI / 1.9]} />
            <meshStandardMaterial color={style.hairColor} roughness={0.75} />
          </mesh>
          {/* Side locks falling past the jaw */}
          {[-0.5, 0.5].map((x, i) => (
            <mesh key={i} position={[x, -0.28, 0.02]} scale={[0.42, 1.5, 0.7]}>
              <capsuleGeometry args={[0.16, 0.5, 6, 14]} />
              <meshStandardMaterial color={style.hairColor} roughness={0.75} />
            </mesh>
          ))}
        </group>
      )}
      {style.hairStyle === 'mohawk' &&
        Array.from({ length: 7 }).map((_, i) => {
          const z = -0.3 + i * 0.1;
          return (
            <mesh key={i} position={[0, 0.52, z]} scale={[0.35, 1.1, 0.55]}>
              <coneGeometry args={[0.14, 0.35, 8]} />
              <meshStandardMaterial color={style.hairColor} roughness={0.7} />
            </mesh>
          );
        })}

      {/* Accessories */}
      {style.accessory === 'glasses' && (
        <group position={[0, 0.08, 0.5]}>
          {[-0.2, 0.2].map((x, i) => (
            <mesh key={i} position={[x, 0, 0]} rotation={[Math.PI / 2, 0, 0]}>
              <torusGeometry args={[0.13, 0.02, 8, 24]} />
              <meshStandardMaterial color="#1f2937" metalness={0.6} roughness={0.3} />
            </mesh>
          ))}
          <mesh position={[0, 0, 0]}>
            <boxGeometry args={[0.14, 0.012, 0.012]} />
            <meshStandardMaterial color="#1f2937" metalness={0.6} />
          </mesh>
        </group>
      )}
      {style.accessory === 'headphones' && (
        <group>
          <mesh position={[0, 0.3, 0]} rotation={[0.35, 0, 0]}>
            <torusGeometry args={[0.58, 0.05, 10, 32, Math.PI]} />
            <meshStandardMaterial color="#111827" roughness={0.4} />
          </mesh>
          {[-0.58, 0.58].map((x, i) => (
            <mesh key={i} position={[x, -0.02, 0.05]} scale={[0.7, 1, 0.5]}>
              <cylinderGeometry args={[0.14, 0.14, 0.16, 16]} />
              <meshStandardMaterial color="#111827" roughness={0.35} />
            </mesh>
          ))}
        </group>
      )}
      {style.accessory === 'beanie' && (
        <group>
          <mesh position={[0, 0.3, -0.02]} scale={[1.06, 0.85, 1.04]}>
            <sphereGeometry args={[0.56, 32, 32, 0, Math.PI * 2, 0, Math.PI / 2.2]} />
            <meshStandardMaterial color={style.shirtColor} roughness={0.9} />
          </mesh>
          <mesh position={[0, 0.12, 0]} scale={[1.06, 0.35, 1.05]}>
            <torusGeometry args={[0.53, 0.06, 10, 32]} />
            <meshStandardMaterial color="#f8fafc" roughness={0.9} />
          </mesh>
        </group>
      )}
    </group>
  );
}

/* ─── Body (shoulders + shirt) ─── */
function Body({ style, hovered }: { style: HumanAvatarStyle; hovered: boolean }) {
  return (
    <group position={[0, -0.72, 0]}>
      {/* Torso */}
      <mesh scale={[1.15, 0.8, 0.85]}>
        <sphereGeometry args={[0.62, 32, 32]} />
        <meshStandardMaterial
          color={hovered ? '#ffffff' : style.shirtColor}
          roughness={0.7}
        />
      </mesh>
      {/* Collar stripe accent */}
      <mesh position={[0, 0.28, 0.12]} scale={[0.8, 0.16, 0.55]}>
        <sphereGeometry args={[0.5, 20, 20]} />
        <meshStandardMaterial color="#ffffff" transparent opacity={0.25} roughness={0.6} />
      </mesh>
    </group>
  );
}

/* ─── Full persona scene ─── */
function Persona({ style, hovered }: { style: HumanAvatarStyle; hovered: boolean }) {
  const [blink, setBlink] = useState(false);

  useEffect(() => {
    let alive = true;
    const loop = () => {
      if (!alive) return;
      const wait = 2200 + Math.random() * 3200;
      setTimeout(() => {
        if (!alive) return;
        setBlink(true);
        setTimeout(() => {
          if (!alive) return;
          setBlink(false);
          loop();
        }, 140);
      }, wait);
    };
    loop();
    return () => {
      alive = false;
    };
  }, []);

  return (
    <Float speed={1.4} rotationIntensity={0.12} floatIntensity={0.35}>
      <group position={[0, -0.05, 0]}>
        <Head style={style} blink={blink} hovered={hovered} />
        <Body style={style} hovered={hovered} />
      </group>
    </Float>
  );
}

/* ─── Static fallback (SSR / no WebGL) ─── */
function StaticFallback({ style }: { style: HumanAvatarStyle }) {
  return (
    <div
      className="w-full h-full rounded-full flex items-center justify-center"
      style={{
        background: `linear-gradient(145deg, ${style.skinTone}, ${style.shirtColor})`,
        boxShadow: `0 4px 16px ${style.shirtColor}55`,
      }}
      aria-hidden
    >
      <span className="text-white font-bold" style={{ fontSize: '40%' }}>
        {style.label[0]}
      </span>
    </div>
  );
}

/* ─── Public component ─── */
interface Human3DAvatarProps {
  style: HumanAvatarStyle;
  className?: string;
}

export default function Human3DAvatar({ style, className = 'w-16 h-16' }: Human3DAvatarProps) {
  const [mounted, setMounted] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [webglOk, setWebglOk] = useState(true);

  useEffect(() => {
    setMounted(true);
    try {
      const c = document.createElement('canvas');
      setWebglOk(!!(c.getContext('webgl') || c.getContext('experimental-webgl')));
    } catch {
      setWebglOk(false);
    }
  }, []);

  return (
    <div
      className={`${className} rounded-full overflow-hidden shrink-0`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      aria-label={`${style.label} 3D human avatar`}
    >
      {!mounted || !webglOk ? (
        <StaticFallback style={style} />
      ) : (
        <Canvas
          camera={{ position: [0, 0.1, 2.9], fov: 42 }}
          gl={{ antialias: true, alpha: true, powerPreference: 'low-power' }}
          style={{ width: '100%', height: '100%' }}
        >
          <ambientLight intensity={0.85} />
          <directionalLight position={[3, 5, 4]} intensity={1.4} />
          <pointLight position={[-3, 2, 3]} intensity={0.5} color={style.shirtColor} />
          <Persona style={style} hovered={hovered} />
        </Canvas>
      )}
    </div>
  );
}

/* ─── Picker card (for register/settings) ─── */
export function HumanAvatarPickerCard({
  style,
  selected,
  onClick,
}: {
  style: HumanAvatarStyle;
  selected: boolean;
  onClick: () => void;
}) {
  const [hovered, setHovered] = useState(false);
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  return (
    <button
      type="button"
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      aria-label={`Select avatar ${style.label}`}
      className={`relative flex flex-col items-center rounded-2xl overflow-hidden border-2 transition-all duration-200 cursor-pointer
        ${selected
          ? 'border-indigo-500 ring-2 ring-indigo-500/50 scale-105 shadow-xl shadow-indigo-500/30'
          : hovered
            ? 'border-slate-400 dark:border-slate-600 shadow-md'
            : 'border-slate-200 dark:border-slate-800'
        }`}
    >
      <div
        className="absolute inset-0"
        style={{ background: `linear-gradient(160deg, ${style.shirtColor}22, transparent 70%)` }}
      />
      <div className="relative w-full" style={{ height: '96px' }}>
        {mounted ? (
          <PickerAvatarViewport style={style} active={hovered || selected} />
        ) : (
          <StaticFallback style={style} />
        )}
      </div>
      <span className={`relative z-10 text-[11px] font-semibold pb-1.5 pt-0.5 ${selected ? 'text-indigo-500' : 'text-muted-foreground'}`}>
        {style.label}
      </span>
      {selected && (
        <span className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-indigo-500 flex items-center justify-center">
          <svg viewBox="0 0 10 10" className="w-2.5 h-2.5 fill-none stroke-white stroke-2">
            <polyline points="1.5,5 4,7.5 8.5,2.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </span>
      )}
    </button>
  );
}

/* ─── Shared WebGL-context management ───
 * Browsers cap live WebGL contexts (~8-16). Rendering every picker card as its
 * own Canvas silently loses contexts past the cap (blank tiles). We instead
 * snapshot each persona ONCE (serialised through a queue so only one context
 * exists at a time), cache it as a data-URL image, and only mount a live
 * animated canvas for the hovered/selected card. */

/* Serialise BOTH context creation and capture: a card may only mount its
 * <Canvas> once it holds a slot, so at most MAX_SNAPSHOT_SLOTS WebGL contexts
 * exist at any moment (browsers silently drop contexts past ~8-16). */
const MAX_SNAPSHOT_SLOTS = 1;
let slotsUsed = 0;
const slotWaiters: Array<() => void> = [];

function acquireSnapshotSlot(cb: () => void) {
  if (slotsUsed < MAX_SNAPSHOT_SLOTS) {
    slotsUsed += 1;
    cb();
    return;
  }
  slotWaiters.push(cb);
}

function releaseSnapshotSlot() {
  const next = slotWaiters.shift();
  if (next) {
    // Hand the slot straight to the next waiter (count stays the same).
    setTimeout(next, 60); // small beat so the browser reclaims the old context
  } else {
    slotsUsed -= 1;
  }
}

/** Renders one frame of the persona and hands back a PNG data-URL. */
function SnapshotRenderer({
  style,
  onDone,
}: {
  style: HumanAvatarStyle;
  onDone: (url: string) => void;
}) {
  return (
    <Canvas
      camera={{ position: [0, 0.1, 2.9], fov: 42 }}
      gl={{ antialias: true, alpha: true, preserveDrawingBuffer: true }}
      style={{ width: '100%', height: '100%' }}
      onCreated={({ gl }) => {
        // Wait two frames so the scene has definitely rendered.
        requestAnimationFrame(() =>
          requestAnimationFrame(() => {
            let url = '';
            try {
              url = gl.domElement.toDataURL('image/png');
            } catch {
              url = '';
            }
            setTimeout(() => onDone(url), 0);
          })
        );
      }}
    >
      <ambientLight intensity={0.85} />
      <directionalLight position={[3, 5, 4]} intensity={1.4} />
      <pointLight position={[-3, 2, 3]} intensity={0.5} color={style.shirtColor} />
      <Persona style={style} hovered={false} />
    </Canvas>
  );
}

/* Canvas wrapper used only inside the picker card */
function CanvasDemo({ style, hovered }: { style: HumanAvatarStyle; hovered: boolean }) {
  return (
    <Canvas
      camera={{ position: [0, 0.1, 2.9], fov: 42 }}
      gl={{ antialias: true, alpha: true, powerPreference: 'low-power' }}
      style={{ width: '100%', height: '100%' }}
    >
      <ambientLight intensity={0.85} />
      <directionalLight position={[3, 5, 4]} intensity={1.4} />
      <pointLight position={[-3, 2, 3]} intensity={0.5} color={style.shirtColor} />
      <Persona style={style} hovered={hovered} />
    </Canvas>
  );
}

/**
 * Picker-card avatar viewport: shows a cached 3D snapshot normally and swaps
 * to a live animated canvas while hovered/selected (so at most ~2 live WebGL
 * contexts exist at any moment).
 */
function PickerAvatarViewport({
  style,
  active,
}: {
  style: HumanAvatarStyle;
  active: boolean;
}) {
  const [snapshot, setSnapshot] = useState<string | null>(null);
  const [needsSnapshot, setNeedsSnapshot] = useState(false);
  const [hasSlot, setHasSlot] = useState(false);
  const retries = useRef(0);

  useEffect(() => {
    if (snapshot || needsSnapshot) return;
    setNeedsSnapshot(true);
  }, [snapshot, needsSnapshot]);

  const slotHeld = useRef(false);

  // Only mount the WebGL canvas once this card holds a snapshot slot.
  useEffect(() => {
    if (!needsSnapshot || snapshot || hasSlot) return;
    let cancelled = false;
    acquireSnapshotSlot(() => {
      if (cancelled) {
        releaseSnapshotSlot();
        return;
      }
      slotHeld.current = true;
      setHasSlot(true);
    });
    return () => {
      cancelled = true;
      // If we unmount mid-snapshot (e.g. card got hovered), hand back the slot.
      if (slotHeld.current) {
        slotHeld.current = false;
        releaseSnapshotSlot();
      }
    };
  }, [needsSnapshot, snapshot, hasSlot]);

  const handleSnapshotDone = (url: string) => {
    if (slotHeld.current) {
      slotHeld.current = false;
      releaseSnapshotSlot();
    }
    setHasSlot(false);
    if (url) {
      setSnapshot(url);
      setNeedsSnapshot(false);
    } else if (retries.current < 3) {
      retries.current += 1; // context was likely dropped — try again
      setNeedsSnapshot(false);
      setTimeout(() => setNeedsSnapshot(true), 120);
    } else {
      setNeedsSnapshot(false); // give up, keep static fallback
    }
  };

  if (active) {
    return <CanvasDemo style={style} hovered />;
  }
  if (needsSnapshot && !snapshot && hasSlot) {
    return <SnapshotRenderer style={style} onDone={handleSnapshotDone} />;
  }
  if (snapshot) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={snapshot}
        alt=""
        aria-hidden
        className="w-full h-full object-contain"
        draggable={false}
      />
    );
  }
  return <StaticFallback style={style} />;
}
