'use client';

import { Suspense, useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Search, Loader2, Filter, X } from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import { openGame } from '@/hooks/useGameOverlay';
import {
  DndContext, closestCenter, KeyboardSensor, MouseSensor, TouchSensor,
  useSensor, useSensors, DragOverlay,
} from '@dnd-kit/core';
import type { DragStartEvent, DragEndEvent } from '@dnd-kit/core';
import {
  SortableContext, horizontalListSortingStrategy, useSortable,
  sortableKeyboardCoordinates, arrayMove,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Game, GameCard } from './components/GameCard';
import { ConfirmModal } from './components/ConfirmModal';
import { HeroBanner } from './components/HeroBanner';

function sortableGameId(game: Game, index: number) {
  return game.id ?? game.igdbId ?? index;
}

/* ── Draggable card wrapper ──────────────────────────────────────── */
function SortableCard({
  game, index, libraryIds, addingId, onAdd, onDelete, libraryEntryMap,
}: {
  game: Game; index: number;
  libraryIds: Set<number>; addingId: number | null;
  onAdd: (igdbId: number, status: string) => void;
  onDelete: (entryId: number) => void;
  libraryEntryMap: Map<number, number>;
}) {
  const { attributes, listeners, setNodeRef, setActivatorNodeRef, transform, transition, isDragging } = useSortable({
    id: sortableGameId(game, index),
  });
  const igdbId = game.igdbId!;
  return (
    <div
      ref={setNodeRef}
      style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.3 : 1, zIndex: isDragging ? 50 : 'auto' }}
      {...attributes}
    >
      {/* Drag handle — in normal flow above the card, no stacking conflicts */}
      <div
        ref={setActivatorNodeRef}
        {...listeners}
        style={{
          width: '100%', height: 16,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: 'grab', touchAction: 'none', userSelect: 'none', flexShrink: 0,
        }}
      >
        <div style={{ width: 36, height: 4, borderRadius: 3, background: 'rgba(255,255,255,0.3)' }} />
      </div>
      <GameCard
        game={game} variant="cinematic" width={154}
        inLibrary={libraryIds.has(igdbId)}
        onAdd={(status) => onAdd(igdbId, status)}
        isAdding={addingId === igdbId}
        onDelete={libraryEntryMap.has(igdbId) ? () => onDelete(libraryEntryMap.get(igdbId)!) : undefined}
      />
    </div>
  );
}

/* ── Draggable carousel ──────────────────────────────────────────── */
function DraggableCarousel({
  title, games, libraryIds, addingId, onAdd, onDelete, libraryEntryMap, onReorder,
}: {
  title: string; games: Game[];
  libraryIds: Set<number>; addingId: number | null;
  onAdd: (igdbId: number, status: string) => void;
  onDelete: (entryId: number) => void;
  libraryEntryMap: Map<number, number>;
  onReorder: (games: Game[]) => void;
}) {
  const [local, setLocal] = useState(games);
  const [activeId, setActiveId] = useState<number | null>(null);
  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 8 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 100, tolerance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  useEffect(() => setLocal(games), [games]);

  if (games.length === 0) return null;
  const active = activeId ? local.find((g, i) => sortableGameId(g, i) === activeId) : null;
  const activeIdx = activeId ? local.findIndex((g, i) => sortableGameId(g, i) === activeId) : -1;

  return (
    <section style={{ marginBottom: 12 }}>
      <div className="carousel-head">
        <h2>{title}</h2>
        <span className="more" style={{ fontSize: 'var(--t-xs)', color: 'var(--fg-3)' }}>Arrastra para reordenar</span>
      </div>
      <DndContext
        sensors={sensors} collisionDetection={closestCenter}
        onDragStart={(e: DragStartEvent) => setActiveId(e.active.id as number)}
        onDragEnd={(e: DragEndEvent) => {
          const { active, over } = e;
          setActiveId(null);
          if (over && active.id !== over.id) {
            const oi = local.findIndex((g, i) => sortableGameId(g, i) === active.id);
            const ni = local.findIndex((g, i) => sortableGameId(g, i) === over.id);
            const reordered = arrayMove(local, oi, ni);
            setLocal(reordered);
            onReorder(reordered);
          }
        }}
      >
        <SortableContext items={local.map((g, i) => sortableGameId(g, i))} strategy={horizontalListSortingStrategy}>
          <div className="h-scroll">
            {local.map((game, index) => (
              <SortableCard
                key={sortableGameId(game, index)} game={game} index={index}
                libraryIds={libraryIds} addingId={addingId}
                onAdd={onAdd} onDelete={onDelete} libraryEntryMap={libraryEntryMap}
              />
            ))}
          </div>
        </SortableContext>
        <DragOverlay dropAnimation={{ duration: 200, easing: 'ease' }}>
          {active ? <GameCard game={active} variant="cinematic" width={154} /> : null}
        </DragOverlay>
      </DndContext>
    </section>
  );
}

/* ── Simple carousel ─────────────────────────────────────────────── */
function SimpleCarousel({
  title, games, libraryIds, addingId, onAdd, onDelete, libraryEntryMap,
}: {
  title: string; games: Game[];
  libraryIds: Set<number>; addingId: number | null;
  onAdd: (igdbId: number, status: string) => void;
  onDelete: (entryId: number) => void;
  libraryEntryMap: Map<number, number>;
}) {
  if (games.length === 0) return null;
  return (
    <section style={{ marginBottom: 12 }}>
      <div className="carousel-head">
        <h2>{title}</h2>
        <span className="more">Ver todo</span>
      </div>
      <div className="h-scroll">
        {games.map((game) => {
          const igdbId = game.igdbId;
          if (igdbId == null) return null;
          return (
            <GameCard
              key={igdbId} game={game} variant="cinematic" width={154}
              inLibrary={libraryIds.has(igdbId)}
              onAdd={(status) => onAdd(igdbId, status)}
              isAdding={addingId === igdbId}
              onDelete={libraryEntryMap.has(igdbId) ? () => onDelete(libraryEntryMap.get(igdbId)!) : undefined}
            />
          );
        })}
      </div>
    </section>
  );
}


/* ── Search results grid ─────────────────────────────────────────── */
function SearchGrid({
  games, libraryIds, addingId, onAdd, onDelete, libraryEntryMap,
}: {
  games: Game[]; libraryIds: Set<number>; addingId: number | null;
  onAdd: (igdbId: number, status: string) => void;
  onDelete: (entryId: number) => void;
  libraryEntryMap: Map<number, number>;
}) {
  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
      gap: 16, padding: '0 24px',
    }}>
      {games.map((game) => {
        const igdbId = game.igdbId;
        if (igdbId == null) return null;
        return (
          <GameCard
            key={igdbId} game={game} variant="cinematic" width="100%"
            inLibrary={libraryIds.has(igdbId)}
            onAdd={(status) => onAdd(igdbId, status)}
            isAdding={addingId === igdbId}
            onDelete={libraryEntryMap.has(igdbId) ? () => onDelete(libraryEntryMap.get(igdbId)!) : undefined}
          />
        );
      })}
    </div>
  );
}

export default function Home() {
  return (
    <Suspense fallback={
      <div style={{ display: 'flex', height: '100%', alignItems: 'center', justifyContent: 'center' }}>
        <Loader2 size={24} className="animate-spin" style={{ color: 'var(--accent)' }} />
      </div>
    }>
      <HomeContent />
    </Suspense>
  );
}

function HomeContent() {
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();
  const initialQuery = searchParams.get('q') || '';

  const [query, setQuery] = useState(initialQuery);
  const [debouncedQuery, setDebouncedQuery] = useState(initialQuery);
  const [addingId, setAddingId] = useState<number | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [pendingDeleteId, setPendingDeleteId] = useState<number | null>(null);
  const [showDLC, setShowDLC] = useState(searchParams.get('dlc') === '1');
  const [showExpansions, setShowExpansions] = useState(searchParams.get('expansions') === '1');
  const [selectedPlatform] = useState(searchParams.get('platform') || '');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(query), 500);
    return () => clearTimeout(timer);
  }, [query]);

  const { data: searchResults = [], isFetching: isSearching } = useQuery<Game[]>({
    queryKey: ['search', debouncedQuery, showDLC, showExpansions, selectedPlatform],
    queryFn: async () => {
      const params = new URLSearchParams({ q: debouncedQuery });
      if (showDLC) params.set('dlc', '1');
      if (showExpansions) params.set('expansions', '1');
      if (selectedPlatform) params.set('platform', selectedPlatform);
      const res = await fetch(`/api/games/search?${params}`);
      return res.json();
    },
    enabled: debouncedQuery.trim().length >= 2,
    staleTime: 1000 * 60 * 5,
    placeholderData: (prev) => prev,
  });

  const { data: releases, isLoading: isLoadingReleases } = useQuery<{ recent: Game[]; upcoming: Game[] }>({
    queryKey: ['releases'],
    queryFn: async () => {
      const res = await fetch('/api/games/releases');
      return res.json();
    },
    staleTime: 1000 * 60 * 15,
  });

  const { data: userLibrary = [] } = useQuery<{
    id: number; gameId: number; status: string; sortOrder: number | null;
    personalScore?: number | string | null;
    game: { igdbId: number; title: string; coverUrl: string | null; rawData?: any };
  }[]>({
    queryKey: ['library'],
    queryFn: async () => {
      const res = await fetch('/api/library');
      if (!res.ok) return [];
      return res.json();
    },
  });

  const [popularGames, setPopularGames] = useState<Game[]>([]);
  const [loadingPopular, setLoadingPopular] = useState(false);
  useEffect(() => {
    setLoadingPopular(true);
    fetch('/api/games/popular')
      .then((r) => r.json())
      .then(setPopularGames)
      .finally(() => setLoadingPopular(false));
  }, []);

  const inProgressEntries = userLibrary
    .filter((e) => e.status === 'IN_PROGRESS')
    .sort((a, b) => {
      if (a.sortOrder !== null && b.sortOrder !== null) return a.sortOrder - b.sortOrder;
      if (a.sortOrder !== null) return -1;
      if (b.sortOrder !== null) return 1;
      return a.id - b.id;
    });

  const pendingEntries = userLibrary
    .filter((e) => e.status === 'PENDING')
    .sort((a, b) => {
      if (a.sortOrder !== null && b.sortOrder !== null) return a.sortOrder - b.sortOrder;
      if (a.sortOrder !== null) return -1;
      if (b.sortOrder !== null) return 1;
      return a.id - b.id;
    });

  const toGame = (entry: typeof userLibrary[0]): Game => ({
    id: entry.id,
    igdbId: entry.game.igdbId,
    title: entry.game.title,
    cover: entry.game.coverUrl,
    rating: null, year: null,
    personalScore: entry.personalScore,
    platforms: entry.game.rawData?.platforms ?? [],
    artworks: entry.game.rawData?.artworks ?? [],
    screenshots: entry.game.rawData?.screenshots ?? [],
    status: entry.status,
  });

  const inProgressGames = inProgressEntries.map(toGame);
  const pendingGames = pendingEntries.map(toGame);
  const libraryIds = new Set(userLibrary.map((e) => e.gameId));
  const libraryEntryMap = new Map(userLibrary.map((e) => [e.gameId, e.id]));

  const addMutation = useMutation({
    mutationFn: async ({ igdbId, status }: { igdbId: number; status?: string }) => {
      setAddingId(igdbId);
      const res = await fetch('/api/library', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ igdbId, status: status || 'PENDING' }),
      });
      if (!res.ok) throw new Error('Failed to add');
      return res.json();
    },
    onSettled: () => setAddingId(null),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['library'] }),
  });

  const deleteMutation = useMutation({
    mutationFn: async (entryId: number) => {
      setDeletingId(entryId);
      const res = await fetch(`/api/library/${entryId}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete');
      return res.json();
    },
    onSettled: () => setDeletingId(null),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['library'] }),
  });

  const reorderMutation = useMutation({
    mutationFn: async (reorderedGames: Game[]) => {
      const updates = reorderedGames.map((game, index) => ({ id: game.id!, sortOrder: index }));
      const res = await fetch('/api/library/reorder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ updates }),
      });
      if (!res.ok) throw new Error('Failed to reorder');
      return res.json();
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['library'] }),
  });

  const isSearchMode = debouncedQuery.trim().length >= 2;
  const heroGame = inProgressGames[0] || popularGames[0];

  const carouselProps = {
    libraryIds, addingId, deletingId, libraryEntryMap,
    onAdd: (igdbId: number, status: string) => addMutation.mutate({ igdbId, status }),
    onDelete: (entryId: number) => setPendingDeleteId(entryId),
  };

  return (
    <div className="gt-page" style={{ paddingBottom: 48 }}>
      {/* Search bar */}
      <div style={{ padding: '24px 24px 0', display: 'flex', gap: 8, alignItems: 'center' }}>
        <div style={{ position: 'relative', flex: 1, maxWidth: 560 }}>
          <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', zIndex: 1, color: 'var(--fg-2)', pointerEvents: 'none' }}>
            <Search size={16} />
          </span>
          <input
            type="search"
            className="gt-input"
            placeholder="Buscar juegos, géneros, plataformas…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Escape') setQuery(''); }}
          />
          {isSearching
            ? <Loader2 size={16} className="animate-spin" style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--fg-3)' }} />
            : query && (
              <button
                onClick={() => setQuery('')}
                style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 0, cursor: 'pointer', color: 'var(--fg-2)', padding: 4, display: 'flex', alignItems: 'center' }}
                aria-label="Limpiar búsqueda"
              >
                <X size={14} />
              </button>
            )
          }
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          style={{
            height: 40, padding: '0 14px', borderRadius: 'var(--r-md)',
            border: `0.5px solid ${showFilters || showDLC || showExpansions ? 'var(--accent)' : 'var(--line-strong)'}`,
            background: showFilters || showDLC || showExpansions ? 'var(--accent-soft)' : 'transparent',
            color: showFilters || showDLC || showExpansions ? 'var(--accent)' : 'var(--fg-1)',
            cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6,
            fontSize: 'var(--t-base)', fontFamily: 'inherit', fontWeight: 500,
            transition: 'all 0.18s',
          }}
        >
          <Filter size={14} /> Filtros
          {(showDLC || showExpansions) && <span style={{ background: 'var(--accent)', color: 'oklch(0.15 0.02 280)', borderRadius: 999, width: 18, height: 18, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700 }}>{[showDLC, showExpansions].filter(Boolean).length}</span>}
        </button>
      </div>

      {/* Filter chips */}
      {showFilters && (
        <div className="anim-in" style={{ display: 'flex', gap: 8, padding: '12px 24px 0', flexWrap: 'wrap', alignItems: 'center' }}>
          <button
            onClick={() => setShowDLC(!showDLC)}
            className={`filter-chip ${showDLC ? 'active' : ''}`}
          >DLCs</button>
          <button
            onClick={() => setShowExpansions(!showExpansions)}
            className={`filter-chip ${showExpansions ? 'active' : ''}`}
          >Expansiones</button>
          {(showDLC || showExpansions) && (
            <button
              onClick={() => { setShowDLC(false); setShowExpansions(false); }}
              style={{ background: 'transparent', border: 0, color: 'var(--fg-2)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4, fontSize: 'var(--t-sm)', fontFamily: 'inherit' }}
            >
              <X size={12} /> Limpiar
            </button>
          )}
        </div>
      )}

      {isSearchMode ? (
        /* ── Search results ── */
        <section style={{ marginTop: 24 }}>
          <div style={{ padding: '0 24px 16px', display: 'flex', alignItems: 'center', gap: 12 }}>
            <h2 style={{ fontSize: 'var(--t-xl)', fontWeight: 600, letterSpacing: '-0.015em' }}>
              Resultados para &ldquo;{debouncedQuery}&rdquo;
            </h2>
            {isSearching && <Loader2 size={16} className="animate-spin" style={{ color: 'var(--accent)' }} />}
          </div>
          {searchResults.length === 0 && !isSearching
            ? <p style={{ padding: '48px 24px', textAlign: 'center', color: 'var(--fg-2)' }}>No se encontraron resultados.</p>
            : <SearchGrid games={searchResults} {...carouselProps} />}
        </section>
      ) : (
        /* ── Carousels ── */
        <>
          {heroGame && <HeroBanner game={heroGame} onClick={() => openGame(heroGame.igdbId!)} />}

          {inProgressGames.length > 0 && (
            <DraggableCarousel
              title="En progreso"
              games={inProgressGames}
              onReorder={reorderMutation.mutate}
              {...carouselProps}
            />
          )}

          {pendingGames.length > 0 && (
            <DraggableCarousel
              title="Pendientes"
              games={pendingGames}
              onReorder={reorderMutation.mutate}
              {...carouselProps}
            />
          )}

          {isLoadingReleases ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: 48 }}>
              <Loader2 size={24} className="animate-spin" style={{ color: 'var(--accent)' }} />
            </div>
          ) : (
            <>
              <SimpleCarousel title="Próximos lanzamientos" games={releases?.upcoming ?? []} {...carouselProps} />
              <SimpleCarousel title="Recién salidos" games={releases?.recent ?? []} {...carouselProps} />
            </>
          )}

          {loadingPopular ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: 48 }}>
              <Loader2 size={24} className="animate-spin" style={{ color: 'var(--accent)' }} />
            </div>
          ) : (
            <SimpleCarousel title="Populares ahora" games={popularGames} {...carouselProps} />
          )}
        </>
      )}

      <ConfirmModal
        isOpen={pendingDeleteId !== null}
        onClose={() => setPendingDeleteId(null)}
        onConfirm={() => { if (pendingDeleteId) deleteMutation.mutate(pendingDeleteId); }}
        title="Eliminar juego"
        message="¿Quieres eliminar este juego de tu biblioteca?"
      />
    </div>
  );
}
