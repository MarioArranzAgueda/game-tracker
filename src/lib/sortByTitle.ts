export type TitleSort = '' | 'name_asc' | 'name_desc';

export function parseTitleSort(value: string | null): TitleSort {
  if (value === 'name_asc' || value === 'name_desc') return value;
  return '';
}

export function sortByTitle<T>(
  items: readonly T[],
  sort: TitleSort,
  getTitle: (item: T) => string | null | undefined,
): T[] {
  if (sort === '') return items as T[];
  if (items.length === 0) return [];
  const dir = sort === 'name_asc' ? 1 : -1;
  return [...items].sort((a, b) => {
    const ta = (getTitle(a) ?? '').toLocaleLowerCase();
    const tb = (getTitle(b) ?? '').toLocaleLowerCase();
    return dir * ta.localeCompare(tb, 'es', { sensitivity: 'base' });
  });
}
