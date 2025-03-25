
import { Color, GameState, Piece, Player, Position, Move } from "@/types/game";

// Kamisado board colors (8x8 grid)
export const initialBoardColors: Color[][] = [
  ['orange', 'blue', 'purple', 'pink', 'yellow', 'red', 'green', 'brown'],
  ['red', 'orange', 'pink', 'green', 'blue', 'yellow', 'brown', 'purple'],
  ['green', 'pink', 'orange', 'red', 'purple', 'brown', 'yellow', 'blue'],
  ['pink', 'purple', 'blue', 'orange', 'brown', 'green', 'red', 'yellow'],
  ['yellow', 'red', 'green', 'brown', 'orange', 'blue', 'purple', 'pink'],
  ['blue', 'yellow', 'brown', 'purple', 'pink', 'green', 'orange', 'red'],
  ['purple', 'brown', 'yellow', 'blue', 'red', 'orange', 'pink', 'green'],
  ['brown', 'green', 'red', 'yellow', 'purple', 'pink', 'blue', 'orange']
];

// Initial piece setup
export const createInitialPieces = (): Piece[] => {
  const pieces: Piece[] = [];
  
  // Black pieces (top row - row 0)
  for (let col = 0; col < 8; col++) {
    pieces.push({
      id: `black-${col}`,
      color: initialBoardColors[0][col],
      player: 'black',
      position: { row: 0, col }
    });
  }
  
  // White pieces (bottom row - row 7)
  for (let col = 0; col < 8; col++) {
    pieces.push({
      id: `white-${col}`,
      color: initialBoardColors[7][col],
      player: 'white',
      position: { row: 7, col }
    });
  }
  
  return pieces;
};

// Initial game state
export const initialGameState: GameState = {
  board: initialBoardColors,
  pieces: createInitialPieces(),
  currentPlayer: 'black', // Black goes first
  selectedPiece: null,
  lastMovedPieceColor: null,
  winner: null,
  gameStarted: false
};

// Check if a position is within the board boundaries
export const isValidPosition = (position: Position): boolean => {
  return position.row >= 0 && position.row < 8 && position.col >= 0 && position.col < 8;
};

// Find a piece at a specific position
export const getPieceAtPosition = (pieces: Piece[], position: Position): Piece | undefined => {
  return pieces.find(
    piece => piece.position.row === position.row && piece.position.col === position.col
  );
};

// Get all valid moves for a piece
export const getValidMoves = (piece: Piece, gameState: GameState): Position[] => {
  const validMoves: Position[] = [];
  
  // If it's not this piece's turn, no valid moves
  if (piece.player !== gameState.currentPlayer) {
    return [];
  }
  
  // If there's a restricted color piece that must be moved, check if this piece is that color
  if (gameState.lastMovedPieceColor !== null) {
    const mustMovePieces = gameState.pieces.filter(
      p => p.color === gameState.lastMovedPieceColor && p.player === gameState.currentPlayer
    );
    
    // If there are pieces of the required color, and this isn't one of them, no valid moves
    if (mustMovePieces.length > 0 && piece.color !== gameState.lastMovedPieceColor) {
      return [];
    }
  }
  
  // Direction of movement depends on player
  const direction = piece.player === 'black' ? 1 : -1;
  
  // Check forward moves
  for (let distance = 1; distance < 8; distance++) {
    const newRow = piece.position.row + (direction * distance);
    const newCol = piece.position.col;
    
    if (!isValidPosition({ row: newRow, col: newCol })) {
      break; // Out of bounds
    }
    
    const pieceAtPosition = getPieceAtPosition(gameState.pieces, { row: newRow, col: newCol });
    if (pieceAtPosition) {
      break; // Path blocked by another piece
    }
    
    validMoves.push({ row: newRow, col: newCol });
  }
  
  // Check diagonal moves (forward left)
  for (let distance = 1; distance < 8; distance++) {
    const newRow = piece.position.row + (direction * distance);
    const newCol = piece.position.col - distance;
    
    if (!isValidPosition({ row: newRow, col: newCol })) {
      break; // Out of bounds
    }
    
    const pieceAtPosition = getPieceAtPosition(gameState.pieces, { row: newRow, col: newCol });
    if (pieceAtPosition) {
      break; // Path blocked by another piece
    }
    
    validMoves.push({ row: newRow, col: newCol });
  }
  
  // Check diagonal moves (forward right)
  for (let distance = 1; distance < 8; distance++) {
    const newRow = piece.position.row + (direction * distance);
    const newCol = piece.position.col + distance;
    
    if (!isValidPosition({ row: newRow, col: newCol })) {
      break; // Out of bounds
    }
    
    const pieceAtPosition = getPieceAtPosition(gameState.pieces, { row: newRow, col: newCol });
    if (pieceAtPosition) {
      break; // Path blocked by another piece
    }
    
    validMoves.push({ row: newRow, col: newCol });
  }
  
  return validMoves;
};

// Check if a player has won (by reaching the opponent's back row)
export const checkWinner = (pieces: Piece[]): Player | null => {
  // Black wins if a black piece reaches row 7
  const blackWin = pieces.some(piece => piece.player === 'black' && piece.position.row === 7);
  if (blackWin) return 'black';
  
  // White wins if a white piece reaches row 0
  const whiteWin = pieces.some(piece => piece.player === 'white' && piece.position.row === 0);
  if (whiteWin) return 'white';
  
  return null;
};

// Make a move and update the game state
export const makeMove = (gameState: GameState, move: Move): GameState => {
  const { pieces, selectedPiece } = gameState;
  
  if (!selectedPiece) return gameState;
  
  // Find the selected piece in the pieces array
  const pieceIndex = pieces.findIndex(p => p.id === selectedPiece.id);
  if (pieceIndex === -1) return gameState;
  
  // Update the piece position
  const updatedPieces = [...pieces];
  updatedPieces[pieceIndex] = {
    ...updatedPieces[pieceIndex],
    position: move.to
  };
  
  // Get the color of the target cell
  const targetCellColor = gameState.board[move.to.row][move.to.col];
  
  // Check if there's a winner
  const winner = checkWinner(updatedPieces);
  
  // Switch players
  const nextPlayer = gameState.currentPlayer === 'black' ? 'white' : 'black';
  
  return {
    ...gameState,
    pieces: updatedPieces,
    currentPlayer: nextPlayer,
    selectedPiece: null,
    lastMovedPieceColor: targetCellColor,
    winner
  };
};

// Check if a move is valid
export const isValidMove = (gameState: GameState, from: Position, to: Position): boolean => {
  const { pieces, selectedPiece } = gameState;
  
  if (!selectedPiece) return false;
  
  // Get valid moves for the selected piece
  const validMoves = getValidMoves(selectedPiece, gameState);
  
  // Check if the target position is in the valid moves list
  return validMoves.some(move => move.row === to.row && move.col === to.col);
};

// Check if a player has any valid moves
export const hasValidMoves = (gameState: GameState, player: Player): boolean => {
  const playerPieces = gameState.pieces.filter(piece => piece.player === player);
  
  // Check each piece for valid moves
  for (const piece of playerPieces) {
    if (getValidMoves(piece, gameState).length > 0) {
      return true;
    }
  }
  
  return false;
};

// When a player is blocked (no valid moves), the other player wins
export const checkBlocked = (gameState: GameState): Player | null => {
  if (!hasValidMoves(gameState, gameState.currentPlayer)) {
    return gameState.currentPlayer === 'black' ? 'white' : 'black';
  }
  
  return null;
};

// Get the piece that matches a specific color for the current player
export const getPieceByColor = (gameState: GameState, color: Color): Piece | undefined => {
  return gameState.pieces.find(
    piece => piece.color === color && piece.player === gameState.currentPlayer
  );
};
