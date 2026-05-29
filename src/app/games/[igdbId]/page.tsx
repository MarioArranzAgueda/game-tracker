'use client';

import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import { Loader2, Calendar, ChevronLeft, ChevronRight, Plus, Play, Building2, Globe, Trash2, Clock, X, Bookmark } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { use, useState, useRef, useEffect, useCallback } from 'react';
import { StarRating } from '@/app/components/StarRating';
import { GameCard } from '@/app/components/GameCard';
import { ConfirmModal } from '@/app/components/ConfirmModal';
import { StatusDropdown as CommonStatusDropdown, LoadingState } from '@/components/common';
import { useLibraryMutations } from '@/hooks/useLibraryMutations';
import { STATUS_OPTIONS } from '@/lib/constants';

function ImageLightbox({ images, initialIdx, onClose }: { images: { image_id: string }[]; initialIdx: number; onClose: () => void }) {
    const [idx, setIdx] = useState(initialIdx);
    const [isTransitioning, setIsTransitioning] = useState(false);

    const handleTransition = (newIdx: number) => {
        setIsTransitioning(true);
        setTimeout(() => {
            setIdx(newIdx);
            setTimeout(() => setIsTransitioning(false), 50);
        }, 200);
    };

    const prev = () => handleTransition(idx === 0 ? images.length - 1 : idx - 1);
    const next = () => handleTransition(idx === images.length - 1 ? 0 : idx + 1);

    const handleKey = useCallback((e: KeyboardEvent) => {
        if (e.key === 'Escape') onClose();
        if (e.key === 'ArrowLeft') prev();
        if (e.key === 'ArrowRight') next();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [idx, images.length]);

    useEffect(() => {
        document.addEventListener('keydown', handleKey);
        document.body.style.overflow = 'hidden';
        return () => {
            document.removeEventListener('keydown', handleKey);
            document.body.style.overflow = '';
        };
    }, [handleKey]);

    return (
        <div className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center" onClick={onClose}>
            <button onClick={onClose} className="absolute top-4 right-4 p-2 text-white/70 hover:text-white z-10">
                <X className="w-8 h-8" />
            </button>
            <div className="relative w-full h-full flex items-center justify-center p-4" onClick={(e) => e.stopPropagation()}>
                <img
                    src={`https://images.igdb.com/igdb/image/upload/t_screenshot_huge/${images[idx].image_id}.jpg`}
                    alt={`Screenshot ${idx + 1}`}
                    className={`max-w-full max-h-full object-contain transition-opacity duration-200 ${isTransitioning ? 'opacity-0' : 'opacity-100'}`}
                />
                {images.length > 1 && (
                    <>
                        <button onClick={prev} className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/60 hover:bg-black/80 p-3 rounded-full">
                            <ChevronLeft className="w-6 h-6" />
                        </button>
                        <button onClick={next} className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/60 hover:bg-black/80 p-3 rounded-full">
                            <ChevronRight className="w-6 h-6" />
                        </button>
                        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-sm text-white/60">
                            {idx + 1} / {images.length}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}

function ScreenshotCarousel({ screenshots, idx, setIdx, onImageClick }: { screenshots: { image_id: string }[]; idx: number; setIdx: (i: number) => void; onImageClick: (i: number) => void }) {
    const [isTransitioning, setIsTransitioning] = useState(false);
    if (!screenshots || screenshots.length === 0) return null;

    const handleTransition = (newIdx: number) => {
        setIsTransitioning(true);
        setTimeout(() => {
            setIdx(newIdx);
            setTimeout(() => setIsTransitioning(false), 50);
        }, 200);
    };

    const prev = () => handleTransition(idx === 0 ? screenshots.length - 1 : idx - 1);
    const next = () => handleTransition(idx === screenshots.length - 1 ? 0 : idx + 1);

    return (
        <div className="relative group">
            <div className="aspect-video rounded-xl overflow-hidden bg-slate-900 border border-slate-800 cursor-pointer" onClick={() => onImageClick(idx)}>
                <img
                    src={`https://images.igdb.com/igdb/image/upload/t_screenshot_huge/${screenshots[idx].image_id}.jpg`}
                    alt={`Screenshot ${idx + 1}`}
                    className={`w-full h-full object-cover transition-opacity duration-200 ${isTransitioning ? 'opacity-0' : 'opacity-100'}`}
                />
            </div>
            {screenshots.length > 1 && (
                <>
                    <button onClick={prev} className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/60 hover:bg-black/80 p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                        <ChevronLeft className="w-5 h-5" />
                    </button>
                    <button onClick={next} className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/60 hover:bg-black/80 p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                        <ChevronRight className="w-5 h-5" />
                    </button>
                    <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                        {screenshots.map((_: { image_id: string }, i: number) => (
                            <button key={i} onClick={() => setIdx(i)} className={`w-2 h-2 rounded-full transition-all ${i === idx ? 'bg-white scale-125' : 'bg-white/40'}`} />
                        ))}
                    </div>
                </>
            )}
        </div>
    );
}

function VideoCarousel({ videos }: { videos: { video_id: string; name?: string }[] }) {
    const [idx, setIdx] = useState(0);
    const [playing, setPlaying] = useState(false);
    const [isTransitioning, setIsTransitioning] = useState(false);
    if (!videos || videos.length === 0) return null;

    const handleTransition = (newIdx: number) => {
        setIsTransitioning(true);
        setTimeout(() => {
            setIdx(newIdx);
            setPlaying(false);
            setTimeout(() => setIsTransitioning(false), 50);
        }, 200);
    };

    const prev = () => handleTransition(idx === 0 ? videos.length - 1 : idx - 1);
    const next = () => handleTransition(idx === videos.length - 1 ? 0 : idx + 1);
    const v = videos[idx];

    return (
        <div className="space-y-3">
            <div className="relative group">
                <div className="aspect-video rounded-xl overflow-hidden bg-slate-900 border border-slate-800 relative">
                    {playing ? (
                        <iframe
                            src={`https://www.youtube.com/embed/${v.video_id}?autoplay=1`}
                            title={v.name || `Video ${idx + 1}`}
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                            className={`w-full h-full transition-opacity duration-200 ${isTransitioning ? 'opacity-0' : 'opacity-100'}`}
                        />
                    ) : (
                        <>
                            <img
                                src={`https://img.youtube.com/vi/${v.video_id}/hqdefault.jpg`}
                                alt={v.name || `Video ${idx + 1}`}
                                className={`w-full h-full object-cover transition-opacity duration-200 ${isTransitioning ? 'opacity-0' : 'opacity-100'}`}
                            />
                            <button
                                onClick={() => setPlaying(true)}
                                className="absolute inset-0 flex items-center justify-center bg-black/30 hover:bg-black/50 transition-colors"
                            >
                                <div className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform">
                                    <Play className="w-7 h-7 text-white fill-white ml-1" />
                                </div>
                            </button>
                        </>
                    )}
                </div>
                {videos.length > 1 && (
                    <>
                        <button onClick={prev} className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/60 hover:bg-black/80 p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                            <ChevronLeft className="w-5 h-5" />
                        </button>
                        <button onClick={next} className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/60 hover:bg-black/80 p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                            <ChevronRight className="w-5 h-5" />
                        </button>
                    </>
                )}
            </div>
            {v.name && <p className="text-xs font-medium text-slate-400">{v.name}</p>}
            {videos.length > 1 && (
                <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                    {videos.map((vid, i) => (
                        <button
                            key={i}
                            onClick={() => setIdx(i)}
                            className={`w-28 shrink-0 aspect-video rounded overflow-hidden border transition-opacity cursor-pointer ${i === idx ? 'border-red-500 opacity-100' : 'border-slate-800 opacity-60 hover:opacity-100'}`}
                        >
                            <img src={`https://img.youtube.com/vi/${vid.video_id}/mqdefault.jpg`} alt={vid.name || `Video ${i + 1}`} className="w-full h-full object-cover" />
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}

function RatingBar({ label, value, color }: { label: string; value: number | null; color: string }) {
    if (!value) return null;
    return (
        <div className="space-y-1">
            <div className="flex justify-between text-xs">
                <span className="text-slate-400">{label}</span>
                <span className="font-bold">{Math.round(value)}</span>
            </div>
            <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                <div className={`h-full rounded-full ${color}`} style={{ width: `${value}%` }} />
            </div>
        </div>
    );
}

function StatusDropdown({ currentStatus, onStatusChange, isChanging }: {
    currentStatus: string;
    onStatusChange: (status: string) => void;
    isChanging: boolean;
}) {
    return (
        <CommonStatusDropdown
            entryId={0}
            currentStatus={currentStatus}
            onStatusChange={onStatusChange}
            isChanging={isChanging}
            size="md"
        />
    );
}

export default function GameDetail({ params }: { params: Promise<{ igdbId: string }> }) {
    const { igdbId } = use(params);
    const queryClient = useQueryClient();
    const router = useRouter();
    const [adding, setAdding] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [showAddStatusMenu, setShowAddStatusMenu] = useState(false);
    const addMenuRef = useRef<HTMLDivElement>(null);
    const [screenshotIdx, setScreenshotIdx] = useState(0);
    const [lightboxIdx, setLightboxIdx] = useState<number | null>(null);
    const [showCoverLightbox, setShowCoverLightbox] = useState(false);

    useEffect(() => {
        if (!showAddStatusMenu) return;
        const handler = (e: MouseEvent) => {
            if (addMenuRef.current && !addMenuRef.current.contains(e.target as Node)) {
                setShowAddStatusMenu(false);
            }
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, [showAddStatusMenu]);

    const { data: game, isLoading, error } = useQuery({
        queryKey: ['game', igdbId],
        queryFn: async () => {
            const res = await fetch(`/api/games/${igdbId}`);
            if (!res.ok) throw new Error('Failed to fetch game details');
            return res.json();
        },
    });

    const { data: userLibrary } = useQuery({
        queryKey: ['library'],
        queryFn: async () => {
            const res = await fetch('/api/library');
            if (!res.ok) return [];
            return res.json();
        },
    });

    type LibraryEntryRow = {
        id: number;
        gameId: number;
        status: string;
        lastPlayedAt?: string | null;
        updatedAt?: string | null;
        personalScore?: number | string | null;
        isFavorite?: boolean;
    };
    const libraryEntry = userLibrary?.find(
        (entry: LibraryEntryRow) => entry.gameId === parseInt(igdbId, 10),
    ) as LibraryEntryRow | undefined;

    const { updateStatus, toggleFavorite, updatePersonalScore, removeGame } = useLibraryMutations();

    const addMutation = useMutation({
        mutationFn: async (status: string) => {
            setAdding(true);
            const res = await fetch('/api/library', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ igdbId: parseInt(igdbId), status }),
            });
            if (!res.ok) throw new Error('Failed to add to library');
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['library'] });
            setAdding(false);
            setShowAddStatusMenu(false);
        },
        onError: () => setAdding(false),
    });

    if (isLoading) {
        return <LoadingState />;
    }

    if (error || !game) {
        return (
            <div className="text-center py-20 space-y-4">
                <p className="text-red-400">Error al cargar los detalles del juego.</p>
                <button
                    onClick={() => router.back()}
                    className="inline-flex items-center gap-2 text-blue-400 font-medium hover:underline cursor-pointer"
                >
                    <ChevronLeft className="w-4 h-4" /> Volver
                </button>
            </div>
        );
    }

    const raw = game.rawData || {};
    const screenshots = raw.screenshots || [];
    const videos = raw.videos || [];
    const websites = raw.websites || [];
    const officialSite = websites.find((w: { category: number }) => w.category === 1);

    return (
        <div className="container mx-auto max-w-6xl py-6 space-y-10 px-4 sm:px-6">
            {/* BACK */}
            <button
                onClick={() => router.back()}
                className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-blue-400 transition-colors cursor-pointer"
            >
                <ChevronLeft className="w-4 h-4" /> Volver
            </button>

            {/* HERO */}
            <section className="flex flex-col md:flex-row gap-8">
                <div className="w-64 shrink-0 mx-auto md:mx-0">
                    <div className="relative w-full">
                        {game.coverUrl ? (
                            <img
                                src={game.coverUrl}
                                alt={game.title}
                                className="w-full cursor-pointer rounded-2xl shadow-2xl border border-slate-800"
                                onClick={() => setShowCoverLightbox(true)}
                                title="Ampliar portada"
                            />
                        ) : (
                            <div className="w-full aspect-3/4 bg-slate-900 rounded-2xl flex items-center justify-center border border-slate-800 italic text-slate-500">
                                Sin imagen
                            </div>
                        )}
                        {libraryEntry && (
                            <button
                                type="button"
                                onClick={() =>
                                    toggleFavorite.mutate({
                                        id: libraryEntry.id,
                                        isFavorite: !(libraryEntry.isFavorite ?? false),
                                    })
                                }
                                disabled={toggleFavorite.isPending}
                                className="absolute top-2 right-2 z-10 p-2 rounded-lg bg-black/50 hover:bg-black/60 transition-colors disabled:opacity-50"
                                title={libraryEntry.isFavorite ? 'Quitar de favoritos' : 'Marcar como favorito'}
                            >
                                <Bookmark
                                    className={`w-4 h-4 ${libraryEntry.isFavorite ? 'fill-yellow-400 text-yellow-400' : 'text-slate-300 hover:text-yellow-400'}`}
                                />
                            </button>
                        )}
                    </div>
                    <div className="flex flex-wrap gap-3 pt-2">
                        {libraryEntry ? (
                            <div className="flex flex-col gap-2 w-full">
                                <div className="flex items-center gap-2 w-full">
                                    <StatusDropdown
                                        currentStatus={libraryEntry.status}
                                        onStatusChange={(status) => updateStatus.mutate({ id: libraryEntry.id, status })}
                                        isChanging={updateStatus.isPending}
                                    />
                                    <button
                                        onClick={() => setShowDeleteModal(true)}
                                        className="cursor-pointer w-10 h-10 rounded-lg font-bold border border-red-600/30 bg-red-600/10 text-red-500 hover:bg-red-600/20 transition-colors flex items-center justify-center shrink-0"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                                <div className="flex flex-col gap-0.5 text-xs text-slate-500">
                                    {libraryEntry.lastPlayedAt && (
                                        <span>
                                            Última vez jugado:{' '}
                                            {new Date(libraryEntry.lastPlayedAt).toLocaleDateString('es-ES', {
                                                day: 'numeric',
                                                month: 'short',
                                                year: 'numeric',
                                            })}
                                        </span>
                                    )}
                                    {libraryEntry.updatedAt && (
                                        <span>
                                            Ficha actualizada:{' '}
                                            {new Date(libraryEntry.updatedAt).toLocaleDateString('es-ES', {
                                                day: 'numeric',
                                                month: 'short',
                                                year: 'numeric',
                                            })}
                                        </span>
                                    )}
                                </div>
                            </div>
                        ) : (
                            <div ref={addMenuRef} className="relative w-full">
                                <button
                                    onClick={() => setShowAddStatusMenu(!showAddStatusMenu)}
                                    disabled={adding}
                                    className="w-full bg-blue-600 hover:bg-blue-500 disabled:bg-slate-800 disabled:text-slate-500 text-white px-6 py-2.5 rounded-xl font-bold transition-all flex items-center gap-2 justify-center text-sm"
                                >
                                    {adding ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                                    {adding ? 'Añadiendo...' : 'Añadir a mi lista'}
                                </button>
                                {showAddStatusMenu && !adding && (
                                    <div className="absolute top-full mt-2 left-0 right-0 bg-slate-900 border border-slate-700 rounded-lg shadow-xl py-1 z-50">
                                        {STATUS_OPTIONS.map((opt) => (
                                            <button
                                                key={opt.value}
                                                onClick={() => addMutation.mutate(opt.value)}
                                                className="w-full px-4 py-2.5 text-left text-sm hover:bg-slate-800 transition-colors text-slate-300"
                                            >
                                                {opt.label}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}
                        {officialSite && (
                            <a href={officialSite.url} target="_blank" rel="noopener noreferrer"
                                className="bg-slate-900 hover:bg-slate-800 text-slate-300 px-5 py-2.5 rounded-xl font-bold transition-all border border-slate-800 flex items-center gap-2 text-sm">
                                <Globe className="w-4 h-4" /> Sitio oficial
                            </a>
                        )}
                    </div>
                </div>
                <div className="grow space-y-5 min-w-0">
                    <div className="space-y-2">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                            <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight break-words">{game.title}</h1>
                            {libraryEntry && (libraryEntry.status === 'COMPLETED' || libraryEntry.status === 'FULL_COMPLETION') && (
                                <StarRating
                                    currentScore={
                                        libraryEntry.personalScore != null && libraryEntry.personalScore !== ''
                                            ? parseFloat(String(libraryEntry.personalScore))
                                            : null
                                    }
                                    onScoreChange={(score) => updatePersonalScore.mutate({ id: libraryEntry.id, personalScore: score })}
                                />
                            )}
                        </div>
                        <div className="flex flex-wrap items-center gap-3 text-sm text-slate-400">
                            {game.releaseYear && <span className="flex items-center gap-1.5"><Calendar className="w-4 h-4 text-slate-500" />{game.releaseYear}</span>}
                            {game.developer && <span className="flex items-center gap-1.5"><Building2 className="w-4 h-4 text-slate-500" />{game.developer}</span>}
                            {game.publisher && game.publisher !== game.developer && <span className="flex items-center gap-1.5"><Globe className="w-4 h-4 text-slate-500" />{game.publisher}</span>}
                        </div>
                        {raw.genres && (
                            <div className="flex flex-wrap gap-2 pt-1">
                                {raw.genres.map((g: { name: string }, i: number) => (
                                    <span key={i} className="px-2.5 py-0.5 bg-slate-800 border border-slate-700 rounded-full text-xs font-medium text-slate-300">{g.name}</span>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* RATINGS */}
                    <div className="grid grid-cols-3 gap-4 max-w-sm">
                        <RatingBar label="Total" value={game.avgRating} color="bg-blue-500" />
                        <RatingBar label="Usuarios" value={game.userRating} color="bg-green-500" />
                        <RatingBar label="Críticas" value={game.criticRating} color="bg-yellow-500" />
                    </div>

                    {/* TIME TO BEAT */}
                    {game.timeToBeat && (game.timeToBeat.normally || game.timeToBeat.completely || game.timeToBeat.hastily) && (
                        <div className="flex flex-wrap gap-2 sm:gap-3 text-sm">
                            <div className="flex items-center gap-1.5 text-slate-400">
                                <Clock className="w-4 h-4 text-blue-400" />
                            </div>
                            {game.timeToBeat.hastily && (
                                <span className="px-2 sm:px-2.5 py-1 bg-slate-800 border border-slate-700 rounded-lg text-xs text-slate-300">
                                    Rápido: <span className="font-bold text-white">{game.timeToBeat.hastily}h</span>
                                </span>
                            )}
                            {game.timeToBeat.normally && (
                                <span className="px-2 sm:px-2.5 py-1 bg-slate-800 border border-slate-700 rounded-lg text-xs text-slate-300">
                                    Historia: <span className="font-bold text-white">{game.timeToBeat.normally}h</span>
                                </span>
                            )}
                            {game.timeToBeat.completely && (
                                <span className="px-2 sm:px-2.5 py-1 bg-slate-800 border border-slate-700 rounded-lg text-xs text-slate-300">
                                    Completo: <span className="font-bold text-white">{game.timeToBeat.completely}h</span>
                                </span>
                            )}
                        </div>
                    )}

                    {/* DESCRIPTION */}
                    <div className="space-y-2">
                        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400">Descripción</h3>
                        <p className="text-slate-300 leading-relaxed break-words">
                            {game.description || 'Sin resumen disponible.'}
                        </p>
                    </div>
                </div>
            </section>

            {/* INFO + STORYLINE */}
            <section className="grid grid-cols-1 gap-10">
                <div className="space-y-4">
                    <h2 className="text-sm font-bold border-l-4 border-blue-500 pl-4 uppercase tracking-wider">Información</h2>
                    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3 text-sm">
                        {raw.platforms && raw.platforms.length > 0 && (
                            <InfoRow
                                label="Plataformas"
                                value={
                                    <div className="flex flex-wrap gap-1.5 sm:justify-end">
                                        {raw.platforms.map((p: { name: string; abbreviation?: string }, i: number) => (
                                            <span key={i} className="px-2 py-0.5 bg-slate-800 border border-slate-700 rounded text-xs font-medium text-slate-300">
                                                {p.name || p.abbreviation}
                                            </span>
                                        ))}
                                    </div>
                                }
                            />
                        )}
                        <InfoRow label="Modos de juego" value={raw.game_modes?.map((gm: { name: string }) => gm.name).join(', ')} />
                        <InfoRow label="Perspectiva" value={raw.player_perspectives?.map((pp: { name: string }) => pp.name).join(', ')} />
                        <InfoRow label="Temas" value={raw.themes?.map((t: { name: string }) => t.name).join(', ')} />
                        <InfoRow label="Motor" value={raw.game_engines?.map((e: { name: string }) => e.name).join(', ')} />
                        <InfoRow label="Franquicia" value={raw.franchises?.map((f: { name: string }) => f.name).join(', ')} />
                        <InfoRow label="Desarrollador" value={game.developer} />
                        <InfoRow label="Editor" value={game.publisher} last />
                    </div>
                </div>

                {game.storyline && game.storyline !== game.description && (
                    <div className="space-y-4">
                        <h2 className="text-sm font-bold border-l-4 border-purple-500 pl-4 uppercase tracking-wider">Historia</h2>
                        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
                            <p className="text-slate-300 text-sm leading-relaxed break-words">{game.storyline}</p>
                        </div>
                    </div>
                )}
            </section>

            {/* SCREENSHOTS */}
            {screenshots.length > 0 && (
                <section className="space-y-4">
                    <h2 className="text-sm font-bold border-l-4 border-blue-500 pl-4 uppercase tracking-wider">Capturas de pantalla</h2>
                    <ScreenshotCarousel screenshots={screenshots} idx={screenshotIdx} setIdx={setScreenshotIdx} onImageClick={(i) => setLightboxIdx(i)} />
                    {screenshots.length > 1 && (
                        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                            {screenshots.map((s: { image_id: string }, i: number) => (
                                <button
                                    key={i}
                                    onClick={() => setScreenshotIdx(i)}
                                    className={`w-24 shrink-0 aspect-video rounded overflow-hidden border transition-opacity cursor-pointer ${i === screenshotIdx ? 'border-blue-500 opacity-100' : 'border-slate-800 opacity-60 hover:opacity-100'}`}
                                >
                                    <img src={`https://images.igdb.com/igdb/image/upload/t_screenshot_med/${s.image_id}.jpg`} alt={`Thumb ${i + 1}`} className="w-full h-full object-cover" />
                                </button>
                            ))}
                        </div>
                    )}
                </section>
            )}

            {/* VIDEOS */}
            {videos.length > 0 && (
                <section className="space-y-4">
                    <h2 className="text-sm font-bold border-l-4 border-red-500 pl-4 uppercase tracking-wider">Vídeos</h2>
                    <VideoCarousel videos={videos} />
                </section>
            )}

            {/* SIMILAR GAMES */}
            {raw.similar_games && raw.similar_games.length > 0 && (
                <SimilarGamesCarousel games={raw.similar_games} />
            )}

            {lightboxIdx !== null && screenshots.length > 0 && (
                <ImageLightbox images={screenshots} initialIdx={lightboxIdx} onClose={() => setLightboxIdx(null)} />
            )}
            {showCoverLightbox && game.coverUrl && (
                (() => {
                    const igdbMatch = game.coverUrl.match(/\/([a-zA-Z0-9]+)\.(jpg|png|jpeg|webp)$/);
                    const image_id = igdbMatch ? igdbMatch[1] : null;
                    return image_id ? (
                        <ImageLightbox
                            images={[{ image_id }]}
                            initialIdx={0}
                            onClose={() => setShowCoverLightbox(false)}
                        />
                    ) : (
                        <div className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center" onClick={() => setShowCoverLightbox(false)}>
                            <button onClick={() => setShowCoverLightbox(false)} className="absolute top-4 right-4 p-2 text-white/70 hover:text-white z-10">
                                <X className="w-8 h-8" />
                            </button>
                            <div className="relative w-full h-full flex items-center justify-center p-4" onClick={e => e.stopPropagation()}>
                                <img src={game.coverUrl} alt={game.title} className="max-w-full max-h-full object-contain" />
                            </div>
                        </div>
                    );
                })()
            )}

            <ConfirmModal
                isOpen={showDeleteModal}
                onClose={() => setShowDeleteModal(false)}
                onConfirm={() => { if (libraryEntry) removeGame.mutate(libraryEntry.id); }}
                title="Eliminar juego"
                message="¿Quieres eliminar este juego de tu biblioteca?"
            />
        </div>
    );
}

type SimilarGameIgdb = {
    id: number;
    name?: string;
    cover?: string | { image_id: string } | null;
};

function coverUrlFromIgdb(cover: SimilarGameIgdb['cover']): string | null {
    if (cover == null) return null;
    if (typeof cover === 'string') return cover;
    return `https://images.igdb.com/igdb/image/upload/t_cover_big/${cover.image_id}.jpg`;
}

function SimilarGamesCarousel({ games }: { games: SimilarGameIgdb[] }) {
    const scrollRef = useRef<HTMLDivElement>(null);
    const [canScrollLeft, setCanScrollLeft] = useState(false);
    const [canScrollRight, setCanScrollRight] = useState(false);

    const checkScroll = () => {
        const el = scrollRef.current;
        if (!el) return;
        setCanScrollLeft(el.scrollLeft > 0);
        setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
    };

    useEffect(() => {
        checkScroll();
        const el = scrollRef.current;
        if (el) el.addEventListener('scroll', checkScroll, { passive: true });
        return () => el?.removeEventListener('scroll', checkScroll);
    }, [games]);

    const scroll = (dir: 'left' | 'right') => {
        const el = scrollRef.current;
        if (!el) return;
        el.scrollBy({ left: dir === 'left' ? -300 : 300, behavior: 'smooth' });
    };

    return (
        <section className="space-y-4">
            <h2 className="text-sm font-bold border-l-4 border-yellow-500 pl-4 uppercase tracking-wider">Juegos Similares</h2>
            <div className="relative group/row">
                {canScrollLeft && (
                    <button onClick={() => scroll('left')} className="absolute left-0 top-0 bottom-8 z-10 w-10 flex items-center justify-center bg-linear-to-r from-slate-950/90 to-transparent opacity-0 group-hover/row:opacity-100 transition-opacity">
                        <ChevronLeft className="w-6 h-6" />
                    </button>
                )}
                <div ref={scrollRef} className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide scroll-smooth">
                    {games.map((sg) => (
                        <GameCard key={sg.id} game={{ title: sg?.name, igdbId: sg.id, cover: coverUrlFromIgdb(sg.cover) }} />
                    ))}
                </div>
                {canScrollRight && (
                    <button onClick={() => scroll('right')} className="absolute right-0 top-0 bottom-8 z-10 w-10 flex items-center justify-center bg-linear-to-l from-slate-950/90 to-transparent opacity-0 group-hover/row:opacity-100 transition-opacity">
                        <ChevronRight className="w-6 h-6" />
                    </button>
                )}
            </div>
        </section>
    );
}

function InfoRow({ label, value, last }: { label: string; value?: string | React.ReactNode | null; last?: boolean }) {
    return (
        <div className={`flex flex-col sm:flex-row sm:justify-between sm:items-start gap-1 ${last ? '' : 'pb-3 border-b border-slate-800/50'}`}>
            <span className="text-slate-500 font-medium shrink-0">{label}</span>
            <div className="text-white font-bold sm:text-right break-words min-w-0">
                {value || '—'}
            </div>
        </div>
    );
}
