'use client';

import { useQuery } from '@tanstack/react-query';
import { Loader2 } from 'lucide-react';
import Link from 'next/link';
import { STATUS_MAP, STATUS_ORDER } from '@/lib/constants';

const STATUS_COLORS: Record<string, string> = {
  WISHLIST:        'var(--st-wish)',
  PENDING:         'var(--st-pile)',
  IN_PROGRESS:     'var(--st-playing)',
  COMPLETED:       'var(--st-done)',
  FULL_COMPLETION: 'var(--st-100)',
};

export default function Dashboard() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['stats'],
    queryFn: async () => {
      const res = await fetch('/api/stats');
      if (!res.ok) throw new Error('Stats fetch failed');
      return res.json();
    },
  });

  if (isLoading) {
    return (
      <div style={{ display: 'flex', height: '100%', alignItems: 'center', justifyContent: 'center' }}>
        <Loader2 size={24} className="animate-spin" style={{ color: 'var(--accent)' }} />
      </div>
    );
  }

  const statusCounts: Record<string, number> = stats?.statusCounts ?? {};
  const total = Object.values(statusCounts).reduce((sum, v) => sum + (v as number), 0) as number;
  const completed = (statusCounts.COMPLETED || 0) + (statusCounts.FULL_COMPLETION || 0);
  const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;
  const topGenres: { name: string; value: number }[] = stats?.topGenres ?? [];
  const platformCounts: { name: string; abbreviation?: string; value: number }[] = stats?.platformCounts ?? [];
  const yearCounts: { year: number; value: number }[] = stats?.yearCounts ?? [];
  const avgRating: number | null = stats?.avgRating ?? null;
  const maxGenre = Math.max(...topGenres.map((g) => g.value), 1);
  const maxYear = Math.max(...yearCounts.map((y) => y.value), 1);

  return (
    <div className="gt-page" style={{ padding: 'var(--s-6) var(--s-6) var(--s-12)' }}>
      <div style={{ marginBottom: 'var(--s-6)' }}>
        <h1 style={{ fontSize: 'var(--t-3xl)', fontWeight: 600, letterSpacing: '-0.02em' }}>Dashboard</h1>
        <div style={{ color: 'var(--fg-2)', fontSize: 'var(--t-base)', marginTop: 'var(--s-1)' }}>Tu actividad y colección en números</div>
      </div>

      {/* Stat cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 'var(--s-4)', marginBottom: 'var(--s-5)' }}>
        <StatCard label="Biblioteca" value={total} suffix="juegos" highlight />
        <StatCard label="Completados" value={completed} suffix={`${completionRate}% del total`} />
        <StatCard label="100%" value={statusCounts.FULL_COMPLETION || 0} suffix="platinos" />
        <StatCard label="Nota media" value={avgRating ?? '—'} suffix="/ 100" />
      </div>

      {/* Charts */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(360px, 100%), 1fr))', gap: 'var(--s-4)' }}>

        {/* Géneros */}
        <div className="glass" style={{ padding: 'var(--s-5)', borderRadius: 'var(--r-lg)' }}>
          <h3 style={{ fontSize: 'var(--t-md)', fontWeight: 600 }}>Géneros más jugados</h3>
          <div style={{ fontSize: 'var(--t-xs)', color: 'var(--fg-2)', marginTop: 2, marginBottom: 'var(--s-4)' }}>De tu catálogo completo</div>
          {topGenres.length > 0 ? topGenres.map((g) => (
            <div key={g.name} style={{ marginBottom: 'var(--s-3)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, fontSize: 'var(--t-base)' }}>
                <span style={{ color: 'var(--fg-1)' }}>{g.name}</span>
                <span className="mono" style={{ color: 'var(--fg-2)' }}>{g.value}</span>
              </div>
              <div style={{ height: 6, borderRadius: 'var(--r-pill)', background: 'rgba(255,255,255,0.04)', overflow: 'hidden' }}>
                <div style={{
                  height: '100%', width: `${(g.value / maxGenre) * 100}%`,
                  background: 'linear-gradient(90deg, var(--accent), oklch(0.78 0.18 320))',
                  borderRadius: 'var(--r-pill)',
                }} />
              </div>
            </div>
          )) : (
            <div style={{ padding: '32px 0', textAlign: 'center', color: 'var(--fg-3)', fontSize: 'var(--t-sm)' }}>Añade juegos para ver géneros</div>
          )}
        </div>

        {/* Por estado */}
        <div className="glass" style={{ padding: 'var(--s-5)', borderRadius: 'var(--r-lg)' }}>
          <h3 style={{ fontSize: 'var(--t-md)', fontWeight: 600 }}>Por estado</h3>
          <div style={{ fontSize: 'var(--t-xs)', color: 'var(--fg-2)', marginTop: 2, marginBottom: 'var(--s-4)' }}>{total} juegos catalogados</div>

          {/* Stacked bar */}
          {total > 0 && (
            <div style={{ display: 'flex', height: 10, borderRadius: 'var(--r-pill)', overflow: 'hidden', marginBottom: 'var(--s-4)', background: 'rgba(255,255,255,0.04)' }}>
              {STATUS_ORDER.map((key) => {
                const count = statusCounts[key] || 0;
                if (!count) return null;
                return <div key={key} style={{ width: `${(count / total) * 100}%`, background: STATUS_COLORS[key], opacity: 0.85 }} />;
              })}
            </div>
          )}

          {/* Legend rows — clickable, link to library filtered by status */}
          {STATUS_ORDER.map((key) => {
            const count = statusCounts[key] || 0;
            if (!count) return null;
            const meta = STATUS_MAP[key];
            return (
              <Link
                key={key}
                href={`/library?status=${key}`}
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '7px 0', textDecoration: 'none', transition: 'opacity 0.15s' }}
                onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.7')}
                onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--s-2)' }}>
                  <span className={`st-pill ${meta.cls}`} style={{ padding: '2px 4px', fontSize: 9 }}><span className="dot" /></span>
                  <span style={{ fontSize: 'var(--t-base)', color: 'var(--fg-1)' }}>{meta.label}</span>
                </div>
                <span className="mono" style={{ fontSize: 'var(--t-base)', color: 'var(--fg-0)' }}>{count}</span>
              </Link>
            );
          })}

          {total === 0 && (
            <div style={{ padding: '32px 0', textAlign: 'center', color: 'var(--fg-3)', fontSize: 'var(--t-sm)' }}>Añade juegos a tu biblioteca</div>
          )}
        </div>

        {/* Plataformas */}
        {platformCounts.length > 0 && (
          <div className="glass" style={{ padding: 'var(--s-5)', borderRadius: 'var(--r-lg)' }}>
            <h3 style={{ fontSize: 'var(--t-md)', fontWeight: 600, marginBottom: 'var(--s-4)' }}>Plataformas</h3>
            {platformCounts.slice(0, 10).map(({ name, abbreviation, value }, i) => (
              <div key={name} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '5px 0', fontSize: 'var(--t-sm)' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: 'var(--s-2)' }}>
                  <span style={{ width: 6, height: 6, borderRadius: '50%', background: `hsl(${(i * 47) % 360}, 60%, 62%)`, flexShrink: 0 }} />
                  <span style={{ color: 'var(--fg-1)' }}>{abbreviation || name}</span>
                </span>
                <span className="mono" style={{ color: 'var(--fg-2)' }}>{value}</span>
              </div>
            ))}
          </div>
        )}

        {/* Por año */}
        {yearCounts.length > 0 && (
          <div className="glass" style={{ padding: 'var(--s-5)', borderRadius: 'var(--r-lg)' }}>
            <h3 style={{ fontSize: 'var(--t-md)', fontWeight: 600 }}>Por año de lanzamiento</h3>
            <div style={{ fontSize: 'var(--t-xs)', color: 'var(--fg-2)', marginTop: 2, marginBottom: 'var(--s-5)' }}>De los juegos en tu biblioteca</div>
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: 'var(--s-2)', height: 120, overflowX: 'auto' }}>
              {yearCounts.map(({ year, value }) => (
                <div key={year} style={{ flex: '0 0 auto', minWidth: 32, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 'var(--s-1)' }}>
                  <span className="mono" style={{ fontSize: 'var(--t-xs)', color: 'var(--fg-0)' }}>{value}</span>
                  <div style={{
                    width: '100%', height: `${(value / maxYear) * 72}px`, minHeight: 4,
                    background: 'linear-gradient(180deg, var(--accent), oklch(0.5 0.18 280))',
                    borderRadius: '4px 4px 0 0',
                    boxShadow: '0 0 12px var(--accent-glow)',
                  }} />
                  <span className="mono" style={{ fontSize: 9, color: 'var(--fg-3)', writingMode: 'vertical-rl', transform: 'rotate(180deg)', lineHeight: 1 }}>{year}</span>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

function StatCard({ label, value, suffix, highlight = false }: {
  label: string;
  value: number | string;
  suffix: string;
  highlight?: boolean;
}) {
  return (
    <div className="glass" style={{
      padding: 'var(--s-4)', borderRadius: 'var(--r-lg)', minHeight: 92,
      background: highlight ? 'linear-gradient(135deg, var(--accent-soft) 0%, rgba(255,255,255,0.04) 100%)' : undefined,
    }}>
      <div style={{ fontSize: 'var(--t-xs)', color: 'var(--fg-2)', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 500 }}>{label}</div>
      <div className="display" style={{ fontSize: 'var(--t-4xl)', lineHeight: 1, marginTop: 'var(--s-2)' }}>{value}</div>
      <div className="mono" style={{ fontSize: 'var(--t-xs)', color: 'var(--fg-2)', marginTop: 'var(--s-1)' }}>{suffix}</div>
    </div>
  );
}
