'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState, useEffect } from 'react';
import { GameOverlayContext, registerOpenGame } from '@/hooks/useGameOverlay';
import { GameOverlay } from './components/GameOverlay';

export default function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60 * 1000,
        refetchOnWindowFocus: false,
      },
    },
  }));

  const [activeIgdbId, setActiveIgdbId] = useState<string | null>(null);

  // Register module-level accessor so components across chunk boundaries can open the overlay
  useEffect(() => {
    registerOpenGame((igdbId) => setActiveIgdbId(String(igdbId)));
    return () => registerOpenGame(() => {});
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <GameOverlayContext.Provider value={{
        openGame: (igdbId) => setActiveIgdbId(String(igdbId)),
        closeGame: () => setActiveIgdbId(null),
        activeIgdbId,
      }}>
        {children}
        <GameOverlay />
      </GameOverlayContext.Provider>
    </QueryClientProvider>
  );
}
