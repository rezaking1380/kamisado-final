
import { Piece } from '@/types/game';
import { cn } from '@/lib/utils';

interface GamePieceProps {
  piece: Piece;
  isSelected?: boolean;
  onClick: () => void;
  highlight?: boolean;
}

const GamePiece = ({ piece, isSelected, onClick, highlight }: GamePieceProps) => {
  const { player, color } = piece;

  // Base styles for all pieces
  const baseClasses = 'game-piece absolute inset-2 sm:inset-3 rounded-full z-10';
  
  // Player-specific styles
  const playerClasses = {
    black: 'bg-kamisado-black border-2 border-gray-700',
    white: 'bg-kamisado-white border-2 border-gray-300'
  };
  
  // Color indicator (small circle inside the piece)
  const colorIndicatorClasses = {
    orange: 'bg-kamisado-orange',
    blue: 'bg-kamisado-blue',
    purple: 'bg-kamisado-purple',
    pink: 'bg-kamisado-pink',
    yellow: 'bg-kamisado-yellow',
    red: 'bg-kamisado-red',
    green: 'bg-kamisado-green',
    brown: 'bg-kamisado-brown'
  };

  return (
    <div
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      className={cn(
        baseClasses,
        playerClasses[player],
        isSelected && 'ring-2 ring-offset-2 ring-white transform-gpu scale-110',
        highlight && 'ring-2 ring-white ring-opacity-50 animate-pulse-subtle'
      )}
    >
      {/* Color indicator in the center of the piece */}
      <div
        className={cn(
          'absolute inset-0 m-auto w-3 h-3 sm:w-4 sm:h-4 rounded-full transition-transform',
          colorIndicatorClasses[color],
          isSelected && 'transform-gpu scale-110'
        )}
      />
    </div>
  );
};

export default GamePiece;
