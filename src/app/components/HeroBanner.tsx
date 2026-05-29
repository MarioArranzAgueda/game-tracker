import { Game } from './GameCard';
import { Play } from 'lucide-react';

export const HeroBanner = ({ game, onClick }: { game: Game, onClick: () => void }) => {
    console.log({game})
    const bgSrc = game.artworks?.[0]?.image_id
        ? `https://images.igdb.com/igdb/image/upload/t_1080p/${game.artworks[0].image_id}.jpg`
        : game.screenshots?.[0]?.image_id
        ? `https://images.igdb.com/igdb/image/upload/t_screenshot_huge/${game.screenshots[0].image_id}.jpg`
        : game.cover ?? null;

    return <div style={{ padding: '24px 24px 8px' }}>
        <div style={{
            position: 'relative', height: 'clamp(200px, 32cqw, 300px)',
            borderRadius: 'var(--r-xl)', overflow: 'hidden',
            display: 'flex', alignItems: 'flex-end',
            boxShadow: 'var(--shadow-2)',
        }}>
            {bgSrc && (
                <div style={{ position: 'absolute', inset: 0 }}>
                    <img
                        src={bgSrc}
                        alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', transform: 'scale(1.08)', filter: 'saturate(1.3)' }} />
                </div>
            )}
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(90deg, rgba(0,0,0,0.88) 0%, rgba(0,0,0,0.3) 60%, transparent 100%)' }} />
            <div style={{ position: 'relative', padding: '24px 32px', maxWidth: 520 }}>
                <div style={{ fontSize: 'var(--t-xs)', color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 600 }}>
                    Continúa donde lo dejaste
                </div>
                <h1 style={{ fontSize: 'clamp(24px, 5cqw, 48px)', lineHeight: 1, color: '#fff', marginTop: 12, fontWeight: 600, letterSpacing: '-0.02em' }}>
                    {game.title}
                </h1>
                <div style={{ display: 'flex', gap: 8, marginTop: 20 }}>
                    <button className="gt-btn primary" style={{ gap: 8 }} onClick={onClick}>
                        <Play size={14} fill="currentColor" /> Ver detalle
                    </button>
                </div>
            </div>
        </div>
    </div>

}