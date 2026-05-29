'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import {
  Home, List, Heart, BarChart2, Gamepad2, X, Menu,
} from 'lucide-react';
import { STATUS_MAP, STATUS_ORDER } from '@/lib/constants';

const NAV = [
  { href: '/',          label: 'Inicio',     icon: Home },
  { href: '/library',   label: 'Mi Lista',   icon: List },
  { href: '/favorites', label: 'Favoritos',  icon: Heart },
  { href: '/dashboard', label: 'Dashboard',  icon: BarChart2 },
];

function Brand() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
      <div style={{
        width: 32, height: 32, borderRadius: 9,
        background: 'linear-gradient(135deg, var(--accent), oklch(0.78 0.18 320))',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        boxShadow: '0 6px 16px var(--accent-glow)',
        flexShrink: 0,
      }}>
        <Gamepad2 size={17} color="oklch(0.12 0.02 280)" strokeWidth={2} />
      </div>
      <div>
        <div style={{ fontWeight: 600, letterSpacing: '-0.01em', fontSize: 'var(--t-md)', color: 'var(--fg-0)' }}>
          GameTracker
        </div>
        <div style={{ fontSize: 'var(--t-xs)', color: 'var(--fg-3)', letterSpacing: '0.04em', textTransform: 'uppercase' }}>
          Library
        </div>
      </div>
    </div>
  );
}

function SidebarContent({
  pathname,
  statusCounts,
  ownedCount,
  onNavClick,
}: {
  pathname: string;
  statusCounts: Record<string, number>;
  ownedCount: number;
  onNavClick?: () => void;
}) {
  return (
    <>
      <nav aria-label="Navegación principal">
        <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 2 }}>
          {NAV.map(({ href, label, icon: Icon }) => {
            const active = pathname === href || (href !== '/' && pathname.startsWith(href));
            return (
              <li key={href}>
                <Link
                  href={href}
                  onClick={onNavClick}
                  className={`nav-item ${active ? 'active' : ''}`}
                  aria-current={active ? 'page' : undefined}
                >
                  <Icon size={17} strokeWidth={active ? 2 : 1.7} />
                  <span>{label}</span>
                  {href === '/favorites' && statusCounts['FAV'] > 0 && (
                    <span style={{ marginLeft: 'auto', fontSize: 'var(--t-xs)', color: 'var(--fg-3)', fontVariantNumeric: 'tabular-nums' }}>
                      {statusCounts['FAV']}
                    </span>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div style={{ borderTop: '0.5px solid var(--line)', marginTop: 16, paddingTop: 16 }}>
        <h2 style={{ fontSize: 'var(--t-xs)', color: 'var(--fg-3)', textTransform: 'uppercase', letterSpacing: '0.08em', padding: '0 10px 8px', fontWeight: 500, margin: 0 }}>
          Estados
        </h2>
        {STATUS_ORDER.map((key) => {
          const count = statusCounts[key] ?? 0;
          const meta = STATUS_MAP[key];
          if (!meta) return null;
          return (
            <Link
              key={key}
              href={`/library?status=${key}`}
              onClick={onNavClick}
              className="nav-item"
              style={{ padding: '7px 10px' }}
            >
              <span className={`st-pill ${meta.cls}`} style={{ padding: '2px 4px', fontSize: 9 }} aria-hidden="true">
                <span className="dot" />
              </span>
              <span style={{ fontSize: 'var(--t-base)' }}>{meta.label}</span>
              <span style={{ marginLeft: 'auto', fontSize: 'var(--t-xs)', color: 'var(--fg-3)', fontVariantNumeric: 'tabular-nums' }}>
                {count}
              </span>
            </Link>
          );
        })}
      </div>

      <div style={{ marginTop: 'auto', padding: '12px 10px 4px' }}>
        <div className="glass" style={{ padding: 12, borderRadius: 'var(--r-md)' }}>
          <div style={{ fontSize: 'var(--t-xs)', color: 'var(--fg-2)', marginBottom: 4 }}>Total en biblioteca</div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
            <span style={{ fontSize: 'var(--t-3xl)', fontWeight: 600, lineHeight: 1, letterSpacing: '-0.02em' }}>
              {ownedCount}
            </span>
            <span style={{ fontSize: 'var(--t-xs)', color: 'var(--fg-3)' }}>juegos</span>
          </div>
        </div>
      </div>
    </>
  );
}

export function Sidebar() {
  const pathname = usePathname();
  const [drawerOpen, setDrawerOpen] = useState(false);

  const { data: library = [] } = useQuery<any[]>({
    queryKey: ['library'],
    queryFn: async () => {
      const res = await fetch('/api/library');
      if (!res.ok) return [];
      return res.json();
    },
  });

  // Close drawer on route change
  useEffect(() => { setDrawerOpen(false); }, [pathname]);

  // Close drawer on Escape
  useEffect(() => {
    if (!drawerOpen) return;
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') setDrawerOpen(false); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [drawerOpen]);

  const statusCounts: Record<string, number> = {};
  let ownedCount = 0;
  let favCount = 0;
  for (const entry of library) {
    if (entry.status) {
      statusCounts[entry.status] = (statusCounts[entry.status] ?? 0) + 1;
      ownedCount++;
    }
    if (entry.isFavorite) favCount++;
  }
  statusCounts['FAV'] = favCount;

  return (
    <>
      {/* ── Desktop sidebar (≥768px) ── */}
      <aside
        className="gt-side"
        aria-label="Navegación principal"
        style={{ display: 'none' }}
        id="desktop-sidebar"
      >
        <SidebarContent
          pathname={pathname}
          statusCounts={statusCounts}
          ownedCount={ownedCount}
        />
      </aside>

      {/* ── Mobile top bar ── */}
      <div
        className="gt-topbar"
        style={{
          position: 'fixed', top: 0, left: 0, right: 0,
          zIndex: 40, height: 'var(--topbar-h)',
        }}
        id="mobile-topbar"
      >
        <button
          onClick={() => setDrawerOpen(true)}
          aria-label="Abrir menú"
          aria-expanded={drawerOpen}
          style={{
            width: 38, height: 38, padding: 0,
            borderRadius: 'var(--r-md)', border: 0,
            background: 'rgba(255,255,255,0.05)',
            color: 'var(--fg-0)', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
        >
          <Menu size={18} />
        </button>
        <Brand />
      </div>

      {/* ── Mobile drawer ── */}
      {drawerOpen && (
        <div
          className="anim-fade"
          style={{
            position: 'fixed', inset: 0, zIndex: 90,
            background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)',
          }}
          onClick={() => setDrawerOpen(false)}
        >
          <aside
            className="gt-side anim-drawer"
            role="dialog"
            aria-modal="true"
            aria-label="Menú de navegación"
            onClick={(e) => e.stopPropagation()}
            style={{
              width: 280, maxWidth: 'calc(100% - 60px)', height: '100%',
              position: 'absolute', left: 0, top: 0,
              borderRight: '0.5px solid var(--line)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: 24 }}>
              <Brand />
              <button
                onClick={() => setDrawerOpen(false)}
                aria-label="Cerrar menú"
                style={{
                  width: 32, height: 32, borderRadius: 'var(--r-md)',
                  background: 'rgba(255,255,255,0.06)', border: 0,
                  color: 'var(--fg-0)', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}
              >
                <X size={16} />
              </button>
            </div>
            <SidebarContent
              pathname={pathname}
              statusCounts={statusCounts}
              ownedCount={ownedCount}
              onNavClick={() => setDrawerOpen(false)}
            />
          </aside>
        </div>
      )}

      {/* ── Responsive CSS ── */}
      <style>{`
        @media (min-width: 768px) {
          #desktop-sidebar { display: flex !important; }
          #mobile-topbar { display: none !important; }
        }
        @media (max-width: 767px) {
          /* push content below topbar */
          main { padding-top: var(--topbar-h) !important; }
        }
      `}</style>
    </>
  );
}
