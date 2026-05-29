export const STATUS_OPTIONS = [
  { value: 'WISHLIST',        label: 'Deseado',    cls: 'wish',    color: 'bg-purple-600 text-white' },
  { value: 'PENDING',         label: 'Pendiente',  cls: 'pile',    color: 'bg-slate-700 text-slate-300' },
  { value: 'IN_PROGRESS',     label: 'En progreso', cls: 'playing', color: 'bg-blue-600 text-white' },
  { value: 'COMPLETED',       label: 'Completado', cls: 'done',    color: 'bg-green-600 text-white' },
  { value: 'FULL_COMPLETION', label: '100%',       cls: 's100',    color: 'bg-yellow-600 text-white' },
];

export const STATUS_MAP: Record<string, { label: string; cls: string }> = Object.fromEntries(
  STATUS_OPTIONS.map((s) => [s.value, { label: s.label, cls: s.cls }])
);

export const STATUS_ORDER = STATUS_OPTIONS.map((s) => s.value);

export const STATUS_COLORS: Record<string, string> = Object.fromEntries(
  STATUS_OPTIONS.map((s) => [s.value, s.color])
);
