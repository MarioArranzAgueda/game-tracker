'use client';

import { useState } from 'react';
import { Star, X } from 'lucide-react';

export function StarRating({ currentScore, onScoreChange }: {
    currentScore: number | null;
    onScoreChange: (score: number | null) => void;
}) {
    const [hoverScore, setHoverScore] = useState<number | null>(null);

    const displayScore = hoverScore ?? currentScore;

    const handleScoreClick = (score: number) => {
        onScoreChange(score);
    };

    return (
        <div className="flex justify-center items-center gap-0.5 sm:gap-1 shrink-0">
            <div className="flex items-center gap-0.5 shrink-0">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((score) => (
                    <button
                        key={score}
                        onMouseEnter={() => setHoverScore(score)}
                        onMouseLeave={() => setHoverScore(null)}
                        onClick={() => handleScoreClick(score)}
                        className="cursor-pointer transition-transform hover:scale-110 shrink-0"
                    >
                        <Star
                            className={`w-8 h-8 sm:w-5 sm:h-5 transition-colors ${displayScore && displayScore >= score
                                ? 'fill-yellow-500 text-yellow-500'
                                : 'fill-transparent text-slate-600 hover:text-slate-500'
                                }`}
                        />
                    </button>
                ))}
            </div>
            <button
                onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    onScoreChange(null);
                }}
                className="w-5 h-5 sm:w-6 sm:h-6 rounded flex items-center justify-center text-slate-500 hover:text-red-400 hover:bg-slate-800 transition-colors shrink-0 cursor-pointer"
                title="Eliminar puntuación"
                type="button"
            >
                <X className="w-3 h-3 sm:w-4 sm:h-4" />
            </button>
        </div>
    );
}
