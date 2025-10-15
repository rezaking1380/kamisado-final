export type Color = 'orange' | 'blue' | 'purple' | 'pink' | 'yellow' | 'red' | 'green' | 'brown';

export type Player = 'black' | 'white';

export interface Position {
  readonly row: number;
  readonly col: number;
}

export interface Piece {
  readonly id: string;
  readonly color: Color;
  readonly player: Player;
  position: Position;
}

export interface GameState {
  readonly board: Color[][];
  pieces: Piece[];
  currentPlayer: Player;
  selectedPiece: Piece | null;
  lastMovedPieceColor: Color | null;
  winner: Player | null;
  gameStarted: boolean;
  aiEnabled?: boolean;
}

export interface Move {
  readonly from: Position;
  readonly to: Position;
}

export type GameAction =
  | { type: 'SELECT_PIECE'; piece: Piece }
  | { type: 'DESELECT_PIECE' }
  | { type: 'MOVE_PIECE'; move: Move }
  | { type: 'RESET_GAME' }
  | { type: 'START_GAME' }
  | { type: 'UNDO' }
  | { type: 'REDO' }
  | { type: 'TOGGLE_AI' };

// Type guards
export const isPosition = (obj: any): obj is Position => {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    typeof obj.row === 'number' &&
    typeof obj.col === 'number'
  );
};

export const isPiece = (obj: any): obj is Piece => {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    typeof obj.id === 'string' &&
    typeof obj.color === 'string' &&
    typeof obj.player === 'string' &&
    isPosition(obj.position)
  );
};

export const isMove = (obj: any): obj is Move => {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    isPosition(obj.from) &&
    isPosition(obj.to)
  );
};