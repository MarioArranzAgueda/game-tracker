'use client';

import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import { Loader2, Search, X, RefreshCw } from 'lucide-react';
import Link from 'next/link';
import { useState, useMemo, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ConfirmModal } from '../components/ConfirmModal';
import { parseTitleSort, sortByTitle, type TitleSort } from '@/lib/sortByTitle';
import { useFilters } from '@/hooks/useFilters';
import { useLibraryMutations } from '@/hooks/useLibraryMutations';
import { GameCard } from '../components/GameCard';
import { SelectFilter } from '@/components/SelectFilter';
import { STATUS_MAP, STATUS_ORDER } from '@/lib/constants';

export default function Library() {
  return (
    <Suspense fallback={
      <div style={{ display: 'flex', height: '100%', alignItems: 'center', justifyContent: 'center' }}>
        <Loader2 size={24} className="animate-spin" style={{ color: 'var(--accent)' }} />
      </div>
    }>
      <LibraryContent />
    </Suspense>
  );
}

function LibraryContent() {
  const queryClient = useQueryClient();
  const searchParams = useSearchParams();
  const router = useRouter();
  const [q, setQ] = useState('');
  const statusFilter = searchParams.get('status') || '';
  const genreFilter  = searchParams.get('genre')  || '';
  const platformFilter = searchParams.get('platform') || '';
  const titleSort: TitleSort = parseTitleSort(searchParams.get('sort'));

  const { setFilter, setSingleFilter, clearFilters, hasFilters: hasActiveFilters } = useFilters();

  const { data: entries, isLoading } = useQuery({
    queryKey: ['library'],
    queryFn: async () => {
      const res = await fetch('/api/library');
      if (!res.ok) throw new Error('Failed');
      return res.json();
    },
  });

  const { genres, platforms } = useMemo(() => {
    if (!entries) return { genres: [] as string[], platforms: [] as string[] };
    const gs = new Set<string>(); const ps = new Set<string>();
    entries.forEach((e: any) => {
      e.game.rawData?.genres?.forEach((g: any) => gs.add(g.name));
      e.game.rawData?.platforms?.forEach((p: any) => { const n = p.abbreviation || p.name; if (n) ps.add(n); });
    });
    return { genres: Array.from(gs).sort(), platforms: Array.from(ps).sort() };
  }, [entries]);

  const filteredEntries = useMemo(() => {
    if (!entries) return [];
    return entries.filter((e: any) => {
      if (statusFilter && !statusFilter.split(',').includes(e.status)) return false;
      if (genreFilter && !e.game.rawData?.genres?.map((g: any) => g.name).includes(genreFilter)) return false;
      if (platformFilter && !e.game.rawData?.platforms?.map((p: any) => p.abbreviation || p.name).includes(platformFilter)) return false;
      if (q && !e.game.title.toLowerCase().includes(q.toLowerCase())) return false;
      return true;
    });
  }, [entries, statusFilter, genreFilter, platformFilter, q]);

  const sorted = useMemo(
    () => sortByTitle(filteredEntries, titleSort, (e: any) => e.game.title),
    [filteredEntries, titleSort],
  );

  const refreshMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch('/api/library/refresh', { method: 'POST' });
      if (!res.ok) throw new Error('Failed');
      return res.json();
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['library'] }),
  });

  const { updateStatus, removeGame, toggleFavorite } = useLibraryMutations();
  const [pendingDeleteId, setPendingDeleteId] = useState<number | null>(null);

  const owned = entries?.length ?? 0;
  const activeStatuses = statusFilter ? statusFilter.split(',') : [];

  if (isLoading) {
    return (
      <div style={{ display: 'flex', height: '100%', alignItems: 'center', justifyContent: 'center' }}>
        <Loader2 size={24} className="animate-spin" style={{ color: 'var(--accent)' }} />
      </div>
    );
  }

  return (
    <div className="gt-page" style={{ padding: 'var(--s-6) var(--s-6) var(--s-12)' }}>
      {/* Header */}
      <header style={{ marginBottom: 'var(--s-5)', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16 }}>
        <div>
          <div style={{ fontSize: 'var(--t-xs)', color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 600 }}>Colección</div>
          <h1 style={{ fontSize: 'clamp(28px, 5cqw, 40px)', fontWeight: 600, letterSpacing: '-0.02em', lineHeight: 1.05, marginTop: 4 }}>Mi Lista</h1>
          <p style={{ color: 'var(--fg-2)', fontSize: 'var(--t-base)', marginTop: 6 }}>
            {filteredEntries.length} de {owned} juegos en tu catálogo
          </p>
        </div>
        {entries?.length > 0 && (genres.length === 0 || platforms.length === 0) && (
          <button
            onClick={() => refreshMutation.mutate()}
            disabled={refreshMutation.isPending}
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              padding: '8px 14px', borderRadius: 'var(--r-md)',
              background: 'rgba(255,255,255,0.06)', border: '0.5px solid var(--line-strong)',
              color: 'var(--fg-1)', cursor: 'pointer', fontSize: 'var(--t-sm)',
              fontFamily: 'inherit', fontWeight: 500, transition: 'all 0.18s',
            }}
          >
            <RefreshCw size={13} className={refreshMutation.isPending ? 'animate-spin' : ''} />
            {refreshMutation.isPending ? 'Actualizando…' : 'Actualizar datos'}
          </button>
        )}
      </header>

      {/* Search + dropdowns */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 'var(--s-4)', alignItems: 'center', flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: 200, maxWidth: 400 }}>
          <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--fg-2)', pointerEvents: 'none' }}>
            <Search size={15} />
          </span>
          <input
            className="gt-input"
            placeholder="Buscar en tu lista…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
          {q && (
            <button onClick={() => setQ('')} style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 0, cursor: 'pointer', color: 'var(--fg-2)', padding: 2 }}>
              <X size={14} />
            </button>
          )}
        </div>

        {genres.length > 0 && (
          <SelectFilter
            label="Género" value={genreFilter}
            options={[{ value: '', label: 'Todos los géneros' }, ...genres.map((g) => ({ value: g, label: g }))]}
            onChange={(v) => setSingleFilter('genre', v)}
          />
        )}
        {platforms.length > 0 && (
          <SelectFilter
            label="Plataforma" value={platformFilter}
            options={[{ value: '', label: 'Todas las plataformas' }, ...platforms.map((p) => ({ value: p, label: p }))]}
            onChange={(v) => setSingleFilter('platform', v)}
          />
        )}
        <SelectFilter
          label="Orden" value={titleSort ?? ''}
          options={[
            { value: '', label: 'Predeterminado' },
            { value: 'name_asc', label: 'A → Z' },
            { value: 'name_desc', label: 'Z → A' },
          ]}
          onChange={(v) => setSingleFilter('sort', v)}
        />
        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            style={{ background: 'transparent', border: 0, cursor: 'pointer', color: 'var(--fg-2)', display: 'flex', alignItems: 'center', gap: 4, fontSize: 'var(--t-sm)', fontFamily: 'inherit' }}
          >
            <X size={12} /> Limpiar
          </button>
        )}
      </div>

      {/* Status chips */}
      {entries?.length > 0 && (
        <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 16, flexWrap: 'wrap' }}>
          <button
            onClick={() => setFilter('status', '')}
            className={`filter-chip ${!statusFilter ? 'active' : ''}`}
          >
            Todos · {owned}
          </button>
          {STATUS_ORDER.map((key) => {
            const count = entries?.filter((e: any) => e.status === key).length ?? 0;
            if (count === 0) return null;
            const meta = STATUS_MAP[key];
            const isActive = activeStatuses.includes(key);
            return (
              <button
                key={key}
                onClick={() => setFilter('status', key)}
                style={{
                  flexShrink: 0, padding: '7px 14px', borderRadius: 999,
                  fontSize: 'var(--t-sm)', fontFamily: 'inherit', fontWeight: 500,
                  cursor: 'pointer', transition: 'all 0.15s', whiteSpace: 'nowrap', border: 0,
                  background: isActive ? 'var(--accent-soft)' : 'rgba(255,255,255,0.04)',
                  color: isActive ? 'var(--accent)' : 'var(--fg-1)',
                  outline: isActive ? '0.5px solid var(--accent)' : '0.5px solid rgba(255,255,255,0.06)',
                  outlineOffset: -1,
                }}
              >
                <span className={`st-pill ${meta.cls}`} style={{ padding: '1px 3px', fontSize: 9, marginRight: 4 }}>
                  <span className="dot" />
                </span>
                {meta.label} · {count}
              </button>
            );
          })}
        </div>
      )}

      {/* Empty state */}
      {!entries || owned === 0 ? (
        <div style={{ textAlign: 'center', padding: '80px 24px', color: 'var(--fg-2)' }}>
          <div style={{ fontSize: 'var(--t-2xl)', fontWeight: 500, marginBottom: 8 }}>Tu biblioteca está vacía</div>
          <div style={{ fontSize: 'var(--t-base)', marginBottom: 24 }}>Busca juegos en la pantalla de Inicio para añadirlos.</div>
          <Link href="/" className="gt-btn primary" style={{ display: 'inline-flex' }}>Explorar</Link>
        </div>
      ) : sorted.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '64px 24px', color: 'var(--fg-2)' }}>
          <div style={{ fontSize: 'var(--t-xl)', fontWeight: 500, marginBottom: 8 }}>Sin resultados</div>
          <div style={{ fontSize: 'var(--t-base)' }}>Prueba otro filtro o búsqueda.</div>
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(148px, 1fr))',
          gap: 16,
        }}>
          {sorted.map((entry: any) => (
            <GameCard
              key={entry.id}
              game={{
                igdbId: entry.game.igdbId,
                title: entry.game.title,
                cover: entry.game.coverUrl,
                platforms: entry.game.rawData?.platforms ?? [],
                rating: entry.game.rawData?.total_rating ?? null,
                personalScore: entry.personalScore,
                year: entry.game.releaseYear ?? null,
                status: entry.status,
                isFavorite: entry.isFavorite,
              }}
              variant="cinematic"
              width="100%"
              inLibrary
              onAdd={(status) => updateStatus.mutate({ id: entry.id, status })}
              onDelete={() => setPendingDeleteId(entry.id)}
              onToggleFav={() => toggleFavorite.mutate({ id: entry.id, isFavorite: !entry.isFavorite })}
            />
          ))}
        </div>
      )}

      <ConfirmModal
        isOpen={pendingDeleteId !== null}
        onClose={() => setPendingDeleteId(null)}
        onConfirm={() => { if (pendingDeleteId) removeGame.mutate(pendingDeleteId); }}
        title="Eliminar juego"
        message="¿Quieres eliminar este juego de tu biblioteca?"
      />
    </div>
  );
}
