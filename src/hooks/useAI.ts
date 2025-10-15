import { useMemo, useState } from 'react';
import { Position, Move, Piece, GameState, Player } from '@/types/game';
import * as GameUtils from '@/utils/gameUtils';
import { makeMove, checkBlocked, isValidMove, hasValidMoves } from '@/utils/gameUtils';

// Evaluation function for board state (heuristic for Kamisado)
const evaluateBoard = (state: GameState, maximizingPlayer: Player): number => {
  if (state.winner) {
    if (state.winner === maximizingPlayer) return 1000;
    return -1000;
  }

  let score = 0;
  const colors = ['orange', 'blue', 'purple', 'pink', 'yellow', 'red', 'green', 'brown'] as const;
  const { board, currentPlayer } = state;

  // Score pieces close to opponent's baseline
  colors.forEach(color => {
    // Maximizing player's piece of this color
    const maxPiece = board.flat().find(p => p?.color === color && p.player === maximizingPlayer);
    if (maxPiece) {
      const distance = Math.abs(maxPiece.position.row - (maximizingPlayer === 'black' ? 7 : 0));
      score += (8 - distance) * 10;
    }

    // Minimizing player's piece of this color
    const minPiece = board.flat().find(p => p?.color === color && p.player !== maximizingPlayer);
    if (minPiece) {
      const distance = Math.abs(minPiece.position.row - (maximizingPlayer === 'black' ? 0 : 7));
      score -= (8 - distance) * 10;
    }
  });

  // Bonus for having moves available
  if (currentPlayer === maximizingPlayer && hasValidMoves(state)) {
    score += 20;
  } else if (currentPlayer !== maximizingPlayer && !hasValidMoves(state)) {
    score += 50; // Opponent blocked
  }

  return score;
};

// Minimax with alpha-beta pruning
const minimax = (
  state: GameState,
  depth: number,
  alpha: number,
  beta: number,
  maximizing: boolean,
  maximizingPlayer: Player
): { score: number; move?: Move } => {
  if (depth === 0 || state.winner || !hasValidMoves(state)) {
    const score = evaluateBoard(state, maximizingPlayer);
    return { score };
  }

  const validMoves = GameUtils.getAllValidMoves(state);

  if (maximizing) {
    let maxEval = -Infinity;
    let bestMove: Move | undefined;

    for (const move of validMoves) {
      const newState = makeMove(state, move.from, move.to);
      const blocked = checkBlocked(newState);
      const evalState = blocked ? { ...newState, winner: blocked } : newState;

      const evalResult = minimax(evalState, depth - 1, alpha, beta, false, maximizingPlayer);

      if (evalResult.score > maxEval) {
        maxEval = evalResult.score;
        bestMove = move;
      }

      alpha = Math.max(alpha, maxEval);
      if (beta <= alpha) break;
    }

    return { score: maxEval, move: bestMove };
  } else {
    let minEval = Infinity;

    for (const move of validMoves) {
      const newState = makeMove(state, move.from, move.to);
      const blocked = checkBlocked(newState);
      const evalState = blocked ? { ...newState, winner: blocked } : newState;

      const evalResult = minimax(evalState, depth - 1, alpha, beta, true, maximizingPlayer);

      minEval = Math.min(minEval, evalResult.score);

      beta = Math.min(beta, minEval);
      if (beta <= alpha) break;
    }

    return { score: minEval };
  }
};

// Custom hook for AI moves
export const useAI = (currentState: GameState, aiPlayer: Player, depth: number = 3) => {
  const [isComputing, setIsComputing] = useState(false);

  const getAIMove = useMemo(() => async (): Promise<Move | null> => {
    if (currentState.currentPlayer !== aiPlayer || currentState.winner) {
      return null;
    }

    setIsComputing(true);
    try {
      const validMoves = GameUtils.getAllValidMoves(currentState);
      if (validMoves.length === 0) {
        return null;
      }

      // For simplicity, run minimax on main thread with limited depth
      let bestMove: Move | null = null;
      let bestValue = -Infinity;

      for (const move of validMoves) {
        const newState = makeMove(currentState, move.from, move.to);
        const blocked = checkBlocked(newState);
        const evalState = blocked ? { ...newState, winner: blocked } : newState;

        const moveValue = minimax(evalState, depth - 1, -Infinity, Infinity, false, aiPlayer).score;

        if (moveValue > bestValue) {
          bestValue = moveValue;
          bestMove = move;
        }
      }

      return bestMove || validMoves[0]; // Fallback to first move
    } finally {
      setIsComputing(false);
    }
  }, [currentState, aiPlayer, depth]);

  return { getAIMove, isComputing };
};