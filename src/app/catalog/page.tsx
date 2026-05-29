'use client';

import { Suspense, useState, useEffect, useRef, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Search, Star, Loader2, ChevronLeft, ChevronRight, X, Filter } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { openGame } from '@/hooks/useGameOverlay';
import { CustomDropdown } from '@/app/components/CustomDropdown';
import { parseTitleSort, sortByTitle, type TitleSort } from '@/lib/sortByTitle';

interface Game {
  igdbId: number;
  title: string;
  cover: string | null;
  rating: number | null;
  year: number | null;
  platforms?: Array<{ name?: string; abbreviation?: string; platform_logo?: { image_id: string } }>;
}

export default function Catalog() {
  return (
    <Suspense fallback={<div className="flex h-96 items-center justify-center"><Loader2 className="w-6 h-6 animate-spin text-blue-500" /></div>}>
      <CatalogContent />
    </Suspense>
  );
}

function CatalogContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get('q') || '';
  const initialPage = parseInt(searchParams.get('page') || '1', 10);

  const [query, setQuery] = useState(initialQuery);
  const [debouncedQuery, setDebouncedQuery] = useState(initialQuery);
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [showDLC, setShowDLC] = useState(searchParams.get('dlc') === '1');
  const [showExpansions, setShowExpansions] = useState(searchParams.get('expansions') === '1');
  const [selectedPlatform, setSelectedPlatform] = useState(searchParams.get('platform') || '');
  const [showFilters, setShowFilters] = useState(searchParams.get('filters') === 'open');
  const [titleSort, setTitleSort] = useState<TitleSort>(() => parseTitleSort(searchParams.get('sort')));
  const [showPlatformDropdown, setShowPlatformDropdown] = useState(false);
  const [platformSearch, setPlatformSearch] = useState('');
  const platformDropdownRef = useRef<HTMLDivElement>(null);
  const platformButtonRef = useRef<HTMLButtonElement>(null);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0 });

  const ITEMS_PER_PAGE = 24;

  // Platform dropdown positioning
  useEffect(() => {
    if (!showPlatformDropdown) return;
    
    if (platformButtonRef.current) {
      const rect = platformButtonRef.current.getBoundingClientRect();
      setDropdownPosition({
        top: rect.bottom + 8,
        left: rect.left
      });
    }
    
    const handler = (e: MouseEvent) => {
      if (platformDropdownRef.current && !platformDropdownRef.current.contains(e.target as Node) &&
          platformButtonRef.current && !platformButtonRef.current.contains(e.target as Node)) {
        setShowPlatformDropdown(false);
        setPlatformSearch('');
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [showPlatformDropdown]);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(query), 500);
    return () => clearTimeout(timer);
  }, [query]);

  // Reset to page 1 when search query or filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedQuery, showDLC, showExpansions, selectedPlatform, titleSort]);

  // Sync debounced query, filters, and page to URL
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (debouncedQuery.trim().length >= 2) {
      params.set('q', debouncedQuery);
      params.set('page', currentPage.toString());
    } else {
      params.delete('q');
      params.delete('page');
    }
    if (showDLC) {
      params.set('dlc', '1');
    } else {
      params.delete('dlc');
    }
    if (showExpansions) {
      params.set('expansions', '1');
    } else {
      params.delete('expansions');
    }
    if (selectedPlatform) {
      params.set('platform', selectedPlatform);
    } else {
      params.delete('platform');
    }
    if (showFilters) {
      params.set('filters', 'open');
    } else {
      params.delete('filters');
    }
    if (titleSort) {
      params.set('sort', titleSort);
    } else {
      params.delete('sort');
    }
    router.replace(`/catalog?${params.toString()}`, { scroll: false });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedQuery, currentPage, showDLC, showExpansions, selectedPlatform, showFilters, titleSort]);

  const { data: games = [], isFetching } = useQuery<Game[]>({
    queryKey: ['catalog-search', debouncedQuery, showDLC, showExpansions, selectedPlatform],
    queryFn: async () => {
      if (debouncedQuery.trim().length < 2) return [];
      const params = new URLSearchParams({ q: debouncedQuery });
      if (showDLC) params.set('dlc', '1');
      if (showExpansions) params.set('expansions', '1');
      if (selectedPlatform) params.set('platform', selectedPlatform);
      const res = await fetch(`/api/games/search?${params}`);
      return res.json();
    },
    enabled: debouncedQuery.trim().length >= 2,
    staleTime: 1000 * 60 * 5, // cache results for 5 min
    placeholderData: (prev) => prev,
  });

  const { data: platforms = [] } = useQuery<{ id: number; name: string; abbreviation: string | null }[]>({
    queryKey: ['platforms'],
    queryFn: async () => {
      const res = await fetch('/api/games/platforms');
      return res.json();
    },
    staleTime: 1000 * 60 * 60,
  });

  const sortedGames = useMemo(
    () => sortByTitle(games, titleSort, (g) => g.title),
    [games, titleSort],
  );

  // Pagination calculations
  const totalPages = Math.ceil(sortedGames.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const paginatedGames = sortedGames.slice(startIndex, endIndex);

  const goToPage = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const clearSearch = () => {
    setQuery('');
    setDebouncedQuery('');
    setCurrentPage(1);
  };

  return (
    <div className="space-y-6">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold">Catálogo de Juegos</h2>
          <p className="text-slate-400">Encuentra y añade juegos a tu colección.</p>
        </div>
        <div className="flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center gap-3 w-full md:w-auto">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 w-4 h-4" />
            <input
              type="text"
              placeholder="Buscar en IGDB..."
              className="w-full bg-slate-900 border border-slate-800 rounded-lg pl-10 pr-10 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                if(!e.target.value) {
                  setShowFilters(false);
                }
              }}
            />
            {isFetching && <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 animate-spin text-slate-500" />}
            {!isFetching && query && (
              <button
                onClick={clearSearch}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                aria-label="Limpiar búsqueda"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
          <CustomDropdown
            options={[
              { value: '', label: 'Orden: predeterminado' },
              { value: 'name_asc', label: 'Orden: A-Z' },
              { value: 'name_desc', label: 'Orden: Z-A' },
            ]}
            value={titleSort}
            onChange={(v) => setTitleSort(parseTitleSort(v))}
            size="sm"
            className="min-w-[200px] w-full sm:w-auto"
          />
          <button
            onClick={() => setShowFilters(!showFilters)}
            aria-expanded={showFilters}
            aria-controls="filter-panel"
            className={`flex items-center gap-1.5 text-xs font-medium px-3 py-2 rounded-lg border transition-colors whitespace-nowrap ${showFilters || showDLC || showExpansions || selectedPlatform || titleSort ? 'border-blue-500 text-blue-400 bg-blue-500/10' : 'border-slate-700 text-slate-400 hover:border-slate-600'}`}
          >
            <Filter className="w-3 h-3" />
            Filtros
          </button>
        </div>
      </header>

      {/* Animated filter panel */}
      <div
        id="filter-panel"
        role="region"
        aria-label="Filtros de búsqueda"
        className={`grid transition-all duration-300 ease-in-out ${showFilters ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}
      >
        <div className="overflow-hidden">
          <div className="flex flex-wrap items-center gap-3 pt-3 pb-1">
            <button
              onClick={() => setShowDLC(!showDLC)}
              aria-pressed={showDLC}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${showDLC ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/25' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}
            >
              DLCs
            </button>
            <button
              onClick={() => setShowExpansions(!showExpansions)}
              aria-pressed={showExpansions}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${showExpansions ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/25' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}
            >
              Expansiones
            </button>
            <div className="h-5 w-px bg-slate-700" aria-hidden="true" />
            <div className="relative">
              <button
                ref={platformButtonRef}
                onClick={() => setShowPlatformDropdown(!showPlatformDropdown)}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all flex items-center gap-1.5 ${selectedPlatform ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/25' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}
              >
                {selectedPlatform ? (
                  <>
                    {platforms.find(p => p.id.toString() === selectedPlatform)?.abbreviation || 
                     platforms.find(p => p.id.toString() === selectedPlatform)?.name || 'Plataforma'}
                    <span
                      onClick={(e) => { e.stopPropagation(); setSelectedPlatform(''); }}
                      className="hover:bg-white/20 rounded-full p-0.5 cursor-pointer"
                    >
                      <X className="w-3 h-3" />
                    </span>
                  </>
                ) : (
                  'Plataforma'
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Platform dropdown */}
      {showPlatformDropdown && (
        <div 
          ref={platformDropdownRef}
          className="fixed bg-slate-900 border border-slate-700 rounded-lg shadow-xl py-1 min-w-[200px] max-h-[300px] overflow-hidden z-50"
          style={{ top: `${dropdownPosition.top}px`, left: `${dropdownPosition.left}px` }}
        >
          <div className="px-2 py-1.5 border-b border-slate-700">
            <input
              type="text"
              placeholder="Buscar plataforma..."
              value={platformSearch}
              onChange={(e) => setPlatformSearch(e.target.value)}
              className="w-full bg-slate-800 border border-slate-600 rounded px-2 py-1 text-xs text-slate-300 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
          <div className="overflow-y-auto max-h-[240px]">
            <button
              onClick={() => { setSelectedPlatform(''); setShowPlatformDropdown(false); setPlatformSearch(''); }}
              className="w-full px-3 py-2 text-left text-xs hover:bg-slate-800 transition-colors text-slate-400"
            >
              Todas las plataformas
            </button>
            {platforms
              .filter(p => {
                const searchLower = platformSearch.toLowerCase();
                return (p.name?.toLowerCase().includes(searchLower) || 
                        p.abbreviation?.toLowerCase().includes(searchLower));
              })
              .map((p) => (
                <button
                  key={p.id}
                  onClick={() => { setSelectedPlatform(p.id.toString()); setShowPlatformDropdown(false); setPlatformSearch(''); }}
                  className={`w-full px-3 py-2 text-left text-xs hover:bg-slate-800 transition-colors ${
                    selectedPlatform === p.id.toString() ? 'text-blue-400 bg-slate-800/50' : 'text-slate-300'
                  }`}
                >
                  {p.abbreviation || p.name}
                </button>
              ))}
          </div>
        </div>
      )}

      {games.length === 0 && !isFetching && debouncedQuery.length >= 2 && (
        <p className="text-center text-slate-500 py-12">No se encontraron resultados para &quot;{debouncedQuery}&quot;</p>
      )}

      {games.length === 0 && debouncedQuery.length < 2 && (
        <p className="text-center text-slate-500 py-12">Escribe al menos 2 caracteres para buscar juegos.</p>
      )}

      {games.length > 0 && (
        <div className="flex items-center justify-between mb-4">
          <div className="text-sm text-slate-400">
            Mostrando {startIndex + 1}-{Math.min(endIndex, sortedGames.length)} de {sortedGames.length} resultados
          </div>
          {totalPages > 1 && (
            <div className="text-sm font-medium text-slate-300">
              Página {currentPage} de {totalPages}
            </div>
          )}
        </div>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
        {paginatedGames.map((game) => (
          <div key={game.igdbId} className="group flex flex-col gap-2 relative" onClick={() => openGame(game.igdbId)} style={{ cursor: 'pointer' }}>
            <div className="aspect-3/4 overflow-hidden rounded-lg bg-slate-900 border border-slate-800 relative shadow-xl transform transition-all group-hover:-translate-y-1 block">
              {game.cover ? (
                <img
                  src={game.cover}
                  alt={game.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-slate-600 text-sm">Sin imagen</div>
              )}
              <div className="absolute inset-0 bg-blue-600/10 opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
            <div className="flex flex-col gap-1">
              <h3 className="font-bold text-sm line-clamp-1 group-hover:text-blue-400 transition-colors uppercase tracking-tight">{game.title}</h3>
              <div className="flex items-center justify-between text-xs text-slate-500">
                <span>{game.year ?? '—'}</span>
                {game.rating && (
                  <div className="flex items-center gap-1">
                    <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                    <span>{game.rating.toFixed(1)}</span>
                  </div>
                )}
              </div>
              {game.platforms && game.platforms.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-1">
                  {game.platforms.slice(0, 3).map((platform, idx) => (
                    <span key={idx} className="text-[9px] px-1.5 py-0.5 bg-slate-800 text-slate-400 rounded">
                      {platform.abbreviation || platform.name}
                    </span>
                  ))}
                  {game.platforms.length > 3 && (
                    <span className="text-[9px] px-1.5 py-0.5 bg-slate-800 text-slate-400 rounded">
                      +{game.platforms.length - 3}
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-8">
          <button
            onClick={() => goToPage(currentPage - 1)}
            disabled={currentPage === 1}
            className="p-2 rounded-lg bg-slate-900 border border-slate-800 hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            aria-label="Previous page"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-1">
            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .filter((page) => {
                // Show first page, last page, current page, and pages around current
                const distance = Math.abs(page - currentPage);
                return page === 1 || page === totalPages || distance <= 1;
              })
              .map((page, idx, arr) => {
                // Add ellipsis if there's a gap
                const prevPage = arr[idx - 1];
                const showEllipsis = prevPage && page - prevPage > 1;

                return (
                  <div key={page} className="flex items-center gap-1">
                    {showEllipsis && <span className="px-2 text-slate-500">...</span>}
                    <button
                      onClick={() => goToPage(page)}
                      className={`min-w-[40px] h-10 px-3 rounded-lg font-medium transition-colors ${
                        page === currentPage
                          ? 'bg-blue-600 text-white'
                          : 'bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-300'
                      }`}
                    >
                      {page}
                    </button>
                  </div>
                );
              })}
          </div>

          <button
            onClick={() => goToPage(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="p-2 rounded-lg bg-slate-900 border border-slate-800 hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            aria-label="Next page"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      )}
    </div>
  );
}
