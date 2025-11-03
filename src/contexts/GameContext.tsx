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
  DifficultyConfig,
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
  state: GameState & { aiEnabled: boolean; difficulty: DifficultyConfig };
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
  selectDifficulty: (difficulty: DifficultyConfig) => void;
  selectPlayer: (player: Player) => void;
}

const GameContext = createContext<GameContextType | undefined>(undefined);

// Reducer for game actions
const gameReducer = (
  state: GameHistoryState,
  action: GameAction
): GameHistoryState => {
  switch (action.type) {
    case "SELECT_PIECE": {
      // Can't select pieces if game is over
      if (state.winner) {
        return state;
      }

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
      // Can't move if game is over
      if (state.winner) {
        return state;
      }
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

      // ✅ FIX: Make the move (winner is determined inside makeMove now)
      const newStateBase = makeMove(state, action.move.from, action.move.to);

      // Only check for blocked if there's no winner yet
      let finalState = newStateBase;
      if (!newStateBase.winner) {
        const blocked = checkBlocked(newStateBase);
        if (blocked) {
          finalState = { ...newStateBase, winner: blocked };
        }
      }

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

    case "SELECT_DIFFICULTY":
      return {
        ...state,
        difficulty: action.difficulty,
      };

    case "SELECT_PLAYER":
      return {
        ...state,
        player: action.player,
        currentPlayer: action.player,
      };

    default:
      return state;
  }
};
interface GameProviderProps {
  children: ReactNode;
}

export const GameProvider: React.FC<GameProviderProps> = ({ children }) => {
  const initialHistoryState: GameHistoryState = {
    ...initialGameState,
    history: [],
    future: [],
    aiEnabled: true,
    player: "black"
  };

  const [state, dispatch] = useReducer(gameReducer, initialHistoryState);
  const aiMoveInProgressRef = useRef(false);
  const aiPlayer: Player = state.player === "white" ? "black" : "white";
  const { getAIMove, isComputing } = useAI(
    state as GameState,
    aiPlayer,
    state.difficulty?.searchDepth ?? 4,
    state.difficulty
  );

  // Action dispatchers
  const selectPiece = useCallback((piece: Piece) => {
    dispatch({ type: "SELECT_PIECE", piece });
  }, []);

  const selectDifficulty = useCallback((difficulty: DifficultyConfig) => {
    dispatch({ type: "SELECT_DIFFICULTY", difficulty });
  }, []);

  const selectPlayer = useCallback((player: Player) => {
    dispatch({ type: "SELECT_PLAYER", player });
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

  const handleAIMove = useCallback(async () => {
    if (!state.gameStarted || state.winner) return;

    const move = await getAIMove();
    if (move) {
      movePiece(move);
    }
  }, [getAIMove, state.gameStarted, state.winner, movePiece]);

  // AI move handling with proper dependency management
  useEffect(() => {
    // let mounted = true;

    // const makeAIMove = async () => {
    //   if (
    //     state.aiEnabled && // Only make moves if AI is enabled
    //     state.currentPlayer === aiPlayer &&
    //     state.gameStarted &&
    //     !state.winner &&
    //     !isComputing
    //   ) {
    //     return;
    //   }

    //   aiMoveInProgressRef.current = true;

    //   try {
    //     await new Promise((resolve) => setTimeout(resolve, 300));

    //     if (!mounted || state.winner) return;

    //     const move = await getAIMove();

    //     if (mounted && move && !state.winner) {
    //       movePiece(move);
    //     }
    //   } catch (error) {
    //     console.error("AI move error:", error);
    //   } finally {
    //     if (mounted) {
    //       aiMoveInProgressRef.current = false;
    //     }
    //   }
    // };

    // makeAIMove();

    const timer = setTimeout(() => {
      if (
        state.aiEnabled && // Only make moves if AI is enabled
        state.player !== aiPlayer &&
        state.gameStarted &&
        !state.winner &&
        !isComputing
      ) {
        handleAIMove();
      }
    }, 500);

    return () => clearTimeout(timer);

    // return () => {
    //   mounted = false;
    // };
  }, [
    state.currentPlayer,
    state.gameStarted,
    state.winner, // ⭐ Must be in dependencies
    state.aiEnabled,
    state.pieces.length,
    isComputing,
    getAIMove,
    movePiece,
  ]);

  return (
    <GameContext.Provider
      value={{
        state: state as GameState & {
          aiEnabled: boolean;
          difficulty: DifficultyConfig;
          player?: Player;
        },
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
        selectDifficulty,
        selectPlayer,
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
