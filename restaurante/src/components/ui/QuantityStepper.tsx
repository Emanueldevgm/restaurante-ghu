import React from 'react';
import { Button } from '@/components/ui/button';
import { Minus, Plus } from 'lucide-react';

interface QuantityStepperProps {
  quantity: number;
  onIncrease: () => void;
  onDecrease: () => void;
  min?: number;
  max?: number;
}

export function QuantityStepper({
  quantity,
  onIncrease,
  onDecrease,
  min = 1,
  max = 99
}: QuantityStepperProps) {
  return (
    <div className="flex items-center gap-2">
      <Button
        variant="outline"
        size="icon"
        className="h-8 w-8 rounded-full hover:scale-105 active:scale-95 transition-all duration-200"
        onClick={onDecrease}
        disabled={quantity <= min}
      >
        <Minus className="h-4 w-4" />
      </Button>
      <span className="px-3 py-1 text-sm font-medium min-w-[2rem] text-center">
        {quantity}
      </span>
      <Button
        variant="outline"
        size="icon"
        className="h-8 w-8 rounded-full hover:scale-105 active:scale-95 transition-all duration-200"
        onClick={onIncrease}
        disabled={quantity >= max}
      >
        <Plus className="h-4 w-4" />
      </Button>
    </div>
  );
}