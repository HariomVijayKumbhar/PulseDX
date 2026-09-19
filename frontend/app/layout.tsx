import type { Metadata, Viewport } from 'next';
import { Inter, JetBrains_Mono } from 'next/font/google';
import './globals.css';
import { ThemeProvider } from '@/components/theme-provider';
import { AuthProvider } from '@/context/AuthContext';
import { AuthGate } from '@/components/AuthGate';
import { AppChrome } from '@/components/layout/AppChrome';
import { PageContainer } from '@/components/layout/PageContainer';
import { Toaster } from 'sonner';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
});

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  viewportFit: 'cover',
  themeColor: [
    { media: '(prefers-color-scheme: dark)', color: '#030712' },
    { media: '(prefers-color-scheme: light)', color: '#f8fafc' },
  ],
};

export const metadata: Metadata = {
  title: 'PulseDX — Modern 3D Developer Productivity Dashboard',
  description:
    'High-performance, 3D-accented developer productivity dashboard built with Next.js 14, Tailwind CSS, TypeScript, Framer Motion, and React Three Fiber.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${inter.variable} ${jetbrainsMono.variable} font-sans min-h-screen bg-background text-foreground antialiased selection:bg-indigo-500 selection:text-white transition-colors duration-300 relative overflow-x-hidden`}
      >
        <AuthProvider>
          <AuthGate>
          <ThemeProvider
            attribute="class"
            defaultTheme="dark"
            enableSystem={false}
            disableTransitionOnChange={false}
          >
            {/* Navbar + particle field — hidden on auth routes (/login, /register) */}
            <AppChrome>
              {/* Page Container — auth pages get full-bleed, others get max-width */}
              <PageContainer>
                {children}
              </PageContainer>
            </AppChrome>

            {/* Rich Toast Notifications */}
            <Toaster
              position="top-right"
              richColors
              toastOptions={{
                className: 'glass-panel text-foreground border-border',
              }}
            />
          </ThemeProvider>
          </AuthGate>
        </AuthProvider>
      </body>
    </html>
  );
}
