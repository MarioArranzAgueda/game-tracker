'use client';

interface SelectFilterProps {
  label?: string;
  value: string;
  options: { value: string; label: string }[];
  onChange: (value: string) => void;
}

export function SelectFilter({ label: _label, value, options, onChange }: SelectFilterProps) {
  const active = !!value;
  return (
    <div style={{ position: 'relative' }}>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={{
          appearance: 'none', WebkitAppearance: 'none',
          background: active ? 'var(--accent-soft)' : 'rgba(255,255,255,0.05)',
          border: `0.5px solid ${active ? 'var(--accent)' : 'var(--line-strong)'}`,
          color: active ? 'var(--accent)' : 'var(--fg-1)',
          padding: '8px 32px 8px 12px', borderRadius: 'var(--r-md)',
          fontFamily: 'inherit', fontSize: 'var(--t-base)', cursor: 'pointer',
          outline: 'none', transition: 'all 0.18s',
        }}
      >
        {options.map((o) => (
          <option key={o.value} value={o.value} style={{ background: 'var(--bg-1)', color: 'var(--fg-0)' }}>
            {o.label}
          </option>
        ))}
      </select>
      <span style={{
        position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)',
        pointerEvents: 'none', color: active ? 'var(--accent)' : 'var(--fg-2)',
      }}>▾</span>
    </div>
  );
}
