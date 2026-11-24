import { Minus, Plus } from 'lucide-react';
import { IconButton } from '@/shared/ui';

const LIMITS = { min: 50, max: 200, step: 25 };

interface ZoomControlProps {
  zoom: number;
  onChange: (zoom: number) => void;
}

export function ZoomControl({ zoom, onChange }: ZoomControlProps) {
  return (
    <span className="flex items-center">
      <IconButton
        icon={Minus}
        label="Zoom out"
        disabled={zoom <= LIMITS.min}
        onClick={() => onChange(zoom - LIMITS.step)}
      />
      <span className="w-12 text-center text-sm font-semibold tabular-nums">{zoom}%</span>
      <IconButton
        icon={Plus}
        label="Zoom in"
        disabled={zoom >= LIMITS.max}
        onClick={() => onChange(zoom + LIMITS.step)}
      />
    </span>
  );
}
