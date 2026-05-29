'use client';

interface RatingBubbleProps {
  rating: number | null | undefined;
  size?: number;
  showEmpty?: boolean;
}

function ratingTone(rating: number): string {
  if (rating >= 90) return 'oklch(0.84 0.16 80)';
  if (rating >= 80) return 'oklch(0.78 0.14 145)';
  return 'oklch(0.78 0.05 280)';
}

export function RatingBubble({ rating, size = 28, showEmpty = false }: RatingBubbleProps) {
  if (!rating) {
    if (!showEmpty) return null;
    return (
      <span style={{
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        width: size, height: size, borderRadius: 999,
        background: 'rgba(255,255,255,0.05)', color: 'var(--fg-3)',
        fontSize: Math.floor(size * 0.35), fontFamily: 'var(--font-geist-mono, monospace)',
        flexShrink: 0,
      }}>—</span>
    );
  }

  const tone = ratingTone(rating);
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
      width: size, height: size, borderRadius: 999,
      background: tone.replace(')', ' / 0.18)'),
      color: tone,
      fontSize: Math.floor(size * 0.38), fontWeight: 600,
      fontFamily: 'var(--font-geist-mono, monospace)', letterSpacing: '-0.02em',
      boxShadow: `inset 0 0 0 0.5px ${tone.replace(')', ' / 0.4)')}`,
      flexShrink: 0,
    }}>{Math.round(rating)}</span>
  );
}
