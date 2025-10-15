
import { Color, GameState, Piece, Player, Position, Move } from "@/types/game";

export const BOARD_SIZE = 8;

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
  
  // Direction of movement depends on player
  const direction = piece.player === 'black' ? 1 : -1;
  
  // Check forward moves
  for (let distance = 1; distance < 8; distance++) {
    const newRow = piece.position.row + (direction * distance);
    const newCol = piece.position.col;
    
    if (!isValidPosition({ row: newRow, col: newCol })) {
      break;
    }
    
    const pieceAtPosition = getPieceAtPosition(gameState.pieces, { row: newRow, col: newCol });
    if (pieceAtPosition) {
      break;
    }
    
    validMoves.push({ row: newRow, col: newCol });
  }
  
  // Check diagonal moves (forward left)
  for (let distance = 1; distance < 8; distance++) {
    const newRow = piece.position.row + (direction * distance);
    const newCol = piece.position.col - distance;
    
    if (!isValidPosition({ row: newRow, col: newCol })) {
      break;
    }
    
    const pieceAtPosition = getPieceAtPosition(gameState.pieces, { row: newRow, col: newCol });
    if (pieceAtPosition) {
      break;
    }
    
    validMoves.push({ row: newRow, col: newCol });
  }
  
  // Check diagonal moves (forward right)
  for (let distance = 1; distance < 8; distance++) {
    const newRow = piece.position.row + (direction * distance);
    const newCol = piece.position.col + distance;
    
    if (!isValidPosition({ row: newRow, col: newCol })) {
      break;
    }
    
    const pieceAtPosition = getPieceAtPosition(gameState.pieces, { row: newRow, col: newCol });
    if (pieceAtPosition) {
      break;
    }
    
    validMoves.push({ row: newRow, col: newCol });
  }
  
  return validMoves;
};

// Check if a player has won (by reaching the opponent's back row)
export const checkWinner = (pieces: Piece[], board: Color[][]): Player | null => {
  // Black wins if a black piece reaches row 7 and matches the tower color there
  for (const piece of pieces) {
    if (piece.player === 'black' && piece.position.row === 7) {
      const towerColor = board[7][piece.position.col];
      if (towerColor === piece.color) {
        return 'black';
      }
    }
  }
  
  // White wins if a white piece reaches row 0 and matches the tower color there
  for (const piece of pieces) {
    if (piece.player === 'white' && piece.position.row === 0) {
      const towerColor = board[0][piece.position.col];
      if (towerColor === piece.color) {
        return 'white';
      }
    }
  }
  console.log(pieces,board)
  return null;
};

// Make a move and update the game state
export const makeMove = (gameState: GameState, from: Position, to: Position): GameState => {
  const { pieces, currentPlayer, board } = gameState;
  
  const piece = getPieceAtPosition(pieces, from);
  if (!piece || piece.player !== currentPlayer) {
    return gameState;
  }
  
  // Find the piece index
  const pieceIndex = pieces.findIndex(p => p.id === piece.id);
  if (pieceIndex === -1) return gameState;
  
  // Update the piece position
  const updatedPieces = [...pieces];
  updatedPieces[pieceIndex] = {
    ...updatedPieces[pieceIndex],
    position: to
  };
  
  // Get the color of the target cell
  const targetCellColor = board[to.row][to.col];
  
  // Check if there's a winner
  const winner = checkWinner(updatedPieces, board);
  
  // Switch players
  const nextPlayer = currentPlayer === 'black' ? 'white' : 'black';
  
  return {
    ...gameState,
    pieces: updatedPieces,
    currentPlayer: nextPlayer,
    selectedPiece: null,
    lastMovedPieceColor: targetCellColor,
    winner
  };
};

// Check if a piece can be moved (player and color rules)
export const canMovePiece = (piece: Piece, gameState: GameState): boolean => {
  if (piece.player !== gameState.currentPlayer) {
    return false;
  }
  if (gameState.lastMovedPieceColor === null) {
    return true;
  }
  const mustMovePieces = gameState.pieces.filter(
    p => p.color === gameState.lastMovedPieceColor && p.player === gameState.currentPlayer
  );
  return mustMovePieces.length === 0 || piece.color === gameState.lastMovedPieceColor;
};

// Check if a move is valid
export const isValidMove = (gameState: GameState, from: Position, to: Position): boolean => {
  const piece = getPieceAtPosition(gameState.pieces, from);
  
  if (!piece || !canMovePiece(piece, gameState)) {
    return false;
  }
  
  const validMoves = getValidMoves(piece, gameState);
  
  return validMoves.some(pos => pos.row === to.row && pos.col === to.col);
};

// Check if current player has any valid moves
export const hasValidMoves = (gameState: GameState): boolean => {
  return getAllValidMoves(gameState).length > 0;
};

// When current player is blocked (no valid moves), the other player wins
export const checkBlocked = (gameState: GameState): Player | null => {
  if (gameState.winner !== null) {
    return null;
  }
  if (!hasValidMoves(gameState)) {
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

export const getAllValidMoves = (gameState: GameState): Move[] => {
  const valid: Move[] = [];
  const playerPieces = gameState.pieces.filter(piece => piece.player === gameState.currentPlayer);
  for (const piece of playerPieces) {
    if (!canMovePiece(piece, gameState)) {
      continue;
    }
    const possible = getValidMoves(piece, gameState);
    for (const to of possible) {
      valid.push({
        from: piece.position,
        to
      });
    }
  }
  return valid;
};
