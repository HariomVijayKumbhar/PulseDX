/** Avatars users can pick from at registration — Notion-style illustrated portraits (DiceBear). */
export const AVATAR_OPTIONS = [
  { id: 'nova', label: 'Nova', url: 'https://api.dicebear.com/9.x/notionists/svg?seed=Nova&backgroundColor=d6e4ff' },
  { id: 'orbit', label: 'Orbit', url: 'https://api.dicebear.com/9.x/notionists/svg?seed=Orbit&backgroundColor=ffe8cc' },
  { id: 'pixel', label: 'Pixel', url: 'https://api.dicebear.com/9.x/notionists/svg?seed=Pixel&backgroundColor=ddf4e4' },
  { id: 'zen', label: 'Zen', url: 'https://api.dicebear.com/9.x/notionists/svg?seed=Zen&backgroundColor=f1d4ff' },
  { id: 'flash', label: 'Flash', url: 'https://api.dicebear.com/9.x/notionists/svg?seed=Flash&backgroundColor=ffdeeb' },
  { id: 'luna', label: 'Luna', url: 'https://api.dicebear.com/9.x/notionists/svg?seed=Luna&backgroundColor=d3f0f0' },
] as const;

export const DEFAULT_AVATAR = AVATAR_OPTIONS[0].url;

/**
 * Resolve an avatar URL / seed into a 3D avatar config (Avatar3DCard's options).
 * The stored avatar is a DiceBear URL containing the seed name, which matches
 * the 3D persona labels (Nova, Orbit, ...). Falls back to 'Nova'.
 */
export function resolve3DAvatar(avatarUrl?: string | null) {
  const { AVATAR_3D_OPTIONS } = require('@/components/3d/Avatar3DCard') as typeof import('@/components/3d/Avatar3DCard');
  if (!avatarUrl) return AVATAR_3D_OPTIONS[0];
  const match = AVATAR_3D_OPTIONS.find((a) =>
    avatarUrl.toLowerCase().includes(`seed=${a.label.toLowerCase()}`)
  );
  return match ?? AVATAR_3D_OPTIONS[0];
}
