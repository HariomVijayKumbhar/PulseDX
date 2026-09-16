'use client';

import { usePathname } from 'next/navigation';

const AUTH_ROUTES = ['/login', '/register'];

export function PageContainer({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAuthPage = AUTH_ROUTES.some((r) => pathname === r || pathname.startsWith(r + '/'));

  if (isAuthPage) {
    // Auth pages get full-bleed treatment — no max-width container or padding
    return <>{children}</>;
  }

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 sm:pt-6 pb-16 sm:pb-20 pb-safe w-full overflow-x-hidden">
      {children}
    </main>
  );
}
