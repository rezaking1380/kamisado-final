
import React, { createContext, useContext, useReducer, ReactNode } from 'react';
import { GameState, GameAction, Piece, Position, Move, Player } from '@/types/game';
import { 
  initialGameState, 
  getValidMoves, 
  makeMove, 
  isValidMove, 
  checkBlocked
} from '@/utils/gameUtils';

// Create context
interface GameContextType {
  state: GameState;
  selectPiece: (piece: Piece) => void;
  deselectPiece: () => void;
  movePiece: (move: Move) => void;
  resetGame: () => void;
  startGame: () => void;
  getValidMovesForPiece: (piece: Piece) => Position[];
  canMovePiece: (from: Position, to: Position) => boolean;
}

const GameContext = createContext<GameContextType | undefined>(undefined);

// Reducer for game actions
const gameReducer = (state: GameState, action: GameAction): GameState => {
  switch (action.type) {
    case 'SELECT_PIECE':
      // Only allow selecting a piece if it belongs to the current player
      if (action.piece.player !== state.currentPlayer) {
        return state;
      }
      
      // If there's a specific color piece that must be moved, check this is that color
      if (state.lastMovedPieceColor !== null) {
        const mustMovePieces = state.pieces.filter(
          p => p.color === state.lastMovedPieceColor && p.player === state.currentPlayer
        );
        
        // If there are pieces of the required color, and this isn't one of them, don't select it
        if (mustMovePieces.length > 0 && action.piece.color !== state.lastMovedPieceColor) {
          return state;
        }
      }
      
      return {
        ...state,
        selectedPiece: action.piece
      };
      
    case 'DESELECT_PIECE':
      return {
        ...state,
        selectedPiece: null
      };
      
    case 'MOVE_PIECE':
      // Check if move is valid
      if (!state.selectedPiece || !isValidMove(state, action.move.from, action.move.to)) {
        return state;
      }
      
      // Make the move and update state
      const newState = makeMove(state, action.move);
      
      // After the move, check if the next player is blocked
      const blocked = checkBlocked(newState);
      if (blocked) {
        return {
          ...newState,
          winner: blocked
        };
      }
      
      return newState;
      
    case 'RESET_GAME':
      return {
        ...initialGameState,
        gameStarted: state.gameStarted
      };
      
    case 'START_GAME':
      return {
        ...state,
        gameStarted: true
      };
      
    default:
      return state;
  }
};

// Provider component
interface GameProviderProps {
  children: ReactNode;
}

export const GameProvider: React.FC<GameProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(gameReducer, initialGameState);
  
  const selectPiece = (piece: Piece) => {
    dispatch({ type: 'SELECT_PIECE', piece });
  };
  
  const deselectPiece = () => {
    dispatch({ type: 'DESELECT_PIECE' });
  };
  
  const movePiece = (move: Move) => {
    dispatch({ type: 'MOVE_PIECE', move });
  };
  
  const resetGame = () => {
    dispatch({ type: 'RESET_GAME' });
  };
  
  const startGame = () => {
    dispatch({ type: 'START_GAME' });
  };
  
  const getValidMovesForPiece = (piece: Piece): Position[] => {
    return getValidMoves(piece, state);
  };
  
  const canMovePiece = (from: Position, to: Position): boolean => {
    return isValidMove(state, from, to);
  };
  
  return (
    <GameContext.Provider value={{
      state,
      selectPiece,
      deselectPiece,
      movePiece,
      resetGame,
      startGame,
      getValidMovesForPiece,
      canMovePiece
    }}>
      {children}
    </GameContext.Provider>
  );
};

// Custom hook to use the game context
export const useGame = (): GameContextType => {
  const context = useContext(GameContext);
  if (context === undefined) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
};
