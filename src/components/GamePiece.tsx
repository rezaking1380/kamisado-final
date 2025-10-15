
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
    black: 'bg-kamisado-black ',
    white: 'bg-kamisado-white '
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
        isSelected && player === 'black' && 'ring ring-offset ring-white transform-gpu scale-110',
        isSelected && player === 'white' && 'ring ring-offset ring-black transform-gpu scale-110',
        highlight && player === 'black' && 'ring ring-white animate-pulse-subtle',
        highlight && player === 'white' && 'ring ring-black animate-pulse-subtle'
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
