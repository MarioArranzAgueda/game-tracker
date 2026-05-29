'use client';

import { useQuery } from '@tanstack/react-query';
import { Heart, Loader2, Search, X } from 'lucide-react';
import Link from 'next/link';
import { useState, useMemo, Suspense } from 'react';
import { useLibraryMutations } from '@/hooks/useLibraryMutations';
import { openGame } from '@/hooks/useGameOverlay';
import { RatingBubble } from '@/components/RatingBubble';

export default function Favorites() {
  return (
    <Suspense fallback={
      <div style={{ display: 'flex', height: '100%', alignItems: 'center', justifyContent: 'center' }}>
        <Loader2 size={24} className="animate-spin" style={{ color: 'var(--accent)' }} />
      </div>
    }>
      <FavoritesContent />
    </Suspense>
  );
}


function FavoritesContent() {
  const [q, setQ] = useState('');
  const [sort, setSort] = useState<'default' | 'title' | 'score'>('default');

  const { data: entries, isLoading } = useQuery({
    queryKey: ['library'],
    queryFn: async () => {
      const res = await fetch('/api/library');
      if (!res.ok) throw new Error('Failed');
      return res.json();
    },
    select: (data: any[]) => data.filter((e) => e.isFavorite),
  });

  const { toggleFavorite } = useLibraryMutations();

  const filtered = useMemo(() => {
    if (!entries) return [];
    let list = entries.filter((e: any) =>
      !q || e.game.title.toLowerCase().includes(q.toLowerCase()),
    );
    if (sort === 'title') list = [...list].sort((a: any, b: any) => a.game.title.localeCompare(b.game.title));
    if (sort === 'score') list = [...list].sort((a: any, b: any) => {
      const sa = a.personalScore != null ? parseFloat(String(a.personalScore)) : -1;
      const sb = b.personalScore != null ? parseFloat(String(b.personalScore)) : -1;
      return sb - sa;
    });
    return list;
  }, [entries, q, sort]);

  if (isLoading) {
    return (
      <div style={{ display: 'flex', height: '100%', alignItems: 'center', justifyContent: 'center' }}>
        <Loader2 size={24} className="animate-spin" style={{ color: 'var(--accent)' }} />
      </div>
    );
  }

  const total = entries?.length ?? 0;

  return (
    <div
      className="gt-page"
      style={{
        padding: 'var(--s-6)',
        background: 'radial-gradient(ellipse at top right, oklch(0.2 0.05 280) 0%, var(--bg-0) 55%)',
      }}
    >
      {/* Header */}
      <div style={{
        padding: 'var(--s-2) 0 var(--s-5)',
        display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12,
      }}>
        <div>
          <div style={{ fontSize: 'var(--t-xs)', color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 600 }}>Colección</div>
          <h1 className="display" style={{ fontSize: 'clamp(36px, 6cqw, 56px)', lineHeight: 1, marginTop: 'var(--s-1)' }}>Favoritos</h1>
          <p style={{ color: 'var(--fg-2)', fontSize: 'var(--t-md)', marginTop: 'var(--s-3)', maxWidth: 460, lineHeight: 1.5 }}>
            Los juegos que más te marcaron, expuestos como objetos. Tu propia galería privada.
          </p>
        </div>
      </div>

      {/* Empty state */}
      {total === 0 ? (
        <div style={{ textAlign: 'center', padding: '80px 24px', color: 'var(--fg-2)' }}>
          <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'rgba(255,255,255,0.04)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
            <Heart size={24} style={{ color: 'var(--fg-3)' }} />
          </div>
          <div style={{ fontSize: 'var(--t-2xl)', fontWeight: 500, marginBottom: 8 }}>Sin favoritos aún</div>
          <div style={{ fontSize: 'var(--t-base)', marginBottom: 24 }}>Marca juegos como favoritos desde tu biblioteca.</div>
          <Link href="/library" className="gt-btn primary" style={{ display: 'inline-flex' }}>Ir a Mi Lista</Link>
        </div>
      ) : (
        <>
          {/* Search + sort */}
          <div style={{ display: 'flex', gap: 8, marginBottom: 'var(--s-6)', alignItems: 'center', flexWrap: 'wrap' }}>
            <div style={{ position: 'relative', flex: 1, minWidth: 180, maxWidth: 320 }}>
              <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--fg-2)', pointerEvents: 'none' }}>
                <Search size={14} />
              </span>
              <input
                className="gt-input"
                placeholder="Buscar favoritos…"
                value={q}
                onChange={(e) => setQ(e.target.value)}
              />
              {q && (
                <button onClick={() => setQ('')} style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 0, cursor: 'pointer', color: 'var(--fg-2)', padding: 2 }}>
                  <X size={14} />
                </button>
              )}
            </div>
            <div style={{ position: 'relative' }}>
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value as typeof sort)}
                style={{
                  appearance: 'none', WebkitAppearance: 'none',
                  background: sort !== 'default' ? 'var(--accent-soft)' : 'rgba(255,255,255,0.05)',
                  border: `0.5px solid ${sort !== 'default' ? 'var(--accent)' : 'var(--line-strong)'}`,
                  color: sort !== 'default' ? 'var(--accent)' : 'var(--fg-1)',
                  padding: '8px 32px 8px 12px', borderRadius: 'var(--r-md)',
                  fontFamily: 'inherit', fontSize: 'var(--t-base)', cursor: 'pointer',
                  outline: 'none', transition: 'all 0.18s',
                }}
              >
                <option value="default" style={{ background: 'var(--bg-1)', color: 'var(--fg-0)' }}>Predeterminado</option>
                <option value="title" style={{ background: 'var(--bg-1)', color: 'var(--fg-0)' }}>A → Z</option>
                <option value="score" style={{ background: 'var(--bg-1)', color: 'var(--fg-0)' }}>Mejor puntuación</option>
              </select>
              <span style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: sort !== 'default' ? 'var(--accent)' : 'var(--fg-2)' }}>▾</span>
            </div>
          </div>

          {filtered.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '64px 24px', color: 'var(--fg-2)' }}>
              <div style={{ fontSize: 'var(--t-xl)', fontWeight: 500, marginBottom: 8 }}>Sin resultados</div>
              <div style={{ fontSize: 'var(--t-base)' }}>Prueba otra búsqueda.</div>
            </div>
          ) : (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(min(360px, 100%), 1fr))',
              gap: 'var(--s-10)',
            }}>
              {filtered.map((entry: any, i: number) => (
                <DiscRow
                  key={entry.id}
                  entry={entry}
                  index={i}
                  onUnfav={() => toggleFavorite.mutate({ id: entry.id, isFavorite: false })}
                />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}

function DiscRow({ entry, index, onUnfav }: { entry: any; index: number; onUnfav: () => void }) {
  const igdbId: number = entry.game.igdbId;
  const hue = (igdbId * 23) % 360;
  const rating = entry.game.rawData?.total_rating ?? null;

  return (
    <div
      className="disc-row anim-in"
      onClick={() => openGame(igdbId)}
      role="button"
      tabIndex={0}
      aria-label={`Ver detalle de ${entry.game.title}`}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openGame(igdbId); } }}
      style={{ position: 'relative', height: 240, animationDelay: `${index * 40}ms` }}
    >
      {/* Iridescent disc — behind cover, slides right on hover */}
      <div
        className="disc-disc"
        aria-hidden="true"
        style={{
          position: 'absolute', left: 120, top: '50%',
          transform: 'translateY(-50%) rotate(0deg)',
          width: 224, height: 224, borderRadius: '50%',
          filter: 'drop-shadow(0 14px 28px rgba(0,0,0,0.55))',
        }}
      >
        {/* Outer rim */}
        <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', background: 'radial-gradient(circle at 50% 50%, transparent 96%, oklch(0.1 0.01 280) 97%, oklch(0.18 0.01 280) 100%)' }} />

        {/* Iridescent conic gradient */}
        <div style={{
          position: 'absolute', inset: 4, borderRadius: '50%', opacity: 0.95,
          background: `conic-gradient(from 0deg,
            oklch(0.78 0.18 ${hue}) 0%, oklch(0.82 0.16 ${(hue + 60) % 360}) 14%,
            oklch(0.88 0.14 ${(hue + 120) % 360}) 28%, oklch(0.82 0.16 ${(hue + 180) % 360}) 42%,
            oklch(0.78 0.18 ${(hue + 240) % 360}) 57%, oklch(0.85 0.15 ${(hue + 300) % 360}) 71%,
            oklch(0.78 0.18 ${hue}) 100%)`,
        }} />

        {/* Concentric groove tracks */}
        <div style={{ position: 'absolute', inset: 4, borderRadius: '50%', mixBlendMode: 'multiply', opacity: 0.7, background: 'repeating-radial-gradient(circle at 50% 50%, rgba(0,0,0,0.10) 0px, rgba(0,0,0,0.10) 0.5px, transparent 0.5px, transparent 1.5px)' }} />

        {/* Inner data ring */}
        <div style={{ position: 'absolute', inset: '38%', borderRadius: '50%', border: '0.5px solid rgba(0,0,0,0.35)', boxShadow: '0 0 0 0.5px rgba(255,255,255,0.18)' }} />

        {/* Center — circular cover crop */}
        <div style={{
          position: 'absolute', inset: '24%', borderRadius: '50%', overflow: 'hidden',
          boxShadow: 'inset 0 0 0 0.5px rgba(255,255,255,0.2), 0 0 30px var(--accent-glow)',
        }}>
          {entry.game.coverUrl ? (
            <img src={entry.game.coverUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
          ) : (
            <div style={{ width: '100%', height: '100%', background: `linear-gradient(135deg, oklch(0.25 0.1 ${hue}), oklch(0.15 0.05 ${(hue + 60) % 360}))` }} />
          )}
          {/* Spindle hole */}
          <div style={{ position: 'absolute', top: '50%', left: '50%', width: 10, height: 10, transform: 'translate(-50%, -50%)', borderRadius: '50%', background: '#000', boxShadow: 'inset 0 0 0 0.5px rgba(255,255,255,0.15)' }} />
        </div>


        {/* Specular sweeps */}
        <div style={{ position: 'absolute', inset: 4, borderRadius: '50%', pointerEvents: 'none', mixBlendMode: 'plus-lighter', background: 'linear-gradient(115deg, transparent 32%, rgba(255,255,255,0.45) 48%, rgba(255,255,255,0.6) 50%, rgba(255,255,255,0.4) 52%, transparent 68%)' }} />
        <div style={{ position: 'absolute', inset: 4, borderRadius: '50%', pointerEvents: 'none', mixBlendMode: 'plus-lighter', background: 'linear-gradient(295deg, transparent 40%, rgba(255,255,255,0.15) 50%, transparent 60%)' }} />
        <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', pointerEvents: 'none', boxShadow: 'inset 0 1px 2px rgba(255,255,255,0.3), inset 0 -1px 2px rgba(0,0,0,0.4)' }} />
      </div>

      {/* Steelbook case — stays in place, sits above disc */}
      <div style={{ position: 'absolute', left: 0, top: '50%', transform: 'translateY(-50%)', width: 168, height: 224, zIndex: 2 }}>
        <div style={{ position: 'absolute', inset: '0 -3px -3px 0', background: 'linear-gradient(135deg, oklch(0.18 0.01 280), oklch(0.08 0.01 280))', borderRadius: 4 }} />
        <div style={{ position: 'relative', width: '100%', height: '100%', borderRadius: 4, overflow: 'hidden', boxShadow: '0 18px 40px rgba(0,0,0,0.7), inset 0 0 0 0.5px rgba(255,255,255,0.1)' }}>
          {entry.game.coverUrl ? (
            <img src={entry.game.coverUrl} alt={entry.game.title} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
          ) : (
            <div style={{ width: '100%', height: '100%', background: `linear-gradient(135deg, oklch(0.25 0.1 ${hue}), oklch(0.15 0.05 ${(hue + 60) % 360}))` }} />
          )}
          <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', mixBlendMode: 'plus-lighter', background: 'linear-gradient(108deg, rgba(255,255,255,0.16) 0%, transparent 18%, transparent 82%, rgba(255,255,255,0.06) 100%)' }} />
        </div>
      </div>

      {/* Metadata — right */}
      <div style={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', width: 'min(150px, 32%)', textAlign: 'right', zIndex: 3 }}>
        <div className="display" style={{ fontSize: 'var(--t-2xl)', lineHeight: 1.05, marginTop: 'var(--s-2)', wordBreak: 'break-word' }}>{entry.game.title}</div>
        {entry.game.releaseYear && <div className="mono" style={{ fontSize: 'var(--t-xs)', color: 'var(--fg-2)', marginTop: 'var(--s-2)' }}>{entry.game.releaseYear}</div>}
        {(() => {
          const platforms: { name?: string; abbreviation?: string }[] = entry.game.rawData?.platforms ?? [];
          if (!platforms.length) return null;
          const shown = platforms.slice(0, 3);
          const extra = platforms.length - shown.length;
          return (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 3, marginTop: 'var(--s-2)', justifyContent: 'flex-end' }}>
              {shown.map((p, i) => (
                <span key={i} style={{ fontSize: 9, fontWeight: 600, padding: '2px 5px', borderRadius: 4, background: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.7)', whiteSpace: 'nowrap' }}>
                  {p.abbreviation || p.name}
                </span>
              ))}
              {extra > 0 && (
                <span style={{ fontSize: 9, fontWeight: 600, padding: '2px 5px', borderRadius: 4, background: 'rgba(255,255,255,0.04)', color: 'rgba(255,255,255,0.45)' }}>+{extra}</span>
              )}
            </div>
          );
        })()}
        <div style={{ marginTop: 'var(--s-2)', display: 'inline-flex', justifyContent: 'flex-end' }}>
          <RatingBubble rating={rating} size={28} showEmpty />
        </div>
      </div>

      {/* Unfav button */}
      <button
        onClick={(e) => { e.preventDefault(); e.stopPropagation(); onUnfav(); }}
        title="Quitar de favoritos"
        style={{ position: 'absolute', top: 8, right: 8, zIndex: 4, width: 28, height: 28, borderRadius: 'var(--r-md)', background: 'rgba(0,0,0,0.5)', border: '0.5px solid rgba(255,255,255,0.1)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'oklch(0.75 0.18 10)', transition: 'all 0.15s', backdropFilter: 'blur(4px)', opacity: 0.6 }}
        onMouseEnter={(e) => { e.currentTarget.style.opacity = '1'; e.currentTarget.style.background = 'rgba(255,60,60,0.2)'; }}
        onMouseLeave={(e) => { e.currentTarget.style.opacity = '0.6'; e.currentTarget.style.background = 'rgba(0,0,0,0.5)'; }}
      >
        <Heart size={12} fill="currentColor" />
      </button>
    </div>
  );
}
