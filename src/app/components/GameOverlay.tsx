'use client';

import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import { X, Plus, Check, ChevronDown, Trash2, Loader2, ChevronLeft, ChevronRight, Play } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useGameOverlay } from '@/hooks/useGameOverlay';
import { useLibraryMutations } from '@/hooks/useLibraryMutations';
import { useEscapeKey } from '@/hooks/useEscapeKey';
import { useCarouselTransition } from '@/hooks/useCarouselTransition';
import { RatingBubble } from '@/components/RatingBubble';
import { STATUS_OPTIONS, STATUS_MAP } from '@/lib/constants';
import { GameCard } from './GameCard';
import { StarRating } from './StarRating';

function ScoreItem({ score, label }: { score: number | null; label: string }) {
  return (
    <div className="flex flex-col items-center gap-[6px]">
      <RatingBubble rating={score} size={44} showEmpty />
      <span className="text-[var(--t-xs)] text-[var(--fg-3)] uppercase tracking-[0.06em] font-medium">{label}</span>
    </div>
  );
}

function ImageLightbox({
  screenshots, initialIdx, onClose,
}: {
  screenshots: { image_id: string }[];
  initialIdx: number;
  onClose: () => void;
}) {
  const [idx, setIdx] = useState(initialIdx);
  const { isTransitioning, transition } = useCarouselTransition();

  const go = (newIdx: number) => transition(() => setIdx(newIdx));

  // Capture phase so Escape closes the lightbox, not the parent overlay
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { e.stopPropagation(); onClose(); }
      else if (e.key === 'ArrowLeft') setIdx(p => p === 0 ? screenshots.length - 1 : p - 1);
      else if (e.key === 'ArrowRight') setIdx(p => p === screenshots.length - 1 ? 0 : p + 1);
    };
    document.addEventListener('keydown', handler, true);
    return () => document.removeEventListener('keydown', handler, true);
  }, [onClose, screenshots.length]);

  return (
    <div
      className="fixed inset-0 bg-black/95 flex items-center justify-center"
      style={{ zIndex: 500 }}
      onClick={onClose}
    >
      <button
        onClick={onClose}
        className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/10 border-0 text-white cursor-pointer flex items-center justify-center hover:bg-white/20"
        style={{ zIndex: 501 }}
      >
        <X size={18} />
      </button>
      <div className="relative w-full h-full flex items-center justify-center p-4 md:p-14" onClick={(e) => e.stopPropagation()}>
        <img
          src={`https://images.igdb.com/igdb/image/upload/t_screenshot_huge/${screenshots[idx].image_id}.jpg`}
          alt={`Screenshot ${idx + 1}`}
          className={`max-w-full max-h-full object-contain transition-opacity duration-200 ${isTransitioning ? 'opacity-0' : 'opacity-100'}`}
        />
        {screenshots.length > 1 && (
          <>
            <button onClick={() => go(idx === 0 ? screenshots.length - 1 : idx - 1)} className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/60 border-0 text-white cursor-pointer flex items-center justify-center hover:bg-black/80">
              <ChevronLeft size={20} />
            </button>
            <button onClick={() => go(idx === screenshots.length - 1 ? 0 : idx + 1)} className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/60 border-0 text-white cursor-pointer flex items-center justify-center hover:bg-black/80">
              <ChevronRight size={20} />
            </button>
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white/60 text-sm mono">{idx + 1} / {screenshots.length}</div>
          </>
        )}
      </div>
    </div>
  );
}

function VideoLightbox({ video, onClose }: { video: { video_id: string; name?: string }; onClose: () => void }) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') { e.stopPropagation(); onClose(); } };
    document.addEventListener('keydown', handler, true);
    return () => document.removeEventListener('keydown', handler, true);
  }, [onClose]);

  return (
    <div className="fixed inset-0 bg-black/95 flex items-center justify-center" style={{ zIndex: 500 }} onClick={onClose}>
      <button onClick={onClose} className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/10 border-0 text-white cursor-pointer flex items-center justify-center hover:bg-white/20" style={{ zIndex: 501 }}>
        <X size={18} />
      </button>
      <div className="w-full max-w-5xl px-4" style={{ aspectRatio: '16/9' }} onClick={(e) => e.stopPropagation()}>
        <iframe
          src={`https://www.youtube.com/embed/${video.video_id}?autoplay=1`}
          title={video.name || 'Video'}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className="w-full h-full border-0 rounded-[var(--r-lg)]"
        />
      </div>
    </div>
  );
}

function ScreenshotStrip({ screenshots }: { screenshots: { image_id: string }[] }) {
  const [idx, setIdx] = useState(0);
  const [lightboxIdx, setLightboxIdx] = useState<number | null>(null);
  const { isTransitioning, transition } = useCarouselTransition(180);
  if (!screenshots?.length) return null;

  const go = (newIdx: number) => transition(() => setIdx(newIdx));

  return (
    <div>
      <div
        className="relative aspect-video rounded-[var(--r-lg)] overflow-hidden bg-[var(--bg-2)] cursor-zoom-in"
        onClick={() => setLightboxIdx(idx)}
      >
        <img
          src={`https://images.igdb.com/igdb/image/upload/t_screenshot_huge/${screenshots[idx].image_id}.jpg`}
          alt={`Screenshot ${idx + 1}`}
          className={`w-full h-full object-cover transition-opacity duration-[180ms] ${isTransitioning ? 'opacity-0' : 'opacity-100'}`}
        />
        {screenshots.length > 1 && (
          <>
            <button
              onClick={(e) => { e.stopPropagation(); go(idx === 0 ? screenshots.length - 1 : idx - 1); }}
              className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/60 border-0 text-white cursor-pointer flex items-center justify-center"
            >
              <ChevronLeft size={16} />
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); go(idx === screenshots.length - 1 ? 0 : idx + 1); }}
              className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/60 border-0 text-white cursor-pointer flex items-center justify-center"
            >
              <ChevronRight size={16} />
            </button>
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
              {screenshots.map((_, i) => (
                <button
                  key={i}
                  onClick={(e) => { e.stopPropagation(); go(i); }}
                  className={`w-1.5 h-1.5 rounded-full border-0 cursor-pointer p-0 ${i === idx ? 'bg-white' : 'bg-white/35'}`}
                />
              ))}
            </div>
          </>
        )}
      </div>

      {/* Thumbnails — click to navigate and open lightbox */}
      {screenshots.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pt-2 pb-1">
          {screenshots.slice(0, 8).map((s, i) => (
            <div
              key={i}
              onClick={() => { go(i); setLightboxIdx(i); }}
              className={`w-20 aspect-video rounded-[6px] overflow-hidden shrink-0 cursor-pointer transition-opacity ${i === idx ? 'opacity-100 outline outline-1 outline-white/50' : 'opacity-50 hover:opacity-80'}`}
            >
              <img src={`https://images.igdb.com/igdb/image/upload/t_screenshot_med/${s.image_id}.jpg`} alt="" className="w-full h-full object-cover" />
            </div>
          ))}
        </div>
      )}

      {lightboxIdx !== null && (
        <ImageLightbox screenshots={screenshots} initialIdx={lightboxIdx} onClose={() => setLightboxIdx(null)} />
      )}
    </div>
  );
}

function VideoStrip({ videos }: { videos: { video_id: string; name?: string }[] }) {
  const [idx, setIdx] = useState(0);
  const [lightboxIdx, setLightboxIdx] = useState<number | null>(null);
  if (!videos?.length) return null;

  const v = videos[idx];

  return (
    <div>
      {/* Main video thumbnail */}
      <div
        className="relative aspect-video rounded-[var(--r-lg)] overflow-hidden bg-[var(--bg-2)] cursor-pointer"
        onClick={() => setLightboxIdx(idx)}
      >
        <img
          src={`https://img.youtube.com/vi/${v.video_id}/hqdefault.jpg`}
          alt={v.name || `Video ${idx + 1}`}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 flex items-center justify-center bg-black/30 hover:bg-black/45 transition-colors">
          <div className="w-14 h-14 rounded-full bg-[#e00] flex items-center justify-center">
            <Play size={24} fill="#fff" color="#fff" className="ml-[3px]" />
          </div>
        </div>
        {videos.length > 1 && (
          <>
            <button
              onClick={(e) => { e.stopPropagation(); setIdx(p => p === 0 ? videos.length - 1 : p - 1); }}
              className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/60 border-0 text-white cursor-pointer flex items-center justify-center"
            >
              <ChevronLeft size={16} />
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); setIdx(p => p === videos.length - 1 ? 0 : p + 1); }}
              className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/60 border-0 text-white cursor-pointer flex items-center justify-center"
            >
              <ChevronRight size={16} />
            </button>
          </>
        )}
      </div>

      {/* Video title */}
      {v.name && <p className="text-[var(--t-xs)] text-[var(--fg-3)] mt-[var(--s-2)]">{v.name}</p>}

      {/* Thumbnails */}
      {videos.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pt-2 pb-1">
          {videos.map((vid, i) => (
            <div
              key={i}
              onClick={() => { setIdx(i); setLightboxIdx(i); }}
              className={`w-20 aspect-video rounded-[6px] overflow-hidden shrink-0 cursor-pointer transition-opacity relative ${i === idx ? 'opacity-100 outline outline-1 outline-white/50' : 'opacity-50 hover:opacity-80'}`}
            >
              <img src={`https://img.youtube.com/vi/${vid.video_id}/hqdefault.jpg`} alt="" className="w-full h-full object-cover" />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-5 h-5 rounded-full bg-[#e00]/80 flex items-center justify-center">
                  <Play size={8} fill="#fff" color="#fff" className="ml-[1px]" />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {lightboxIdx !== null && (
        <VideoLightbox video={videos[lightboxIdx]} onClose={() => setLightboxIdx(null)} />
      )}
    </div>
  );
}

export function GameOverlay() {
  const { activeIgdbId, closeGame } = useGameOverlay();
  const queryClient = useQueryClient();
  const [statusOpen, setStatusOpen] = useState(false);
  const statusMenuRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const { data: game, isLoading } = useQuery({
    queryKey: ['game', activeIgdbId],
    queryFn: async () => {
      const res = await fetch(`/api/games/${activeIgdbId}`);
      if (!res.ok) throw new Error('Failed');
      return res.json();
    },
    enabled: !!activeIgdbId,
  });

  const { data: library } = useQuery({
    queryKey: ['library'],
    queryFn: async () => {
      const res = await fetch('/api/library');
      if (!res.ok) return [];
      return res.json();
    },
  });

  const libraryEntry = library?.find(
    (e: any) => e.gameId === parseInt(activeIgdbId ?? '', 10),
  );

  const { updateStatus, toggleFavorite, updatePersonalScore, removeGame } = useLibraryMutations();

  const addMutation = useMutation({
    mutationFn: async (status: string) => {
      const res = await fetch('/api/library', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ igdbId: parseInt(activeIgdbId ?? ''), status }),
      });
      if (!res.ok) throw new Error('Failed');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['library'] });
      setStatusOpen(false);
    },
  });

  useEscapeKey(closeGame, !!activeIgdbId);

  useEffect(() => {
    if (!activeIgdbId) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = prev; };
  }, [activeIgdbId]);

  useEffect(() => {
    if (!statusOpen) return;
    const handler = (e: MouseEvent) => {
      if (statusMenuRef.current && !statusMenuRef.current.contains(e.target as Node)) setStatusOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [statusOpen]);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = 0;
    setStatusOpen(false);
  }, [activeIgdbId]);

  if (!activeIgdbId) return null;

  const raw = game?.rawData ?? {};
  const screenshots: { image_id: string }[] = raw.screenshots ?? [];
  const videos: { video_id: string; name?: string }[] = raw.videos ?? [];
  const similarGames: any[] = raw.similar_games ?? [];
  const statusMeta = libraryEntry ? STATUS_MAP[libraryEntry.status] : null;
  const keyArtUrl = raw.artworks?.[0]?.image_id
    ? `https://images.igdb.com/igdb/image/upload/t_1080p/${raw.artworks[0].image_id}.jpg`
    : null;

  return (
    <div className="go-backdrop anim-fade" onClick={closeGame}>
      <div className="go-modal" onClick={(e) => e.stopPropagation()}>

        {/* Close button */}
        <button
          onClick={closeGame}
          className="absolute top-[var(--s-4)] right-[var(--s-4)] z-10 w-9 h-9 rounded-full p-0 bg-[rgba(20,18,28,0.7)] backdrop-blur-md border-[0.5px] border-white/10 text-[var(--fg-0)] cursor-pointer flex items-center justify-center"
        >
          <X size={16} />
        </button>

        {/* Scrollable body */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto">

          {isLoading ? (
            <div className="flex items-center justify-center h-[400px]">
              <Loader2 size={28} className="animate-spin text-[var(--accent)]" />
            </div>
          ) : game ? (
            <>
              {/* Hero */}
              <div className="go-hero">
                <div className="absolute inset-0 overflow-hidden">
                  {keyArtUrl ? (
                    <img src={keyArtUrl} alt="" className="w-full h-full object-cover opacity-85" />
                  ) : game.coverUrl ? (
                    <img src={game.coverUrl} alt="" className="w-full h-full object-cover scale-[1.2] blur-[28px] saturate-150 opacity-70" />
                  ) : null}
                </div>
                <div
                  className="absolute inset-0"
                  style={{
                    background: keyArtUrl
                      ? 'linear-gradient(180deg, rgba(0,0,0,0.15) 0%, rgba(0,0,0,0.4) 60%, var(--bg-0) 100%)'
                      : 'linear-gradient(180deg, rgba(0,0,0,0.2) 0%, var(--bg-0) 95%)',
                  }}
                />
              </div>

              {/* Cover + title row — overlaps hero */}
              <div className="go-pad relative">
                <div className="go-cover-row">
                  <div className="go-cover">
                    {game.coverUrl
                      ? <img src={game.coverUrl} alt={game.title} className="w-full h-full object-cover" />
                      : <div className="w-full h-full bg-[var(--bg-2)]" />
                    }
                  </div>

                  {/* Title + meta */}
                  <div className="pb-[var(--s-2)] min-w-0 flex-1">
                    {statusMeta && (
                      <span className={`st-pill ${statusMeta.cls}`} style={{ padding: '3px 9px' }}>
                        <span className="dot" />{statusMeta.label}
                      </span>
                    )}
                    <h1 className="display text-[clamp(20px,4cqw,40px)] leading-[1.05] mt-[var(--s-3)] break-words">
                      {game.title}
                    </h1>
                    <div className="flex items-center gap-[var(--s-2)] text-[var(--t-sm)] text-[var(--fg-2)] mt-[var(--s-2)] flex-wrap">
                      {game.releaseYear && <span className="mono">{game.releaseYear}</span>}
                      {game.releaseYear && game.developer && (
                        <span className="w-[3px] h-[3px] rounded-full bg-[var(--fg-3)] inline-block shrink-0" />
                      )}
                      {game.developer && (
                        <span className="overflow-hidden text-ellipsis whitespace-nowrap max-w-[20ch]">{game.developer}</span>
                      )}
                      {raw.platforms?.length > 0 && (
                        <span className="flex flex-wrap gap-[3px]">
                          {raw.platforms.slice(0, 3).map((p: any, i: number) => (
                            <span key={i} className="text-[10px] px-[5px] py-[2px] rounded-[4px] bg-white/[0.07] text-[var(--fg-2)] whitespace-nowrap">
                              {p.abbreviation || p.name}
                            </span>
                          ))}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="go-actions">
                  <div ref={statusMenuRef} className="relative">
                    <button
                      onClick={() => setStatusOpen(!statusOpen)}
                      className={`font-[inherit] text-[var(--t-sm)] font-semibold border-0 cursor-pointer px-[14px] py-[10px] rounded-[var(--r-md)] flex items-center gap-2 transition-all duration-[180ms] ${
                        libraryEntry
                          ? 'bg-[var(--accent)] text-[oklch(0.15_0.02_280)]'
                          : 'bg-white/10 text-[var(--fg-0)] hover:bg-white/[0.12]'
                      }`}
                    >
                      {libraryEntry ? (
                        <><Check size={13} strokeWidth={2.5} /><span className="max-w-[14ch] overflow-hidden text-ellipsis whitespace-nowrap">{statusMeta?.label ?? 'En catálogo'}</span></>
                      ) : (
                        <><Plus size={13} strokeWidth={2} /><span className="whitespace-nowrap">Añadir</span></>
                      )}
                      <ChevronDown size={11} />
                    </button>
                    {statusOpen && (
                      <>
                        <div className="fixed inset-0 z-[70]" onClick={() => setStatusOpen(false)} />
                        <div className="glass anim-in absolute top-[calc(100%_+_6px)] left-0 rounded-xl p-[6px] min-w-[190px] shadow-[var(--shadow-2)] z-[80]">
                          {STATUS_OPTIONS.map((opt) => {
                            const active = libraryEntry?.status === opt.value;
                            return (
                              <button
                                key={opt.value}
                                onClick={() => {
                                  if (libraryEntry) updateStatus.mutate({ id: libraryEntry.id, status: opt.value });
                                  else addMutation.mutate(opt.value);
                                  setStatusOpen(false);
                                }}
                                className={`flex items-center gap-[10px] w-full border-0 text-[var(--fg-0)] px-[10px] py-2 rounded-[7px] cursor-pointer font-[inherit] text-[var(--t-base)] ${active ? 'bg-white/[0.06]' : 'bg-transparent'}`}
                              >
                                <span className={`st-pill ${opt.cls}`} style={{ padding: '2px 4px', fontSize: 10 }}><span className="dot" /></span>
                                <span className="flex-1 text-left">{opt.label}</span>
                                {active && <Check size={13} />}
                              </button>
                            );
                          })}
                          {libraryEntry && (
                            <>
                              <div className="h-[1px] bg-[var(--line)] mx-[6px] my-[4px]" />
                              <button
                                onClick={() => { removeGame.mutate(libraryEntry.id); setStatusOpen(false); }}
                                className="flex items-center gap-[10px] w-full border-0 bg-transparent text-[oklch(0.74_0.16_25)] px-[10px] py-2 rounded-[7px] cursor-pointer font-[inherit] text-[var(--t-base)]"
                              >
                                <Trash2 size={13} /> Quitar
                              </button>
                            </>
                          )}
                        </div>
                      </>
                    )}
                  </div>

                  {/* Fav button */}
                  {libraryEntry && (
                    <button
                      onClick={() => toggleFavorite.mutate({ id: libraryEntry.id, isFavorite: !libraryEntry.isFavorite })}
                      disabled={toggleFavorite.isPending}
                      className={`w-10 h-10 rounded-full border-[0.5px] border-[var(--line-strong)] cursor-pointer flex items-center justify-center text-[18px] transition-all duration-[180ms] shrink-0 ${
                        libraryEntry.isFavorite
                          ? 'bg-[rgba(255,100,80,0.15)] text-[oklch(0.78_0.18_25)]'
                          : 'bg-white/[0.06] text-[var(--fg-1)]'
                      }`}
                    >
                      {libraryEntry.isFavorite ? '♥' : '♡'}
                    </button>
                  )}

                </div>

                {/* Scores */}
                {(game.avgRating || game.userRating || game.criticRating) && (
                  <div className="flex gap-[var(--s-5)] mt-[var(--s-4)] flex-wrap">
                    <ScoreItem score={game.userRating} label="Usuarios" />
                    <ScoreItem score={game.criticRating} label="Crítica" />
                    <ScoreItem score={game.avgRating} label="Media" />
                  </div>
                )}

                {/* Time to beat */}
                {game.timeToBeat && (game.timeToBeat.hastily != null || game.timeToBeat.normally != null || game.timeToBeat.completely != null) && (
                  <div className="mt-[var(--s-3)] flex items-center gap-[var(--s-6)] flex-wrap">
                    <div className="flex gap-[var(--s-5)]">
                      {game.timeToBeat.hastily != null && (
                        <div className="flex flex-col">
                          <span className="mono text-[var(--fg-1)] text-[var(--t-sm)] font-medium">{game.timeToBeat.hastily}h</span>
                          <span className="text-[10px] text-[var(--fg-3)]">Rápido</span>
                        </div>
                      )}
                      {game.timeToBeat.normally != null && (
                        <div className="flex flex-col">
                          <span className="mono text-[var(--fg-1)] text-[var(--t-sm)] font-medium">{game.timeToBeat.normally}h</span>
                          <span className="text-[10px] text-[var(--fg-3)]">Normal</span>
                        </div>
                      )}
                      {game.timeToBeat.completely != null && (
                        <div className="flex flex-col">
                          <span className="mono text-[var(--fg-1)] text-[var(--t-sm)] font-medium">{game.timeToBeat.completely}h</span>
                          <span className="text-[10px] text-[var(--fg-3)]">100%</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Personal rating (completed games) */}
                {libraryEntry && (libraryEntry.status === 'COMPLETED' || libraryEntry.status === 'FULL_COMPLETION') && (
                  <div className="mt-[var(--s-4)] p-[var(--s-4)] rounded-[var(--r-md)] bg-white/[0.03] border-[0.5px] border-[var(--line)]">
                    <div className="flex items-start justify-between gap-[var(--s-4)] flex-wrap">
                      <div>
                        <div className="text-[var(--t-xs)] text-[var(--fg-2)] uppercase tracking-[0.08em] font-medium">Tu nota personal</div>
                        <div className="text-[var(--t-sm)] text-[var(--fg-3)] mt-[2px]">Aporta tu valoración del juego</div>
                      </div>
                      <StarRating
                        currentScore={libraryEntry.personalScore != null && libraryEntry.personalScore !== '' ? parseFloat(String(libraryEntry.personalScore)) : null}
                        onScoreChange={(score) => updatePersonalScore.mutate({ id: libraryEntry.id, personalScore: score })}
                      />
                    </div>
                  </div>
                )}

                {/* Body: description + meta card */}
                <div className="go-body-grid">
                  <div>
                    <p className="text-[var(--fg-1)] text-[var(--t-md)] leading-[1.6]">
                      {game.description || 'Sin descripción disponible.'}
                    </p>
                    {game.storyline && game.storyline !== game.description && (
                      <>
                        <h3 className="text-[var(--t-xs)] text-[var(--fg-2)] uppercase tracking-[0.1em] font-medium mt-[var(--s-5)] mb-[var(--s-2)]">Historia</h3>
                        <p className="text-[var(--fg-1)] text-[var(--t-md)] leading-[1.55]">{game.storyline}</p>
                      </>
                    )}
                  </div>
                  <div className="glass p-[var(--s-4)] rounded-[var(--r-md)] h-fit">
                    {raw.genres?.length > 0 && <MetaRow label="Géneros" value={raw.genres.map((g: any) => g.name).join(' · ')} />}
                    {game.developer && <MetaRow label="Desarrollador" value={game.developer} />}
                    {game.publisher && game.publisher !== game.developer && <MetaRow label="Editor" value={game.publisher} />}
                    {raw.game_engines?.length > 0 && <MetaRow label="Motor" value={raw.game_engines.map((e: any) => e.name).join(', ')} />}
                    {raw.game_modes?.length > 0 && <MetaRow label="Modo" value={raw.game_modes.map((m: any) => m.name).join(', ')} />}
                    {raw.player_perspectives?.length > 0 && <MetaRow label="Perspectiva" value={raw.player_perspectives.map((p: any) => p.name).join(', ')} />}
                    {raw.themes?.length > 0 && <MetaRow label="Temas" value={raw.themes.map((t: any) => t.name).join(', ')} />}
                    {raw.platforms?.length > 0 && (
                      <MetaRow label="Plataformas" value={raw.platforms.map((p: any) => p.abbreviation || p.name).join(' · ')} last />
                    )}
                  </div>
                </div>

                {/* Screenshots */}
                {screenshots.length > 0 && (
                  <div className="mt-[var(--s-7)]">
                    <h3 className="text-[var(--t-md)] font-semibold mb-[var(--s-3)]">Capturas</h3>
                    <ScreenshotStrip screenshots={screenshots} />
                  </div>
                )}

                {/* Videos */}
                {videos.length > 0 && (
                  <div className="mt-[var(--s-7)]">
                    <h3 className="text-[var(--t-md)] font-semibold mb-[var(--s-3)]">Vídeos</h3>
                    <VideoStrip videos={videos} />
                  </div>
                )}

                {/* Similar games */}
                {similarGames.length > 0 && (
                  <div className="mt-[var(--s-7)]">
                    <h3 className="text-[var(--t-md)] font-semibold mb-[var(--s-3)]">Similares</h3>
                    <div className="flex gap-3 overflow-x-auto pb-1">
                      {similarGames.slice(0, 8).map((sg: any) => (
                        <GameCard
                          key={sg.id}
                          game={{
                            igdbId: sg.id,
                            title: sg.name,
                            cover: sg.cover ? (typeof sg.cover === 'string' ? sg.cover : `https://images.igdb.com/igdb/image/upload/t_cover_big/${sg.cover.image_id}.jpg`) : null,
                          }}
                          variant="classic"
                          width={110}
                        />
                      ))}
                    </div>
                  </div>
                )}

                <div className="h-[var(--s-8)]" />
              </div>
            </>
          ) : (
            <div className="flex items-center justify-center h-[400px] text-[var(--fg-2)]">
              Error al cargar el juego.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function MetaRow({ label, value, last }: { label: string; value?: string | null; last?: boolean }) {
  if (!value) return null;
  return (
    <div className={`flex flex-col gap-[2px] ${!last ? 'pb-[var(--s-3)] mb-[var(--s-3)] [border-bottom:0.5px_solid_var(--line)]' : ''}`}>
      <span className="text-[var(--t-xs)] text-[var(--fg-3)] uppercase tracking-[0.06em] font-medium">{label}</span>
      <span className="text-[var(--t-sm)] text-[var(--fg-1)] leading-[1.4]">{value}</span>
    </div>
  );
}
