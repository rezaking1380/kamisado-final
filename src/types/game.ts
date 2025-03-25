
export type Color = 'orange' | 'blue' | 'purple' | 'pink' | 'yellow' | 'red' | 'green' | 'brown';

export type Player = 'black' | 'white';

export interface Position {
  row: number;
  col: number;
}

export interface Piece {
  id: string;
  color: Color;
  player: Player;
  position: Position;
}

export interface GameState {
  board: Color[][];
  pieces: Piece[];
  currentPlayer: Player;
  selectedPiece: Piece | null;
  lastMovedPieceColor: Color | null;
  winner: Player | null;
  gameStarted: boolean;
}

export type Move = {
  from: Position;
  to: Position;
};

export type GameAction =
  | { type: 'SELECT_PIECE'; piece: Piece }
  | { type: 'DESELECT_PIECE' }
  | { type: 'MOVE_PIECE'; move: Move }
  | { type: 'RESET_GAME' }
  | { type: 'START_GAME' };
