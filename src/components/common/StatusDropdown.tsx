'use client';

import { Loader2 } from 'lucide-react';
import { CustomDropdown } from '@/app/components/CustomDropdown';
import { STATUS_OPTIONS } from '@/lib/constants';

interface StatusDropdownProps {
  entryId: number;
  currentStatus: string;
  onStatusChange: (status: string) => void;
  isChanging?: boolean;
  disabled?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export function StatusDropdown({
  entryId,
  currentStatus,
  onStatusChange,
  isChanging = false,
  disabled = false,
  size = 'sm',
}: StatusDropdownProps) {
  const currentOption = STATUS_OPTIONS.find(opt => opt.value === currentStatus) || STATUS_OPTIONS[0];

  if (isChanging) {
    return (
      <div className={`px-2.5 sm:px-4 py-1.5 sm:py-2 rounded-lg text-[10px] sm:text-xs font-bold uppercase transition-all flex items-center justify-center ${currentOption.color}`}>
        <Loader2 className="w-3 h-3 sm:w-4 sm:h-4 animate-spin" />
      </div>
    );
  }

  return (
    <CustomDropdown
      options={STATUS_OPTIONS.map(opt => ({
        value: opt.value,
        label: opt.label,
        color: opt.color,
      }))}
      value={currentStatus}
      onChange={onStatusChange}
      className={`${currentOption.color} text-[10px] sm:text-xs font-bold uppercase`}
      size={size}
      showColorDot={true}
      disabled={disabled}
    />
  );
}
