'use client';

import { createContext, useContext } from 'react';

export interface GameOverlayContextType {
  openGame: (igdbId: number | string) => void;
  closeGame: () => void;
  activeIgdbId: string | null;
}

export const GameOverlayContext = createContext<GameOverlayContextType>({
  openGame: () => {},
  closeGame: () => {},
  activeIgdbId: null,
});

export function useGameOverlay() {
  return useContext(GameOverlayContext);
}

// Module-level escape hatch: set by Providers on mount, used by any component
// that can't reliably reach the React context (e.g. across chunk boundaries).
let _openGame: ((igdbId: number | string) => void) | null = null;

export function registerOpenGame(fn: (igdbId: number | string) => void) {
  _openGame = fn;
}

export function openGame(igdbId: number | string) {
  _openGame?.(igdbId);
}
