import { useGame } from "@/contexts/GameContext";
import { Position } from "@/types/game";
import BoardCell from "./BoardCell";
import GamePiece from "./GamePiece";
import { cn } from "@/lib/utils";

const GameBoard = () => {
  const {
    state,
    selectPiece,
    deselectPiece,
    movePiece,
    getValidMovesForPiece,
  } = useGame();
  const {
    board,
    pieces,
    selectedPiece,
    currentPlayer,
    lastMovedPieceColor,
    gameStarted,
  } = state;
  console.log(state);
  // Handle cell click
  const handleCellClick = (position: Position) => {
    // If no piece is selected, do nothing (cell clicks only matter when moving)
    if (!selectedPiece) return;

    // Check if the move is valid
    const validMoves = getValidMovesForPiece(selectedPiece);
    const isValidMove = validMoves.some(
      (move) => move.row === position.row && move.col === position.col
    );

    if (isValidMove) {
      // Make the move
      movePiece({
        from: selectedPiece.position,
        to: position,
      });
    } else {
      // If clicking on an invalid position, deselect the piece
      deselectPiece();
    }
  };

  // Determine if a piece should be highlighted (it's this player's turn and must move a specific color)
  const shouldHighlightPiece = (pieceId: string) => {
    // Find the piece
    const piece = pieces.find((p) => p.id === pieceId);
    if (!piece) return false;

    // Only highlight current player's pieces
    if (piece.player !== currentPlayer) return false;

    // If there's a required color to move, only highlight pieces of that color
    if (lastMovedPieceColor !== null) {
      return piece.color === lastMovedPieceColor;
    }

    // Otherwise, all of current player's pieces could potentially be moved
    return true;
  };

  return (
    <div className={`w-full max-w-xl mx-auto ${!gameStarted && "pointer-events-none"}` }>
      <div
        className={cn(
          "grid grid-cols-8 lg:gap-2 md:gap-1 border-2 rounded-lg overflow-hidden",
          "shadow-xl transition-all duration-500 bg-gradient-to-br from-slate-50 to-slate-200",
          "dark:from-slate-900 dark:to-slate-800 animate-fade-in"
        )}
      >
        {board.map((row, rowIndex) =>
          row.map((cellColor, colIndex) => {
            // Find piece at this position
            const piece = pieces.find(
              (p) => p.position.row === rowIndex && p.position.col === colIndex
            );

            // Check if this cell is a valid move for the selected piece
            const isValidMoveCell =
              selectedPiece &&
              getValidMovesForPiece(selectedPiece).some(
                (pos) => pos.row === rowIndex && pos.col === colIndex
              );

            return (
              <BoardCell
                key={`${rowIndex}-${colIndex}`}
                color={cellColor}
                position={{ row: rowIndex, col: colIndex }}
                onClick={() =>
                  handleCellClick({ row: rowIndex, col: colIndex })
                }
                highlight={isValidMoveCell}
                isSelected={
                  selectedPiece?.position.row === rowIndex &&
                  selectedPiece?.position.col === colIndex
                }
              >
                {piece && (
                  <GamePiece
                    piece={piece}
                    isSelected={selectedPiece?.id === piece.id}
                    onClick={() => selectPiece(piece)}
                    highlight={shouldHighlightPiece(piece.id)}
                  />
                )}
              </BoardCell>
            );
          })
        )}
      </div>
    </div>
  );
};

export default GameBoard;
