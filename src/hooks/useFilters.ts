'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { useCallback } from 'react';

export interface FilterState {
  status?: string;
  genre?: string;
  platform?: string;
  sort?: string;
}

export function useFilters() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const setFilter = useCallback((key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());

    // Obtener valores actuales como array
    const current = params.get(key);
    const values = current ? current.split(',') : [];

    let newValues: string[];

    if (values.includes(value)) {
      // Si ya existe → lo quitamos (toggle OFF)
      newValues = values.filter(v => v !== value);
    } else {
      // Si no existe → lo añadimos (toggle ON)
      newValues = [...values, value];
    }

    if (newValues.length > 0) {
      params.set(key, newValues.join(','));
    } else {
      params.delete(key);
    }

    router.replace(`?${params.toString()}`, { scroll: false });
  }, [searchParams, router]);

  const setSingleFilter = useCallback((key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    router.replace(`?${params.toString()}`, { scroll: false });
  }, [searchParams, router]);

  const clearFilters = useCallback(() => {
    router.replace(window.location.pathname, { scroll: false });
  }, [router]);

  const hasFilters = useCallback(() => {
    const params = searchParams.toString();
    return params.length > 0;
  }, [searchParams]);

  const getFilter = useCallback((key: string): string | null => {
    return searchParams.get(key);
  }, [searchParams]);

  const getFilters = useCallback((): FilterState => {
    return {
      status: searchParams.get('status') || undefined,
      genre: searchParams.get('genre') || undefined,
      platform: searchParams.get('platform') || undefined,
      sort: searchParams.get('sort') || undefined,
    };
  }, [searchParams]);

  return {
    setFilter,
    setSingleFilter,
    clearFilters,
    hasFilters: hasFilters(),
    getFilter,
    getFilters,
  };
}
