import { describe, it, expect } from 'vitest';
import { useAI } from './useAI';
import { initialGameState } from '@/utils/gameUtils';

describe('useAI', () => {
  it('should return a valid move', async () => {
    const { getAIMove } = useAI(initialGameState, 'black', 2);
    const move = await getAIMove();
    
    expect(move).toBeDefined();
    expect(move?.from).toBeDefined();
    expect(move?.to).toBeDefined();
  });

  it('should prioritize winning moves', async () => {
    // Create a state where black can win
    const winningState = {
      ...initialGameState,
      pieces: [
        {
          id: 'black-0',
          color: 'brown' as const,
          player: 'black' as const,
          position: { row: 6, col: 0 } // One move from winning
        }
      ]
    };

    const { getAIMove } = useAI(winningState, 'black', 3);
    const move = await getAIMove();

    // Should move to winning position
    expect(move?.to.row).toBe(7);
  });
});