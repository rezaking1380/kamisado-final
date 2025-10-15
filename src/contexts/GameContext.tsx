
import React, {
  createContext,
  useContext,
  useReducer,
  useEffect,
  useCallback,
  ReactNode,
} from "react";
import {
  GameState,
  GameAction,
  Piece,
  Position,
  Move,
  Player,
} from "@/types/game";
import {
  initialGameState,
  getValidMoves,
  makeMove,
  isValidMove,
  checkBlocked,
} from "@/utils/gameUtils";
import { useAI } from "@/hooks/useAI";

export type GameHistoryState = GameState & {
  history: GameState[];
  future: GameState[];
  aiEnabled: boolean;
};

// Create context
interface GameContextType {
  state: GameState & { aiEnabled: boolean };
  selectPiece: (piece: Piece) => void;
  deselectPiece: () => void;
  movePiece: (move: Move) => void;
  resetGame: () => void;
  startGame: () => void;
  getValidMovesForPiece: (piece: Piece) => Position[];
  canMovePiece: (from: Position, to: Position) => boolean;
  undo: () => void;
  redo: () => void;
  canUndo: boolean;
  canRedo: boolean;
  isAIThinking: boolean;
  toggleAI: () => void;
}

const GameContext = createContext<GameContextType | undefined>(undefined);

// Reducer for game actions
const gameReducer = (
  state: GameHistoryState,
  action: GameAction
): GameHistoryState => {
  switch (action.type) {
    case "SELECT_PIECE":
      if (
        state.history.length > 0 &&
        state.history[state.history.length - 1].selectedPiece?.id ===
          action.piece.id
      ) {
        return state;
      }
      // Only allow selecting a piece if it belongs to the current player
      if (action.piece.player !== state.currentPlayer) {
        return state;
      }

      // If there's a specific color piece that must be moved, check this is that color
      if (state.lastMovedPieceColor !== null) {
        const mustMovePieces = state.pieces.filter(
          (p) =>
            p.color === state.lastMovedPieceColor &&
            p.player === state.currentPlayer
        );

        // If there are pieces of the required color, and this isn't one of them, don't select it
        if (
          mustMovePieces.length > 0 &&
          action.piece.color !== state.lastMovedPieceColor
        ) {
          return state;
        }
      }

      return {
        ...state,
        selectedPiece: action.piece,
      };

    case "DESELECT_PIECE":
      return {
        ...state,
        selectedPiece: null,
      };

    case "MOVE_PIECE":
      // Check if move is valid
      if (
        !state.selectedPiece ||
        !isValidMove(state, action.move.from, action.move.to)
      ) {
        return state;
      }

      // Save current state to history before making move
      const currentState = {
        ...state,
        selectedPiece: null, // Clear selection for history
      };

      // Make the move and update state
      const newStateBase = makeMove(state, action.move.from, action.move.to);
      const newState = {
        ...newStateBase,
        history: [...state.history, currentState],
        future: [],
      };

      // After the move, check if the next player is blocked
      const blocked = checkBlocked(newStateBase);
      if (blocked) {
        return {
          ...newState,
          winner: blocked,
        };
      }

      return newState;

    case "RESET_GAME":
      return {
        ...initialGameState,
        history: [],
        future: [],
        gameStarted: state.gameStarted,
      };

    case "UNDO":
      if (state.history.length === 0) return state;

      const previousState = state.history[state.history.length - 1];
      const newHistory = state.history.slice(0, -1);
      const newFuture = [state, ...state.future];

      return {
        ...previousState,
        history: newHistory,
        future: newFuture,
      };

    case "REDO":
      if (state.future.length === 0) return state;

      const nextState = state.future[0];
      const redoNewFuture = state.future.slice(1);
      const redoNewHistory = [...state.history, state];

      return {
        ...nextState,
        history: redoNewHistory,
        future: redoNewFuture,
      };

    case "START_GAME":
      return {
        ...state,
        gameStarted: true,
      };
      
    case "TOGGLE_AI":
      return {
        ...state,
        aiEnabled: !state.aiEnabled,
      };

    default:
      return state;
  }
};

// Provider component
interface GameProviderProps {
  children: ReactNode;
}

// Assume AI plays as black
const aiPlayer: Player = "black";

export const GameProvider: React.FC<GameProviderProps> = ({ children }) => {
  const initialHistoryState: GameHistoryState = {
    ...initialGameState,
    history: [],
    future: [],
    aiEnabled: true, // Default to AI enabled
  };

  const [state, dispatch] = useReducer(gameReducer, initialHistoryState);

  const { getAIMove, isComputing } = useAI(state as GameState, aiPlayer, 3);

  // Define action dispatchers first
  const selectPiece = (piece: Piece) => {
    dispatch({ type: "SELECT_PIECE", piece });
  };

  const deselectPiece = () => {
    dispatch({ type: "DESELECT_PIECE" });
  };

  const movePiece = (move: Move) => {
    dispatch({ type: "MOVE_PIECE", move });
  };

  const handleAIMove = useCallback(async () => {
    if (!state.gameStarted || state.winner) return;

    const move = await getAIMove();
    if (move) {
      movePiece(move);
    }
  }, [getAIMove, state.gameStarted, state.winner, movePiece]);

  const toggleAI = () => {
    dispatch({ type: "TOGGLE_AI" });
  };

  useEffect(() => {
    // Add a small delay to make AI moves more natural and ensure UI updates first
    const timer = setTimeout(() => {
      if (
        state.aiEnabled && // Only make moves if AI is enabled
        state.currentPlayer === aiPlayer &&
        state.gameStarted &&
        !state.winner &&
        !isComputing
      ) {
        console.log("AI should make a move now");
        handleAIMove();
      }
    }, 500);
    
    return () => clearTimeout(timer);
  }, [
    state.currentPlayer,
    state.gameStarted,
    state.winner,
    isComputing,
    handleAIMove,
    state.aiEnabled, // Add aiEnabled to dependencies
  ]);

  const undo = () => {
    dispatch({ type: "UNDO" });
  };

  const redo = () => {
    dispatch({ type: "REDO" });
  };

  const resetGame = () => {
    dispatch({ type: "RESET_GAME" });
  };

  const startGame = () => {
    dispatch({ type: "START_GAME" });
  };

  const getValidMovesForPiece = (piece: Piece): Position[] => {
    return getValidMoves(piece, state);
  }

  const canMovePiece = (from: Position, to: Position): boolean => {
    return isValidMove(state, from, to);
  }

  return (
    <GameContext.Provider
      value={{
        state: state as GameState & { aiEnabled: boolean },
        selectPiece,
        deselectPiece,
        movePiece,
        resetGame,
        startGame,
        getValidMovesForPiece,
        canMovePiece,
        undo,
        redo,
        canUndo: state.history.length > 0,
        canRedo: state.future.length > 0,
        isAIThinking: isComputing,
        toggleAI,
      }}
    >
      {children}
    </GameContext.Provider>
  );
};

// Custom hook to use the game context
export const useGame = (): GameContextType => {
  const context = useContext(GameContext);
  if (context === undefined) {
    throw new Error("useGame must be used within a GameProvider");
  }
  return context;
};
