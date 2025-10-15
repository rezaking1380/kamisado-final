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
  currentPlayer: 'black',
  selectedPiece: null,
  lastMovedPieceColor: null,
  winner: null,
  gameStarted: false
};

// Check if a position is within the board boundaries
export const isValidPosition = (position: Position): boolean => {
  return position.row >= 0 && position.row < BOARD_SIZE && 
         position.col >= 0 && position.col < BOARD_SIZE;
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
  const direction = piece.player === 'black' ? 1 : -1;
  
  // Helper to check moves in a direction
  const checkDirection = (rowDelta: number, colDelta: number) => {
    for (let distance = 1; distance < BOARD_SIZE; distance++) {
      const newRow = piece.position.row + (rowDelta * distance);
      const newCol = piece.position.col + (colDelta * distance);
      
      if (!isValidPosition({ row: newRow, col: newCol })) break;
      
      const pieceAtPosition = getPieceAtPosition(gameState.pieces, { row: newRow, col: newCol });
      if (pieceAtPosition) break;
      
      validMoves.push({ row: newRow, col: newCol });
    }
  };
  
  // Forward moves
  checkDirection(direction, 0);
  
  // Diagonal forward left
  checkDirection(direction, -1);
  
  // Diagonal forward right
  checkDirection(direction, 1);
  
  return validMoves;
};

// Check if a player has won
export const checkWinner = (pieces: Piece[], board: Color[][]): Player | null => {
  // Black wins if reaching row 7 with matching tower color
  for (const piece of pieces) {
    if (piece.player === 'black' && piece.position.row === 7) {
      const towerColor = board[7][piece.position.col];
      if (towerColor === piece.color) {
        return 'black';
      }
    }
  }
  
  // White wins if reaching row 0 with matching tower color
  for (const piece of pieces) {
    if (piece.player === 'white' && piece.position.row === 0) {
      const towerColor = board[0][piece.position.col];
      if (towerColor === piece.color) {
        return 'white';
      }
    }
  }
  
  return null;
};

// Make a move and update the game state
export const makeMove = (gameState: GameState, from: Position, to: Position): GameState => {
  const { pieces, currentPlayer, board } = gameState;
  
  const piece = getPieceAtPosition(pieces, from);
  if (!piece || piece.player !== currentPlayer) {
    return gameState;
  }
  
  const pieceIndex = pieces.findIndex(p => p.id === piece.id);
  if (pieceIndex === -1) return gameState;
  
  // Create new pieces array with updated position
  const updatedPieces = pieces.map((p, idx) => 
    idx === pieceIndex ? { ...p, position: { ...to } } : p
  );
  
  // Get the color of the target cell
  const targetCellColor = board[to.row][to.col];
  
  // Check for winner
  const winner = checkWinner(updatedPieces, board);
  
  // Switch players
  const nextPlayer: Player = currentPlayer === 'black' ? 'white' : 'black';
  
  return {
    ...gameState,
    pieces: updatedPieces,
    currentPlayer: nextPlayer,
    selectedPiece: null,
    lastMovedPieceColor: targetCellColor,
    winner
  };
};

// Check if a piece can be moved (considering color restrictions)
export const canMovePiece = (piece: Piece, gameState: GameState): boolean => {
  // Must be current player's piece
  if (piece.player !== gameState.currentPlayer) {
    return false;
  }
  
  // If no color restriction, any piece can move
  if (gameState.lastMovedPieceColor === null) {
    return true;
  }
  
  // Check if there are pieces of the required color
  const mustMovePieces = gameState.pieces.filter(
    p => p.color === gameState.lastMovedPieceColor && p.player === gameState.currentPlayer
  );
  
  // If no pieces of required color exist, any piece can move
  if (mustMovePieces.length === 0) {
    return true;
  }
  
  // Otherwise, only pieces of the required color can move
  return piece.color === gameState.lastMovedPieceColor;
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

// Get all valid moves for current player
export const getAllValidMoves = (gameState: GameState): Move[] => {
  const validMoves: Move[] = [];
  const playerPieces = gameState.pieces.filter(
    piece => piece.player === gameState.currentPlayer
  );
  
  for (const piece of playerPieces) {
    if (!canMovePiece(piece, gameState)) {
      continue;
    }
    
    const possibleMoves = getValidMoves(piece, gameState);
    for (const to of possibleMoves) {
      validMoves.push({
        from: { ...piece.position },
        to: { ...to }
      });
    }
  }
  
  return validMoves;
};

// Check if current player has any valid moves
export const hasValidMoves = (gameState: GameState): boolean => {
  return getAllValidMoves(gameState).length > 0;
};

// Check if current player is blocked (no valid moves)
export const checkBlocked = (gameState: GameState): Player | null => {
  if (gameState.winner !== null) {
    return null;
  }
  
  if (!hasValidMoves(gameState)) {
    // If current player has no moves, the other player wins
    return gameState.currentPlayer === 'black' ? 'white' : 'black';
  }
  
  return null;
};

// Get piece by color for current player
export const getPieceByColor = (gameState: GameState, color: Color): Piece | undefined => {
  return gameState.pieces.find(
    piece => piece.color === color && piece.player === gameState.currentPlayer
  );
};

// Calculate distance to goal for a piece
export const getDistanceToGoal = (piece: Piece): number => {
  const goalRow = piece.player === 'black' ? 7 : 0;
  return Math.abs(piece.position.row - goalRow);
};

// Deep clone game state for AI simulation
export const cloneGameState = (state: GameState): GameState => {
  return {
    ...state,
    board: state.board.map(row => [...row]),
    pieces: state.pieces.map(p => ({ ...p, position: { ...p.position } })),
    selectedPiece: state.selectedPiece ? { 
      ...state.selectedPiece, 
      position: { ...state.selectedPiece.position } 
    } : null
  };
};