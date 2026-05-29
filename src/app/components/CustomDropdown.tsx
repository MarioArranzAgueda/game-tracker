'use client';

import { useState, useEffect, useRef } from 'react';
import { ChevronDown } from 'lucide-react';

export interface DropdownOption {
  value: string;
  label: string;
  color?: string;
  icon?: React.ReactNode;
}

interface CustomDropdownProps {
  options: DropdownOption[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  showColorDot?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export function CustomDropdown({
  options,
  value,
  onChange,
  placeholder = 'Seleccionar...',
  className = '',
  disabled = false,
  showColorDot = false,
  size = 'md',
}: CustomDropdownProps) {
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0 });

  useEffect(() => {
    if (!showDropdown) return;

    // Calculate dropdown position
    if (buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      const viewportHeight = window.innerHeight;
      const spaceBelow = viewportHeight - rect.bottom;
      const spaceAbove = rect.top;
      const dropdownHeight = 300; // Approximate max height

      // Position above if not enough space below
      const shouldPositionAbove = spaceBelow < dropdownHeight && spaceAbove > spaceBelow;

      setDropdownPosition({
        top: shouldPositionAbove ? rect.top - 4 : rect.bottom + 4,
        left: rect.left,
      });
    }

    const handler = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(e.target as Node)
      ) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [showDropdown]);

  const selectedOption = options.find((opt) => opt.value === value);
  const displayLabel = selectedOption?.label || placeholder;

  const sizeClasses = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-4 py-2 text-sm',
    lg: 'px-5 py-2.5 text-base',
  };

  const buttonColorClasses = selectedOption?.color || 'bg-slate-900 border-slate-700 text-slate-300';

  return (
    <>
      <button
        ref={buttonRef}
        onClick={() => !disabled && setShowDropdown(!showDropdown)}
        disabled={disabled}
        className={`${sizeClasses[size]} rounded-lg font-medium transition-all flex items-center justify-between gap-2 border outline-none focus:ring-2 focus:ring-blue-500 ${buttonColorClasses} disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
      >
        <span className="truncate">{displayLabel}</span>
        <ChevronDown className={`w-4 h-4 transition-transform shrink-0 ${showDropdown ? 'rotate-180' : ''}`} />
      </button>
      {showDropdown && !disabled && (
        <div
          ref={dropdownRef}
          className="fixed bg-slate-900 border border-slate-700 rounded-lg shadow-xl py-1 min-w-[200px] max-h-[300px] overflow-y-auto z-[200]"
          style={{ top: `${dropdownPosition.top}px`, left: `${dropdownPosition.left}px` }}
        >
          {options.map((opt) => (
            <button
              key={opt.value}
              onClick={() => {
                onChange(opt.value);
                setShowDropdown(false);
              }}
              className={`w-full px-4 py-2.5 text-left text-sm hover:bg-slate-800 transition-colors flex items-center gap-2 ${
                opt.value === value ? 'text-blue-400' : 'text-slate-300'
              }`}
            >
              {showColorDot && opt.color && (
                <div className={`w-2 h-2 rounded-full ${opt.color.split(' ')[0]}`} />
              )}
              {opt.icon && <span className="shrink-0">{opt.icon}</span>}
              <span className="truncate">{opt.label}</span>
            </button>
          ))}
        </div>
      )}
    </>
  );
}
