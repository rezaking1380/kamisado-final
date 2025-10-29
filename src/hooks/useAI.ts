import { useState, useCallback, useRef } from 'react';
import { Move, GameState, Player } from '@/types/game';
import {
  makeMove,
  checkBlocked,
  getAllValidMoves,
  getPieceAtPosition,
  getDistanceToGoal,
  hasValidMoves,
} from '@/utils/gameUtils';

/**
 * Transposition table entry for caching evaluated positions
 */
interface TranspositionEntry {
  score: number;
  depth: number;
  move?: Move;
  flag: 'exact' | 'lowerbound' | 'upperbound';
}

/**
 * Configuration for AI behavior
 */
interface AIConfig {
  searchDepth: number;
  useTranspositionTable: boolean;
  useMoveOrdering: boolean;
  evaluationWeights: {
    goalDistance: number;
    nearGoalBonus: number;
    mobility: number;
    centerControl: number;
    forwardProgress: number;
  };
}

/**
 * Default AI configuration
 */
const DEFAULT_CONFIG: AIConfig = {
  searchDepth: 4,
  useTranspositionTable: true,
  useMoveOrdering: true,
  evaluationWeights: {
    goalDistance: 100,
    nearGoalBonus: 200,
    mobility: 10,
    centerControl: 5,
    forwardProgress: 15,
  },
};

/**
 * Generate a unique hash key for game state (for transposition table)
 */
const generateStateKey = (state: GameState): string => {
  const pieceData = state.pieces
    .map(p => `${p.color[0]}${p.player[0]}${p.position.row}${p.position.col}`)
    .sort()
    .join('');
  return `${pieceData}|${state.currentPlayer}|${state.lastMovedPieceColor || 'x'}`;
};

/**
 * Evaluate board position for a given player
 * Higher scores are better for the maximizing player
 */
const evaluateBoard = (
  state: GameState,
  maximizingPlayer: Player,
  config: AIConfig
): number => {
  const weights = config.evaluationWeights;

  // Terminal state checks
  if (state.winner) {
    return state.winner === maximizingPlayer ? 10000 : -10000;
  }

  const blocked = checkBlocked(state);
  if (blocked) {
    return blocked === maximizingPlayer ? 10000 : -10000;
  }

  let score = 0;
  const maximizingPieces = state.pieces.filter(p => p.player === maximizingPlayer);
  const minimizingPieces = state.pieces.filter(p => p.player !== maximizingPlayer);

  // 1. GOAL DISTANCE EVALUATION
  // Pieces closer to opponent's home row are more valuable
  for (const piece of maximizingPieces) {
    const distance = getDistanceToGoal(piece);
    score += (8 - distance) * weights.goalDistance;

    // Extra bonus for pieces very close to winning
    if (distance <= 2) {
      score += (3 - distance) * weights.nearGoalBonus;
    }

    // Check if this piece can win next move
    const goalRow = piece.player === 'black' ? 7 : 0;
    if (piece.position.row === (piece.player === 'black' ? 6 : 1)) {
      const cellColor = state.board[goalRow][piece.position.col];
      if (cellColor === piece.color) {
        score += 500; // Big bonus for one move away from winning
      }
    }
  }

  for (const piece of minimizingPieces) {
    const distance = getDistanceToGoal(piece);
    score -= (8 - distance) * weights.goalDistance;

    if (distance <= 2) {
      score -= (3 - distance) * weights.nearGoalBonus;
    }

    // Check if opponent can win next move
    const goalRow = piece.player === 'black' ? 7 : 0;
    if (piece.position.row === (piece.player === 'black' ? 6 : 1)) {
      const cellColor = state.board[goalRow][piece.position.col];
      if (cellColor === piece.color) {
        score -= 500; // Penalty for opponent being one move from winning
      }
    }
  }

  // 2. MOBILITY EVALUATION
  // Having more move options is advantageous
  const currentPlayerMoves = getAllValidMoves(state).length;
  score += currentPlayerMoves * weights.mobility;

  // Simulate opponent's turn to evaluate their mobility
  const opponentState: GameState = {
    ...state,
    currentPlayer: state.currentPlayer === 'black' ? 'white' : 'black',
  };
  const opponentMoves = getAllValidMoves(opponentState).length;
  score -= opponentMoves * weights.mobility;

  // 3. CENTER CONTROL
  // Pieces in central columns have more strategic options
  for (const piece of maximizingPieces) {
    const centerDistance = Math.abs(piece.position.col - 3.5);
    score += (4 - centerDistance) * weights.centerControl;
  }

  for (const piece of minimizingPieces) {
    const centerDistance = Math.abs(piece.position.col - 3.5);
    score -= (4 - centerDistance) * weights.centerControl;
  }

  // 4. FORWARD PROGRESS
  // Reward pieces that have advanced from starting position
  for (const piece of maximizingPieces) {
    if (piece.player === 'black') {
      score += piece.position.row * weights.forwardProgress;
    } else {
      score += (7 - piece.position.row) * weights.forwardProgress;
    }
  }

  for (const piece of minimizingPieces) {
    if (piece.player === 'black') {
      score -= piece.position.row * weights.forwardProgress;
    } else {
      score -= (7 - piece.position.row) * weights.forwardProgress;
    }
  }

  // 5. COLOR RESTRICTION PENALTY
  // Being forced to move a specific color can be limiting
  if (state.lastMovedPieceColor !== null) {
    const forcedPieces = state.pieces.filter(
      p => p.player === state.currentPlayer && p.color === state.lastMovedPieceColor
    );
    if (forcedPieces.length === 1) {
      // Only one piece can move - slight disadvantage
      score -= 5;
    }
  }

  return score;
};

/**
 * Order moves to improve alpha-beta pruning efficiency
 * Better moves should be searched first
 */
const orderMoves = (
  moves: Move[],
  state: GameState,
  maximizing: boolean,
  transpositionTable: Map<string, TranspositionEntry>
): Move[] => {
  return moves
    .map(move => {
      let score = 0;
      const piece = getPieceAtPosition(state.pieces, move.from);

      if (piece) {
        // 1. Prioritize moves closer to goal
        const newState = makeMove(state, move.from, move.to);
        const newPiece = getPieceAtPosition(newState.pieces, move.to);
        if (newPiece) {
          const distance = getDistanceToGoal(newPiece);
          score += (8 - distance) * 20;
        }

        // 2. Prioritize winning moves
        const goalRow = piece.player === 'black' ? 7 : 0;
        if (move.to.row === goalRow) {
          const cellColor = state.board[goalRow][move.to.col];
          if (cellColor === piece.color) {
            score += 10000; // Winning move - search first!
          }
        }

        // 3. Check if move was good in previous search (from transposition table)
        const futureState = makeMove(state, move.from, move.to);
        const futureKey = generateStateKey(futureState);
        const cached = transpositionTable.get(futureKey);
        if (cached) {
          score += cached.score * 0.5; // Weight cached evaluations
        }

        // 4. Prioritize center columns
        const centerDist = Math.abs(move.to.col - 3.5);
        score += (4 - centerDist) * 3;

        // 5. Prioritize captures (though rare in Kamisado, pieces don't capture)
        // This is here for completeness
      }

      return { move, score };
    })
    .sort((a, b) => (maximizing ? b.score - a.score : a.score - b.score))
    .map(item => item.move);
};

/**
 * Minimax algorithm with alpha-beta pruning
 */
const minimax = (
  state: GameState,
  depth: number,
  alpha: number,
  beta: number,
  maximizing: boolean,
  maximizingPlayer: Player,
  transpositionTable: Map<string, TranspositionEntry>,
  config: AIConfig
): { score: number; move?: Move } => {
  // Generate state key for transposition table
  const stateKey = config.useTranspositionTable ? generateStateKey(state) : '';

  // Check transposition table
  if (config.useTranspositionTable && stateKey) {
    const cached = transpositionTable.get(stateKey);
    if (cached && cached.depth >= depth) {
      // Use cached value if it's from a deeper or equal search
      if (cached.flag === 'exact') {
        return { score: cached.score, move: cached.move };
      } else if (cached.flag === 'lowerbound' && cached.score > alpha) {
        alpha = cached.score;
      } else if (cached.flag === 'upperbound' && cached.score < beta) {
        beta = cached.score;
      }

      if (alpha >= beta) {
        return { score: cached.score, move: cached.move };
      }
    }
  }

  // Terminal node evaluation
  if (depth === 0 || state.winner || !hasValidMoves(state)) {
    const score = evaluateBoard(state, maximizingPlayer, config);
    return { score };
  }

  // Get all valid moves
  const validMoves = getAllValidMoves(state);
  if (validMoves.length === 0) {
    const score = evaluateBoard(state, maximizingPlayer, config);
    return { score };
  }

  // Order moves if enabled
  const orderedMoves = config.useMoveOrdering
    ? orderMoves(validMoves, state, maximizing, transpositionTable)
    : validMoves;

  if (maximizing) {
    let maxEval = -Infinity;
    let bestMove: Move | undefined;
    let flag: 'exact' | 'lowerbound' | 'upperbound' = 'upperbound';

    for (const move of orderedMoves) {
      // Make move and evaluate
      const newState = makeMove(state, move.from, move.to);
      const blocked = checkBlocked(newState);
      const evalState = blocked ? { ...newState, winner: blocked } : newState;

      const result = minimax(
        evalState,
        depth - 1,
        alpha,
        beta,
        false,
        maximizingPlayer,
        transpositionTable,
        config
      );

      if (result.score > maxEval) {
        maxEval = result.score;
        bestMove = move;
        flag = 'exact';
      }

      alpha = Math.max(alpha, maxEval);

      // Beta cutoff
      if (beta <= alpha) {
        flag = 'lowerbound';
        break;
      }
    }

    // Store in transposition table
    if (config.useTranspositionTable && stateKey) {
      transpositionTable.set(stateKey, {
        score: maxEval,
        depth,
        move: bestMove,
        flag,
      });
    }

    return { score: maxEval, move: bestMove };
  } else {
    let minEval = Infinity;
    let bestMove: Move | undefined;
    let flag: 'exact' | 'lowerbound' | 'upperbound' = 'lowerbound';

    for (const move of orderedMoves) {
      const newState = makeMove(state, move.from, move.to);
      const blocked = checkBlocked(newState);
      const evalState = blocked ? { ...newState, winner: blocked } : newState;

      const result = minimax(
        evalState,
        depth - 1,
        alpha,
        beta,
        true,
        maximizingPlayer,
        transpositionTable,
        config
      );

      if (result.score < minEval) {
        minEval = result.score;
        bestMove = move;
        flag = 'exact';
      }

      beta = Math.min(beta, minEval);

      // Alpha cutoff
      if (beta <= alpha) {
        flag = 'upperbound';
        break;
      }
    }

    // Store in transposition table
    if (config.useTranspositionTable && stateKey) {
      transpositionTable.set(stateKey, {
        score: minEval,
        depth,
        move: bestMove,
        flag,
      });
    }

    return { score: minEval, move: bestMove };
  }
};

/**
 * Custom React hook for AI move generation
 */
export const useAI = (
  currentState: GameState,
  aiPlayer: Player,
  searchDepth: number = 4,
  customConfig?: Partial<AIConfig>
) => {
  const [isComputing, setIsComputing] = useState(false);
  const [lastComputationTime, setLastComputationTime] = useState(0);
  const [positionsEvaluated, setPositionsEvaluated] = useState(0);
  
  const abortControllerRef = useRef<AbortController | null>(null);
  const transpositionTableRef = useRef<Map<string, TranspositionEntry>>(new Map());

  // Merge custom config with defaults
  const config: AIConfig = {
    ...DEFAULT_CONFIG,
    ...customConfig,
    searchDepth,
    evaluationWeights: {
      ...DEFAULT_CONFIG.evaluationWeights,
      ...(customConfig?.evaluationWeights || {}),
    },
  };

  /**
   * Get the best AI move for the current state
   */
  const getAIMove = useCallback(async (): Promise<Move | null> => {
    // Validation checks
    if (currentState.currentPlayer !== aiPlayer || currentState.winner) {
      return null;
    }

    const validMoves = getAllValidMoves(currentState);
    if (validMoves.length === 0) {
      return null;
    }

    // If only one move available, return it immediately
    if (validMoves.length === 1) {
      return validMoves[0];
    }

    setIsComputing(true);
    abortControllerRef.current = new AbortController();

    const startTime = performance.now();

    try {
      // Run minimax in a promise to allow UI updates
      const bestMove = await new Promise<Move | null>((resolve, reject) => {
        const timeoutId = setTimeout(() => {
          try {
            // Clear transposition table if it gets too large (memory management)
            if (transpositionTableRef.current.size > 100000) {
              transpositionTableRef.current.clear();
            }

            // Execute minimax search
            const result = minimax(
              currentState,
              config.searchDepth,
              -Infinity,
              Infinity,
              true,
              aiPlayer,
              transpositionTableRef.current,
              config
            );

            const endTime = performance.now();
            setLastComputationTime(endTime - startTime);
            setPositionsEvaluated(transpositionTableRef.current.size);
            resolve(result.move || validMoves[0]);
          } catch (error) {
            console.error('AI computation error:', error);
            reject(error);
          }
        }, 50); // Small delay to allow UI to render

        // Check for abort
        abortControllerRef.current?.signal.addEventListener('abort', () => {
          clearTimeout(timeoutId);
          reject(new Error('Computation aborted'));
        });
      });

      return bestMove;
    } catch (error) {
      if (error instanceof Error && error.message === 'Computation aborted') {
        return null;
      }
      console.error('AI move generation error:', error);
      return validMoves[0]; // Fallback to first valid move
    } finally {
      setIsComputing(false);
      abortControllerRef.current = null;
    }
  }, [currentState, aiPlayer, config]);

  /**
   * Cancel ongoing AI computation
   */
  const cancelComputation = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      setIsComputing(false);
    }
  }, []);

  /**
   * Clear the transposition table (useful for new games)
   */
  const clearCache = useCallback(() => {
    transpositionTableRef.current.clear();
  }, []);

  /**
   * Get AI statistics
   */
  const getStats = useCallback(() => {
    return {
      isComputing,
      lastComputationTime,
      positionsEvaluated,
      cacheSize: transpositionTableRef.current.size,
      searchDepth: config.searchDepth,
    };
  }, [isComputing, lastComputationTime, positionsEvaluated, config.searchDepth]);

  return {
    getAIMove,
    isComputing,
    cancelComputation,
    clearCache,
    getStats,
  };
};