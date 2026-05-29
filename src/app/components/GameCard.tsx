'use client';

import { Check, Loader2, Plus, Heart, Trash2 } from 'lucide-react';
import { useRef, useState, useEffect } from 'react';
import { openGame } from '@/hooks/useGameOverlay';
import { useEscapeKey } from '@/hooks/useEscapeKey';
import { RatingBubble } from '@/components/RatingBubble';
import { STATUS_OPTIONS, STATUS_MAP } from '@/lib/constants';

// Singleton: only one status menu can be open at a time across all GameCards.
// A CSS-transform ancestor (dnd-kit) breaks position:fixed backdrops, so we
// enforce exclusivity in JS instead of relying on a DOM overlay.
let closeActiveMenu: (() => void) | null = null;

export interface Game {
  cover: string | null;
  developer?: string | null;
  genres?: string[];
  hypes?: number;
  id?: number;
  igdbId: number | undefined;
  isFavorite?: boolean;
  name?: string;
  platforms?: Array<{ name?: string; abbreviation?: string; platform_logo?: { image_id: string } }>;
  personalScore?: number | string | null;
  rating?: number | null;
  releaseDate?: string | null;
  artworks?: Array<{ image_id: string }>;
  screenshots?: Array<{ image_id: string }>;
  status?: string | null;
  title?: string;
  year?: number | null;
}

type GameCardProps = {
  game: Game;
  inLibrary?: boolean;
  isAdding?: boolean;
  isDeleting?: boolean;
  onAdd?: (status: string) => void;
  onDelete?: () => void;
  onToggleFav?: () => void;
  variant?: 'cinematic' | 'classic' | 'editorial';
  width?: number | string;
};

function PlatformBadge({ name }: { name: string }) {
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
      fontSize: 10, fontWeight: 600, letterSpacing: '-0.01em',
      padding: '2px 5px', borderRadius: 4,
      background: 'rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.85)',
    }}>{name}</span>
  );
}

function PlatformList({ platforms, max = 2 }: { platforms: Game['platforms']; max?: number }) {
  if (!platforms || platforms.length === 0) return null;
  const shown = platforms.slice(0, max);
  const extra = platforms.length - max;
  return (
    <span style={{ display: 'inline-flex', gap: 3, alignItems: 'center', flexWrap: 'nowrap' }}>
      {shown.map((p, i) => <PlatformBadge key={i} name={p.abbreviation || p.name || ''} />)}
      {extra > 0 && (
        <span style={{
          fontSize: 10, fontWeight: 600, padding: '2px 5px', borderRadius: 4,
          background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.6)',
        }}>+{extra}</span>
      )}
    </span>
  );
}

function StatusMenu({
  current, onSelect, onDelete, onClose, top, right,
}: {
  current?: string | null;
  onSelect: (s: string) => void;
  onDelete?: () => void;
  onClose: () => void;
  top: number;
  right: number;
}) {
  useEscapeKey(onClose);

  return (
    <div
      className="glass anim-in"
      style={{
        position: 'fixed', top, right,
        borderRadius: 12, padding: 6, minWidth: 180,
        boxShadow: 'var(--shadow-2)', zIndex: 300, fontSize: 13,
      }}
      onClick={(e) => e.stopPropagation()}
    >
      {STATUS_OPTIONS.map((opt) => {
        const active = current === opt.value;
        return (
          <button
            key={opt.value}
            onClick={() => { onSelect(opt.value); onClose(); }}
            style={{
              display: 'flex', alignItems: 'center', gap: 10, width: '100%',
              border: 0, background: active ? 'rgba(255,255,255,0.06)' : 'transparent',
              color: 'var(--fg-0)', padding: '8px 10px', borderRadius: 7,
              cursor: 'pointer', textAlign: 'left', fontFamily: 'inherit', fontSize: 'inherit',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.08)')}
            onMouseLeave={(e) => (e.currentTarget.style.background = active ? 'rgba(255,255,255,0.06)' : 'transparent')}
          >
            <span className={`st-pill ${opt.cls}`} style={{ padding: '2px 4px', fontSize: 10 }}>
              <span className="dot" />
            </span>
            <span style={{ flex: 1 }}>{opt.label}</span>
            {active && <Check size={14} />}
          </button>
        );
      })}
      {onDelete && (
        <>
          <div style={{ height: 1, background: 'var(--line)', margin: '4px 6px' }} />
          <button
            onClick={() => { onDelete(); onClose(); }}
            style={{
              display: 'flex', alignItems: 'center', gap: 10, width: '100%',
              border: 0, background: 'transparent', color: 'oklch(0.74 0.16 25)',
              padding: '8px 10px', borderRadius: 7, cursor: 'pointer',
              textAlign: 'left', fontFamily: 'inherit', fontSize: 'inherit',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255,100,100,0.08)')}
            onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
          >
            <Trash2 size={13} />
            Quitar del catálogo
          </button>
        </>
      )}
    </div>
  );
}

export function GameCard({
  game,
  inLibrary,
  isAdding,
  onAdd,
  onDelete,
  onToggleFav,
  variant = 'cinematic',
  width = 154,
}: GameCardProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const [menuPos, setMenuPos] = useState({ top: 0, right: 0 });

  const closeMenu = () => {
    setMenuOpen(false);
    if (closeActiveMenu === closeMenu) closeActiveMenu = null;
  };

  const openMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    // Close any other card's menu that may be open
    if (closeActiveMenu && closeActiveMenu !== closeMenu) {
      closeActiveMenu();
    }
    if (menuOpen) {
      closeMenu();
    } else {
      const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
      setMenuPos({ top: rect.bottom + 6, right: window.innerWidth - rect.right });
      setMenuOpen(true);
      closeActiveMenu = closeMenu;
    }
  };

  // Clear singleton reference if this card unmounts while its menu is open
  useEffect(() => () => {
    if (closeActiveMenu === closeMenu) closeActiveMenu = null;
  }, []);

  const statusMeta = game.status ? STATUS_MAP[game.status] : null;
  const displayYear = game.year ?? (game.releaseDate ? new Date(game.releaseDate).getFullYear() : null);
  const parsedPersonal = game.personalScore != null ? parseFloat(String(game.personalScore)) : null;
  const displayRating = parsedPersonal != null ? parsedPersonal * 10 : (game.rating ?? null);

  if (variant === 'editorial') {
    return (
      <div
        className="glass"
        style={{
          width, padding: 10, borderRadius: 14,
          display: 'flex', gap: 12, cursor: 'pointer',
          transition: 'all 0.18s', position: 'relative',
        }}
        onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.07)')}
        onMouseLeave={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.04)')}
      >
        <div onClick={() => openGame(game.igdbId!)} style={{ display: 'flex', gap: 12, flex: 1, textDecoration: 'none', color: 'inherit', cursor: 'pointer' }}>
          <div className="cover" style={{ width: 72, height: 96, flexShrink: 0, borderRadius: 8 }}>
            {game.cover
              ? <img src={game.cover} alt={game.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              : <div style={{ width: '100%', height: '100%', background: 'var(--bg-3)' }} />}
          </div>
          <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', paddingTop: 2, paddingRight: 2 }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 6 }}>
                <div style={{ fontSize: 14, fontWeight: 600, letterSpacing: '-0.01em', color: 'var(--fg-0)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 }}>
                  {game.title}
                </div>
                <RatingBubble rating={displayRating} size={26} />
              </div>
              {statusMeta && (
                <div style={{ marginTop: 5 }}>
                  <span className={`st-pill ${statusMeta.cls}`}><span className="dot" />{statusMeta.label}</span>
                </div>
              )}
              <div style={{ marginTop: 8, fontSize: 11, color: 'var(--fg-2)', display: 'flex', alignItems: 'center', gap: 8 }}>
                {displayYear && <span style={{ fontVariantNumeric: 'tabular-nums' }}>{displayYear}</span>}
                {game.developer && <><span style={{ width: 2, height: 2, borderRadius: 99, background: 'var(--fg-3)' }} /><span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{game.developer}</span></>}
              </div>
            </div>
            <PlatformList platforms={game.platforms} max={3} />
          </div>
        </div>
        {onAdd && (
          <div ref={menuRef} style={{ position: 'absolute', top: 8, right: 8 }}>
            <button
              onClick={openMenu}
              style={{
                width: 26, height: 26, borderRadius: 999,
                background: inLibrary ? 'var(--accent)' : 'rgba(20,18,28,0.85)',
                color: inLibrary ? 'oklch(0.15 0.02 280)' : 'var(--fg-0)',
                border: '0.5px solid rgba(255,255,255,0.18)',
                backdropFilter: 'blur(20px)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer', padding: 0,
              }}
            >
              {isAdding ? <Loader2 size={12} className="animate-spin" /> : inLibrary ? <Check size={12} strokeWidth={2.5} /> : <Plus size={12} strokeWidth={2.5} />}
            </button>
            {menuOpen && (
              <>
                <div style={{ position: 'fixed', inset: 0, zIndex: 290 }} onClick={closeMenu} />
                <StatusMenu current={game.status} onSelect={onAdd} onDelete={onDelete} onClose={closeMenu} top={menuPos.top} right={menuPos.right} />
              </>
            )}
          </div>
        )}
      </div>
    );
  }

  /* ── Cinematic (default) & Classic share the cover area ── */
  return (
    <div style={{ width, position: 'relative', flexShrink: 0 }}>
      <div onClick={() => openGame(game.igdbId!)} style={{ display: 'block', cursor: 'pointer' }}>
        {/* Cover — overflow:hidden only for the image/rounded corners */}
        <div
          style={{
            position: 'relative',
            width: '100%',
            aspectRatio: variant === 'cinematic' ? '3 / 4.4' : '3 / 4',
            borderRadius: 'var(--r-cover)',
            overflow: 'hidden',
            background: 'var(--bg-2)',
            boxShadow: '0 0 0 0.5px rgba(255,255,255,0.06) inset, var(--shadow-1)',
          }}
        >
          {game.cover
            ? <img src={game.cover} alt={game.title} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
            : <div style={{ width: '100%', height: '100%', background: 'var(--bg-2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ fontSize: 'var(--t-xs)', color: 'var(--fg-3)' }}>Sin imagen</span>
              </div>
          }

          {/* Cinematic gradient overlay with metadata */}
          {variant === 'cinematic' && (
            <div style={{
              position: 'absolute', left: 0, right: 0, bottom: 0,
              padding: '28px 10px 10px',
              background: 'linear-gradient(180deg, transparent 0%, rgba(0,0,0,0.88) 65%)',
              zIndex: 2,
            }}>
              <div style={{
                fontSize: 13, fontWeight: 600, color: '#fff',
                letterSpacing: '-0.01em', lineHeight: 1.15,
                overflow: 'hidden', display: '-webkit-box',
                WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
                textShadow: '0 1px 8px rgba(0,0,0,0.4)',
              }}>{game.title}</div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 5 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, color: 'rgba(255,255,255,0.75)' }}>
                  {displayYear && <span style={{ fontVariantNumeric: 'tabular-nums' }}>{displayYear}</span>}
                  <PlatformList platforms={game.platforms} max={1} />
                </div>
                <RatingBubble rating={displayRating} size={26} />
              </div>
            </div>
          )}

          {/* Status pill – stays inside the cover (doesn't need to overflow) */}
          {statusMeta && (
            <div style={{ position: 'absolute', top: 8, left: 8, zIndex: 3 }}>
              <span className={`st-pill ${statusMeta.cls}`}><span className="dot" />{statusMeta.label}</span>
            </div>
          )}
        </div>
      </div>

      {/* Actions — outside overflow:hidden so the dropdown is never clipped */}
      <div style={{ position: 'absolute', top: 8, right: 8, display: 'flex', gap: 5, zIndex: 10 }}>
        {onToggleFav && (
          <button
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); onToggleFav(); }}
            style={{
              width: 26, height: 26, borderRadius: 999,
              background: 'rgba(20,18,28,0.85)',
              backdropFilter: 'blur(20px)',
              border: '0.5px solid rgba(255,255,255,0.12)',
              color: game.isFavorite ? 'oklch(0.78 0.18 25)' : 'var(--fg-0)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', padding: 0, transition: 'transform 0.18s',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.08)')}
            onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
            aria-label={game.isFavorite ? 'Quitar de favoritos' : 'Marcar como favorito'}
          >
            <Heart size={13} fill={game.isFavorite ? 'currentColor' : 'none'} strokeWidth={1.8} />
          </button>
        )}
        {onAdd && (
          <div ref={menuRef} style={{ position: 'relative' }}>
            <button
              onClick={openMenu}
              style={{
                width: 26, height: 26, borderRadius: 999,
                background: inLibrary ? 'var(--accent)' : 'rgba(20,18,28,0.85)',
                color: inLibrary ? 'oklch(0.15 0.02 280)' : 'var(--fg-0)',
                border: '0.5px solid rgba(255,255,255,0.18)',
                backdropFilter: 'blur(20px)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer', padding: 0,
                boxShadow: '0 2px 8px rgba(0,0,0,.4)',
              }}
              aria-label={inLibrary ? 'Cambiar estado' : 'Añadir al catálogo'}
            >
              {isAdding
                ? <Loader2 size={12} className="animate-spin" />
                : inLibrary ? <Check size={12} strokeWidth={2.5} /> : <Plus size={12} strokeWidth={2.5} />}
            </button>
            {menuOpen && (
              <>
                <div style={{ position: 'fixed', inset: 0, zIndex: 290 }} onClick={(e) => { e.stopPropagation(); closeMenu(); }} />
                <StatusMenu current={game.status} onSelect={onAdd} onDelete={onDelete} onClose={() => setMenuOpen(false)} top={menuPos.top} right={menuPos.right} />
              </>
            )}
          </div>
        )}
      </div>

      {/* Classic meta below cover */}
      {variant === 'classic' && (
        <div style={{ padding: '8px 2px 4px' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 6, justifyContent: 'space-between' }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{
                fontSize: 12, fontWeight: 600, letterSpacing: '-0.01em',
                overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                color: 'var(--fg-0)',
              }}>{game.title}</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginTop: 3, fontSize: 11, color: 'var(--fg-2)' }}>
                {displayYear && <span style={{ fontVariantNumeric: 'tabular-nums' }}>{displayYear}</span>}
                <PlatformList platforms={game.platforms} max={1} />
              </div>
            </div>
            <RatingBubble rating={displayRating} size={26} />
          </div>
        </div>
      )}
    </div>
  );
}
