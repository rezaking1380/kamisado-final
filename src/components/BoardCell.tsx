
import { Color, Position } from '@/types/game';
import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface BoardCellProps {
  color: Color;
  position: Position;
  onClick: () => void;
  children?: ReactNode;
  highlight?: boolean;
  isSelected?: boolean;
}

const colorMap: Record<Color, string> = {
  orange: 'bg-kamisado-orange',
  blue: 'bg-kamisado-blue',
  purple: 'bg-kamisado-purple',
  pink: 'bg-kamisado-pink',
  yellow: 'bg-kamisado-yellow',
  red: 'bg-kamisado-red',
  green: 'bg-kamisado-green',
  brown: 'bg-kamisado-brown'
};

const BoardCell = ({ color, position, onClick, children, highlight, isSelected }: BoardCellProps) => {
  return (
    <div
      className={cn(
        'board-cell w-12 h-12 sm:w-16 sm:h-16 relative',
        colorMap[color],
        'transition-all duration-300',
        highlight && 'ring-2 ring-white/50 dark:ring-white/70 z-10',
        isSelected && 'ring-2 ring-white/80 dark:ring-white/90 z-20'
      )}
      onClick={onClick}
      data-position={`${position.row},${position.col}`}
    >
      {highlight && <div className="cell-highlight" />}
      {children}
    </div>
  );
};

export default BoardCell;
