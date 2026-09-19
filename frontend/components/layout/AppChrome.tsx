'use client';

import { usePathname } from 'next/navigation';
import { Navbar } from './Navbar';
import { DynamicParticleBackground } from '@/components/3d/DynamicScenes';

const AUTH_ROUTES = ['/login', '/register'];

/**
 * AppChrome — renders the global Navbar + ambient 3D particle background,
 * but hides them on auth routes (/login, /register) so those pages are
 * full-screen, distraction-free experiences.
 */
export function AppChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAuthPage = AUTH_ROUTES.some((r) => pathname === r || pathname.startsWith(r + '/'));

  if (isAuthPage) {
    // Auth pages: no navbar, no particle field — clean full-bleed layout
    return <>{children}</>;
  }

  return (
    <>
      {/* Subtle Ambient 3D Particle Field */}
      <DynamicParticleBackground />

      {/* Primary Navigation Bar — pulls real user from Supabase session */}
      <Navbar />

      {children}
    </>
  );
}
