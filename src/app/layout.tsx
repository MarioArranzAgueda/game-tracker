import type { Metadata, Viewport } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import Providers from './providers';
import { Sidebar } from './components/Sidebar';

const geist = Geist({ subsets: ['latin'], variable: '--font-geist-sans' });
const geistMono = Geist_Mono({ subsets: ['latin'], variable: '--font-geist-mono' });

export const metadata: Metadata = {
  title: 'GameTracker',
  description: 'Gestiona tu biblioteca de videojuegos',
  manifest: '/manifest.json',
  icons: { apple: '/icon-192x192.png' },
  appleWebApp: {
    capable: true,
    title: 'GameTracker',
    statusBarStyle: 'black-translucent',
  },
};

export const viewport: Viewport = {
  themeColor: '#0d0b14',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" style={{ colorScheme: 'dark' }}>
      <body
        className={`${geist.variable} ${geistMono.variable}`}
        style={{ fontFamily: 'var(--font-geist-sans), var(--font-sans)', background: 'var(--bg-0)', color: 'var(--fg-0)', minHeight: '100vh' }}
      >
        <Providers>
          <div style={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
            <Sidebar />
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', minWidth: 0 }}>
              <main style={{ flex: 1, overflow: 'hidden' }}>{children}</main>
            </div>
          </div>
        </Providers>
      </body>
    </html>
  );
}
