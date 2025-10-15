import React, {
  createContext,
  useContext,
  useReducer,
  useEffect,
  useCallback,
  ReactNode,
  useRef,
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
    case "SELECT_PIECE": {
      // Prevent re-selecting the same piece
      if (state.selectedPiece?.id === action.piece.id) {
        return state;
      }

      // Only allow selecting current player's pieces
      if (action.piece.player !== state.currentPlayer) {
        return state;
      }

      // Check color restriction
      if (state.lastMovedPieceColor !== null) {
        const mustMovePieces = state.pieces.filter(
          (p) =>
            p.color === state.lastMovedPieceColor &&
            p.player === state.currentPlayer
        );

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
    }

    case "DESELECT_PIECE":
      return {
        ...state,
        selectedPiece: null,
      };

    case "MOVE_PIECE": {
      // Validate move
      if (
        !state.selectedPiece ||
        !isValidMove(state, action.move.from, action.move.to)
      ) {
        return state;
      }

      // Save current state to history (without selection)
      const stateForHistory: GameState = {
        board: state.board,
        pieces: state.pieces,
        currentPlayer: state.currentPlayer,
        selectedPiece: null,
        lastMovedPieceColor: state.lastMovedPieceColor,
        winner: state.winner,
        gameStarted: state.gameStarted,
      };

      // Make the move
      const newStateBase = makeMove(state, action.move.from, action.move.to);

      // Check if next player is blocked
      const blocked = checkBlocked(newStateBase);
      const finalState = blocked
        ? { ...newStateBase, winner: blocked }
        : newStateBase;

      return {
        ...finalState,
        history: [...state.history, stateForHistory],
        future: [],
        aiEnabled: state.aiEnabled,
      };
    }

    case "RESET_GAME":
      return {
        ...initialGameState,
        history: [],
        future: [],
        gameStarted: state.gameStarted,
        aiEnabled: state.aiEnabled,
      };

    case "UNDO": {
      if (state.history.length === 0) return state;

      const previousState = state.history[state.history.length - 1];
      const newHistory = state.history.slice(0, -1);

      const currentStateForFuture: GameState = {
        board: state.board,
        pieces: state.pieces,
        currentPlayer: state.currentPlayer,
        selectedPiece: null,
        lastMovedPieceColor: state.lastMovedPieceColor,
        winner: state.winner,
        gameStarted: state.gameStarted,
      };

      return {
        ...previousState,
        history: newHistory,
        future: [currentStateForFuture, ...state.future],
        aiEnabled: state.aiEnabled,
      };
    }

    case "REDO": {
      if (state.future.length === 0) return state;

      const nextState = state.future[0];
      const newFuture = state.future.slice(1);

      const currentStateForHistory: GameState = {
        board: state.board,
        pieces: state.pieces,
        currentPlayer: state.currentPlayer,
        selectedPiece: null,
        lastMovedPieceColor: state.lastMovedPieceColor,
        winner: state.winner,
        gameStarted: state.gameStarted,
      };

      return {
        ...nextState,
        history: [...state.history, currentStateForHistory],
        future: newFuture,
        aiEnabled: state.aiEnabled,
      };
    }

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

interface GameProviderProps {
  children: ReactNode;
}

const aiPlayer: Player = "white";

export const GameProvider: React.FC<GameProviderProps> = ({ children }) => {
  const initialHistoryState: GameHistoryState = {
    ...initialGameState,
    history: [],
    future: [],
    aiEnabled: true,
  };

  const [state, dispatch] = useReducer(gameReducer, initialHistoryState);
  const aiMoveInProgressRef = useRef(false);
  // Easy: depth = 2 ,Medium: depth = 3 , Hard: depth = 4 (default) , Expert: depth = 5 (slower but stronger)
  const { getAIMove, isComputing } = useAI(state as GameState, aiPlayer, 5);

  // Action dispatchers
  const selectPiece = useCallback((piece: Piece) => {
    dispatch({ type: "SELECT_PIECE", piece });
  }, []);

  const deselectPiece = useCallback(() => {
    dispatch({ type: "DESELECT_PIECE" });
  }, []);

  const movePiece = useCallback((move: Move) => {
    dispatch({ type: "MOVE_PIECE", move });
  }, []);

  const resetGame = useCallback(() => {
    aiMoveInProgressRef.current = false;
    dispatch({ type: "RESET_GAME" });
  }, []);

  const startGame = useCallback(() => {
    dispatch({ type: "START_GAME" });
  }, []);

  const undo = useCallback(() => {
    dispatch({ type: "UNDO" });
  }, []);

  const redo = useCallback(() => {
    dispatch({ type: "REDO" });
  }, []);

  const toggleAI = useCallback(() => {
    dispatch({ type: "TOGGLE_AI" });
  }, []);

  const getValidMovesForPiece = useCallback(
    (piece: Piece): Position[] => {
      return getValidMoves(piece, state as GameState);
    },
    [state]
  );

  const canMovePiece = useCallback(
    (from: Position, to: Position): boolean => {
      return isValidMove(state as GameState, from, to);
    },
    [state]
  );

  // AI move handling with proper dependency management
  useEffect(() => {
    let mounted = true;

    const makeAIMove = async () => {
      // Check all conditions
      if (
        !state.aiEnabled ||
        state.currentPlayer !== aiPlayer ||
        !state.gameStarted ||
        state.winner ||
        isComputing ||
        aiMoveInProgressRef.current
      ) {
        return;
      }

      aiMoveInProgressRef.current = true;

      try {
        // Small delay to let UI update
        await new Promise((resolve) => setTimeout(resolve, 300));

        if (!mounted) return;

        const move = await getAIMove();

        if (mounted && move) {
          movePiece(move);
        }
      } catch (error) {
        console.error("AI move error:", error);
      } finally {
        if (mounted) {
          aiMoveInProgressRef.current = false;
        }
      }
    };

    makeAIMove();

    return () => {
      mounted = false;
    };
  }, [
    state.currentPlayer,
    state.gameStarted,
    state.winner,
    state.aiEnabled,
    state.pieces.length, // Track piece changes to detect moves
    isComputing,
    getAIMove,
    movePiece,
  ]);

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
