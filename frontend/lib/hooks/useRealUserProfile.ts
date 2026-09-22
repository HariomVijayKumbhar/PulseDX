'use client';

/**
 * useRealUserProfile — derives the signed-in user's profile purely from the
 * live Supabase session. NO mock/fake data anywhere.
 *
 * Priority for name/email/avatar:
 *   1. Supabase user_metadata (set at registration: full_name, avatar_url)
 *   2. Email-derived fallbacks (e.g. "hariom.k" from hariom.k@gmail.com)
 *
 * The chosen 3D human avatar style is persisted per-user in localStorage so
 * returning users see their own persona.
 */

import { useMemo, useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { AVATAR_3D_OPTIONS as HUMAN_AVATAR_OPTIONS, HumanAvatarStyle } from '@/components/3d/Human3DAvatar';

export interface RealUserProfile {
  /** Supabase auth user id (null while signed out) */
  id: string | null;
  name: string;
  username: string;
  email: string;
  avatarStyle: HumanAvatarStyle;
}

const AVATAR_STORAGE_PREFIX = 'pulsedx:avatar:';

function titleCaseFromEmail(email: string): string {
  const local = email.split('@')[0] || 'user';
  const cleaned = local.replace(/[._\-+]+/g, ' ').trim();
  return cleaned
    .split(' ')
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ') || 'User';
}

function usernameFromEmail(email: string): string {
  return (email.split('@')[0] || 'user').toLowerCase().replace(/[^a-z0-9._-]/g, '');
}

/**
 * Deterministically map an email/id to one of the six 3D human personas,
 * unless the user picked one explicitly (stored in localStorage).
 */
function resolveAvatarStyle(userId: string | null, email: string, avatarUrl?: string): HumanAvatarStyle {
  // 0. Registration-time choice stored as `human3d://<styleId>` in user metadata
  if (avatarUrl && avatarUrl.startsWith('human3d://')) {
    const styleId = avatarUrl.slice('human3d://'.length);
    const found = HUMAN_AVATAR_OPTIONS.find((a) => a.id === styleId);
    if (found) return found;
  }

  // 1. Explicit user choice
  try {
    if (userId) {
      const stored = typeof window !== 'undefined' ? window.localStorage.getItem(AVATAR_STORAGE_PREFIX + userId) : null;
      if (stored) {
        const found = HUMAN_AVATAR_OPTIONS.find((a) => a.id === stored);
        if (found) return found;
      }
    }
  } catch {
    // localStorage unavailable — fall through to deterministic mapping
  }

  // 2. Deterministic from identity hash
  const seed = (userId || email || 'anon').split('').reduce((acc, ch) => acc + ch.charCodeAt(0), 0);
  return HUMAN_AVATAR_OPTIONS[seed % HUMAN_AVATAR_OPTIONS.length];
}

/** Persist the user's avatar choice (called by the picker UI) */
export function saveAvatarChoice(userId: string, styleId: string) {
  try {
    window.localStorage.setItem(AVATAR_STORAGE_PREFIX + userId, styleId);
  } catch {
    // ignore storage errors
  }
}

export function useRealUserProfile(): RealUserProfile {
  const { user, isLoading } = useAuth();

  // Force a re-render once mounted so localStorage reads are client-safe
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  return useMemo(() => {
    const email = user?.email || '';
    const meta = (user?.user_metadata || {}) as Record<string, string>;

    const name =
      meta.full_name ||
      meta.name ||
      (email ? titleCaseFromEmail(email) : 'Signed Out');

    const id = user?.id || null;
    const avatarStyle = mounted
      ? resolveAvatarStyle(id, email, meta.avatar_url as string | undefined)
      : HUMAN_AVATAR_OPTIONS[0];

    return {
      id,
      name,
      username: meta.username || (email ? usernameFromEmail(email) : 'guest'),
      email: email || 'Not signed in',
      avatarStyle,
    };
  }, [user, mounted]);
}
