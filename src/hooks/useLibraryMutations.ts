'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';

export function useLibraryMutations() {
  const queryClient = useQueryClient();

  const toggleFavoriteMutation = useMutation({
    mutationFn: async ({ id, isFavorite }: { id: number; isFavorite: boolean }) => {
      const res = await fetch(`/api/library/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isFavorite }),
      });
      if (!res.ok) throw new Error('Failed to toggle favorite');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['library'] });
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: number; status: string }) => {
      const res = await fetch(`/api/library/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) throw new Error('Failed to update status');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['library'] });
    },
  });

  const removeGameMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await fetch(`/api/library/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to remove game');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['library'] });
    },
  });

  const updatePersonalScoreMutation = useMutation({
    mutationFn: async ({ id, personalScore }: { id: number; personalScore: number | null }) => {
      const res = await fetch(`/api/library/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ personalScore }),
      });
      if (!res.ok) throw new Error('Failed to update personal score');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['library'] });
    },
  });

  return {
    toggleFavorite: toggleFavoriteMutation,
    updateStatus: updateStatusMutation,
    removeGame: removeGameMutation,
    updatePersonalScore: updatePersonalScoreMutation,
  };
}
