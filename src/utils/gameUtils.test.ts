import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as GameUtils from './gameUtils';
import {
  BOARD_SIZE,
  initialGameState,
  createInitialPieces,
  initialBoardColors,
  getPieceAtPosition,
  isValidPosition,
  getValidMoves,
  checkWinner,
  makeMove,
  isValidMove,
  hasValidMoves,
  checkBlocked,
  getPieceByColor,
} from './gameUtils';
import type { GameState, Piece, Position, Player, Color, Move } from '@/types/game';

describe('Game Utilities', () => {
  describe('Board Constants and Setup', () => {
    it('should have correct BOARD_SIZE', () => {
      expect(BOARD_SIZE).toBe(8);
    });

    it('should validate initial game state structure', () => {
      const gameState = { ...initialGameState };
      expect(gameState.board).toHaveLength(8);
      expect(gameState.board[0]).toHaveLength(8);
      expect(gameState.pieces).toHaveLength(16);
      // Check initial pieces placement
      const blackPieceRow0 = gameState.pieces.find(p => p.position.row === 0 && p.position.col === 0);
      expect(blackPieceRow0).toBeDefined();
      expect(blackPieceRow0?.color).toBe('orange');
      expect(blackPieceRow0?.player).toBe('black');
      const whitePieceRow7 = gameState.pieces.find(p => p.position.row === 7 && p.position.col === 0);
      expect(whitePieceRow7).toBeDefined();
      expect(whitePieceRow7?.color).toBe('brown');
      expect(whitePieceRow7?.player).toBe('white');
    });
  });

  describe('Position Validation', () => {
    it('should validate valid positions', () => {
      expect(isValidPosition({ row: 0, col: 0 })).toBe(true);
      expect(isValidPosition({ row: 7, col: 7 })).toBe(true);
      expect(isValidPosition({ row: 3, col: 4 })).toBe(true);
    });

    it('should invalidate invalid positions', () => {
      expect(isValidPosition({ row: -1, col: 0 })).toBe(false);
      expect(isValidPosition({ row: 8, col: 0 })).toBe(false);
      expect(isValidPosition({ row: 0, col: -1 })).toBe(false);
      expect(isValidPosition({ row: 0, col: 8 })).toBe(false);
    });
  });

  describe('Piece Retrieval', () => {
    it('should get piece at position', () => {
      const gameState = { ...initialGameState };
      const position: Position = { row: 0, col: 0 };
      const piece = getPieceAtPosition(gameState.pieces, position);
      expect(piece).toBeDefined();
      expect(piece?.color).toBe('orange');
      expect(piece?.player).toBe('black');
      const emptyPos: Position = { row: 4, col: 4 };
      expect(getPieceAtPosition(gameState.pieces, emptyPos)).toBeUndefined();
    });

    it('should get piece by color', () => {
      const gameState = { ...initialGameState };
      const piece = getPieceByColor(gameState, 'orange' as Color);
      expect(piece).toBeDefined();
      expect(piece?.player).toBe('black');
      expect(piece?.position.row).toBe(0);
      expect(piece?.position.col).toBe(0);
    });
  });

  describe('Move Validation', () => {
    let gameState: GameState;

    beforeEach(() => {
      gameState = { ...initialGameState };
    });

    describe('Generate Valid Moves', () => {
      const fromPos: Position = { row: 7, col: 0 };

      beforeEach(() => {
        gameState.currentPlayer = 'white' as Player;
      });

      it('should generate valid moves for a piece', () => {
        const fromPiece = getPieceAtPosition(gameState.pieces, fromPos);
        if (!fromPiece) throw new Error('Piece not found');

        const moves = getValidMoves(fromPiece, gameState);
        expect(moves.length).toBeGreaterThan(0);
        moves.forEach(move => {
          expect(isValidPosition(move)).toBe(true);
        });
      });
    });

    describe('Validate Moves', () => {
      const fromPos: Position = { row: 7, col: 7 };

      beforeEach(() => {
        gameState.currentPlayer = 'white' as Player;
      });

      it('should validate valid moves', () => {
        const fromPiece = getPieceAtPosition(gameState.pieces, fromPos);
        if (!fromPiece) throw new Error('Piece not found');
        gameState.selectedPiece = fromPiece;
        const validTo: Position = { row: 6, col: 7 }; // Forward move example
        expect(isValidMove(gameState, fromPos, validTo)).toBe(true);
        const diagonalTo: Position = { row: 6, col: 6 }; // Diagonal forward left
        expect(isValidMove(gameState, fromPos, diagonalTo)).toBe(true);
      });

      it('should invalidate invalid moves', () => {
        const fromPiece = getPieceAtPosition(gameState.pieces, fromPos);
        if (!fromPiece) throw new Error('Piece not found');
        gameState.selectedPiece = fromPiece;
        const invalidTo: Position = { row: 7, col: 6 }; // Same row
        expect(isValidMove(gameState, fromPos, invalidTo)).toBe(false);
      });

      it('should validate a diagonal move without capture (updated)', () => {
        const fromPosTest: Position = { row: 0, col: 0 };
        const toTest: Position = { row: 2, col: 2 };
        gameState.currentPlayer = 'black' as Player;
        const fromPiece = getPieceAtPosition(gameState.pieces, fromPosTest);
        if (!fromPiece) throw new Error('Piece not found');
        gameState.selectedPiece = fromPiece;
        expect(isValidMove(gameState, fromPosTest, toTest)).toBe(true);
      });

      it('should not allow orthogonal moves (updated)', () => {
        const fromPosTest: Position = { row: 0, col: 0 };
        const toTest: Position = { row: 0, col: 2 };
        gameState.currentPlayer = 'black' as Player;
        const fromPiece = getPieceAtPosition(gameState.pieces, fromPosTest);
        if (!fromPiece) throw new Error('Piece not found');
        gameState.selectedPiece = fromPiece;
        expect(isValidMove(gameState, fromPosTest, toTest)).toBe(false);
      });
    });
  });

  describe('Game State Checks', () => {
    it('should check if player has valid moves', () => {
      const gameStateWhite = { ...initialGameState, currentPlayer: 'white' as Player };
      expect(hasValidMoves(gameStateWhite)).toBe(true);
      const gameStateBlack = { ...initialGameState, currentPlayer: 'black' as Player };
      expect(hasValidMoves(gameStateBlack)).toBe(true);
    });

    it('should detect blocked player', () => {
      const gameState: GameState = { ...initialGameState, currentPlayer: 'white' as Player };
      // Remove white pieces to simulate no valid moves for white
      gameState.pieces = gameState.pieces.filter(piece => piece.player !== 'white');
      expect(checkBlocked(gameState)).toBe('black' as Player);
    });

    it('should check if a position is blocked (updated)', () => {
      const gameStateTest: GameState = { ...initialGameState };
      expect(checkBlocked(gameStateTest)).toBeNull();

      // Simulate blocked state
      const blockedState = { ...gameStateTest, pieces: [] }; // No pieces, fully blocked
      expect(checkBlocked(blockedState)).not.toBeNull();
    });

    it('should check if player has valid moves (updated)', () => {
      const stateTest = { ...initialGameState };
      expect(hasValidMoves(stateTest)).toBe(true);

      // Simulate blocked position by removing pieces
      const blockedState = { ...stateTest, pieces: stateTest.pieces.filter(p => p.player !== 'black'), currentPlayer: 'black' as Player };
      expect(hasValidMoves(blockedState)).toBe(false);
    });
  });

  describe('Win Condition', () => {
    it('should detect white win when reaching opponent\'s back row (row 0) with matching tower color', () => {
      const winPieces = [...createInitialPieces()];
      const board = initialBoardColors;
      // Move white brown piece (col 0 row 7) to row 0 col 7 (brown tower, assuming initialBoardColors[0][7] is brown)
      const whiteBrownIndex = winPieces.findIndex(p => p.player === 'white' && p.color === 'brown');
      if (whiteBrownIndex !== -1) {
        winPieces[whiteBrownIndex].position = { row: 0, col: 7 };
      }
      const gameStateWin: GameState = { ...initialGameState, pieces: winPieces };
      expect(checkWinner(gameStateWin.pieces, gameStateWin.board)).toBe('white' as Player);
    });

    it('should detect black win when reaching opponent\'s back row (row 7) with matching tower color', () => {
      const winPieces = [...createInitialPieces()];
      const board = initialBoardColors;
      // Move black brown piece (col 7 row 0) to row 7 col 0 (brown tower, assuming initialBoardColors[7][0] is brown)
      const blackBrownIndex = winPieces.findIndex(p => p.player === 'black' && p.color === 'brown');
      if (blackBrownIndex !== -1) {
        winPieces[blackBrownIndex].position = { row: 7, col: 0 };
      }
      const gameStateWin: GameState = { ...initialGameState, pieces: winPieces };
      expect(checkWinner(gameStateWin.pieces, gameStateWin.board)).toBe('black' as Player);
    });

    it('should detect no winner in initial state', () => {
      const pieces = createInitialPieces();
      const gameStateNoWin: GameState = { ...initialGameState, pieces };
      expect(checkWinner(gameStateNoWin.pieces, gameStateNoWin.board)).toBeNull();
    });

    it('should detect a blocked win condition (updated)', () => {
      const stateTest = { ...initialGameState };
      // Create a state where white is blocked
      const blockedState = { 
        ...stateTest, 
        currentPlayer: 'white' as Player,
        // Remove all white pieces to simulate being blocked
        pieces: stateTest.pieces.filter(p => p.player !== 'white')
      };
      expect(checkBlocked(blockedState)).toBe('black' as Player);
    });
  });

  describe('Make Move', () => {
    let gameState: GameState;

    beforeEach(() => {
      gameState = { ...initialGameState };
      // Select a piece for testing
      const piece = getPieceByColor(gameState, initialBoardColors[7][7] as Color);
      if (piece) {
        gameState.selectedPiece = piece;
        gameState.gameStarted = true;
        gameState.currentPlayer = 'white' as Player;
      }
    });

    it('should make valid move when selectedPiece is set (updated)', () => {
      if (!gameState.selectedPiece) throw new Error('No selected piece');
      const from = gameState.selectedPiece.position;
      const to: Position = { row: 6, col: 7 }; // Example valid forward move
      const oldPosition = { ...from };
      const pieceId = gameState.selectedPiece.id;
      const result = makeMove(gameState, from, to);
      // makeMove doesn't clear selectedPiece, that's handled in the reducer
      // White player moves, so next player should be black
      expect(result.currentPlayer).toBe('black' as Player);
      const movedPiece = result.pieces.find(p => p.id === pieceId);
      expect(movedPiece?.position).toEqual(to);
      // Check that the piece is no longer at the old position
      const pieceAtOldPos = getPieceAtPosition(result.pieces, oldPosition);
      expect(pieceAtOldPos?.id).not.toBe(pieceId);
    });

    it('should make a valid move (updated)', () => {
      const state = { ...initialGameState, currentPlayer: 'black' as Player };
      const from = { row: 0, col: 0 };
      const to = { row: 1, col: 1 };

      const newState = makeMove(state, from, to);

      // Check board update if applicable
      expect(newState.pieces.some(p => p.position.row === 1 && p.position.col === 1 && p.color === 'orange')).toBe(true);
      expect(newState.currentPlayer).toBe('white');
    });

    it('should not change state if no selectedPiece', () => {
      gameState.selectedPiece = null;
      const originalState = { ...gameState }; // Shallow copy for comparison
      const from: Position = { row: 0, col: 0 };
      const to: Position = { row: 6, col: 7 };
      const result = makeMove(gameState, from, to);
      expect(result.pieces).toEqual(originalState.pieces);
      expect(result.currentPlayer).toBe(originalState.currentPlayer);
    });
  });
});