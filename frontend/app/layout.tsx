import type { Metadata } from 'next';
import { Inter, JetBrains_Mono } from 'next/font/google';
import './globals.css';
import { ThemeProvider } from '@/components/theme-provider';
import { AuthProvider } from '@/context/AuthContext';
import { Navbar } from '@/components/layout/Navbar';
import { DynamicParticleBackground } from '@/components/3d/DynamicScenes';
import { Toaster } from 'sonner';
import { MOCK_USER } from '@/lib/mock-data';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
});

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
          <ThemeProvider
            attribute="class"
            defaultTheme="dark"
            enableSystem={false}
            disableTransitionOnChange={false}
          >
            {/* Subtle Ambient 3D Particle Field */}
            <DynamicParticleBackground />

            {/* Primary Navigation Bar */}
            <Navbar user={MOCK_USER} />

            {/* Page Container */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
              {children}
            </main>

            {/* Rich Toast Notifications */}
            <Toaster
              position="top-right"
              richColors
              toastOptions={{
                className: 'glass-panel text-foreground border-border',
              }}
            />
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
